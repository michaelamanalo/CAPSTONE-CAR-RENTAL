import { supabase } from './supabaseClient';

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

export function verifyAccess(accessToken) {
  return requestJson('/api/session', accessToken);
}

async function requestJson(path, suppliedToken) {
  try {
    let accessToken = suppliedToken;
    if (accessToken === undefined && supabase) {
      const { data } = await supabase.auth.getSession();
      accessToken = data.session?.access_token;
    }

    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    const response = await fetch(path, { headers });
    const body = await response.json();
    return response.ok
      ? body
      : {
        ...body,
        status: body.status || 'error',
        tables: body.tables || [],
        rows: body.rows || [],
        message: body.message || `Request failed (${response.status}).`,
      };
  } catch {
    return {
      status: 'error',
      tables: [],
      rows: [],
      message: 'Database proxy is not running. Start it with npm run server.',
    };
  }
}
