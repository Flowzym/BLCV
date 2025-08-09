import React, { useEffect, useRef } from "react";
import { useDesignerStore, CanvasElement } from "../store/designerStore";
import loadFabric from "@/lib/fabric-shim";

const PAGE_W = 595; // A4 @72dpi
const PAGE_H = 842;

type Fabric = typeof import("fabric");

export default function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Fabric["fabric"] | null>(null);
  const fCanvas = useRef<import("fabric").fabric.Canvas | null>(null);
  const objectsById = useRef(new Map<string, any>());

  const elements = useDesignerStore((s) => s.elements);
  const selectedIds = useDesignerStore((s) => s.selectedIds);
  const margins = useDesignerStore((s) => s.margins);
  const snapSize = useDesignerStore((s) => s.snapSize);
  const zoom = useDesignerStore((s) => s.zoom);

  const updateFrame = useDesignerStore((s) => s.updateFrame);
  const updateText = useDesignerStore((s) => s.updateText);
  const select = useDesignerStore((s) => s.select);

  // init fabric
  useEffect(() => {
    let disposed = false;
    (async () => {
      const mod: any = await loadFabric(); // shim
      const fabric = (mod?.fabric ?? mod?.default ?? mod) as Fabric["fabric"];
      fabricRef.current = fabric;

      if (!canvasRef.current) return;
      const c = new fabric.Canvas(canvasRef.current, {
        preserveObjectStacking: true,
        selection: true,
        backgroundColor: "#ffffff",
      });
      fCanvas.current = c;

      // size & zoom
      c.setWidth(PAGE_W);
      c.setHeight(PAGE_H);
      c.setZoom(zoom);

      // A4 overlay & margin guides (non-selectable)
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

      c.add(bg);
      c.add(marginRect);
      bg.moveTo(0);
      marginRect.moveTo(1);

      // selection sync
      c.on("selection:created", () => {
        const active = c.getActiveObjects() || [];
        select(active.map((o: any) => o.__bl_id).filter(Boolean));
      });
      c.on("selection:updated", () => {
        const active = c.getActiveObjects() || [];
        select(active.map((o: any) => o.__bl_id).filter(Boolean));
      });
      c.on("selection:cleared", () => select([]));

      // snap & commit frame
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
        updateFrame(o.__bl_id, {
          x: o.left,
          y: o.top,
          width: o.width,
          height: o.height,
        });
      });

      // dblclick → enter editing for textboxes
      c.on("mouse:dblclick", (e: any) => {
        const t = e.target;
        if (t && t.type === "textbox" && typeof (t as any).enterEditing === "function") {
          (t as any).enterEditing();
          (t as any).hiddenTextarea?.focus();
        }
      });

      // when editing stops, write back text
      c.on("text:changed", (e: any) => {
        const t = e.target;
        if (t && t.__bl_id && typeof t.text === "string") {
          updateText(t.__bl_id, t.text);
        }
      });

      // initial render
      reconcileCanvas(c, fabric, elements, objectsById.current);

      const dispose = () => {
        c.dispose();
      };
      if (disposed) dispose();
    })();

    return () => {
      disposed = true;
      if (fCanvas.current) {
        fCanvas.current.dispose();
        fCanvas.current = null;
      }
      fabricRef.current = null;
      objectsById.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // elements reconcile
  useEffect(() => {
    if (!fCanvas.current || !fabricRef.current) return;
    reconcileCanvas(fCanvas.current, fabricRef.current, elements, objectsById.current);
  }, [elements]);

  // margins update
  useEffect(() => {
    const c = fCanvas.current;
    const fabric = fabricRef.current;
    if (!c || !fabric) return;
    const all = c.getObjects() as any[];
    const marginRect = all.find((o) => o.__is_marginRect);
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

  // zoom update
  useEffect(() => {
    const c = fCanvas.current;
    if (!c) return;
    c.setZoom(zoom);
    c.setWidth(PAGE_W * zoom);
    c.setHeight(PAGE_H * zoom);
    c.requestRenderAll();
  }, [zoom]);

  // selection from store -> canvas
  useEffect(() => {
    const c = fCanvas.current;
    if (!c) return;
    const setActive = (ids: string[]) => {
      const toSel = c
        .getObjects()
        .filter((o: any) => o.__bl_id && ids.includes(o.__bl_id) && o.selectable !== false);
      c.discardActiveObject();
      if (toSel.length === 1) c.setActiveObject(toSel[0]);
      if (toSel.length > 1) {
        const sel = new (fabricRef.current as any).ActiveSelection(toSel, { canvas: c });
        c.setActiveObject(sel);
      }
      c.requestRenderAll();
    };
    setActive(selectedIds);
  }, [selectedIds]);

  return (
    <div className="w-full h-full overflow-auto bg-neutral-100 flex items-center justify-center">
      <div
        className="shadow-xl bg-white"
        style={{
          width: PAGE_W * zoom,
          height: PAGE_H * zoom,
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

function reconcileCanvas(
  c: import("fabric").fabric.Canvas,
  fabric: any,
  elements: CanvasElement[],
  map: Map<string, any>
) {
  // add/update
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
    // update frame/text
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

  // remove deleted
  for (const [id, obj] of Array.from(map.entries())) {
    if (!existingIds.has(id)) {
      c.remove(obj);
      map.delete(id);
    }
  }

  // mark helpers
  const all = c.getObjects() as any[];
  const bg = all[0];
  const marginRect = all[1];
  if (bg && !bg.__is_bg) bg.__is_bg = true, (bg.selectable = false), (bg.evented = false);
  if (marginRect && !marginRect.__is_marginRect) {
    marginRect.__is_marginRect = true;
    marginRect.selectable = false;
    marginRect.evented = false;
    marginRect.strokeUniform = true;
  }

  c.requestRenderAll();
}
