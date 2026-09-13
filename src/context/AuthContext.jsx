import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // status: 'checking' | 'signed-out' | 'signed-in'
  const [status, setStatus] = useState('checking');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('signed-out');
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setStatus(data.session ? 'signed-in' : 'signed-out');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setStatus(session ? 'signed-in' : 'signed-out');
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase isn\'t configured in this browser build — see .env.local.' };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  }

  async function signOut() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setStatus('signed-out');
  }

  return (
    <AuthContext.Provider value={{ status, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
