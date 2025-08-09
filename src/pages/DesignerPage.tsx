import React, { useEffect, useRef } from "react";
import DesignerShell from "@/modules/cv-designer/components/DesignerShell";
import { useDesignerStore } from "@/modules/cv-designer/store/designerStore";
import { buildSectionsFromLebenslauf, splitSectionByPage } from "@/modules/cv-designer/services/mapLebenslaufToSections";
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

  // Platzhalter-Erkennung
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

  useEffect(() => {
    if (importedOnce.current) return;
    if (!lebenslauf) return;
    if (!(elements.length === 0 || isOnlyPlaceholder(elements))) return;

    const base = buildSectionsFromLebenslauf(lebenslauf);
    if (!base.length) return;

    const split = base.flatMap((sec) =>
      splitSectionByPage(sec, fontSize, A4_HEIGHT, { top: margins.top, bottom: margins.bottom }, lineHeight)
    );

    // Debug hilft beim Verifizieren
    console.debug("[Designer Import] sections:", base.map((s) => s.title), "→ after split:", split.length);

    setInitialElementsFromSections(split);
    importedOnce.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lebenslauf, elements.length]);

  return (
    <main className="h-full">
      <DesignerShell />
    </main>
  );
}
