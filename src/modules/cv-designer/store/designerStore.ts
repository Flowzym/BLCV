// src/modules/cv-designer/store/designerStore.ts
import create from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
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

type FitMode = "fit-width" | "fit-page" | "100%";

interface DesignerState {
  tokens: StyleToken;
  elements: CanvasElement[];
  selectedId: string | null;

  // canvas/ui
  zoom: number;
  fitMode: FitMode;
  snapThreshold: number;
  exportMargins: { top: number; right: number; bottom: number; left: number };

  // preflight
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
  fitToScreen(containerW: number, containerH: number): void;
  zoom100(): void;
  setSnapThreshold(n: number): void;

  setExportMargins(partial: Partial<{ top: number; right: number; bottom: number; left: number }>): void;

  // preflight setters
  setOverflowIds(ids: string[]): void;
  setMarginWarnIds(ids: string[]): void;

  // history ops
  undo(): void;
  redo(): void;

  // init from CV sections
  setInitialElementsFromSections(sections: Section[]): void;
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

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}
function snapshot(state: DesignerState): HistorySnap {
  return { elements: deepClone(state.elements), tokens: { ...state.tokens } };
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
      zoom: 1,
      fitMode: "fit-width",
      snapThreshold: 6,
      exportMargins: { top: 28, right: 28, bottom: 28, left: 28 },
      overflowIds: [],
      marginWarnIds: [],
      history: { past: [], future: [] },
      canUndo: false,
      canRedo: false,

      setTokens: throttle((tokens: Partial<StyleToken>, record = true) =>
        set((state) => {
          if (record) {
            state.history.past.push(snapshot(state));
            if (state.history.past.length > HISTORY_LIMIT) state.history.past.shift();
            state.history.future = [];
          }
          state.tokens = { ...state.tokens, ...tokens };
          state.canUndo = state.history.past.length > 0;
          state.canRedo = state.history.future.length > 0;
        }), 200),

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
        }), 120),

      select: (id) =>
        set((state) => {
          state.selectedId = id;
        }),

      // canvas/ui
      setZoom: (z) => set((s) => { s.zoom = Math.max(0.25, Math.min(3, z)); }),
      zoomIn: () => set((s) => { s.zoom = Math.min(3, s.zoom + 0.1); }),
      zoomOut: () => set((s) => { s.zoom = Math.max(0.25, s.zoom - 0.1); }),
      fitToScreen: (W: number, H: number) => set((s) => {
        const canvasW = 595, canvasH = 842;
        const k = Math.min((W - 40) / canvasW, (H - 40) / canvasH);
        s.zoom = Math.max(0.25, Math.min(3, k));
        s.fitMode = "fit-page";
      }),
      zoom100: () => set((s) => { s.zoom = 1; s.fitMode = "100%"; }),
      setSnapThreshold: (n) => set((s) => { s.snapThreshold = Math.max(0, Math.min(40, n)); }),

      setExportMargins: (partial) => set((s) => {
        s.exportMargins = { ...s.exportMargins, ...partial };
      }),

      setOverflowIds: (ids) => set((s) => { s.overflowIds = ids || []; }),
      setMarginWarnIds: (ids) => set((s) => { s.marginWarnIds = ids || []; }),

      undo: () =>
        set((state) => {
          const prev = state.history.past.pop();
          if (!prev) return;
          const current = snapshot(state);
          state.history.future.push(current);
          state.elements = deepClone(prev.elements);
          state.tokens = { ...prev.tokens };
          state.canUndo = state.history.past.length > 0;
          state.canRedo = state.history.future.length > 0;
        }),

      redo: () =>
        set((state) => {
          const next = state.history.future.pop();
          if (!next) return;
          state.history.past.push(snapshot(state));
          state.elements = deepClone(next.elements);
          state.tokens = { ...next.tokens };
          state.canUndo = state.history.past.length > 0;
          state.canRedo = state.history.future.length > 0;
        }),

      setInitialElementsFromSections: (sections) =>
        set((state) => {
          if (state.elements.length) return; // don't overwrite user layout
          let y = 24;
          for (const sec of sections || []) {
            state.elements.push({
              kind: "section",
              id: uuid(),
              frame: { x: 40, y, width: 515, height: 100 },
              content: `${(sec as any).title || ""}\n${(sec as any).content || ""}`.trim(),
            });
            y += 120;
          }
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
        exportMargins: s.exportMargins,
      }),
    }
  )
);
