'use client';

import type { Clip } from '@editor/edit-schema';

export function PropertiesPanel({
  clip,
  onChange,
  onDelete,
}: {
  clip: Clip | null;
  onChange: (patch: Partial<Clip>) => void;
  onDelete: () => void;
}) {
  if (!clip) {
    return <p className="text-sm text-white/40">Select a clip to edit its properties.</p>;
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-medium capitalize">{clip.kind} clip</h3>
        <button onClick={onDelete} className="text-xs text-red-400 hover:underline">
          Delete
        </button>
      </div>

      {clip.kind === 'text' && (
        <>
          <label className="flex flex-col gap-1">
            Text
            <textarea
              value={clip.text}
              onChange={(e) => onChange({ text: e.target.value } as Partial<Clip>)}
              className="rounded bg-black/30 p-2 ring-1 ring-white/10"
              rows={2}
            />
          </label>
          <label className="flex flex-col gap-1">
            Font size
            <input
              type="number"
              value={clip.style.fontSize}
              onChange={(e) =>
                onChange({ style: { ...clip.style, fontSize: Number(e.target.value) } } as Partial<Clip>)
              }
              className="rounded bg-black/30 p-2 ring-1 ring-white/10"
            />
          </label>
          <label className="flex flex-col gap-1">
            Color
            <input
              type="color"
              value={clip.style.color}
              onChange={(e) =>
                onChange({ style: { ...clip.style, color: e.target.value } } as Partial<Clip>)
              }
              className="h-9 rounded bg-black/30 ring-1 ring-white/10"
            />
          </label>
          <label className="flex flex-col gap-1">
            Position
            <select
              value={clip.style.position}
              onChange={(e) =>
                onChange({
                  style: { ...clip.style, position: e.target.value as 'top' | 'center' | 'bottom' },
                } as Partial<Clip>)
              }
              className="rounded bg-black/30 p-2 ring-1 ring-white/10"
            >
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </select>
          </label>
        </>
      )}

      {(clip.kind === 'video' || clip.kind === 'audio') && (
        <label className="flex flex-col gap-1">
          Volume
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={clip.volume}
            onChange={(e) => onChange({ volume: Number(e.target.value) } as Partial<Clip>)}
          />
        </label>
      )}

      {clip.kind !== 'audio' && (
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            X offset
            <input
              type="number"
              value={clip.transform.x}
              onChange={(e) =>
                onChange({ transform: { ...clip.transform, x: Number(e.target.value) } } as Partial<Clip>)
              }
              className="rounded bg-black/30 p-2 ring-1 ring-white/10"
            />
          </label>
          <label className="flex flex-col gap-1">
            Y offset
            <input
              type="number"
              value={clip.transform.y}
              onChange={(e) =>
                onChange({ transform: { ...clip.transform, y: Number(e.target.value) } } as Partial<Clip>)
              }
              className="rounded bg-black/30 p-2 ring-1 ring-white/10"
            />
          </label>
          <label className="flex flex-col gap-1">
            Scale
            <input
              type="number"
              step={0.1}
              value={clip.transform.scale}
              onChange={(e) =>
                onChange({ transform: { ...clip.transform, scale: Number(e.target.value) } } as Partial<Clip>)
              }
              className="rounded bg-black/30 p-2 ring-1 ring-white/10"
            />
          </label>
          <label className="flex flex-col gap-1">
            Rotation
            <input
              type="number"
              value={clip.transform.rotation}
              onChange={(e) =>
                onChange({
                  transform: { ...clip.transform, rotation: Number(e.target.value) },
                } as Partial<Clip>)
              }
              className="rounded bg-black/30 p-2 ring-1 ring-white/10"
            />
          </label>
        </div>
      )}

      <label className="flex flex-col gap-1">
        Transition in
        <select
          value={clip.transition?.type ?? 'none'}
          onChange={(e) =>
            onChange({
              transition: {
                type: e.target.value as 'none' | 'fade' | 'wipe' | 'slide',
                durationFrames: clip.transition?.durationFrames ?? 15,
              },
            } as Partial<Clip>)
          }
          className="rounded bg-black/30 p-2 ring-1 ring-white/10"
        >
          <option value="none">None</option>
          <option value="fade">Fade</option>
          <option value="wipe">Wipe (Phase 2)</option>
          <option value="slide">Slide (Phase 2)</option>
        </select>
      </label>
    </div>
  );
}
