'use client';

import { Film, Image as ImageIcon, Music, Plus } from 'lucide-react';
import type { UploadedAsset } from './UploadDropzone';

const KIND_ICON = {
  video: Film,
  image: ImageIcon,
  audio: Music,
} as const;

export function MediaBin({
  assets,
  onAdd,
}: {
  assets: UploadedAsset[];
  onAdd: (asset: UploadedAsset) => void;
}) {
  if (assets.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-panel-border py-6 text-center text-xs text-ink-faint">
        No media uploaded yet
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {assets.map((asset) => {
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
  );
}
