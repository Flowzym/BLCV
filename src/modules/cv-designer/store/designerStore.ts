import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Frame = { x: number; y: number; width: number; height: number };
export type CanvasElement =
  | { kind: "section"; id: string; frame: Frame; title?: string; text: string }
  | { kind: "photo"; id: string; frame: Frame; src?: string };

export type Margins = { top: number; right: number; bottom: number; left: number };

export type StyleTokens = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  colorPrimary: string;
  colorSecondary: string;
  page: { size: "A4"; dpi: number };
  margins: Margins;
  sectionSpacing: number;
  snapSize: number;
  widthPercent: number;
};

type HistorySnap = {
  elements: CanvasElement[];
  margins: Margins;
  zoom: number;
  tokens: StyleTokens;
};

type DesignerState = {
  elements: CanvasElement[];
  selectedIds: string[];
  margins: Margins;
  snapSize: number;
  zoom: number;
  tokens: StyleTokens;

  undoStack: HistorySnap[];
  redoStack: HistorySnap[];

  addSection(partial?: Partial<CanvasElement & { text: string }>): void;
  addPhoto(partial?: Partial<CanvasElement>): void;
  updateText(id: string, text: string): void;
  updateFrame(id: string, frame: Partial<Frame>): void;
  deleteSelected(): void;
  select(ids: string[]): void;
  setMargins(m: Partial<Margins>): void;
  setSnapSize(n: number): void;
  setZoom(z: number): void;
  setTokens(partial: Partial<StyleTokens>): void;
  setInitialElementsFromSections(sections: Array<{ title?: string; content?: string }>): void;
  undo(): void;
  redo(): void;
  commit(): void;
};

const HISTORY_LIMIT = 50;

function defaultTokens(margins: Margins, snapSize = 20): StyleTokens {
  return {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: 11,
    lineHeight: 1.4,
    colorPrimary: "#111111",
    colorSecondary: "#4B5563",
    page: { size: "A4", dpi: 72 },
    margins: { ...margins },
    sectionSpacing: 12,
    snapSize,
    widthPercent: 100,
  };
}

function snapshot(state: DesignerState): HistorySnap {
  return {
    elements: state.elements.map((e) => JSON.parse(JSON.stringify(e))),
    margins: { ...state.margins },
    zoom: state.zoom,
    tokens: JSON.parse(JSON.stringify(state.tokens)),
  };
}

