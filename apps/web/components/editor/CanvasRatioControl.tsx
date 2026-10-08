'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RectangleVertical, Square, RectangleHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface RatioPreset {
  label: string;
  ratio: string;
  width: number;
  height: number;
  icon: React.ReactNode;
}

const PRESETS: RatioPreset[] = [
  { label: 'Reels/TikTok', ratio: '9:16', width: 1080, height: 1920, icon: <RectangleVertical size={14} /> },
  { label: 'Square', ratio: '1:1', width: 1080, height: 1080, icon: <Square size={14} /> },
  { label: 'Portrait', ratio: '4:5', width: 1080, height: 1350, icon: <RectangleVertical size={14} /> },
  { label: 'Widescreen', ratio: '16:9', width: 1920, height: 1080, icon: <RectangleHorizontal size={14} /> },
];

export function CanvasRatioControl({
  width,
  height,
  onChange,
}: {
  width: number;
  height: number;
  onChange: (width: number, height: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = PRESETS.find((p) => p.width === width && p.height === height);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-panel-border bg-panel/60 px-3 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
      >
        {current?.icon ?? <RectangleVertical size={14} />}
        {current?.ratio ?? `${width}×${height}`}
        <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-30 w-56 overflow-hidden rounded-xl border border-panel-border bg-panel-hover/95 p-1.5 shadow-panel backdrop-blur-xl"
            >
              {PRESETS.map((preset) => (
                <button
                  key={preset.ratio}
                  onClick={() => {
                    onChange(preset.width, preset.height);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-white/5',
                    preset.width === width && preset.height === height && 'bg-accent/10 text-white',
                  )}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-panel text-ink-muted">
                    {preset.icon}
                  </span>
                  <span className="flex-1">
                    <span className="block text-ink">{preset.label}</span>
                    <span className="block text-xs text-ink-faint">{preset.ratio}</span>
                  </span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
