export async function ping() {
  return requestJson('/api/health');
}

export async function getDatabaseTables() {
  return requestJson('/api/tables');
}

export async function queryVehicles(column, value) {
  const params = new URLSearchParams();
  if (column) params.set('column', column);
  if (value !== '') params.set('value', value);
  return requestJson(`/api/vehicle?${params.toString()}`);
}

async function requestJson(path) {
  try {
    const response = await fetch(path);
    const body = await response.json();
    return response.ok ? body : { status: 'error', tables: [], message: body.message || `Request failed (${response.status}).` };
  } catch {
    return { status: 'error', tables: [], message: 'Database proxy is not running. Start it with npm run server.' };
  }
}