function uid(prefix = "el"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useDesignerStore = create<DesignerState>()(
  persist(
    (set, get) => ({
      elements: [],
      selectedIds: [],
      margins: { top: 36, right: 36, bottom: 36, left: 36 },
      snapSize: 20,
      zoom: 1,
      tokens: defaultTokens({ top: 36, right: 36, bottom: 36, left: 36 }, 20),
      undoStack: [],
      redoStack: [],

      addSection(partial = {}) {
        const el: CanvasElement = {
          kind: "section",
          id: uid("sec"),
          frame: { x: 60, y: 60, width: 480, height: 0, ...(partial.frame || {}) },
          title: partial.title ?? "Erfahrung",
          text: (partial as any).text ?? "• Punkt 1\n• Punkt 2\n• Punkt 3",
        };
        set((s) => {
          const next = { ...s, elements: [...s.elements, el] };
          const u = s.undoStack.concat(snapshot(s)).slice(-HISTORY_LIMIT);
          return { ...next, undoStack: u, redoStack: [] };
        });
      },

      addPhoto(partial = {}) {
        const el: CanvasElement = {
          kind: "photo",
          id: uid("img"),
          frame: { x: 60, y: 60, width: 120, height: 120, ...(partial.frame || {}) },
          src: partial.src,
        };
        set((s) => {
          const next = { ...s, elements: [...s.elements, el] };
          const u = s.undoStack.concat(snapshot(s)).slice(-HISTORY_LIMIT);
          return { ...next, undoStack: u, redoStack: [] };
        });
      },

      updateText(id, text) {
        set((s) => {
          const idx = s.elements.findIndex((e) => e.id === id && e.kind === "section");
          if (idx === -1) return s as DesignerState;
          const el = s.elements[idx] as Extract<CanvasElement, { kind: "section" }>;
          const updated: CanvasElement = { ...el, text };
          const nextEls = [...s.elements];
          nextEls[idx] = updated;
          const u = s.undoStack.concat(snapshot(s)).slice(-HISTORY_LIMIT);
          return { ...s, elements: nextEls, undoStack: u, redoStack: [] };
        });
      },

      updateFrame(id, frame) {
        set((s) => {
          const idx = s.elements.findIndex((e) => e.id === id);
          if (idx === -1) return s as DesignerState;
          const el = s.elements[idx];
          const updated: CanvasElement = { ...el, frame: { ...el.frame, ...frame } };
          const nextEls = [...s.elements];
          nextEls[idx] = updated;
          return { ...s, elements: nextEls };
        });
      },

      deleteSelected() {
        const ids = new Set(get().selectedIds);
        set((s) => {
          if (!ids.size) return s as DesignerState;
          const next = { ...s, elements: s.elements.filter((e) => !ids.has(e.id)), selectedIds: [] };
          const u = s.undoStack.concat(snapshot(s)).slice(-HISTORY_LIMIT);
          return { ...next, undoStack: u, redoStack: [] };
        });
      },

      select(ids) {
        set({ selectedIds: [...ids] });
      },

      setMargins(m) {
        set((s) => {
          const merged = { ...s.margins, ...m };
          return { ...s, margins: merged, tokens: { ...s.tokens, margins: { ...merged } } };
        });
      },

      setSnapSize(n) {
        const val = Math.max(1, Math.round(n));
        set((s) => ({ ...s, snapSize: val, tokens: { ...s.tokens, snapSize: val } }));
      },

      setZoom(z) {
        set({ zoom: Math.max(0.25, Math.min(3, z)) });
      },

      setTokens(partial) {
        set((s) => {
          const merged = { ...s.tokens, ...partial };
          return {
            ...s,
            tokens: merged,
            margins: partial?.margins ? { ...partial.margins } : s.margins,
            snapSize: typeof partial?.snapSize === "number" ? partial.snapSize : s.snapSize,
          };
        });
      },

      setInitialElementsFromSections(sections) {
        if (!sections?.length) return;
        const joined = sections
          .map((s) => {
            const title = s.title ? `${s.title}\n` : "";
            return `${title}${s.content ?? ""}`;
          })
          .join("\n");
        set((s) => {
          const init: CanvasElement = {
            kind: "section",
            id: uid("sec"),
            frame: { x: 60, y: 60, width: 480, height: 0 },
            title: "Erfahrung",
            text: joined,
          };
          const next = { ...s, elements: [init] };
          const u = s.undoStack.concat(snapshot(s)).slice(-HISTORY_LIMIT);
          return { ...next, undoStack: u, redoStack: [] };
        });
      },

      undo() {
        const s = get();
        const prev = s.undoStack[s.undoStack.length - 1];
        if (!prev) return;
        const newUndo = s.undoStack.slice(0, -1);
        const red = s.redoStack.concat(snapshot(s)).slice(-HISTORY_LIMIT);
        set({ elements: prev.elements, margins: prev.margins, zoom: prev.zoom, tokens: prev.tokens, undoStack: newUndo, redoStack: red });
      },

      redo() {
        const s = get();
        const next = s.redoStack[s.redoStack.length - 1];
        if (!next) return;
        const newRedo = s.redoStack.slice(0, -1);
        const und = s.undoStack.concat(snapshot(s)).slice(-HISTORY_LIMIT);
        set({ elements: next.elements, margins: next.margins, zoom: next.zoom, tokens: next.tokens, undoStack: und, redoStack: newRedo });
      },

      commit() {
        set((s) => {
          const u = s.undoStack.concat(snapshot(s)).slice(-HISTORY_LIMIT);
          return { ...s, undoStack: u, redoStack: [] };
        });
      },
    }),
    {
      name: "cv-designer-store",
      version: 3,
      migrate: (persisted: any) => {
        if (!persisted?.state) return persisted;
        const s = persisted.state;

        // 1) margins sicherstellen (alte Staaten hatten evtl. exportMargins oder gar nichts)
        const fallback: Margins = { top: 36, right: 36, bottom: 36, left: 36 };
        if (!s.margins) s.margins = s.exportMargins ?? fallback;

        // 2) tokens auffüllen / erzeugen
        const snap = typeof s.snapSize === "number" ? s.snapSize : 20;
        if (!s.tokens) {
          s.tokens = defaultTokens(s.margins, snap);
        } else {
          s.tokens = { ...defaultTokens(s.margins, snap), ...s.tokens };
          if (!s.tokens.margins) s.tokens.margins = { ...s.margins };
          if (typeof s.tokens.snapSize !== "number") s.tokens.snapSize = snap;
        }

        // 3) Top-Level snapSize synchronisieren
        if (typeof s.snapSize !== "number") s.snapSize = s.tokens.snapSize;

        // 4) Altlast entfernen
        if (s.exportMargins) delete s.exportMargins;

        return { ...persisted, state: s };
      },
    }
  )
);
