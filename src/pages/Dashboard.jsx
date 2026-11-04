import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFleetSnapshot } from '../hooks/useFleetSnapshot';
import { vehicleStatusMeta } from '../services/normalize';
import './Dashboard.css';

function markerPosition(vehicle, vehicles) {
  const longitudes = vehicles.map((item) => item.lng);
  const latitudes = vehicles.map((item) => item.lat);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const x = maxLng === minLng ? 50 : 14 + ((vehicle.lng - minLng) / (maxLng - minLng)) * 72;
  const y = maxLat === minLat ? 50 : 14 + ((maxLat - vehicle.lat) / (maxLat - minLat)) * 72;

  return { left: x + '%', top: y + '%' };
}

function markerTone(vehicle, alerts) {
  if (alerts?.some((alert) => String(alert.vehicleId) === String(vehicle.id) && !alert.acknowledged)) {
    return 'attention';
  }

  const status = String(vehicle.status || '').toLowerCase();
  if (status === 'available') return 'available';
  if (status === 'rented' || status === 'on-trip') return 'trip';
  if (status.startsWith('maint')) return 'maintenance';
  return 'offline';
}

function formatGpsUpdate(value) {
  if (!value) return 'No GPS update';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'No GPS update';
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  }).format(date);
}

function vehicleLocation(vehicle) {
  if (!Number.isFinite(vehicle.lat) || !Number.isFinite(vehicle.lng)) return 'No GPS coordinates';
  return vehicle.lat.toFixed(5) + ', ' + vehicle.lng.toFixed(5);
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 14 2-6a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 8l2 6v5h-2v-2H5v2H3z" />
      <path d="M5 13h14M6.5 16h.01M17.5 16h.01" />
    </svg>
  );
}

function SummaryCard({ label, value, tone, icon, foot, action, to }) {
  return (
    <article className={'dashboard-stat-card dashboard-stat-card--' + tone}>
      <div className="dashboard-stat-top">
        <span className="dashboard-stat-label">{label}</span>
        <span className="dashboard-stat-icon" aria-hidden="true">{icon}</span>
      </div>
      <strong className="dashboard-stat-value">{value}</strong>
      <span className="dashboard-stat-foot">{foot}</span>
      <Link className="dashboard-stat-action" to={to}>{action}</Link>
    </article>
  );
}

