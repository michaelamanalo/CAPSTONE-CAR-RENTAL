import React, { useState } from 'react';
import sgtLogoHero from '../assets/brand/sgt-car-rentals-services-web.jpg';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  function handleSubmit(event) {
    event.preventDefault();
    login();
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-form-panel">
          <span className="login-eyebrow-mark" aria-hidden="true" />
          <h1>Welcome back</h1>
          <p className="login-subtitle">Sign in to manage SGT's fleet, bookings, and staff.</p>

          <form onSubmit={handleSubmit}>
            <label className="login-field">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@sgtcarrentals.com"
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
                required
              />
            </label>

            <div className="login-row">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                Keep me signed in
              </label>
              <button type="button" className="login-forgot">
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-submit">
              Sign in
            </button>
          </form>

          <p className="login-footnote">Restricted to authorized SGT admins and staff.</p>
        </div>

        <div
          className="login-showcase"
          role="img"
          aria-label="SGT Car Rental Services"
          style={{ backgroundImage: `url(${sgtLogoHero})` }}
        />
      </div>
    </div>
  );
}
