import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CVSectionWithParts } from "../types/section";

const DBG = (msg: string, ...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
    console.log('[DESIGNER]', msg, ...args);
  } else {
    console.log('[DESIGNER*]', msg, ...args);
  }
};

export type GroupKey = "profil" | "kontakt" | "erfahrung" | "ausbildung" | "kenntnisse" | "softskills";
export type PartKey =
  | "titel" | "zeitraum" | "unternehmen" | "position" | "taetigkeiten"
  | "ort" | "abschluss" | "kontakt" | "skills";

export type SectionType = 'experience' | 'education' | 'profile' | 'skills' | 'softskills';

export interface Typography {
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;   // als Faktor
  color?: string;
  fontWeight?: 'normal' | 'bold' | number;
  fontStyle?: 'normal' | 'italic';
  letterSpacing?: number;
}

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

export interface EnhancedCanvasElement {
  id: string;
  sectionId: string;        // z. B. "experience:<uuid>"
  sectionType: SectionType; // z. B. "experience"
  field: string;            // z. B. "title" | "company" | "period" | "bullet"
  order?: number;           // Reihenfolge innerhalb der Sektion
  text?: string;
  // Layout-relative Offsets (werden durch Vorlagen befüllt)
  offsetX?: number;
  offsetY?: number;
  width?: number;
  // Fabric.js properties
  left?: number;
  top?: number;
  type?: string;
}

export interface Tokens {
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  colorPrimary?: string;
}

export interface DesignerState {
  sections: CVSectionWithParts[];
  version: number;
  selectedIds: string[];
  margins: { top:number; right:number; bottom:number; left:number };
  snapSize: number;
  zoom: number;
  tokens: Tokens;
  partStyles: Record<string, PartStyle>; // `${group}:${partKey}`
  globalFieldStyles: Record<SectionType, Record<string, Typography>>;
  activeLayoutByType: Record<SectionType, string>;
  /** true sobald persist-Rehydration durch ist */
  hydrated: boolean;

  setSections(s: CVSectionWithParts[]): void;
  bump(): void;
  setZoom(v:number): void;
  setSnapSize(v:number): void;
  setMargins(p: Partial<DesignerState["margins"]>): void;
  setTokens(p: Partial<Tokens>): void;
  setGlobalFieldStyle: (sectionType: SectionType, field: string, t: Partial<Typography>) => void;
  setActiveLayoutForType: (type: SectionType, layoutId: string) => void;

  select(ids:string[]): void;
  updateFrame(id:string, patch:Partial<Frame>): void;

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
      sections: [],
      version: 0,
      selectedIds: [],
      margins: { top:36, right:36, bottom:36, left:36 },
      snapSize: 20,
      zoom: 1,
      tokens: DEFAULT_TOKENS,
      partStyles: {},
      globalFieldStyles: {
        experience: {},
        education: {},
        profile: {},
        skills: {},
        softskills: {}
      },
      activeLayoutByType: {
        experience: 'default',
        education: 'default',
        profile: 'default',
        skills: 'default',
        softskills: 'default'
      },

      hydrated: false,

      setSections:(s)=>{
        DBG('Store setSections:', { sectionsCount: s.length, sections: s.map(sec => ({ id: sec.id, title: sec.title, partsCount: sec.parts?.length || 0 })) });
        set({ sections: s });
      },
      bump:()=>set((s)=>{
        const newVersion = Date.now();
        DBG('Store bump version:', { from: s.version, to: newVersion });
        return { version: newVersion };
      }),
      setZoom:(v)=>set({ zoom: Math.max(0.25, Math.min(4, v)) }),
      setSnapSize:(v)=>set({ snapSize: Math.max(1, Math.min(200, v)) }),
      setMargins:(p)=>set((s)=>({ margins: { ...s.margins, ...p }})),
      setTokens:(p)=>set((s)=>({ tokens: { ...s.tokens, ...p }})),
      setGlobalFieldStyle: (sectionType, field, t) => set((s) => ({
        globalFieldStyles: {
          ...s.globalFieldStyles,
          [sectionType]: {
            ...s.globalFieldStyles[sectionType],
            [field]: {
              ...s.globalFieldStyles[sectionType][field],
              ...t
            }
          }
        }
      })),
      setActiveLayoutForType: (type, layoutId) => set((s) => ({
        activeLayoutByType: {
          ...s.activeLayoutByType,
          [type]: layoutId
        }
      })),

      select:(ids)=>set({ selectedIds: Array.from(new Set(ids)) }),

      updateFrame:(id,patch)=>set((s)=>{
        const idx = s.sections.findIndex(sec=>sec.id===id);
        if (idx<0) return {};
        const section = s.sections[idx];
        const next = { 
          ...section, 
          x: patch.x ?? section.x,
          y: patch.y ?? section.y,
          width: patch.width ?? section.width,
          height: patch.height ?? section.height
        };
        const arr = s.sections.slice(); 
        arr[idx] = next;
        return { sections: arr };
      }),

