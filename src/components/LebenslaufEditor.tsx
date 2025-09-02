import React, { useRef, useState } from "react";
import { ProfileSourceMapping } from "../services/supabaseService";
import LebenslaufInput from "./LebenslaufInput";
import LebenslaufPreview from "./LebenslaufPreview";
import AiHelpPanel from "./AiHelpPanel";
import { User, Briefcase, GraduationCap, LayoutGrid, Lightbulb } from 'lucide-react';
import { useLebenslauf } from "@/components/LebenslaufContext"; // ✅ Alias
import { cvToMarkdown, downloadText } from "@/lib/cvExport";

const mainTabs = [
  { id: 'personal', label: 'Persönliche Daten', icon: User },
  { id: 'experience', label: 'Berufserfahrung', icon: Briefcase },
  { id: 'education', label: 'Ausbildung', icon: GraduationCap },
  { id: 'skills', label: 'Fachkompetenzen', icon: LayoutGrid },
  { id: 'softskills', label: 'Softskills', icon: Lightbulb }
];

function LebenslaufEditorContent({
  profileSourceMappings = [],
}: { profileSourceMappings?: ProfileSourceMapping[]; }) {
  const inputRef = useRef<HTMLDivElement>(null);
  const { activeTab, setActiveTabWithSync, autosaveEnabled, setAutosaveEnabled, saveSnapshot, loadSnapshot, personalData, berufserfahrung, ausbildung } = useLebenslauf();
  const [snapMsg, setSnapMsg] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col gap-6 relative overflow-hidden">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 p-4 border-b border-gray-200">
          <User className="h-6 w-6 mr-2" style={{ color: '#F29400' }} stroke="#F29400" fill="none" />
          <h2 className="text-lg font-semibold text-gray-900">Lebenslauf</h2>
        </div>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-4">
            {mainTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabWithSync(tab.id as any)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4"><IconComponent className="w-4 h-4" /></div>
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center justify-end gap-2 p-3">
          {snapMsg && <span className="text-xs text-gray-600">{snapMsg}</span>}
          <button className="px-2 py-1 text-sm border rounded" onClick={() => { const ok = loadSnapshot(); setSnapMsg(ok ? "Entwurf geladen" : "Kein Entwurf gefunden"); setTimeout(() => setSnapMsg(null), 2000); }}>Entwurf laden</button>
          <button className="px-2 py-1 text-sm border rounded" onClick={() => { const ok = saveSnapshot(); setSnapMsg(ok ? "Entwurf gespeichert" : "Fehler beim Speichern"); setTimeout(() => setSnapMsg(null), 2000); }}>Entwurf speichern</button>
          <label className="ml-2 flex items-center gap-1 text-sm">
            <input type="checkbox" checked={autosaveEnabled} onChange={e => setAutosaveEnabled(e.target.checked)} />
            Autosave
          </label>
          <button className="px-2 py-1 text-sm border rounded" onClick={() => {
            const text = cvToMarkdown({ personalData, berufserfahrung, ausbildung });
            const name = [personalData?.vorname, personalData?.nachname].filter(Boolean).join(' ') || 'Lebenslauf';
            downloadText(`${name}.md`, text);
          }}>Export .md</button>
          <button className="px-2 py-1 text-sm border rounded" onClick={() => window.print()}>Export PDF</button>
          <button className="px-2 py-1 text-sm border rounded" onClick={() => {
            const snapshot = { version: 2, savedAt: new Date().toISOString(), personalData, berufserfahrung, ausbildung };
            const name = [personalData?.vorname, personalData?.nachname].filter(Boolean).join(' ') || 'Lebenslauf';
            downloadText(`${name}.json`, JSON.stringify(snapshot, null, 2));
          }}>Export .json</button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1fr] gap-6 relative overflow-hidden">
        <div ref={inputRef} className="relative min-w-0">
          <LebenslaufInput />
        </div>
        <div className="min-w-0">
          <LebenslaufPreview inputRef={inputRef} />
        </div>
        <div className="min-w-0">
          <AiHelpPanel />
        </div>
      </div>
    </div>
  );
}

export default function LebenslaufEditor({ profileSourceMappings = [] }: { profileSourceMappings?: ProfileSourceMapping[]; }) {
  return <LebenslaufEditorContent profileSourceMappings={profileSourceMappings} />;
}
