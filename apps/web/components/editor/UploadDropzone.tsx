'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useMediaUpload } from '@/lib/useMediaUpload';

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
  const { uploadFiles, uploading, error } = useMediaUpload(projectId);

  const onDrop = useCallback(
    async (files: File[]) => {
      const uploaded = await uploadFiles(files);
      uploaded.forEach(onUploaded);
    },
    [uploadFiles, onUploaded],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [], 'image/*': [], 'audio/*': [] },
  });

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed p-6 text-center text-sm transition-all',
          isDragActive
            ? 'border-accent bg-accent/10 scale-[1.01]'
            : 'border-panel-border hover:border-accent/50 hover:bg-white/[0.02]',
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg bg-panel-hover transition-transform',
              isDragActive && 'scale-110',
            )}
          >
            <UploadCloud size={18} className="text-accent-violet" />
          </div>
          <p className="text-ink-muted">
            <span className="font-medium text-ink">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-ink-faint">Video, photo, or audio</p>
        </div>
      </div>

      <AnimatePresence>
        {uploading.map((name) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 rounded-lg bg-panel/60 px-3 py-2 text-xs text-ink-muted"
          >
            <Loader2 size={13} className="animate-spin text-accent-violet" />
            <span className="truncate">{name}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
