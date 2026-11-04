import React from 'react';
import { NavLink } from 'react-router-dom';
import sgtLogo from '../../assets/brand/sgt-logo-transparent-web.png';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  {
    label: 'Overview', to: '/', icon: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>,
  },
  {
    label: 'Fleet', to: '/vehicles', icon: <><path d="M3 13.5 5.3 7a2 2 0 0 1 1.9-1.3h9.6A2 2 0 0 1 18.7 7l2.3 6.5V19h-2v-2H5v2H3z" /><path d="M5 13h14M6.5 15.5h.01M17.5 15.5h.01" /></>,
  },
  {
    label: 'Bookings', to: '/bookings', icon: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  },
  {
    label: 'Alerts', to: '/notifications', icon: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
  },
  {
    label: 'Drivers', to: '/drivers', icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  },
  {
    label: 'Staff', to: '/staff', icon: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20a6 6 0 0 1 12 0M15 15a5 5 0 0 1 6 5" /></>,
  },
  {
    label: 'Logs', to: '/logs', icon: <><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" /></>,
  },
];

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <NavLink className="sidebar-brand" to="/" aria-label="SGT Car Rentals dashboard home">
        <img src={sgtLogo} alt="" />
        <span><strong>SGT</strong><small>CAR RENTALS</small></span>
      </NavLink>

      <p className="sidebar-label">WORKSPACE</p>
      <nav className="sidebar-navigation" aria-label="Dashboard sections">
        <ul className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">{item.icon}</svg>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-workspace">
          <span className="sidebar-workspace-dot" aria-hidden="true" />
          <span><strong>SGT Operations</strong><small>Fleet workspace</small></span>
        </div>
        <button className="sidebar-logout" type="button" onClick={logout}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></svg>
          Log out
        </button>
      </div>
    </aside>
  );
}
