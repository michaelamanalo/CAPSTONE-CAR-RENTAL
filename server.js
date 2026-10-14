require('dotenv').config({ path: '.env.server' });
const http = require('http');

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || '127.0.0.1';
const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY?.trim();
const allowedRoles = new Set(['admin', 'staff']);

const tableColumns = {
  VEHICLE: [
    'vehicle_id', 'id', 'brand', 'model_name', 'model', 'plate_number', 'plate',
    'vehicle_type', 'rental_rate_per_day', 'status', 'tracker_device_id',
  ],
  TELEMETRY_LOGS: [
    'tracker_device_id', 'device_id', 'lat', 'latitude', 'lng', 'longitude',
    'speed', 'recorded_at', 'timestamp', 'created_at',
  ],
  BOOKINGS: [
    'id', 'booking_id', 'customer', 'customer_name', 'user_name', 'vehicle_id',
    'vehicleId', 'vehicle', 'vehicle_model', 'start', 'start_date', 'rental_start',
    'end', 'end_date', 'rental_end', 'status',
  ],
  EMERGENCY_ALERTS: [
    'id', 'alert_id', 'vehicle_id', 'vehicleId', 'type', 'alert_type', 'message',
    'description', 'time', 'created_at', 'timestamp', 'location', 'address',
    'acknowledged', 'resolved',
  ],
  USERS: ['user_id', 'id', 'name', 'email', 'phone_number', 'phone', 'role'],
};
const vehicleQueryColumns = new Map(tableColumns.VEHICLE.map((column) => [column.toLowerCase(), column]));

function jsonResponse(response, status, body) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

function serviceHeaders(accept = 'application/json') {
  return {
    Accept: accept,
    apikey: supabaseSecretKey,
    Authorization: `Bearer ${supabaseSecretKey}`,
  };
}

function projectRows(rows, columns) {
  const allowedColumns = new Set(columns.map((column) => column.toLowerCase()));
  return rows.map((row) => Object.fromEntries(
    Object.entries(row).filter(([column]) => allowedColumns.has(column.toLowerCase())),
  ));
}

function accessResult(status, httpStatus, message, role) {
  return { status, httpStatus, message, role };
}

async function verifyDashboardAccess(request) {
  const token = request.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) {
    return accessResult('unauthorized', 401, 'Sign in to access dashboard data.');
  }

  if (!supabaseUrl || !supabaseAnonKey || !supabaseSecretKey) {
    return accessResult('error', 503, 'Configure Supabase in .env.server before signing in.');
  }

  let userResponse;
  try {
    userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    return accessResult('error', 503, 'Supabase Auth is temporarily unavailable.');
  }

  if (!userResponse.ok) {
    const status = userResponse.status >= 500 ? 503 : 401;
    return accessResult(status === 401 ? 'unauthorized' : 'error', status, status === 401
      ? 'Your session is invalid or expired. Sign in again.'
      : 'Supabase Auth is temporarily unavailable.');
  }

  let user;
  try {
    user = await userResponse.json();
  } catch {
    return accessResult('error', 503, 'Supabase Auth returned an invalid response.');
  }

  if (!user?.email) {
    return accessResult('unauthorized', 401, 'Your Supabase account has no email address.');
  }

  const profileQuery = new URLSearchParams({
    select: 'role',
    email: `eq.${user.email.trim().toLowerCase()}`,
    limit: '1',
  });
  let profileResponse;
  try {
    profileResponse = await fetch(`${supabaseUrl}/rest/v1/USERS?${profileQuery}`, {
      headers: serviceHeaders(),
    });
  } catch {
    return accessResult('error', 503, 'Dashboard access could not be verified.');
  }

  if (!profileResponse.ok) {
    return accessResult('error', 503, 'Dashboard access could not be verified.');
  }

  let profiles;
  try {
    profiles = await profileResponse.json();
  } catch {
    return accessResult('error', 503, 'Dashboard access could not be verified.');
  }

  const role = String(profiles?.[0]?.role || '').trim().toLowerCase();
  if (!allowedRoles.has(role)) {
    return accessResult('forbidden', 403, 'This account does not have dashboard access.');
  }

  return accessResult('authorized', 200, '', role);
}

