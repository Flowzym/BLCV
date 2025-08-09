import { useEffect, useMemo, useRef } from "react";
import { useLebenslauf } from "@/components/LebenslaufContext";
import { useDesignerStore, GroupKey, PartKey, SectionElement } from "../store/designerStore";
import { mapLebenslaufToSectionParts, MappedSection } from "./mapLebenslaufToSectionParts";
import { Templates, buildSectionFromTemplate } from "../templates/sectionTemplates";

const PAGE_W = 595;
const PAGE_H = 842;

type Margins = { top: number; right: number; bottom: number; left: number };

function computeFrameForRow(col: "left" | "right", rowIndex: number, margins: Margins, width: number, height: number) {
  const innerW = PAGE_W - margins.left - margins.right;
  const leftW = Math.round(innerW * 0.62);
  const rightW = innerW - leftW - 8;
  const x = col === "left" ? margins.left : margins.left + leftW + 8;
  const y = margins.top + 100 + rowIndex * (height + 24);
  const w = col === "left" ? leftW : rightW;
  return { x, y, width: Math.min(w, width), height };
}

function sectionKey(e: SectionElement): string | undefined {
  return e.meta?.source?.key;
}

export function useLiveSyncFromGenerator(debounceMs = 200) {
  const ll = useLebenslauf();

  const elements = useDesignerStore((s) => s.elements);
  const margins = useDesignerStore((s) => s.margins);

  const setInitial = useDesignerStore((s) => s.setInitialElements);
  const addFromTpl = useDesignerStore((s) => s.addSectionFromTemplate);
  const updatePartText = useDesignerStore((s) => s.updatePartText);

  const timer = useRef<number | null>(null);
  const depsHash = useMemo(() => JSON.stringify({ ll, margins }), [ll, margins]);

  useEffect(() => {
    if (!ll) return;

    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const mapped = mapLebenslaufToSectionParts(ll); // Array<MappedSection>

      // Index vorhandener Sektionen per source.key
      const existingByKey = new Map<string, SectionElement>();
      for (const e of elements) {
        if (e.kind !== "section") continue;
        const k = sectionKey(e);
        if (k) existingByKey.set(k, e);
      }

      const nextAdds: Array<SectionElement> = [];
      let expRow = 0;
      let eduRow = 0;
      let contactPlaced = false;

      for (const m of mapped) {
        const prev = m.sourceKey ? existingByKey.get(m.sourceKey) : undefined;

        if (!prev) {
          // Neu anlegen aus Templates
          if (m.group === "kontakt" && !contactPlaced) {
            const tpl = Templates.contactRight;
            const frame = { ...computeFrameForRow("right", 0, margins, tpl.baseSize.width, tpl.baseSize.height) };
            const texts: Partial<Record<PartKey, string>> = Object.fromEntries(m.parts.map((p) => [p.key, p.text]));
            const meta = { source: { key: m.sourceKey, group: m.group, template: tpl.id } };
            const sec = buildSectionFromTemplate(tpl, frame, texts, meta, m.title);
            nextAdds.push(sec);
            contactPlaced = true;
            continue;
          }

          if (m.group === "erfahrung") {
            const tpl = Templates.experienceLeft;
            const frame = computeFrameForRow("left", expRow++, margins, tpl.baseSize.width, tpl.baseSize.height);
            const texts: Partial<Record<PartKey, string>> = Object.fromEntries(m.parts.map((p) => [p.key, p.text]));
            const meta = { source: { key: m.sourceKey, group: m.group, template: tpl.id } };
            const sec = buildSectionFromTemplate(tpl, frame, texts, meta, m.title);
            nextAdds.push(sec);
            continue;
          }

          if (m.group === "ausbildung") {
            const tpl = Templates.educationLeft;
            const frame = computeFrameForRow("left", eduRow++, margins, tpl.baseSize.width, tpl.baseSize.height);
            const texts: Partial<Record<PartKey, string>> = Object.fromEntries(m.parts.map((p) => [p.key, p.text]));
            const meta = { source: { key: m.sourceKey, group: m.group, template: tpl.id } };
            const sec = buildSectionFromTemplate(tpl, frame, texts, meta, m.title);
            nextAdds.push(sec);
            continue;
          }

          // Fallback: ignoriere unbekannte Gruppen
          continue;
        }

        // Vorhanden → nur Parts updaten, die nicht gelockt sind
        for (const p of m.parts) {
          const local = prev.parts.find((x) => x.key === p.key);
          if (!local || local.lockText) continue;
          updatePartText(prev.id, p.key, p.text);
        }
      }

      // Erstinitialisierung in einem Rutsch
      if (!elements.length && nextAdds.length) {
        setInitial(nextAdds);
      } else {
        for (const sec of nextAdds) {
          addFromTpl({
            group: sec.group,
            frame: sec.frame,
            parts: sec.parts,
            meta: sec.meta,
            title: sec.title,
          });
        }
      }
    }, debounceMs) as unknown as number;

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsHash, elements.length]);
}
