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
    <div className="flex w-full items-center justify-center rounded-lg bg-black">
      <Player
        component={EditPlanComposition}
        inputProps={{ editPlan, assetUrls }}
        durationInFrames={Math.max(editPlan.durationInFrames, 1)}
        fps={editPlan.fps}
        compositionWidth={editPlan.width}
        compositionHeight={editPlan.height}
        style={{ width: '100%', maxHeight: '70vh' }}
        controls
        loop
      />
    </div>
  );
}
