import React, { useState } from 'react';
import { useFleetSnapshot } from '../hooks/useFleetSnapshot';
import { vehicleStatusMeta } from '../services/normalize';
import DataState from '../components/DataState';
import PageHeader from '../components/PageHeader';
import './ManageFleets.css';

function locationFor(vehicle) {
  if (!Number.isFinite(vehicle.lat) || !Number.isFinite(vehicle.lng)) return 'No GPS data';
  return vehicle.lat.toFixed(5) + ', ' + vehicle.lng.toFixed(5);
}

function updateFor(value) {
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

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 14 2-6a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 8l2 6v5h-2v-2H5v2H3z" />
      <path d="M5 13h14M6.5 16h.01M17.5 16h.01" />
    </svg>
  );
}

export default function ManageFleets() {
  const { status, vehicles, error } = useFleetSnapshot();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  if (status !== 'loaded') {
    return (
      <>
        <PageHeader title="Fleet" description="Vehicles and their current rental status." />
        <DataState status={status} error={error} />
      </>
    );
  }

  const queryText = query.trim().toLowerCase();
  const statuses = [...new Set(vehicles.map((vehicle) => String(vehicle.status)))];
  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchable = [
      vehicle.id,
      vehicle.model,
      vehicle.plate,
      Number.isFinite(vehicle.lat) ? vehicle.lat.toFixed(5) : '',
      Number.isFinite(vehicle.lng) ? vehicle.lng.toFixed(5) : '',
    ].join(' ').toLowerCase();
    return (!queryText || searchable.includes(queryText))
      && (statusFilter === 'all' || String(vehicle.status) === statusFilter);
  });
  const selectedVehicle = filteredVehicles.find(
    (vehicle) => String(vehicle.id) === String(selectedVehicleId),
  ) || filteredVehicles[0] || null;

  function clearFilters() {
    setQuery('');
    setStatusFilter('all');
  }

  return (
    <>
      <PageHeader title="Fleet" description="Vehicles and their current rental status." />
      <div className="fleet-management-page">
        <article className="fleet-table-card">
          <div className="fleet-table-heading">
            <div>
              <p className="fleet-section-kicker">YOUR VEHICLES</p>
              <h2>Fleet status <span>{filteredVehicles.length}</span></h2>
            </div>
            <div className="fleet-controls">
              <label className="fleet-search" htmlFor="fleet-search">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" /></svg>
                <input
                  id="fleet-search"
                  aria-label="Search vehicles"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search fleet"
                />
              </label>
              <label className="fleet-status-filter" htmlFor="fleet-status">
                <select id="fleet-status" aria-label="Filter vehicles by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">All statuses</option>
                  {statuses.map((vehicleStatus) => (
                    <option value={vehicleStatus} key={vehicleStatus}>
                      {vehicleStatusMeta(vehicleStatus).label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {filteredVehicles.length ? (
            <div className="fleet-table-scroll">
              <table className="fleet-table">
                <thead>
                  <tr><th>VEHICLE</th><th>STATUS</th><th>LOCATION</th><th>LAST UPDATE</th></tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => {
                    const statusMeta = vehicleStatusMeta(vehicle.status);
                    const selected = String(vehicle.id) === String(selectedVehicle?.id);
                    return (
                      <tr className={selected ? 'fleet-row fleet-row--selected' : 'fleet-row'} key={vehicle.id} aria-selected={selected}>
                        <td>
                          <button
                            className="fleet-vehicle-select"
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setSelectedVehicleId(vehicle.id)}
                          >
                            <span className="fleet-vehicle-icon"><CarIcon /></span>
                            <span className="fleet-vehicle-copy">
                              <strong>{vehicle.model}</strong>
                              <small>{vehicle.id} · {vehicle.plate}</small>
                            </span>
                          </button>
                        </td>
                        <td><span className={'fleet-status-pill fleet-status-pill--' + statusMeta.tone}>{statusMeta.label}</span></td>
                        <td>{locationFor(vehicle)}</td>
                        <td>{updateFor(vehicle.recordedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="fleet-empty">
              <strong>{vehicles.length ? 'No vehicles match' : 'No vehicles found'}</strong>
              <span>{vehicles.length ? 'Try another name, plate, coordinate, or status filter.' : 'There are no vehicles in the VEHICLE table yet.'}</span>
              {!!vehicles.length && <button type="button" onClick={clearFilters}>Clear filters</button>}
            </div>
          )}
          <div className="fleet-table-footer">
            <span>{filteredVehicles.length === vehicles.length ? 'Showing all ' + vehicles.length + ' vehicles' : 'Showing ' + filteredVehicles.length + ' of ' + vehicles.length + ' vehicles'}</span>
            <span>GPS coordinates come from the latest telemetry record.</span>
          </div>
        </article>

        <article className="fleet-detail-card">
          <div className="fleet-detail-heading">
            <div>
              <p className="fleet-section-kicker">VEHICLE RECORD</p>
              <h2>Selected vehicle</h2>
            </div>
            {selectedVehicle && <span className="fleet-detail-live"><i />LIVE DATA</span>}
          </div>
          {selectedVehicle ? (
            <div className="fleet-detail-content">
              <div className="fleet-detail-top">
                <span className="fleet-detail-icon"><CarIcon /></span>
                <div>
                  <h3>{selectedVehicle.model}</h3>
                  <span>{selectedVehicle.id} · {selectedVehicle.plate}</span>
                </div>
                <span className={'fleet-status-pill fleet-status-pill--' + vehicleStatusMeta(selectedVehicle.status).tone}>
                  {vehicleStatusMeta(selectedVehicle.status).label}
                </span>
              </div>
              <div className="fleet-detail-facts">
                <div><span>Vehicle type</span><strong>{selectedVehicle.vehicleType || '—'}</strong></div>
                <div><span>Daily rate</span><strong>{selectedVehicle.rate == null ? '—' : '₱' + selectedVehicle.rate}</strong></div>
                <div><span>Last GPS location</span><strong>{locationFor(selectedVehicle)}</strong></div>
                <div><span>Current speed</span><strong>{selectedVehicle.recordedAt ? (selectedVehicle.speed || 0) + ' km/h' : '—'}</strong></div>
                <div><span>Last GPS update</span><strong>{updateFor(selectedVehicle.recordedAt)}</strong></div>
                <div><span>Tracker device</span><strong>{selectedVehicle.trackerDeviceId || 'Not assigned'}</strong></div>
              </div>
            </div>
          ) : (
            <div className="fleet-detail-empty">
              <strong>No vehicle selected</strong>
              <span>Choose a vehicle row to view its record.</span>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