      addPhoto:(partial={})=>set((s)=>{
        const el: PhotoElement = { kind:"photo", id:uid("ph"), frame: partial.frame ?? {x:60,y:60,width:120,height:120}, src: partial.src };
        // TODO: Photos als separate Entities oder in sections integrieren
        return {};
      }),

      addSectionFromTemplate:({group,frame,parts,meta,title})=>set((s)=>{
        const el: SectionElement = { kind:"section", id:uid("sec"), group, frame, parts:parts.map(p=>({...p,lockText:!!p.lockText})), meta, title };
        // TODO: Template-basierte Section-Erstellung anpassen
        return {};
      }),

      deleteByIds:(ids)=>set((s)=>({ sections:s.sections.filter(sec=>!ids.includes(sec.id)), selectedIds:[] })),
      deleteSelected:()=>set((s)=>({ sections:s.sections.filter(sec=>!s.selectedIds.includes(sec.id)), selectedIds:[] })),

      updatePartText:(sectionId, partKey, text)=>set((s)=>{
        const arr = s.sections.map(sec=>{
          if (sec.id !== sectionId) return sec;
          return { 
            ...sec, 
            parts: sec.parts.map(p => 
              p.fieldType === partKey ? { ...p, text } : p
            ) 
          };
        });
        return { sections: arr };
      }),

      updatePartStyleLocal:(sectionId, partKey, patch)=>set((s)=>{
        const arr = s.sections.map(sec=>{
          if (sec.id !== sectionId) return sec;
          return { 
            ...sec, 
            parts: sec.parts.map(p => 
              p.fieldType === partKey ? { 
                ...p, 
                fontSize: patch.fontSize ?? p.fontSize,
                fontFamily: patch.fontFamily ?? p.fontFamily,
                color: patch.color ?? p.color,
                fontWeight: patch.fontWeight ?? p.fontWeight,
                fontStyle: patch.italic ? 'italic' : (patch.fontStyle ?? p.fontStyle),
                lineHeight: patch.lineHeight ?? p.lineHeight,
                letterSpacing: patch.letterSpacing ?? p.letterSpacing
              } : p
            ) 
          };
        });
        return { sections: arr };
      }),

      togglePartLock:(sectionId, partKey, lock)=>set((s)=>{
        const arr = s.sections.map(sec=>{
          if (sec.id !== sectionId) return sec;
          return { 
            ...sec, 
            parts: sec.parts.map(p => 
              p.fieldType === partKey ? { ...p, /* lockText: lock ?? !p.lockText */ } : p
            ) 
          };
        });
        return { sections: arr };
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

      undoStack:[], 
      redoStack:[],
      snapshot:()=>set((s)=>({ undoStack:[...s.undoStack,s.sections], redoStack:[] })),
      undo:()=>set((s)=>{ if(!s.undoStack.length) return {}; const prev=s.undoStack.at(-1)!; return { sections:prev, undoStack:s.undoStack.slice(0,-1), redoStack:[...s.redoStack,s.sections] }; }),
      redo:()=>set((s)=>{ if(!s.redoStack.length) return {}; const next=s.redoStack.at(-1)!; return { sections:next, redoStack:s.redoStack.slice(0,-1), undoStack:[...s.undoStack,s.sections] }; }),
    }),
    {
      // *** NEUER KEY → kalter Start, Altzustand wird ignoriert ***
      name: "designer:v4-sections",
      partialize: (state)=>({
        sections: state.sections,
        version: state.version,
        margins: state.margins,
        snapSize: state.snapSize,
        zoom: state.zoom,
        tokens: state.tokens,
        partStyles: state.partStyles,
      }),
      onRehydrateStorage: ()=> (api)=>{
        try{
          const s = api?.getState?.(); if(!s) return;
          const cleaned = (s.sections||[]).filter((sec:any)=>{
            const hasParts = Array.isArray(sec?.parts) && sec.parts.length > 0;
            const hasContent = sec?.content?.trim?.() || hasParts;
            // leere Sections verwerfen
            if(!hasContent) return false;
            return true;
          });
          if(cleaned.length!==s.sections.length) api.setState({ sections: cleaned });
          // ✅ Hydrations-Flag setzen
          api.setState({ hydrated: true });
          DBG('Store rehydrated:', { sectionsCount: api.getState().sections.length });
        }catch{
          api?.setState?.({ hydrated: true });
        }
      }
    }
  )
);

// Debug-Helfer im Browser:
if (typeof window!=="undefined") (window as any).__designerStore = useDesignerStore;

