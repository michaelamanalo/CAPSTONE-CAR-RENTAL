# G-FLEET Phase 1.5 Security Report

**Date:** 2026-11-09
**Assessment (historical baseline):** This report predates the user's later confirmation that administrator login and Auth UUID linkage work. The linkage and live login were not independently revalidated here; current RLS deployment/behavior remains unverified. See [the current Phase 1 verification](./PHASE_1_BACKEND_VERIFICATION_20261110.md).

## Files changed

- `server.js` — profile resolution uses `USERS.auth_user_id`; customer booking reads are scoped to their linked `USERS.user_id`; staff listing is available to admin/staff and limited to admin/staff profiles.
- `server.test.cjs` — mock tests for token states, linked roles, changed email, missing/duplicate links, customer booking isolation, staff permissions, generic errors, and migration contracts.
- `src/context/AuthContext.jsx`, `src/App.test.js` — customer role cannot enter the admin/staff dashboard; regression test added.
- `README.md` — updated identity linkage, role access, and caller-JWT/RLS setup instructions.
- `.env.local.example`, `.env.server.example` — restored as sanitized setup templates with placeholders only; no service-role key.
- `supabase/migrations/202611090001_users_auth_uuid_link.sql` — guarded additive Auth UUID link migration.
- `supabase/migrations/202611090002_reviewed_rls_role_policies.sql` — guarded review-only RLS/grant proposal for all 14 listed tables.
- `docs/PHASE_1_5_SECURITY_MODEL.md` — role matrix, schema/policy inventory SQL, deployment sequence, and real-account test checklist.
- `docs/proposals/USERS_AUTH_UUID_LINK_PROPOSAL.md` — updated identity-link review procedure.
- `docs/PHASE_1_5_SECURITY_REPORT.md` — this report.
- `docs/PHASE_1_BACKEND_REPORT.md` — marked as a historical snapshot and linked to the current security report.

No frontend styling, screens, booking mutation business logic, Tracksolid integration, or live database objects were changed. Neither migration was run.

## Authentication behavior and findings

- The API validates every bearer token with Supabase Auth `/auth/v1/user`, validates the returned UUID shape, and forwards the caller JWT with the public API key to PostgREST. It does not use a service-role/secret key for user-scoped reads.
- React `AuthContext` restores/signs in with Supabase Auth, then verifies access through `GET /api/session`; only `admin`/`staff` roles enter the dashboard. Customer tokens are signed out of the dashboard while the API still permits scoped customer endpoints for the mobile client. `RequireAuth` gates dashboard routes on that verified result. `src/services/api.js` forwards the SDK access token and the browser Supabase client rejects secret keys.
- Profile lookup selects `user_id,auth_user_id,role,is_active` and filters by the exact Auth UUID. Roles come only from the linked database row. Email is not used for identity resolution, so changing an Auth email does not change the mapping.
- A missing, duplicated, inactive, or unsupported profile is denied. Duplicate links are rejected in the API and by the proposed partial unique index. Existing `USERS.user_id` and `BOOKINGS.customer_id` values are preserved.
- `/api/session` accepts all three active linked roles. Customers can read only their own bookings: the API adds `customer_id=eq.<USERS.user_id>`, and the proposed RLS policy repeats the ownership check. Customers are denied vehicle, fleet-location, alert, and staff data. Staff can read fleet operations, bookings, and only admin/staff profiles; the RLS USERS policy applies the same profile limit.
- Read paths retain the caller-JWT/public-key model so PostgREST policies apply. Upstream error bodies are hidden from API callers.

**Deployment impact:** the live zero-row probe for `USERS.auth_user_id` returned HTTP 400. This is consistent with the column being absent, but the status alone cannot distinguish a missing column from another schema/permission error; confirm through authorized catalog inspection. The backend now intentionally has no email fallback. Protected API calls against the current schema will fail closed until the identity migration is manually applied, reviewed accounts are linked, and PostgREST schema cache is refreshed if needed. The public health endpoint remains independent.

## Identity migration

The identity migration adds nullable `auth_user_id uuid`, a partial unique index for non-null links, and an FK to `auth.users(id)` marked `NOT VALID`. Its preflight checks the existing `USERS.user_id` primary-key shape, UUID type, duplicate links, and conflicts with an existing index/constraint name. It never rewrites profile IDs or booking relationships and never auto-links by email. The RLS migration requires this link first.

After authorized review and application, an operator must match each Auth UUID to the correct existing `USERS.user_id` using an independently verified account roster. Link admin, staff, and customer accounts one row at a time; do not infer UUID matches from email. Check uniqueness and FK validity before validating the FK. The detailed procedure is in `docs/PHASE_1_5_SECURITY_MODEL.md`.

## RLS design and database inspection limits

