'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { apiFetch } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Undo2, Redo2, Type as TypeIcon } from 'lucide-react';
import { useEditStore } from '@/lib/editStore';
import { trackByType, clipForAsset, newTextClip } from '@/lib/clipFactory';
import { UploadDropzone, type UploadedAsset } from '@/components/editor/UploadDropzone';
import { MediaBin } from '@/components/editor/MediaBin';
import { RemotionStage } from '@/components/editor/RemotionStage';
import { Timeline } from '@/components/editor/Timeline';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { ExportButton } from '@/components/editor/ExportButton';
import { CanvasRatioControl } from '@/components/editor/CanvasRatioControl';
import { ChatPanel } from '@/components/editor/ChatPanel';
import { Logo } from '@/components/ui/Logo';
import type { Clip } from '@editor/edit-schema';

export default function EditorPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const { status } = useAuth();
  const router = useRouter();

  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [loaded, setLoaded] = useState(false);

  const plan = useEditStore((s) => s.plan);
  const selectedClipId = useEditStore((s) => s.selectedClipId);
  const loadPlan = useEditStore((s) => s.loadPlan);
  const addClip = useEditStore((s) => s.addClip);
  const updateClip = useEditStore((s) => s.updateClip);
  const removeClip = useEditStore((s) => s.removeClip);
  const setCanvasSize = useEditStore((s) => s.setCanvasSize);
  const selectClip = useEditStore((s) => s.selectClip);
  const undo = useEditStore((s) => s.undo);
  const redo = useEditStore((s) => s.redo);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    async function load() {
      const [mediaRes, planRes] = await Promise.all([
        apiFetch(`/api/projects/${projectId}/media`),
        apiFetch(`/api/projects/${projectId}/editplan`),
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
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-panel-border border-t-accent" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <header className="flex items-center justify-between border-b border-panel-border/60 bg-surface/80 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-ink-faint transition-colors hover:text-ink">
            <ArrowLeft size={18} />
          </Link>
          <Logo size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <ToolbarButton onClick={undo} title="Undo">
            <Undo2 size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={redo} title="Redo">
            <Redo2 size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={handleAddText} title="Add text">
            <TypeIcon size={15} />
          </ToolbarButton>
          <CanvasRatioControl width={plan.width} height={plan.height} onChange={setCanvasSize} />
          <div className="mx-1 h-6 w-px bg-panel-border" />
          <ExportButton projectId={projectId} editPlan={plan} />
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[280px_1fr_280px]">
        <aside className="flex flex-col gap-4 lg:overflow-y-auto">
          <PanelCard title="Media">
            <UploadDropzone projectId={projectId} onUploaded={(a) => setAssets((prev) => [...prev, a])} />
            <div className="mt-3">
              <MediaBin assets={assets} onAdd={handleAddAsset} />
            </div>
          </PanelCard>
        </aside>

        <section className="min-h-[360px]">
          <RemotionStage editPlan={plan} assetUrls={assetUrls} />
        </section>

        <aside className="lg:overflow-y-auto">
          <PanelCard title="Properties">
            <PropertiesPanel
              clip={selectedClip}
              onChange={(patch) =>
                selectedTrackId && selectedClipId && updateClip(selectedTrackId, selectedClipId, patch)
              }
              onDelete={() => selectedTrackId && selectedClipId && removeClip(selectedTrackId, selectedClipId)}
            />
          </PanelCard>
        </aside>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-4">
        <Timeline
          editPlan={plan}
          selectedClipId={selectedClipId}
          onSelectClip={selectClip}
          onChangeClip={(trackId, clipId, patch) => updateClip(trackId, clipId, patch)}
          assetUrls={assetUrls}
        />
        <ChatPanel projectId={projectId} />
      </div>
    </main>
  );
}

function PanelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-panel-border bg-panel/40 p-4">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{title}</h2>
      {children}
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-panel-hover hover:text-ink"
    >
      {children}
    </button>
  );
}
