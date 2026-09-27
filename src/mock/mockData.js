/*
  Placeholder data shaped to match the tables described in the proposal's
  ERD (VEHICLE, BOOKING, ALERT, GEOFENCE, USER, STAFF). Swap the functions
  below for real Supabase queries once the backend is ready — the pages
  only depend on this shape, not on where it comes from.
*/

export const vehicles = [
  { id: 'GF-01', model: 'Toyota Avanza', plate: 'ABC 1234', status: 'active', speed: 42, lastUpdate: '2 sec ago', lat: 8.1575, lng: 125.1278, driver: 'On rental — J. Ramos' },
  { id: 'GF-02', model: 'Mitsubishi Xpander', plate: 'DEF 5678', status: 'active', speed: 0, lastUpdate: '5 sec ago', lat: 8.1502, lng: 125.1330, driver: 'On rental — M. Cruz' },
  { id: 'GF-03', model: 'Toyota Innova', plate: 'GHI 9012', status: 'idle', speed: 0, lastUpdate: '1 min ago', lat: 8.1601, lng: 125.1201, driver: 'Parked at garage' },
  { id: 'GF-04', model: 'Ford Ranger', plate: 'JKL 3456', status: 'alert', speed: 61, lastUpdate: 'just now', lat: 8.1489, lng: 125.1355, driver: 'On rental — R. Santos' },
  { id: 'GF-05', model: 'Toyota Vios', plate: 'MNO 7890', status: 'offline', speed: 0, lastUpdate: '14 min ago', lat: 8.1620, lng: 125.1180, driver: 'Signal lost — buffering' },
  { id: 'GF-06', model: 'Honda BR-V', plate: 'PQR 2345', status: 'idle', speed: 0, lastUpdate: '3 min ago', lat: 8.1550, lng: 125.1260, driver: 'Parked at garage' },
];

export const alerts = [
  { id: 'AL-2041', vehicleId: 'GF-04', type: 'emergency', message: 'SOS button pressed by customer', time: '08:42 AM', location: 'Sayre Hwy, near Kalasungay', acknowledged: false },
  { id: 'AL-2040', vehicleId: 'GF-04', type: 'overspeeding', message: 'Recorded 61 km/h in a 40 km/h zone', time: '08:41 AM', location: 'Sayre Hwy', acknowledged: false },
  { id: 'AL-2039', vehicleId: 'GF-05', type: 'signal', message: 'Tracker offline — last position buffered', time: '08:29 AM', location: 'Brgy. Kalasungay', acknowledged: true },
  { id: 'AL-2038', vehicleId: 'GF-02', type: 'geofence', message: 'Exited approved service area', time: 'Yesterday, 6:12 PM', location: 'Malaybalay City limits', acknowledged: true },
];

export const bookings = [
  { id: 'BK-1187', customer: 'Ana Reyes', vehicleId: 'GF-01', vehicle: 'Toyota Avanza', start: 'Sep 12, 8:00 AM', end: 'Sep 13, 8:00 AM', status: 'active' },
  { id: 'BK-1188', customer: 'Marco Dizon', vehicleId: 'GF-02', vehicle: 'Mitsubishi Xpander', start: 'Sep 12, 9:30 AM', end: 'Sep 14, 9:30 AM', status: 'active' },
  { id: 'BK-1189', customer: 'Liza Fernandez', vehicleId: 'GF-03', vehicle: 'Toyota Innova', start: 'Sep 13, 7:00 AM', end: 'Sep 13, 7:00 PM', status: 'pending' },
  { id: 'BK-1190', customer: 'Dennis Ong', vehicleId: 'GF-06', vehicle: 'Honda BR-V', start: 'Sep 14, 10:00 AM', end: 'Sep 16, 10:00 AM', status: 'pending' },
  { id: 'BK-1183', customer: 'Grace Villamor', vehicleId: 'GF-04', vehicle: 'Ford Ranger', start: 'Sep 10, 8:00 AM', end: 'Sep 12, 8:00 AM', status: 'completed' },
];

export const staff = [
  { id: 'ST-01', name: 'Junh Saint Sanchez', role: 'admin', email: 'junh@sgtcarrentals.ph' },
  { id: 'ST-02', name: 'Victory Kyle Villarino', role: 'staff', email: 'victory@sgtcarrentals.ph' },
  { id: 'ST-03', name: 'Michaela Amor Manalo', role: 'staff', email: 'michaela@sgtcarrentals.ph' },
];

export const fleetSummary = {
  total: vehicles.length,
  active: vehicles.filter((v) => v.status === 'active').length,
  idle: vehicles.filter((v) => v.status === 'idle').length,
  offline: vehicles.filter((v) => v.status === 'offline').length,
  alerts: alerts.filter((a) => !a.acknowledged).length,
};
