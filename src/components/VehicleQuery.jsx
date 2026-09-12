import React, { useState } from 'react';
import { queryVehicles } from '../services/api';
import './VehicleQuery.css';

function columnsFor(rows) {
  return [...new Set(rows.flatMap((row) => Object.keys(row)))];
}

function displayValue(value) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default function VehicleQuery() {
  const [column, setColumn] = useState('');
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleQuery(event) {
    event.preventDefault();
    setIsLoading(true);
    setResult(await queryVehicles(column.trim(), value));
    setIsLoading(false);
  }

  const rows = result?.rows || [];
  const columns = columnsFor(rows);

  return (
    <section className="vehicle-query">
      <div className="vehicle-query-heading">
        <div>
          <p className="eyebrow">Read-only query</p>
          <h3>VEHICLE table</h3>
        </div>
        <span className="table-label">100 row limit</span>
      </div>

      <form className="vehicle-query-form" onSubmit={handleQuery}>
        <label>
          Column
          <input value={column} onChange={(event) => setColumn(event.target.value)} placeholder="Leave blank for all rows" />
        </label>
        <label>
          Exact value
          <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Leave blank for all rows" />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Querying...' : 'Run query'}
        </button>
      </form>

      {result && (
        <p className={`database-message ${result.status === 'loaded' ? 'success' : 'error'}`}>
          {result.message}
        </p>
      )}

      {result?.status === 'loaded' && rows.length === 0 && (
        <p className="database-empty">No matching VEHICLE rows.</p>
      )}

      {rows.length > 0 && (
        <div className="database-table-scroll">
          <table>
            <thead>
              <tr>{columns.map((name) => <th key={name}>{name}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`vehicle-${index}`}>
                  {columns.map((name) => <td key={name}>{displayValue(row[name])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}