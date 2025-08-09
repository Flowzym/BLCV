import React, { useEffect, useCallback } from "react";
import { useDesignerStore } from "../store/designerStore";

export default function CanvasToolbar() {
  const addSection = useDesignerStore((s) => s.addSection);
  const addPhoto = useDesignerStore((s) => s.addPhoto);
  const undo = useDesignerStore((s) => s.undo);
  const redo = useDesignerStore((s) => s.redo);
  const zoom = useDesignerStore((s) => s.zoom);
  const setZoom = useDesignerStore((s) => s.setZoom);
  const snap = useDesignerStore((s) => s.snapSize);
  const setSnap = useDesignerStore((s) => s.setSnapSize);
  const deleteSelected = useDesignerStore((s) => s.deleteSelected);

  const handleDelete = useCallback(() => {
    window.dispatchEvent(new Event("bl:delete-active"));
    deleteSelected();
  }, [deleteSelected]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        window.dispatchEvent(new Event("bl:delete-active"));
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.shiftKey ? redo() : undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  return (
    <div className="flex items-center gap-2 px-2 py-2 border-b bg-white">
      <button className="px-2 py-1.5 border rounded" onClick={() => addSection()}>
        + Section {/* nur für EXTRAS, nicht aus Generator */}
      </button>
      <button className="px-2 py-1.5 border rounded" onClick={() => addPhoto()}>+ Foto</button>

      <div className="mx-2 h-6 w-px bg-gray-200" />

      <button className="px-2 py-1.5 border rounded" onClick={undo} title="Undo ⌘/Ctrl+Z">Undo ⌘/Ctrl+Z</button>
      <button className="px-2 py-1.5 border rounded" onClick={redo} title="Redo ⇧⌘/Ctrl+Z">Redo ⇧⌘/Ctrl+Z</button>

      <div className="mx-2 h-6 w-px bg-gray-200" />

      <button className="px-2 py-1.5 border rounded" onClick={() => setZoom(zoom - 0.1)}>-</button>
      <span className="w-14 text-center">{Math.round((zoom || 1) * 100)}%</span>
      <button className="px-2 py-1.5 border rounded" onClick={() => setZoom(zoom + 0.1)}>+</button>
      <button className="px-2 py-1.5 border rounded" onClick={() => setZoom(1)}>Reset</button>

      <label className="ml-2 text-sm text-gray-600">
        Snap:
        <input
          type="number"
          className="w-16 border rounded px-1 py-0.5 ml-1"
          value={snap}
          min={1}
          onChange={(e) => setSnap(Number(e.target.value || 1))}
        />
        px
      </label>

      <div className="mx-2 h-6 w-px bg-gray-200" />

      <button className="px-2 py-1.5 border rounded text-red-600" onClick={handleDelete} title="Entf/Backspace">
        Delete
      </button>

      {/* Re-Import-Button entfällt bewusst */}
    </div>
  );
}
