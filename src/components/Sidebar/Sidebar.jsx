import React from 'react';
import './Sidebar.css';

const NAV_ITEMS = [
  { label: 'Dashboard', active: true },
  { label: 'Vehicles', active: false },
  { label: 'Drivers', active: false },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <ul className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className={`sidebar-link${item.active ? ' active' : ''}`}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
