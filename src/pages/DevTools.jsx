import React from 'react';
import DatabaseTables from '../components/DatabaseTables';
import VehicleQuery from '../components/VehicleQuery';

// Not linked from the sidebar. Visit /dev-tools directly to test the
// server.js Supabase proxy once the backend is live.
export default function DevTools() {
  return (
    <div>
      <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
        Internal only — raw Supabase connection check via the server.js proxy.
      </p>
      <VehicleQuery />
      <DatabaseTables />
    </div>
  );
}
