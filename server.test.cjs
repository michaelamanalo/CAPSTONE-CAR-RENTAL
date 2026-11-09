const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createApiServer } = require('./server');

const AUTH_ID = '123e4567-e89b-42d3-a456-426614174000';
const PROFILE_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
let server;
let baseUrl;
let role = 'admin';
let accountActive = true;
let profileCount = 1;
let telemetryRows = [];
let capturedBookingParams;
let capturedProfileParams;
let capturedTelemetryParams;
let capturedVehicleParams;
let capturedAlertParams;
let capturedPostgrestHeaders;
let upstreamFailure = false;
let emptyResources = false;

function response(status, data) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

async function mockFetch(url, options = {}) {
  const parsed = new URL(url);
  if (parsed.pathname.startsWith('/rest/v1/')) capturedPostgrestHeaders = options.headers;
  if (parsed.pathname.endsWith('/auth/v1/user')) {
    if (['Bearer invalid', 'Bearer expired'].includes(options.headers.Authorization)) return response(401, {});
    if (!options.headers.Authorization?.startsWith('Bearer ')) return response(401, {});
    const email = options.headers.Authorization === 'Bearer changed-email' ? 'new-address@example.com' : 'staff@example.com';
    return response(200, {
      id: AUTH_ID,
      email,
      email_confirmed_at: '2026-01-01T00:00:00Z',
    });
  }
  if (parsed.pathname.endsWith('/rest/v1/USERS')) {
    capturedProfileParams = parsed.searchParams;
    if (upstreamFailure) return response(500, { message: 'sensitive database detail' });
    if (!parsed.searchParams.has('auth_user_id')) {
      return response(200, emptyResources ? [] : [{ user_id: PROFILE_ID, name: 'Staff Example', email: 'staff@example.com', phone_number: '555-0100', role: 'staff' }]);
    }
    if (parsed.searchParams.get('auth_user_id') !== `eq.${AUTH_ID}`) return response(200, []);
    return response(200, Array.from({ length: profileCount }, () => ({ user_id: PROFILE_ID, auth_user_id: AUTH_ID, role, is_active: accountActive })));
  }
  if (parsed.pathname.endsWith('/rest/v1/VEHICLE')) {
    capturedVehicleParams = parsed.searchParams;
    if (emptyResources && parsed.searchParams.get('select') !== 'vehicle_id') return response(200, []);
    if (parsed.searchParams.get('select') === 'vehicle_id') {
      return response(200, emptyResources ? [] : [{ vehicle_id: 'vehicle-1' }, { vehicle_id: 'vehicle-2' }]);
    }
    return response(200, [{
      vehicle_id: 'vehicle-1', brand: 'Honda', model_name: 'Civic', plate_number: 'ABC',
      vehicle_type: 'Sedan', rental_rate_per_day: 1000, status: 'Available',
      tracker_device_id: 't1', model_year: 2024, description: 'Test vehicle', image_url: '/car.png',
      is_active: true, updated_at: '2026-01-01T00:00:00Z', secret_column: 'hidden',
    }]);
  }
  if (parsed.pathname.endsWith('/rest/v1/BOOKINGS')) {
    capturedBookingParams = parsed.searchParams;
    if (emptyResources) return response(200, []);
    const rows = [{
      booking_id: 'booking-1', customer_id: PROFILE_ID, vehicle_id: 'vehicle-1',
      booking_status: 'Pending', start_date: '2026-01-01', end_date: '2026-01-02',
      total_amount: 2000, created_at: '2026-01-01T00:00:00Z', private_note: 'hidden',
    }, {
      booking_id: 'booking-2', customer_id: 'other-profile', vehicle_id: 'vehicle-2',
      booking_status: 'Approved', start_date: '2026-02-01', end_date: '2026-02-02',
      total_amount: 3000, created_at: '2026-02-01T00:00:00Z',
    }];
    const customerFilter = parsed.searchParams.get('customer_id');
    return response(200, customerFilter ? rows.filter((row) => customerFilter === `eq.${row.customer_id}`) : rows);
  }
  if (parsed.pathname.endsWith('/rest/v1/TELEMETRY_LOGS')) {
    capturedTelemetryParams = parsed.searchParams;
    const vehicleId = (parsed.searchParams.get('vehicle_id') || '').replace('eq.', '');
    return response(200, telemetryRows.filter((row) => row.vehicle_id === vehicleId));
  }
  if (parsed.pathname.endsWith('/rest/v1/EMERGENCY_ALERTS')) {
    capturedAlertParams = parsed.searchParams;
    if (emptyResources) return response(200, []);
    return response(200, [{
      alert_id: 'alert-1', booking_id: 'booking-1', vehicle_id: 'vehicle-1', alert_type: 'collision',
      latitude: 14.1, longitude: 121.1, severity_g_force: 2.5, status: 'acknowledged',
      timestamp: '2026-01-01T00:00:00Z', reported_by: PROFILE_ID, acknowledged_by: PROFILE_ID,
      acknowledged_at: '2026-01-01T00:01:00Z', resolved_at: null, description: 'Impact detected',
      resolution_notes: null, updated_at: '2026-01-01T00:01:00Z', secret_column: 'hidden',
    }]);
  }
  return response(404, {});
}

