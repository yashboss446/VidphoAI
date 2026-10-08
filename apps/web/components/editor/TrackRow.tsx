'use client';

import type { Clip, Track } from '@editor/edit-schema';
import { ClipBlock } from './ClipBlock';

export function TrackRow({
  track,
  selectedClipId,
  onSelectClip,
  onChangeClip,
}: {
  track: Track;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onChangeClip: (clipId: string, patch: Partial<Clip>) => void;
}) {
  return (
    <div className="flex items-stretch">
      <div className="w-20 flex-shrink-0 py-2 text-xs uppercase tracking-wide text-white/40">
        {track.type}
      </div>
      <div className="relative h-14 flex-1 rounded bg-white/5">
        {track.clips.map((clip) => (
          <ClipBlock
            key={clip.id}
            clip={clip}
            trackType={track.type}
            isSelected={clip.id === selectedClipId}
            onSelect={() => onSelectClip(clip.id)}
            onChange={(patch) => onChangeClip(clip.id, patch)}
          />
        ))}
      </div>
    </div>
  );
}
