import { DEMO_DATA_EVENT } from './demoMode';

const STORAGE_KEY = 'sgt-car-rentals-demo-v1';
const ID_FIELDS = {
  VEHICLE: 'vehicle_id',
  BOOKINGS: 'booking_id',
  EMERGENCY_ALERTS: 'alert_id',
  USERS: 'user_id',
};

function offsetDate(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function createSeedData() {
  const vehicles = [
    ['SGT-001', 'Toyota', 'Avanza 1.5 G CVT', 'KAF 2187', 'MPV', 2800, 'Rented', 'TRK-001'],
    ['SGT-002', 'Mitsubishi', 'Xpander GLS', 'KAG 4302', 'MPV', 3200, 'Rented', 'TRK-002'],
    ['SGT-003', 'Toyota', 'Vios 1.3 XLE', 'KAH 1156', 'Sedan', 2200, 'Available', 'TRK-003'],
    ['SGT-004', 'Ford', 'Ranger XLS 4x2', 'KAI 7724', 'Pickup', 4200, 'Maintenance', 'TRK-004'],
    ['SGT-005', 'Honda', 'BR-V VX', 'KAJ 3901', 'SUV', 3500, 'Available', 'TRK-005'],
    ['SGT-006', 'Toyota', 'Innova 2.8 V', 'KAK 8840', 'MPV', 4200, 'Rented', 'TRK-006'],
    ['SGT-007', 'Nissan', 'Navara VE Calibre', 'KAL 2633', 'Pickup', 4500, 'Available', 'TRK-007'],
    ['SGT-008', 'Hyundai', 'Stargazer GLS', 'KAM 9018', 'MPV', 3300, 'Available', 'TRK-008'],
    ['SGT-009', 'Toyota', 'Fortuner 2.4 G', 'KAN 6712', 'SUV', 5200, 'Rented', 'TRK-009'],
    ['SGT-010', 'Suzuki', 'Ertiga Hybrid GLX', 'KAP 5084', 'MPV', 3000, 'Available', 'TRK-010'],
    ['SGT-011', 'Mitsubishi', 'Mirage G4 GLS', 'KAR 1467', 'Sedan', 2100, 'Maintenance', 'TRK-011'],
    ['SGT-012', 'Toyota', 'Hiace Commuter', 'KAS 3389', 'Van', 5600, 'Available', 'TRK-012'],
  ].map(([vehicle_id, brand, model_name, plate_number, vehicle_type, rental_rate_per_day, status, tracker_device_id]) => ({
    vehicle_id, brand, model_name, plate_number, vehicle_type, rental_rate_per_day, status, tracker_device_id,
  }));

  const vehicleCoordinates = [
    [8.15752, 125.12768, 32], [8.15128, 125.13212, 0], [8.16031, 125.11974, 0],
    [8.14892, 125.13558, 0], [8.15412, 125.12450, 0], [8.16302, 125.12194, 47],
    [8.14673, 125.13822, 0], [8.15910, 125.13044, 0], [8.15062, 125.11782, 28],
    [8.15594, 125.14008, 0], [8.16520, 125.12880, 0], [8.15222, 125.12305, 0],
  ];
  const telemetry = vehicleCoordinates.map(([latitude, longitude, speed], index) => ({
    vehicle_id: vehicles[index].vehicle_id,
    latitude,
    longitude,
    speed,
    timestamp: offsetDate(-(index + 1) * 3),
  }));

  const bookings = [
    ['BK-2026-041', 'CUS-101', 'Ana Reyes', '0917 555 0182', 'ana.reyes@example.com', 'SGT-001', -4, 44, 12300, 'active'],
    ['BK-2026-042', 'CUS-102', 'Marco Dizon', '0920 555 0241', 'marco.dizon@example.com', 'SGT-002', -22, 50, 17400, 'active'],
    ['BK-2026-043', 'CUS-103', 'Liza Fernandez', '0918 555 0316', 'liza.fernandez@example.com', 'SGT-006', -30, 18, 8400, 'active'],
    ['BK-2026-044', 'CUS-104', 'Dennis Ong', '0998 555 0419', 'dennis.ong@example.com', 'SGT-009', -12, 60, 26000, 'active'],
    ['BK-2026-045', 'CUS-105', 'Grace Villamor', '0917 555 0550', 'grace.villamor@example.com', 'SGT-003', 20, 68, 6600, 'pending'],
    ['BK-2026-046', 'CUS-106', 'Rafael Santos', '0927 555 0674', 'rafael.santos@example.com', 'SGT-005', 27, 99, 12600, 'pending'],
    ['BK-2026-047', 'CUS-107', 'Camille Flores', '0919 555 0732', 'camille.flores@example.com', 'SGT-007', 46, 118, 13500, 'pending'],
    ['BK-2026-048', 'CUS-108', 'Paolo Garcia', '0906 555 0826', 'paolo.garcia@example.com', 'SGT-008', 68, 116, 16500, 'pending'],
    ['BK-2026-049', 'CUS-109', 'Mia Castillo', '0916 555 0951', 'mia.castillo@example.com', 'SGT-010', 95, 167, 21600, 'pending'],
    ['BK-2026-050', 'CUS-110', 'Joshua Lim', '0922 555 1017', 'joshua.lim@example.com', 'SGT-012', 118, 214, 16800, 'pending'],
    ['BK-2026-036', 'CUS-111', 'Sofia Mendoza', '0917 555 1128', 'sofia.mendoza@example.com', 'SGT-004', -190, -142, 4400, 'completed'],
    ['BK-2026-037', 'CUS-112', 'Nico Bautista', '0918 555 1244', 'nico.bautista@example.com', 'SGT-005', -242, -194, 7000, 'completed'],
    ['BK-2026-038', 'CUS-113', 'Ella Navarro', '0995 555 1390', 'ella.navarro@example.com', 'SGT-008', -310, -262, 6600, 'completed'],
    ['BK-2026-039', 'CUS-114', 'Luis Ramos', '0928 555 1455', 'luis.ramos@example.com', 'SGT-010', -382, -358, 4200, 'completed'],
    ['BK-2026-040', 'CUS-115', 'Isabel Cruz', '0917 555 1571', 'isabel.cruz@example.com', 'SGT-007', -455, -407, 9000, 'cancelled'],
  ].map(([booking_id, customer_id, customer_name, customer_phone, customer_email, vehicle_id, startHours, endHours, total_amount, booking_status]) => ({
    booking_id, customer_id, customer_name, customer_phone, customer_email, vehicle_id,
    start_date: offsetDate(startHours), end_date: offsetDate(endHours), total_amount,
    booking_status, created_at: offsetDate(startHours - 72),
  }));

  const alerts = [
    ['ALT-301', 'SGT-004', 'emergency', 'Customer requested roadside assistance near Sayre Highway.', -180, true, 8.14892, 125.13558],
    ['ALT-302', 'SGT-009', 'overspeeding', 'Vehicle reached 82 km/h in a 60 km/h zone.', -34, false, 8.15062, 125.11782],
    ['ALT-303', 'SGT-002', 'geofence', 'Vehicle exited the approved service area.', -58, false, 8.15128, 125.13212],
    ['ALT-304', 'SGT-006', 'signal', 'Tracker connection was interrupted for more than five minutes.', -86, false, 8.16302, 125.12194],
    ['ALT-305', 'SGT-001', 'speed', 'Vehicle is approaching the posted speed limit.', -132, false, 8.15752, 125.12768],
    ['ALT-306', 'SGT-007', 'geofence', 'Vehicle entered the Malaybalay central district.', -180, false, 8.14673, 125.13822],
    ['ALT-307', 'SGT-005', 'signal', 'Tracker reported a brief connection drop.', -280, true, 8.15412, 125.12450],
    ['ALT-308', 'SGT-010', 'overspeeding', 'Vehicle reached 74 km/h on the city highway.', -410, true, 8.15594, 125.14008],
    ['ALT-309', 'SGT-003', 'geofence', 'Vehicle returned to the main service area.', -920, true, 8.16031, 125.11974],
    ['ALT-310', 'SGT-012', 'signal', 'GPS signal restored after a short outage.', -1510, true, 8.15222, 125.12305],
  ].map(([alert_id, vehicle_id, alert_type, description, ago, acknowledged, latitude, longitude]) => ({
    alert_id, vehicle_id, alert_type, description,
    timestamp: offsetDate(ago),
    latitude, longitude,
    status: acknowledged ? 'acknowledged' : 'open',
    acknowledged_at: acknowledged ? offsetDate(ago + 8) : null,
  }));

  const users = [
    ['USR-001', 'SGT Administrator', 'admin@example.com', '0917 555 0001', 'admin'],
    ['USR-002', 'Mia Villanueva', 'mia@example.com', '0917 555 0002', 'staff'],
    ['USR-003', 'Victor Aguilar', 'victor@example.com', '0917 555 0003', 'staff'],
    ['USR-004', 'Angela Flores', 'angela@example.com', '0917 555 0004', 'staff'],
    ['USR-005', 'Carlos Mendoza', 'carlos@example.com', '0917 555 0005', 'staff'],
    ['USR-006', 'Jun Sanchez', 'jun@example.com', '0917 555 0006', 'driver'],
    ['USR-007', 'Paolo Garcia', 'paolo@example.com', '0917 555 0007', 'driver'],
    ['USR-008', 'Ella Navarro', 'ella@example.com', '0917 555 0008', 'driver'],
    ['USR-009', 'Nico Bautista', 'nico@example.com', '0917 555 0009', 'driver'],
    ['USR-010', 'Sofia Mendoza', 'sofia@example.com', '0917 555 0010', 'driver'],
    ['USR-011', 'Luis Ramos', 'luis@example.com', '0917 555 0011', 'driver'],
  ].map(([user_id, name, email, phone_number, role]) => ({ user_id, name, email, phone_number, role }));

  return {
    VEHICLE: vehicles,
    TELEMETRY_LOGS: telemetry,
    BOOKINGS: bookings,
    EMERGENCY_ALERTS: alerts,
    USERS: users,
  };
}

let memoryData;

function readStore() {
  if (memoryData) return memoryData;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Object.keys(createSeedData()).every((key) => Array.isArray(parsed[key]))) {
        memoryData = parsed;
        return memoryData;
      }
    }
  } catch {
    // Use an in-memory demo if browser storage is disabled.
  }
  memoryData = createSeedData();
  writeStore(memoryData);
  return memoryData;
}

