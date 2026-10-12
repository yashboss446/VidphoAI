'use client';

import { useEffect, useRef, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { EditPlanComposition } from '@editor/remotion-composition';
import type { Clip, EditPlan } from '@editor/edit-schema';
import { CanvasOverlay } from './CanvasOverlay';

export function RemotionStage({
  editPlan,
  assetUrls,
  playheadFrame,
  onFrameChange,
  selectedClip,
  onChangeSelectedClip,
}: {
  editPlan: EditPlan;
  assetUrls: Record<string, string>;
  playheadFrame: number;
  onFrameChange: (frame: number) => void;
  selectedClip: Clip | null;
  onChangeSelectedClip: (patch: Partial<Clip>) => void;
}) {
  const playerRef = useRef<PlayerRef>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [renderedWidth, setRenderedWidth] = useState(0);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setRenderedWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const canvasScale = renderedWidth > 0 ? renderedWidth / editPlan.width : 0;

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const handleFrameSync = () => onFrameChange(player.getCurrentFrame());
    player.addEventListener('seeked', handleFrameSync);
    player.addEventListener('pause', handleFrameSync);
    player.addEventListener('frameupdate', handleFrameSync);
    return () => {
      player.removeEventListener('seeked', handleFrameSync);
      player.removeEventListener('pause', handleFrameSync);
      player.removeEventListener('frameupdate', handleFrameSync);
    };
  }, [onFrameChange]);

  useEffect(() => {
    const player = playerRef.current;
    // Skip while actively playing — the player is already driving its own frame
    // advancement, and seeking here would just be re-echoing its own last
    // frameupdate (and fighting smooth playback in the process). Only used to
    // apply external seeks (ruler clicks, etc.) while paused.
    if (player && !player.isPlaying() && player.getCurrentFrame() !== playheadFrame) {
      player.seekTo(playheadFrame);
    }
  }, [playheadFrame]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-panel-border bg-panel/40 p-6">
      <div className="relative w-full max-w-sm">
        <div
          ref={stageRef}
          className="overflow-hidden rounded-xl bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_60px_-20px_rgba(0,0,0,0.8)]"
        >
          <Player
            ref={playerRef}
            component={EditPlanComposition}
            inputProps={{ editPlan, assetUrls }}
            durationInFrames={Math.max(editPlan.durationInFrames, 1)}
            fps={editPlan.fps}
            compositionWidth={editPlan.width}
            compositionHeight={editPlan.height}
            style={{ width: '100%' }}
            controls
            loop
          />
        </div>
        {canvasScale > 0 && (
          <CanvasOverlay clip={selectedClip} scale={canvasScale} onChange={onChangeSelectedClip} />
        )}
      </div>
      <p className="text-xs text-ink-faint">
        {editPlan.width}×{editPlan.height} · {editPlan.fps}fps ·{' '}
        {(editPlan.durationInFrames / editPlan.fps).toFixed(1)}s
      </p>
    </div>
  );
}
