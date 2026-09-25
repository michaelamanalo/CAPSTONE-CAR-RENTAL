import React, { useState } from 'react';
import sgtLogo from '../assets/sgt-logo.png';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    login();
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <img className="login-logo" src={sgtLogo} alt="SGT" />
        <p className="login-subtitle">Admin sign in</p>

        <label className="login-field">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@sgt.com"
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

        <button type="submit" className="login-submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
