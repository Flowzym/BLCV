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

interface DesignerState {
  tokens: StyleToken;
  elements: CanvasElement[];
  selectedId: string | null;

  // history
  history: { past: HistorySnap[]; future: HistorySnap[] };
  canUndo: boolean;
  canRedo: boolean;

  // actions
  setTokens(tokens: Partial<StyleToken>, record?: boolean): void;
  addElement(el: CanvasElement, record?: boolean): void;
  updateFrame(id: string, frame: Frame, record?: boolean): void;
  select(id: string | null): void;

  undo(): void;
  redo(): void;

  setInitialElementsFromSections(sections: Section[]): void;
}

function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let last = 0;
  let timer: any = null;
  return function(this: any, ...args: any[]) {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn.apply(this, args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(()=>{ last = Date.now(); fn.apply(this, args); }, ms - (now - last));
    }
  } as T;
}

function snapshot(state: DesignerState): HistorySnap {
  return { elements: JSON.parse(JSON.stringify(state.elements)), tokens: { ...state.tokens } };
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
      history: { past: [], future: [] },
      canUndo: false,
      canRedo: false,

      setTokens: throttle((tokens: Partial<StyleToken>, record = true) =>
        set((state) => {
      state.future = [];
          if (record) {
            state.history.past.push(snapshot(state));
            state.history.future = [];
          }
          state.tokens = { ...state.tokens, ...tokens };
          state.canUndo = state.history.past.length > 0;
          state.canRedo = state.history.future.length > 0;
        }), 250),

      addElement: (el, record = true) =>
        set((state) => {
      state.future = [];
          if (record) {
            state.history.past.push(snapshot(state));
            state.history.future = [];
          }
          state.elements.push(el);
          state.canUndo = state.history.past.length > 0;
          state.canRedo = state.history.future.length > 0;
        }),

      updateFrame: throttle((id, frame, record = true) =>
        set((state) => {
      state.future = [];
          const el = state.elements.find((e) => e.id === id);
          if (!el) return;
          if (record) {
            state.history.past.push(snapshot(state));
            state.history.future = [];
          }
          (el as any).frame = frame;
          state.canUndo = state.history.past.length > 0;
          state.canRedo = state.history.future.length > 0;
        }), 200),

      select: (id) =>
        set((state) => {
      state.future = [];
          state.selectedId = id;
        }),

      undo: () =>
        set((state) => {
      state.future = [];
          const prev = state.history.past.pop();
          if (!prev) return;
          const current = snapshot(state);
          state.history.future.push(current);
          state.elements = JSON.parse(JSON.stringify(prev.elements));
          state.tokens = { ...prev.tokens };
          state.canUndo = state.history.past.length > 0;
          state.canRedo = state.history.future.length > 0;
        }),

      redo: () =>
        set((state) => {
      state.future = [];
          const next = state.history.future.pop();
          if (!next) return;
          state.history.past.push(snapshot(state));
          state.elements = JSON.parse(JSON.stringify(next.elements));
          state.tokens = { ...next.tokens };
          state.canUndo = state.history.past.length > 0;
          state.canRedo = state.history.future.length > 0;
        }),

      setInitialElementsFromSections: (sections) =>
        set((state) => {
      state.future = [];
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
    { name: "cv_designer_store_v1", partialize: (s)=>({ elements: s.elements, tokens: s.tokens }) }
  )
);
