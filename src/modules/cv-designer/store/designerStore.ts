import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import type { Section } from "@/types/section";
import { v4 as uuid } from "uuid";

const HISTORY_LIMIT = 50;

export type StyleToken = {
  fontFamily: string;
  fontSize: number;
  colorPrimary: string;
  spacing: number;
};

export type Frame = { x: number; y: number; width: number; height: number };

export type CanvasElement =
  | { kind: "section"; id: string; frame: Frame; content: string }
  | { kind: "photo"; id: string; frame: Frame; src: string };

type HistorySnap = { elements: CanvasElement[]; tokens: StyleToken };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let last = 0;
  let timer: any = null;
  return function (this: any, ...args: any[]) {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn.apply(this, args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        last = Date.now();
        fn.apply(this, args);
      }, ms - (now - last));
    }
  } as T;
}

function snapshot(state: DesignerState): HistorySnap {
  return {
    elements: JSON.parse(JSON.stringify(state.elements)),
    tokens: { ...state.tokens },
  };
}

interface DesignerState {
  tokens: StyleToken;
  elements: CanvasElement[];
  selectedId: string | null;

  // canvas/ui state (added for designer features)
  zoom: number;
  fitMode: boolean;
  snapThreshold: number;

  // export margins (per edge). 'exportMargin' kept for legacy callers.
  exportMargins: { top: number; right: number; bottom: number; left: number };
  exportMargin?: number;

  // preflight warnings
  overflowIds: string[];
  marginWarnIds: string[];

  // history
  history: { past: HistorySnap[]; future: HistorySnap[] };
  canUndo: boolean;
  canRedo: boolean;

  // actions
  setTokens(tokens: Partial<StyleToken>, record?: boolean): void;
  addElement(el: CanvasElement, record?: boolean): void;
  updateFrame(id: string, frame: Frame, record?: boolean): void;
  select(id: string | null): void;

  // canvas/ui actions
  setZoom(z: number): void;
  zoomIn(): void;
  zoomOut(): void;

  setExportMargins(partial: Partial<{ top: number; right: number; bottom: number; left: number }>): void;
  /** legacy: sets all edges equally and keeps exportMargin in sync */
  setExportMargin(allEdgesPx: number): void;

  setOverflowIds(ids: string[]): void;
  setMarginWarnIds(ids: string[]): void;

  undo(): void;
  redo(): void;

  setInitialElementsFromSections(sections: Section[]): void;
}

