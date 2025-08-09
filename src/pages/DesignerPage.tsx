// src/pages/DesignerPage.tsx
import React, { useEffect, useRef } from "react";
import DesignerShell from "@/modules/cv-designer/components/DesignerShell";
import { useDesignerStore } from "@/modules/cv-designer/store/designerStore";
import {
  buildSingleErfahrungSection,
  splitSectionByPage,
} from "@/modules/cv-designer/services/mapLebenslaufToSections";

// Aus deinem Repo:
import { useLebenslauf } from "@/components/LebenslaufContext";

const A4_HEIGHT = 842; // px @72dpi

export default function DesignerPage() {
  const { elements, setInitialElementsFromSections } = useDesignerStore((s) => ({
    elements: s.elements,
    setInitialElementsFromSections: s.setInitialElementsFromSections,
  }));

  // ⚠️ robust: Tokens und Margins kommen aus dem Store (kein exportMargins)
  const fontSize = useDesignerStore((s) => s.tokens?.fontSize ?? 11);
  const lineHeight = useDesignerStore((s) => s.tokens?.lineHeight ?? 1.4);
  const margins = useDesignerStore((s) => s.margins);

  const lebenslauf = typeof useLebenslauf === "function" ? useLebenslauf() : undefined;
  const importedOnce = useRef(false);

  // Initial-Import: Nur wenn leer (kein Auto-Overwrite)
  useEffect(() => {
    if (importedOnce.current) return;
    if (!lebenslauf) return;
    if (elements.length > 0) return;

    // 1) Eine große "Erfahrung"-Section bauen (heuristisch)
    const base = buildSingleErfahrungSection(lebenslauf);
    if (!base.length) return;

    // 2) Heuristischer Seiten-Split (A4, Ränder, Font)
    const split = base.flatMap((sec) =>
      splitSectionByPage(sec, fontSize, A4_HEIGHT, { top: margins.top, bottom: margins.bottom }, lineHeight)
    );

    // 3) In den Designer übernehmen (nur initial)
    setInitialElementsFromSections(split.map((s) => ({ title: s.title, content: s.content })));
    importedOnce.current = true;
  }, [lebenslauf, elements.length, fontSize, lineHeight, margins.top, margins.bottom, setInitialElementsFromSections]);

  return (
    <main className="h-full">
      <DesignerShell />
    </main>
  );
}
