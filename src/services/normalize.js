/*
  Real Supabase rows may use different casing/naming than what the UI
  expects (e.g. plate_number vs plate). `pick` tries a list of candidate
  column names — exact match first, then case-insensitive — so pages
  don't break the moment a column name doesn't match a guess exactly.
  Tighten these candidate lists once you know your real schema.
*/
export function pick(row, candidates, fallback) {
  if (!row) return fallback;
  for (const key of candidates) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') return row[key];
  }
  const lower = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]));
  for (const key of candidates) {
    const v = lower[key.toLowerCase()];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return fallback;
}

export function numOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizeVehicle(row) {
  const brand = pick(row, ['brand'], '');
  const modelName = pick(row, ['model_name', 'model'], 'Unnamed vehicle');
  return {
    id: pick(row, ['vehicle_id', 'id'], '—'),
    model: [brand, modelName].filter(Boolean).join(' ') || modelName,
    plate: pick(row, ['plate_number', 'plate'], '—'),
    vehicleType: pick(row, ['vehicle_type'], '—'),
    rate: numOrNull(pick(row, ['rental_rate_per_day'], null)),
    status: pick(row, ['status'], 'Available'),
    trackerDeviceId: pick(row, ['tracker_device_id'], null),
    // Live position isn't stored on VEHICLE — it comes from the latest
    // matching TELEMETRY_LOGS row. Dashboard.jsx fills these in after
    // fetching both tables; they default to "no data yet" here.
    speed: 0,
    lat: null,
    lng: null,
    lastUpdate: '—',
  };
}

// VEHICLE.status uses your own vocabulary (Available/Rented/Maintainance),
// not a generic active/idle/offline set. This maps real values to a
// {tone, label} pair so the UI's color-coding still makes sense. Add more
// cases here if new status values show up.
export function vehicleStatusMeta(rawStatus) {
  const key = (rawStatus || '').trim().toLowerCase();
  if (key === 'available') return { tone: 'active', label: 'Available' };
  if (key === 'rented') return { tone: 'idle', label: 'Rented' };
  if (key.startsWith('maint')) return { tone: 'offline', label: 'Maintenance' };
  return { tone: 'offline', label: rawStatus || 'Unknown' };
}

export function normalizeTelemetry(row) {
  return {
    trackerDeviceId: pick(row, ['tracker_device_id', 'device_id'], null),
    lat: numOrNull(pick(row, ['lat', 'latitude'], null)),
    lng: numOrNull(pick(row, ['lng', 'longitude'], null)),
    speed: numOrNull(pick(row, ['speed'], 0)) ?? 0,
    recordedAt: pick(row, ['recorded_at', 'timestamp', 'created_at'], null),
  };
}

export function normalizeBooking(row) {
  return {
    id: pick(row, ['id', 'booking_id'], '—'),
    customer: pick(row, ['customer', 'customer_name', 'user_name'], 'Unknown customer'),
    vehicleId: pick(row, ['vehicle_id', 'vehicleId'], '—'),
    vehicle: pick(row, ['vehicle', 'vehicle_model'], ''),
    start: pick(row, ['start', 'start_date', 'rental_start'], '—'),
    end: pick(row, ['end', 'end_date', 'rental_end'], '—'),
    status: pick(row, ['status'], 'pending'),
  };
}

export function normalizeAlert(row) {
  return {
    id: pick(row, ['id', 'alert_id'], '—'),
    vehicleId: pick(row, ['vehicle_id', 'vehicleId'], '—'),
    type: pick(row, ['type', 'alert_type'], 'geofence'),
    message: pick(row, ['message', 'description'], 'No description provided.'),
    time: pick(row, ['time', 'created_at', 'timestamp'], '—'),
    location: pick(row, ['location', 'address'], '—'),
    acknowledged: Boolean(pick(row, ['acknowledged', 'resolved'], false)),
  };
}

export function normalizeUser(row) {
  return {
    id: pick(row, ['user_id', 'id'], '—'),
    name: pick(row, ['name'], 'Unnamed user'),
    email: pick(row, ['email'], '—'),
    phone: pick(row, ['phone_number', 'phone'], '—'),
    role: pick(row, ['role'], 'customer'),
  };
}

export function normalizeLog(row) {
  return {
    id: pick(row, ['id', 'log_id'], Math.random().toString(36)),
    time: pick(row, ['time', 'created_at', 'timestamp'], '—'),
    text: pick(row, ['text', 'description', 'message'], 'No description.'),
  };
}
