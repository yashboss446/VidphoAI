import { apiFetch } from './apiClient';

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface Session {
  user: SessionUser;
  expires: string;
}

async function getCsrfToken(): Promise<string> {
  const res = await apiFetch('/api/auth/csrf');
  const { csrfToken } = await res.json();
  return csrfToken;
}

/** Mirrors NextAuth's credentials sign-in flow via raw fetch, since the backend
 * lives on a different subdomain and next-auth/react's client helpers assume
 * same-origin API routes. */
export async function login(email: string, password: string): Promise<boolean> {
  const csrfToken = await getCsrfToken();
  const res = await apiFetch('/api/auth/callback/credentials?json=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email, password, csrfToken, json: 'true' }).toString(),
  });
  return res.ok;
}

export async function logout(): Promise<void> {
  const csrfToken = await getCsrfToken();
  await apiFetch('/api/auth/signout?json=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ csrfToken, json: 'true' }).toString(),
  });
}

export async function fetchSession(): Promise<Session | null> {
  const res = await apiFetch('/api/auth/session');
  if (!res.ok) return null;
  const data = await res.json();
  return data?.user ? data : null;
}
