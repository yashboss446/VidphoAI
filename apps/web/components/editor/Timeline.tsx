'use client';

import type { Clip, EditPlan } from '@editor/edit-schema';
import { TrackRow } from './TrackRow';
import { framesToPixels } from '@/lib/timeline';

export function Timeline({
  editPlan,
  selectedClipId,
  onSelectClip,
  onChangeClip,
  assetUrls,
}: {
  editPlan: EditPlan;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onChangeClip: (trackId: string, clipId: string, patch: Partial<Clip>) => void;
  assetUrls: Record<string, string>;
}) {
  const timelineWidth = Math.max(framesToPixels(editPlan.durationInFrames), 600);
  const totalSeconds = Math.ceil(editPlan.durationInFrames / editPlan.fps) + 2;

  return (
    <div className="overflow-x-auto rounded-2xl border border-panel-border bg-panel/40 p-4">
      <div style={{ minWidth: timelineWidth + 80 }}>
        <div className="flex">
          <div className="w-20 flex-shrink-0" />
          <div className="relative h-5 flex-1 border-b border-panel-border/60">
            {Array.from({ length: totalSeconds + 1 }).map((_, s) => (
              <div
                key={s}
                style={{ left: framesToPixels(s * editPlan.fps) }}
                className="absolute bottom-0 flex items-end gap-1"
              >
                <div className="h-2 w-px bg-panel-border" />
                <span className="translate-y-[1px] text-[10px] tabular-nums text-ink-faint">{s}s</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          {editPlan.tracks.map((track) => (
            <TrackRow
              key={track.id}
              track={track}
              selectedClipId={selectedClipId}
              onSelectClip={onSelectClip}
              onChangeClip={(clipId, patch) => onChangeClip(track.id, clipId, patch)}
              assetUrls={assetUrls}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
