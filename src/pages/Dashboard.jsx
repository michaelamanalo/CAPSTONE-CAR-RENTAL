import React, { useEffect, useState } from 'react';
import { getDatabaseTables } from '../services/api';
import { normalizeTelemetry, normalizeVehicle, vehicleStatusMeta } from '../services/normalize';
import { TABLES } from '../services/tableNames';
import './Dashboard.css';

function findTable(tables, name) {
  return tables.find((table) => table.name.toLowerCase() === name.toLowerCase());
}

function latestTelemetryByTracker(rows) {
  return rows.map(normalizeTelemetry).reduce((latest, point) => {
    if (point.trackerDeviceId === null || point.trackerDeviceId === undefined) return latest;

    const key = String(point.trackerDeviceId);
    const previous = latest.get(key);
    const timestamp = Date.parse(point.recordedAt || '');
    const previousTimestamp = Date.parse(previous?.recordedAt || '');

    if (!previous || !Number.isFinite(previousTimestamp) || (Number.isFinite(timestamp) && timestamp >= previousTimestamp)) {
      latest.set(key, point);
    }
    return latest;
  }, new Map());
}

function loadDashboardData(result) {
  if (result.status === 'error') {
    return { status: 'error', vehicles: [], error: result.message };
  }

  const tables = result.tables || [];
  const vehicleTable = findTable(tables, TABLES.vehicles);
  if (!vehicleTable || vehicleTable.error) {
    return {
      status: 'error',
      vehicles: [],
      error: vehicleTable?.error || `Table "${TABLES.vehicles}" wasn't found in Supabase.`,
    };
  }

  const telemetryTable = findTable(tables, TABLES.telemetry);
  const telemetryRows = telemetryTable && !telemetryTable.error ? telemetryTable.rows : [];
  const latestByTracker = latestTelemetryByTracker(telemetryRows);
  const vehicles = vehicleTable.rows.map((row) => {
    const vehicle = normalizeVehicle(row);
    const position = vehicle.trackerDeviceId == null
      ? null
      : latestByTracker.get(String(vehicle.trackerDeviceId));

    return position ? { ...vehicle, ...position, trackerDeviceId: vehicle.trackerDeviceId } : vehicle;
  });

  return { status: 'loaded', vehicles, error: null };
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    status: 'loading',
    vehicles: [],
    error: null,
    connection: { status: 'checking', message: '' },
  });

  useEffect(() => {
    let cancelled = false;

    getDatabaseTables().then((result) => {
      if (cancelled) return;

      const data = loadDashboardData(result);
      setDashboard({
        ...data,
        connection: {
          status: result.status === 'loaded' ? 'connected' : 'error',
          message: result.status === 'error' ? result.message : '',
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const trackedVehicles = dashboard.vehicles.filter(
    (vehicle) => Number.isFinite(vehicle.lat) && Number.isFinite(vehicle.lng),
  );
  const trackedCount = dashboard.status === 'loaded' ? trackedVehicles.length : '—';
  const vehicleCount = dashboard.status === 'loaded' ? dashboard.vehicles.length : '—';

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview <span aria-hidden="true">·</span> {trackedCount} active units</p>
        </div>
        <div className={`dashboard-status dashboard-status--${dashboard.connection.status}`} role="status" aria-live="polite">
          <span className="dashboard-status-dot" aria-hidden="true" />
          <span>Supabase: {dashboard.connection.status}</span>
          {dashboard.connection.message && <span className="dashboard-status-message">{dashboard.connection.message}</span>}
        </div>
      </header>

      <div className="dashboard-grid">
        <section className="dashboard-panel dashboard-map-panel" aria-labelledby="dashboard-map-title">
          <div className="dashboard-panel-heading">
            <div>
              <p className="dashboard-eyebrow">Fleet tracking</p>
              <h2 id="dashboard-map-title">Live vehicle locations</h2>
            </div>
            <span className="dashboard-count">{trackedCount} tracked</span>
          </div>
          <div className="dashboard-map-placeholder">
            <span className="dashboard-map-icon" aria-hidden="true">⌖</span>
            <strong>Google Maps integration</strong>
            <p>
              {dashboard.status === 'loading'
                ? 'Loading vehicle locations…'
                : dashboard.status === 'error'
                  ? dashboard.connection.status === 'error'
                    ? 'Connect to the database to load fleet locations.'
                    : 'Vehicle data is unavailable. Check the VEHICLE table.'
                  : trackedVehicles.length
                    ? `${trackedVehicles.length} vehicle${trackedVehicles.length === 1 ? '' : 's'} have GPS coordinates ready to display.`
                    : 'Vehicle locations will appear here when GPS data is available.'}
            </p>
            <span className="dashboard-map-note">Map view pending integration</span>
          </div>
        </section>

        <section className="dashboard-panel dashboard-vehicles-panel" aria-labelledby="dashboard-vehicles-title">
          <div className="dashboard-panel-heading">
            <div>
              <p className="dashboard-eyebrow">Fleet</p>
              <h2 id="dashboard-vehicles-title">Vehicle list</h2>
            </div>
            <span className="dashboard-count">{vehicleCount}</span>
          </div>

          {dashboard.status === 'loading' ? (
            <p className="dashboard-list-message">Loading vehicles…</p>
          ) : dashboard.status === 'error' ? (
            <p className="dashboard-list-message dashboard-list-message--error">
              {dashboard.connection.status === 'error'
                ? 'Fleet data is unavailable. See the connection status above.'
                : dashboard.error}
            </p>
          ) : dashboard.vehicles.length === 0 ? (
            <p className="dashboard-list-message">No vehicles found.</p>
          ) : (
            <ul className="dashboard-vehicle-list">
              {dashboard.vehicles.map((vehicle) => {
                const status = vehicleStatusMeta(vehicle.status);
                const hasLocation = Number.isFinite(vehicle.lat) && Number.isFinite(vehicle.lng);

                return (
                  <li className="dashboard-vehicle" key={vehicle.id}>
                    <div className="dashboard-vehicle-main">
                      <strong>{vehicle.model}</strong>
                      <span className="dashboard-vehicle-plate">{vehicle.plate}</span>
                    </div>
                    <div className="dashboard-vehicle-meta">
                      <span className={`dashboard-vehicle-status dashboard-vehicle-status--${status.tone}`}>{status.label}</span>
                      <span className={`dashboard-gps-status${hasLocation ? ' dashboard-gps-status--available' : ''}`}>
                        {hasLocation ? 'GPS available' : 'No GPS'}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
