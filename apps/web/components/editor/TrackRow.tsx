'use client';

import { useMemo, useRef } from 'react';
import { Film, Layers, Type, Music, Plus, Loader2 } from 'lucide-react';
import type { Clip, Track, Transition } from '@editor/edit-schema';
import { ClipBlock } from './ClipBlock';
import { ClipGap } from './ClipGap';
import type { UploadedAsset } from './UploadDropzone';
import { useMediaUpload } from '@/lib/useMediaUpload';
import { cn } from '@/lib/cn';

const TRACK_ICON = {
  video: Film,
  overlay: Layers,
  text: Type,
  audio: Music,
} as const;

const ACCEPT_BY_TRACK: Record<Track['type'], string> = {
  video: 'video/*,image/*',
  overlay: 'video/*,image/*',
  text: '',
  audio: 'audio/*',
};

export function TrackRow({
  track,
  projectId,
  selectedClipId,
  onSelectClip,
  onChangeClip,
  onAddAsset,
  onAddText,
  assetUrls,
  playheadFrame,
  beatFrames,
}: {
  track: Track;
  projectId: string;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onChangeClip: (clipId: string, patch: Partial<Clip>) => void;
  onAddAsset: (asset: UploadedAsset, atFrame?: number) => void;
  onAddText: (atFrame?: number) => void;
  assetUrls: Record<string, string>;
  playheadFrame: number;
  beatFrames: number[];
}) {
  const Icon = TRACK_ICON[track.type];
  const { uploadFiles, uploading } = useMediaUpload(projectId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    const uploaded = await uploadFiles(files);
    uploaded.forEach((asset) => onAddAsset(asset));
  }

  const sortedClips = useMemo(
    () => [...track.clips].sort((a, b) => a.startFrame - b.startFrame),
    [track.clips],
  );

  const allEdgeFrames = useMemo(() => {
    const edges: number[] = [];
    for (const c of track.clips) {
      edges.push(c.startFrame, c.startFrame + c.durationFrames);
    }
    return edges;
  }, [track.clips]);

  return (
    <div className="flex items-stretch">
      <div className="flex w-20 flex-shrink-0 items-center gap-1.5 py-2 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        <Icon size={12} />
        {track.type}
        <button
          type="button"
          onClick={() => (track.type === 'text' ? onAddText() : fileInputRef.current?.click())}
          title={track.type === 'text' ? 'Add text' : `Add ${track.type}`}
          className={cn(
            'ml-auto flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-panel-hover text-ink-muted transition-colors hover:bg-gradient-brand hover:text-white',
            uploading.length > 0 && 'pointer-events-none opacity-60',
          )}
        >
          {uploading.length > 0 ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
        </button>
        {track.type !== 'text' && (
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_BY_TRACK[track.type]}
            multiple
            onChange={handleFilesPicked}
            className="hidden"
          />
        )}
      </div>
      <div className="relative h-14 flex-1 rounded-lg bg-white/[0.03] ring-1 ring-inset ring-white/5">
        {track.clips.map((clip) => {
          const otherEdges = allEdgeFrames.filter(
            (f) => f !== clip.startFrame && f !== clip.startFrame + clip.durationFrames,
          );
          const snapCandidates = [...otherEdges, playheadFrame, ...beatFrames];
          return (
            <ClipBlock
              key={clip.id}
              clip={clip}
              trackType={track.type}
              isSelected={clip.id === selectedClipId}
              onSelect={() => onSelectClip(clip.id)}
              onChange={(patch) => onChangeClip(clip.id, patch)}
              assetUrl={clip.kind !== 'text' ? assetUrls[clip.assetId] : undefined}
              snapCandidates={snapCandidates}
              beatFrames={beatFrames}
            />
          );
        })}

        {sortedClips.map((clip, i) => (
          <ClipGap
            key={`gap-${clip.id}`}
            trackType={track.type}
            projectId={projectId}
            atFrame={clip.startFrame + clip.durationFrames}
            nextClip={sortedClips[i + 1]}
            onAddAsset={(asset, atFrame) => onAddAsset(asset, atFrame)}
            onAddText={(atFrame) => onAddText(atFrame)}
            onChangeNextTransition={(transition: Transition) => {
              const next = sortedClips[i + 1];
              if (next) onChangeClip(next.id, { transition } as Partial<Clip>);
            }}
          />
        ))}
      </div>
    </div>
  );
}
