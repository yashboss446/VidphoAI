import React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label className="flex flex-col gap-1.5">
        {label && (
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</span>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-11 w-full rounded-xl border border-panel-border bg-panel/60 px-3.5 text-sm text-ink outline-none transition-all placeholder:text-ink-faint',
              'focus:border-accent/60 focus:ring-2 focus:ring-accent/20',
              icon && 'pl-10',
              error && 'border-danger/50 focus:border-danger/60 focus:ring-danger/20',
              className,
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
      </label>
    );
  },
);
Input.displayName = 'Input';
