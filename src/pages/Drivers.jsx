import React from 'react';
import DataState from '../components/DataState';
import PageHeader from '../components/PageHeader';
import { useTable } from '../hooks/useTable';
import { normalizeUser } from '../services/normalize';
import { TABLES } from '../services/tableNames';
import './Drivers.css';

export default function Drivers() {
  const { status, rows: users, error } = useTable(TABLES.users, normalizeUser);

  if (status !== 'loaded') {
    return (
      <>
        <PageHeader title="Drivers" description="Driver accounts from the USERS table." />
        <DataState status={status} error={error} />
      </>
    );
  }

  const drivers = users.filter((user) => String(user.role).trim().toLowerCase() === 'driver');

  return (
    <>
      <PageHeader title="Drivers" description="Driver accounts from the USERS table." />
      {drivers.length === 0 ? (
        <div className="data-state data-state--empty">No driver accounts were found in the USERS table.</div>
      ) : (
        <div className="drivers-list">
          {drivers.map((driver) => (
            <article className="drivers-row" key={driver.id}>
              <div className="drivers-avatar" aria-hidden="true">
                {driver.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="drivers-info">
                <h2>{driver.name}</h2>
                <p>{driver.email}</p>
                <p>{driver.phone}</p>
              </div>
              <span className="drivers-role">Driver</span>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
