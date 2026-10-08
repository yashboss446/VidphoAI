'use client';

import { useRef } from 'react';
import type { Clip } from '@editor/edit-schema';
import { framesToPixels, PIXELS_PER_FRAME, TRACK_COLORS } from '@/lib/timeline';

const MIN_DURATION_FRAMES = 2;

export function ClipBlock({
  clip,
  trackType,
  isSelected,
  onSelect,
  onChange,
}: {
  clip: Clip;
  trackType: string;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<Clip>) => void;
}) {
  const dragState = useRef<{
    mode: 'move' | 'trim-start' | 'trim-end';
    startX: number;
    startFrame: number;
    durationFrames: number;
    sourceInFrame: number;
  } | null>(null);

  function beginDrag(mode: 'move' | 'trim-start' | 'trim-end', e: React.PointerEvent) {
    e.stopPropagation();
    onSelect();
    dragState.current = {
      mode,
      startX: e.clientX,
      startFrame: clip.startFrame,
      durationFrames: clip.durationFrames,
      sourceInFrame: clip.sourceInFrame,
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e: PointerEvent) {
    const drag = dragState.current;
    if (!drag) return;
    const frameDelta = Math.round((e.clientX - drag.startX) / PIXELS_PER_FRAME);

    if (drag.mode === 'move') {
      onChange({ startFrame: Math.max(0, drag.startFrame + frameDelta) } as Partial<Clip>);
    } else if (drag.mode === 'trim-start') {
      const newStart = Math.max(0, drag.startFrame + frameDelta);
      const newDuration = drag.durationFrames - (newStart - drag.startFrame);
      if (newDuration >= MIN_DURATION_FRAMES) {
        onChange({
          startFrame: newStart,
          durationFrames: newDuration,
          sourceInFrame: Math.max(0, drag.sourceInFrame + (newStart - drag.startFrame)),
        } as Partial<Clip>);
      }
    } else if (drag.mode === 'trim-end') {
      const newDuration = Math.max(MIN_DURATION_FRAMES, drag.durationFrames + frameDelta);
      onChange({ durationFrames: newDuration } as Partial<Clip>);
    }
  }

  function onPointerUp() {
    dragState.current = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }

  const color = TRACK_COLORS[trackType] ?? '#6366f1';

  return (
    <div
      onPointerDown={(e) => beginDrag('move', e)}
      style={{
        position: 'absolute',
        left: framesToPixels(clip.startFrame),
        width: framesToPixels(clip.durationFrames),
        backgroundColor: color,
      }}
      className={`group h-full cursor-grab rounded-md opacity-90 ring-2 ${
        isSelected ? 'ring-white' : 'ring-transparent'
      }`}
    >
      <div
        onPointerDown={(e) => beginDrag('trim-start', e)}
        className="absolute left-0 top-0 h-full w-2 cursor-ew-resize bg-black/30 opacity-0 group-hover:opacity-100"
      />
      <div className="truncate px-2 py-1 text-xs font-medium text-black/80">
        {clip.kind === 'text' ? clip.text : clip.kind}
      </div>
      <div
        onPointerDown={(e) => beginDrag('trim-end', e)}
        className="absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-black/30 opacity-0 group-hover:opacity-100"
      />
    </div>
  );
}
