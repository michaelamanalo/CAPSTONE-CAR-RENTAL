import React from 'react';
import { useTable } from '../hooks/useTable';
import { normalizeUser } from '../services/normalize';
import { TABLES } from '../services/tableNames';
import DataState from '../components/DataState';
import './Staff.css';

export default function Staff() {
  const { status, rows: users, error } = useTable(TABLES.users, normalizeUser);

  if (status !== 'loaded') return <DataState status={status} error={error} />;

  // This page manages internal accounts only — customers are excluded.
  const staff = users.filter((u) => u.role === 'admin' || u.role === 'staff');

  return (
    <div className="staff-page">
      {staff.length === 0 ? (
        <div className="data-state data-state--empty">No admin/staff accounts in the USERS table yet.</div>
      ) : (
        <div className="staff-list">
          {staff.map((s) => (
            <div className="staff-row" key={s.id}>
              <div className="staff-avatar">{s.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>
              <div className="staff-info">
                <div className="staff-name">{s.name}</div>
                <div className="staff-email mono">{s.email}</div>
              </div>
              <span className={'pill ' + (s.role === 'admin' ? 'pill--alert' : 'pill--active')}>{s.role}</span>
            </div>
          ))}
        </div>
      )}
      <button className="staff-add">+ Add staff account</button>
    </div>
  );
}
