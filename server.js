const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.server') });

const ADMIN_ROLES = new Set(['admin', 'staff']);
const VEHICLE_FIELDS = 'vehicle_id,plate_number,model_name,brand,vehicle_type,rental_rate_per_day,status,tracker_device_id,model_year,description,image_url,is_active,updated_at';
const VEHICLE_RESPONSE_FIELDS = new Set(VEHICLE_FIELDS.split(','));
const BOOKING_FIELDS = 'booking_id,customer_id,vehicle_id,start_date,end_date,total_amount,booking_status,created_at';
const BOOKING_RESPONSE_FIELDS = new Set(BOOKING_FIELDS.split(','));
const ALERT_FIELDS = 'alert_id,booking_id,vehicle_id,alert_type,latitude,longitude,severity_g_force,status,timestamp,reported_by,acknowledged_by,acknowledged_at,resolved_at,description,resolution_notes,updated_at';
const ALERT_RESPONSE_FIELDS = new Set(ALERT_FIELDS.split(','));
const TELEMETRY_RESPONSE_FIELDS = new Set(['vehicle_id', 'latitude', 'longitude', 'speed', 'timestamp']);

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function json(response, status, body) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

function success(data, meta = {}) {
  return { success: true, data, meta };
}

function failure(error) {
  const status = error instanceof ApiError ? error.status : 502;
  const code = error instanceof ApiError ? error.code : 'UPSTREAM_FAILURE';
  const message = error instanceof ApiError
    ? error.message
    : 'The requested data is temporarily unavailable.';
  return { status, body: { success: false, error: { code, message } } };
}

function pickFields(row, allowed) {
  return Object.fromEntries(Object.entries(row || {}).filter(([key]) => allowed.has(key)));
}

function validatePage(url) {
  const rawLimit = url.searchParams.get('limit') || '50';
  const rawOffset = url.searchParams.get('offset') || '0';
  if (!/^\d+$/.test(rawLimit) || !/^\d+$/.test(rawOffset)) {
    throw new ApiError(400, 'INVALID_QUERY', 'Limit and offset must be non-negative integers.');
  }
  const limit = Number(rawLimit);
  const offset = Number(rawOffset);
  if (limit < 1 || limit > 100 || !Number.isSafeInteger(offset)) {
    throw new ApiError(400, 'INVALID_QUERY', 'Limit must be between 1 and 100 and offset must be a safe integer.');
  }
  return { limit, offset };
}

