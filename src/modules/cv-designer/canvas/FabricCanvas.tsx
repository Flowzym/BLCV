import React, { useEffect, useRef } from "react";
import { useDesignerStore, CanvasElement, SectionElement, PartStyle } from "../store/designerStore";
import getFabric from "@/lib/fabric-shim";

const PAGE_W = 595;
const PAGE_H = 842;

type FabricNS = any;

export default function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricNs = useRef<FabricNS>(null);
  const fCanvas = useRef<any>(null);
  const syncingRef = useRef(false);

  // id/part -> fabric object
  const objectsByKey = useRef(new Map<string, any>());

  const elements = useDesignerStore((s) => s.elements);
  const selectedIds = useDesignerStore((s) => s.selectedIds);
  const margins = useDesignerStore((s) => s.margins);
  const snapSize = useDesignerStore((s) => s.snapSize);
  const zoom = useDesignerStore((s) => s.zoom);
  const tokens = useDesignerStore((s) => s.tokens);
  const partStyles = useDesignerStore((s) => s.partStyles);

  const updateFrame = useDesignerStore((s) => s.updateFrame);
  const updatePartText = useDesignerStore((s) => s.updatePartText);
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
      (window as any).__bl_fcanvas = c;

      c.setWidth(PAGE_W);
      c.setHeight(PAGE_H);
      c.setZoom(zoom);

      ensureOverlay(c, fabric, margins);
      hydrateMapFromCanvas(c, objectsByKey.current);
      purgeStrays(c);

      if (!(c as any).__bl_eventsBound) {
        (c as any).__bl_eventsBound = true;

        c.on("selection:created", () => {
          if (syncingRef.current) return;
          const ids = new Set<string>();
          for (const o of c.getActiveObjects() || []) {
            if (o.__is_container) ids.add(o.__bl_id);
            else if (o.__bl_id) ids.add(o.__bl_id); // selecting part also selects its section
          }
          select(Array.from(ids));
        });
        c.on("selection:updated", () => {
          if (syncingRef.current) return;
          const ids = new Set<string>();
          for (const o of c.getActiveObjects() || []) {
            if (o.__is_container) ids.add(o.__bl_id);
            else if (o.__bl_id) ids.add(o.__bl_id);
          }
          select(Array.from(ids));
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
          if (o.__is_container) {
            // Container bewegt → Parts relativ repositionieren
            repositionPartsForContainer(c, o.__bl_id);
          }
        });

        c.on("object:scaling", (e: any) => {
          const o = e.target;
          if (!o || o.selectable === false) return;
          const w = Math.round((o.width * o.scaleX) / snapSize) * snapSize;
          const h = Math.round((o.height * o.scaleY) / snapSize) * snapSize;
          o.set({ scaleX: 1, scaleY: 1, width: w, height: h });
          if (o.__is_container) {
            repositionPartsForContainer(c, o.__bl_id);
          }
        });

        c.on("object:modified", (e: any) => {
          const o = e.target;
          if (!o || !o.__bl_id) return;
          if (o.__is_container) {
            updateFrame(o.__bl_id, { x: o.left, y: o.top, width: o.width, height: o.height });
            repositionPartsForContainer(c, o.__bl_id);
          }
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
          if (t && t.__bl_id && t.__bl_part && typeof t.text === "string") {
            updatePartText(t.__bl_id, t.__bl_part, t.text);
          }
        });

        // Nur Hauptboxen dürfen gelöscht werden
        const onDeleteActive = () => {
          const act = (c.getActiveObjects() || []) as any[];
          const ids = act.filter((o) => o.__is_container).map((o) => o.__bl_id);
          if (ids.length) {
            useDesignerStore.getState().deleteByIds(ids);
          }
          c.discardActiveObject();
          c.requestRenderAll();
        };
        (c as any).__bl_onDeleteActive = onDeleteActive;
        window.addEventListener("bl:delete-active", onDeleteActive);
      }

      reconcileCanvas(c, fabric, elements, tokens, useDesignerStore.getState().partStyles, objectsByKey.current);
    })();

    return () => {
      const c = fCanvas.current;
      if (c?.__bl_onDeleteActive) {
        window.removeEventListener("bl:delete-active", c.__bl_onDeleteActive);
      }
      try {
        const act: any = c?.getActiveObject?.();
        if (act?.exitEditing) act.exitEditing();
      } catch {}
      try {
        c?.dispose?.();
      } catch {}
      try {
        const el = canvasRef.current as any;
        if (el && el.__fabricCanvas === c) el.__fabricCanvas = undefined;
      } catch {}
      fCanvas.current = null;
      fabricNs.current = null;
      objectsByKey.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------- props -> canvas ----------- */
  useEffect(() => {
    if (!fCanvas.current || !fabricNs.current) return;
    reconcileCanvas(
      fCanvas.current,
      fabricNs.current,
      elements,
      tokens,
      partStyles,
      objectsByKey.current
    );
  }, [elements, tokens, partStyles]);

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

function hydrateMapFromCanvas(c: any, map: Map<string, any>) {
  map.clear();
  for (const o of c.getObjects() as any[]) {
    // Container: key = `sec:<id>`
    if (o.__is_container && o.__bl_id) map.set(`sec:${o.__bl_id}`, o);
    // Part: key = `part:<id>:<partKey>`
    if (o.__bl_id && o.__bl_part) map.set(`part:${o.__bl_id}:${o.__bl_part}`, o);
  }
}

function purgeStrays(c: any) {
  for (const o of [...(c.getObjects() as any[])]) {
    if (!o.__bl_id && !o.__is_bg && !o.__is_marginRect) c.remove(o);
  }
  c.requestRenderAll();
}

function charSpacingFromEm(em?: number): number | undefined {
  if (em == null) return undefined;
  // Fabric charSpacing ist in 1/1000 em
  return Math.round(em * 1000);
}

function applyTextStyle(obj: any, base: { fontFamily?: string; fontSize?: number; lineHeight?: number; color?: string }, local?: PartStyle, global?: PartStyle) {
  const s = { ...(base || {}) };
  const g = global || {};
  const l = local || {};
  const fontFamily = l.fontFamily ?? g.fontFamily ?? s.fontFamily ?? "Inter, Arial, sans-serif";
  const fontSize = l.fontSize ?? g.fontSize ?? s.fontSize ?? 12;
  const lineHeight = l.lineHeight ?? g.lineHeight ?? s.lineHeight ?? 1.4;
  const color = l.color ?? g.color ?? s.color ?? "#111111";
  const fontWeight = l.fontWeight ?? g.fontWeight ?? "normal";
  const italic = l.italic ?? g.italic ?? false;
  const letterSpacing = l.letterSpacing ?? g.letterSpacing;

  obj.set({
    fontFamily,
    fontSize,
    lineHeight,
    fill: color,
    fontWeight,
    fontStyle: italic ? "italic" : "normal",
    charSpacing: charSpacingFromEm(letterSpacing),
  });
}

function keyForGlobal(group: string, partKey: string) {
  return `${group}:${partKey}`;
}

function reconcileCanvas(
  c: any,
  fabric: any,
  elements: CanvasElement[],
  tokens: any,
  partStyles: Record<string, PartStyle>,
  map: Map<string, any>
) {
  purgeStrays(c);
  hydrateMapFromCanvas(c, map);

  const keep = new Set<string>();

  for (const el of elements) {
    if (el.kind === "photo") {
      const key = `sec:${el.id}`; // Foto ohne Containerflag, aber wir verwenden key-space konsistent
      let obj = map.get(key);
      if (!obj) {
        obj = new fabric.Rect({
          left: el.frame.x, top: el.frame.y,
          width: el.frame.width, height: el.frame.height,
          fill: "#e5e7eb", stroke: "#9ca3af", strokeUniform: true, selectable: true,
        });
        obj.__bl_id = el.id;
        c.add(obj);
        map.set(key, obj);
      }
      obj.set({ left: el.frame.x, top: el.frame.y, width: el.frame.width, height: el.frame.height });
      keep.add(key);
      continue;
    }

    // SECTION: Container + Parts
    const secKey = `sec:${el.id}`;
    let container = map.get(secKey);
    if (!container) {
      container = new fabric.Rect({
        left: el.frame.x,
        top: el.frame.y,
        width: el.frame.width,
        height: el.frame.height,
        fill: "rgba(0,0,0,0)",
        stroke: "#e5e7eb",
        strokeUniform: true,
        selectable: true,
      });
      container.__bl_id = el.id;
      container.__is_container = true;
      c.add(container);
      map.set(secKey, container);
    } else {
      container.set({ left: el.frame.x, top: el.frame.y, width: el.frame.width, height: el.frame.height });
    }
    keep.add(secKey);

    // Parts
    for (const part of el.parts) {
      const pKey = `part:${el.id}:${part.key}`;
      let pObj = map.get(pKey);
      const base = {
        fontFamily: tokens?.fontFamily,
        fontSize: tokens?.fontSize,
        lineHeight: tokens?.lineHeight,
        color: tokens?.colorPrimary,
      };
      const global = partStyles[keyForGlobal(el.group, part.key)];

      const left = container.left + (part.offset.x ?? 0);
      const top = container.top + (part.offset.y ?? 0);
      const width = (part.offset.w ?? Math.max(40, container.width - (part.offset.x ?? 0) - 8));
      const height = part.offset.h ?? 18;

      if (!pObj) {
        pObj = new fabric.Textbox(part.text || "", {
          left, top, width, height,
          selectable: true, editable: true,
        });
        pObj.__bl_id = el.id;
        pObj.__bl_part = part.key;
        pObj.__bl_group = el.group;
        applyTextStyle(pObj, base, part.style, global);
        c.add(pObj);
        map.set(pKey, pObj);
      } else {
        pObj.set({ left, top, width, height, text: part.text ?? "" });
        applyTextStyle(pObj, base, part.style, global);
      }
      keep.add(pKey);
    }
  }

  // alles entfernen, was nicht mehr im store ist
  for (const [key, obj] of Array.from(map.entries())) {
    if (!keep.has(key)) {
      c.remove(obj);
      map.delete(key);
    }
  }

  c.requestRenderAll();
}

/** Relativ-Positionsupdate aller Parts einer Sektion nach Container-Bewegung/Resize */
function repositionPartsForContainer(c: any, sectionId: string) {
  const objs = c.getObjects() as any[];
  const container = objs.find((o: any) => o.__is_container && o.__bl_id === sectionId);
  if (!container) return;

  const parts = objs.filter((o: any) => o.__bl_id === sectionId && o.__bl_part);
  for (const p of parts) {
    // Wir halten die relativen Offsets in den Store-Parts; hier setzen wir nur neu per reconcile,
    // deshalb reicht ein RenderAll – der nächste reconcile korrigiert die exakten Positionen.
  }
  c.requestRenderAll();
}