export default function Dashboard() {
  const dashboard = useFleetSnapshot();
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const vehicles = dashboard.vehicles;
  const trackedVehicles = vehicles.filter(
    (vehicle) => Number.isFinite(vehicle.lat) && Number.isFinite(vehicle.lng),
  );
  const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id) === String(selectedVehicleId))
    || trackedVehicles[0]
    || vehicles[0]
    || null;
  const onTripCount = vehicles.filter((vehicle) => vehicleStatusMeta(vehicle.status).tone === 'idle').length;
  const availableCount = vehicles.filter((vehicle) => vehicleStatusMeta(vehicle.status).tone === 'active').length;
  const bookingCount = dashboard.bookings
    ? dashboard.bookings.filter((booking) => ['active', 'pending'].includes(String(booking.status).toLowerCase())).length
    : '—';
  const openAlertCount = dashboard.alerts
    ? dashboard.alerts.filter((alert) => !alert.acknowledged).length
    : '—';
  const today = new Intl.DateTimeFormat('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(new Date());
  const statusMessage = dashboard.status === 'loading'
    ? 'Loading fleet data'
    : dashboard.status === 'error'
      ? 'Supabase unavailable'
      : trackedVehicles.length
        ? 'Fleet tracking active'
        : 'Waiting for GPS data';

  function updateZoom(nextZoom) {
    setZoom(Math.max(0.8, Math.min(1.4, Math.round(nextZoom * 10) / 10)));
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-page-heading">
        <div>
          <p className="dashboard-page-eyebrow">{today} <span aria-hidden="true">·</span> Malaybalay City</p>
          <h1>Fleet overview</h1>
          <p className="dashboard-page-subtitle">Here’s what’s happening across your fleet today.</p>
        </div>
        <div className={'dashboard-live-status dashboard-live-status--' + dashboard.status} role="status" aria-live="polite">
          <span className="dashboard-live-dot" aria-hidden="true" />
          <span>{statusMessage}</span>
          {dashboard.status === 'loaded' && <span className="dashboard-live-source">Supabase</span>}
        </div>
      </section>
      {dashboard.error && <p className="dashboard-error-message" role="alert">{dashboard.error}</p>}

      <section className="dashboard-stats-grid" aria-label="Fleet summary">
        <SummaryCard label="Total fleet" value={dashboard.status === 'loaded' ? vehicles.length : '—'} tone="red" icon="▰" foot="vehicles in your fleet" action="Open Fleet" to="/vehicles" />
        <SummaryCard label="On trip" value={dashboard.status === 'loaded' ? onTripCount : '—'} tone="blue" icon="↗" foot="rental in progress" action="View vehicles" to="/vehicles" />
        <SummaryCard label="Available" value={dashboard.status === 'loaded' ? availableCount : '—'} tone="green" icon="✓" foot="ready for a new booking" action="View vehicles" to="/vehicles" />
        <SummaryCard label="Bookings" value={bookingCount} tone="blue" icon="B" foot="active and upcoming rentals" action="View bookings" to="/bookings" />
        <SummaryCard label="Needs attention" value={openAlertCount} tone="amber" icon="!" foot="open alerts across your fleet" action="Review alerts" to="/notifications" />
      </section>

      <section className="dashboard-grid" aria-label="Fleet activity">
        <article className="dashboard-card dashboard-map-card" aria-labelledby="dashboard-map-title">
          <div className="dashboard-card-heading">
            <div>
              <p className="dashboard-section-kicker">LIVE TRACKING</p>
              <h2 id="dashboard-map-title">Fleet locations</h2>
              <p className="dashboard-map-subtitle"><span className="dashboard-live-dot dashboard-live-dot--small" />Malaybalay City, Bukidnon</p>
            </div>
            <div className="dashboard-map-heading-actions">
              <span className="dashboard-map-count">{trackedVehicles.length} {trackedVehicles.length === 1 ? 'unit' : 'units'}</span>
              <button className="dashboard-map-reset" type="button" aria-label="Reset map view" title="Reset map view" onClick={() => setZoom(1)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10V4h6M20 14v6h-6M4 4l6 6M20 20l-6-6" /></svg>
              </button>
            </div>
          </div>
          <div className="dashboard-map-toolbar">
            <span className="dashboard-map-hint">Select a vehicle to view details</span>
            <div className="dashboard-map-zoom" role="group" aria-label="Map zoom controls">
              <button type="button" aria-label="Zoom out" disabled={zoom <= 0.8} onClick={() => updateZoom(zoom - 0.1)}>−</button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" aria-label="Zoom in" disabled={zoom >= 1.4} onClick={() => updateZoom(zoom + 0.1)}>+</button>
            </div>
          </div>
          <div className="dashboard-map-frame" role="group" aria-label="Schematic fleet map of Malaybalay City">
            <div className="dashboard-map-canvas" style={{ transform: 'scale(' + zoom + ')' }}>
              <svg className="dashboard-map-art" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <defs>
                  <pattern id="dashboard-map-blocks" width="112" height="86" patternUnits="userSpaceOnUse">
                    <rect x="8" y="8" width="38" height="24" rx="4" fill="#e5ece6" />
                    <rect x="59" y="9" width="44" height="24" rx="4" fill="#e4ebe4" />
                    <rect x="11" y="45" width="33" height="31" rx="4" fill="#e8eee8" />
                    <rect x="59" y="47" width="45" height="29" rx="4" fill="#e5ebe5" />
                  </pattern>
                  <pattern id="dashboard-map-park" width="48" height="42" patternUnits="userSpaceOnUse">
                    <circle cx="12" cy="13" r="7" fill="#bdd5bd" />
                    <circle cx="34" cy="26" r="9" fill="#c7dcc0" />
                  </pattern>
                </defs>
                <rect width="1000" height="500" fill="#edf2eb" />
                <rect width="1000" height="500" fill="url(#dashboard-map-blocks)" opacity=".66" />
                <path d="M0 80h1000v76H0zM0 339h1000v67H0zM235 0h72v500h-72zM700 0h86v500h-86z" fill="#d8e4dc" />
                <path d="M0 266c184-82 282-77 460-16s331 95 540 14v75c-192 89-363 48-564-13S192 270 0 342z" fill="#c6e3df" />
                <path d="M270 0v500M0 117h1000M0 372h1000M743 0v500" fill="none" stroke="#fff" strokeWidth="17" />
                <path d="M0 299c188-76 285-72 459-14s324 89 541 6" fill="none" stroke="#fff" strokeWidth="22" />
                <path d="M72 0v500M168 0v500M378 0v500M470 0v500M567 0v500M650 0v500M859 0v500M944 0v500M0 42h1000M0 203h1000M0 450h1000" fill="none" stroke="#fff" strokeWidth="7" opacity=".94" />
                <path d="M22 0v500M123 0v500M335 0v500M420 0v500M520 0v500M610 0v500M808 0v500M899 0v500M0 74h1000M0 166h1000M0 231h1000M0 426h1000" fill="none" stroke="#fff" strokeWidth="3" opacity=".9" />
                <path d="M34 28h165v66H34zM336 28h300v48H336zM814 36h156v125H814zM314 421h296v58H314zM800 427h164v56H800z" fill="url(#dashboard-map-park)" opacity=".9" />
                <path d="M0 302c188-76 285-72 459-14s324 89 541 6" fill="none" stroke="#d2aa73" strokeWidth="2.5" strokeDasharray="9 9" opacity=".75" />
                <g className="dashboard-map-labels">
                  <text x="350" y="133">MALAYBALAY CITY</text>
                  <text x="57" y="252">FORTICH ST.</text>
                  <text x="463" y="452">SAYRE HIGHWAY</text>
                  <text x="815" y="226">CASISANG</text>
                  <text x="49" y="464">KALASUNGAY</text>
                  <text x="755" y="71">CAPITOL GROUNDS</text>
                </g>
                <g className="dashboard-map-place">
                  <circle cx="501" cy="190" r="14" />
                  <circle cx="501" cy="190" r="4" />
                  <text x="521" y="195">City center</text>
                </g>
              </svg>
              <div className="dashboard-map-markers">
                {trackedVehicles.map((vehicle) => {
                  const position = markerPosition(vehicle, trackedVehicles);
                  const selected = String(vehicle.id) === String(selectedVehicle?.id);
                  const tone = markerTone(vehicle, dashboard.alerts);
                  return (
                    <button
                      className={'dashboard-map-pin dashboard-map-pin--' + tone + (selected ? ' dashboard-map-pin--selected' : '')}
                      key={vehicle.id}
                      type="button"
                      style={position}
                      aria-label={'Select ' + vehicle.model + ', ' + vehicleStatusMeta(vehicle.status).label + (selected ? ', selected' : '')}
                      aria-pressed={selected}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                    >
                      <span>{String(vehicle.id).slice(-2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <span className="dashboard-map-attribution">Approximate positions from live GPS coordinates</span>
            {dashboard.status === 'loading' && <p className="dashboard-map-message">Loading vehicle locations…</p>}
            {dashboard.status === 'error' && <p className="dashboard-map-message">Connect to the database to load fleet locations.</p>}
            {dashboard.status === 'loaded' && trackedVehicles.length === 0 && (
              <p className="dashboard-map-message">Vehicle locations will appear here when GPS data is available.</p>
            )}
          </div>
          <div className="dashboard-map-legend" aria-label="Vehicle status legend">
            <span><i className="dashboard-legend-dot dashboard-legend-dot--trip" />On trip</span>
            <span><i className="dashboard-legend-dot dashboard-legend-dot--available" />Available</span>
            <span><i className="dashboard-legend-dot dashboard-legend-dot--attention" />Attention</span>
            <span><i className="dashboard-legend-dot dashboard-legend-dot--offline" />Offline</span>
          </div>
        </article>

        <article className="dashboard-card dashboard-detail-card" aria-labelledby="dashboard-detail-title">
          <div className="dashboard-card-heading dashboard-detail-heading">
            <div>
              <p className="dashboard-section-kicker">VEHICLE DETAILS</p>
              <h2 id="dashboard-detail-title">Selected vehicle</h2>
            </div>
            {selectedVehicle && <span className="dashboard-detail-live"><i />LIVE DATA</span>}
          </div>
          {selectedVehicle ? (
            <div className="dashboard-vehicle-details">
              <div className="dashboard-detail-top">
                <span className="dashboard-vehicle-thumb"><CarIcon /></span>
                <div className="dashboard-detail-name">
                  <h3>{selectedVehicle.model}</h3>
                  <span>{selectedVehicle.id} · {selectedVehicle.plate}</span>
                </div>
                <span className={'dashboard-status-pill dashboard-status-pill--' + vehicleStatusMeta(selectedVehicle.status).tone}>
                  {vehicleStatusMeta(selectedVehicle.status).label}
                </span>
              </div>
              <h3 className="dashboard-detail-section-title">Vehicle and tracking</h3>
              <div className="dashboard-detail-facts">
                <div><span>Current speed</span><strong>{selectedVehicle.recordedAt ? (selectedVehicle.speed || 0) + ' km/h' : '—'}</strong></div>
                <div><span>Last GPS location</span><strong>{vehicleLocation(selectedVehicle)}</strong></div>
                <div><span>Last GPS update</span><strong>{formatGpsUpdate(selectedVehicle.recordedAt)}</strong></div>
                <div><span>Tracker device</span><strong>{selectedVehicle.trackerDeviceId || 'Not assigned'}</strong></div>
              </div>
            </div>
          ) : (
            <div className="dashboard-detail-empty">
              <strong>No vehicle selected</strong>
              <span>Choose a map marker to see vehicle details.</span>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
