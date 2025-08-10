// src/modules/cv-designer/services/useLiveSyncFromGenerator.ts
import { useEffect, useMemo, useRef } from "react";
import { useLebenslauf } from "@/components/LebenslaufContext";
import { useDesignerStore } from "../store/designerStore";
import { mapLebenslaufToSectionParts } from "./mapLebenslaufToSectionParts";
import { flattenSectionsToElements } from "./flatten";
import { useDesignerCvSnapshot } from "../selectors/cvSelectors";

const DBG = (msg: string, ...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
    console.log('[DESIGNER]', msg, ...args);
  } else {
    console.log('[DESIGNER*]', msg, ...args);
  }
};

const PAGE_W = 595;
const PAGE_H = 842;

type Margins = { top: number; right: number; bottom: number; left: number };

function computeFrameForRow(
  col: "left" | "right",
  row: number,
  m: Margins,
  w: number,
  h: number
) {
  const innerW = PAGE_W - m.left - m.right;
  const leftW = Math.round(innerW * 0.62);
  const rightW = innerW - leftW - 8;
  const x = col === "left" ? m.left : m.left + leftW + 8;
  const y = m.top + 100 + row * (h + 24);
  const cw = col === "left" ? leftW : rightW;
  return { x, y, width: Math.min(cw, w), height: h };
}

const sectionKey = (e: SectionElement) => e.meta?.source?.key;

export function useLiveSyncFromGenerator(debounceMs = 200) {
  const ll = useLebenslauf();
  const cvSnapshot = useDesignerCvSnapshot();
  const { setSections, setElements, bump } = useDesignerStore();

  // Signature für Reaktivität
  const sig = useMemo(
    () =>
      JSON.stringify({
        personalData: {
          summary: ll.personalData?.summary,
          skillsSummary: ll.personalData?.skillsSummary,
          softSkillsSummary: ll.personalData?.softSkillsSummary,
          taetigkeitenSummary: ll.personalData?.taetigkeitenSummary,
        },
        experiences: ll.berufserfahrung?.map(exp => ({
          id: exp.id,
          position: exp.position,
          companies: exp.companies,
          startYear: exp.startYear,
          startMonth: exp.startMonth,
          endYear: exp.endYear,
          endMonth: exp.endMonth,
          isCurrent: exp.isCurrent,
          aufgabenbereiche: exp.aufgabenbereiche,
          source: exp.source
        })) || [],
        educations: ll.ausbildung?.map(edu => ({
          id: edu.id,
          abschluss: edu.abschluss,
          institution: edu.institution,
          ausbildungsart: edu.ausbildungsart,
          startYear: edu.startYear,
          startMonth: edu.startMonth,
          endYear: edu.endYear,
          endMonth: edu.endMonth,
          isCurrent: edu.isCurrent,
          source: edu.source
        })) || []
      }),
    [ll.personalData?.summary, ll.personalData?.skillsSummary, ll.personalData?.softSkillsSummary, ll.personalData?.taetigkeitenSummary, ll.berufserfahrung, ll.ausbildung]
  );

  DBG('CTX snapshot:', cvSnapshot);

  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!ll) return;
    if (timer.current) window.clearTimeout(timer.current);

    timer.current = window.setTimeout(() => {
      const mapped = mapLebenslaufToSectionParts(ll);

      const { elements, updatePartText, setInitialElements } =
        useDesignerStore.getState();

      if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
      DBG('useLiveSyncFromGenerator triggered');
      
      const sections = mapLebenslaufToSectionParts(ll);
      const elements = flattenSectionsToElements(sections);
      
      setSections(sections);
      setElements(elements);
      bump();
      
      DBG('Synced to store:', { 
        sections: sections.length, 
        elements: elements.length, 
        firstText: elements.find(e => e.type === 'text')?.text 
      });
    }, debounceMs) as unknown as number;

    return () => { 
      if (timer.current) window.clearTimeout(timer.current); 
    };
  }, [sig, cvSnapshot.__dep__, setSections, setElements, bump, ll]);
}