import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar({ title, connection }) {
  const status = connection?.status || 'checking';
  const { user } = useAuth();

  return (
    <header className="navbar">
      <h1 className="navbar-title">{title}</h1>

      <div className="navbar-right">
        <span className={'navbar-conn navbar-conn--' + status}>
          <span className="status-dot status-dot--active" />
          {status === 'connected' ? 'Live' : status === 'checking' ? 'Connecting…' : 'Offline'}
        </span>
        {user?.email && <span className="navbar-user-email mono">{user.email}</span>}
        <button className="navbar-icon-btn" aria-label="Notifications" type="button">🔔</button>
        <button className="navbar-icon-btn" aria-label="Settings" type="button">⚙️</button>
      </div>
    </header>
  );
}
