// src/modules/cv-designer/components/RightSidebar.tsx
import React, { useState } from "react";
import { useDesignerStore } from "../store/designerStore";
import KiPanel from "./KiPanel";
import ExportPanel from "./ExportPanel";

type Tab = "style" | "ki" | "export";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-sm font-semibold text-gray-700">{title}</div>
      {children}
    </div>
  );
}

export default function RightSidebar() {
  const [tab, setTab] = useState<Tab>("style");

  const tokens = useDesignerStore((s) => s.tokens);
  const setTokens = useDesignerStore((s) => s.setTokens);
  const margins = useDesignerStore((s) => s.exportMargins);
  const setMargins = useDesignerStore((s) => s.setExportMargins);

  return (
    <aside className="w-[300px] shrink-0 border-l border-gray-200 p-4">
      <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-2 text-sm">
        <button
          className={tab === "style" ? "font-medium text-blue-700" : "text-gray-600 hover:text-gray-800"}
          onClick={() => setTab("style")}
        >
          Style
        </button>
        <button
          className={tab === "ki" ? "font-medium text-blue-700" : "text-gray-600 hover:text-gray-800"}
          onClick={() => setTab("ki")}
        >
          KI
        </button>
        <button
          className={tab === "export" ? "font-medium text-blue-700" : "text-gray-600 hover:text-gray-800"}
          onClick={() => setTab("export")}
        >
          Export
        </button>
      </div>

      {tab === "style" && (
        <div>
          <Section title="Style">
            <label className="mb-2 block text-xs text-gray-600">Primärfarbe</label>
            <input
              type="color"
              value={tokens.colorPrimary}
              onChange={(e) => setTokens({ colorPrimary: e.target.value })}
              className="h-8 w-16 rounded border border-gray-300"
            />

            <label className="mt-4 mb-2 block text-xs text-gray-600">Schriftgröße</label>
            <input
              type="number"
              min={8}
              max={32}
              value={tokens.fontSize}
              onChange={(e) => setTokens({ fontSize: Number(e.target.value) || 12 })}
              className="w-full rounded border border-gray-300 px-2 py-1"
            />

            <label className="mt-4 mb-2 block text-xs text-gray-600">Seitenränder (px)</label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <input
                type="number"
                value={Math.round(margins.top)}
                onChange={(e) => setMargins({ top: Number(e.target.value) || 0 })}
                className="rounded border border-gray-300 px-2 py-1"
                placeholder="oben"
                aria-label="Rand oben"
              />
              <input
                type="number"
                value={Math.round(margins.right)}
                onChange={(e) => setMargins({ right: Number(e.target.value) || 0 })}
                className="rounded border border-gray-300 px-2 py-1"
                placeholder="rechts"
                aria-label="Rand rechts"
              />
              <input
                type="number"
                value={Math.round(margins.bottom)}
                onChange={(e) => setMargins({ bottom: Number(e.target.value) || 0 })}
                className="rounded border border-gray-300 px-2 py-1"
                placeholder="unten"
                aria-label="Rand unten"
              />
              <input
                type="number"
                value={Math.round(margins.left)}
                onChange={(e) => setMargins({ left: Number(e.target.value) || 0 })}
                className="rounded border border-gray-300 px-2 py-1"
                placeholder="links"
                aria-label="Rand links"
              />
            </div>
          </Section>
        </div>
      )}

      {tab === "ki" && <KiPanel />}
      {tab === "export" && <ExportPanel />}
    </aside>
  );
}
