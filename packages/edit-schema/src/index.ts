import { z } from 'zod';

export const TransformSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  scale: z.number().default(1),
  rotation: z.number().default(0),
});
export type Transform = z.infer<typeof TransformSchema>;

export const TransitionSchema = z.object({
  type: z.enum(['none', 'fade', 'wipe', 'slide']),
  durationFrames: z.number().int().nonnegative(),
});
export type Transition = z.infer<typeof TransitionSchema>;

const ClipBaseSchema = z.object({
  id: z.string(),
  // Frame at which this clip starts on its track, relative to the start of the EditPlan.
  startFrame: z.number().int().nonnegative(),
  durationFrames: z.number().int().positive(),
  // Frame offset into the source asset where playback begins (ignored for text clips).
  sourceInFrame: z.number().int().nonnegative().default(0),
  transform: TransformSchema.default({}),
  transition: TransitionSchema.optional(),
});

export const VideoClipSchema = ClipBaseSchema.extend({
  kind: z.literal('video'),
  assetId: z.string(),
  volume: z.number().min(0).max(1).default(1),
});
export type VideoClip = z.infer<typeof VideoClipSchema>;

export const ImageClipSchema = ClipBaseSchema.extend({
  kind: z.literal('image'),
  assetId: z.string(),
});
export type ImageClip = z.infer<typeof ImageClipSchema>;

export const TextClipSchema = ClipBaseSchema.extend({
  kind: z.literal('text'),
  text: z.string(),
  style: z.object({
    fontSize: z.number().positive().default(64),
    color: z.string().default('#ffffff'),
    position: z.enum(['top', 'center', 'bottom']).default('bottom'),
  }),
});
export type TextClip = z.infer<typeof TextClipSchema>;

export const AudioClipSchema = ClipBaseSchema.extend({
  kind: z.literal('audio'),
  assetId: z.string(),
  volume: z.number().min(0).max(1).default(1),
});
export type AudioClip = z.infer<typeof AudioClipSchema>;

export const ClipSchema = z.discriminatedUnion('kind', [
  VideoClipSchema,
  ImageClipSchema,
  TextClipSchema,
  AudioClipSchema,
]);
export type Clip = z.infer<typeof ClipSchema>;

export const TrackSchema = z.object({
  id: z.string(),
  type: z.enum(['video', 'overlay', 'text', 'audio']),
  clips: z.array(ClipSchema),
});
export type Track = z.infer<typeof TrackSchema>;

export const EditPlanSchema = z.object({
  id: z.string(),
  version: z.number().int().nonnegative(),
  fps: z.number().int().positive().default(30),
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1920),
  durationInFrames: z.number().int().nonnegative(),
  tracks: z.array(TrackSchema),
});
export type EditPlan = z.infer<typeof EditPlanSchema>;

export function createEmptyEditPlan(overrides: Partial<EditPlan> = {}): EditPlan {
  return EditPlanSchema.parse({
    id: overrides.id ?? crypto.randomUUID(),
    version: overrides.version ?? 0,
    fps: overrides.fps ?? 30,
    width: overrides.width ?? 1080,
    height: overrides.height ?? 1920,
    durationInFrames: overrides.durationInFrames ?? 0,
    tracks:
      overrides.tracks ??
      [
        { id: crypto.randomUUID(), type: 'video', clips: [] },
        { id: crypto.randomUUID(), type: 'overlay', clips: [] },
        { id: crypto.randomUUID(), type: 'text', clips: [] },
        { id: crypto.randomUUID(), type: 'audio', clips: [] },
      ],
  });
}

/** Recomputes durationInFrames from the furthest clip end across all tracks. */
export function recomputeDuration(plan: EditPlan): EditPlan {
  let maxEnd = 0;
  for (const track of plan.tracks) {
    for (const clip of track.clips) {
      maxEnd = Math.max(maxEnd, clip.startFrame + clip.durationFrames);
    }
  }
  return { ...plan, durationInFrames: maxEnd };
}