export const useDesignerStore = create<DesignerState>()(
  persist(
    immer((set, get) => ({
      tokens: {
        fontFamily: "Inter",
        fontSize: 12,
        colorPrimary: "#111827",
        spacing: 8,
      },
      elements: [],
      selectedId: null,

      // canvas/ui defaults
      zoom: 1,
      fitMode: false,
      snapThreshold: 6,

      // margins defaults (≈10mm @ 72dpi -> ~28.35px)
      exportMargins: { top: 28.35, right: 28.35, bottom: 28.35, left: 28.35 },
      exportMargin: 28.35,

      // preflight
      overflowIds: [],
      marginWarnIds: [],

      history: { past: [], future: [] },
      canUndo: false,
      canRedo: false,

      setTokens: throttle((tokens: Partial<StyleToken>, record = true) =>
        set((state) => {
          if (record) {
            state.history.past.push(snapshot(state));
            // cap history
            if (state.history.past.length > HISTORY_LIMIT) state.history.past.shift();
            state.history.future = [];
          }
          state.tokens = { ...state.tokens, ...tokens };
          state.canUndo = state.history.past.length > 0;
          state.canRedo = state.history.future.length > 0;
        }), 250),

      addElement: (el, record = true) =>
        set((state) => {
          if (record) {
            state.history.past.push(snapshot(state));
            if (state.history.past.length > HISTORY_LIMIT) state.history.past.shift();
            state.history.future = [];
          }
          state.elements.push(el);
          state.canUndo = state.history.past.length > 0;
          state.canRedo = state.history.future.length > 0;
        }),

      updateFrame: throttle((id, frame, record = true) =>
        set((state) => {
          const el = state.elements.find((e) => e.id === id);
          if (!el) return;
          if (record) {
            state.history.past.push(snapshot(state));
            if (state.history.past.length > HISTORY_LIMIT) state.history.past.shift();
            state.history.future = [];
          }
          (el as any).frame = frame;
          state.canUndo = state.history.past.length > 0;
          state.canRedo = state.history.future.length > 0;
        }), 200),

      select: (id) =>
        set((state) => {
          state.selectedId = id;
        }),

      // canvas/ui actions
      setZoom: (z) =>
        set((state) => {
          state.zoom = clamp(z, 0.25, 3);
        }),
      zoomIn: () =>
        set((state) => {
          state.zoom = clamp(state.zoom + 0.1, 0.25, 3);
        }),
      zoomOut: () =>
        set((state) => {
          state.zoom = clamp(state.zoom - 0.1, 0.25, 3);
        }),

      setExportMargins: (partial) =>
        set((state) => {
          const m = { ...state.exportMargins };
          if (partial.top != null) m.top = Math.max(0, Number(partial.top) || 0);
          if (partial.right != null) m.right = Math.max(0, Number(partial.right) || 0);
          if (partial.bottom != null) m.bottom = Math.max(0, Number(partial.bottom) || 0);
          if (partial.left != null) m.left = Math.max(0, Number(partial.left) || 0);
          state.exportMargins = m;
          // keep legacy exportMargin roughly in sync (average of edges)
          state.exportMargin = (m.top + m.right + m.bottom + m.left) / 4;
        }),

      setExportMargin: (allEdgesPx) =>
        set((state) => {
          const v = Math.max(0, Number(allEdgesPx) || 0);
          state.exportMargin = v;
          state.exportMargins = { top: v, right: v, bottom: v, left: v };
        }),

      setOverflowIds: (ids) =>
        set((state) => {
          state.overflowIds = Array.isArray(ids) ? ids : [];
        }),

      setMarginWarnIds: (ids) =>
        set((state) => {
          state.marginWarnIds = Array.isArray(ids) ? ids : [];
        }),

      undo: () =>
        set((state) => {
          const prev = state.history.past.pop();
          if (!prev) return;
          const current = snapshot(state);
          state.history.future.push(current);
          // cap future to avoid unbounded growth
          if (state.history.future.length > HISTORY_LIMIT) state.history.future.shift();
          state.elements = JSON.parse(JSON.stringify(prev.elements));
          state.tokens = { ...prev.tokens };
          state.canUndo = state.history.past.length > 0;
          state.canRedo = state.history.future.length > 0;
        }),

      redo: () =>
        set((state) => {
          const next = state.history.future.pop();
          if (!next) return;
          state.history.past.push(snapshot(state));
          if (state.history.past.length > HISTORY_LIMIT) state.history.past.shift();
          state.elements = JSON.parse(JSON.stringify(next.elements));
          state.tokens = { ...next.tokens };
          state.canUndo = state.history.past.length > 0;
          state.canRedo = state.history.future.length > 0;
        }),

      setInitialElementsFromSections: (sections) =>
        set((state) => {
          if (state.elements.length) return; // don't overwrite user layout
          let y = 24;
          sections.forEach((sec: any) => {
            state.elements.push({
              kind: "section",
              id: uuid(),
              frame: { x: 24, y, width: 547, height: 100 },
              content: (sec.title || "") + "\n" + (sec.content || ""),
            });
            y += 120;
          });
        }),
    })),
    {
      name: "cv_designer_store_v1",
      partialize: (s) => ({
        elements: s.elements,
        tokens: s.tokens,
        zoom: s.zoom,
        fitMode: s.fitMode,
        snapThreshold: s.snapThreshold,
        exportMargin: s.exportMargin,
        exportMargins: s.exportMargins,
      }),
    }
  )
);
