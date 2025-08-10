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
      if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
        console.debug("[DesignerSync] ctx snapshot", {
          personalData: cvSnapshot.personalData,
          experiences: cvSnapshot.experiences?.length || 0,
          educations: cvSnapshot.educations?.length || 0
        });
        console.debug("[DesignerSync] mapped", mapped.map(m => ({
          group: m.group,
          sourceKey: m.sourceKey,
          partsCount: m.parts.length
        })));
      }

      const { elements, updatePartText, setInitialElements } =
        useDesignerStore.getState();

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
          console.debug("[DesignerSync] store elements", {
            currentCount: elements.length,
            newSectionsCount: newSecs.length,
            totalAfter: elements.length + newSecs.length
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