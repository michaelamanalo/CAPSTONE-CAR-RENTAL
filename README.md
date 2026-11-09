# SGT Car Rentals Dashboard and API

The root React application and Node.js API serve the current staff dashboard. The older scaffold in `web/g_fleet_web` is not the active frontend. Sign-in uses Supabase Auth; the API validates each bearer token and resolves the profile by `USERS.auth_user_id`, without assuming it equals `USERS.user_id` or falling back to email.

## Local setup

1. Run `npm ci`.
2. Copy `.env.local.example` to `.env.local` and `.env.server.example` to `.env.server`. `.env.server` is ignored by Git; do not commit it.
3. Obtain the project URL from the project's **Connect** dialog or **Project Settings > API Keys** in the Supabase Dashboard. Obtain the publishable key from **Project Settings > API Keys** and put it in both files. The frontend's `REACT_APP_*` values are embedded in the browser build and are public; never put a secret key there. The server forwards each verified user's access token to PostgREST with this public key so database RLS applies; do not configure a secret or `service_role` key for this read-only API. Supabase's [API key guide](https://supabase.com/docs/guides/getting-started/api-keys) describes these keys and their locations. Example values are placeholders, not production credentials.
4. Review and manually apply the Auth UUID/RLS migrations in `supabase/migrations/` only after following [the Phase 1.5 security model](docs/PHASE_1_5_SECURITY_MODEL.md). Link each authorized Auth UUID to the intended existing `USERS.user_id` through a separately reviewed operation; never infer links from email or change existing user/booking IDs. Until an active profile is linked, access is denied.
5. Run `npm run server` and `npm start` in separate terminals. The API binds to `127.0.0.1:4000` by default. `HOST` and `PORT` can override this for a controlled deployment.

## API

- `GET /api/health` is public and returns only `{ success, data: { status } }`.
- `GET /api/session` validates the token, linked active profile, and database role.
- `GET /api/vehicles` returns a bounded fleet projection for admin/staff.
- `GET /api/bookings?limit=50&offset=0&status=Pending` returns a bounded page using `booking_status`; admin/staff can read operational bookings and customers are restricted to their own `customer_id`.
- `GET /api/fleet/locations` returns each vehicle with its newest stored telemetry row, or `null` when no telemetry exists; admin/staff only.
- `GET /api/alerts` and `GET /api/staff` are for admin/staff; the staff listing is limited to admin/staff profiles.

All protected routes require a Supabase-verified access token and an active linked profile. Customers can access only their own bookings; they receive `403` for fleet and administrative routes. The React dashboard admits only admin/staff. `/api/tables` and `/api/vehicle` are retired. API errors use `{ success: false, error: { code, message } }`; database details are not sent to clients.

The browser and backend use only the publishable/anon key. The backend validates tokens with Supabase Auth and forwards the verified caller JWT to PostgREST so RLS applies. No server-only secret/service-role key is used. The frontend API service attaches the current Supabase access token to protected requests.

## Checks

- `npm run test:server` runs mocked Node API authorization and route tests.
- `npm test -- --watchAll=false` runs the React tests.
- `npm run build` creates the production React build.

None of these checks verifies live database relationships or actual deployed Supabase column names; confirm those against the target project before release.
