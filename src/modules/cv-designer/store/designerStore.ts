import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";

export type StyleToken = {
  fontFamily: string;
  fontSize: number;
  colorPrimary: string;
};

export type Frame = { x: number; y: number; width: number; height: number };

export type CanvasElement =
  | { kind: "section"; id: string; frame: Frame; content: string }
  | { kind: "photo"; id: string; frame: Frame; src?: string };

type HistorySnap = { elements: CanvasElement[]; tokens: StyleToken };

type Margins = { top: number; right: number; bottom: number; left: number };

interface DesignerState {
  tokens: StyleToken;
  elements: CanvasElement[];
  selectedId: string | null;

  // view
  zoom: number;
  snapThreshold: number;
  exportMargins: Margins;

  // history
  history: { past: HistorySnap[]; future: HistorySnap[] };
  canUndo: boolean;
  canRedo: boolean;

  // actions
  setTokens(tokens: Partial<StyleToken>, record?: boolean): void;
  addSection(content?: string, frame?: Partial<Frame>): void;
  addPhoto(frame?: Partial<Frame>, src?: string): void;
  addElement(el: CanvasElement, record?: boolean): void;
  updateFrame(id: string, frame: Frame, record?: boolean): void;
  updateText(id: string, text: string, record?: boolean): void;
  remove(id: string, record?: boolean): void;
  select(id: string | null): void;

  setZoom(z: number): void;
  setSnapThreshold(px: number): void;
  setExportMargins(m: Partial<Margins>): void;

  undo(): void;
  redo(): void;

  setInitialElementsFromSections(sections: Array<{ title?: string; content?: string }>): void;
}

const HISTORY_LIMIT = 50;

function snapshot(state: DesignerState): HistorySnap {
  return {
    elements: JSON.parse(JSON.stringify(state.elements)),
    tokens: { ...state.tokens },
  };
}

function pushHistory(state: DesignerState) {
  state.history.past.push(snapshot(state));
  if (state.history.past.length > HISTORY_LIMIT) state.history.past.shift();
  state.history.future = [];
  state.canUndo = state.history.past.length > 0;
  state.canRedo = false;
}

export const useDesignerStore = create<DesignerState>()(
  persist(
    immer((set, get) => ({
      tokens: { fontFamily: "Inter", fontSize: 12, colorPrimary: "#111827" },
      elements: [],
      selectedId: null,

      zoom: 1,
      snapThreshold: 8,
      exportMargins: { top: 28, right: 28, bottom: 28, left: 28 },

      history: { past: [], future: [] },
      canUndo: false,
      canRedo: false,

      setTokens: (tokens, record = true) =>
        set((s) => {
          if (record) pushHistory(s);
          s.tokens = { ...s.tokens, ...tokens };
        }),

      addSection: (content, frame) =>
        set((s) => {
          pushHistory(s);
          const id = uuid();
          s.elements.push({
            kind: "section",
            id,
            frame: {
              x: frame?.x ?? 240,
              y: frame?.y ?? 120,
              width: frame?.width ?? 240,
              height: frame?.height ?? 120,
            },
            content:
              content ?? "Neue Section\nDoppelklicken zum Bearbeiten",
          });
          s.selectedId = id;
        }),

      addPhoto: (frame, src) =>
        set((s) => {
          pushHistory(s);
          const id = uuid();
          s.elements.push({
            kind: "photo",
            id,
            frame: {
              x: frame?.x ?? 280,
              y: frame?.y ?? 200,
              width: frame?.width ?? 100,
              height: frame?.height ?? 120,
            },
            src,
          });
          s.selectedId = id;
        }),

      addElement: (el, record = true) =>
        set((s) => {
          if (record) pushHistory(s);
          s.elements.push(el);
          s.selectedId = el.id;
        }),

      updateFrame: (id, frame, record = false) =>
        set((s) => {
          if (record) pushHistory(s);
          const el = s.elements.find((e) => e.id === id);
          if (el) (el as any).frame = frame;
        }),

      updateText: (id, text, record = false) =>
        set((s) => {
          if (record) pushHistory(s);
          const el = s.elements.find((e) => e.id === id && e.kind === "section") as any;
          if (el) el.content = text;
        }),

      remove: (id, record = true) =>
        set((s) => {
          if (record) pushHistory(s);
          s.elements = s.elements.filter((e) => e.id !== id);
          if (s.selectedId === id) s.selectedId = null;
        }),

      select: (id) => set((s) => { s.selectedId = id; }),

      setZoom: (z) => set((s) => { s.zoom = Math.max(0.25, Math.min(3, z)); }),

      setSnapThreshold: (px) => set((s) => { s.snapThreshold = Math.max(0, Math.min(40, px)); }),

      setExportMargins: (m) =>
        set((s) => {
          s.exportMargins = { ...s.exportMargins, ...m };
        }),

      undo: () =>
        set((s) => {
          const prev = s.history.past.pop();
          if (!prev) return;
          const current = snapshot(s);
          s.history.future.push(current);
          s.elements = JSON.parse(JSON.stringify(prev.elements));
          s.tokens = { ...prev.tokens };
          s.canUndo = s.history.past.length > 0;
          s.canRedo = s.history.future.length > 0;
        }),

      redo: () =>
        set((s) => {
          const next = s.history.future.pop();
          if (!next) return;
          s.history.past.push(snapshot(s));
          s.elements = JSON.parse(JSON.stringify(next.elements));
          s.tokens = { ...next.tokens };
          s.canUndo = s.history.past.length > 0;
          s.canRedo = s.history.future.length > 0;
        }),

      setInitialElementsFromSections: (sections) =>
        set((s) => {
          if (!sections || s.elements.length) return; // nicht überschreiben
          let y = 80;
          for (const sec of sections) {
            s.elements.push({
              kind: "section",
              id: uuid(),
              frame: { x: 72, y, width: 450, height: 100 },
              content: `${sec.title ?? "Section"}\n${sec.content ?? ""}`,
            });
            y += 120;
          }
        }),
    })),
    {
      name: "cv_designer_store_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        elements: s.elements,
        tokens: s.tokens,
        exportMargins: s.exportMargins,
      }),
    }
  )
);