The migration proposal creates fixed-search-path `SECURITY DEFINER` helpers for active linked profile ID and database role, sets `row_security = off` so a helper fails instead of recursively evaluating USERS policies, and restricts execution to `authenticated`. It enables RLS on all 14 named tables, revokes direct table privileges from `PUBLIC`, `anon`, and `authenticated`, and grants narrowly scoped access to verified columns. Admins may update approved profile/vehicle fields; staff may update operational fields on unacknowledged or self-acknowledged emergency events; no booking mutation policy is included. Customers can select only their own bookings and active linked profile. Customer emergency submission and message/notification access remain denied until ownership columns and workflows are verified.

For tables whose ownership columns are not supplied (geofence, notifications, messages, history, activity, event, audit, and fleet-alert tables), the proposal enables RLS without adding policies, so access is denied pending a schema-specific follow-up. Applying this could interrupt current Flutter or Realtime consumers; inspect those clients and policy requirements first. The RLS migration aborts when expected tables/columns are missing, helper names conflict, or unknown permissive policies exist. Do not bypass the guard by dropping policies blindly.

No SQL migrations or database policy definitions exist in the repository. The supplied database fields establish table/column names but not actual primary/foreign keys, grants, triggers, functions, RLS flags, or policy expressions. Anonymous PostgREST access cannot read `pg_catalog`/`pg_policies`; `psql` is unavailable in this workspace. Therefore live RLS was **not** retrieved and is **not claimed correct**. Run the catalog inventory SQL in `docs/PHASE_1_5_SECURITY_MODEL.md` using an authorized Supabase database owner before approving either migration. In particular, verify that the migration/function owner can bypass RLS, that the UUID reference fields are actually UUID, and that `acknowledged_by` is an approved staff assignment marker.

### Role-permission summary

| Role | Proposed permissions |
| --- | --- |
| Admin | Read profiles/fleet/bookings/telemetry/alerts; update non-ID profile and vehicle fields; manage alert resolution fields. No booking mutation in this phase. |
| Staff | Read own and admin/staff profiles, fleet/telemetry/bookings, and unacknowledged or self-acknowledged emergency alerts; update only operational alert fields on allowed rows. |
| Customer | Read own active profile and own bookings only. No fleet telemetry or administrative records. Messages, notifications, and emergency submission remain unavailable until schema ownership and client rules are verified. |

The full matrix is in `docs/PHASE_1_5_SECURITY_MODEL.md`.

## Tests and verification

- `npm run test`: **passed**, 3 frontend tests, including customer denial from the staff dashboard. React Router future-flag and React `act(...)` warnings were emitted.
- `npm test -- --watchAll=false`: **passed**, 3 frontend tests; same non-failing warnings.
- `npm run test:server`: **passed**, 19 tests including auth UUID linkage, invalid/expired tokens, changed email, missing and duplicate links, active/admin/staff/customer role enforcement, own-booking filtering, admin-only staff listing, upstream error redaction, and static migration-contract checks.
- The migration contract checks are text-level guards only; no PostgreSQL parser/runtime or live policy execution was available.
- `npm run build`: **passed**; Node emitted an `fs.F_OK` deprecation warning.
- `node --check server.js`: **passed**.
- Live anonymous zero-row probes: Auth settings and documented projections for `VEHICLE`, `EMERGENCY_ALERTS`, `BOOKINGS`, `TELEMETRY_LOGS`, and `USERS` returned HTTP 200. A `USERS.auth_user_id` projection returned HTTP 400; its precise cause remains unverified. No records were requested or returned.
- These tests do not prove deployed database RLS, role authorization, or live linkage. No authorized admin/staff/customer/inactive/unlinked test accounts were available. No migration was applied.

## Exact live validation instructions

1. Have an authorized database owner run and save the catalog inventory in `docs/PHASE_1_5_SECURITY_MODEL.md`, including constraints, grants, RLS policies, triggers, and function definitions.
2. Review existing permissive policies and grants, verify assignment/ownership columns, and obtain approval for the affected Flutter/Realtime tables.
3. Apply the identity migration manually in a controlled window. Independently verify and link one account per profile; never alter `user_id` or bookings. Validate uniqueness and the FK only after review.
4. Apply the RLS migration only after reviewing all existing policies and client impact. Confirm no broad policies remain, inspect the final grants and catalog policy expressions, and refresh PostgREST schema cache as required.
5. With dedicated authorized admin, staff, customer A, customer B, inactive, and unlinked test accounts, execute the endpoint and direct PostgREST checks in the security model guide. Include customer-A-vs-customer-B booking access, customer telemetry denial, staff assigned/unassigned alert behavior, staff-limited profile listing, changed-email stability, and duplicate UUID rejection. Do not include tokens or customer data in logs.
6. Record live outcomes separately from mocked test results before deployment approval.

## Definition of done

**Implementation:** complete for the backend UUID-link requirement, mock tests, role matrix, and guarded SQL proposals.
**Deployment/security verification:** pending. The live linkage column is not available, account links are not established, RLS catalog state is unknown, and no authenticated test accounts were used. Phase 1.5 must not be marked fully complete until the migrations are reviewed/applied through the authorized process and live role/RLS checks pass.
