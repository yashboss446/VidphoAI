'use client';

import { useRef } from 'react';
import { Film, Image as ImageIcon, Music, Type } from 'lucide-react';
import type { Clip } from '@editor/edit-schema';
import { framesToPixels, PIXELS_PER_FRAME, TRACK_GRADIENTS, snapFrame } from '@/lib/timeline';
import { cn } from '@/lib/cn';
import { Waveform } from './Waveform';

const MIN_DURATION_FRAMES = 2;
const SNAP_THRESHOLD_FRAMES = 6;

const KIND_ICON = {
  video: Film,
  image: ImageIcon,
  audio: Music,
  text: Type,
} as const;

/** Snaps a clip-move's proposed start frame to the nearest candidate, trying the
 * clip's leading edge first and its trailing edge second (so it also snaps when
 * being butted up against the following clip, not just when its own start lines up). */
function snapMoveStart(rawStart: number, durationFrames: number, candidates: number[]): number {
  const snappedStart = snapFrame(rawStart, candidates, SNAP_THRESHOLD_FRAMES);
  if (snappedStart !== rawStart) return snappedStart;
  const rawEnd = rawStart + durationFrames;
  const snappedEnd = snapFrame(rawEnd, candidates, SNAP_THRESHOLD_FRAMES);
  if (snappedEnd !== rawEnd) return snappedEnd - durationFrames;
  return rawStart;
}

export function ClipBlock({
  clip,
  trackType,
  isSelected,
  onSelect,
  onChange,
  assetUrl,
  snapCandidates = [],
  beatFrames = [],
}: {
  clip: Clip;
  trackType: string;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<Clip>) => void;
  assetUrl?: string;
  snapCandidates?: number[];
  beatFrames?: number[];
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
      const rawStart = Math.max(0, drag.startFrame + frameDelta);
      const newStart = snapMoveStart(rawStart, drag.durationFrames, snapCandidates);
      onChange({ startFrame: Math.max(0, newStart) } as Partial<Clip>);
    } else if (drag.mode === 'trim-start') {
      const rawStart = Math.max(0, drag.startFrame + frameDelta);
      const newStart = snapFrame(rawStart, snapCandidates, SNAP_THRESHOLD_FRAMES);
      const newDuration = drag.durationFrames - (newStart - drag.startFrame);
      if (newDuration >= MIN_DURATION_FRAMES) {
        onChange({
          startFrame: newStart,
          durationFrames: newDuration,
          sourceInFrame: Math.max(0, drag.sourceInFrame + (newStart - drag.startFrame)),
        } as Partial<Clip>);
      }
    } else if (drag.mode === 'trim-end') {
      const rawEnd = drag.startFrame + drag.durationFrames + frameDelta;
      const snappedEnd = snapFrame(rawEnd, snapCandidates, SNAP_THRESHOLD_FRAMES);
      const newDuration = Math.max(MIN_DURATION_FRAMES, snappedEnd - drag.startFrame);
      onChange({ durationFrames: newDuration } as Partial<Clip>);
    }
  }

  function onPointerUp() {
    dragState.current = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }

  const gradient = TRACK_GRADIENTS[trackType] ?? TRACK_GRADIENTS.video;
  const Icon = KIND_ICON[clip.kind];

  return (
    <div
      onPointerDown={(e) => beginDrag('move', e)}
      style={{
        position: 'absolute',
        left: framesToPixels(clip.startFrame),
        width: framesToPixels(clip.durationFrames),
        backgroundImage: gradient,
      }}
      className={cn(
        'group h-full cursor-grab select-none overflow-hidden rounded-lg shadow-sm ring-2 ring-transparent transition-all active:cursor-grabbing',
        isSelected && 'shadow-glow ring-white/80',
      )}
    >
      {clip.kind === 'audio' && assetUrl && (
        <div className="absolute inset-0 px-1 py-1.5 opacity-70">
          <Waveform
            url={assetUrl}
            beatPositions={beatFrames
              .filter((f) => f >= clip.startFrame && f <= clip.startFrame + clip.durationFrames)
              .map((f) => (f - clip.startFrame) / clip.durationFrames)}
          />
        </div>
      )}
      <div
        onPointerDown={(e) => beginDrag('trim-start', e)}
        className="absolute left-0 top-0 z-10 h-full w-2 cursor-ew-resize rounded-l-lg bg-white/0 transition-colors hover:bg-white/30"
      />
      <div className="relative z-[1] flex h-full items-center gap-1.5 overflow-hidden px-2.5">
        <Icon size={11} className="flex-shrink-0 text-white/80" />
        <span className="truncate text-xs font-medium text-white">
          {clip.kind === 'text' ? clip.text : clip.kind}
        </span>
      </div>
      <div
        onPointerDown={(e) => beginDrag('trim-end', e)}
        className="absolute right-0 top-0 z-10 h-full w-2 cursor-ew-resize rounded-l-lg bg-white/0 transition-colors hover:bg-white/30"
      />
    </div>
  );
}
