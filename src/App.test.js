import { render, screen } from '@testing-library/react';
import App from './App';

test('redirects to the login screen when there is no session', async () => {
  render(<App />);
  expect(await screen.findByText('Admin Login')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
