import React, { useEffect, useMemo, useRef, useState } from 'react';
import DemoDeleteButton from '../components/DemoDeleteButton';
import { useTable } from '../hooks/useTable';
import { normalizeBooking, normalizeVehicle, vehicleStatusMeta } from '../services/normalize';
import { isDemoMode } from '../services/demoMode';
import { TABLES } from '../services/tableNames';
import DataState from '../components/DataState';
import PageHeader from '../components/PageHeader';
import './Bookings.css';

function formatDate(value, options) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', ...options }).format(date);
}

function statusLabel(status) {
  return ({ active: 'Active', pending: 'Pending', cancelled: 'Cancelled', completed: 'Completed' })[status] || status || 'Pending';
}

function rentalDays(start, end) {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime < startTime) return null;
  return Math.max(1, Math.ceil((endTime - startTime) / 86400000));
}

export default function Bookings() {
  const bookingsQuery = useTable(TABLES.bookings, normalizeBooking);
  const vehiclesQuery = useTable(TABLES.vehicles, normalizeVehicle);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const dialogRef = useRef(null);
  const loading = bookingsQuery.status === 'loading' || vehiclesQuery.status === 'loading';
  const error = bookingsQuery.status === 'error' ? bookingsQuery.error : vehiclesQuery.status === 'error' ? vehiclesQuery.error : null;
  const vehicles = vehiclesQuery.status === 'loaded' ? vehiclesQuery.rows : [];
  const items = useMemo(() => {
    if (bookingsQuery.status !== 'loaded') return [];
    return [...bookingsQuery.rows].sort((a, b) => {
      const aCancelled = a.status === 'cancelled';
      const bCancelled = b.status === 'cancelled';
      if (aCancelled !== bCancelled) return aCancelled ? 1 : -1;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  }, [bookingsQuery.status, bookingsQuery.rows]);

  useEffect(() => {
    if (selectedBooking && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  }, [selectedBooking]);

  if (loading || (bookingsQuery.status === 'error' && vehiclesQuery.status === 'loading')) {
    return (
      <>
        <PageHeader title="Bookings" description="Review renter reservations and rental schedules." />
        <DataState status={loading ? 'loading' : 'error'} error={error} />
      </>
    );
  }

  if (bookingsQuery.status !== 'loaded') {
    return (
      <>
        <PageHeader title="Bookings" description="Review renter reservations and rental schedules." />
        <DataState status={bookingsQuery.status} error={bookingsQuery.error} />
      </>
    );
  }

  const activeBookingCount = items.filter((booking) => ['active', 'pending'].includes(booking.status)).length;
  const selectedVehicle = selectedBooking
    ? vehicles.find((vehicle) => String(vehicle.id) === String(selectedBooking.vehicleId))
    : null;
  const duration = selectedBooking ? rentalDays(selectedBooking.start, selectedBooking.end) : null;
  const vehicleStatus = selectedVehicle ? vehicleStatusMeta(String(selectedVehicle.status)) : null;

  return (
    <>
      <PageHeader title="Bookings" description="Review renter reservations and rental schedules." />
      {error && <p className="bookings-source-warning" role="status">Vehicle details could not be loaded: {error}</p>}
      <section className="bookings-card" aria-label="Booking records">
        <div className="bookings-heading">
          <div>
            <p className="bookings-eyebrow">TODAY &amp; UPCOMING</p>
            <h2>Bookings <span>{activeBookingCount}</span></h2>
          </div>
          <span className="bookings-source">{isDemoMode ? 'DEMO DATA' : 'LIVE DATA'}</span>
        </div>

        <div className="booking-list-columns" aria-hidden="true">
          <span>BOOKING &amp; RENTER</span><span>VEHICLE</span><span>SCHEDULE</span><span>STATUS</span>
        </div>
        <div className="booking-list">
          {items.length === 0 ? (
            <div className="bookings-empty" role="status">No bookings were found.</div>
          ) : items.map((booking) => {
            const vehicle = vehicles.find((item) => String(item.id) === String(booking.vehicleId));
            const start = new Date(booking.start);
            const day = Number.isFinite(start.getTime()) ? formatDate(booking.start, { day: 'numeric' }) : '—';
            const month = Number.isFinite(start.getTime()) ? formatDate(booking.start, { month: 'short' }) : '—';
            const time = Number.isFinite(start.getTime()) ? formatDate(booking.start, { hour: 'numeric', minute: '2-digit' }) : 'Date unavailable';
            return (
              <button
                className="booking-row booking-row--clickable"
                key={booking.id}
                type="button"
                onClick={() => setSelectedBooking(booking)}
                aria-label={'View booking ' + booking.id + ' for ' + booking.customer}
              >
                <span className="booking-date"><strong>{day}</strong><span>{month}</span></span>
                <span className="booking-main"><strong>{booking.customer}</strong><span>{booking.id}</span></span>
                <span className="booking-vehicle"><strong>{vehicle?.model || 'Vehicle ' + booking.vehicleId}</strong><span>{vehicle?.plate || booking.vehicleId}</span></span>
                <span className="booking-side"><span className="booking-time">{time}</span><span className={'booking-status booking-status--' + booking.status}>{statusLabel(booking.status)}</span></span>
              </button>
            );
          })}
        </div>

        <div className="bookings-footer">
          <span>Select a booking to view its renter, vehicle, and schedule.</span>
          <span className="bookings-read-only">{isDemoMode ? 'DEMO DATA' : 'READ ONLY'}</span>
        </div>
      </section>

      <dialog className="booking-detail-dialog" ref={dialogRef} onClose={() => setSelectedBooking(null)} aria-labelledby="booking-detail-title">
        {selectedBooking && (
          <div className="booking-detail-shell">
            <header className="booking-detail-header">
              <div>
                <p className="bookings-eyebrow">BOOKING RECORD</p>
                <h2 id="booking-detail-title">Booking details</h2>
                <p>{selectedBooking.id}</p>
              </div>
              <button className="booking-detail-close" type="button" onClick={() => dialogRef.current?.close()} aria-label="Close booking details">×</button>
            </header>

            <section className="booking-record-overview">
              <div>
                <p className="bookings-eyebrow">RENTER</p>
                <h3>{selectedBooking.customer}</h3>
                <p>{selectedVehicle?.model || 'Vehicle ' + selectedBooking.vehicleId} <span>·</span> {selectedVehicle?.plate || selectedBooking.vehicleId}</p>
              </div>
              <span className={'booking-record-status booking-record-status--' + selectedBooking.status}>{statusLabel(selectedBooking.status)}</span>
              <div className="booking-record-metrics">
                <div><span>Booking reference</span><strong>{selectedBooking.id}</strong></div>
                <div><span>Rental length</span><strong>{duration ? duration + (duration === 1 ? ' day' : ' days') : 'Not available'}</strong></div>
                <div><span>Total amount</span><strong>{selectedBooking.totalAmount == null ? 'Not provided' : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(selectedBooking.totalAmount)}</strong></div>
              </div>
            </section>

            <div className="booking-record-grid">
              <article className="record-card record-card--wide">
                <div className="record-card-heading"><span className="record-card-icon">01</span><div><h3>Trip itinerary</h3><p>Pickup and return schedule</p></div></div>
                <div className="itinerary-grid">
                  <div className="itinerary-stop"><span className="itinerary-label"><i className="itinerary-dot itinerary-dot--pickup" />PICKUP</span><strong>{formatDate(selectedBooking.start, { month: 'long', day: 'numeric', year: 'numeric' })}</strong><span>{formatDate(selectedBooking.start, { hour: 'numeric', minute: '2-digit' })}</span></div>
                  <div className="itinerary-stop"><span className="itinerary-label"><i className="itinerary-dot itinerary-dot--return" />RETURN</span><strong>{formatDate(selectedBooking.end, { month: 'long', day: 'numeric', year: 'numeric' })}</strong><span>{formatDate(selectedBooking.end, { hour: 'numeric', minute: '2-digit' })}</span></div>
                </div>
              </article>
              <article className="record-card">
                <div className="record-card-heading"><span className="record-card-icon">02</span><div><h3>Renter details</h3><p>Contact information</p></div></div>
                <dl className="record-fields">
                  <div><dt>Full name</dt><dd>{selectedBooking.customer}</dd></div>
                  <div><dt>Phone number</dt><dd>{selectedBooking.phone ? <a href={'tel:' + selectedBooking.phone}>{selectedBooking.phone}</a> : 'Not provided'}</dd></div>
                  <div><dt>Email address</dt><dd>{selectedBooking.email ? <a href={'mailto:' + selectedBooking.email}>{selectedBooking.email}</a> : 'Not provided'}</dd></div>
                </dl>
              </article>
              <article className="record-card">
                <div className="record-card-heading"><span className="record-card-icon">03</span><div><h3>Assigned vehicle</h3><p>Vehicle for this rental</p></div></div>
                <div className="record-vehicle"><div><strong>{selectedVehicle?.model || 'Vehicle ' + selectedBooking.vehicleId}</strong><span>{selectedVehicle?.id || selectedBooking.vehicleId} · {selectedVehicle?.plate || 'Plate unavailable'}</span></div></div>
                <dl className="record-fields"><div><dt>Vehicle status</dt><dd>{vehicleStatus?.label || 'Unavailable'}</dd></div><div><dt>Rental dates</dt><dd>{formatDate(selectedBooking.start, { month: 'short', day: 'numeric' })} – {formatDate(selectedBooking.end, { month: 'short', day: 'numeric', year: 'numeric' })}</dd></div></dl>
              </article>
            </div>
            <footer className="booking-detail-footer">
              <span>{isDemoMode ? 'Demo changes stay in this browser.' : 'Booking information is read-only in this dashboard.'}</span>
              <DemoDeleteButton
                tableName="BOOKINGS"
                id={selectedBooking.id}
                itemName={'booking ' + selectedBooking.id}
                onDeleted={() => {
                  dialogRef.current?.close();
                  setSelectedBooking(null);
                }}
              />
            </footer>
          </div>
        )}
      </dialog>
    </>
  );
}
