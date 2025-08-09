// src/pages/DesignerPage.tsx
import React, { useEffect, useRef } from "react";
import DesignerShell from "@/modules/cv-designer/components/DesignerShell";
import { useDesignerStore } from "@/modules/cv-designer/store/designerStore";
import { buildSingleErfahrungSection, splitSectionByPage } from "@/modules/cv-designer/services/mapLebenslaufToSections";

// ⬇️ Der Hook kommt aus deinem Repo.
// Falls der Export bei dir anders heißt, bitte den Import-Namen hier anpassen.
import { useLebenslauf } from "@/components/LebenslaufContext";

const A4_HEIGHT = 842; // px @72dpi (wir rendern Canvas in 72dpi-Koordinaten)

export default function DesignerPage() {
  const { elements, setInitialElementsFromSections } = useDesignerStore((s) => ({
    elements: s.elements,
    setInitialElementsFromSections: s.setInitialElementsFromSections,
  }));
  const fontSize = useDesignerStore((s) => s.tokens.fontSize);
  const margins = useDesignerStore((s) => s.exportMargins);

  const lebenslauf = useLebenslauf?.(); // defensiv
  const importedOnce = useRef(false);

  // Initial-Import: Nur wenn der Canvas leer ist (kein Überschreiben!)
  useEffect(() => {
    if (importedOnce.current) return;
    if (!lebenslauf) return;
    if (elements.length > 0) return;

    // 1) Eine große "Erfahrung"-Section bauen
    const base = buildSingleErfahrungSection(lebenslauf);
    if (!base.length) return;

    // 2) In seitenverträgliche Chunks splitten (heuristisch)
    const split = base.flatMap(sec =>
      splitSectionByPage(sec, fontSize || 12, A4_HEIGHT, { top: margins.top, bottom: margins.bottom })
    );

    // 3) In den Designer übernehmen (nur initial)
    setInitialElementsFromSections(
      split.map(s => ({ title: s.title, content: s.content }))
    );

    importedOnce.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lebenslauf, elements.length]);

  return (
    <main className="h-full">
      <DesignerShell />
    </main>
  );
}
