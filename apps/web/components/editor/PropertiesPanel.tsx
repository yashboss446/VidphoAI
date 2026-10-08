'use client';

import type { Clip } from '@editor/edit-schema';
import { Trash2, Type, Volume2, Move3d, Sparkles, MousePointer2 } from 'lucide-react';
import { cn } from '@/lib/cn';

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-panel-border/60 pb-5 last:border-0 last:pb-0">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

function fieldInputClass(extra = '') {
  return cn(
    'h-9 rounded-lg border border-panel-border bg-panel/60 px-2.5 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/20',
    extra,
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-panel-border bg-panel/60 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors',
            value === opt.value ? 'bg-gradient-brand text-white' : 'text-ink-muted hover:text-ink',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

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
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center">
        <MousePointer2 size={20} className="text-ink-faint" />
        <p className="text-sm text-ink-faint">Select a clip to edit its properties</p>
      </div>
    );
  }

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
          <Field label="Position">
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
        </Section>
      )}

      {(clip.kind === 'video' || clip.kind === 'audio') && (
        <Section title="Audio" icon={<Volume2 size={12} />}>
          <Field label={`Volume — ${Math.round(clip.volume * 100)}%`}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={clip.volume}
              onChange={(e) => onChange({ volume: Number(e.target.value) } as Partial<Clip>)}
              style={{ accentColor: '#8b5cf6' }}
              className="h-1.5 w-full cursor-pointer"
            />
          </Field>
        </Section>
      )}

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
        <Segmented
          value={clip.transition?.type ?? 'none'}
          onChange={(type) =>
            onChange({
              transition: { type, durationFrames: clip.transition?.durationFrames ?? 15 },
            } as Partial<Clip>)
          }
          options={[
            { value: 'none', label: 'None' },
            { value: 'fade', label: 'Fade' },
            { value: 'wipe', label: 'Wipe' },
            { value: 'slide', label: 'Slide' },
          ]}
        />
        {clip.transition && clip.transition.type !== 'none' && (
          <Field label={`Duration — ${clip.transition.durationFrames} frames`}>
            <input
              type="range"
              min={2}
              max={60}
              step={1}
              value={clip.transition.durationFrames}
              onChange={(e) =>
                onChange({
                  transition: { type: clip.transition!.type, durationFrames: Number(e.target.value) },
                } as Partial<Clip>)
              }
              style={{ accentColor: '#8b5cf6' }}
              className="h-1.5 w-full cursor-pointer"
            />
          </Field>
        )}
      </Section>
    </div>
  );
}
