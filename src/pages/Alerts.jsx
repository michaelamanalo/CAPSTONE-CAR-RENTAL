import React, { useState } from 'react';
import { useTable } from '../hooks/useTable';
import { normalizeAlert, normalizeVehicle } from '../services/normalize';
import { TABLES } from '../services/tableNames';
import DataState from '../components/DataState';
import './Alerts.css';

const TYPE_LABEL = {
  emergency: 'Emergency',
  overspeeding: 'Overspeeding',
  signal: 'Signal loss',
  geofence: 'Geofence breach',
};

export default function Alerts() {
  // Acknowledging here only updates local state — server.js's proxy is
  // currently read-only (GET endpoints). Once there's a write endpoint
  // (e.g. PATCH /api/alert/:id), replace setAcked with a real API call.
  const alertsQuery = useTable(TABLES.alerts, normalizeAlert);
  const vehiclesQuery = useTable(TABLES.vehicles, normalizeVehicle);
  const [acked, setAcked] = useState({});

  if (alertsQuery.status !== 'loaded') return <DataState status={alertsQuery.status} error={alertsQuery.error} />;

  const items = alertsQuery.rows.map((a) => ({ ...a, acknowledged: a.acknowledged || Boolean(acked[a.id]) }));
  const vehicles = vehiclesQuery.status === 'loaded' ? vehiclesQuery.rows : [];
  const open = items.filter((a) => !a.acknowledged);
  const resolved = items.filter((a) => a.acknowledged);

  return (
    <div className="alerts-page">
      <section>
        <h3 className="alerts-section-title">Needs attention ({open.length})</h3>
        {open.length === 0 ? (
          <p className="alerts-empty">No open alerts. The fleet is quiet right now.</p>
        ) : (
          <div className="alert-list">
            {open.map((a) => (
              <AlertCard key={a.id} alert={a} vehicles={vehicles} onAcknowledge={(id) => setAcked((prev) => ({ ...prev, [id]: true }))} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="alerts-section-title">Resolved</h3>
        {resolved.length === 0 ? (
          <p className="alerts-empty">Nothing resolved yet.</p>
        ) : (
          <div className="alert-list alert-list--resolved">
            {resolved.map((a) => (
              <AlertCard key={a.id} alert={a} vehicles={vehicles} resolved />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AlertCard({ alert, vehicles, onAcknowledge, resolved }) {
  const vehicle = vehicles.find((v) => v.id === alert.vehicleId);
  return (
    <article className={'alert-card alert-card--' + alert.type + (resolved ? ' alert-card--resolved' : '')}>
      <div className="alert-card-main">
        <div className="alert-card-head">
          <span className={'pill pill--' + (alert.type === 'emergency' || alert.type === 'overspeeding' ? 'alert' : 'idle')}>
            {TYPE_LABEL[alert.type] || alert.type}
          </span>
          <span className="mono alert-card-id">{alert.id}</span>
          <span className="alert-card-time">{alert.time}</span>
        </div>
        <p className="alert-card-message">{alert.message}</p>
        <p className="alert-card-meta">
          {vehicle ? `${vehicle.model} · ${vehicle.plate}` : alert.vehicleId} — {alert.location}
        </p>
      </div>
      {!resolved && (
        <button className="alert-card-action" onClick={() => onAcknowledge(alert.id)}>
          Acknowledge
        </button>
      )}
    </article>
  );
}
