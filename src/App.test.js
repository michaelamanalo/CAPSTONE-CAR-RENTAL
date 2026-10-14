import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

jest.mock('./services/supabaseClient', () => ({
  isSupabaseConfigured: true,
  supabaseConfigMessage: '',
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { session: { access_token: 'test-access-token' } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

jest.mock('./services/api', () => ({
  verifyAccess: jest.fn().mockResolvedValue({ status: 'authorized', role: 'admin' }),
  getDatabaseTables: jest.fn().mockResolvedValue({
    status: 'loaded',
    tables: [
      { name: 'VEHICLE', rows: [], error: null },
      { name: 'TELEMETRY_LOGS', rows: [], error: null },
    ],
  }),
  ping: jest.fn(),
  queryVehicles: jest.fn(),
}));

test('shows the login screen first, then the dashboard after signing in', async () => {
  render(<App />);

  await screen.findByRole('button', { name: 'Sign in' });
  await userEvent.type(screen.getByLabelText('Email'), 'admin@sgt.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password');
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText('Supabase: connected')).toBeInTheDocument();
  });
});
