import React from "react";
import { useDesignerStore } from "../store/designerStore";

export default function CanvasToolbar() {
  const addSection = useDesignerStore((s) => s.addSection);
  const addPhoto = useDesignerStore((s) => s.addPhoto);
  const undo = useDesignerStore((s) => s.undo);
  const redo = useDesignerStore((s) => s.redo);
  const zoom = useDesignerStore((s) => s.zoom);
  const setZoom = useDesignerStore((s) => s.setZoom);
  const snapSize = useDesignerStore((s) => s.snapSize);
  const setSnapSize = useDesignerStore((s) => s.setSnapSize);

  return (
    <div className="flex items-center gap-2 p-2 border-b bg-white">
      <button className="px-2 py-1 border rounded" onClick={() => addSection()}>
        + Section
      </button>
      <button className="px-2 py-1 border rounded" onClick={() => addPhoto()}>
        + Foto
      </button>

      <div className="mx-2 h-6 w-px bg-gray-300" />

      <button className="px-2 py-1 border rounded" onClick={undo}>
        Undo ⌘/Ctrl+Z
      </button>
      <button className="px-2 py-1 border rounded" onClick={redo}>
        Redo ⇧+⌘/Ctrl+Z
      </button>

      <div className="mx-2 h-6 w-px bg-gray-300" />

      <button className="px-2 py-1 border rounded" onClick={() => setZoom(zoom - 0.1)}>
        −
      </button>
      <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
      <button className="px-2 py-1 border rounded" onClick={() => setZoom(zoom + 0.1)}>
        +
      </button>
      <button className="px-2 py-1 border rounded" onClick={() => setZoom(1)}>
        Reset
      </button>

      <div className="mx-2 h-6 w-px bg-gray-300" />

      <label className="text-sm">
        Snap:
        <input
          type="number"
          className="ml-2 w-16 border rounded px-1 py-0.5"
          value={snapSize}
          min={1}
          onChange={(e) => setSnapSize(parseInt(e.target.value || "1", 10))}
        />
        px
      </label>
    </div>
  );
}
