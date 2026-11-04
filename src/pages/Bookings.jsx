import React, { useState } from 'react';
import { useTable } from '../hooks/useTable';
import { normalizeBooking } from '../services/normalize';
import { TABLES } from '../services/tableNames';
import DataState from '../components/DataState';
import PageHeader from '../components/PageHeader';
import './Bookings.css';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

export default function Bookings() {
  const { status, rows: items, error } = useTable(TABLES.bookings, normalizeBooking);
  const [tab, setTab] = useState('pending');

  if (status !== 'loaded') {
    return (
      <>
        <PageHeader title="Bookings" description="Today and upcoming rental reservations." />
        <DataState status={status} error={error} />
      </>
    );
  }

  const filtered = items.filter((booking) => String(booking.status).toLowerCase() === tab);
  const activeBookingCount = items.filter((booking) => String(booking.status).toLowerCase() !== 'cancelled').length;

  return (
    <>
      <PageHeader title="Bookings" description="Today and upcoming rental reservations." />
      <section className="bookings-card" aria-label="Booking records">
        <div className="bookings-heading">
          <div>
            <p className="bookings-eyebrow">TODAY &amp; UPCOMING</p>
            <h2>Bookings <span>{activeBookingCount}</span></h2>
          </div>
          <span className="bookings-source">SUPABASE DATA</span>
        </div>

        <div className="bookings-tabs" aria-label="Filter bookings by status">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={'bookings-tab' + (tab === item.key ? ' bookings-tab--active' : '')}
              aria-pressed={tab === item.key}
              onClick={() => setTab(item.key)}
            >
              {item.label}
              <span>{items.filter((booking) => String(booking.status).toLowerCase() === item.key).length}</span>
            </button>
          ))}
        </div>

        <div className="bookings-table-wrap">
          {filtered.length === 0 ? (
            <div className="bookings-empty" role="status">No {tab} bookings.</div>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>BOOKING</th>
                  <th>CUSTOMER</th>
                  <th>VEHICLE</th>
                  <th>START</th>
                  <th>END</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking.id}>
                    <td className="bookings-id">{booking.id}</td>
                    <td>{booking.customer}</td>
                    <td>{booking.vehicle || booking.vehicleId} <span className="bookings-vid">{booking.vehicle ? booking.vehicleId : ''}</span></td>
                    <td>{booking.start}</td>
                    <td>{booking.end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bookings-footer">
          <span>Booking changes are read-only in this dashboard.</span>
          <span className="bookings-read-only">READ ONLY</span>
        </div>
      </section>
    </>
  );
}
