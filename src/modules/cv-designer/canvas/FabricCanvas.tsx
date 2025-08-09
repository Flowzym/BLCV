import React, { useEffect, useRef } from "react";
import { useDesignerStore, CanvasElement } from "../store/designerStore";
import getFabric from "@/lib/fabric-shim";

const PAGE_W = 595;
const PAGE_H = 842;

export default function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricNs = useRef<any>(null);
  const fCanvas = useRef<any>(null);
  const syncingRef = useRef(false);

  // id -> fabric object
  const objectsById = useRef(new Map<string, any>());

  const elements = useDesignerStore((s) => s.elements);
  const selectedIds = useDesignerStore((s) => s.selectedIds);
  const margins = useDesignerStore((s) => s.margins);
  const snapSize = useDesignerStore((s) => s.snapSize);
  const zoom = useDesignerStore((s) => s.zoom);
  const tokens = useDesignerStore((s) => s.tokens);

  const updateFrame = useDesignerStore((s) => s.updateFrame);
  const updateText = useDesignerStore((s) => s.updateText);
  const select = useDesignerStore((s) => s.select);

  const arrEq = (a: string[], b: string[]) => {
    if (a === b) return true;
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  };

  /* ---------------- init ---------------- */
  useEffect(() => {
    (async () => {
      const fabric = await getFabric();
      fabricNs.current = fabric;

      const el = canvasRef.current;
      if (!el) return;

      let c: any = (el as any).__fabricCanvas;
      if (!c) {
        c = new fabric.Canvas(el, {
          preserveObjectStacking: true,
          selection: true,
          backgroundColor: "#ffffff",
        });
        (el as any).__fabricCanvas = c;
      }
      fCanvas.current = c;
      (window as any).__bl_fcanvas = c; // debug

      c.setWidth(PAGE_W);
      c.setHeight(PAGE_H);
      c.setZoom(zoom);

      ensureOverlay(c, fabric, margins);
      // 1) Map aus vorhandenen Objekten hydratisieren (falls aus alter Session vorhanden)
      hydrateMapFromCanvas(c, objectsById.current);

      // 2) Verwaiste Objekte (ohne __bl_id, nicht overlay) rigoros entfernen
      purgeStrays(c);

      if (!(c as any).__bl_eventsBound) {
        (c as any).__bl_eventsBound = true;

        c.on("selection:created", () => {
          if (syncingRef.current) return;
          const ids = (c.getActiveObjects() || []).map((o: any) => o.__bl_id).filter(Boolean);
          select(ids);
        });
        c.on("selection:updated", () => {
          if (syncingRef.current) return;
          const ids = (c.getActiveObjects() || []).map((o: any) => o.__bl_id).filter(Boolean);
          select(ids);
        });
        c.on("selection:cleared", () => {
          if (syncingRef.current) return;
          select([]);
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
          if (t && t.__bl_id && typeof t.text === "string") updateText(t.__bl_id, t.text);
        });

        // Delete-Fallback: löscht aktive Canvas-Objekte ohne __bl_id (rein visuelle Altlasten)
        const onDeleteActive = () => {
          const act = (c.getActiveObjects() || []) as any[];
          const ids = act.map((o) => o.__bl_id).filter(Boolean);
          // 1) wenn ids vorhanden → store-basiert löschen
          if (ids.length) {
            useDesignerStore.getState().deleteByIds(ids);
            return;
          }
          // 2) sonst: alle aktiven (ohne id) entfernen
          for (const o of act) {
            if (!o.__is_bg && !o.__is_marginRect) c.remove(o);
          }
          c.discardActiveObject();
          c.requestRenderAll();
        };
        (c as any).__bl_onDeleteActive = onDeleteActive;
        window.addEventListener("bl:delete-active", onDeleteActive);
      }

      // erster reconcile gegen aktuellen store
      reconcileCanvas(c, fabric, elements, tokens, objectsById.current);
    })();

    return () => {
      const c = fCanvas.current;
      if (c?.__bl_onDeleteActive) {
        window.removeEventListener("bl:delete-active", c.__bl_onDeleteActive);
      }
      fCanvas.current = null;
      fabricNs.current = null;
      objectsById.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------- props -> canvas ----------- */
  useEffect(() => {
    if (!fCanvas.current || !fabricNs.current) return;
    reconcileCanvas(fCanvas.current, fabricNs.current, elements, tokens, objectsById.current);
  }, [elements, tokens]);

  // margins -> overlay
  useEffect(() => {
    const c = fCanvas.current;
    if (!c) return;
    const r = (c.getObjects() as any[]).find((o) => o.__is_marginRect);
    if (r) {
      r.set({
        left: margins.left,
        top: margins.top,
        width: PAGE_W - margins.left - margins.right,
        height: PAGE_H - margins.top - margins.bottom,
      });
      c.requestRenderAll();
    }
  }, [margins]);

  // zoom
  useEffect(() => {
    const c = fCanvas.current;
    if (!c) return;
    c.setZoom(zoom);
    c.setWidth(PAGE_W * zoom);
    c.setHeight(PAGE_H * zoom);
    c.requestRenderAll();
  }, [zoom]);

  // store-selection -> canvas
  useEffect(() => {
    const c = fCanvas.current;
    const fabric = fabricNs.current;
    if (!c || !fabric) return;

    const current = (c.getActiveObjects() || []).map((o: any) => o.__bl_id).filter(Boolean);
    if (arrEq(current, selectedIds)) return;

    syncingRef.current = true;
    c.discardActiveObject();

    const toSel = c.getObjects().filter((o: any) => o.__bl_id && selectedIds.includes(o.__bl_id) && o.selectable !== false);
    if (toSel.length === 1) c.setActiveObject(toSel[0]);
    else if (toSel.length > 1) c.setActiveObject(new fabric.ActiveSelection(toSel, { canvas: c }));

    c.requestRenderAll();
    setTimeout(() => (syncingRef.current = false), 0);
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

/* ------------- helpers ------------- */

function ensureOverlay(
  c: any,
  fabric: any,
  margins: { top: number; right: number; bottom: number; left: number }
) {
  const objs = c.getObjects() as any[];
  if (!objs.some((o) => o.__is_bg)) {
    const bg = new fabric.Rect({
      left: 0, top: 0, width: PAGE_W, height: PAGE_H,
      fill: "#ffffff", selectable: false, evented: false, hoverCursor: "default",
    });
    (bg as any).__is_bg = true;
    c.add(bg);
  }
  if (!objs.some((o) => o.__is_marginRect)) {
    const marginRect = new fabric.Rect({
      left: margins.left, top: margins.top,
      width: PAGE_W - margins.left - margins.right,
      height: PAGE_H - margins.top - margins.bottom,
      fill: "rgba(0,0,0,0)",
      stroke: "#93c5fd", strokeDashArray: [6, 6],
      selectable: false, evented: false, strokeUniform: true,
    });
    (marginRect as any).__is_marginRect = true;
    c.add(marginRect);
  }
  c.requestRenderAll();
}

// baut objectsById aus evtl. vorhandenen Objekten (mit __bl_id) auf
function hydrateMapFromCanvas(c: any, map: Map<string, any>) {
  map.clear();
  for (const o of c.getObjects() as any[]) {
    if (o.__bl_id) map.set(o.__bl_id, o);
  }
}

// löscht alles, was keine id hat und nicht overlay ist (verwaiste Altlasten)
function purgeStrays(c: any) {
  for (const o of [...(c.getObjects() as any[])]) {
    if (!o.__bl_id && !o.__is_bg && !o.__is_marginRect) c.remove(o);
  }
  c.requestRenderAll();
}

function reconcileCanvas(
  c: any,
  fabric: any,
  elements: CanvasElement[],
  tokens: any,
  map: Map<string, any>
) {
  // Straights zuerst weg, Map neu hydratisieren (falls zwischenzeitlich etwas manuell entfernt wurde)
  purgeStrays(c);
  hydrateMapFromCanvas(c, map);

  const keepIds = new Set<string>();
  const fontFamily = tokens?.fontFamily ?? "Helvetica, Arial, sans-serif";
  const fontSize = Number(tokens?.fontSize) > 0 ? Number(tokens.fontSize) : 11;
  const lineHeight = Number(tokens?.lineHeight) > 0 ? Number(tokens.lineHeight) : 1.4;
  const color = tokens?.colorPrimary ?? "#111111";

  for (const el of elements) {
    keepIds.add(el.id);
    let obj = map.get(el.id);
    if (!obj) {
      if (el.kind === "section") {
        obj = new fabric.Textbox(el.text || "", {
          left: el.frame.x, top: el.frame.y, width: el.frame.width || 480,
          fontFamily, fontSize, lineHeight, fill: color, selectable: true, editable: true,
        });
      } else if (el.kind === "photo") {
        obj = new fabric.Rect({
          left: el.frame.x, top: el.frame.y,
          width: el.frame.width || 120, height: el.frame.height || 120,
          fill: "#e5e7eb", stroke: "#9ca3af", strokeUniform: true, selectable: true,
        });
      }
      obj.__bl_id = el.id;
      c.add(obj);
      map.set(el.id, obj);
    }
    obj.set({
      left: el.frame.x, top: el.frame.y,
      width: el.frame.width || obj.width, height: el.frame.height || obj.height,
      ...(el.kind === "section" && { fontFamily, fontSize, lineHeight, fill: color, text: (el as any).text ?? "" }),
    });
  }

  // alles entfernen, was nicht mehr im store ist
  for (const [id, obj] of Array.from(map.entries())) {
    if (!keepIds.has(id)) {
      c.remove(obj);
      map.delete(id);
    }
  }

  c.requestRenderAll();
}
