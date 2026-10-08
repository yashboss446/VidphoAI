import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  Img,
  Audio,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
} from 'remotion';
import type { EditPlan, Clip } from '@editor/edit-schema';

/** Fades a clip in over its transition duration, relative to the clip's own Sequence. */
function TransitionWrapper({ clip, children }: { clip: Clip; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  if (clip.transition?.type !== 'fade' || clip.transition.durationFrames === 0) {
    return <>{children}</>;
  }
  const opacity = interpolate(frame, [0, clip.transition.durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <div style={{ opacity, width: '100%', height: '100%' }}>{children}</div>;
}

export interface EditPlanCompositionProps {
  editPlan: EditPlan;
  /** Maps a MediaAsset id to a playable URL (signed S3 URL or public URL). */
  assetUrls: Record<string, string>;
}

function clipTransformStyle(clip: Clip): React.CSSProperties {
  const { x, y, scale, rotation } = clip.transform;
  return {
    position: 'absolute',
    inset: 0,
    transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`,
  };
}

function ClipRenderer({ clip, assetUrls }: { clip: Clip; assetUrls: Record<string, string> }) {
  switch (clip.kind) {
    case 'video': {
      const src = assetUrls[clip.assetId];
      if (!src) return null;
      return (
        <div style={clipTransformStyle(clip)}>
          <OffthreadVideo
            src={src}
            startFrom={clip.sourceInFrame}
            volume={clip.volume}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      );
    }
    case 'image': {
      const src = assetUrls[clip.assetId];
      if (!src) return null;
      return (
        <div style={clipTransformStyle(clip)}>
          <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      );
    }
    case 'audio': {
      const src = assetUrls[clip.assetId];
      if (!src) return null;
      return <Audio src={src} startFrom={clip.sourceInFrame} volume={clip.volume} />;
    }
    case 'text': {
      const justify =
        clip.style.position === 'top' ? 'flex-start' : clip.style.position === 'bottom' ? 'flex-end' : 'center';
      return (
        <AbsoluteFill
          style={{
            justifyContent: justify,
            alignItems: 'center',
            padding: 48,
          }}
        >
          <div
            style={{
              fontSize: clip.style.fontSize,
              color: clip.style.color,
              fontWeight: 700,
              textAlign: 'center',
              textShadow: '0 2px 12px rgba(0,0,0,0.6)',
              ...clipTransformStyle(clip),
              position: 'static',
              transform: `translate(${clip.transform.x}px, ${clip.transform.y}px) scale(${clip.transform.scale}) rotate(${clip.transform.rotation}deg)`,
            }}
          >
            {clip.text}
          </div>
        </AbsoluteFill>
      );
    }
    default:
      return null;
  }
}

export const EditPlanComposition: React.FC<EditPlanCompositionProps> = ({
  editPlan,
  assetUrls,
}) => {
  const { fps } = useVideoConfig();
  void fps;
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {editPlan.tracks.map((track) =>
        track.clips.map((clip) => (
          <Sequence
            key={clip.id}
            from={clip.startFrame}
            durationInFrames={clip.durationFrames}
            layout={track.type === 'audio' ? 'none' : undefined}
          >
            <TransitionWrapper clip={clip}>
              <ClipRenderer clip={clip} assetUrls={assetUrls} />
            </TransitionWrapper>
          </Sequence>
        )),
      )}
    </AbsoluteFill>
  );
};
