import React from "react";
import { LebenslaufProvider } from "./LebenslaufContext";
import { ProfileSourceMapping } from "../services/supabaseService";
import LebenslaufInput from "./LebenslaufInput";
import LebenslaufPreview from "./LebenslaufPreview";
import AiHelpPanel from "./AiHelpPanel";
import { User } from 'lucide-react';

export default function LebenslaufEditor({
  profileSourceMappings = [],
}: {
  profileSourceMappings?: ProfileSourceMapping[];
}) {
  return (
    <LebenslaufProvider>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1fr] gap-6 relative">
        {/* Linke Spalte: Eingabe */}
        <div className="relative">
          <LebenslaufInput />
        </div>

        {/* Rechte Spalte: Vorschau */}
        <div>
          <LebenslaufPreview />
        </div>

        {/* Rechte Spalte: KI-Assistent */}
        <div>
          <AiHelpPanel />
        </div>
      </div>
    </LebenslaufProvider>
  );
}
