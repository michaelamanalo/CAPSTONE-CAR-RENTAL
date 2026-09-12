import React, { useEffect, useState } from 'react';
import { ping } from '../services/api';
import DatabaseTables from '../components/DatabaseTables';
import VehicleQuery from '../components/VehicleQuery';

export default function Dashboard() {
  const [connection, setConnection] = useState({ status: 'checking' });

  useEffect(() => {
    ping().then(setConnection);
  }, []);

  return (
    <div>
      <h1>G-FLEET</h1>
      <h2>Dashboard</h2>
      <p>Welcome to G-FLEET</p>
      <p>
        Supabase: {connection.status}
        {connection.message ? ` - ${connection.message}` : ''}
      </p>
      <VehicleQuery />
      <DatabaseTables />
    </div>
  );
}
