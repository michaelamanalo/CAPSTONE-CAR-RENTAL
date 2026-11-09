# G-FLEET Phase 1 Backend Verification

**Updated:** 2026-11-10
**Readiness:** **FAIL pending authenticated Supabase authorization/RLS verification.** Local implementation and automated checks pass.

## Endpoint access and verification

| Endpoint | Expected access | Verified behavior |
| --- | --- | --- |
| `GET /api/health` | Public | Minimal status payload, no database data. Mock test passed. |
| `GET /api/session` | Active linked admin/staff/customer | Validates Supabase Auth token; resolves role by `USERS.auth_user_id`. Missing, duplicate, inactive, and unsupported profiles are denied. Mock tests passed. |
| `GET /api/vehicles` | Admin/staff | Explicit VEHICLE projection; customer denied. Mock tests passed. |
| `GET /api/bookings` | Admin/staff per RLS; customer own rows only | Uses documented projection and `customer_id` scoped to linked profile `user_id`. Mock tests passed. |
| `GET /api/fleet/locations` | Admin/staff | Uses `vehicle_id,latitude,longitude,speed,timestamp`; vehicles without telemetry return `telemetry: null`; no GPS is fabricated. Mock tests passed. |
| `GET /api/alerts` | Admin/staff | Explicit EMERGENCY_ALERTS projection; customer denied. Mock tests passed. |
| `GET /api/staff` | Admin/staff; only admin/staff profiles | Route now matches core RLS policy. Customer denied. Mock tests passed. |

All protected routes reject anonymous requests in tests. Empty table reads return successful empty arrays; an empty vehicle inventory returns an empty locations array. Frontend tests cover empty results, permission errors, and API failures.

## Authentication and database security

- Backend bearer tokens are verified through Supabase Auth. Role and active state come from the unique linked USERS row, never a client role or Auth email. PostgREST requests use the public key plus caller JWT to preserve RLS.
- Customers are restricted to their own bookings by `customer_id`; the core RLS proposal repeats this ownership check and permits a customer to read their own profile. Customer access to fleet, telemetry, alerts, and staff is denied.
- `/api/tables` and `/api/vehicle` remain inaccessible. API responses omit unprojected columns and errors do not include upstream details.
- User reports that administrator login and the Auth UUID link work; that is project context, not a fresh live verification result from this run.

## Credential review

- The server loads root `.env.server`; the browser loads `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` from `.env.local`. Both local env files are ignored and untracked. The example files contain placeholders only.
- Browser Supabase config rejects `sb_secret_` keys. `.env.server` has no service-role/secret setting; the tracked-source scan found no `sb_secret_` key pattern or configured secret-key assignment. Public publishable/anon keys are designed to be visible in browser bundles; RLS remains the security boundary. No credential values are included here.

## Migration and live verification status

- [202611090003_core_read_rls.sql](../supabase/migrations/202611090003_core_read_rls.sql) defines core read grants/RLS for USERS, VEHICLE, BOOKINGS, TELEMETRY_LOGS, and EMERGENCY_ALERTS. It is statically checked only and was not run against PostgreSQL.
- Verify through an authorized catalog query whether migration 003 is already applied. If not, an authorized database owner must review and apply that exact migration before relying on caller-JWT database reads. Do not apply the broader `202611090002_reviewed_rls_role_policies.sql` as a shortcut; it covers more tables and update policies than Phase 1 requires.
- If `USERS.auth_user_id` and its unique index/FK are absent, review/apply [202611090001_users_auth_uuid_link.sql](../supabase/migrations/202611090001_users_auth_uuid_link.sql) before linking accounts. The migration preserves existing `user_id` and booking references and performs no account matching.
- No SQL was executed. Actual deployed RLS flags, policies, grants, constraints, and authenticated endpoint behavior were not inspected in this run. The user-reported administrator login and earlier anonymous schema probes do not prove role authorization or RLS behavior. No authorized live bearer test accounts were available.

## Tests and build

- `npm run test:server`: **passed â€” 23 tests**. These use mocked Supabase Auth/PostgREST; SQL migration tests are static text assertions.
- `CI=true npm test -- --watchAll=false`: **passed â€” 5 frontend tests**. Non-failing React Router future-flag and React `act(...)` warnings remain.
- `npm run build`: **passed**. Node emitted a non-failing `fs.F_OK` deprecation warning.
- `node --check server.js`: **passed**.
- Local `.env` ignore/tracked-file checks: **passed**.
- Read-only anonymous probe with `limit=0`: Auth settings returned HTTP 200; `VEHICLE` and `USERS` returned HTTP 200; `BOOKINGS`, `TELEMETRY_LOGS`, and `EMERGENCY_ALERTS` returned HTTP 401. No rows were requested or read. The 200 statuses show those two endpoints accept anonymous queries but do not establish whether RLS filters all rows; have an authorized database owner inspect their live grants and policies. Do not treat these probes as authenticated endpoint tests.

## Definition of done

**Code and mocked acceptance: PASS. Overall Phase 1 readiness: FAIL pending live verification.** An authorized operator must verify migration state and test with real admin, staff, customer A/customer B, inactive, and unlinked Auth accounts. Confirm customer-A cannot read customer-B bookings; customer cannot read fleet, telemetry, alerts, or staff; staff receives only permitted operational data and profiles; admin reads all approved Phase 1 resources. Record live results without logging tokens or personal data.
