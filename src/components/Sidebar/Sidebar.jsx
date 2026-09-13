import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/fleets', label: 'Manage Fleets' },
  { to: '/staff', label: 'Manage Staffs' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/activity-logs', label: 'Activity Logs' },
];

export default function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        {/* Replace with your actual logo file, e.g. <img src="/logo.png" alt="SGT Car Rentals" /> */}
        <div className="sidebar-brand-mark">SGT</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">SGT CAR RENTALS</span>
          <span className="sidebar-brand-sub">G-FLEET Admin</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => 'sidebar-link' + (isActive ? ' sidebar-link--active' : '')}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => 'sidebar-link sidebar-link--muted' + (isActive ? ' sidebar-link--active' : '')}>
          Settings
        </NavLink>
        <button type="button" className="sidebar-link sidebar-link--muted sidebar-logout" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </aside>
  );
}
