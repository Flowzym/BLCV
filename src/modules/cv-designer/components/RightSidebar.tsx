import React from "react";
import { useDesignerStore } from "../store/designerStore";
import PartTypographyPanel from "./PartTypographyPanel";

const FALLBACK = { top: 36, right: 36, bottom: 36, left: 36 };

export default function RightSidebar() {
  // Ränder
  const marginsFromStore = useDesignerStore((s) => s.margins);
  const setMargins = useDesignerStore((s) => s.setMargins);

  // Style-Tokens
  const tokens = useDesignerStore((s) => s.tokens);
  const setTokens = useDesignerStore((s) => s.setTokens);

  const margins = marginsFromStore ?? FALLBACK;
  const safe = {
    top: Number.isFinite(margins.top) ? margins.top : 36,
    bottom: Number.isFinite(margins.bottom) ? margins.bottom : 36,
    left: Number.isFinite(margins.left) ? margins.left : 36,
    right: Number.isFinite(margins.right) ? margins.right : 36,
  };

  const fontFamily = tokens?.fontFamily ?? "Helvetica, Arial, sans-serif";
  const fontSize = typeof tokens?.fontSize === "number" ? tokens.fontSize : 11;
  const lineHeight = typeof tokens?.lineHeight === "number" ? tokens.lineHeight : 1.4;
  const colorPrimary = tokens?.colorPrimary ?? "#111111";

  return (
    <aside className="w-72 border-l bg-white p-3 space-y-6">
      {/* Ränder */}
      <section>
        <h3 className="font-semibold text-sm">Seitenränder (A4)</h3>
        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
          <label className="flex items-center justify-between gap-2">
            <span>Oben</span>
            <input
              type="number"
              className="w-20 border rounded px-1 py-0.5"
              value={safe.top}
              min={0}
              onChange={(e) => setMargins({ top: Number(e.target.value || 0) })}
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Unten</span>
            <input
              type="number"
              className="w-20 border rounded px-1 py-0.5"
              value={safe.bottom}
              min={0}
              onChange={(e) => setMargins({ bottom: Number(e.target.value || 0) })}
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Links</span>
            <input
              type="number"
              className="w-20 border rounded px-1 py-0.5"
              value={safe.left}
              min={0}
              onChange={(e) => setMargins({ left: Number(e.target.value || 0) })}
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Rechts</span>
            <input
              type="number"
              className="w-20 border rounded px-1 py-0.5"
              value={safe.right}
              min={0}
              onChange={(e) => setMargins({ right: Number(e.target.value || 0) })}
            />
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Die gestrichelte Box im Canvas zeigt den Inhaltsbereich gemäß Rändern.
        </p>
      </section>

      {/* Style */}
      <section>
        <h3 className="font-semibold text-sm">Style</h3>
        <div className="space-y-2 mt-2 text-sm">
          <label className="block">
            <div className="mb-1">Schriftfamilie</div>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              value={fontFamily}
              onChange={(e) => setTokens({ fontFamily: e.target.value })}
              placeholder="z. B. Inter, Arial, sans-serif"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <div className="mb-1">Fontgröße</div>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={fontSize}
                min={8}
                max={48}
                onChange={(e) => setTokens({ fontSize: Number(e.target.value || 0) })}
              />
            </label>

            <label className="block">
              <div className="mb-1">Zeilenhöhe</div>
              <input
                type="number"
                step="0.05"
                className="w-full border rounded px-2 py-1"
                value={lineHeight}
                min={1}
                max={2.5}
                onChange={(e) => setTokens({ lineHeight: Number(e.target.value || 0) })}
              />
            </label>
          </div>

          <label className="block">
            <div className="mb-1">Primärfarbe</div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-8 w-10 border rounded"
                value={toColorInput(colorPrimary)}
                onChange={(e) => setTokens({ colorPrimary: e.target.value })}
              />
              <input
                type="text"
                className="flex-1 border rounded px-2 py-1"
                value={colorPrimary}
                onChange={(e) => setTokens({ colorPrimary: e.target.value })}
                placeholder="#111111"
              />
            </div>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Änderungen wirken sofort auf Textboxen im Canvas.
        </p>
      </section>

      <hr className="my-4" />

      {/* Globale Feld-Typografie (wirkt auf alle Einträge eines Feldes der Gruppe) */}
      <section>
        <PartTypographyPanel />
      </section>
    </aside>
  );
}

function toColorInput(v: string) {
  // Browser-Color-Input braucht ein gültiges Hex; andernfalls fallback
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v : "#111111";
}
