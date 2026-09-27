import React, { useState } from 'react';
import { useTable } from '../hooks/useTable';
import { normalizeBooking } from '../services/normalize';
import { TABLES } from '../services/tableNames';
import DataState from '../components/DataState';
import './Bookings.css';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

export default function Bookings() {
  const { status, rows: items, error } = useTable(TABLES.bookings, normalizeBooking);
  const [tab, setTab] = useState('pending');

  if (status !== 'loaded') return <DataState status={status} error={error} />;

  const filtered = items.filter((b) => b.status === tab);

  return (
    <div className="bookings-page">
      <div className="bookings-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={'bookings-tab' + (tab === t.key ? ' bookings-tab--active' : '')}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className="mono">{items.filter((b) => b.status === t.key).length}</span>
          </button>
        ))}
      </div>

      <div className="bookings-table-wrap">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Booking</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Start</th>
              <th>End</th>
              {tab === 'pending' && <th></th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="bookings-empty">No {tab} bookings.</td>
              </tr>
            )}
            {filtered.map((b) => (
              <tr key={b.id}>
                <td className="mono">{b.id}</td>
                <td>{b.customer}</td>
                <td>{b.vehicle} <span className="mono bookings-vid">{b.vehicleId}</span></td>
                <td>{b.start}</td>
                <td>{b.end}</td>
                {tab === 'pending' && (
                  <td className="bookings-actions">
                    <button className="bookings-approve">Approve</button>
                    <button className="bookings-decline">Decline</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
