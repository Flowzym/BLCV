// src/modules/cv-designer/components/CanvasToolbar.tsx
import React from "react";
import { useDesignerStore } from "../store/designerStore";
import { v4 as uuid } from "uuid";

export default function CanvasToolbar() {
  const snap = useDesignerStore((s) => s.snapThreshold);
  const setSnap = useDesignerStore((s) => s.setSnapThreshold);
  const zoom = useDesignerStore((s) => s.zoom);
  const setZoom = useDesignerStore((s) => s.setZoom);
  const addElement = useDesignerStore((s) => s.addElement);
  const undo = useDesignerStore((s) => s.undo);
  const redo = useDesignerStore((s) => s.redo);
  const canUndo = useDesignerStore((s) => s.canUndo);
  const canRedo = useDesignerStore((s) => s.canRedo);

  return (
    <div className="mb-3 flex items-center gap-2">
      <button
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
        onClick={() =>
          addElement({
            kind: "section",
            id: uuid(),
            frame: { x: 64, y: 64, width: 420, height: 120 },
            content: "Neue Section\nDoppelklicken zum Bearbeiten",
          })
        }
      >
        + Section
      </button>

      <button
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
        onClick={() =>
          addElement({
            kind: "photo",
            id: uuid(),
            frame: { x: 64, y: 220, width: 120, height: 120 },
            src: "",
          })
        }
      >
        + Foto
      </button>

      <div className="ml-4 flex items-center gap-2">
        <span className="text-sm text-gray-600">Zoom</span>
        <input
          type="range"
          min={50}
          max={200}
          value={Math.round(zoom * 100)}
          onChange={(e) => setZoom(Number(e.target.value) / 100)}
        />
        <span className="w-10 text-right text-sm">{Math.round(zoom * 100)}%</span>
      </div>

      <div className="ml-4 flex items-center gap-2">
        <span className="text-sm text-gray-600">Snap</span>
        <input
          type="range"
          min={0}
          max={40}
          value={snap}
          onChange={(e) => setSnap(Number(e.target.value))}
        />
      </div>

      <div className="ml-4 flex items-center gap-2">
        <button className="rounded border border-gray-300 bg-white px-2 py-1 text-sm" onClick={undo} disabled={!canUndo}>
          ↶ Undo
        </button>
        <button className="rounded border border-gray-300 bg-white px-2 py-1 text-sm" onClick={redo} disabled={!canRedo}>
          ↷ Redo
        </button>
      </div>
    </div>
  );
}
