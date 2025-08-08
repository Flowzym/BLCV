import React, { useEffect } from "react";
import DesignerShell from "@/modules/cv-designer/components/DesignerShell";
import { useDesignerStore } from "@/modules/cv-designer/store/designerStore";
// optional: wenn dein Lebenslauf-Kontext bereits Daten liefert
// import { useLebenslauf } from "@/components/LebenslaufContext";

export default function DesignerPage() {
  // Wenn du schon Lebenslauf-Sections hast, hier synchronisieren:
  // const lebenslauf = useLebenslauf(); // Form ist bei dir evtl. anders
  const setInitial = useDesignerStore((s) => s.setInitialElementsFromSections);

  useEffect(() => {
    // Beispiel: falls du sections hast → beim ersten Laden übernehmen
    // const sections = lebenslauf?.sections || lebenslauf?.cvSections || [];
    const sections: Array<{ title?: string; content?: string }> = [];
    if (sections.length) setInitial(sections);
  }, [setInitial]);

  return (
    <main className="h-full">
      <DesignerShell />
    </main>
  );
}
