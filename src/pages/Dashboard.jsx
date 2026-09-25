import React, { useEffect, useState } from 'react';
import { ping } from '../services/api';
import DatabaseTables from '../components/DatabaseTables';
import VehicleQuery from '../components/VehicleQuery';
import './Dashboard.css';

export default function Dashboard() {
  const [connection, setConnection] = useState({ status: 'checking' });

  useEffect(() => {
    ping().then(setConnection);
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Vehicles, drivers, and live database status for SGT.</p>
        <span className="dashboard-status">
          Supabase: {connection.status}
          {connection.message ? ` — ${connection.message}` : ''}
        </span>
      </div>
      <VehicleQuery />
      <DatabaseTables />
    </div>
  );
}
