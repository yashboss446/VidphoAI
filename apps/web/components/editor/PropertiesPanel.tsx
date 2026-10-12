'use client';

import type { Clip, FilterPreset, TextFontFamily } from '@editor/edit-schema';
import {
  Trash2,
  Type,
  Volume2,
  Move3d,
  Sparkles,
  MousePointer2,
  FlipHorizontal2,
  FlipVertical2,
  Gauge,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  PenLine,
  Highlighter,
  Wand2,
  Music,
  Activity,
} from 'lucide-react';
import { Section, Field, fieldInputClass, Segmented, ToggleButton } from './controls';
import { TransitionEditor } from './TransitionEditor';
import { cn } from '@/lib/cn';

const FILTER_LABELS: Record<FilterPreset, string> = {
  none: 'None',
  warm: 'Warm',
  cool: 'Cool',
  vintage: 'Vintage',
  bw: 'B&W',
  vivid: 'Vivid',
  fade: 'Fade',
  matte: 'Matte',
};

const FONT_LABELS: Record<TextFontFamily, string> = {
  inter: 'Inter',
  sora: 'Sora',
  poppins: 'Poppins',
  bebasNeue: 'Bebas Neue',
  caveat: 'Caveat',
  playfairDisplay: 'Playfair Display',
};

export function PropertiesPanel({
  clip,
  onChange,
  onDelete,
  snapToBeatsActive,
  onToggleSnapToBeats,
}: {
  clip: Clip | null;
  onChange: (patch: Partial<Clip>) => void;
  onDelete: () => void;
  snapToBeatsActive?: boolean;
  onToggleSnapToBeats?: () => void;
}) {
  if (!clip) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center">
        <MousePointer2 size={20} className="text-ink-faint" />
        <p className="text-sm text-ink-faint">Select a clip to edit its properties</p>
      </div>
    );
  }

  const hasVisualFilter = clip.kind === 'video' || clip.kind === 'image';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold capitalize text-ink">{clip.kind} clip</h3>
        <button
          onClick={onDelete}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger"
          title="Delete clip"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {clip.kind === 'text' && (
        <Section title="Text" icon={<Type size={12} />}>
          <Field label="Content">
            <textarea
              value={clip.text}
              onChange={(e) => onChange({ text: e.target.value } as Partial<Clip>)}
              className={fieldInputClass('h-auto resize-none py-2')}
              rows={2}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Font size">
              <input
                type="number"
                value={clip.style.fontSize}
                onChange={(e) =>
                  onChange({ style: { ...clip.style, fontSize: Number(e.target.value) } } as Partial<Clip>)
                }
                className={fieldInputClass()}
              />
            </Field>
            <Field label="Color">
              <input
                type="color"
                value={clip.style.color}
                onChange={(e) =>
                  onChange({ style: { ...clip.style, color: e.target.value } } as Partial<Clip>)
                }
                className="h-9 w-full cursor-pointer rounded-lg border border-panel-border bg-panel/60 p-1"
              />
            </Field>
          </div>
          <Field label="Font">
            <select
              value={clip.style.fontFamily}
              onChange={(e) =>
                onChange({ style: { ...clip.style, fontFamily: e.target.value as TextFontFamily } } as Partial<Clip>)
              }
              className={fieldInputClass('cursor-pointer')}
            >
              {(Object.keys(FONT_LABELS) as TextFontFamily[]).map((f) => (
                <option key={f} value={f}>
                  {FONT_LABELS[f]}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-center gap-2">
            <ToggleButton
              active={clip.style.fontWeight === 'bold'}
              onClick={() =>
                onChange({
                  style: { ...clip.style, fontWeight: clip.style.fontWeight === 'bold' ? 'normal' : 'bold' },
                } as Partial<Clip>)
              }
              title="Bold"
            >
              <Bold size={14} />
            </ToggleButton>
            <ToggleButton
              active={clip.style.italic}
              onClick={() => onChange({ style: { ...clip.style, italic: !clip.style.italic } } as Partial<Clip>)}
              title="Italic"
            >
              <Italic size={14} />
            </ToggleButton>
            <ToggleButton
              active={!!clip.style.stroke}
              onClick={() =>
                onChange({
                  style: {
                    ...clip.style,
                    stroke: clip.style.stroke ? undefined : { width: 2, color: '#000000' },
                  },
                } as Partial<Clip>)
              }
              title="Outline"
            >
              <PenLine size={14} />
            </ToggleButton>
            <ToggleButton
              active={!!clip.style.background}
              onClick={() =>
                onChange({
                  style: {
                    ...clip.style,
                    background: clip.style.background ? undefined : { color: '#000000', opacity: 0.5 },
                  },
                } as Partial<Clip>)
              }
              title="Background highlight"
            >
              <Highlighter size={14} />
            </ToggleButton>
          </div>
          <Field label="Vertical position">
            <Segmented
              value={clip.style.position}
              onChange={(position) => onChange({ style: { ...clip.style, position } } as Partial<Clip>)}
              options={[
                { value: 'top', label: 'Top' },
                { value: 'center', label: 'Center' },
                { value: 'bottom', label: 'Bottom' },
              ]}
            />
          </Field>
          <Field label="Alignment">
            <Segmented
              value={clip.style.align}
              onChange={(align) => onChange({ style: { ...clip.style, align } } as Partial<Clip>)}
              options={[
                { value: 'left', label: <AlignLeft size={13} />, title: 'Align left' },
                { value: 'center', label: <AlignCenter size={13} />, title: 'Align center' },
                { value: 'right', label: <AlignRight size={13} />, title: 'Align right' },
              ]}
            />
          </Field>
          <Field label={`Letter spacing — ${clip.style.letterSpacing}px`}>
            <input
              type="range"
              min={-2}
              max={20}
              step={0.5}
              value={clip.style.letterSpacing}
              onChange={(e) =>
                onChange({ style: { ...clip.style, letterSpacing: Number(e.target.value) } } as Partial<Clip>)
              }
              style={{ accentColor: '#8b5cf6' }}
              className="h-1.5 w-full cursor-pointer"
            />
          </Field>
          <Field label="Animation">
            <div className="flex items-center gap-2">
              <Wand2 size={13} className="flex-shrink-0 text-ink-faint" />
              <select
                value={clip.style.animation}
                onChange={(e) => onChange({ style: { ...clip.style, animation: e.target.value as typeof clip.style.animation } } as Partial<Clip>)}
                className={fieldInputClass('w-full cursor-pointer')}
              >
                <option value="none">None</option>
                <option value="typewriter">Typewriter</option>
                <option value="wordFade">Word fade-in</option>
                <option value="popIn">Pop in</option>
                <option value="bounceIn">Bounce in</option>
                <option value="slideIn">Slide in</option>
              </select>
            </div>
          </Field>
        </Section>
      )}

      {hasVisualFilter && (
        <Section title="Filters & flip" icon={<Palette size={12} />}>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(FILTER_LABELS) as FilterPreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ filter: preset } as Partial<Clip>)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  clip.filter === preset
                    ? 'bg-gradient-brand text-white'
                    : 'border border-panel-border bg-panel/60 text-ink-muted hover:text-ink',
                )}
              >
                {FILTER_LABELS[preset]}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Brightness — ${clip.brightness}%`}>
              <input
                type="range"
                min={0}
                max={200}
                step={1}
                value={clip.brightness}
                onChange={(e) => onChange({ brightness: Number(e.target.value) } as Partial<Clip>)}
                style={{ accentColor: '#8b5cf6' }}
                className="h-1.5 w-full cursor-pointer"
              />
            </Field>
            <Field label={`Contrast — ${clip.contrast}%`}>
              <input
                type="range"
                min={0}
                max={200}
                step={1}
                value={clip.contrast}
                onChange={(e) => onChange({ contrast: Number(e.target.value) } as Partial<Clip>)}
                style={{ accentColor: '#8b5cf6' }}
                className="h-1.5 w-full cursor-pointer"
              />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <ToggleButton
              active={clip.flipHorizontal}
              onClick={() => onChange({ flipHorizontal: !clip.flipHorizontal } as Partial<Clip>)}
              title="Mirror horizontally"
            >
              <FlipHorizontal2 size={14} />
            </ToggleButton>
            <ToggleButton
              active={clip.flipVertical}
              onClick={() => onChange({ flipVertical: !clip.flipVertical } as Partial<Clip>)}
              title="Mirror vertically"
            >
              <FlipVertical2 size={14} />
            </ToggleButton>
          </div>
        </Section>
      )}

      {clip.kind === 'video' && (
        <Section title="Speed" icon={<Gauge size={12} />}>
          <Field label={`Playback speed — ${clip.speed.toFixed(2)}x`}>
            <input
              type="range"
              min={0.25}
              max={4}
              step={0.25}
              value={clip.speed}
              onChange={(e) => onChange({ speed: Number(e.target.value) } as Partial<Clip>)}
              style={{ accentColor: '#8b5cf6' }}
              className="h-1.5 w-full cursor-pointer"
            />
          </Field>
        </Section>
      )}

      {clip.kind === 'video' && (
        <Section title="Audio" icon={<Volume2 size={12} />}>
          <Field label={`Volume — ${Math.round(clip.volume * 100)}%`}>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={clip.volume}
              onChange={(e) => onChange({ volume: Number(e.target.value) } as Partial<Clip>)}
              style={{ accentColor: '#8b5cf6' }}
              className="h-1.5 w-full cursor-pointer"
            />
          </Field>
        </Section>
      )}

      {clip.kind === 'audio' && (
        <Section title="Music" icon={<Music size={12} />}>
          <Field label={`Volume — ${Math.round(clip.volume * 100)}%${clip.volume > 1 ? ' (boosted)' : ''}`}>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={clip.volume}
              onChange={(e) => onChange({ volume: Number(e.target.value) } as Partial<Clip>)}
              style={{ accentColor: '#8b5cf6' }}
              className="h-1.5 w-full cursor-pointer"
            />
          </Field>
          <Field label={`Playback speed — ${clip.speed.toFixed(2)}x`}>
            <input
              type="range"
              min={0.25}
              max={4}
              step={0.25}
              value={clip.speed}
              onChange={(e) => onChange({ speed: Number(e.target.value) } as Partial<Clip>)}
              style={{ accentColor: '#8b5cf6' }}
              className="h-1.5 w-full cursor-pointer"
            />
          </Field>
          {onToggleSnapToBeats && (
            <button
              type="button"
              onClick={onToggleSnapToBeats}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg border border-panel-border px-3 py-2 text-xs font-medium transition-colors',
                snapToBeatsActive
                  ? 'bg-gradient-brand text-white'
                  : 'bg-panel/60 text-ink-muted hover:text-ink',
              )}
            >
              <Activity size={13} />
              {snapToBeatsActive ? 'Beat markers on — snapping enabled' : 'Detect beats & snap to them'}
            </button>
          )}
        </Section>
      )}

      <Section title="Fade in/out" icon={<Sparkles size={12} />}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={`Fade in — ${clip.fadeInFrames}f`}>
            <input
              type="range"
              min={0}
              max={60}
              step={1}
              value={clip.fadeInFrames}
              onChange={(e) => onChange({ fadeInFrames: Number(e.target.value) } as Partial<Clip>)}
              style={{ accentColor: '#8b5cf6' }}
              className="h-1.5 w-full cursor-pointer"
            />
          </Field>
          <Field label={`Fade out — ${clip.fadeOutFrames}f`}>
            <input
              type="range"
              min={0}
              max={60}
              step={1}
              value={clip.fadeOutFrames}
              onChange={(e) => onChange({ fadeOutFrames: Number(e.target.value) } as Partial<Clip>)}
              style={{ accentColor: '#8b5cf6' }}
              className="h-1.5 w-full cursor-pointer"
            />
          </Field>
        </div>
      </Section>

      {clip.kind !== 'audio' && (
        <Section title="Transform" icon={<Move3d size={12} />}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="X offset">
              <input
                type="number"
                value={clip.transform.x}
                onChange={(e) =>
                  onChange({ transform: { ...clip.transform, x: Number(e.target.value) } } as Partial<Clip>)
                }
                className={fieldInputClass()}
              />
            </Field>
            <Field label="Y offset">
              <input
                type="number"
                value={clip.transform.y}
                onChange={(e) =>
                  onChange({ transform: { ...clip.transform, y: Number(e.target.value) } } as Partial<Clip>)
                }
                className={fieldInputClass()}
              />
            </Field>
            <Field label="Scale">
              <input
                type="number"
                step={0.1}
                value={clip.transform.scale}
                onChange={(e) =>
                  onChange({
                    transform: { ...clip.transform, scale: Number(e.target.value) },
                  } as Partial<Clip>)
                }
                className={fieldInputClass()}
              />
            </Field>
            <Field label="Rotation">
              <input
                type="number"
                value={clip.transform.rotation}
                onChange={(e) =>
                  onChange({
                    transform: { ...clip.transform, rotation: Number(e.target.value) },
                  } as Partial<Clip>)
                }
                className={fieldInputClass()}
              />
            </Field>
          </div>
        </Section>
      )}

      <Section title="Transition in" icon={<Sparkles size={12} />}>
        <TransitionEditor
          transition={clip.transition}
          onChange={(transition) => onChange({ transition } as Partial<Clip>)}
        />
      </Section>
    </div>
  );
}
