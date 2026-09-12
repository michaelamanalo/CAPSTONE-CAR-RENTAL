import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders the dashboard and Supabase status', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'G-FLEET', level: 1 })).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/Supabase: error/i)).toBeInTheDocument();
    expect(screen.getByText(/Database proxy is not running/i)).toBeInTheDocument();
  });
});
