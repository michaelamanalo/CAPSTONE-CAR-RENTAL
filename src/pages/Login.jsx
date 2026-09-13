import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured, supabaseConfigMessage } from '../services/supabaseClient';
import './Login.css';

export default function Login() {
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'sent'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { status, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // A redirect from RequireAuth (e.g. a customer account trying to log in
  // here) arrives with an error message already in router state.
  React.useEffect(() => {
    if (location.state?.error) setError(location.state.error);
  }, [location.state]);

  if (status === 'signed-in') {
    const redirectTo = location.state?.from?.pathname || '/';
    return <Navigate to={redirectTo} replace />;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    navigate(location.state?.from?.pathname || '/', { replace: true });
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    });
    setSubmitting(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setView('sent');
  }

  return (
    <div className="login-page">
      <MountainRange className="login-mountains" />

      <div className="login-card">
        {/* Replace with your actual logo file, e.g. <img src="/logo.png" alt="SGT Car Rentals" /> */}
        <div className="login-brand-mark">SGT</div>
        <h1 className="login-title">SGT CAR RENTALS</h1>
        <p className="login-sub">
          {view === 'login' && 'Admin Login'}
          {view === 'forgot' && 'Reset your password'}
          {view === 'sent' && 'Check your email'}
        </p>

        {!isSupabaseConfigured && (
          <p className="login-config-warning">{supabaseConfigMessage}</p>
        )}

        {error && <p className="login-error">{error}</p>}

        {view === 'login' && (
          <form className="login-form" onSubmit={handleLogin}>
            <label className="login-field">
              <span>Email</span>
              <div className="login-input-wrap">
                <MailIcon />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@sgtcarrentals.ph"
                  required
                  disabled={submitting}
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="login-field">
              <span>Password</span>
              <div className="login-input-wrap">
                <LockIcon />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                  disabled={submitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>

            <button
              type="button"
              className="login-forgot-link"
              onClick={() => { setError(null); setView('forgot'); }}
            >
              Forgot password?
            </button>

            <button type="submit" className="login-submit" disabled={submitting || !isSupabaseConfigured}>
              {submitting ? <Spinner /> : 'Login'}
            </button>
          </form>
        )}

        {view === 'forgot' && (
          <form className="login-form" onSubmit={handleForgotPassword}>
            <p className="login-help-text">
              Enter the email on your account and we'll send a link to reset your password.
            </p>
            <label className="login-field">
              <span>Email</span>
              <div className="login-input-wrap">
                <MailIcon />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@sgtcarrentals.ph"
                  required
                  disabled={submitting}
                  autoComplete="email"
                />
              </div>
            </label>

            <button type="submit" className="login-submit" disabled={submitting || !isSupabaseConfigured}>
              {submitting ? <Spinner /> : 'Send reset link'}
            </button>

            <button type="button" className="login-back-link" onClick={() => { setError(null); setView('login'); }}>
              Back to login
            </button>
          </form>
        )}

        {view === 'sent' && (
          <div className="login-sent">
            <p>
              If an account exists for <strong>{email}</strong>, a reset link is on its way.
            </p>
            <button type="button" className="login-back-link" onClick={() => { setError(null); setView('login'); }}>
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MountainRange({ className }) {
  return (
    <svg className={className} viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0 260 L0 190 L120 90 L220 160 L340 40 L430 130 L520 70 L640 180 L740 100 L860 200 L960 60 L1080 150 L1200 100 L1200 260 Z"
        fill="rgba(255,255,255,0.035)"
      />
      <path
        d="M0 260 L0 220 L150 150 L260 210 L380 110 L470 190 L580 130 L700 220 L810 160 L930 230 L1050 140 L1200 200 L1200 260 Z"
        fill="rgba(255,255,255,0.06)"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
      <path d="M3 5.5l7 5.5 7-5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="9" width="12" height="8" rx="1.5" />
      <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6z" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2.5 2.5l15 15" strokeLinecap="round" />
      <path d="M8.3 4.3C8.85 4.1 9.42 4 10 4c5.5 0 8.5 6 8.5 6-.5 1-1.6 2.6-3.2 3.9M5.6 5.9C3.6 7.2 2.2 9.1 1.5 10c0 0 3 6 8.5 6 1 0 1.9-.2 2.7-.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return <span className="login-spinner" aria-label="Loading" />;
}
