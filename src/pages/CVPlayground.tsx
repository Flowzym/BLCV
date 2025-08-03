/**
 * CV Playground – Integration der Headless Preview
 * Holt Daten aus LebenslaufContext, mappt sie mit Adapter und zeigt sie in der CVPreview
 */

import React, { useContext } from "react";
import { LebenslaufContext } from "@/components/LebenslaufContext"; 
import { CVPreview } from "@/modules/cv-designer/components/CVPreview";
import { mapBetterLetterToDesigner } from "@/modules/cv-designer/services/mapBetterLetterToDesigner";

const CVPlayground: React.FC = () => {
  // BetterLetter Lebenslauf-Daten aus Context holen
  const {
    personalData,
    berufserfahrung,
    ausbildung,
    skills,
    softskills,
  } = useContext(LebenslaufContext);

  // Adapter wandelt Daten -> LayoutElement[]
  const sections = mapBetterLetterToDesigner({
    personalData,
    berufserfahrung,
    ausbildung,
    skills,
    softskills,
  });

  return (
    <div className="flex w-full h-full">
      {/* Sidebar links, wenn vorhanden */}
      <div className="w-1/4 border-r p-4">
        <h3 className="font-bold mb-2">Playground Steuerung</h3>
        <p className="text-sm text-gray-600">
          Hier können später Settings, Templates, StyleEditor etc. ergänzt werden.
        </p>
      </div>

      {/* Hauptbereich mit Vorschau */}
      <div className="flex-1 p-6 overflow-auto">
        <CVPreview sections={sections} />
      </div>
    </div>
  );
};

export default CVPlayground;
