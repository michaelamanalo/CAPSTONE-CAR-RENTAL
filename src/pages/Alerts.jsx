import React, { useEffect, useRef, useState } from 'react';
import DemoDeleteButton from '../components/DemoDeleteButton';
import { useFleetSnapshot } from '../hooks/useFleetSnapshot';
import { vehicleStatusMeta } from '../services/normalize';
import { isDemoMode } from '../services/demoMode';
import DataState from '../components/DataState';
import PageHeader from '../components/PageHeader';
import './Alerts.css';

const TYPE_LABEL = {
  emergency: 'Emergency alert',
  speed: 'Speed limit exceeded',
  overspeeding: 'Speed limit exceeded',
  signal: 'Tracker connection lost',
  geofence: 'Geofence notification',
};

function formatDate(value, options) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', ...options }).format(date);
}

function renterFor(bookings, vehicleId) {
  return bookings
    .filter((booking) => String(booking.vehicleId) === String(vehicleId)
      && ['active', 'pending'].includes(String(booking.status).toLowerCase()))
    .sort((a, b) => (
      String(a.status).toLowerCase() === String(b.status).toLowerCase()
        ? new Date(a.start) - new Date(b.start)
        : String(a.status).toLowerCase() === 'active' ? -1 : 1
    ))[0] || null;
}

function vehicleLocation(vehicle, alert) {
  if (vehicle && Number.isFinite(vehicle.lat) && Number.isFinite(vehicle.lng)) {
    return vehicle.lat.toFixed(5) + ', ' + vehicle.lng.toFixed(5);
  }
  return alert.location && alert.location !== '—' ? alert.location : 'Location unavailable';
}

