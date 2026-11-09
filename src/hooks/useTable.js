import { useEffect, useState } from 'react';
import { getAlerts, getBookings, getStaff, getVehicles } from '../services/api';

const resourceRequest = {
  VEHICLE: getVehicles,
  BOOKINGS: getBookings,
  EMERGENCY_ALERTS: getAlerts,
  USERS: getStaff,
};

export function useTable(tableName, normalize) {
  const [state, setState] = useState({ status: 'loading', rows: [], error: null });

  useEffect(() => {
    let cancelled = false;
    const request = resourceRequest[tableName.toUpperCase()];
    if (!request) {
      setState({ status: 'error', rows: [], error: `No authorized API resource is available for "${tableName}".` });
      return () => { cancelled = true; };
    }

    request().then((result) => {
      if (cancelled) return;
      if (!result.success) {
        setState({ status: 'error', rows: [], error: result.error?.message || 'The request failed.' });
        return;
      }
      const rows = Array.isArray(result.data) ? result.data : [];
      setState({ status: 'loaded', rows: normalize ? rows.map(normalize) : rows, error: null });
    });
    return () => { cancelled = true; };
  }, [tableName, normalize]);

  return state;
}
