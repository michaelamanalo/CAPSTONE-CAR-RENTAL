> **Current verification:** See [Phase 1 verification (2026-11-10)](./PHASE_1_BACKEND_VERIFICATION_20261110.md). Historical findings below describe an earlier email-based identity implementation and are superseded.

# Phase 1 Backend Report — Historical Phase 1 Snapshot

**Date:** 2026-11-09
**Result:** Local schema checks, backend tests, frontend tests, production build, and anonymous read-only Supabase connectivity/schema probes passed. Authenticated role/RLS behavior remains unverified because no authorized test accounts are configured.

## Configuration and credential handling

- `server.js` loads `.env.server` from the project root via `dotenv.config({ path: path.join(__dirname, '.env.server') })`. Existing process environment variables take precedence because dotenv's override option is not enabled.
- `.env.local` and `.env.server` were created from the available public anon key and the matching project reference. Both are ignored by Git (`.env.local` via `/*.local`, `.env.server` via `.env.*`); `.env.server` is not tracked. The server file contains no secret/service-role key.
- `.env.local.example` contains the user-provided legacy anon JWT; its URL remains a generic placeholder. The key's JWT claims identified the matching project reference used to configure the local files. The key is public by design. The earlier service-role-like value found in `.env.server.example` was removed. Rotate/revoke it in the Supabase Dashboard if it was valid because it may remain in repository history. No credential value is reproduced in this report.
- Obtain the project URL from the Supabase Dashboard project's **Connect** dialog or **Project Settings > API Keys**. Obtain the publishable key from **Project Settings > API Keys** for the browser and backend Auth validation. The API forwards each verified caller's access token to PostgREST with this public key, so database RLS applies. Do not configure a secret or service-role key for this read-only API. See the official [Supabase API key guide](https://supabase.com/docs/guides/getting-started/api-keys).
- `HOST` and `PORT` are optional local server bind settings, not Supabase credentials.

## Schema alignment

All PostgREST table names are uppercase (`VEHICLE`, `EMERGENCY_ALERTS`, `BOOKINGS`, `TELEMETRY_LOGS`, `USERS`); Postgres identifiers are quoted uppercase in the supplied schema description.

- `VEHICLE` selects exactly `vehicle_id, plate_number, model_name, brand, vehicle_type, rental_rate_per_day, status, tracker_device_id, model_year, description, image_url, is_active, updated_at`.
- `EMERGENCY_ALERTS` selects exactly `alert_id, booking_id, vehicle_id, alert_type, latitude, longitude, severity_g_force, status, timestamp, reported_by, acknowledged_by, acknowledged_at, resolved_at, description, resolution_notes, updated_at`; ordering is `timestamp.desc`.
- `BOOKINGS` selects `booking_id, customer_id, vehicle_id, start_date, end_date, total_amount, booking_status, created_at`; filters use `booking_status` and the verified values `Pending`, `Approved`, `Active`, `Completed`, `Cancelled`.
- Fleet location reads select `vehicle_id, latitude, longitude, speed, timestamp` from `TELEMETRY_LOGS`, filter by `vehicle_id`, and order by `timestamp.desc`. Vehicles without a telemetry row remain in the response with `telemetry: null`.
- Profile lookup selects only `user_id, email, role, is_active` from `USERS`. Staff listing uses the verified profile fields `user_id, name, email, phone_number, role`.
- API response projections only include their documented fields. Frontend normalizers now consume canonical alert columns (`alert_id`, `alert_type`, `description`, `timestamp`, latitude/longitude, acknowledgement timestamps/status) while preserving the current component/UI shape.

## Authentication, authorization, and identity risk

- Middleware validates bearer tokens through Supabase Auth `/auth/v1/user`, requires a valid Auth UUID and confirmed email, then finds exactly one case-insensitive email candidate and checks exact normalized equality. Missing, unconfirmed, ambiguous, inactive, or unsupported-role profiles fail closed.
- Authorization comes from the database profile role; only `admin` and `staff` can access staff read endpoints. `customer` and inactive profiles are denied. Every PostgREST request uses the verified caller's access token and public API key; the server no longer uses a privileged service-role key, and database RLS remains enabled.
- Auth UUIDs are not assumed to equal `USERS.user_id`. The current email mapping still has a durable-identity risk: email can change or be recycled, and the supplied schema evidence does not establish a unique normalized-email constraint or an Auth UUID foreign key. The code rejects ambiguous matches but cannot guarantee long-term identity continuity.
- A separate review-only additive proposal is at [docs/proposals/USERS_AUTH_UUID_LINK_PROPOSAL.md](./proposals/USERS_AUTH_UUID_LINK_PROPOSAL.md). It proposes a nullable UUID link, partial unique index, and `NOT VALID` foreign key after schema/RLS/migration review. It does not update IDs, assign links, or run automatically.

## Security and scope

`/api/tables` and `/api/vehicle` remain retired. Protected read routes remain `/api/session`, `/api/vehicles`, `/api/bookings`, `/api/fleet/locations`, `/api/alerts`, and `/api/staff`. Errors do not expose database response details. Browser code only receives the public publishable/anon key. No booking mutations, Tracksolid integration, Phase 2 work, production identity changes, or database migrations were performed.

## Verification results

- `npm run test:server`: **passed, 12 tests**. Includes exact vehicle and emergency-alert projections, bookings/customer_id, telemetry fields, email-to-profile mapping without UUID equality, forwarding the caller bearer token to PostgREST, unverified/ambiguous identity denial, staff/customer authorization, inactive profile denial, pagination, and retired routes.
- `npm test -- --watchAll=false`: **passed, 2 tests**. Existing React Router future-flag and React `act(...)` warnings were emitted; they did not fail the suite.
- `npm run build`: **passed** (optimized production build). Node emitted an upstream `fs.F_OK` deprecation warning.
- `node --check server.js`: **passed**.
- `.env.server` ignore check: **passed** (`.env.*` rule); tracked-file check: **no tracked `.env.server`**.
- Live anonymous probes using the newly created `.env.local`: **passed** using only the public anon key, with no bearer user token and `limit=0` so no database rows were returned. Key/project pairing matched. `GET /auth/v1/settings` returned **200**. Read-only projection requests for `VEHICLE`, `EMERGENCY_ALERTS`, `BOOKINGS`, `TELEMETRY_LOGS`, and `USERS` each returned **200**, confirming endpoint reachability and the requested column names against the live PostgREST schema.
- Live authenticated staff/customer authorization and user-scoped RLS behavior: **not run**; no authorized test accounts are available. Anonymous zero-row schema probes do not verify policies for staff or customer sessions. No authentication was bypassed.

## Phase 1 assessment

The API projections and frontend response consumers match the supplied VEHICLE, EMERGENCY_ALERTS, BOOKINGS, TELEMETRY_LOGS, and USERS structures, with local regression coverage. Anonymous live checks confirmed all five projections against PostgREST without returning records. Authenticated integration verification remains contingent on authorized test accounts; the report does not claim live role or user-scoped RLS verification.
