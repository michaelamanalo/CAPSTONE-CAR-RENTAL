import React from 'react';
import { useTable } from '../hooks/useTable';
import { normalizeVehicle, vehicleStatusMeta } from '../services/normalize';
import { TABLES } from '../services/tableNames';
import DataState from '../components/DataState';
import './ManageFleets.css';

export default function ManageFleets() {
  const { status, rows: vehicles, error } = useTable(TABLES.vehicles, normalizeVehicle);

  if (status !== 'loaded') return <DataState status={status} error={error} />;

  return (
    <div className="fleets-page">
      <div className="fleets-toolbar">
        <span className="mono">{vehicles.length} vehicles</span>
        <button className="fleets-add">+ Add vehicle</button>
      </div>

      {vehicles.length === 0 ? (
        <div className="data-state data-state--empty">No vehicles in the VEHICLE table yet.</div>
      ) : (
        <div className="fleets-grid">
          {vehicles.map((v) => {
            const { tone, label } = vehicleStatusMeta(v.status);
            return (
              <article className="fleet-card" key={v.id}>
                <div className="fleet-card-photo">
                  {/* Swap for a real <img src={v.photoUrl} /> once vehicle photos exist */}
                  <span>{v.model.split(' ')[0]}</span>
                </div>
                <div className="fleet-card-body">
                  <div className="fleet-card-head">
                    <h4>{v.model}</h4>
                    <span className={'pill pill--' + tone}>{label}</span>
                  </div>
                  <p className="fleet-card-plate mono">{v.plate}</p>
                  <p className="fleet-card-id mono">{v.vehicleType} · ₱{v.rate ?? '—'}/day</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
