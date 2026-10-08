'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (!res.ok) return;
    const { project } = await res.json();
    router.push(`/projects/${project.id}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">New project</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Project name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md bg-panel px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-accent px-3 py-2 font-medium disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create project'}
        </button>
      </form>
    </main>
  );
}
