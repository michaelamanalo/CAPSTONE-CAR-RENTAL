import { supabase } from './supabaseClient';
import { isDemoMode } from './demoMode';
import { getDemoFleetLocations, getDemoRows } from './demoStore';

function demoResult(tableName) {
  return { success: true, data: getDemoRows(tableName) };
}

export async function ping() {
  return requestJson('/api/health', undefined, false);
}

export async function getDatabaseTables() {
  return { status: 'error', tables: [], message: 'The unrestricted table explorer has been retired. Use the authorized resource pages.' };
}

export async function queryVehicles() {
  return { status: 'error', rows: [], message: 'Arbitrary vehicle queries are no longer available.' };
}

export async function getVehicles() {
  if (isDemoMode) return demoResult('VEHICLE');
  return requestJson('/api/vehicles');
}

export async function getBookings() {
  if (isDemoMode) return demoResult('BOOKINGS');
  return requestJson('/api/bookings?limit=100');
}

export async function getFleetLocations() {
  if (isDemoMode) return { success: true, data: getDemoFleetLocations() };
  return requestJson('/api/fleet/locations');
}

export async function getAlerts() {
  if (isDemoMode) return demoResult('EMERGENCY_ALERTS');
  return requestJson('/api/alerts?limit=100');
}

export async function getStaff() {
  if (isDemoMode) return demoResult('USERS');
  return requestJson('/api/staff');
}

export async function verifyAccess(accessToken) {
  if (isDemoMode) return { status: 'authorized', role: 'admin' };
  const result = await requestJson('/api/session', accessToken);
  if (!result.success) {
    const status = result.error?.code === 'UNAUTHENTICATED' ? 'unauthorized' : result.error?.code === 'FORBIDDEN' ? 'forbidden' : 'error';
    return { status, message: result.error?.message };
  }
  return { status: 'authorized', role: result.data?.role };
}

async function requestJson(path, suppliedToken, authenticated = true) {
  try {
    let accessToken = suppliedToken;
    if (authenticated && accessToken === undefined && supabase) {
      const { data } = await supabase.auth.getSession();
      accessToken = data.session?.access_token;
    }

    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    const response = await fetch(path, { headers });
    const body = await response.json();
    if (response.ok) return body;
    return { success: false, error: body.error || { code: 'REQUEST_FAILED', message: `Request failed (${response.status}).` }, data: [] };
  } catch {
    return { success: false, error: { code: 'NETWORK_ERROR', message: 'The API is unavailable. Start it with npm run server.' }, data: [] };
  }
}
