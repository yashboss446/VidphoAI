'use client';

import type { Transition } from '@editor/edit-schema';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Field, Segmented } from './controls';

const DIRECTION_OPTIONS = [
  { value: 'left' as const, label: <ArrowLeft size={13} />, title: 'From the left' },
  { value: 'right' as const, label: <ArrowRight size={13} />, title: 'From the right' },
  { value: 'up' as const, label: <ArrowUp size={13} />, title: 'From the top' },
  { value: 'down' as const, label: <ArrowDown size={13} />, title: 'From the bottom' },
];

/** Shared type/direction/duration editor for a clip's entry transition — used both in
 * PropertiesPanel (for the selected clip) and ClipGap (for the boundary between two clips). */
export function TransitionEditor({
  transition,
  onChange,
}: {
  transition: Transition | undefined;
  onChange: (transition: Transition) => void;
}) {
  const directionApplies = transition && ['wipe', 'slide', 'circle'].includes(transition.type);

  return (
    <div className="flex flex-col gap-3">
      <Segmented
        value={transition?.type ?? 'none'}
        onChange={(type) =>
          onChange({
            type,
            durationFrames: transition?.durationFrames ?? 15,
            direction: transition?.direction ?? 'left',
          })
        }
        options={[
          { value: 'none', label: 'None' },
          { value: 'fade', label: 'Fade' },
          { value: 'wipe', label: 'Wipe' },
          { value: 'slide', label: 'Slide' },
          { value: 'zoom', label: 'Zoom' },
          { value: 'circle', label: 'Circle' },
          { value: 'blur', label: 'Blur' },
          { value: 'flip', label: 'Flip' },
        ]}
      />
      {directionApplies && transition && (
        <Field label="Direction">
          <Segmented
            value={transition.direction}
            onChange={(direction) => onChange({ ...transition, direction })}
            options={DIRECTION_OPTIONS}
          />
        </Field>
      )}
      {transition && transition.type !== 'none' && (
        <Field label={`Duration — ${transition.durationFrames} frames`}>
          <input
            type="range"
            min={2}
            max={60}
            step={1}
            value={transition.durationFrames}
            onChange={(e) => onChange({ ...transition, durationFrames: Number(e.target.value) })}
            style={{ accentColor: '#8b5cf6' }}
            className="h-1.5 w-full cursor-pointer"
          />
        </Field>
      )}
    </div>
  );
}
