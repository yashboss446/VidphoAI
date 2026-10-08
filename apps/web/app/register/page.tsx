'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Something went wrong.');
      setLoading(false);
      return;
    }
    await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    router.push('/');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md bg-panel px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-accent"
        />
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
          placeholder="Password (min 8 characters)"
          required
          minLength={8}
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
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-white/60">
        Already have an account?{' '}
        <Link href="/login" className="text-accent underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
