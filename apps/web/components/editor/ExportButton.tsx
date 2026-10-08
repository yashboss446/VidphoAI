'use client';

import { useRef, useState } from 'react';
import type { EditPlan } from '@editor/edit-schema';
import { apiFetch } from '@/lib/apiClient';

type RenderStatus = 'idle' | 'saving' | 'queued' | 'processing' | 'completed' | 'failed';

export function ExportButton({ projectId, editPlan }: { projectId: string; editPlan: EditPlan }) {
  const [status, setStatus] = useState<RenderStatus>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function handleExport() {
    setError(null);
    setDownloadUrl(null);
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
        body: JSON.stringify({ projectId, editPlanRecordId: recordId }),
      });
      if (!renderRes.ok) throw new Error('Failed to start render');
      const { renderJob } = await renderRes.json();
      setStatus('queued');

      pollRef.current = setInterval(async () => {
        const pollRes = await apiFetch(`/api/render/${renderJob.id}`);
        if (!pollRes.ok) return;
        const { renderJob: updated, downloadUrl: url } = await pollRes.json();
        setStatus(updated.status);
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
      <button
        onClick={handleExport}
        disabled={status !== 'idle' && status !== 'completed' && status !== 'failed'}
        className="rounded-md bg-accent px-4 py-2 font-medium disabled:opacity-50"
      >
        {status === 'idle' || status === 'completed' || status === 'failed' ? 'Export' : 'Exporting…'}
      </button>
      {(status === 'saving' || status === 'queued' || status === 'processing') && (
        <p className="text-xs text-white/50">Status: {status}</p>
      )}
      {downloadUrl && (
        <a href={downloadUrl} className="text-sm text-accent underline" download>
          Download video
        </a>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
