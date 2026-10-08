'use client';

import { Player } from '@remotion/player';
import { EditPlanComposition } from '@editor/remotion-composition';
import type { EditPlan } from '@editor/edit-schema';

export function RemotionStage({
  editPlan,
  assetUrls,
}: {
  editPlan: EditPlan;
  assetUrls: Record<string, string>;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-panel-border bg-panel/40 p-6">
      <div className="relative w-full max-w-sm overflow-hidden rounded-xl bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_60px_-20px_rgba(0,0,0,0.8)]">
        <Player
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
      <p className="text-xs text-ink-faint">
        {editPlan.width}×{editPlan.height} · {editPlan.fps}fps ·{' '}
        {(editPlan.durationInFrames / editPlan.fps).toFixed(1)}s
      </p>
    </div>
  );
}
