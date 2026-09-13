import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTable } from '../hooks/useTable';
import { normalizeUser } from '../services/normalize';
import { TABLES, ALLOWED_LOGIN_ROLES } from '../services/tableNames';

export default function RequireAuth() {
  const { status: authStatus, user, signOut } = useAuth();
  const location = useLocation();

  // Always call hooks unconditionally — the query itself is cheap (it's
  // just filtering rows already returned by /api/tables).
  const usersQuery = useTable(TABLES.users, normalizeUser);

  if (authStatus === 'checking') {
    return <div style={{ padding: 40, color: 'var(--ink-muted)' }}>Checking session…</div>;
  }

  if (authStatus === 'signed-out') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Signed in to Supabase Auth — now confirm this account is allowed on
  // the web dashboard at all (admin/staff only; customers use the app).
  if (usersQuery.status === 'loading') {
    return <div style={{ padding: 40, color: 'var(--ink-muted)' }}>Checking account permissions…</div>;
  }

  if (usersQuery.status === 'error') {
    return (
      <div style={{ padding: 40, color: 'var(--red)' }}>
        Couldn't verify your account role ({usersQuery.error}). Contact your admin.
      </div>
    );
  }

  const myEmail = user?.email?.trim().toLowerCase();
  const profile = usersQuery.rows.find((u) => u.email?.trim().toLowerCase() === myEmail);
  const allowed = profile && ALLOWED_LOGIN_ROLES.includes(profile.role?.trim().toLowerCase());

  if (!allowed) {
    signOut();
    return (
      <Navigate
        to="/login"
        replace
        state={{ error: "This account doesn't have dashboard access. Customers should use the mobile app." }}
      />
    );
  }

  return <Outlet />;
}
