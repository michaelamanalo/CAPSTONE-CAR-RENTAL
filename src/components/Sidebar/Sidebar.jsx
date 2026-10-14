import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Manage Fleet', to: '/vehicles' },
  { label: 'Drivers', to: '/drivers' },
  { label: 'Manage Staff', to: '/staff' },
  { label: 'Notifications', to: '/notifications' },
  { label: 'Logs', to: '/logs' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav aria-label="Main navigation">
        <ul className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
