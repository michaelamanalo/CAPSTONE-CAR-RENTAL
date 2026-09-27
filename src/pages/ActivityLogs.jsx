import React, { useMemo } from 'react';
import { useTable } from '../hooks/useTable';
import { normalizeAlert, normalizeBooking } from '../services/normalize';
import { TABLES } from '../services/tableNames';
import DataState from '../components/DataState';
import './ActivityLogs.css';

// There's no dedicated activity-log table yet, so this page builds its
// feed from BOOKINGS + EMERGENCY_ALERTS as a stand-in. Swap this for a
// real table once one exists.
export default function ActivityLogs() {
  const bookingsQuery = useTable(TABLES.bookings, normalizeBooking);
  const alertsQuery = useTable(TABLES.alerts, normalizeAlert);

  const loading = bookingsQuery.status === 'loading' || alertsQuery.status === 'loading';
  const firstError = bookingsQuery.status === 'error' ? bookingsQuery.error
    : alertsQuery.status === 'error' ? alertsQuery.error
    : null;

  const entries = useMemo(() => {
    const bookingEntries = bookingsQuery.status === 'loaded'
      ? bookingsQuery.rows.map((b) => ({
          id: 'booking-' + b.id,
          time: b.start,
          text: `Booking ${b.id} (${b.customer}) — ${b.status}`,
        }))
      : [];
    const alertEntries = alertsQuery.status === 'loaded'
      ? alertsQuery.rows.map((a) => ({
          id: 'alert-' + a.id,
          time: a.time,
          text: `${a.vehicleId}: ${a.message}`,
        }))
      : [];
    return [...bookingEntries, ...alertEntries].sort((a, b) => (a.time > b.time ? -1 : 1));
  }, [bookingsQuery.status, bookingsQuery.rows, alertsQuery.status, alertsQuery.rows]);

  if (loading) return <DataState status="loading" />;
  if (firstError && entries.length === 0) return <DataState status="error" error={firstError} />;

  return (
    <div className="logs-page">
      {entries.length === 0 ? (
        <div className="data-state data-state--empty">No bookings or alerts recorded yet.</div>
      ) : (
        <ul className="logs-list">
          {entries.map((e) => (
            <li key={e.id} className="logs-row">
              <span className="mono logs-time">{e.time}</span>
              <span className="logs-text">{e.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
