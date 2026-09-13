import React from 'react';
import './DataState.css';

export default function DataState({ status, error }) {
  if (status === 'loading') {
    return <div className="data-state data-state--loading">Loading from the database…</div>;
  }

  return (
    <div className="data-state data-state--error">
      <strong>Couldn't load this data.</strong>
      <p>{error}</p>
      <p className="data-state-hint">
        Make sure the proxy is running (<code>npm run server</code>) and that{' '}
        <code>.env.server</code> has valid Supabase credentials.
      </p>
    </div>
  );
}
