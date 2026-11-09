/*
  Frontend resource names. Data is loaded through scoped API routes; this list
  does not grant database access. TELEMETRY_LOGS joins vehicles by vehicle_id.
*/
export const TABLES = {
  vehicles: 'VEHICLE',
  telemetry: 'TELEMETRY_LOGS',
  bookings: 'BOOKINGS',
  alerts: 'EMERGENCY_ALERTS',
  users: 'USERS',
  geofences: 'GEOFENCE',
};

// Dashboard sign-in is restricted to these trusted USERS.role values.
export const ALLOWED_LOGIN_ROLES = ['admin', 'staff'];
