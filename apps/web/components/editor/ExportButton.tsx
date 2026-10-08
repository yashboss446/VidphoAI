'use client';

import { useRef, useState } from 'react';
import type { EditPlan } from '@editor/edit-schema';
import { apiFetch } from '@/lib/apiClient';
import { Download, Film, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

type RenderStatus = 'idle' | 'saving' | 'queued' | 'processing' | 'completed' | 'failed';
export type Resolution = 'p720' | 'p1080' | 'k2' | 'k4';

const RESOLUTION_LABELS: Record<Resolution, string> = {
  p720: '720p',
  p1080: '1080p',
  k2: '2K',
  k4: '4K',
};

function ResolutionPicker({
  value,
  onChange,
  disabled,
}: {
  value: Resolution;
  onChange: (r: Resolution) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-1.5 rounded-xl border border-panel-border bg-panel/60 px-3 text-sm font-medium text-ink-muted transition-colors hover:text-ink disabled:opacity-50"
      >
        {RESOLUTION_LABELS[value]}
        <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-30 w-32 overflow-hidden rounded-xl border border-panel-border bg-panel-hover/95 p-1 shadow-panel backdrop-blur-xl"
            >
              {(Object.keys(RESOLUTION_LABELS) as Resolution[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onChange(r);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-white/5',
                    r === value ? 'bg-accent/10 text-white' : 'text-ink-muted',
                  )}
                >
                  {RESOLUTION_LABELS[r]}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ExportButton({ projectId, editPlan }: { projectId: string; editPlan: EditPlan }) {
  const [status, setStatus] = useState<RenderStatus>('idle');
  const [resolution, setResolution] = useState<Resolution>('p1080');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const busy = status !== 'idle' && status !== 'completed' && status !== 'failed';

  async function handleExport() {
    setError(null);
    setDownloadUrl(null);
    setProgress(0);
    setStatus('saving');
    try {
      const saveRes = await apiFetch(`/api/projects/${projectId}/editplan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editPlan }),
      });
      if (!saveRes.ok) throw new Error('Failed to save edit plan');
      const { recordId } = await saveRes.json();

      const renderRes = await apiFetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, editPlanRecordId: recordId, resolution }),
      });
      if (!renderRes.ok) throw new Error('Failed to start render');
      const { renderJob } = await renderRes.json();
      setStatus('queued');

      pollRef.current = setInterval(async () => {
        const pollRes = await apiFetch(`/api/render/${renderJob.id}`);
        if (!pollRes.ok) return;
        const { renderJob: updated, downloadUrl: url } = await pollRes.json();
        setStatus(updated.status);
        setProgress(updated.progress ?? 0);
        if (updated.status === 'completed') {
          setDownloadUrl(url ?? null);
          if (pollRef.current) clearInterval(pollRef.current);
        }
        if (updated.status === 'failed') {
          setError(updated.error ?? 'Render failed');
          if (pollRef.current) clearInterval(pollRef.current);
        }
      }, 2000);
    } catch (err) {
      setStatus('failed');
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <ResolutionPicker value={resolution} onChange={setResolution} disabled={busy} />
        <Button onClick={handleExport} disabled={busy} icon={!busy && <Film size={15} />}>
          {busy ? statusLabel(status) : status === 'failed' ? 'Try again' : 'Export'}
        </Button>
      </div>

      <AnimatePresence>
        {busy && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 160 }}
            exit={{ opacity: 0, width: 0 }}
            className="h-1 overflow-hidden rounded-full bg-panel-hover"
          >
            <motion.div
              className="h-full bg-gradient-brand"
              initial={{ width: '0%' }}
              animate={{ width: status === 'processing' ? `${Math.max(progress, 8)}%` : '30%' }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {downloadUrl && (
          <motion.a
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            href={downloadUrl}
            download
            className="flex items-center gap-1.5 text-sm font-medium text-success"
          >
            <CheckCircle2 size={14} /> Download {RESOLUTION_LABELS[resolution]} video{' '}
            <Download size={13} />
          </motion.a>
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-xs text-danger"
          >
            <XCircle size={13} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function statusLabel(status: RenderStatus) {
  switch (status) {
    case 'saving':
      return 'Saving…';
    case 'queued':
      return 'Queued…';
    case 'processing':
      return 'Rendering…';
    default:
      return 'Export';
  }
}
