'use client';

import { cn } from '@/lib/cn';

export function Section({
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

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

export function fieldInputClass(extra = '') {
  return cn(
    'h-9 rounded-lg border border-panel-border bg-panel/60 px-2.5 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/20',
    extra,
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: React.ReactNode; title?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-panel-border bg-panel/60 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          title={opt.title}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors',
            value === opt.value ? 'bg-gradient-brand text-white' : 'text-ink-muted hover:text-ink',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ToggleButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg border border-panel-border transition-colors',
        active ? 'bg-gradient-brand text-white' : 'bg-panel/60 text-ink-muted hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
