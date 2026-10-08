'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export interface UploadedAsset {
  id: string;
  kind: 'video' | 'image' | 'audio';
  originalName: string;
  url: string;
  thumbnailUrl: string | null;
  durationSec: number | null;
  width: number | null;
  height: number | null;
  fps: number | null;
}

export function UploadDropzone({
  projectId,
  onUploaded,
}: {
  projectId: string;
  onUploaded: (asset: UploadedAsset) => void;
}) {
  const [uploading, setUploading] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (files: File[]) => {
      setError(null);
      for (const file of files) {
        setUploading((u) => [...u, file.name]);
        try {
          const presignRes = await fetch(`/api/projects/${projectId}/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, contentType: file.type }),
          });
          if (!presignRes.ok) throw new Error('Failed to get upload URL');
          const { uploadUrl, key } = await presignRes.json();

          const putRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          });
          if (!putRes.ok) throw new Error('Upload to storage failed');

          const registerRes = await fetch(`/api/projects/${projectId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, filename: file.name, contentType: file.type }),
          });
          if (!registerRes.ok) throw new Error('Failed to register media');
          const { mediaAsset } = await registerRes.json();
          onUploaded(mediaAsset);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
          setUploading((u) => u.filter((name) => name !== file.name));
        }
      }
    },
    [projectId, onUploaded],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [], 'image/*': [], 'audio/*': [] },
  });

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center text-sm transition-colors ${
        isDragActive ? 'border-accent bg-accent/10' : 'border-white/15 hover:border-white/30'
      }`}
    >
      <input {...getInputProps()} />
      <p>Drop photos, videos, or audio here, or click to browse.</p>
      {uploading.length > 0 && (
        <p className="mt-2 text-white/60">Uploading: {uploading.join(', ')}</p>
      )}
      {error && <p className="mt-2 text-red-400">{error}</p>}
    </div>
  );
}
