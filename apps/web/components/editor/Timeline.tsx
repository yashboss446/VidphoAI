'use client';

import type { Clip, EditPlan } from '@editor/edit-schema';
import { TrackRow } from './TrackRow';
import type { UploadedAsset } from './UploadDropzone';
import { framesToPixels, pixelsToFrames } from '@/lib/timeline';

export function Timeline({
  editPlan,
  projectId,
  selectedClipId,
  onSelectClip,
  onChangeClip,
  onAddAsset,
  onAddText,
  assetUrls,
  playheadFrame,
  onSeek,
  beatFrames,
}: {
  editPlan: EditPlan;
  projectId: string;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onChangeClip: (trackId: string, clipId: string, patch: Partial<Clip>) => void;
  onAddAsset: (asset: UploadedAsset, atFrame?: number) => void;
  onAddText: (atFrame?: number) => void;
  assetUrls: Record<string, string>;
  playheadFrame: number;
  onSeek: (frame: number) => void;
  beatFrames: number[];
}) {
  const timelineWidth = Math.max(framesToPixels(editPlan.durationInFrames), 600);
  const totalSeconds = Math.ceil(editPlan.durationInFrames / editPlan.fps) + 2;

  function handleRulerClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    onSeek(pixelsToFrames(e.clientX - rect.left));
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-panel-border bg-panel/40 p-4">
      <div className="relative" style={{ minWidth: timelineWidth + 80 }}>
        <div
          className="pointer-events-none absolute bottom-0 top-0 z-20 w-px bg-accent-violet shadow-glow"
          style={{ left: 80 + framesToPixels(playheadFrame) }}
        >
          <div className="absolute -left-1.5 -top-0.5 h-3 w-3 rounded-full bg-accent-violet" />
        </div>

        {beatFrames.map((frame, i) => (
          <div
            key={i}
            className="pointer-events-none absolute bottom-0 top-5 z-10 w-px bg-accent-violet/25"
            style={{ left: 80 + framesToPixels(frame) }}
          />
        ))}

        <div className="flex">
          <div className="w-20 flex-shrink-0" />
          <div
            onClick={handleRulerClick}
            className="relative h-5 flex-1 cursor-pointer border-b border-panel-border/60"
          >
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
              projectId={projectId}
              selectedClipId={selectedClipId}
              onSelectClip={onSelectClip}
              onChangeClip={(clipId, patch) => onChangeClip(track.id, clipId, patch)}
              onAddAsset={onAddAsset}
              onAddText={onAddText}
              assetUrls={assetUrls}
              playheadFrame={playheadFrame}
              beatFrames={beatFrames}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
