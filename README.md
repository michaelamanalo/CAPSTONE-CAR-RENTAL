# SGT Car Rentals Dashboard

React dashboard for SGT fleet, staff, alerts, and activity data. Dashboard access uses Supabase email/password authentication and is limited to accounts with an `admin` or `staff` role in the `USERS` table.

## Run locally

1. Install Node.js, then install the project dependencies:

   ```sh
   npm ci
   ```

2. Copy the environment examples:

   ```sh
   cp .env.local.example .env.local
   cp .env.server.example .env.server
   ```

   In PowerShell, use `Copy-Item` instead of `cp` if needed.

3. In both files, set your Supabase project URL and publishable key (or legacy anon key). Put the server secret key (or legacy service-role key) only in `.env.server`. Keep the real `.env.*` files private and untracked.

4. Create each staff account under **Supabase Dashboard → Authentication → Users**. Add a matching row in `USERS` with the same email and set `role` to `admin` or `staff`. Emails are matched without regard to letter case. There is no public signup flow.

5. Start the proxy and web app in separate terminals from the project folder:

   ```sh
   npm run server
   ```

   ```sh
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000). The proxy listens on `127.0.0.1:4000` by default; `HOST` and `PORT` in `.env.server` can override those values.

The server validates the Supabase session and staff role before returning dashboard data. It exposes read access to `VEHICLE`, `TELEMETRY_LOGS`, `BOOKINGS`, `EMERGENCY_ALERTS`, and `USERS`; the secret key never belongs in a `REACT_APP_*` variable.

## Build

```sh
npm run build
```
