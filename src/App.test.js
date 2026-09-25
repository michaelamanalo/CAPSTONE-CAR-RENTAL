import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('shows the login screen first, then the dashboard after signing in', async () => {
  render(<App />);

  expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();

  await userEvent.type(screen.getByLabelText('Email'), 'admin@sgt.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password');
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(screen.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/Supabase: error/i)).toBeInTheDocument();
    expect(screen.getByText(/Database proxy is not running/i)).toBeInTheDocument();
  });
});
