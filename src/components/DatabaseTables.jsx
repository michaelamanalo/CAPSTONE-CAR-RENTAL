import React, { useState } from 'react';
import { getDatabaseTables } from '../services/api';
import './DatabaseTables.css';

function columnsFor(rows) {
  return [...new Set(rows.flatMap((row) => Object.keys(row)))];
}

function displayValue(value) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default function DatabaseTables() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadTables() {
    setIsLoading(true);
    setResult(null);
    setResult(await getDatabaseTables());
    setIsLoading(false);
  }

  return (
    <section className="database-tables">
      <div className="database-tables-heading">
        <div>
          <p className="eyebrow">Supabase explorer</p>
          <h3>Database tables</h3>
        </div>
        <button type="button" onClick={loadTables} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Load tables'}
        </button>
      </div>

      {result && result.message && (
        <p className={`database-message ${result.status === 'loaded' ? 'success' : 'error'}`}>
          {result.message}
        </p>
      )}

      {result && result.tables.length === 0 && result.status === 'loaded' && (
        <p className="database-empty">No tables are exposed to this Supabase API key.</p>
      )}

      <div className="database-table-list">
        {result && result.tables.map((table) => {
          const columns = columnsFor(table.rows);

          return (
            <article className="database-table" key={table.name}>
              <div className="database-table-title">
                <h4>{table.name}</h4>
                <span>{table.rows.length} rows</span>
              </div>
              {table.error ? (
                <p className="database-message error">{table.error}</p>
              ) : table.rows.length === 0 ? (
                <p className="database-empty">This table has no rows.</p>
              ) : (
                <div className="database-table-scroll">
                  <table>
                    <thead>
                      <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIndex) => (
                        <tr key={`${table.name}-${rowIndex}`}>
                          {columns.map((column) => <td key={column}>{displayValue(row[column])}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}