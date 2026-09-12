require('dotenv').config({ path: '.env.server' });
const http = require('http');

const port = Number(process.env.PORT || 4000);
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY?.trim();

function jsonResponse(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

function supabaseHeaders(accept = 'application/json') {
  return {
    Accept: accept,
    apikey: supabaseSecretKey,
    Authorization: `Bearer ${supabaseSecretKey}`,
  };
}

async function loadTables() {
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('Configure SUPABASE_URL and SUPABASE_SECRET_KEY in .env.server.');
  }

  const schemaResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: supabaseHeaders('application/openapi+json'),
  });

  if (!schemaResponse.ok) {
    throw new Error(`Supabase schema request failed (${schemaResponse.status}).`);
  }

  const schema = await schemaResponse.json();
  const names = Object.keys(schema.paths || {})
    .map((path) => path.replace(/^\//, ''))
    .filter((name) => name && !name.startsWith('rpc/'));

  return Promise.all(names.map(async (name) => {
    const tableResponse = await fetch(
      `${supabaseUrl}/rest/v1/${encodeURIComponent(name)}?select=*&limit=100`,
      { headers: supabaseHeaders() },
    );

    if (!tableResponse.ok) {
      return { name, rows: [], error: `Unable to read this table (${tableResponse.status}).` };
    }

    return { name, rows: await tableResponse.json(), error: null };
  }));
}

async function queryVehicles(searchParams) {
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('Configure SUPABASE_URL and SUPABASE_SECRET_KEY in .env.server.');
  }

  const query = new URLSearchParams({ select: '*', limit: '100' });
  const column = searchParams.get('column')?.trim();
  const value = searchParams.get('value');

  if ((column && value === null) || (!column && value !== null)) {
    throw new Error('Provide both column and value, or leave both blank.');
  }

  if (column) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(column)) {
      throw new Error('Column names may contain only letters, numbers, and underscores.');
    }

    query.set(column, `eq.${value}`);
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/VEHICLE?${query.toString()}`,
    { headers: supabaseHeaders() },
  );

  if (!response.ok) {
    throw new Error(`VEHICLE query failed (${response.status}).`);
  }

  return response.json();
}

const server = http.createServer(async (request, response) => {
  if (request.method !== 'GET') {
    jsonResponse(response, 405, { message: 'Method not allowed.' });
    return;
  }

  if (request.url === '/api/health') {
    try {
      await loadTables();
      jsonResponse(response, 200, { status: 'connected', message: 'Supabase is reachable.' });
    } catch (error) {
      jsonResponse(response, 502, { status: 'error', message: error.message });
    }
    return;
  }

  if (request.url === '/api/tables') {
    try {
      const tables = await loadTables();
      jsonResponse(response, 200, { status: 'loaded', tables, message: `${tables.length} tables loaded.` });
    } catch (error) {
      jsonResponse(response, 502, { status: 'error', tables: [], message: error.message });
    }
    return;
  }

  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  if (requestUrl.pathname === '/api/vehicle') {
    try {
      const rows = await queryVehicles(requestUrl.searchParams);
      jsonResponse(response, 200, { status: 'loaded', rows, message: `${rows.length} vehicle rows loaded.` });
    } catch (error) {
      jsonResponse(response, 502, { status: 'error', rows: [], message: error.message });
    }
    return;
  }

  jsonResponse(response, 404, { message: 'Not found.' });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the existing proxy or run with a different PORT.`);
    process.exitCode = 1;
    return;
  }

  throw error;
});

server.listen(port, () => {
  console.log(`Database proxy listening on http://localhost:${port}`);
});
