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
    <aside className="w-[360px] shrink-0 border-l bg-white p-4">
      <div className="mb-3 flex gap-4 border-b pb-1 text-sm">
        <button className={tab === "style" ? "font-semibold text-gray-900" : "text-gray-600"} onClick={() => setTab("style")}>Style</button>
        <button className={tab === "ki" ? "font-semibold text-gray-900" : "text-gray-600"} onClick={() => setTab("ki")}>KI</button>
        <button className={tab === "export" ? "font-semibold text-gray-900" : "text-gray-600"} onClick={() => setTab("export")}>Export</button>
      </div>

      {tab === "style" && (
        <div>
          <Section title="Style">
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">Primärfarbe</label>
              <input
                type="color"
                value={tokens.colorPrimary}
                onChange={(e) => setTokens({ colorPrimary: e.target.value })}
                className="h-8 w-16 cursor-pointer"
                aria-label="Primärfarbe"
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">Schriftgröße</label>
              <input
                type="number"
                value={tokens.fontSize}
                onChange={(e) => setTokens({ fontSize: Math.max(6, Number(e.target.value) || 12) })}
                className="rounded border border-gray-300 px-2 py-1"
                aria-label="Schriftgröße"
              />
            </div>

            <Section title="Seitenränder (px)">
              <div className="grid grid-cols-2 gap-2">
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
          </Section>
        </div>
      )}

      {tab === "ki" && <KiPanel />}

      {tab === "export" && <ExportPanel />}
    </aside>
  );
}
