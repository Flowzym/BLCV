// src/pages/DesignerPage.tsx
import React, { useEffect, useRef } from "react";
import DesignerShell from "@/modules/cv-designer/components/DesignerShell";
import { useDesignerStore } from "@/modules/cv-designer/store/designerStore";
import { buildSectionsFromLebenslauf, splitSectionByPage } from "@/modules/cv-designer/services/mapLebenslaufToSections";
import { useLebenslauf } from "@/components/LebenslaufContext";

const A4_HEIGHT = 842; // @72dpi

export default function DesignerPage() {
  const {
    elements,
    setInitialElementsFromSections,
    appendSectionsAtEnd,
  } = useDesignerStore((s) => ({
    elements: s.elements,
    setInitialElementsFromSections: s.setInitialElementsFromSections,
    appendSectionsAtEnd: s.appendSectionsAtEnd,
  }));

  const fontSize = useDesignerStore((s) => s.tokens?.fontSize ?? 11);
  const lineHeight = useDesignerStore((s) => s.tokens?.lineHeight ?? 1.4);
  const margins = useDesignerStore((s) => s.margins);

  const ll = useLebenslauf();
  const importedOnce = useRef(false);

  function isOnlyPlaceholder(list: any[]): boolean {
    if (!Array.isArray(list) || list.length === 0) return true;
    if (list.length > 2) return false;
    const texts = list
      .filter((e) => e?.kind === "section")
      .map((e) => (typeof (e as any).text === "string" ? (e as any).text : ""))
      .join("\n")
      .toLowerCase();
    return /neue section|doppelklicken|• punkt 1/.test(texts);
  }

  function extractExistingTitles(list: any[]): string[] {
    return list
      .filter((e) => e?.kind === "section")
      .map((e) => {
        const t = (e as any).text || "";
        const first = String(t).split("\n")[0] || "";
        return first.trim();
      })
      .filter(Boolean);
  }

  useEffect(() => {
    if (importedOnce.current) return;
    if (!ll) return;

    const base = buildSectionsFromLebenslauf(ll);
    if (!base.length) return;

    const split = base.flatMap((sec) =>
      splitSectionByPage(sec, fontSize, A4_HEIGHT, { top: margins.top, bottom: margins.bottom }, lineHeight)
    );

    // a) leer oder placeholder → initial platzieren
    if (elements.length === 0 || isOnlyPlaceholder(elements)) {
      console.debug("[Designer Import] initial:", base.map((s) => s.title));
      setInitialElementsFromSections(split);
      importedOnce.current = true;
      return;
    }

    // b) schon was da → fehlende Titel anhängen
    const haveTitles = new Set(extractExistingTitles(elements).map((t) => t.toLowerCase()));
    const missing = split.filter((s) => !haveTitles.has((s.title || "").toLowerCase()));
    if (missing.length) {
      console.debug("[Designer Import] append:", missing.map((s) => s.title));
      appendSectionsAtEnd(missing);
      importedOnce.current = true;
      return;
    }

    importedOnce.current = true;
  }, [ll, elements.length, fontSize, lineHeight, margins.top, margins.bottom, setInitialElementsFromSections, appendSectionsAtEnd]);

  return (
    <main className="h-full">
      <DesignerShell />
    </main>
  );
}
