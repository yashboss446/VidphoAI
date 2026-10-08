export const PIXELS_PER_FRAME = 3;

export function framesToPixels(frames: number) {
  return frames * PIXELS_PER_FRAME;
}

export function pixelsToFrames(pixels: number) {
  return Math.max(0, Math.round(pixels / PIXELS_PER_FRAME));
}

export const TRACK_COLORS: Record<string, string> = {
  video: '#6366f1',
  overlay: '#22d3ee',
  text: '#f59e0b',
  audio: '#ec4899',
};

export const TRACK_GRADIENTS: Record<string, string> = {
  video: 'linear-gradient(135deg, #6366f1, #818cf8)',
  overlay: 'linear-gradient(135deg, #0891b2, #22d3ee)',
  text: 'linear-gradient(135deg, #d97706, #f59e0b)',
  audio: 'linear-gradient(135deg, #db2777, #ec4899)',
};
