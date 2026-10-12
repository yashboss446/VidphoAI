import { z } from 'zod';

/** crypto.randomUUID() only exists in "secure contexts" (HTTPS, or the literal
 * hostname `localhost`) — plain-HTTP dev domains like a LAN IP or *.lvh.me
 * don't qualify, so this falls back to a non-cryptographic UUID v4 there. */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const TransformSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  scale: z.number().default(1),
  rotation: z.number().default(0),
});
export type Transform = z.infer<typeof TransformSchema>;

export const TransitionDirectionSchema = z.enum(['left', 'right', 'up', 'down']);
export type TransitionDirection = z.infer<typeof TransitionDirectionSchema>;

export const TransitionSchema = z.object({
  type: z.enum(['none', 'fade', 'wipe', 'slide', 'zoom', 'circle', 'blur', 'flip']),
  durationFrames: z.number().int().nonnegative(),
  // Used by wipe/slide/circle; ignored by fade/zoom/blur/flip.
  direction: TransitionDirectionSchema.default('left'),
});
export type Transition = z.infer<typeof TransitionSchema>;

export const FilterPresetSchema = z.enum([
  'none',
  'warm',
  'cool',
  'vintage',
  'bw',
  'vivid',
  'fade',
  'matte',
]);
export type FilterPreset = z.infer<typeof FilterPresetSchema>;

export const TextFontFamilySchema = z.enum([
  'inter',
  'sora',
  'poppins',
  'bebasNeue',
  'caveat',
  'playfairDisplay',
]);
export type TextFontFamily = z.infer<typeof TextFontFamilySchema>;

export const TextAnimationSchema = z.enum([
  'none',
  'typewriter',
  'wordFade',
  'popIn',
  'bounceIn',
  'slideIn',
]);
export type TextAnimation = z.infer<typeof TextAnimationSchema>;

const ClipBaseSchema = z.object({
  id: z.string(),
  // Frame at which this clip starts on its track, relative to the start of the EditPlan.
  startFrame: z.number().int().nonnegative(),
  durationFrames: z.number().int().positive(),
  // Frame offset into the source asset where playback begins (ignored for text clips).
  sourceInFrame: z.number().int().nonnegative().default(0),
  transform: TransformSchema.default({}),
  transition: TransitionSchema.optional(),
  // Volume/opacity ramps at the clip's own edges — independent of the entry transition.
  fadeInFrames: z.number().int().nonnegative().default(0),
  fadeOutFrames: z.number().int().nonnegative().default(0),
});

export const VideoClipSchema = ClipBaseSchema.extend({
  kind: z.literal('video'),
  assetId: z.string(),
  volume: z.number().min(0).max(2).default(1),
  speed: z.number().min(0.25).max(4).default(1),
  flipHorizontal: z.boolean().default(false),
  flipVertical: z.boolean().default(false),
  filter: FilterPresetSchema.default('none'),
  brightness: z.number().min(0).max(200).default(100),
  contrast: z.number().min(0).max(200).default(100),
});
export type VideoClip = z.infer<typeof VideoClipSchema>;

export const ImageClipSchema = ClipBaseSchema.extend({
  kind: z.literal('image'),
  assetId: z.string(),
  flipHorizontal: z.boolean().default(false),
  flipVertical: z.boolean().default(false),
  filter: FilterPresetSchema.default('none'),
  brightness: z.number().min(0).max(200).default(100),
  contrast: z.number().min(0).max(200).default(100),
});
export type ImageClip = z.infer<typeof ImageClipSchema>;

export const TextClipSchema = ClipBaseSchema.extend({
  kind: z.literal('text'),
  text: z.string(),
  style: z.object({
    fontSize: z.number().positive().default(64),
    color: z.string().default('#ffffff'),
    position: z.enum(['top', 'center', 'bottom']).default('bottom'),
    fontFamily: TextFontFamilySchema.default('sora'),
    fontWeight: z.enum(['normal', 'bold']).default('bold'),
    italic: z.boolean().default(false),
    align: z.enum(['left', 'center', 'right']).default('center'),
    letterSpacing: z.number().default(0),
    stroke: z.object({ width: z.number().positive(), color: z.string() }).optional(),
    background: z.object({ color: z.string(), opacity: z.number().min(0).max(1) }).optional(),
    animation: TextAnimationSchema.default('none'),
  }),
});
export type TextClip = z.infer<typeof TextClipSchema>;

export const AudioClipSchema = ClipBaseSchema.extend({
  kind: z.literal('audio'),
  assetId: z.string(),
  volume: z.number().min(0).max(2).default(1),
  speed: z.number().min(0.25).max(4).default(1),
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
    id: overrides.id ?? generateId(),
    version: overrides.version ?? 0,
    fps: overrides.fps ?? 30,
    width: overrides.width ?? 1080,
    height: overrides.height ?? 1920,
    durationInFrames: overrides.durationInFrames ?? 0,
    tracks:
      overrides.tracks ??
      [
        { id: generateId(), type: 'video', clips: [] },
        { id: generateId(), type: 'overlay', clips: [] },
        { id: generateId(), type: 'text', clips: [] },
        { id: generateId(), type: 'audio', clips: [] },
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
