import { generateId, type Clip, type EditPlan, type Track } from '@editor/edit-schema';
import type { UploadedAsset } from '@/components/editor/UploadDropzone';

export function trackByType(plan: EditPlan, type: Track['type']): Track {
  const track = plan.tracks.find((t) => t.type === type);
  if (!track) throw new Error(`Missing ${type} track on EditPlan`);
  return track;
}

function trackEndFrame(track: Track): number {
  return track.clips.reduce((max, c) => Math.max(max, c.startFrame + c.durationFrames), 0);
}

export function clipForAsset(
  plan: EditPlan,
  asset: UploadedAsset,
  atFrame?: number,
): { trackType: Track['type']; clip: Clip } {
  const id = generateId();

  if (asset.kind === 'video') {
    const track = trackByType(plan, 'video');
    const durationFrames = Math.max(1, Math.round((asset.durationSec ?? 5) * plan.fps));
    return {
      trackType: 'video',
      clip: {
        id,
        kind: 'video',
        assetId: asset.id,
        startFrame: atFrame ?? trackEndFrame(track),
        durationFrames,
        sourceInFrame: 0,
        transform: { x: 0, y: 0, scale: 1, rotation: 0 },
        volume: 1,
        fadeInFrames: 0,
        fadeOutFrames: 0,
        speed: 1,
        flipHorizontal: false,
        flipVertical: false,
        filter: 'none',
        brightness: 100,
        contrast: 100,
      },
    };
  }

  if (asset.kind === 'image') {
    const track = trackByType(plan, 'video');
    const durationFrames = plan.fps * 3;
    return {
      trackType: 'video',
      clip: {
        id,
        kind: 'image',
        assetId: asset.id,
        startFrame: atFrame ?? trackEndFrame(track),
        durationFrames,
        sourceInFrame: 0,
        transform: { x: 0, y: 0, scale: 1, rotation: 0 },
        fadeInFrames: 0,
        fadeOutFrames: 0,
        flipHorizontal: false,
        flipVertical: false,
        filter: 'none',
        brightness: 100,
        contrast: 100,
      },
    };
  }

  // audio
  const track = trackByType(plan, 'audio');
  const durationFrames = Math.max(1, Math.round((asset.durationSec ?? 10) * plan.fps));
  return {
    trackType: 'audio',
    clip: {
      id,
      kind: 'audio',
      assetId: asset.id,
      startFrame: atFrame ?? trackEndFrame(track),
      durationFrames,
      sourceInFrame: 0,
      transform: { x: 0, y: 0, scale: 1, rotation: 0 },
      volume: 1,
      fadeInFrames: 0,
      fadeOutFrames: 0,
      speed: 1,
    },
  };
}

export function newTextClip(plan: EditPlan, atFrame?: number): Clip {
  const track = trackByType(plan, 'text');
  return {
    id: generateId(),
    kind: 'text',
    startFrame: atFrame ?? trackEndFrame(track),
    durationFrames: plan.fps * 3,
    sourceInFrame: 0,
    transform: { x: 0, y: 0, scale: 1, rotation: 0 },
    fadeInFrames: 0,
    fadeOutFrames: 0,
    text: 'Your text here',
    style: {
      fontSize: 64,
      color: '#ffffff',
      position: 'bottom',
      fontFamily: 'sora',
      fontWeight: 'bold',
      italic: false,
      align: 'center',
      letterSpacing: 0,
      animation: 'none',
    },
  };
}
