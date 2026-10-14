import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { verifyAccess } from '../services/api';
import { isSupabaseConfigured, supabase, supabaseConfigMessage } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('checking');
  const [authError, setAuthError] = useState('');
  const checkSequence = useRef(0);

  const verifySession = useCallback(async (session, pendingStatus = 'checking') => {
    const sequence = ++checkSequence.current;
    if (!session?.access_token) {
      setStatus('signedOut');
      return { ok: false, error: null };
    }

    setStatus(pendingStatus);
    const result = await verifyAccess(session.access_token);
    if (sequence !== checkSequence.current) return { ok: false, error: null };

    if (result.status === 'authorized') {
      setAuthError('');
      setStatus('authorized');
      return { ok: true, error: null };
    }

    setStatus('signedOut');
    const message = result.message || 'Dashboard access could not be verified. Please try again.';
    setAuthError(message);
    if (result.status === 'unauthorized' || result.status === 'forbidden') {
      try {
        await supabase?.auth.signOut();
      } catch {
        // Keep the UI signed out even if Supabase cannot clear the remote session.
      }
    }
    return { ok: false, error: message };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthError(supabaseConfigMessage);
      setStatus('signedOut');
      return undefined;
    }

    let active = true;
    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        checkSequence.current += 1;
        setStatus('signedOut');
      } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        queueMicrotask(() => {
          if (active) verifySession(session);
        });
      }
    }).data.subscription;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setAuthError(error.message || 'Could not restore your Supabase session.');
        setStatus('signedOut');
        return;
      }
      verifySession(data.session);
    }).catch(() => {
      if (!active) return;
      setAuthError('Could not restore your Supabase session. Please sign in again.');
      setStatus('signedOut');
    });

    return () => {
      active = false;
      checkSequence.current += 1;
      subscription.unsubscribe();
    };
  }, [verifySession]);

  async function login(email, password) {
    setAuthError('');
    if (!isSupabaseConfigured || !supabase) {
      const error = supabaseConfigMessage;
      setAuthError(error);
      setStatus('signedOut');
      return { error };
    }

    setStatus('signingIn');
    let data;
    let error;
    try {
      ({ data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      }));
    } catch {
      error = { message: 'Supabase Auth could not be reached. Check your connection and try again.' };
    }
    if (error) {
      setStatus('signedOut');
      const message = error.message || 'Unable to sign in. Check your email and password.';
      setAuthError(message);
      return { error: message };
    }

    const result = await verifySession(data.session, 'signingIn');
    return result.ok ? { error: null } : { error: result.error };
  }

  async function logout() {
    checkSequence.current += 1;
    setAuthError('');
    setStatus('signedOut');
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        setAuthError('You have been signed out of this dashboard.');
      }
    }
  }

  const isLoading = status === 'checking';
  const isAuthenticated = status === 'authorized';

  return (
    <AuthContext.Provider value={{
      authError,
      isAuthenticated,
      isLoading,
      login,
      logout,
      status,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
