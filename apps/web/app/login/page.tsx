'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, Film, Music2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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
    <main className="grid min-h-screen grid-cols-1 bg-surface lg:grid-cols-2">
      <BrandPanel />

      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1.5 text-sm text-ink-muted">Sign in to keep editing where you left off.</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              required
              icon={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              required
              icon={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-sm text-danger"
              >
                {error}
              </motion.p>
            )}
            <Button type="submit" size="lg" loading={loading} className="mt-2 w-full justify-center">
              {!loading && (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-sm text-ink-muted">
            No account?{' '}
            <Link href="/register" className="font-medium text-white underline-offset-4 hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function BrandPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-surface-raised p-12 lg:flex">
      <div className="absolute inset-0 bg-gradient-mesh" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#08080c_90%)]" />

      <div className="relative z-10">
        <Logo size="lg" />
      </div>

      <div className="relative z-10 max-w-md">
        <h2 className="font-display text-3xl font-semibold leading-tight text-ink">
          Raw footage in.
          <br />
          <span className="text-gradient">A finished reel out.</span>
        </h2>
        <p className="mt-4 text-ink-muted">
          Describe the edit you want, or trim it yourself frame-by-frame — same timeline, same render,
          either way.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Feature icon={<Sparkles size={16} />} text="Chat-driven AI edits (coming soon)" />
          <Feature icon={<Film size={16} />} text="Full manual timeline, trims, and transitions" />
          <Feature icon={<Music2 size={16} />} text="Sync cuts to your own music" />
        </div>
      </div>

      <p className="relative z-10 text-xs text-ink-faint">© {new Date().getFullYear()} VidphoAI</p>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-ink-muted">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-panel-border bg-panel/60 text-accent-violet">
        {icon}
      </span>
      {text}
    </div>
  );
}
