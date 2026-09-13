import React, { useMemo, useState } from 'react';
import { useTable } from '../hooks/useTable';
import { normalizeVehicle, normalizeTelemetry, vehicleStatusMeta } from '../services/normalize';
import { TABLES } from '../services/tableNames';
import DataState from '../components/DataState';
import './Dashboard.css';

export default function Dashboard() {
  const vehiclesQuery = useTable(TABLES.vehicles, normalizeVehicle);
  const telemetryQuery = useTable(TABLES.telemetry, normalizeTelemetry);
  const [selectedId, setSelectedId] = useState(null);

  const vehicles = useMemo(() => {
    if (vehiclesQuery.status !== 'loaded') return [];
    const telemetry = telemetryQuery.status === 'loaded' ? telemetryQuery.rows : [];

    return vehiclesQuery.rows.map((v) => {
      if (!v.trackerDeviceId) return v;
      // Latest reading for this vehicle's tracker (assumes rows come back
      // in insertion order; sort by recordedAt here if that's not true).
      const readings = telemetry.filter((t) => t.trackerDeviceId === v.trackerDeviceId);
      const latest = readings[readings.length - 1];
      if (!latest) return v;
      return { ...v, lat: latest.lat, lng: latest.lng, speed: latest.speed, lastUpdate: latest.recordedAt || '—' };
    });
  }, [vehiclesQuery.status, vehiclesQuery.rows, telemetryQuery.status, telemetryQuery.rows]);

  const summary = useMemo(() => {
    const counts = { total: vehicles.length, active: 0, idle: 0, offline: 0 };
    vehicles.forEach((v) => {
      const { tone } = vehicleStatusMeta(v.status);
      if (counts[tone] !== undefined) counts[tone] += 1;
    });
    return counts;
  }, [vehicles]);

  const selected = vehicles.find((v) => v.id === selectedId) || vehicles[0];

  if (vehiclesQuery.status !== 'loaded') {
    return <DataState status={vehiclesQuery.status} error={vehiclesQuery.error} />;
  }

  if (vehicles.length === 0) {
    return <div className="data-state data-state--empty">No vehicles in the VEHICLE table yet.</div>;
  }

  return (
    <div className="monitoring">
      <div className="summary-row">
        <SummaryCard label="Fleet size" value={summary.total} />
        <SummaryCard label="Available" value={summary.active} tone="active" />
        <SummaryCard label="Rented" value={summary.idle} tone="idle" />
        <SummaryCard label="Maintenance" value={summary.offline} tone="offline" />
      </div>

      <div className="monitoring-body">
        <section className="map-panel">
          <MapPlaceholder vehicles={vehicles} selected={selected} onSelect={setSelectedId} />
        </section>

        <aside className="vehicle-panel">
          <div className="vehicle-panel-head">
            <h3>Vehicles</h3>
            <span className="mono">{vehicles.length}</span>
          </div>
          <ul className="vehicle-list">
            {vehicles.map((v) => {
              const { tone, label } = vehicleStatusMeta(v.status);
              return (
                <li key={v.id}>
                  <button
                    className={'vehicle-row' + (v.id === selected?.id ? ' vehicle-row--selected' : '')}
                    onClick={() => setSelectedId(v.id)}
                  >
                    <span className={'status-dot status-dot--' + tone} />
                    <span className="vehicle-row-main">
                      <span className="vehicle-row-model">{v.model}</span>
                      <span className="vehicle-row-plate mono">{v.plate}</span>
                    </span>
                    <span className={'pill pill--' + tone}>{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone }) {
  return (
    <div className={'summary-card' + (tone ? ' summary-card--' + tone : '')}>
      <span className="summary-card-value mono">{value}</span>
      <span className="summary-card-label">{label}</span>
    </div>
  );
}

function MapPlaceholder({ vehicles, selected, onSelect }) {
  const withCoords = vehicles.filter((v) => v.lat !== null && v.lng !== null);

  if (withCoords.length === 0) {
    return (
      <div className="map-placeholder map-placeholder--empty">
        <p>No GPS readings yet in TELEMETRY_LOGS for these vehicles.</p>
        <p className="map-placeholder-hint">
          Once tracker data starts writing rows there (matched by tracker_device_id), markers will appear here automatically.
        </p>
      </div>
    );
  }

  const lats = withCoords.map((v) => v.lat);
  const lngs = withCoords.map((v) => v.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

  const toXY = (v) => ({
    x: 8 + ((v.lng - minLng) / (maxLng - minLng || 1)) * 84,
    y: 8 + (1 - (v.lat - minLat) / (maxLat - minLat || 1)) * 84,
  });

  return (
    <div className="map-placeholder">
      <div className="map-placeholder-badge">Map view — connect Google Maps API</div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="map-placeholder-grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={'v' + i} x1={i * 12.5} y1="0" x2={i * 12.5} y2="100" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={'h' + i} x1="0" y1={i * 12.5} x2="100" y2={i * 12.5} />
        ))}
      </svg>

      {withCoords.map((v) => {
        const { tone } = vehicleStatusMeta(v.status);
        const isSelected = v.id === selected?.id;
        return (
          <button
            key={v.id}
            className={'map-marker map-marker--' + tone + (isSelected ? ' map-marker--selected' : '')}
            style={{ left: toXY(v).x + '%', top: toXY(v).y + '%' }}
            onClick={() => onSelect(v.id)}
            title={v.model + ' — ' + v.plate}
          >
            <span className="map-marker-dot" />
          </button>
        );
      })}

      {selected && selected.lat !== null && (
        <div className="map-callout">
          <div className="map-callout-head">
            <span className={'status-dot status-dot--' + vehicleStatusMeta(selected.status).tone} />
            <strong>{selected.plate}</strong>
          </div>
          <p className="map-callout-model">{selected.model}</p>
          <div className="map-callout-meta">
            <span className="mono">{selected.speed} km/h</span>
            <span>Updated {selected.lastUpdate}</span>
          </div>
          <div className="map-callout-coords mono">
            {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
}
