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
      <div className="w-full grid grid-cols-1 lg:grid-cols-[2fr_2fr_1fr] gap-6 relative overflow-hidden">
        {/* Linke Spalte: Eingabe */}
        <div className="relative min-w-0">
          <LebenslaufInput />
        </div>

        {/* Rechte Spalte: Vorschau */}
        <div className="min-w-0">
          <LebenslaufPreview />
        </div>

        {/* Rechte Spalte: KI-Assistent */}
        <div className="min-w-0">
          <AiHelpPanel />
        </div>
      </div>
    </LebenslaufProvider>
  );
}
