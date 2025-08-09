import React from "react";
import { useDesignerStore } from "../store/designerStore";

const FALLBACK = { top: 36, right: 36, bottom: 36, left: 36 };

export default function RightSidebar() {
  // defensive default, falls Persist-Zustand noch migriert wird
  const marginsFromStore = useDesignerStore((s) => s.margins);
  const setMargins = useDesignerStore((s) => s.setMargins);

  const margins = marginsFromStore ?? FALLBACK;
  const safe = {
    top: Number.isFinite(margins.top) ? margins.top : 36,
    bottom: Number.isFinite(margins.bottom) ? margins.bottom : 36,
    left: Number.isFinite(margins.left) ? margins.left : 36,
    right: Number.isFinite(margins.right) ? margins.right : 36,
  };

  return (
    <aside className="w-72 border-l bg-white p-3 space-y-4">
      <h3 className="font-semibold text-sm">Seitenränder (A4)</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
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

      <p className="text-xs text-gray-500">
        Die gestrichelte Box im Canvas zeigt den Inhaltsbereich gemäß Rändern.
      </p>
    </aside>
  );
}