function writeStore(data) {
  memoryData = data;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // The demo remains usable until the page is refreshed.
  }
}

function notifyChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(DEMO_DATA_EVENT));
}

export function getDemoRows(tableName) {
  const rows = readStore()[tableName] || [];
  return rows.map((row) => ({ ...row }));
}

export function getDemoFleetLocations() {
  return getDemoRows('TELEMETRY_LOGS').map((telemetry) => ({
    vehicle_id: telemetry.vehicle_id,
    telemetry,
  }));
}

function rentalEndedMoreThanOneDayAgo(value) {
  const endTime = new Date(value).getTime();
  return Number.isFinite(endTime) && Date.now() >= endTime + 24 * 60 * 60 * 1000;
}

export function canDeleteDemoRecord(tableName, id) {
  if (!ID_FIELDS[tableName]) return false;
  const data = readStore();
  const idField = ID_FIELDS[tableName];
  const record = (data[tableName] || []).find((row) => String(row[idField]) === String(id));
  if (!record) return false;

  if (tableName === 'BOOKINGS') return rentalEndedMoreThanOneDayAgo(record.end_date);
  if (tableName === 'EMERGENCY_ALERTS') {
    const rentalEnds = (data.BOOKINGS || [])
      .filter((booking) => String(booking.vehicle_id) === String(record.vehicle_id))
      .map((booking) => new Date(booking.end_date).getTime())
      .filter(Number.isFinite);
    return rentalEnds.length > 0
      && rentalEndedMoreThanOneDayAgo(Math.max(...rentalEnds));
  }
  return true;
}

export function deleteDemoRecord(tableName, id) {
  if (!canDeleteDemoRecord(tableName, id)) return false;
  const data = readStore();
  const idField = ID_FIELDS[tableName];
  const rows = data[tableName] || [];
  const remaining = rows.filter((row) => String(row[idField]) !== String(id));
  if (remaining.length === rows.length) return false;
  writeStore({ ...data, [tableName]: remaining });
  notifyChange();
  return true;
}

export function resetDemoData() {
  memoryData = createSeedData();
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // The seeded in-memory copy is enough for this page session.
  }
  notifyChange();
}
