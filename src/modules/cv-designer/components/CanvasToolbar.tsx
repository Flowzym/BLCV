import React, { useEffect, useCallback } from "react";
import { useDesignerStore } from "../store/designerStore";
import { Templates } from "../templates";

export default function CanvasToolbar() {
  const addSectionFromTemplate = useDesignerStore((s) => s.addSectionFromTemplate);
  const addPhoto = useDesignerStore((s) => s.addPhoto);
  const undo = useDesignerStore((s) => s.undo);
  const redo = useDesignerStore((s) => s.redo);
  const zoom = useDesignerStore((s) => s.zoom);
  const rememberView = useDesignerStore((s)=>s.rememberView);
  const setRememberView = useDesignerStore((s)=>s.setRememberView);
  const setZoom = useDesignerStore((s) => s.setZoom);
  const snap = useDesignerStore((s) => s.snapSize);
  const setSnap = useDesignerStore((s) => s.setSnapSize);
  const deleteSelected = useDesignerStore((s) => s.deleteSelected);

  const handleDelete = useCallback(() => {
    window.dispatchEvent(new Event("bl:delete-active"));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault(); redo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault(); handleDelete();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, handleDelete]);

  // DEBUG: Zoom-Werte überwachen
  useEffect(() => {
    console.log('[CANVAS_TOOLBAR] Zoom changed:', {
      zoom,
      zoomPercent: Math.round(zoom * 100),
      isValidZoom: zoom > 0 && zoom <= 10
    });
  }, [zoom]);

  return (
    <div className="flex items-center gap-2 px-2 py-2 border-b bg-white">
      <button
        className="px-2 py-1.5 border rounded"
        onClick={() => {
          const tpl = Templates.experienceLeft;
          addSectionFromTemplate({
            group: tpl.group,
            frame: { x: 60, y: 120, width: tpl.baseSize.width, height: tpl.baseSize.height },
            parts: tpl.parts.map(p => ({ key: p.key as any, text: "", offset: { ...p.offset }, style: p.style })),
            meta: { source: { key: `manual:${Date.now()}`, group: tpl.group, template: tpl.id } },
            title: ""
          });
        }}
      >
        + Section {/* nur für EXTRAS, nicht aus Generator */}
      </button>
      <button className="px-2 py-1.5 border rounded" onClick={() => addPhoto()}>+ Foto</button>

      <div className="mx-2 h-6 w-px bg-gray-200" />

      <button className="px-2 py-1.5 border rounded" onClick={undo} title="Undo ⌘/Ctrl+Z">Undo ⌘/Ctrl+Z</button>
      <button className="px-2 py-1.5 border rounded" onClick={redo} title="Redo ⇧+⌘/Ctrl+Z">Redo ⇧+⌘/Ctrl+Z</button>


      <div className="mx-2 h-6 w-px bg-gray-200" />

      <div className="flex items-center gap-2 text-sm">
        <button className="px-2 py-1.5 border rounded" title="Fit Page (Ctrl+0)"
          onClick={()=>window.dispatchEvent(new Event('bl:fit-page'))}>Fit Page</button>
        <button className="px-2 py-1.5 border rounded" title="Fit Width (Ctrl+2)"
          onClick={()=>window.dispatchEvent(new Event('bl:fit-width'))}>Fit Width</button>
        <button className="px-2 py-1.5 border rounded" title="100% (Ctrl+1)"
          onClick={()=>window.dispatchEvent(new Event('bl:zoom-100'))}>100%</button>
        <button className="px-2 py-1.5 border rounded" title="Reset View"
          onClick={()=>window.dispatchEvent(new Event('bl:reset-view'))}>Reset</button>

        <label className="ml-2 inline-flex items-center gap-2">
          <input type="checkbox" checked={!!rememberView} onChange={e=>setRememberView(e.target.checked)} />
          <span>Remember view</span>
        </label>
      </div>


      <label className="flex items-center gap-2 text-sm">
        Zoom
        <input
          type="range" min={25} max={400} step={5}
          value={Math.round(zoom * 100)}
          onChange={(e) => {
            const newZoom = Number(e.target.value) / 100;
            console.log('[CANVAS_TOOLBAR] Zoom slider changed:', { from: zoom, to: newZoom });
            setZoom(newZoom);
          }}
        />
        <span style={{ color: zoom < 0.5 || zoom > 3 ? 'red' : 'black' }}>
          {Math.round(zoom * 100)}%
        </span>
      </label>


      <div className="mx-2 h-6 w-px bg-gray-200" />

      <div className="flex items-center gap-2 text-sm">
        <button className="px-2 py-1.5 border rounded" title="Fit Page (Ctrl+0)"
          onClick={()=>window.dispatchEvent(new Event('bl:fit-page'))}>Fit Page</button>
        <button className="px-2 py-1.5 border rounded" title="Fit Width (Ctrl+2)"
          onClick={()=>window.dispatchEvent(new Event('bl:fit-width'))}>Fit Width</button>
        <button className="px-2 py-1.5 border rounded" title="100% (Ctrl+1)"
          onClick={()=>window.dispatchEvent(new Event('bl:zoom-100'))}>100%</button>
        <button className="px-2 py-1.5 border rounded" title="Reset View"
          onClick={()=>window.dispatchEvent(new Event('bl:reset-view'))}>Reset</button>

        <label className="ml-2 inline-flex items-center gap-2">
          <input type="checkbox" checked={!!rememberView} onChange={e=>setRememberView(e.target.checked)} />
          <span>Remember view</span>
        </label>
      </div>


      <label className="flex items-center gap-2 text-sm">
        Snap
        <input
          type="number"
          className="w-16 border rounded px-1 py-0.5"
          value={snap}
          onChange={(e) => {
            const newSnap = Number(e.target.value) || 0;
            console.log('[CANVAS_TOOLBAR] Snap changed:', { from: snap, to: newSnap });
            setSnap(newSnap);
          }}
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
