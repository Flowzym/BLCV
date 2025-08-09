import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GroupKey = "profil" | "kontakt" | "erfahrung" | "ausbildung" | "kenntnisse" | "softskills";
export type PartKey =
  | "titel" | "zeitraum" | "unternehmen" | "position" | "taetigkeiten"
  | "ort" | "abschluss" | "kontakt" | "skills";

export interface Frame { x:number; y:number; width:number; height:number; }

export interface PartStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  italic?: boolean;
  color?: string;
  letterSpacing?: number;  // em
  lineHeight?: number;     // multiplier
}

export interface PartSpec {
  key: PartKey;
  text: string;
  offset: { x:number; y:number; w?:number; h?:number };
  style?: PartStyle;
  lockText?: boolean;
}

export interface SectionElement {
  kind: "section";
  id: string;
  group: GroupKey;
  frame: Frame;
  parts: PartSpec[];
  title?: string;
  meta?: { source?: { key: string; group: GroupKey; template?: string } };
}

export interface PhotoElement { kind:"photo"; id:string; frame:Frame; src?:string; }
export type CanvasElement = SectionElement | PhotoElement;

export interface Tokens {
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  colorPrimary?: string;
}

export interface DesignerState {
  elements: CanvasElement[];
  selectedIds: string[];
  margins: { top:number; right:number; bottom:number; left:number };
  snapSize: number;
  zoom: number;
  tokens: Tokens;
  partStyles: Record<string, PartStyle>; // `${group}:${partKey}`
  /** true sobald persist-Rehydration durch ist */
  hydrated: boolean;

  setZoom(v:number): void;
  setSnapSize(v:number): void;
  setMargins(p: Partial<DesignerState["margins"]>): void;
  setTokens(p: Partial<Tokens>): void;

  select(ids:string[]): void;
  updateFrame(id:string, patch:Partial<Frame>): void;

  setInitialElements(elems: CanvasElement[]): void;
  addPhoto(partial?: Partial<PhotoElement>): void;
  addSectionFromTemplate(args:{
    group:GroupKey; frame:Frame;
    parts:Array<Omit<PartSpec,"lockText">&{lockText?:boolean}>;
    meta?: SectionElement["meta"]; title?:string;
  }): void;

  deleteByIds(ids:string[]): void;
  deleteSelected(): void;

  updatePartText(sectionId:string, partKey:PartKey, text:string): void;
  updatePartStyleLocal(sectionId:string, partKey:PartKey, patch:Partial<PartStyle>): void;
  togglePartLock(sectionId:string, partKey:PartKey, lock?:boolean): void;

  updateGlobalPartStyle(group:GroupKey, partKey:PartKey, patch:Partial<PartStyle>): void;
  clearGlobalPartStyle(group:GroupKey, partKey:PartKey): void;

  undoStack: CanvasElement[][];
  redoStack: CanvasElement[][];
  snapshot(): void;
  undo(): void;
  redo(): void;
}

function uid(prefix="id"){ return `${prefix}_${Math.random().toString(36).slice(2,8)}${Date.now().toString(36).slice(-4)}`; }
function mergeFrame(a:Frame,b:Partial<Frame>):Frame{ return { x:b.x??a.x, y:b.y??a.y, width:b.width??a.width, height:b.height??a.height }; }

const DEFAULT_TOKENS: Tokens = { fontFamily:"Inter, Arial, sans-serif", fontSize:12, lineHeight:1.4, colorPrimary:"#111111" };

export const useDesignerStore = create<DesignerState>()(
  persist(
    (set,get)=>({
      elements: [],
      selectedIds: [],
      margins: { top:36, right:36, bottom:36, left:36 },
      snapSize: 20,
      zoom: 1,
      tokens: DEFAULT_TOKENS,
      partStyles: {},

      hydrated: false,

      setZoom:(v)=>set({ zoom: Math.max(0.25, Math.min(4, v)) }),
      setSnapSize:(v)=>set({ snapSize: Math.max(1, Math.min(200, v)) }),
      setMargins:(p)=>set((s)=>({ margins: { ...s.margins, ...p }})),
      setTokens:(p)=>set((s)=>({ tokens: { ...s.tokens, ...p }})),

      select:(ids)=>set({ selectedIds: Array.from(new Set(ids)) }),

      updateFrame:(id,patch)=>set((s)=>{
        const idx = s.elements.findIndex(e=>e.id===id);
        if (idx<0) return {};
        const el = s.elements[idx];
        const next:CanvasElement = { ...el, frame: mergeFrame(el.frame, patch) } as CanvasElement;
        const arr = s.elements.slice(); arr[idx]=next;
        return { elements: arr };
      }),

      setInitialElements:(elems)=>set((s)=>({ elements: elems, undoStack:[...s.undoStack,s.elements], redoStack:[] })),

      addPhoto:(partial={})=>set((s)=>{
        const el: PhotoElement = { kind:"photo", id:uid("ph"), frame: partial.frame ?? {x:60,y:60,width:120,height:120}, src: partial.src };
        return { elements:[...s.e]()
