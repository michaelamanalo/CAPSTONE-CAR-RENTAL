import { useEffect, useState } from 'react';
import { getDatabaseTables } from '../services/api';

// Pulls real rows for one table out of the /api/tables response (server.js
// already reads every table from Supabase via the secret-key proxy).
// status: 'loading' | 'loaded' | 'error'
export function useTable(tableName, normalize) {
  const [state, setState] = useState({ status: 'loading', rows: [], error: null });

  useEffect(() => {
    let cancelled = false;

    getDatabaseTables().then((res) => {
      if (cancelled) return;

      if (res.status === 'error') {
        setState({ status: 'error', rows: [], error: res.message });
        return;
      }

      const table = (res.tables || []).find(
        (t) => t.name.toLowerCase() === tableName.toLowerCase(),
      );

      if (!table) {
        setState({
          status: 'error',
          rows: [],
          error: `Table "${tableName}" wasn't found in Supabase. Check src/services/tableNames.js against your actual schema.`,
        });
        return;
      }

      if (table.error) {
        setState({ status: 'error', rows: [], error: table.error });
        return;
      }

      const rows = normalize ? table.rows.map(normalize) : table.rows;
      setState({ status: 'loaded', rows, error: null });
    });

    return () => {
      cancelled = true;
    };
  }, [tableName, normalize]);

  return state;
}
