# G-FLEET Phase 1.5 security model and migration guide

**Review-only:** neither SQL migration has been applied. Do not apply these files to production until the preflight inventory and Supabase owner review are complete.

## Repository/database inspection

The repository contains no earlier SQL migrations, generated database types, policy definitions, trigger definitions, or database function definitions. The supplied schema documents `public."USERS"`, `public."BOOKINGS"`, `public."VEHICLE"`, `public."TELEMETRY_LOGS"`, and `public."EMERGENCY_ALERTS"` fields, but not their complete constraints, policies, triggers, grants, or all columns on the other nine tables.

The anon key can reach PostgREST and the zero-row projections for all five documented tables returned HTTP 200. A zero-row request for `USERS.auth_user_id` returned HTTP 400. This is consistent with that column being absent from the live PostgREST schema; it is not a substitute for catalog inspection. PostgREST anon requests cannot read `pg_catalog`, `pg_policies`, function definitions, triggers, primary/foreign keys, or grants. Live RLS configuration therefore remains unverified.

Before a migration, run the following inventory in the Supabase SQL editor using an authorized database owner account and save the results with the deployment review:

```sql
-- Table presence, columns and types for the known schema.
SELECT table_name, column_name, data_type, udt_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'USERS', 'VEHICLE', 'BOOKINGS', 'TELEMETRY_LOGS', 'GEOFENCE',
    'EMERGENCY_ALERTS', 'FLEET_ALERTS', 'NOTIFICATIONS', 'MESSAGES',
    'BOOKING_STATUS_HISTORY', 'VEHICLE_ACTIVITY_LOGS', 'GEOFENCE_EVENTS',
    'GEOFENCE_VEHICLES', 'AUDIT_LOGS'
  )
ORDER BY table_name, ordinal_position;

-- Primary keys, foreign keys, unique constraints, and check constraints.
SELECT conrelid::regclass AS table_name, conname, contype, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, conname;

-- RLS state and every current policy (permissive policies can OR with new policies).
SELECT c.oid::regclass AS table_name, c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS force_rls, p.policyname, p.permissive,
       p.roles, p.cmd, p.qual, p.with_check
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p ON p.schemaname = n.nspname AND p.tablename = c.relname
WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
ORDER BY table_name, p.policyname;

-- Triggers and their definitions.
SELECT event_object_table AS table_name, trigger_name, action_timing,
       event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Public-schema security-definer functions and configured search paths.
SELECT p.oid::regprocedure AS function_name, r.rolname AS owner,
       p.prosecdef AS security_definer, p.proconfig, pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_roles r ON r.oid = p.proowner
WHERE n.nspname = 'public'
ORDER BY function_name::text;

-- Identity preflight: existing link column, collisions, and USERS PK shape.
SELECT auth_user_id, count(*) AS profile_count
FROM public."USERS"
WHERE auth_user_id IS NOT NULL
GROUP BY auth_user_id
HAVING count(*) > 1;
```

The last query only works after `auth_user_id` exists; before that, inspect the column catalog and skip it. Also inspect `USERS.user_id` and `BOOKINGS.customer_id` foreign keys and all grants. Confirm that the migration executor owns or can safely inspect/alter the target tables, and that security-definer functions execute with an owner that bypasses RLS; the proposed helpers set `row_security = off` so they fail rather than recurse if that assumption is false.

## Role and permission matrix

| Resource | Admin | Staff | Customer |
| --- | --- | --- | --- |
| Own `USERS` profile | Read; reviewed admin profile edits for non-ID fields | Read self and admin/staff profiles | Read own active profile only |
| Other `USERS` profiles | Read | Read admin/staff profiles only | Denied |
| `VEHICLE` | Read/update non-ID fields | Read | Denied; no unrestricted fleet catalog or telemetry |
| `BOOKINGS` | Read all | Read all for current operational review | Read rows where `customer_id` equals their linked profile `user_id` |
| `TELEMETRY_LOGS` | Read fleet telemetry | Read fleet telemetry | Denied |
| `EMERGENCY_ALERTS` | Read/update operational fields | Read unacknowledged or self-acknowledged events; update only operational acknowledgement/resolution fields on those rows | Denied until a verified ownership column and mobile request flow are available |
| Notifications/messages, geofence, fleet/activity/history/event/audit tables | Denied until columns, ownership, and business rules are verified | Denied until verified | Denied until verified |

The current Node API has read endpoints only. RLS update grants for admin profile/vehicle maintenance and staff emergency-event handling do not add frontend or API mutation routes. Booking mutations remain out of scope; no insert/update policy is proposed for `BOOKINGS`. Customer booking inserts and mobile emergency submissions also remain out of scope. `acknowledged_by` is treated as the staff assignment marker only after a migration preflight confirms it is UUID and the product owner accepts that meaning.

