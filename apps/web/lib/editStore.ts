import { create } from 'zustand';
import {
  type EditPlan,
  type Clip,
  createEmptyEditPlan,
  recomputeDuration,
  generateId,
} from '@editor/edit-schema';

interface EditStoreState {
  plan: EditPlan;
  past: EditPlan[];
  future: EditPlan[];
  selectedClipId: string | null;
  playheadFrame: number;
  beatFrames: number[];
  beatFramesClipId: string | null;
  loadPlan: (plan: EditPlan) => void;
  addClip: (trackId: string, clip: Clip) => void;
  updateClip: (trackId: string, clipId: string, patch: Partial<Clip>) => void;
  removeClip: (trackId: string, clipId: string) => void;
  splitClip: (trackId: string, clipId: string, atFrame: number) => void;
  duplicateClip: (trackId: string, clipId: string) => void;
  setCanvasSize: (width: number, height: number) => void;
  selectClip: (clipId: string | null) => void;
  setPlayhead: (frame: number) => void;
  setBeatFrames: (clipId: string, frames: number[]) => void;
  clearBeatFrames: () => void;
  undo: () => void;
  redo: () => void;
}

function withHistory(
  state: Pick<EditStoreState, 'plan' | 'past'>,
  nextPlan: EditPlan,
): Pick<EditStoreState, 'plan' | 'past' | 'future'> {
  return {
    plan: recomputeDuration({ ...nextPlan, version: state.plan.version + 1 }),
    past: [...state.past, state.plan],
    future: [],
  };
}

export const useEditStore = create<EditStoreState>((set, get) => ({
  plan: createEmptyEditPlan(),
  past: [],
  future: [],
  selectedClipId: null,
  playheadFrame: 0,
  beatFrames: [],
  beatFramesClipId: null,

  loadPlan: (plan) =>
    set({
      plan,
      past: [],
      future: [],
      selectedClipId: null,
      playheadFrame: 0,
      beatFrames: [],
      beatFramesClipId: null,
    }),

  addClip: (trackId, clip) => {
    const { plan } = get();
    const tracks = plan.tracks.map((t) =>
      t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t,
    );
    set((state) => withHistory(state, { ...plan, tracks }));
  },

  updateClip: (trackId, clipId, patch) => {
    const { plan } = get();
    const tracks = plan.tracks.map((t) =>
      t.id !== trackId
        ? t
        : {
            ...t,
            clips: t.clips.map((c) => (c.id === clipId ? ({ ...c, ...patch } as Clip) : c)),
          },
    );
    set((state) => withHistory(state, { ...plan, tracks }));
  },

  removeClip: (trackId, clipId) => {
    const { plan } = get();
    const tracks = plan.tracks.map((t) =>
      t.id === trackId ? { ...t, clips: t.clips.filter((c) => c.id !== clipId) } : t,
    );
    set((state) => withHistory(state, { ...plan, tracks }));
  },

  splitClip: (trackId, clipId, atFrame) => {
    const { plan } = get();
    const track = plan.tracks.find((t) => t.id === trackId);
    const clip = track?.clips.find((c) => c.id === clipId);
    if (!track || !clip) return;

    const splitPoint = atFrame - clip.startFrame;
    if (splitPoint <= 0 || splitPoint >= clip.durationFrames) return;

    const firstPart: Clip = { ...clip, durationFrames: splitPoint };
    const secondPart: Clip = {
      ...clip,
      id: generateId(),
      startFrame: clip.startFrame + splitPoint,
      durationFrames: clip.durationFrames - splitPoint,
      sourceInFrame: clip.sourceInFrame + splitPoint,
    };

    const tracks = plan.tracks.map((t) =>
      t.id !== trackId
        ? t
        : {
            ...t,
            clips: t.clips.flatMap((c) => (c.id === clipId ? [firstPart, secondPart] : [c])),
          },
    );
    set((state) => withHistory(state, { ...plan, tracks }));
    set({ selectedClipId: secondPart.id });
  },

  duplicateClip: (trackId, clipId) => {
    const { plan } = get();
    const track = plan.tracks.find((t) => t.id === trackId);
    const clip = track?.clips.find((c) => c.id === clipId);
    if (!track || !clip) return;

    const copy: Clip = { ...clip, id: generateId(), startFrame: clip.startFrame + clip.durationFrames };
    const tracks = plan.tracks.map((t) =>
      t.id !== trackId
        ? t
        : {
            ...t,
            clips: t.clips.flatMap((c) => (c.id === clipId ? [c, copy] : [c])),
          },
    );
    set((state) => withHistory(state, { ...plan, tracks }));
    set({ selectedClipId: copy.id });
  },

  setCanvasSize: (width, height) => {
    const { plan } = get();
    set((state) => withHistory(state, { ...plan, width, height }));
  },

  selectClip: (clipId) => set({ selectedClipId: clipId }),

  setPlayhead: (frame) => {
    if (!Number.isFinite(frame)) return;
    set({ playheadFrame: Math.max(0, Math.round(frame)) });
  },

  setBeatFrames: (clipId, frames) => set({ beatFrames: frames, beatFramesClipId: clipId }),
  clearBeatFrames: () => set({ beatFrames: [], beatFramesClipId: null }),

  undo: () => {
    const { past, plan, future } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set({ plan: previous, past: past.slice(0, -1), future: [plan, ...future] });
  },

  redo: () => {
    const { future, plan, past } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({ plan: next, past: [...past, plan], future: future.slice(1) });
  },
}));
