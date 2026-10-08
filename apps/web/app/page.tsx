'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { apiFetch } from '@/lib/apiClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, LogOut, Clapperboard, Film } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { formatRelativeTime } from '@/lib/time';
import { gradientFromId } from '@/lib/colorFromId';

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
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-panel-border border-t-accent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface">
      <header className="sticky top-0 z-10 border-b border-panel-border/60 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink">Your projects</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {projects.length > 0
                ? `${projects.length} project${projects.length === 1 ? '' : 's'}`
                : 'Nothing here yet — start your first edit.'}
            </p>
          </div>
          <Link href="/projects/new">
            <Button icon={<Plus size={16} />}>New project</Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="group block overflow-hidden rounded-2xl border border-panel-border bg-panel/50 transition-all hover:-translate-y-1 hover:border-white/15 hover:shadow-panel"
                >
                  <div
                    className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${gradientFromId(project.id)}`}
                  >
                    <Clapperboard className="h-9 w-9 text-white/90 transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0" />
                  </div>
                  <div className="p-4">
                    <p className="truncate font-medium text-ink">{project.name}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      Edited {formatRelativeTime(project.updatedAt)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-panel-border bg-panel/30 py-20 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand/20">
        <Film className="h-7 w-7 text-accent-violet" />
      </div>
      <div>
        <p className="font-medium text-ink">No projects yet</p>
        <p className="mt-1 text-sm text-ink-muted">Upload your first clips and start editing.</p>
      </div>
      <Link href="/projects/new">
        <Button icon={<Plus size={16} />}>Create your first project</Button>
      </Link>
    </motion.div>
  );
}
