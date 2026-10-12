'use client';

import { useCallback, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import type { UploadedAsset } from '@/components/editor/UploadDropzone';

export function useMediaUpload(projectId: string) {
  const [uploading, setUploading] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: File[]): Promise<UploadedAsset[]> => {
      setError(null);
      const uploaded: UploadedAsset[] = [];
      for (const file of files) {
        setUploading((u) => [...u, file.name]);
        try {
          const presignRes = await apiFetch(`/api/projects/${projectId}/upload`, {
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

          const registerRes = await apiFetch(`/api/projects/${projectId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, filename: file.name, contentType: file.type }),
          });
          if (!registerRes.ok) throw new Error('Failed to register media');
          const { mediaAsset } = await registerRes.json();
          uploaded.push(mediaAsset);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
          setUploading((u) => u.filter((name) => name !== file.name));
        }
      }
      return uploaded;
    },
    [projectId],
  );

  return { uploadFiles, uploading, error };
}
