'use client';

import { useRef, useState } from 'react';
import { Plus, Film, Sparkles, Loader2 } from 'lucide-react';
import type { Clip, Track, Transition } from '@editor/edit-schema';
import { cn } from '@/lib/cn';
import { framesToPixels } from '@/lib/timeline';
import { useMediaUpload } from '@/lib/useMediaUpload';
import type { UploadedAsset } from './UploadDropzone';
import { TransitionEditor } from './TransitionEditor';

const ACCEPT_BY_TRACK: Record<Track['type'], string> = {
  video: 'video/*,image/*',
  overlay: 'video/*,image/*',
  text: '',
  audio: 'audio/*',
};

/** The "+" between (or after) clips on a track — add a new clip at this exact frame,
 * or, when there's a clip immediately following, set the transition for that boundary. */
export function ClipGap({
  trackType,
  projectId,
  atFrame,
  nextClip,
  onAddAsset,
  onAddText,
  onChangeNextTransition,
}: {
  trackType: Track['type'];
  projectId: string;
  atFrame: number;
  nextClip: Clip | undefined;
  onAddAsset: (asset: UploadedAsset, atFrame: number) => void;
  onAddText: (atFrame: number) => void;
  onChangeNextTransition: (transition: Transition) => void;
}) {
  const [open, setOpen] = useState<'closed' | 'menu' | 'transition'>('closed');
  const { uploadFiles, uploading } = useMediaUpload(projectId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasAdjacentNext = !!nextClip && nextClip.startFrame === atFrame;

  async function handleFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    setOpen('closed');
    if (files.length === 0) return;
    const uploaded = await uploadFiles(files);
    uploaded.forEach((asset) => onAddAsset(asset, atFrame));
  }

  function handleAddClick() {
    if (trackType === 'text') {
      onAddText(atFrame);
      setOpen('closed');
    } else {
      fileInputRef.current?.click();
    }
  }

  return (
    <div className="absolute top-0 z-20 h-full" style={{ left: framesToPixels(atFrame) }}>
      <div className="relative h-full">
        <button
          type="button"
          title="Add clip or set transition"
          onClick={() => setOpen((o) => (o === 'closed' ? 'menu' : 'closed'))}
          className={cn(
            'absolute left-0 top-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-panel text-ink-faint shadow-sm transition-all hover:scale-110 hover:bg-gradient-brand hover:text-white',
            open !== 'closed' && 'bg-gradient-brand text-white',
          )}
        >
          {uploading.length > 0 ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
        </button>

        {open !== 'closed' && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen('closed')} />
            <div className="absolute left-0 top-6 z-30 w-48 -translate-x-1/2 rounded-xl border border-panel-border bg-surface-raised p-2 shadow-panel">
              {open === 'menu' && (
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={handleAddClick}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink transition-colors hover:bg-panel-hover"
                  >
                    <Film size={13} /> Add clip here
                  </button>
                  <button
                    type="button"
                    disabled={!hasAdjacentNext}
                    onClick={() => setOpen('transition')}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink transition-colors hover:bg-panel-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <Sparkles size={13} />
                    {hasAdjacentNext ? 'Transition' : 'Transition (no adjacent clip)'}
                  </button>
                </div>
              )}
              {open === 'transition' && nextClip && (
                <div className="flex flex-col gap-2 p-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                    Transition into next clip
                  </p>
                  <TransitionEditor transition={nextClip.transition} onChange={onChangeNextTransition} />
                </div>
              )}
            </div>
          </>
        )}

        {trackType !== 'text' && (
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_BY_TRACK[trackType]}
            multiple
            onChange={handleFilesPicked}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
}
