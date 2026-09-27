/*
  Single place to line up your React pages with your actual Supabase table
  names. Confirmed directly against /api/tables output on 2026-09-13.
  TELEMETRY_LOGS is GPS/vehicle telemetry, not a general activity feed —
  the Activity Logs page may need a different source once you decide what
  it should actually show (bookings + alerts combined? a real audit log
  table?). Edit here if anything changes.
*/
export const TABLES = {
  vehicles: 'VEHICLE',
  telemetry: 'TELEMETRY_LOGS', // live GPS readings, matched to a vehicle by tracker_device_id
  bookings: 'BOOKINGS',
  alerts: 'EMERGENCY_ALERTS',
  users: 'USERS',
  geofences: 'GEOFENCE',
  // No dedicated activity-log table exists yet — the Activity Logs page
  // currently builds its feed from bookings + alerts instead. Add a real
  // table name here if/when one exists.
};

// Which USERS.role values are allowed to sign into this web dashboard.
// Customers use the mobile app, not this. Add/remove roles here as needed —
// nothing else in the app needs to change to adjust who can log in.
export const ALLOWED_LOGIN_ROLES = ['admin', 'staff'];
