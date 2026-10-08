'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiClient';
import { motion } from 'framer-motion';
import { ArrowLeft, Clapperboard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await apiFetch('/api/projects', {
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4">
      <div className="absolute inset-0 bg-gradient-mesh opacity-60" />

      <Link
        href="/"
        className="absolute left-6 top-6 z-10 flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="glass-panel relative z-10 w-full max-w-sm rounded-2xl p-8"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-sm">
          <Clapperboard size={22} className="text-white" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold text-ink">New project</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Give it a name — you can change it later.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Summer trip reel"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" size="lg" loading={loading} className="w-full justify-center">
            {!loading && (
              <>
                Create project <ArrowRight size={16} />
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
