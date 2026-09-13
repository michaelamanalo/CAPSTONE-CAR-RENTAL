import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import { ping } from '../../services/api';
import './MainLayout.css';

const TITLES = {
  '/': 'Home',
  '/fleets': 'Manage Fleets',
  '/staff': 'Manage Staffs',
  '/notifications': 'Notifications',
  '/activity-logs': 'Activity Logs',
  '/bookings': 'Bookings',
  '/routes': 'Route History',
  '/geofences': 'Geofences',
  '/reports': 'Reports',
  '/dev-tools': 'Dev Tools',
};

export default function MainLayout() {
  const location = useLocation();
  const [connection, setConnection] = useState({ status: 'checking' });

  useEffect(() => {
    ping().then(setConnection);
  }, []);

  const title = TITLES[location.pathname] || 'G-FLEET';

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Navbar title={title} connection={connection} />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
