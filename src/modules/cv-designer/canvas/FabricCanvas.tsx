import React, { useEffect, useRef } from "react";
import { useDesignerStore, CanvasElement } from "../store/designerStore";
import getFabric from "@/lib/fabric-shim";

const PAGE_W = 595; // A4 @72dpi
const PAGE_H = 842;

export default function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricNs = useRef<any>(null);
  const fCanvas = useRef<any>(null);
  const syncingRef = useRef(false); // 🔒 verhindert Feedback-Loop
  const objectsById = useRef(new Map<string, any>());

  const elements = useDesignerStore((s) => s.elements);
  const selectedIds = useDesignerStore((s) => s.selectedIds);
  const margins = useDesignerStore((s) => s.margins);
  const snapSize = useDesignerStore((s) => s.snapSize);
  const zoom = useDesignerStore((s) => s.zoom);

  const updateFrame = useDesignerStore((s) => s.updateFrame);
  const updateText = useDesignerStore((s) => s.updateText);
  const select = useDesignerStore((s) => s.select);

  // helper
  const arrEq = (a: string[], b: string[]) => {
    if (a === b) return true;
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  };

  useEffect(() => {
    let disposed = false;

    (async () => {
      const fabric = await getFabric();
      fabricNs.current = fabric;

      const el = canvasRef.current;
      if (!el) return;
      let c: any = (el as any).__fabricCanvas;
      if (!c) {
        c = new fabric.Canvas(el, { preserveObjectStacking: true, selection: true, backgroundColor: "#ffffff" });
        (el as any).__fabricCanvas = c;
      }
      fCanvas.current = c;

      c.setWidth(PAGE_W);
      c.setHeight(PAGE_H);
      c.setZoom(zoom);

      ensureOverlay(c, fabric, margins);

      if (!(c as any).__bl_eventsBound) {
        (c as any).__bl_eventsBound = true;

        c.on("selection:created", () => {
          if (syncingRef.current) return;
          const active = c.getActiveObjects() || [];
          const ids = active.map((o: any) => o.__bl_id).filter(Boolean);
          // nur setzen, wenn wirklich anders
          if (!arrEq(selectedIds, ids)) select(ids);
        });
        c.on("selection:updated", () => {
          if (syncingRef.current) return;
          const active = c.getActiveObjects() || [];
          const ids = active.map((o: any) => o.__bl_id).filter(Boolean);
          if (!arrEq(selectedIds, ids)) select(ids);
        });
        c.on("selection:cleared", () => {
          if (syncingRef.current) return;
          if (selectedIds.length) select([]);
        });

        c.on("object:moving", (e: any) => {
          const o = e.target;
          if (!o || o.selectable === false) return;
          o.set({
            left: Math.round(o.left / snapSize) * snapSize,
            top: Math.round(o.top / snapSize) * snapSize,
          });
        });
        c.on("object:scaling", (e: any) => {
          const o = e.target;
          if (!o || o.selectable === false) return;
          const w = Math.round((o.width * o.scaleX) / snapSize) * snapSize;
          const h = Math.round((o.height * o.scaleY) / snapSize) * snapSize;
          o.set({ scaleX: 1, scaleY: 1, width: w, height: h });
        });
        c.on("object:modified", (e: any) => {
          const o = e.target;
          if (!o || !o.__bl_id) return;
          updateFrame(o.__bl_id, { x: o.left, y: o.top, width: o.width, height: o.height });
        });

        c.on("mouse:dblclick", (e: any) => {
          const t = e.target;
          if (t && t.type === "textbox" && typeof (t as any).enterEditing === "function") {
            (t as any).enterEditing();
            (t as any).hiddenTextarea?.focus();
          }
        });
        c.on("text:changed", (e: any) => {
          const t = e.target;
          if (t && t.__bl_id && typeof t.text === "string") {
            updateText(t.__bl_id, t.text);
          }
        });
      }

      reconcileCanvas(c, fabric, elements, objectsById.current);

      if (disposed) return;
    })();

    return () => {
      disposed = true;
      fCanvas.current = null;
      fabricNs.current = null;
      objectsById.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // elements → Canvas
  useEffect(() => {
    if (!fCanvas.current || !fabricNs.current) return;
    reconcileCanvas(fCanvas.current, fabricNs.current, elements, objectsById.current);
  }, [elements]);

  // margins → Overlay
  useEffect(() => {
    const c = fCanvas.current;
    if (!c) return;
    const marginRect = (c.getObjects() as any[]).find((o) => o.__is_marginRect);
    if (marginRect) {
      marginRect.set({
        left: margins.left,
        top: margins.top,
        width: PAGE_W - margins.left - margins.right,
        height: PAGE_H - margins.top - margins.bottom,
      });
      c.requestRenderAll();
    }
  }, [margins]);

  // zoom → Canvasgröße
  useEffect(() => {
    const c = fCanvas.current;
    if (!c) return;
    c.setZoom(zoom);
    c.setWidth(PAGE_W * zoom);
    c.setHeight(PAGE_H * zoom);
    c.requestRenderAll();
  }, [zoom]);

  // store → canvas (Selection), mit Reentrancy-Guard
  useEffect(() => {
    const c = fCanvas.current;
    const fabric = fabricNs.current;
    if (!c || !fabric) return;

    const current = (c.getActiveObjects() || []).map((o: any) => o.__bl_id).filter(Boolean);
    if (arrEq(current, selectedIds)) return;

    syncingRef.current = true;
    c.discardActiveObject();

    const toSel = c.getObjects().filter((o: any) => o.__bl_id && selectedIds.includes(o.__bl_id) && o.selectable !== false);
    if (toSel.length === 1) {
      c.setActiveObject(toSel[0]);
    } else if (toSel.length > 1) {
      const sel = new fabric.ActiveSelection(toSel, { canvas: c });
      c.setActiveObject(sel);
    }
    c.requestRenderAll();
    // nach dem nächsten Paint wieder freigeben
    setTimeout(() => {
      syncingRef.current = false;
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  return (
    <div className="w-full h-full overflow-auto bg-neutral-100 flex items-center justify-center">
      <div className="shadow-xl bg-white" style={{ width: PAGE_W * zoom, height: PAGE_H * zoom }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

function ensureOverlay(
  c: any,
  fabric: any,
  margins: { top: number; right: number; bottom: number; left: number }
) {
  const objs = c.getObjects() as any[];
  const hasBg = objs.some((o) => o.__is_bg);
  const hasMR = objs.some((o) => o.__is_marginRect);

  if (!hasBg) {
    const bg = new fabric.Rect({
      left: 0,
      top: 0,
      width: PAGE_W,
      height: PAGE_H,
      fill: "#ffffff",
      selectable: false,
      evented: false,
      hoverCursor: "default",
    });
    (bg as any).__is_bg = true;
    c.add(bg);
  }

  if (!hasMR) {
    const marginRect = new fabric.Rect({
      left: margins.left,
      top: margins.top,
      width: PAGE_W - margins.left - margins.right,
      height: PAGE_H - margins.top - margins.bottom,
      fill: "rgba(0,0,0,0)",
      stroke: "#93c5fd",
      strokeDashArray: [6, 6],
      selectable: false,
      evented: false,
      strokeUniform: true,
    });
    (marginRect as any).__is_marginRect = true;
    c.add(marginRect);
  }

  c.requestRenderAll();
}

function reconcileCanvas(
  c: any,
  fabric: any,
  elements: CanvasElement[],
  map: Map<string, any>
) {
  const existingIds = new Set<string>();

  for (const el of elements) {
    existingIds.add(el.id);
    let obj = map.get(el.id);
    if (!obj) {
      if (el.kind === "section") {
        obj = new fabric.Textbox(el.text || "", {
          left: el.frame.x,
          top: el.frame.y,
          width: el.frame.width || 480,
          fontSize: 12,
          fill: "#111111",
          selectable: true,
          editable: true,
        });
      } else if (el.kind === "photo") {
        obj = new fabric.Rect({
          left: el.frame.x,
          top: el.frame.y,
          width: el.frame.width || 120,
          height: el.frame.height || 120,
          fill: "#e5e7eb",
          stroke: "#9ca3af",
          strokeUniform: true,
          selectable: true,
        });
      }
      obj.__bl_id = el.id;
      c.add(obj);
      map.set(el.id, obj);
    }
    obj.set({
      left: el.frame.x,
      top: el.frame.y,
      width: el.frame.width || obj.width,
      height: el.frame.height || obj.height,
    });
    if (el.kind === "section" && typeof (obj as any).set === "function") {
      (obj as any).set({ text: el.text ?? "" });
    }
  }

  for (const [id, obj] of Array.from(map.entries())) {
    if (!existingIds.has(id)) {
      c.remove(obj);
      map.delete(id);
    }
  }

  c.requestRenderAll();
}