function createApiServer({ env = process.env, fetchImpl = fetch } = {}) {
  const supabaseUrl = env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const anonKey = (env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || '').trim();

  function requireConfig() {
    if (!supabaseUrl || !anonKey) {
      throw new ApiError(503, 'SERVICE_UNAVAILABLE', 'The API is not configured for Supabase access.');
    }
  }

  async function rest(pathname, params, accessToken) {
    requireConfig();
    let response;
    try {
      response = await fetchImpl(`${supabaseUrl}/rest/v1/${pathname}?${params}`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });
    } catch {
      throw new ApiError(502, 'UPSTREAM_FAILURE', 'The requested data is temporarily unavailable.');
    }
    if (!response.ok) throw new ApiError(502, 'UPSTREAM_FAILURE', 'The requested data is temporarily unavailable.');
    try { return await response.json(); } catch {
      throw new ApiError(502, 'UPSTREAM_FAILURE', 'The requested data is temporarily unavailable.');
    }
  }

  async function authenticate(request) {
    const auth = request.headers.authorization || '';
    const match = /^Bearer ([A-Za-z0-9._~-]+)$/i.exec(auth);
    if (!match) throw new ApiError(401, 'UNAUTHENTICATED', 'A valid bearer access token is required.');
    requireConfig();
    let response;
    try {
      response = await fetchImpl(supabaseUrl + '/auth/v1/user', {
        headers: { apikey: anonKey, Authorization: 'Bearer ' + match[1] },
      });
    } catch {
      throw new ApiError(503, 'AUTH_UNAVAILABLE', 'Authentication could not be verified.');
    }
    if (response.status === 401 || response.status === 403) {
      throw new ApiError(401, 'UNAUTHENTICATED', 'The access token is invalid or expired.');
    }
    if (!response.ok) throw new ApiError(503, 'AUTH_UNAVAILABLE', 'Authentication could not be verified.');
    let authUser;
    try { authUser = await response.json(); } catch {
      throw new ApiError(503, 'AUTH_UNAVAILABLE', 'Authentication could not be verified.');
    }
    if (!authUser?.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(authUser.id)) {
      throw new ApiError(401, 'UNAUTHENTICATED', 'The access token is invalid or expired.');
    }
    const profileParams = new URLSearchParams({
      select: 'user_id,auth_user_id,role,is_active',
      auth_user_id: 'eq.' + authUser.id,
      limit: '2',
    });
    const profiles = await rest('USERS', profileParams.toString(), match[1]);
    if (!Array.isArray(profiles) || profiles.length !== 1
      || String(profiles[0]?.auth_user_id || '').toLowerCase() !== authUser.id.toLowerCase()) {
      throw new ApiError(403, 'FORBIDDEN', 'This account does not have one securely linked profile.');
    }
    const profile = profiles[0];
    if (profile.is_active !== true) {
      throw new ApiError(403, 'FORBIDDEN', 'This account is disabled.');
    }
    const role = String(profile.role || '').trim().toLowerCase();
    if (!['admin', 'staff', 'customer'].includes(role)) {
      throw new ApiError(403, 'FORBIDDEN', 'This account does not have an authorized role.');
    }
    return { id: profile.user_id, authUserId: authUser.id, role, accessToken: match[1] };
  }
  function requireStaff(identity) {
    if (!ADMIN_ROLES.has(identity.role)) throw new ApiError(403, 'FORBIDDEN', 'You do not have permission to access this resource.');
    return identity;
  }

  function requireAdmin(identity) {
    if (identity.role !== 'admin') throw new ApiError(403, 'FORBIDDEN', 'You do not have permission to access this resource.');
    return identity;
  }

  async function rows(table, params, identity) {
    const data = await rest(table, params.toString(), identity.accessToken);
    if (!Array.isArray(data)) throw new ApiError(502, 'UPSTREAM_FAILURE', 'The requested data is temporarily unavailable.');
    return data;
  }

  const server = http.createServer(async (request, response) => {
    if (request.method !== 'GET') {
      const result = failure(new ApiError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed.'));
      json(response, result.status, result.body);
      return;
    }
    const url = new URL(request.url, 'http://localhost');
    try {
      if (url.pathname === '/api/health') {
        json(response, 200, success({ status: 'ok' }));
        return;
      }
      if (url.pathname === '/api/tables' || url.pathname === '/api/vehicle') {
        throw new ApiError(404, 'NOT_FOUND', 'Not found.');
      }
      const identity = await authenticate(request);
      if (url.pathname === '/api/session') {
        json(response, 200, success({ role: identity.role }));
        return;
      }
      if (url.pathname === '/api/bookings') {
        const { limit, offset } = validatePage(url);
        const filterStatus = url.searchParams.get('status');
        const validStatuses = new Set(['Pending', 'Approved', 'Active', 'Completed', 'Cancelled']);
        if (filterStatus && !validStatuses.has(filterStatus)) throw new ApiError(400, 'INVALID_QUERY', 'Status is not a valid booking status.');
        const params = new URLSearchParams({ select: BOOKING_FIELDS, order: 'start_date.desc', limit: String(limit), offset: String(offset) });
        if (filterStatus) params.set('booking_status', `eq.${filterStatus}`);
        if (identity.role === 'customer') params.set('customer_id', `eq.${identity.id}`);
        else requireStaff(identity);
        const data = (await rows('BOOKINGS', params, identity)).map((row) => pickFields(row, BOOKING_RESPONSE_FIELDS));
        json(response, 200, success(data, { limit, offset }));
        return;
      }
      if (url.pathname === '/api/vehicles') {
        requireStaff(identity);
        const { limit, offset } = validatePage(url);
        const params = new URLSearchParams({ select: VEHICLE_FIELDS, order: 'vehicle_id.asc', limit: String(limit), offset: String(offset) });
        const data = (await rows('VEHICLE', params, identity)).map((row) => pickFields(row, VEHICLE_RESPONSE_FIELDS));
        json(response, 200, success(data, { limit, offset }));
        return;
      }
      if (url.pathname === '/api/fleet/locations') {
        requireStaff(identity);
        const vehicleParams = new URLSearchParams({ select: 'vehicle_id', order: 'vehicle_id.asc', limit: '1000' });
        const vehicles = await rows('VEHICLE', vehicleParams, identity);
        const latestByVehicle = await Promise.all(vehicles.map(async ({ vehicle_id }) => {
          if (!vehicle_id) return [vehicle_id, null];
          const params = new URLSearchParams({ select: 'vehicle_id,latitude,longitude,speed,timestamp', vehicle_id: 'eq.' + vehicle_id, order: 'timestamp.desc', timestamp: 'not.is.null', limit: '1' });
          const [point] = await rows('TELEMETRY_LOGS', params, identity);
          return [vehicle_id, point ? pickFields(point, TELEMETRY_RESPONSE_FIELDS) : null];
        }));
        const latest = new Map(latestByVehicle);
        const data = vehicles.map(({ vehicle_id }) => ({ vehicle_id, telemetry: latest.get(vehicle_id) || null }));
        json(response, 200, success(data));
        return;
      }
      if (url.pathname === '/api/alerts') {
        requireStaff(identity);
        const { limit, offset } = validatePage(url);
        const params = new URLSearchParams({ select: ALERT_FIELDS, order: 'timestamp.desc', limit: String(limit), offset: String(offset) });
        const data = (await rows('EMERGENCY_ALERTS', params, identity)).map((row) => pickFields(row, ALERT_RESPONSE_FIELDS));
        json(response, 200, success(data, { limit, offset }));
        return;
      }
      if (url.pathname === '/api/staff') {
        requireStaff(identity);
        const params = new URLSearchParams({ select: 'user_id,name,email,phone_number,role', role: 'in.(admin,staff)', order: 'name.asc', limit: '100' });
        json(response, 200, success(await rows('USERS', params, identity)));
        return;
      }
      throw new ApiError(404, 'NOT_FOUND', 'Not found.');
    } catch (error) {
      const result = failure(error);
      json(response, result.status, result.body);
    }
  });
  return server;
}

if (require.main === module) {
  const server = createApiServer();
  const port = Number(process.env.PORT || 4000);
  const host = process.env.HOST || '127.0.0.1';
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use.`);
      process.exitCode = 1;
      return;
    }
    throw error;
  });
  server.listen(port, host, () => console.log(`G-FLEET API listening on http://${host}:${port}`));
}

module.exports = { createApiServer, validatePage, pickFields };