export default function Alerts() {
  const snapshot = useFleetSnapshot();
  const today = new Intl.DateTimeFormat('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(new Date());
  const [acked, setAcked] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [notice, setNotice] = useState('');
  const dialogRef = useRef(null);

  const vehicles = snapshot.vehicles;
  const bookings = snapshot.bookings || [];
  const items = (snapshot.alerts || []).map((alert) => ({
    ...alert,
    acknowledged: alert.acknowledged || Boolean(acked[alert.id]),
  }));
  const open = items.filter((alert) => !alert.acknowledged);
  const visible = showHistory ? items : open;
  const selectedAlert = items.find((alert) => String(alert.id) === String(selectedAlertId)) || null;
  const selectedVehicle = selectedAlert
    ? vehicles.find((vehicle) => String(vehicle.id) === String(selectedAlert.vehicleId))
    : null;
  const selectedRenter = selectedAlert ? renterFor(bookings, selectedAlert.vehicleId) : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedAlert && !dialog.open) dialog.showModal();
    if (!selectedAlert && dialog.open) dialog.close();
  }, [selectedAlert]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 2600);
    return () => clearTimeout(timer);
  }, [notice]);

  function acknowledge(alert) {
    if (!alert) return;
    setAcked((previous) => ({ ...previous, [alert.id]: true }));
    setSelectedAlertId(null);
    setNotice(alert.id + ' acknowledged for this session.');
  }

  if (snapshot.status === 'loading') {
    return (
      <>
        <PageHeader eyebrow={today + ' · MALAYBALAY CITY'} title="Alerts" description="Open an alert to view renter contact details and the vehicle's last known location." />
        <DataState status="loading" />
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow={today + ' · MALAYBALAY CITY'} title="Alerts" description="Open an alert to view renter contact details and the vehicle's last known location." />
      {snapshot.error && <p className="alerts-source-warning" role="status">Some fleet data could not be loaded: {snapshot.error}</p>}
      <section className="alerts-card" aria-labelledby="active-alerts-title">
        <header className="alerts-card-heading">
          <div>
            <p className="alerts-eyebrow">REQUIRES ACTION</p>
            <h2 id="active-alerts-title">Active alerts <span>{open.length}</span></h2>
          </div>
          <button
            className="alerts-history-toggle"
            type="button"
            aria-pressed={showHistory}
            onClick={() => setShowHistory((value) => !value)}
          >
            {showHistory ? 'Active only' : 'View history'}
          </button>
        </header>

        <div className="alert-list">
          {visible.length ? visible.map((alert) => {
            const vehicle = vehicles.find((item) => String(item.id) === String(alert.vehicleId));
            return (
              <button
                className="alert-row"
                type="button"
                key={alert.id}
                onClick={() => setSelectedAlertId(alert.id)}
                aria-label={'View details for ' + (TYPE_LABEL[alert.type] || alert.type) + ' on ' + (vehicle?.model || alert.vehicleId)}
              >
                <span className={'alert-row-symbol alert-row-symbol--' + alert.type} aria-hidden="true">
                  {alert.type === 'emergency' ? '!' : alert.type === 'speed' || alert.type === 'overspeeding' ? '↗' : alert.type === 'signal' ? '⌁' : '⌖'}
                </span>
                <span className="alert-row-copy">
                  <strong>{TYPE_LABEL[alert.type] || alert.type}</strong>
                  <span>{alert.message}</span>
                  <small>{alert.vehicleId} · {vehicle?.model || 'Unknown vehicle'} · {formatDate(alert.time, { hour: 'numeric', minute: '2-digit' })}{alert.acknowledged ? ' · Acknowledged' : ''}</small>
                </span>
                <span className="alert-row-open" aria-hidden="true">View details <b>›</b></span>
              </button>
            );
          }) : (
            <div className="alerts-empty"><strong>All clear</strong><span>No active fleet alerts right now.</span></div>
          )}
        </div>

        <footer className="alerts-card-footer">
          <span>{showHistory ? 'Alert history' : open.length + ' open ' + (open.length === 1 ? 'alert' : 'alerts')}</span>
          {!showHistory && open.length > 0 && (
            <button
              type="button"
              className="alerts-ack-all"
              onClick={() => {
                setAcked((previous) => ({
                  ...previous,
                  ...Object.fromEntries(open.map((alert) => [alert.id, true])),
                }));
                setNotice('All active alerts acknowledged for this session.');
              }}
            >
              Acknowledge all
            </button>
          )}
        </footer>
      </section>

      {notice && <div className="alerts-toast" role="status" aria-live="polite">{notice}</div>}

      <dialog
        className="alerts-detail-dialog"
        ref={dialogRef}
        aria-labelledby="alert-detail-title"
        onClose={() => setSelectedAlertId(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setSelectedAlertId(null);
        }}
      >
        {selectedAlert && (
          <div className="alerts-detail-shell">
            <header className="alerts-detail-header">
              <div>
                <p className="alerts-eyebrow">FLEET ALERT</p>
                <h2 id="alert-detail-title">{TYPE_LABEL[selectedAlert.type] || selectedAlert.type}</h2>
                <p>{selectedAlert.id} · {formatDate(selectedAlert.time, { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
              </div>
              <button className="alerts-detail-close" type="button" aria-label="Close alert details" onClick={() => setSelectedAlertId(null)}>×</button>
            </header>

            <section className="alerts-detail-summary">
              <div>
                <p>{selectedAlert.vehicleId} · {selectedVehicle?.model || 'Unknown vehicle'}</p>
                <h3>{selectedAlert.message}</h3>
                <span>{selectedVehicle?.plate || 'Vehicle details unavailable'}</span>
              </div>
              <strong className={selectedAlert.acknowledged ? 'alerts-detail-status alerts-detail-status--done' : 'alerts-detail-status'}>
                {selectedAlert.acknowledged ? 'Acknowledged' : 'Needs attention'}
              </strong>
            </section>

            <div className="alerts-detail-grid">
              <article className="alerts-detail-card">
                <h3>Vehicle location</h3>
                <p className="alerts-location-label">LAST KNOWN LOCATION</p>
                <strong className="alerts-location">{vehicleLocation(selectedVehicle, selectedAlert)}</strong>
                <dl>
                  <div><dt>Vehicle status</dt><dd>{selectedVehicle ? vehicleStatusMeta(selectedVehicle.status).label : 'Unavailable'}</dd></div>
                  <div><dt>GPS update</dt><dd>{formatDate(selectedVehicle?.recordedAt || selectedAlert.time, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</dd></div>
                  {selectedAlert.location && selectedAlert.location !== '—' && (
                    <div><dt>Alert location</dt><dd>{selectedAlert.location}</dd></div>
                  )}
                </dl>
              </article>

              <article className="alerts-detail-card">
                <h3>Renter details</h3>
                {selectedRenter ? (
                  <>
                    <p className="alerts-renter-status">{selectedRenter.status} rental · {selectedRenter.id}</p>
                    <strong className="alerts-renter-name">{selectedRenter.customer}</strong>
                    <dl>
                      <div><dt>Phone number</dt><dd>{selectedRenter.phone || 'Not available'}</dd></div>
                      <div><dt>Email address</dt><dd>{selectedRenter.email || 'Not available'}</dd></div>
                    </dl>
                    <div className="alerts-contact-actions">
                      {selectedRenter.phone && <a href={'tel:' + String(selectedRenter.phone).replace(/[^\d+]/g, '')}>Call renter</a>}
                      {selectedRenter.email && <a href={'mailto:' + selectedRenter.email}>Email renter</a>}
                    </div>
                  </>
                ) : (
                  <p className="alerts-no-renter">No active or upcoming booking is linked to this vehicle.</p>
                )}
              </article>
            </div>

            <div className="alerts-detail-actions">
              <span>{isDemoMode ? 'Sample changes stay in this browser.' : 'Acknowledgements apply only while this page remains open.'}</span>
              {!selectedAlert.acknowledged && <button type="button" onClick={() => acknowledge(selectedAlert)}>Acknowledge alert</button>}
              <DemoDeleteButton
                tableName="EMERGENCY_ALERTS"
                id={selectedAlert.id}
                itemName={'alert ' + selectedAlert.id}
                onDeleted={() => setSelectedAlertId(null)}
              />
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
