// src/modules/cv-designer/components/CanvasToolbar.tsx
import React from "react";
import { useDesignerStore } from "../store/designerStore";

function rid() {
  const g: any = (globalThis as any);
  return g.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export default function CanvasToolbar() {
  const addElement = useDesignerStore((s)=>s.addElement);
  const undo = useDesignerStore((s)=>s.undo);
  const redo = useDesignerStore((s)=>s.redo);
  const zoom = useDesignerStore((s)=>s.zoom);
  const setZoom = useDesignerStore((s)=>s.setZoom);
  const snap = useDesignerStore((s)=>s.snapThreshold);
  const setSnap = useDesignerStore((s)=>s.setSnap);

  return (
    <div className="mb-2 flex items-center gap-2">
      <button className="rounded border bg-white px-2 py-1 text-sm" onClick={()=>{
        addElement({ kind: "section", id: rid(), frame: { x: 40, y: 40, width: 520, height: 140 }, content: "Neue Sektion" });
      }}>+ Section</button>

      <button className="rounded border bg-white px-2 py-1 text-sm" onClick={()=>{
        addElement({ kind: "photo", id: rid(), frame: { x: 60, y: 200, width: 120, height: 120 }, src: "" });
      }}>+ Foto</button>

      <div className="mx-2 h-5 w-px bg-gray-300" />

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Zoom</span>
        <input type="range" min={25} max={300} value={Math.round(zoom*100)}
          onChange={(e)=>setZoom(Number(e.target.value)/100)} />
        <span className="w-10 text-right text-sm">{Math.round(zoom*100)}%</span>
      </div>

      <div className="mx-2 h-5 w-px bg-gray-300" />

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Snap</span>
        <input type="range" min={0} max={24} value={snap}
          onChange={(e)=>setSnap(Number(e.target.value))} />
      </div>

      <div className="mx-2 h-5 w-px bg-gray-300" />
      <button className="rounded border bg-white px-2 py-1 text-sm" onClick={undo}>⟲ Undo</button>
      <button className="rounded border bg-white px-2 py-1 text-sm" onClick={redo}>⟳ Redo</button>
    </div>
  );
}
