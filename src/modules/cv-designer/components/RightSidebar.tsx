import React from "react";
import { useDesignerStore } from "../store/designerStore";
import { KiPanel } from "./KiPanel";
import { ExportPanel } from "./ExportPanel";

type Tab = "style" | "ki" | "export";

import { TemplateManager } from './TemplateManager';

export const RightSidebar: React.FC = () => {
  const { tokens, setTokens } = useDesignerStore();
  const [tab, setTab] = React.useState<Tab>("style");

  return (
    <aside className="w-80 border-l border-gray-200 bg-white h-full flex flex-col">
      <div className="flex items-center">
        <button aria-label="Sidebar-Aktion" className={"flex-1 px-3 py-2 text-sm border-b " + (tab==="style"?"font-semibold":"")}
                onClick={()=>setTab("style")}>Style</button>
        <button aria-label="Sidebar-Aktion" className={"flex-1 px-3 py-2 text-sm border-b " + (tab==="ki"?"font-semibold":"")}
                onClick={()=>setTab("ki")}>KI</button>
        <button aria-label="Sidebar-Aktion" className={"flex-1 px-3 py-2 text-sm border-b " + (tab==="export"?"font-semibold":"")}
                onClick={()=>setTab("export")}>Export</button>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        {tab==="style" && (
          <div>
            <h2 className="font-semibold mb-2">Style</h2>
            <label className="block text-sm mb-1">Primärfarbe</label>
            <input
              type="color"
              value={tokens.colorPrimary}
              onChange={(e) => setTokens({ colorPrimary: e.target.value })}
              className="mb-4"
            />

            <label className="block text-sm mb-1">Schriftgröße</label>
            <input
              type="number"
              value={tokens.fontSize}
              onChange={(e) => setTokens({ fontSize: parseInt(e.target.value, 10) })}
              className="border p-1 w-full mb-4"
            />
          </div>
        )}
        {tab==="ki" && <KiPanel />}
        {tab==="export" && <ExportPanel />}
      </div>
    </aside>
  );
};