## Identity linkage

`supabase/migrations/202611090001_users_auth_uuid_link.sql` adds a nullable `auth_user_id uuid`, a partial unique index, and an unvalidated FK to `auth.users(id)`. It checks the existing `USERS.user_id` primary key, UUID types, and duplicate mappings before changing schema. It never changes `user_id`, `customer_id`, bookings, or existing profiles. The migration does not populate `auth_user_id`.

After the migration is approved and applied, use a separately authorized review process to link accounts. For each row, verify the Auth UUID from Supabase Auth against an independently verified identity and the intended `USERS.user_id`; do not infer the link from email alone. Update one reviewed row, then confirm exactly one profile maps to that UUID. Repeat for admin, staff, and customer accounts. Validate the FK only after existing rows and deletion/retention rules are reviewed:

```sql
ALTER TABLE public."USERS"
  VALIDATE CONSTRAINT users_auth_user_id_fkey;
```

Unlinked, inactive, missing, or duplicate mappings are denied by the backend. Existing profile primary keys and booking references remain unchanged. Reverting application code is safe while leaving the nullable link data in place; do not drop the column after links have been entered without a reviewed export and rollback plan.

## RLS migration and application sequence

`supabase/migrations/202611090002_reviewed_rls_role_policies.sql` enables RLS for all 14 tables. It revokes direct table privileges from `PUBLIC`, `anon`, and `authenticated`, then grants narrow authenticated reads on the five documented tables and limited update columns for admin profile/vehicle maintenance and emergency event handling. It creates two `SECURITY DEFINER` identity helpers with a fixed search path, `row_security = off`, and execute permission only for `authenticated`. It avoids querying `USERS` from a normal USERS policy, which would create recursive RLS evaluation.

The RLS migration aborts if an expected table/column is missing, if identity linkage is absent, if helper names already exist, or if any existing permissive policy is present on the 14 tables. Existing policies must be individually reviewed and reconciled; do not remove them blindly. Supporting tables with unverified ownership columns receive RLS enabled but no access policies, so they remain inaccessible until a reviewed follow-up migration exists. Applying this proposal can intentionally block existing Flutter/Realtime consumers on those tables; inspect all clients and grants first.

Recommended order:

1. Back up and review the inventory outputs, RLS/policy state, grants, constraints, triggers, and helper functions.
2. Confirm migration ownership, `auth_user_id` absence/type, duplicate links, UUID field types, and the meaning of `acknowledged_by`.
3. Apply the identity migration manually in a maintenance/change window. Do not populate links yet.
4. Review and manually link accounts using the procedure above. Do not alter user or booking IDs.
5. Review the RLS migration against existing policies and every client. If existing permissive policies exist, author a reconciled replacement migration; do not bypass the migration guard or drop policies without an approved plan.
6. Apply RLS manually only after owner approval. Verify the resulting catalog policy/grant state and execute the account tests below.
7. Keep a pre-change policy/grant snapshot for rollback. No live migration has been run from this repository.

## Real-account verification checklist

Using authorized dedicated accounts for linked admin, staff, customer A, customer B, inactive user, and unlinked user:

1. Sign in through Supabase Auth and use each account's actual access token; never log or paste the token into test output.
2. Call `GET /api/session`: linked active roles should return the database role; inactive, unlinked, and invalid/expired tokens should be denied.
3. Call `GET /api/bookings` as customer A and verify every returned `customer_id` is A's `USERS.user_id`; create or identify customer B data through approved test fixtures and confirm A cannot retrieve it. Admin/staff should see only records allowed by RLS.
4. Call `/api/vehicles`, `/api/fleet/locations`, `/api/alerts`, and `/api/staff` by role. Customer must be denied fleet/administrative data; staff may read only the permitted admin/staff profiles returned by `/api/staff`; admin may use approved routes.
5. Call PostgREST directly with each user's bearer token to verify RLS independently from API route checks. Customer must not read telemetry or other profiles/bookings. Staff alert access must be limited to unacknowledged/self-acknowledged rows; inactive and unlinked users must see no protected rows.
6. Change a test user's Auth email without changing `auth_user_id`; verify the same linked profile and role resolve. Verify duplicate UUID insertion is rejected by the unique index.
7. Verify policy and grant catalog state after migration and test both API and direct PostgREST paths. Record results without credentials or customer data.

Anonymous zero-row schema probes are connectivity/schema checks only; they do not prove authenticated authorization or RLS correctness.
