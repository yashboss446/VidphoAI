const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/** Fetches a backend API path, always including the cross-origin session cookie. */
export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
  });
}
