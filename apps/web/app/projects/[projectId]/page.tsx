'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEditStore } from '@/lib/editStore';
import { trackByType, clipForAsset, newTextClip } from '@/lib/clipFactory';
import { UploadDropzone, type UploadedAsset } from '@/components/editor/UploadDropzone';
import { MediaBin } from '@/components/editor/MediaBin';
import { RemotionStage } from '@/components/editor/RemotionStage';
import { Timeline } from '@/components/editor/Timeline';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { ExportButton } from '@/components/editor/ExportButton';
import type { Clip } from '@editor/edit-schema';

export default function EditorPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const { status } = useSession();
  const router = useRouter();

  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [loaded, setLoaded] = useState(false);

  const plan = useEditStore((s) => s.plan);
  const selectedClipId = useEditStore((s) => s.selectedClipId);
  const loadPlan = useEditStore((s) => s.loadPlan);
  const addClip = useEditStore((s) => s.addClip);
  const updateClip = useEditStore((s) => s.updateClip);
  const removeClip = useEditStore((s) => s.removeClip);
  const selectClip = useEditStore((s) => s.selectClip);
  const undo = useEditStore((s) => s.undo);
  const redo = useEditStore((s) => s.redo);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    async function load() {
      const [mediaRes, planRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/media`),
        fetch(`/api/projects/${projectId}/editplan`),
      ]);
      if (mediaRes.ok) {
        const { mediaAssets } = await mediaRes.json();
        setAssets(mediaAssets);
      }
      if (planRes.ok) {
        const { editPlan } = await planRes.json();
        loadPlan(editPlan);
      }
      setLoaded(true);
    }
    load();
  }, [projectId, loadPlan]);

  const assetUrls = useMemo(() => {
    const map: Record<string, string> = {};
    for (const asset of assets) map[asset.id] = asset.url;
    return map;
  }, [assets]);

  const selectedClip: Clip | null = useMemo(() => {
    if (!selectedClipId) return null;
    for (const track of plan.tracks) {
      const clip = track.clips.find((c) => c.id === selectedClipId);
      if (clip) return clip;
    }
    return null;
  }, [plan, selectedClipId]);

  const selectedTrackId = useMemo(() => {
    if (!selectedClipId) return null;
    return plan.tracks.find((t) => t.clips.some((c) => c.id === selectedClipId))?.id ?? null;
  }, [plan, selectedClipId]);

  function handleAddAsset(asset: UploadedAsset) {
    const { trackType, clip } = clipForAsset(plan, asset);
    const track = trackByType(plan, trackType);
    addClip(track.id, clip);
  }

  function handleAddText() {
    const track = trackByType(plan, 'text');
    addClip(track.id, newTextClip(plan));
  }

  if (!loaded) {
    return <p className="p-6 text-white/60">Loading project…</p>;
  }

  return (
    <main className="flex min-h-screen flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editor</h1>
        <div className="flex items-center gap-2">
          <button onClick={undo} className="rounded bg-panel px-3 py-1.5 text-sm ring-1 ring-white/10">
            Undo
          </button>
          <button onClick={redo} className="rounded bg-panel px-3 py-1.5 text-sm ring-1 ring-white/10">
            Redo
          </button>
          <button onClick={handleAddText} className="rounded bg-panel px-3 py-1.5 text-sm ring-1 ring-white/10">
            + Text
          </button>
          <ExportButton projectId={projectId} editPlan={plan} />
        </div>
      </header>

      <div className="grid grid-cols-[280px_1fr_280px] gap-4">
        <aside className="flex flex-col gap-3">
          <UploadDropzone projectId={projectId} onUploaded={(a) => setAssets((prev) => [...prev, a])} />
          <MediaBin assets={assets} onAdd={handleAddAsset} />
        </aside>

        <section className="flex flex-col gap-4">
          <RemotionStage editPlan={plan} assetUrls={assetUrls} />
        </section>

        <aside className="rounded-lg bg-panel p-3 ring-1 ring-white/10">
          <PropertiesPanel
            clip={selectedClip}
            onChange={(patch) => selectedTrackId && selectedClipId && updateClip(selectedTrackId, selectedClipId, patch)}
            onDelete={() => selectedTrackId && selectedClipId && removeClip(selectedTrackId, selectedClipId)}
          />
        </aside>
      </div>

      <Timeline
        editPlan={plan}
        selectedClipId={selectedClipId}
        onSelectClip={selectClip}
        onChangeClip={(trackId, clipId, patch) => updateClip(trackId, clipId, patch)}
      />
    </main>
  );
}
