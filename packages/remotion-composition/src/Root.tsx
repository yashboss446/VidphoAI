import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { EditPlanComposition, type EditPlanCompositionProps } from './EditPlanComposition';
import { createEmptyEditPlan } from '@editor/edit-schema';

const defaultProps: EditPlanCompositionProps = {
  editPlan: createEmptyEditPlan({ durationInFrames: 150 }),
  assetUrls: {},
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="EditPlan"
      component={EditPlanComposition}
      durationInFrames={defaultProps.editPlan.durationInFrames || 150}
      fps={defaultProps.editPlan.fps}
      width={defaultProps.editPlan.width}
      height={defaultProps.editPlan.height}
      defaultProps={defaultProps}
      calculateMetadata={async ({ props }) => ({
        durationInFrames: Math.max(props.editPlan.durationInFrames, 1),
        fps: props.editPlan.fps,
        width: props.editPlan.width,
        height: props.editPlan.height,
      })}
    />
  );
};

registerRoot(RemotionRoot);
