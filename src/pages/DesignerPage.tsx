// src/pages/DesignerPage.tsx
import React, { useEffect, useRef } from "react";
import DesignerShell from "@/modules/cv-designer/components/DesignerShell";
import { useDesignerStore } from "@/modules/cv-designer/store/designerStore";
import {
  buildSectionsFromLebenslauf,
  splitSectionByPage,
} from "@/modules/cv-designer/services/mapLebenslaufToSections";
import { useLebenslauf } from "@/components/LebenslaufContext";

const A4_HEIGHT = 842; // px @72dpi

export default function DesignerPage() {
  const { elements, setInitialElementsFromSections } = useDesignerStore((s) => ({
    elements: s.elements,
    setInitialElementsFromSections: s.setInitialElementsFromSections,
  }));

  const fontSize = useDesignerStore((s) => s.tokens?.fontSize ?? 11);
  const lineHeight = useDesignerStore((s) => s.tokens?.lineHeight ?? 1.4);
  const margins = useDesignerStore((s) => s.margins);

  const lebenslauf = typeof useLebenslauf === "function" ? useLebenslauf() : undefined;
  const importedOnce = useRef(false);

  useEffect(() => {
    if (importedOnce.current) return;
    if (!lebenslauf) return;
    if (elements.length > 0) return;

    // 1) Alle sinnvollen Abschnitte aus dem Generator holen
    const baseSections = buildSectionsFromLebenslauf(lebenslauf);
    if (!baseSections.length) return;

    // 2) Optional: Seiten-Splitting pro Abschnitt
    const split = baseSections.flatMap((sec) =>
      splitSectionByPage(sec, fontSize, A4_HEIGHT, { top: margins.top, bottom: margins.bottom }, lineHeight)
    );

    // 3) Initial in den Designer (ohne bestehendes Layout zu überschreiben)
    setInitialElementsFromSections(split);

    importedOnce.current = true;
  }, [lebenslauf, elements.length, fontSize, lineHeight, margins.top, margins.bottom, setInitialElementsFromSections]);

  return (
    <main className="h-full">
      <DesignerShell />
    </main>
  );
}
