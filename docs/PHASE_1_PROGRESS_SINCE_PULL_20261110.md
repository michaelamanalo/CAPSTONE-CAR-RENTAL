# G-FLEET â€” Progress Since Last Pull

**Date:** 2026-11-10
**Git baseline:** Work began on `main` at `1368bab`. During push preparation, `origin/main` advanced to `7f5592d`; this work was rebased onto that commit before push. The new dashboard, Bookings route, and prototype changes from `7f5592d` were preserved.

## Backend authentication and read APIs

- Replaced email-based profile resolution with Supabase Auth token verification followed by an exact lookup on `public."USERS".auth_user_id`. Application role and `is_active` come from that profile row. There is no client-role or email fallback; missing, duplicate, inactive, or unsupported profiles fail closed.
- Preserved the public Supabase key plus caller JWT model for PostgREST so database RLS remains in effect. API errors do not return upstream database details.
- Restricted customer booking reads to the linked profile's `user_id` through `BOOKINGS.customer_id`. Admin/staff can read operational bookings under database RLS.
- Restricted fleet, location, and alert endpoints to admin/staff. `/api/staff` returns admin/staff profiles for admin/staff callers, consistent with the core RLS policy.
- Kept `/api/tables` and `/api/vehicle` inaccessible. Read routes remain GET-only.
- Fleet locations use `vehicle_id`, `latitude`, `longitude`, `speed`, and `timestamp`; a vehicle without telemetry receives `telemetry: null`. No GPS values are synthesized.
- Empty table results return successful arrays.

## Frontend integration

- Updated dashboard API clients and schema normalizers to use the authenticated API and verified database fields.
- Restricted the React dashboard to admin/staff sessions. Dashboard tests cover empty vehicle results, location permission failures, and vehicle API failures.
- Preserved existing screen and component structure; no new Phase 2 functionality was added.
- Updated `useFleetSnapshot` to load dashboard resources through the secured API clients, preserving the newer dashboard UI while removing its dependency on the retired unrestricted table explorer.

## Database migration proposals and documentation

- Added `supabase/migrations/202611090001_users_auth_uuid_link.sql`: guarded, additive nullable Auth UUID link, unique non-null index, and FK proposal. It does not change existing profile IDs, booking references, or assign identity links.
- Added `supabase/migrations/202611090002_reviewed_rls_role_policies.sql`: broader review-only proposal for all named tables and selected writes. It is not a Phase 1 shortcut.
- Added `supabase/migrations/202611090003_core_read_rls.sql`: review-only read grants and RLS proposal for core Phase 1 tables.
- Added the security model, identity-link proposal, and Phase 1/Phase 1.5 reports. No migration was applied to Supabase.

## Credentials

- Added placeholder-only `.env.local.example` and `.env.server.example`; removed the server secret/service-role setting from the example.
- `.env.local` and `.env.server` are ignored and untracked. The browser uses only the public publishable/anon key; the server forwards the caller token. No credential values are recorded in this document.

## Verification completed

- `npm run test:server`: passed, 23 tests. Tests use mocked Supabase Auth/PostgREST; SQL checks are static assertions.
- `CI=true npm test -- --watchAll=false`: passed, 5 frontend tests. Non-failing React Router future-flag and React `act(...)` warnings were emitted.
- `npm run build`: passed. Node emitted a non-failing `fs.F_OK` deprecation warning.
- `node --check server.js`: passed.
- `git diff --check`: passed.
- Local env ignore/tracked-file checks: passed.

## Live verification and remaining work

- User reports that administrator login and `USERS.auth_user_id` linkage work. This was not independently tested with a live authenticated session during this work.
- The latest anonymous schema probe requested `limit=0`, so it read no rows. Auth settings returned HTTP 200; `VEHICLE` and `USERS` returned HTTP 200; `BOOKINGS`, `TELEMETRY_LOGS`, and `EMERGENCY_ALERTS` returned HTTP 401. The two HTTP 200 responses show that anonymous queries are accepted but do not show whether RLS filtered all data. An authorized database owner must inspect the live privileges and policies for `VEHICLE` and `USERS` before acceptance.
- Live admin/staff/customer authorization, customer-to-customer booking isolation, and deployed RLS behavior remain unverified. Confirm migration state and test with authorized admin, staff, two customers, inactive, and unlinked accounts. Record those results separately from mock tests.
- Overall Phase 1 readiness remains **FAIL pending live authorization/RLS verification**. No production data or database objects were changed.
