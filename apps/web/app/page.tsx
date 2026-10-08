'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { apiFetch } from '@/lib/apiClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { status, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    apiFetch('/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data.projects ?? []));
  }, [status]);

  if (status !== 'authenticated') {
    return <p className="p-6 text-white/60">Loading…</p>;
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your projects</h1>
        <div className="flex items-center gap-3">
          <Link href="/projects/new" className="rounded-md bg-accent px-3 py-2 text-sm font-medium">
            New project
          </Link>
          <button onClick={() => logout()} className="text-sm text-white/50 hover:underline">
            Sign out
          </button>
        </div>
      </header>

      {projects.length === 0 ? (
        <p className="text-white/40">No projects yet. Create one to get started.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="block rounded-md bg-panel p-3 ring-1 ring-white/10 hover:ring-accent"
              >
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
