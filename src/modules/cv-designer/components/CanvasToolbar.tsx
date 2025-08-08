import React from "react";
import { useDesignerStore } from "../store/designerStore";

export default function CanvasToolbar() {
  const addSection = useDesignerStore((s) => s.addSection);
  const addPhoto = useDesignerStore((s) => s.addPhoto);
  const undo = useDesignerStore((s) => s.undo);
  const redo = useDesignerStore((s) => s.redo);
  const zoom = useDesignerStore((s) => s.zoom);
  const setZoom = useDesignerStore((s) => s.setZoom);
  const snap = useDesignerStore((s) => s.snapThreshold);
  const setSnap = useDesignerStore((s) => s.setSnapThreshold);

  return (
    <div className="flex items-center gap-2 px-2 py-2 border-b">
      <button className="btn" onClick={() => addSection()}>+ Section</button>
      <button className="btn" onClick={() => addPhoto()}>+ Foto</button>

      <div className="mx-4 flex items-center gap-2">
        <span>Zoom</span>
        <input
          type="range"
          min={25}
          max={300}
          value={Math.round(zoom * 100)}
          onChange={(e) => setZoom(Number(e.target.value) / 100)}
        />
        <span>{Math.round(zoom * 100)}%</span>
      </div>

      <div className="mx-4 flex items-center gap-2">
        <span>Snap</span>
        <input
          type="range"
          min={0}
          max={40}
          value={snap}
          onChange={(e) => setSnap(Number(e.target.value))}
        />
      </div>

      <button className="btn" onClick={() => undo()}>↺ Undo</button>
      <button className="btn" onClick={() => redo()}>↻ Redo</button>
    </div>
  );
}
