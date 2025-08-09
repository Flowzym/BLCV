import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------- Types ----------------
export type GroupKey = "profil" | "kontakt" | "erfahrung" | "ausbildung" | "kenntnisse" | "softskills";

export type PartKey =
  | "titel"
  | "zeitraum"
  | "unternehmen"
  | "position"
  | "taetigkeiten"
  | "ort"
  | "abschluss"
  | "kontakt"
  | "skills";

export interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PartStyle {
  fontFamily?: string;
  fontSize?: number;            // px
  fontWeight?: "normal" | "bold";
  italic?: boolean;
  color?: string;               // hex/rgb
  letterSpacing?: number;       // em (0..)
  lineHeight?: number;          // multiplier
}

export interface PartSpec {
  key: PartKey;
  text: string;
  offset: { x: number; y: number; w?: number; h?: number }; // relativ zur Hauptbox
  style?: PartStyle;             // lokale Überschreibung (optional)
  lockText?: boolean;            // blockiert Generator-Updates pro Feld
}

export interface SectionElement {
  kind: "section";
  id: string;
  group: GroupKey;
  frame: Frame;                  // Hauptbox
  parts: PartSpec[];
  title?: string;                // optional (erste Zeile / Überschrift)
  meta?: { source?: { key: string; group: GroupKey; template?: string } };
}

export interface PhotoElement {
  kind: "photo";
  id: string;
  frame: Frame;
  src?: string;
}

export type CanvasElement = SectionElement | PhotoElement;

export interface Tokens {
  fontFamily?: string;
  fontSize?: number;     // default px
  lineHeight?: number;   // default
  colorPrimary?: string; // default text color
}

export interface DesignerState {
  elements: CanvasElement[];
  selectedIds: string[];
  margins: { top: number; right: number; bottom: number; left: number };
  snapSize: number;
  zoom: number;
  tokens: Tokens;

  /** globale Feld-Styles, gelten für ALLE Sektionen gleicher Gruppe/Feld */
  partStyles: Record<string, PartStyle>; // key = `${group}:${partKey}`

  // ---- Actions (Frames/Selection) ----
  setZoom(v: number): void;
  setSnapSize(v: number): void;
  setMargins(p: Partial<DesignerState["margins"]>): void;
  setTokens(p: Partial<Tokens>): void;

  select(ids: string[]): void;
  updateFrame(id: string, patch: Partial<Frame>): void;

  // ---- Elements CRUD ----
  setInitialElements(elems: CanvasElement[]): void;
  addPhoto(partial?: Partial<PhotoElement>): void;

  /** Sektion aus Template anlegen (Hauptbox + Parts) */
  addSectionFromTemplate(args: {
    group: GroupKey;
    frame: Frame;
    parts: Array<Omit<PartSpec, "lockText"> & { lockText?: boolean }>;
    meta?: SectionElement["meta"];
    title?: string;
  }): void;

  deleteByIds(ids: string[]): void;
  deleteSelected(): void;

  // ---- Parts/Text/Style ----
  updatePartText(sectionId: string, partKey: PartKey, text: string): void;
  updatePartStyleLocal(sectionId: string, partKey: PartKey, patch: Partial<PartStyle>): void;
  togglePartLock(sectionId: string, partKey: PartKey, lock?: boolean): void;

  /** Globale Style-Änderung (wirkt auf ALLE Sektionen gleicher Gruppe/Feld) */
  updateGlobalPartStyle(group: GroupKey, partKey: PartKey, patch: Partial<PartStyle>): void;

  /** Globalen Feld-Style komplett entfernen (zurück auf Defaults) */
  clearGlobalPartStyle(group: GroupKey, partKey: PartKey): void;

  // Undo/Redo (minimal – falls du schon ein anderes System hast, anpassen/entfernen)
  undoStack: CanvasElement[][];
  redoStack: CanvasElement[][];
  snapshot(): void;
  undo(): void;
  redo(): void;
}

// ---------------- Utils ----------------
function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

function mergeFrame(a: Frame, b: Partial<Frame>): Frame {
  return { x: b.x ?? a.x, y: b.y ?? a.y, width: b.width ?? a.width, height: b.height ?? a.height };
}

const DEFAULT_TOKENS: Tokens = {
  fontFamily: "Inter, Arial, sans-serif",
  fontSize: 12,
  lineHeight: 1.4,
  colorPrimary: "#111111",
};

