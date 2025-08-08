import React, { useState } from "react";
import { useDesignerStore } from "../store/designerStore";
import KiPanel from "./KiPanel";
import ExportPanel from "./ExportPanel";

export default function RightSidebar() {
  const [tab, setTab] = useState<"style" | "ki" | "export">("style");

  const tokens = useDesignerStore((s) => s.tokens);
  const setTokens = useDesignerStore((s) => s.setTokens);
  const margins = useDesignerStore((s) => s.exportMargins);
  const setMargins = useDesignerStore((s) => s.setExportMargins);

  return (
    <div className="w-80 border-l flex flex-col">
      <div className="flex gap-4 p-3 border-b text-sm">
        <button onClick={() => setTab("style")} className={tab === "style" ? "font-semibold" : ""}>Style</button>
        <button onClick={() => setTab("ki")} className={tab === "ki" ? "font-semibold" : ""}>KI</button>
        <button onClick={() => setTab("export")} className={tab === "export" ? "font-semibold" : ""}>Export</button>
      </div>

      {tab === "style" && (
        <div className="p-3 space-y-4">
          <div>
            <div className="text-sm mb-1">Primärfarbe</div>
            <input
              type="color"
              value={tokens.colorPrimary}
              onChange={(e) => setTokens({ colorPrimary: e.target.value })}
            />
          </div>

          <div>
            <div className="text-sm mb-1">Schriftgröße</div>
            <input
              type="number"
              className="input"
              min={8}
              max={48}
              value={tokens.fontSize}
              onChange={(e) => setTokens({ fontSize: Number(e.target.value) })}
            />
          </div>

          <div>
            <div className="text-sm mb-1">Seitenränder (px)</div>
            <div className="grid grid-cols-2 gap-2">
              <input className="input" value={margins.top} onChange={(e) => setMargins({ top: Number(e.target.value) })} />
              <input className="input" value={margins.right} onChange={(e) => setMargins({ right: Number(e.target.value) })} />
              <input className="input" value={margins.bottom} onChange={(e) => setMargins({ bottom: Number(e.target.value) })} />
              <input className="input" value={margins.left} onChange={(e) => setMargins({ left: Number(e.target.value) })} />
            </div>
          </div>
        </div>
      )}

      {tab === "ki" && <KiPanel />}

      {tab === "export" && <ExportPanel />}
    </div>
  );
}