before(async () => {
  role = 'admin';
  accountActive = true;
  profileCount = 1;
  telemetryRows = [];
  upstreamFailure = false;
  emptyResources = false;
  server = createApiServer({
    env: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'public-key' },
    fetchImpl: mockFetch,
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => new Promise((resolve) => server.close(resolve)));

async function get(path, token = 'valid') {
  return fetch(`${baseUrl}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
}

test('public health returns minimal structured status', async () => {
  const res = await get('/api/health', null);
  assert.equal(res.status, 200);
  assert.deepEqual((await res.json()).data, { status: 'ok' });
});

test('every protected endpoint rejects an anonymous request', async () => {
  for (const path of ['/api/session', '/api/vehicles', '/api/bookings', '/api/fleet/locations', '/api/alerts', '/api/staff']) {
    assert.equal((await get(path, null)).status, 401, path);
  }
});

test('admin endpoint contracts return correctly shaped successful responses', async () => {
  const session = await get('/api/session');
  assert.equal(session.status, 200);
  assert.deepEqual((await session.json()).data, { role: 'admin' });
  for (const path of ['/api/vehicles', '/api/bookings', '/api/fleet/locations', '/api/alerts', '/api/staff']) {
    const result = await get(path);
    assert.equal(result.status, 200, path);
    assert.equal((await result.json()).success, true, path);
  }
});

test('empty database tables return successful empty arrays and locations stay null without telemetry', async () => {
  emptyResources = true;
  for (const path of ['/api/vehicles', '/api/bookings', '/api/alerts', '/api/staff', '/api/fleet/locations']) {
    const result = await get(path);
    assert.equal(result.status, 200, path);
    assert.deepEqual((await result.json()).data, [], path);
  }
  emptyResources = false;
});

test('missing and invalid bearer tokens return 401', async () => {
  assert.equal((await get('/api/vehicles', null)).status, 401);
  assert.equal((await get('/api/vehicles', 'invalid')).status, 401);
});

test('profile lookup uses durable Auth UUID linkage and preserves the USERS primary key', async () => {
  const res = await get('/api/session');
  assert.equal(res.status, 200);
  assert.notEqual(AUTH_ID, PROFILE_ID);
  assert.equal(capturedProfileParams.get('auth_user_id'), `eq.${AUTH_ID}`);
  assert.equal(capturedProfileParams.has('email'), false);
  assert.equal(capturedProfileParams.has('user_id'), false);
  assert.equal(capturedProfileParams.get('select'), 'user_id,auth_user_id,role,is_active');
  assert.equal(capturedPostgrestHeaders.apikey, 'public-key');
  assert.equal(capturedPostgrestHeaders.Authorization, 'Bearer valid');
});

test('expired tokens are rejected', async () => {
  assert.equal((await get('/api/session', 'expired')).status, 401);
});

test('email changes do not break a securely linked Auth identity', async () => {
  const res = await get('/api/session', 'changed-email');
  assert.equal(res.status, 200);
  assert.equal(capturedProfileParams.get('auth_user_id'), `eq.${AUTH_ID}`);
});

test('unlinked Auth identities are denied', async () => {
  profileCount = 0;
  assert.equal((await get('/api/session')).status, 403);
  profileCount = 1;
});

test('duplicate Auth identity links are denied', async () => {
  profileCount = 2;
  assert.equal((await get('/api/session')).status, 403);
  profileCount = 1;
});

test('admin and staff can read explicitly projected vehicle data', async () => {
  const adminResponse = await get('/api/vehicles');
  assert.equal(adminResponse.status, 200);
  const body = await adminResponse.json();
  assert.equal(body.data[0].vehicle_id, 'vehicle-1');
  assert.equal(capturedVehicleParams.get('select'), 'vehicle_id,plate_number,model_name,brand,vehicle_type,rental_rate_per_day,status,tracker_device_id,model_year,description,image_url,is_active,updated_at');
  assert.equal(body.data[0].model_year, 2024);
  assert.equal('secret_column' in body.data[0], false);
  role = 'staff';
  assert.equal((await get('/api/vehicles')).status, 200);
  role = 'admin';
});

test('alerts query and response match documented EMERGENCY_ALERTS columns', async () => {
  const res = await get('/api/alerts');
  assert.equal(res.status, 200);
  assert.equal(capturedAlertParams.get('select'), 'alert_id,booking_id,vehicle_id,alert_type,latitude,longitude,severity_g_force,status,timestamp,reported_by,acknowledged_by,acknowledged_at,resolved_at,description,resolution_notes,updated_at');
  assert.equal(capturedAlertParams.get('order'), 'timestamp.desc');
  const alert = (await res.json()).data[0];
  assert.equal(alert.alert_id, 'alert-1');
  assert.equal(alert.latitude, 14.1);
  assert.equal(alert.description, 'Impact detected');
  assert.equal('secret_column' in alert, false);
});

test('customer and disabled profiles cannot read administrative resources', async () => {
  role = 'customer';
  assert.equal((await get('/api/vehicles')).status, 403);
  role = 'admin';
  accountActive = false;
  assert.equal((await get('/api/vehicles')).status, 403);
  accountActive = true;
});

test('customers receive only their own bookings and cannot read fleet data', async () => {
  role = 'customer';
  assert.equal((await get('/api/session?role=admin')).status, 200);
  const response = await get('/api/bookings');
  assert.equal(response.status, 200);
  assert.equal(capturedBookingParams.get('customer_id'), `eq.${PROFILE_ID}`);
  const rows = (await response.json()).data;
  assert.deepEqual(rows.map((row) => row.booking_id), ['booking-1']);
  assert.equal((await get('/api/vehicles')).status, 403);
  assert.equal((await get('/api/fleet/locations')).status, 403);
  assert.equal((await get('/api/alerts')).status, 403);
  assert.equal((await get('/api/staff')).status, 403);
  assert.equal((await get('/api/vehicles?role=admin')).status, 403);
  role = 'admin';
});

test('staff can access permitted operational records and permitted staff profiles', async () => {
  role = 'staff';
  assert.equal((await get('/api/alerts')).status, 200);
  assert.equal((await get('/api/bookings')).status, 200);
  assert.equal((await get('/api/fleet/locations')).status, 200);
  assert.equal((await get('/api/vehicles')).status, 200);
  const staffResponse = await get('/api/staff');
  assert.equal(staffResponse.status, 200);
  assert.deepEqual((await staffResponse.json()).data.map((profile) => profile.role), ['staff']);
  role = 'admin';
});

test('database failures return generic errors without exposing upstream details', async () => {
  upstreamFailure = true;
  const response = await get('/api/session');
  assert.equal(response.status, 502);
  assert.equal((await response.text()).includes('sensitive database detail'), false);
  upstreamFailure = false;
});

test('booking query and response match documented BOOKINGS columns', async () => {
  const res = await get('/api/bookings?limit=20&offset=40&status=Pending');
  assert.equal(res.status, 200);
  assert.equal(capturedBookingParams.get('select'), 'booking_id,customer_id,vehicle_id,start_date,end_date,total_amount,booking_status,created_at');
  assert.equal(capturedBookingParams.get('limit'), '20');
  assert.equal(capturedBookingParams.get('offset'), '40');
  assert.equal(capturedBookingParams.get('booking_status'), 'eq.Pending');
  const booking = (await res.json()).data[0];
  assert.equal(booking.customer_id, PROFILE_ID);
  assert.equal(booking.total_amount, 2000);
  assert.equal('user_id' in booking, false);
  assert.equal('private_note' in booking, false);
});

test('invalid booking pagination and enum values return 400', async () => {
  assert.equal((await get('/api/bookings?limit=1000')).status, 400);
  assert.equal((await get('/api/bookings?status=not-valid')).status, 400);
});

test('fleet locations query documented telemetry columns by vehicle_id and retain empty vehicles', async () => {
  telemetryRows = [{
    log_id: 'log-1', vehicle_id: 'vehicle-1', latitude: 14.1, longitude: 121.1, speed: 5,
    timestamp: '2026-01-01T00:00:00Z', received_at: '2026-01-01T00:00:01Z', private_note: 'hidden',
  }];
  const body = await (await get('/api/fleet/locations')).json();
  assert.equal(capturedTelemetryParams.get('select'), 'vehicle_id,latitude,longitude,speed,timestamp');
  assert.equal(capturedTelemetryParams.get('vehicle_id'), 'eq.vehicle-2');
  assert.equal(capturedTelemetryParams.get('order'), 'timestamp.desc');
  assert.equal(capturedTelemetryParams.get('timestamp'), 'not.is.null');
  assert.equal(body.data.length, 2);
  assert.equal(body.data[0].telemetry.timestamp, '2026-01-01T00:00:00Z');
  assert.equal(body.data[0].telemetry.latitude, 14.1);
  assert.equal(body.data[0].telemetry.longitude, 121.1);
  assert.equal(body.data[1].telemetry, null);
  assert.equal('private_note' in body.data[0].telemetry, false);
});

test('legacy unrestricted endpoints are not exposed', async () => {
  assert.equal((await get('/api/tables')).status, 404);
  assert.equal((await get('/api/vehicle')).status, 404);
});

test('identity migration is additive, preserves primary IDs, and rejects duplicate links', () => {
  const migration = fs.readFileSync(path.join(__dirname, 'supabase/migrations/202611090001_users_auth_uuid_link.sql'), 'utf8');
  assert.match(migration, /ADD COLUMN IF NOT EXISTS auth_user_id uuid/i);
  assert.match(migration, /CREATE UNIQUE INDEX IF NOT EXISTS\s+users_auth_user_id_unique/i);
  assert.match(migration, /WHERE auth_user_id IS NOT NULL/i);
  assert.match(migration, /REFERENCES auth\.users\s*\(id\)\s*NOT VALID/i);
  assert.match(migration, /Duplicate auth_user_id values detected/i);
  assert.doesNotMatch(migration, /UPDATE\s+public\."USERS"\s+SET\s+user_id/i);
});

test('RLS proposal uses linked identity, denies public table access, and scopes customer bookings', () => {
  const migration = fs.readFileSync(path.join(__dirname, 'supabase/migrations/202611090002_reviewed_rls_role_policies.sql'), 'utf8');
  assert.equal((migration.match(/ENABLE ROW LEVEL SECURITY;/g) || []).length, 14);
  assert.match(migration, /SECURITY DEFINER[\s\S]*?SET search_path = pg_catalog, public[\s\S]*?SET row_security = off/i);
  assert.match(migration, /FROM PUBLIC, anon, authenticated/i);
  assert.match(migration, /customer_id = \(SELECT public\.gfleet_current_user_profile_id\(\)\)/i);
  assert.match(migration, /gfleet_telemetry_select_staff[\s\S]*?IN \('admin', 'staff'\)/i);
  assert.match(migration, /inspect\/reconcile existing permissive policies/i);
  assert.doesNotMatch(migration, /USING\s*\(\s*true\s*\)/i);
  assert.doesNotMatch(migration, /GRANT\s+(?:INSERT|UPDATE)[^;]*ON public\."BOOKINGS"/i);
});

test('core read RLS migration protects every Phase 1 table and grants no client writes', () => {
  const migration = fs.readFileSync(path.join(__dirname, 'supabase/migrations/202611090003_core_read_rls.sql'), 'utf8');
  for (const table of ['USERS', 'VEHICLE', 'BOOKINGS', 'TELEMETRY_LOGS', 'EMERGENCY_ALERTS']) {
    assert.match(migration, new RegExp(`ALTER TABLE public\\."${table}"[\\s\\S]*?ENABLE ROW LEVEL SECURITY`, 'i'));
  }
  assert.match(migration, /customer_id\s*=\s*\([\s\S]*?gfleet_current_user_profile_id\(\)/i);
  assert.match(migration, /role::text IN \('admin', 'staff'\)/i);
  assert.doesNotMatch(migration, /GRANT\s+(?:INSERT|UPDATE|DELETE)[^;]*TO\s+authenticated/i);
});
