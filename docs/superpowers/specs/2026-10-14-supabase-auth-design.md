# Supabase Auth and Database Proxy Access

**Date:** 2026-10-14  
**Status:** Design approved in chat; awaiting review of this written spec.

## Goal

Replace the demo-only sign-in with Supabase email/password authentication and prevent unauthenticated callers from using the server's privileged Supabase key to read dashboard data. Keep the existing dashboard screens and the approved wireframe navigation.

## Current behavior

- The login form accepts any non-empty email and password and stores a boolean in `localStorage`.
- The Node proxy uses `SUPABASE_SECRET_KEY` to read every Supabase REST table and serves that data from unauthenticated `/api/tables` and `/api/vehicle` endpoints.
- The proxy listens on the default unspecified interface, which can expose it to other devices on the network.

## Design

1. **Browser sign-in:** Use the installed Supabase JS client to sign in with email/password. The client stores and refreshes its session. The auth context listens for session changes, validates access with the server, and signs out when the profile is missing or its role is not `admin` or `staff`. Sign-out calls Supabase Auth.
2. **Server authorization:** Add `GET /api/session`. The server requires a bearer token, verifies it against Supabase Auth using the project's publishable/anon API key, then checks the verified email against the `USERS` table using the server-only secret key. Only `admin` and `staff` profiles are authorized. The server, not client code, owns this decision.
3. **Protected data routes:** Require the same verified admin/staff access for `/api/tables` and `/api/vehicle`. Return `401` for a missing/invalid session and `403` for an account without an allowed profile. Frontend API calls attach the current Supabase access token.
4. **Least data returned:** Replace OpenAPI table discovery and unrestricted reads with an explicit allowlist used by the dashboard: `VEHICLE`, `TELEMETRY_LOGS`, `BOOKINGS`, `EMERGENCY_ALERTS`, and `USERS`. Return only fields consumed by the existing pages; in particular, never return unneeded `USERS` columns. Keep the vehicle query limited to the vehicle table and its supported columns.
5. **Local proxy binding:** Listen on `127.0.0.1` by default, with an explicit `HOST` override for controlled deployments. `/api/health` may report readiness but must never return table data.
6. **Setup documentation:** Document that a staff account must exist in Supabase Auth and have a matching `USERS` row with the same email and an `admin` or `staff` role. Keep the publishable key and server secret in ignored environment files; provide a safe example file with placeholders and never commit real credentials.

Supabase API references: [`signInWithPassword`](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [`onAuthStateChange`](https://supabase.com/docs/reference/javascript/auth-onauthstatechange), and [`getUser`](https://supabase.com/docs/reference/javascript/auth-getuser).

## Error behavior

- Invalid credentials stay on the sign-in screen with a readable error.
- A valid Supabase account without a matching admin/staff profile is signed out and shown an access-denied message.
- API authorization errors do not expose tokens, the service key, or database row contents.
- If Supabase configuration is missing, show a configuration error rather than accepting a local/demo login.

## Non-goals

- Sign-up or staff-account provisioning in the web UI.
- Database write endpoints, booking approval, or persistent notification acknowledgement.
- Google Maps, geofence drawing, or production hosting changes.

## Acceptance criteria

- Empty credentials, invalid credentials, unauthenticated API requests, customer-role users, and users without a `USERS` profile cannot open protected screens or read data endpoints.
- Authenticated admin/staff users can use the existing screens and sign out; API requests remain authorized after session refresh.
- The proxy returns only the five approved tables and the fields required by the UI, and binds to loopback unless `HOST` is explicitly set.
- No service key or real environment value appears in browser code, tracked files, or build output.
- `npm run build` succeeds, and the README explains local setup and account provisioning.

## Deployment boundary

This change secures the existing local Node proxy. Deploying the React build and API as a production service, configuring TLS/ingress, and defining database RLS policies remain separate work.
