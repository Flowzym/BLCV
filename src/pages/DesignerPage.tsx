// src/pages/DesignerPage.tsx
import React, { useEffect, useRef } from "react";
import DesignerShell from "@/modules/cv-designer/components/DesignerShell";
import { useDesignerStore } from "@/modules/cv-designer/store/designerStore";
import { buildSectionsFromLebenslauf, splitSectionByPage } from "@/modules/cv-designer/services/mapLebenslaufToSections";
import { useLebenslauf } from "@/components/LebenslaufContext";

const A4_HEIGHT = 842; // @72dpi

export default function DesignerPage() {
  const { elements, setInitialElementsFromSections } = useDesignerStore((s) => ({
    elements: s.elements,
    setInitialElementsFromSections: s.setInitialElementsFromSections,
  }));
  // Tokens/Margins (für Split-Heuristik)
  const fontSize = useDesignerStore((s) => (s as any).tokens?.fontSize ?? 11);
  const lineHeight = useDesignerStore((s) => (s as any).tokens?.lineHeight ?? 1.4);
  const margins: any = useDesignerStore((s) => (s as any).margins ?? (s as any).exportMargins ?? { top: 36, bottom: 36 });

  const ll = useLebenslauf(); // liefert { personalData, berufserfahrung, ausbildung, … }
  const importedOnce = useRef(false);

  // erkennt „Platzhalter“-Layouts (eine leere Default-Section etc.)
  function isOnlyPlaceholder(list: any[]): boolean {
    if (!Array.isArray(list) || list.length === 0) return true;
    if (list.length > 2) return false; // schon echtes Layout
    const t = (txt: any) => (typeof txt === "string" ? txt : "");
    const texts = list
      .filter((e) => e?.kind === "section")
      .map((e) => t((e as any).content ?? (e as any).text ?? ""))
      .join("\n")
      .toLowerCase();
    return /neue section|doppelklicken|• punkt 1/.test(texts);
  }

  useEffect(() => {
    if (importedOnce.current) return;
    if (!ll) return;

    // nur importieren, wenn leer ODER nur Platzhalter
    if (!(elements.length === 0 || isOnlyPlaceholder(elements))) return;

    const base = buildSectionsFromLebenslauf(ll);
    if (!base.length) return;

    const split = base.flatMap((sec) =>
      splitSectionByPage(sec, fontSize, A4_HEIGHT, { top: margins.top ?? 36, bottom: margins.bottom ?? 36 }, lineHeight)
    );

    setInitialElementsFromSections(split);
    importedOnce.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ll, elements.length]);

  return (
    <main className="h-full">
      <DesignerShell />
    </main>
  );
}
