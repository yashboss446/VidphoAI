'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchSession, login as loginRequest, logout as logoutRequest, type Session } from './authClient';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: Status;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [session, setSession] = useState<Session | null>(null);

  const refresh = useCallback(async () => {
    const s = await fetchSession();
    setSession(s);
    setStatus(s ? 'authenticated' : 'unauthenticated');
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const ok = await loginRequest(email, password);
      if (ok) await refresh();
      return ok;
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setSession(null);
    setStatus('unauthenticated');
  }, []);

  return (
    <AuthContext.Provider value={{ status, session, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
