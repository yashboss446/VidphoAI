export const PIXELS_PER_FRAME = 3;

export function framesToPixels(frames: number) {
  return frames * PIXELS_PER_FRAME;
}

export function pixelsToFrames(pixels: number) {
  return Math.max(0, Math.round(pixels / PIXELS_PER_FRAME));
}

export const TRACK_COLORS: Record<string, string> = {
  video: '#6366f1',
  overlay: '#22c55e',
  text: '#f59e0b',
  audio: '#ec4899',
};
