import React, { useState } from 'react';
import sgtLogo from '../assets/brand/sgt-logo-transparent-web.png';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { authError, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    const result = await login(email, password);
    if (result?.error) setFormError(result.error);
    setIsSubmitting(false);
  }

  return (
    <div className="login-screen">
      <div className="login-brand">
        <img className="login-logo" src={sgtLogo} alt="SGT" />
        <p className="login-tagline">Car Rental Services</p>
      </div>

      <div className="login-card">
        <span className="login-eyebrow-mark" aria-hidden="true" />
        <h1>Welcome back</h1>
        <p className="login-subtitle">Sign in to manage SGT's fleet, bookings, and staff.</p>

        {(formError || authError) && (
          <p className="login-error" role="alert">{formError || authError}</p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="login-field">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@sgtcarrentals.com"
              autoComplete="username"
              required
            />
          </label>

          <label className="login-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="login-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="login-footnote">Restricted to authorized SGT admins and staff.</p>
        <p className="login-help">Need access or password help? Contact your SGT administrator.</p>
      </div>
    </div>
  );
}