// ---------------- Store ----------------
export const useDesignerStore = create<DesignerState>()(
  persist(
    (set, get) => ({
      elements: [],
      selectedIds: [],
      margins: { top: 36, right: 36, bottom: 36, left: 36 },
      snapSize: 20,
      zoom: 1,
      tokens: DEFAULT_TOKENS,

      partStyles: {},

      setZoom: (v) => set({ zoom: Math.max(0.25, Math.min(4, v)) }),
      setSnapSize: (v) => set({ snapSize: Math.max(1, Math.min(200, v)) }),
      setMargins: (p) => set((s) => ({ margins: { ...s.margins, ...p } })),
      setTokens: (p) => set((s) => ({ tokens: { ...s.tokens, ...p } })),

      select: (ids) => set({ selectedIds: Array.from(new Set(ids)) }),

      updateFrame: (id, patch) =>
        set((s) => {
          const idx = s.elements.findIndex((e) => e.id === id);
          if (idx < 0) return {};
          const el = s.elements[idx];
          if (el.kind !== "section" && el.kind !== "photo") return {};
          const next: CanvasElement =
            el.kind === "section"
              ? { ...el, frame: mergeFrame(el.frame, patch) }
              : { ...el, frame: mergeFrame(el.frame, patch) };
          const arr = s.elements.slice();
          arr[idx] = next;
          return { elements: arr };
        }),

      setInitialElements: (elems) =>
        set((s) => ({
          elements: elems,
          undoStack: [...s.undoStack, s.elements],
          redoStack: [],
        })),

      addPhoto: (partial = {}) =>
        set((s) => {
          const el: PhotoElement = {
            kind: "photo",
            id: uid("ph"),
            frame: partial.frame ?? { x: 60, y: 60, width: 120, height: 120 },
            src: partial.src,
          };
          return { elements: [...s.elements, el] };
        }),

      addSectionFromTemplate: ({ group, frame, parts, meta, title }) =>
        set((s) => {
          const el: SectionElement = {
            kind: "section",
            id: uid("sec"),
            group,
            frame,
            parts: parts.map((p) => ({ ...p, lockText: !!p.lockText })),
            meta,
            title,
          };
          return { elements: [...s.elements, el] };
        }),

      deleteByIds: (ids) =>
        set((s) => ({ elements: s.elements.filter((e) => !ids.includes(e.id)), selectedIds: [] })),

      deleteSelected: () =>
        set((s) => ({ elements: s.elements.filter((e) => !s.selectedIds.includes(e.id)), selectedIds: [] })),

      updatePartText: (sectionId, partKey, text) =>
        set((s) => {
          const arr = s.elements.map((e) => {
            if (e.kind !== "section" || e.id !== sectionId) return e;
            return {
              ...e,
              parts: e.parts.map((p) => (p.key === partKey ? { ...p, text } : p)),
            } as SectionElement;
          });
          return { elements: arr };
        }),

      updatePartStyleLocal: (sectionId, partKey, patch) =>
        set((s) => {
          const arr = s.elements.map((e) => {
            if (e.kind !== "section" || e.id !== sectionId) return e;
            return {
              ...e,
              parts: e.parts.map((p) => (p.key === partKey ? { ...p, style: { ...(p.style ?? {}), ...patch } } : p)),
            } as SectionElement;
          });
          return { elements: arr };
        }),

      togglePartLock: (sectionId, partKey, lock) =>
        set((s) => {
          const arr = s.elements.map((e) => {
            if (e.kind !== "section" || e.id !== sectionId) return e;
            return {
              ...e,
              parts: e.parts.map((p) => (p.key === partKey ? { ...p, lockText: lock ?? !p.lockText } : p)),
            } as SectionElement;
          });
          return { elements: arr };
        }),

      updateGlobalPartStyle: (group, partKey, patch) =>
        set((s) => {
          const k = `${group}:${partKey}`;
          const current = s.partStyles[k] || {};
          return { partStyles: { ...s.partStyles, [k]: { ...current, ...patch } } };
        }),

      clearGlobalPartStyle: (group, partKey) =>
        set((s) => {
          const k = `${group}:${partKey}`;
          const next = { ...s.partStyles };
          delete next[k];
          return { partStyles: next };
        }),

      // ---- mini undo/redo ----
      undoStack: [],
      redoStack: [],
      snapshot: () => set((s) => ({ undoStack: [...s.undoStack, s.elements], redoStack: [] })),
      undo: () =>
        set((s) => {
          if (!s.undoStack.length) return {};
          const prev = s.undoStack[s.undoStack.length - 1];
          const undoStack = s.undoStack.slice(0, -1);
          return { elements: prev, undoStack, redoStack: [...s.redoStack, s.elements] };
        }),
      redo: () =>
        set((s) => {
          if (!s.redoStack.length) return {};
          const next = s.redoStack[s.redoStack.length - 1];
          const redoStack = s.redoStack.slice(0, -1);
          return { elements: next, redoStack, undoStack: [...s.undoStack, s.elements] };
        }),
    }),
    { name: "designer:v2-parts" }
  )
);
