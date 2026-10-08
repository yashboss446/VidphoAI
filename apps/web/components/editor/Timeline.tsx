'use client';

import type { Clip, EditPlan } from '@editor/edit-schema';
import { TrackRow } from './TrackRow';
import { framesToPixels } from '@/lib/timeline';

export function Timeline({
  editPlan,
  selectedClipId,
  onSelectClip,
  onChangeClip,
}: {
  editPlan: EditPlan;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onChangeClip: (trackId: string, clipId: string, patch: Partial<Clip>) => void;
}) {
  const timelineWidth = Math.max(framesToPixels(editPlan.durationInFrames), 600);

  return (
    <div className="overflow-x-auto rounded-lg bg-panel p-3 ring-1 ring-white/10">
      <div style={{ minWidth: timelineWidth }} className="flex flex-col gap-2">
        {editPlan.tracks.map((track) => (
          <TrackRow
            key={track.id}
            track={track}
            selectedClipId={selectedClipId}
            onSelectClip={onSelectClip}
            onChangeClip={(clipId, patch) => onChangeClip(track.id, clipId, patch)}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-white/40">
        {editPlan.durationInFrames} frames at {editPlan.fps}fps (
        {(editPlan.durationInFrames / editPlan.fps).toFixed(1)}s)
      </p>
    </div>
  );
}
