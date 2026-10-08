'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const ok = await login(email, password);
    setLoading(false);
    if (!ok) {
      setError('Invalid email or password.');
      return;
    }
    router.push('/');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md bg-panel px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-accent"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md bg-panel px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-accent"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-accent px-3 py-2 font-medium disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-sm text-white/60">
        No account?{' '}
        <Link href="/register" className="text-accent underline">
          Create one
        </Link>
      </p>
    </main>
  );
}
