'use client';

import { Film, Layers, Type, Music } from 'lucide-react';
import type { Clip, Track } from '@editor/edit-schema';
import { ClipBlock } from './ClipBlock';

const TRACK_ICON = {
  video: Film,
  overlay: Layers,
  text: Type,
  audio: Music,
} as const;

export function TrackRow({
  track,
  selectedClipId,
  onSelectClip,
  onChangeClip,
  assetUrls,
}: {
  track: Track;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onChangeClip: (clipId: string, patch: Partial<Clip>) => void;
  assetUrls: Record<string, string>;
}) {
  const Icon = TRACK_ICON[track.type];

  return (
    <div className="flex items-stretch">
      <div className="flex w-20 flex-shrink-0 items-center gap-1.5 py-2 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        <Icon size={12} />
        {track.type}
      </div>
      <div className="relative h-14 flex-1 rounded-lg bg-white/[0.03] ring-1 ring-inset ring-white/5">
        {track.clips.map((clip) => (
          <ClipBlock
            key={clip.id}
            clip={clip}
            trackType={track.type}
            isSelected={clip.id === selectedClipId}
            onSelect={() => onSelectClip(clip.id)}
            onChange={(patch) => onChangeClip(clip.id, patch)}
            assetUrl={clip.kind !== 'text' ? assetUrls[clip.assetId] : undefined}
          />
        ))}
      </div>
    </div>
  );
}
