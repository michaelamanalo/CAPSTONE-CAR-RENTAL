import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const PAGE_LABELS = {
  '/': 'Overview',
  '/vehicles': 'Fleet',
  '/bookings': 'Bookings',
  '/notifications': 'Alerts',
  '/drivers': 'Drivers',
  '/staff': 'Staff',
  '/logs': 'Logs',
};

export default function Navbar() {
  const { pathname } = useLocation();
  const currentPath = pathname.replace(/\/+$/, '') || '/';
  const pageLabel = PAGE_LABELS[currentPath] || 'Overview';
  const now = new Date();
  const today = new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(now);
  const dateTime = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Manila',
  }).format(now);

  return (
    <header className="navbar">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <span>Workspace</span>
        <span aria-hidden="true">/</span>
        <strong>{pageLabel}</strong>
      </nav>
      <div className="navbar-actions">
        <time className="current-date" dateTime={dateTime}>{today}</time>
        <Link className="navbar-bookings" to="/bookings">View bookings</Link>
      </div>
    </header>
  );
}
