import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { normalizeAlert, normalizeBooking, normalizeTelemetry } from './services/normalize';
import { getAlerts, getBookings, getFleetLocations, getVehicles, verifyAccess } from './services/api';

jest.mock('./services/supabaseClient', () => ({
  isSupabaseConfigured: true,
  supabaseConfigMessage: '',
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({
        data: { session: { access_token: 'test-access-token' } },
        error: null,
      }),
      signOut: async () => ({ error: null }),
    },
  },
}));

jest.mock('./services/api', () => ({
  verifyAccess: jest.fn(),
  getVehicles: jest.fn(async () => ({ success: true, data: [] })),
  getFleetLocations: jest.fn(async () => ({ success: true, data: [] })),
  getBookings: jest.fn(async () => ({ success: true, data: [] })),
  getAlerts: jest.fn(async () => ({ success: true, data: [] })),
  getStaff: async () => ({ success: true, data: [] }),
  getDatabaseTables: async () => ({ status: 'loaded', tables: [] }),
  ping: async () => ({ success: true }),
  queryVehicles: async () => ({ status: 'loaded', rows: [] }),
}));

beforeEach(() => {
  verifyAccess.mockResolvedValue({ status: 'authorized', role: 'admin' });
  getVehicles.mockResolvedValue({ success: true, data: [] });
  getFleetLocations.mockResolvedValue({ success: true, data: [] });
  getBookings.mockResolvedValue({ success: true, data: [] });
  getAlerts.mockResolvedValue({ success: true, data: [] });
});

test('shows the login screen first, then the dashboard after signing in', async () => {
  render(<App />);

  await screen.findByRole('button', { name: 'Sign in' });
  await userEvent.type(screen.getByLabelText('Email'), 'admin@sgt.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password');
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByRole('heading', { name: 'Fleet overview', level: 1 })).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText('Waiting for GPS data')).toBeInTheDocument();
  });
});

test('linked customer identities cannot enter the staff dashboard', async () => {
  verifyAccess.mockResolvedValueOnce({ status: 'authorized', role: 'customer' });
  render(<App />);

  await screen.findByRole('button', { name: 'Sign in' });
  await userEvent.type(screen.getByLabelText('Email'), 'customer@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password');
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('This account does not have access to the staff dashboard.');
  expect(screen.queryByRole('heading', { name: 'Fleet overview', level: 1 })).not.toBeInTheDocument();
});

test('dashboard presents empty vehicle data and a location permission error', async () => {
  getFleetLocations.mockResolvedValueOnce({
    success: false,
    error: { code: 'FORBIDDEN', message: 'You do not have permission to access this resource.' },
    data: [],
  });
  render(<App />);
  await screen.findByRole('button', { name: 'Sign in' });
  await userEvent.type(screen.getByLabelText('Email'), 'admin@sgt.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password');
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByRole('heading', { name: 'Fleet overview', level: 1 })).toBeInTheDocument();
  expect(await screen.findByText('You do not have permission to access this resource.')).toBeInTheDocument();
  expect(await screen.findByText('Vehicle locations will appear here when GPS data is available.')).toBeInTheDocument();
  expect(screen.getAllByText('0', { selector: '.dashboard-stat-value' })).toHaveLength(5);
});

test('dashboard displays a useful failure state when vehicle API data is unavailable', async () => {
  getVehicles.mockResolvedValueOnce({
    success: false,
    error: { code: 'UPSTREAM_FAILURE', message: 'The requested data is temporarily unavailable.' },
    data: [],
  });
  render(<App />);
  await screen.findByRole('button', { name: 'Sign in' });
  await userEvent.type(screen.getByLabelText('Email'), 'admin@sgt.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password');
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('The requested data is temporarily unavailable.');
  expect(screen.getByText('Supabase unavailable')).toBeInTheDocument();
});

test('frontend normalizers consume verified booking, telemetry, and alert fields', () => {
  const booking = normalizeBooking({ booking_id: 'b-1', customer_id: 'c-1', vehicle_id: 'v-1', start_date: '2026-01-01', end_date: '2026-01-02', total_amount: 2500, booking_status: 'Approved', created_at: '2026-01-01T00:00:00Z' });
  const telemetry = normalizeTelemetry({ vehicle_id: 'v-1', latitude: 14.5, longitude: 121.0, speed: 12, timestamp: '2026-01-01T00:00:00Z' });
  const alert = normalizeAlert({ alert_id: 'a-1', vehicle_id: 'v-1', alert_type: 'collision', latitude: 14.5, longitude: 121.0, status: 'acknowledged', timestamp: '2026-01-01T00:00:00Z', description: 'Impact', acknowledged_at: '2026-01-01T00:01:00Z' });
  expect(booking.customerId).toBe('c-1');
  expect(booking.status).toBe('approved');
  expect(booking.start).toBe('2026-01-01');
  expect(booking.totalAmount).toBe(2500);
  expect(telemetry.lat).toBe(14.5);
  expect(telemetry.lng).toBe(121.0);
  expect(telemetry.recordedAt).toBe('2026-01-01T00:00:00Z');
  expect(alert.id).toBe('a-1');
  expect(alert.vehicleId).toBe('v-1');
  expect(alert.type).toBe('collision');
  expect(alert.message).toBe('Impact');
  expect(alert.time).toBe('2026-01-01T00:00:00Z');
  expect(alert.location).toBe('14.5, 121');
  expect(alert.acknowledged).toBe(true);
});
