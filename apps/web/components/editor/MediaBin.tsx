'use client';

import { useMemo, useState } from 'react';
import { Film, Image as ImageIcon, Music, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { UploadedAsset } from './UploadDropzone';

const KIND_ICON = {
  video: Film,
  image: ImageIcon,
  audio: Music,
} as const;

const TABS: { value: UploadedAsset['kind']; label: string }[] = [
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Photos' },
  { value: 'audio', label: 'Music' },
];

export function MediaBin({
  assets,
  onAdd,
}: {
  assets: UploadedAsset[];
  onAdd: (asset: UploadedAsset) => void;
}) {
  const [tab, setTab] = useState<UploadedAsset['kind']>('video');

  const counts = useMemo(() => {
    const c = { video: 0, image: 0, audio: 0 };
    for (const a of assets) c[a.kind]++;
    return c;
  }, [assets]);

  const visible = assets.filter((a) => a.kind === tab);

  return (
    <div className="flex flex-col gap-3">
      <div className="inline-flex rounded-lg border border-panel-border bg-panel/60 p-0.5">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
              tab === t.value ? 'bg-gradient-brand text-white' : 'text-ink-muted hover:text-ink',
            )}
          >
            {t.label}
            {counts[t.value] > 0 && <span className="opacity-70">({counts[t.value]})</span>}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-panel-border py-6 text-center text-xs text-ink-faint">
          No {tab === 'audio' ? 'music' : tab === 'image' ? 'photos' : 'videos'} uploaded yet
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((asset) => {
            const Icon = KIND_ICON[asset.kind];
            return (
              <li
                key={asset.id}
                className="group flex items-center gap-3 rounded-xl border border-panel-border bg-panel/50 p-2 transition-colors hover:border-white/15"
              >
                <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-black/50">
                  {asset.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  ) : asset.kind === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-faint">
                      <Icon size={16} />
                    </div>
                  )}
                  <div className="absolute bottom-0.5 right-0.5 rounded bg-black/70 p-0.5">
                    <Icon size={10} className="text-white/90" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{asset.originalName}</p>
                  <p className="text-xs text-ink-faint">
                    {asset.kind}
                    {asset.durationSec ? ` · ${asset.durationSec.toFixed(1)}s` : ''}
                  </p>
                </div>
                <button
                  onClick={() => onAdd(asset)}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-panel-hover text-ink-muted opacity-0 transition-all hover:bg-gradient-brand hover:text-white group-hover:opacity-100"
                  title="Add to timeline"
                >
                  <Plus size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
