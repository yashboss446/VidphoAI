'use client';

import type { UploadedAsset } from './UploadDropzone';

export function MediaBin({
  assets,
  onAdd,
}: {
  assets: UploadedAsset[];
  onAdd: (asset: UploadedAsset) => void;
}) {
  if (assets.length === 0) {
    return <p className="text-sm text-white/40">No media uploaded yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {assets.map((asset) => (
        <li
          key={asset.id}
          className="flex items-center gap-3 rounded-md bg-panel p-2 ring-1 ring-white/10"
        >
          <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded bg-black/40">
            {asset.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : asset.kind === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                {asset.kind}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{asset.originalName}</p>
            <p className="text-xs text-white/40">
              {asset.kind}
              {asset.durationSec ? ` · ${asset.durationSec.toFixed(1)}s` : ''}
            </p>
          </div>
          <button
            onClick={() => onAdd(asset)}
            className="rounded bg-accent px-2 py-1 text-xs font-medium"
          >
            Add
          </button>
        </li>
      ))}
    </ul>
  );
}
