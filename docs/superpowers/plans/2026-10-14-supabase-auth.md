# Supabase Auth and Database Proxy Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` to implement this plan task by task.

**Goal:** Replace demo sign-in with Supabase Auth and require a verified admin/staff session for dashboard data.

**Architecture:** The browser signs in through the existing Supabase JS client and sends its access token to the local Node proxy. The proxy validates the token with Supabase Auth, checks the matching `USERS` profile, and reads only allowlisted tables with a limited field projection.

**Tech Stack:** React, React Router, `@supabase/supabase-js`, Node.js built-in HTTP server, Supabase REST/Auth APIs.

**Spec:** `docs/superpowers/specs/2026-10-14-supabase-auth-design.md`

## Global Constraints

- Only authenticated accounts with `USERS.role` equal to `admin` or `staff` may access dashboard data.
- `SUPABASE_SECRET_KEY` remains server-only; browser code uses only the publishable/anon key.
- The proxy allows only `VEHICLE`, `TELEMETRY_LOGS`, `BOOKINGS`, `EMERGENCY_ALERTS`, and `USERS`, projecting fields used by current screens.
- Project only these case-insensitive column names, preserving the source key spelling: `VEHICLE` (`vehicle_id`, `id`, `brand`, `model_name`, `model`, `plate_number`, `plate`, `vehicle_type`, `rental_rate_per_day`, `status`, `tracker_device_id`); `TELEMETRY_LOGS` (`tracker_device_id`, `device_id`, `lat`, `latitude`, `lng`, `longitude`, `speed`, `recorded_at`, `timestamp`, `created_at`); `BOOKINGS` (`id`, `booking_id`, `customer`, `customer_name`, `user_name`, `vehicle_id`, `vehicleId`, `vehicle`, `vehicle_model`, `start`, `start_date`, `rental_start`, `end`, `end_date`, `rental_end`, `status`); `EMERGENCY_ALERTS` (`id`, `alert_id`, `vehicle_id`, `vehicleId`, `type`, `alert_type`, `message`, `description`, `time`, `created_at`, `timestamp`, `location`, `address`, `acknowledged`, `resolved`); `USERS` (`user_id`, `id`, `name`, `email`, `phone_number`, `phone`, `role`).
- Keep the approved dashboard pages and styling; do not add signup, write APIs, maps, or hosting infrastructure.
- Do not add or run tests in this task. Update the existing fake-login test only as needed to keep its documented success path consistent. Verify with build, syntax check, and manual API checks.

## Review Focus

- Missing or malformed bearer token: manually confirm protected endpoints return `401` without table data.
- Valid Supabase user with no `USERS` profile or a customer role: manually confirm access is denied (`403`) and the UI returns to sign-in.
- Supabase Auth or profile lookup unavailable: confirm the request fails closed with a readable UI error.
- Admin/staff session and token refresh: confirm allowed users can open screens and remain authorized after refresh, then sign out.
- Extra columns in a Supabase table: inspect API output and confirm fields outside the UI allowlist never leave the server.

---

### Task 1: Authenticate and narrow the Node proxy

**Files:**
- Modify: `server.js`

**Interfaces:**
- Consumes server env values `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`, `HOST`, and `PORT`.
- Produces `GET /api/session` for authorization checks and protected `GET /api/tables` and `GET /api/vehicle` responses. Missing/invalid tokens return `401`; authenticated accounts without an allowed `USERS` role return `403`.

- [ ] Add one authorization helper that verifies the bearer token with Supabase Auth and matches the verified email to an `admin`/`staff` profile in `USERS`; return a normalized role or a safe `401`/`403` response.
- [ ] Protect `/api/session`, `/api/tables`, and `/api/vehicle` with that helper. Keep `/api/health` data-free.
- [ ] Replace schema discovery and unrestricted table reads with the five-table allowlist and a per-table field projection; reject any vehicle filter column outside the vehicle field allowlist.
- [ ] Bind the server to `HOST || '127.0.0.1'` and retain `PORT || 4000`.
- [ ] Run `node --check server.js`; manually request `/api/tables` without a bearer token and confirm `401` with no rows.

### Task 2: Use Supabase sessions in the React app

**Files:**
- Modify: `src/services/api.js`
- Modify: `src/services/supabaseClient.js`
- Modify: `src/context/AuthContext.jsx`
- Modify: `src/App.js`
- Modify: `src/pages/Login.jsx`
- Modify: `src/pages/Login.css`
- Modify: `src/components/Navbar/Navbar.jsx`
- Modify: `src/App.test.js`

**Interfaces:**
- `AuthContext.login(email, password)` signs in and returns an error object or success; `logout()` signs out of Supabase Auth.
- `verifyAccess(accessToken)` calls `GET /api/session`; `requestJson` attaches the current session token to data requests.
- App routes render only while auth is loading or after server access is authorized.

- [ ] Update `api.js` to attach the current Supabase access token and expose `verifyAccess`; preserve safe error messages for `401`, `403`, and network errors.
- [ ] Replace the boolean localStorage auth context with Supabase sign-in, restored-session validation, auth-state subscription, and Supabase sign-out.
- [ ] Gate `AppContent` on the context’s checking/authorized/signed-out states. Do not flash dashboard routes before server role verification completes.
- [ ] Show login and access-denied errors, disable submit while signing in, and remove the nonfunctional remember/forgot controls (tell staff to contact an admin for password recovery).
- [ ] Update the existing `App.test.js` success-path setup to mock the Supabase login and authorized `/api/session` response; do not add test cases or run the test runner.
- [ ] Manually confirm invalid credentials remain on sign-in and an authorized login reaches the dashboard.

### Task 3: Make setup reproducible and verify the change

**Files:**
- Create: `.env.local.example`
- Create: `.env.server.example`
- Modify: `.gitignore`
- Modify: `README.md`

- [ ] Add placeholder-only environment examples. The server example includes URL, publishable/anon key, secret key, loopback host, and port.
- [ ] Keep real `.env.*` files ignored while explicitly allowing only the two `.example` files.
- [ ] Replace generic Create React App setup prose with concise clone, `npm ci`, environment setup, two-terminal startup, and matching Supabase Auth + `USERS` profile instructions.
- [ ] Run `npm run build` and `node --check server.js`; inspect tracked files and build output to confirm no service secret is included.
- [ ] Manually confirm unauthenticated API rejection and the working admin/staff sign-in flow when valid Supabase accounts are available.

## Execution recommendation

**Native inline implementation** is recommended: the server response contract and React session flow share interfaces, so one implementer can keep them consistent without extra handoffs.
