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
        return { elements:[...s.elements, el] };
      }),

      addSectionFromTemplate:({group,frame,parts,meta,title})=>set((s)=>{
        const el: SectionElement = { kind:"section", id:uid("sec"), group, frame, parts:parts.map(p=>({...p,lockText:!!p.lockText})), meta, title };
        return { elements:[...s.elements, el] };
      }),

      deleteByIds:(ids)=>set((s)=>({ elements:s.elements.filter(e=>!ids.includes(e.id)), selectedIds:[] })),
      deleteSelected:()=>set((s)=>({ elements:s.elements.filter(e=>!s.selectedIds.includes(e.id)), selectedIds:[] })),

      updatePartText:(sectionId, partKey, text)=>set((s)=>{
        const arr = s.elements.map(e=>{
          if (e.kind!=="section" || e.id!==sectionId) return e;
          return { ...e, parts: e.parts.map(p=> p.key===partKey ? { ...p, text } : p) } as SectionElement;
        });
        return { elements: arr };
      }),

      updatePartStyleLocal:(sectionId, partKey, patch)=>set((s)=>{
        const arr = s.elements.map(e=>{
          if (e.kind!=="section" || e.id!==sectionId) return e;
          return { ...e, parts: e.parts.map(p=> p.key===partKey ? { ...p, style:{ ...(p.style??{}), ...patch } } : p) } as SectionElement;
        });
        return { elements: arr };
      }),

      togglePartLock:(sectionId, partKey, lock)=>set((s)=>{
        const arr = s.elements.map(e=>{
          if (e.kind!=="section" || e.id!==sectionId) return e;
          return { ...e, parts: e.parts.map(p=> p.key===partKey ? { ...p, lockText: lock ?? !p.lockText } : p) } as SectionElement;
        });
        return { elements: arr };
      }),

      updateGlobalPartStyle:(group,partKey,patch)=>set((s)=>{
        const k = `${group}:${partKey}`;
        const current = s.partStyles[k] || {};
        return { partStyles: { ...s.partStyles, [k]: { ...current, ...patch } } };
      }),

      clearGlobalPartStyle:(group,partKey)=>set((s)=>{
        const k = `${group}:${partKey}`;
        const next = { ...s.partStyles }; delete next[k];
        return { partStyles: next };
      }),

      undoStack:[], redoStack:[],
      snapshot:()=>set((s)=>({ undoStack:[...s.undoStack,s.elements], redoStack:[] })),
      undo:()=>set((s)=>{ if(!s.undoStack.length) return {}; const prev=s.undoStack.at(-1)!; return { elements:prev, undoStack:s.undoStack.slice(0,-1), redoStack:[...s.redoStack,s.elements] }; }),
      redo:()=>set((s)=>{ if(!s.redoStack.length) return {}; const next=s.redoStack.at(-1)!; return { elements:next, redoStack:s.redoStack.slice(0,-1), undoStack:[...s.undoStack,s.elements] }; }),
    }),
    {
      // *** NEUER KEY → kalter Start, Altzustand wird ignoriert ***
      name: "designer:v3-parts",
      partialize: (state)=>({
        elements: state.elements,
        margins: state.margins,
        snapSize: state.snapSize,
        zoom: state.zoom,
        tokens: state.tokens,
        partStyles: state.partStyles,
      }),
      onRehydrateStorage: ()=> (api)=>{
        try{
          const s = api?.getState?.(); if(!s) return;
          const cleaned = (s.elements||[]).filter((e:any)=>{
            if (e.kind!=="section") return true;
            const hasSource = !!e?.meta?.source?.key;
            const hasParts  = Array.isArray(e?.parts) && e.parts.length>0;
            // alte, leere Sections ohne Quelle verwerfen
            if(!hasSource && !hasParts) return false;
            return true;
          });
          if(cleaned.length!==s.elements.length) api.setState({ elements: cleaned });
        }catch{}
      }
    }
  )
);

// Debug-Helfer im Browser:
if (typeof window!=="undefined") (window as any).__designerStore = useDesignerStore;