function sendAccessFailure(response, access) {
  jsonResponse(response, access.httpStatus, { status: access.status, message: access.message });
}

function requireSupabaseConfig() {
  if (!supabaseUrl || !supabaseSecretKey) {
    const error = new Error('Configure SUPABASE_URL and SUPABASE_SECRET_KEY in .env.server.');
    error.httpStatus = 503;
    throw error;
  }
}

async function loadTables() {
  requireSupabaseConfig();

  return Promise.all(Object.entries(tableColumns).map(async ([name, columns]) => {
    let response;
    try {
      response = await fetch(
        `${supabaseUrl}/rest/v1/${encodeURIComponent(name)}?select=*&limit=100`,
        { headers: serviceHeaders() },
      );
    } catch {
      return { name, rows: [], error: 'Supabase could not be reached.' };
    }

    if (!response.ok) {
      return { name, rows: [], error: `Unable to read this table (${response.status}).` };
    }

    try {
      return { name, rows: projectRows(await response.json(), columns), error: null };
    } catch {
      return { name, rows: [], error: 'Supabase returned an invalid table response.' };
    }
  }));
}

function badRequest(message) {
  const error = new Error(message);
  error.httpStatus = 400;
  return error;
}

async function queryVehicles(searchParams) {
  requireSupabaseConfig();

  const query = new URLSearchParams({ select: '*', limit: '100' });
  const requestedColumn = searchParams.get('column')?.trim();
  const value = searchParams.get('value');

  if ((requestedColumn && value === null) || (!requestedColumn && value !== null)) {
    throw badRequest('Provide both column and value, or leave both blank.');
  }

  if (requestedColumn) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(requestedColumn)) {
      throw badRequest('Column names may contain only letters, numbers, and underscores.');
    }

    const column = vehicleQueryColumns.get(requestedColumn.toLowerCase());
    if (!column) throw badRequest('That vehicle column cannot be queried.');
    query.set(column, `eq.${value}`);
  }

  let response;
  try {
    response = await fetch(`${supabaseUrl}/rest/v1/VEHICLE?${query.toString()}`, {
      headers: serviceHeaders(),
    });
  } catch {
    const error = new Error('Supabase could not be reached.');
    error.httpStatus = 502;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(`VEHICLE query failed (${response.status}).`);
    error.httpStatus = 502;
    throw error;
  }

  return projectRows(await response.json(), tableColumns.VEHICLE);
}

const server = http.createServer(async (request, response) => {
  if (request.method !== 'GET') {
    jsonResponse(response, 405, { status: 'error', message: 'Method not allowed.' });
    return;
  }

  const requestUrl = new URL(request.url, 'http://127.0.0.1');
  if (requestUrl.pathname === '/api/health') {
    jsonResponse(response, 200, { status: 'ready' });
    return;
  }

  if (requestUrl.pathname === '/api/session'
    || requestUrl.pathname === '/api/tables'
    || requestUrl.pathname === '/api/vehicle') {
    const access = await verifyDashboardAccess(request);
    if (access.status !== 'authorized') {
      sendAccessFailure(response, access);
      return;
    }

    if (requestUrl.pathname === '/api/session') {
      jsonResponse(response, 200, { status: 'authorized', role: access.role });
      return;
    }

    try {
      if (requestUrl.pathname === '/api/tables') {
        const tables = await loadTables();
        jsonResponse(response, 200, {
          status: 'loaded',
          tables,
          message: `${tables.length} tables loaded.`,
        });
        return;
      }

      const rows = await queryVehicles(requestUrl.searchParams);
      jsonResponse(response, 200, { status: 'loaded', rows, message: `${rows.length} vehicle rows loaded.` });
    } catch (error) {
      jsonResponse(response, error.httpStatus || 502, {
        status: 'error',
        tables: [],
        rows: [],
        message: error.httpStatus === 400 || error.httpStatus === 503
          ? error.message
          : 'Supabase request failed.',
      });
    }
    return;
  }

  jsonResponse(response, 404, { status: 'error', message: 'Not found.' });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the existing proxy or run with a different PORT.`);
    process.exitCode = 1;
    return;
  }

  throw error;
});

server.listen(port, host, () => {
  console.log(`Database proxy listening on http://${host}:${port}`);
});
