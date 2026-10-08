import { create } from 'zustand';
import {
  type EditPlan,
  type Clip,
  createEmptyEditPlan,
  recomputeDuration,
} from '@editor/edit-schema';

interface EditStoreState {
  plan: EditPlan;
  past: EditPlan[];
  future: EditPlan[];
  selectedClipId: string | null;
  loadPlan: (plan: EditPlan) => void;
  addClip: (trackId: string, clip: Clip) => void;
  updateClip: (trackId: string, clipId: string, patch: Partial<Clip>) => void;
  removeClip: (trackId: string, clipId: string) => void;
  selectClip: (clipId: string | null) => void;
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

  loadPlan: (plan) => set({ plan, past: [], future: [], selectedClipId: null }),

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

  selectClip: (clipId) => set({ selectedClipId: clipId }),

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
