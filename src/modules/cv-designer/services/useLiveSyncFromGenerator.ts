// src/modules/cv-designer/services/useLiveSyncFromGenerator.ts
import { useEffect, useMemo, useRef } from "react";
import { useLebenslauf } from "@/components/LebenslaufContext";
import { useDesignerStore, PartKey, SectionElement } from "../store/designerStore";
import { mapLebenslaufToSectionParts } from "./mapLebenslaufToSectionParts";
import { Templates, buildSectionFromTemplate } from "../templates";
import { useDesignerCvSnapshot } from "../selectors/cvSelectors";

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
  const margins = useDesignerStore((s) => s.margins);
  const cvSnapshot = useDesignerCvSnapshot();
  // Hinweis: wir blockieren NICHT mehr hart auf "hydrated",
  // sondern retriggern zusätzlich nach Persist-Hydration.
  const hydratedState = useDesignerStore((s) => (s as any).hydrated);

  // Nach Persist-Hydration einmal nachtriggern (Zustand v4 API)
  useEffect(() => {
    const api: any = useDesignerStore as any;
    const persisted = api?.persist;
    const reRun = () => {
      try {
        const m = useDesignerStore.getState().margins;
        // no-op Set → löst Effekt erneut aus, ohne Werte zu ändern
        useDesignerStore.setState({ margins: { ...m } });
      } catch {}
    };
    if (persisted?.onFinishHydration) {
      const unsub = persisted.onFinishHydration(reRun);
      return () => unsub?.();
    }
  }, []);

  // alles, was die Layout-/Text-Sync-Reaktion beeinflusst, in die Signatur
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

  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!ll) return;
    if (timer.current) window.clearTimeout(timer.current);

    timer.current = window.setTimeout(() => {
      const mapped = mapLebenslaufToSectionParts(ll);

      const { elements, updatePartText, setInitialElements } =
        useDesignerStore.getState();

      if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
        console.debug("[useLiveSyncFromGenerator] Processing:", {
          mappedSections: mapped.length,
          currentElements: elements.length,
          mapped: mapped.map(m => ({
            group: m.group,
            sourceKey: m.sourceKey,
            title: m.title,
            partsCount: m.parts.length,
            firstPartText: m.parts[0]?.text?.substring(0, 30) + '...'
          }))
        });
      }

      // vorhandene Sections nach sourceKey indizieren
      const existing = new Map<string, SectionElement>();
      for (const e of elements) {
        if (e.kind !== "section") continue;
        const k = sectionKey(e);
        if (k) existing.set(k, e);
      }

      type Job = {
        tpl: (typeof Templates)[keyof typeof Templates];
        frame: { x: number; y: number; width: number; height: number };
        texts: Partial<Record<PartKey, string>>;
        meta: SectionElement["meta"];
        title?: string;
      };

      const adds: Job[] = [];
      let exp = 0, edu = 0, contactPlaced = false;

      for (const m of mapped) {
        const texts = Object.fromEntries(
          m.parts.map((p) => [p.key, p.text ?? ""])
        ) as Partial<Record<PartKey, string>>;
        const prev = existing.get(m.sourceKey);

        if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
          console.debug(`[useLiveSyncFromGenerator] Processing section ${m.sourceKey}:`, {
            group: m.group,
            title: m.title,
            texts,
            hasExisting: !!prev
          });
        }

        if (!prev) {
          if (m.group === "kontakt" && !contactPlaced) {
            const tpl = Templates.contactRight;
            adds.push({
              tpl,
              frame: computeFrameForRow("right", 0, margins, tpl.baseSize.width, tpl.baseSize.height),
              texts,
              meta: { source: { key: m.sourceKey, group: m.group, template: tpl.id } },
              title: m.title,
            });
            contactPlaced = true;
            continue;
          }
          if (m.group === "erfahrung") {
            const tpl = Templates.experienceLeft;
            adds.push({
              tpl,
              frame: computeFrameForRow("left", exp++, margins, tpl.baseSize.width, tpl.baseSize.height),
              texts,
              meta: { source: { key: m.sourceKey, group: m.group, template: tpl.id } },
              title: m.title,
            });
            if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
              console.debug(`[useLiveSyncFromGenerator] Adding experience section:`, {
                sourceKey: m.sourceKey,
                texts,
                frame: computeFrameForRow("left", exp-1, margins, tpl.baseSize.width, tpl.baseSize.height)
              });
            }
            continue;
          }
          if (m.group === "ausbildung") {
            const tpl = Templates.educationLeft;
            adds.push({
              tpl,
              frame: computeFrameForRow("left", edu++, margins, tpl.baseSize.width, tpl.baseSize.height),
              texts,
              meta: { source: { key: m.sourceKey, group: m.group, template: tpl.id } },
              title: m.title,
            });
            if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
              console.debug(`[useLiveSyncFromGenerator] Adding education section:`, {
                sourceKey: m.sourceKey,
                texts,
                frame: computeFrameForRow("left", edu-1, margins, tpl.baseSize.width, tpl.baseSize.height)
              });
            }
            continue;
          }
          // ProfileInput sections (summary, skills, etc.)
          if (m.group === "profil" || m.group === "kenntnisse" || m.group === "softskills") {
            const tpl = Templates.contactRight; // Reuse contact template for now
            adds.push({
              tpl,
              frame: computeFrameForRow("right", contactPlaced ? 1 : 0, margins, tpl.baseSize.width, tpl.baseSize.height),
              texts,
              meta: { source: { key: m.sourceKey, group: m.group, template: tpl.id } },
              title: m.title,
            });
            if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
              console.debug(`[useLiveSyncFromGenerator] Adding profile section:`, {
                sourceKey: m.sourceKey,
                group: m.group,
                texts
              });
            }
            continue;
          }
          continue;
        }

        // Updates: nur Text aktualisieren, wenn sich etwas geändert hat & nicht gelocked
        for (const p of m.parts) {
          const local = prev.parts.find((x) => x.key === p.key);
          if (!local || local.lockText) continue;
          const incoming = p.text ?? "";
          if ((local.text ?? "") !== incoming) {
            if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
              console.debug(`[useLiveSyncFromGenerator] Updating part text:`, {
                sectionId: prev.id,
                partKey: p.key,
                oldText: local.text?.substring(0, 30) + '...',
                newText: incoming.substring(0, 30) + '...'
              });
            }
            updatePartText(prev.id, p.key, incoming);
          }
        }
      }

      // neue Sections bauen & einsetzen
      if (adds.length) {
        const newSecs = adds.map((a) =>
          buildSectionFromTemplate(a.tpl, a.frame, a.texts, a.meta, a.title)
        );

        if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
          console.debug("[useLiveSyncFromGenerator] Adding new sections to store:", {
            currentCount: elements.length,
            newSectionsCount: newSecs.length,
            totalAfter: elements.length + newSecs.length,
            newSections: newSecs.map(s => ({
              id: s.id,
              group: s.group,
              sourceKey: s.meta?.source?.key,
              partsCount: s.parts.length,
              firstPartText: s.parts[0]?.text?.substring(0, 30) + '...'
            }))
          });
        }

        if (!elements.length) {
          setInitialElements(newSecs);
        } else {
          setInitialElements([...elements, ...newSecs]);
        }
      }
    }, debounceMs) as unknown as number;

    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [sig, hydratedState, cvSnapshot.__dep__]);
}