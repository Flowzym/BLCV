// src/modules/cv-designer/canvas/FabricCanvas.tsx
import React, { useEffect, useRef } from "react";
import fabricNS from "@/lib/fabric-shim";
import { useDesignerStore } from "../store/designerStore";
import { computeGuides, drawGuides, clearGuides, drawOverflowBadges } from "./guides";

const fabric = fabricNS as unknown as typeof import("fabric");

const A4_WIDTH = 595;  // px @ 72dpi
const A4_HEIGHT = 842;

function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let last = 0;
  let timer: any = null;
  return function(this: any, ...args: any[]) {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn.apply(this, args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => { last = Date.now(); fn.apply(this, args); }, ms - (now - last));
    }
  } as T;
}

type MapVal = import("fabric").fabric.Object & { __id?: string };

export default function FabricCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<import("fabric").fabric.Canvas | null>(null);
  const objectMap = useRef<Map<string, MapVal>>(new Map());

  const elements = useDesignerStore((s) => s.elements);
  const tokens = useDesignerStore((s) => s.tokens);
  const selectedId = useDesignerStore((s) => s.selectedId);
  const select = useDesignerStore((s) => s.select);
  const updateFrame = useDesignerStore((s) => s.updateFrame);
  const snapThreshold = useDesignerStore((s) => s.snapThreshold);
  const zoom = useDesignerStore((s) => s.zoom);

  // mount
  useEffect(() => {
    const el = ref.current;
    if (!el || !fabric?.fabric) return;
    const canvas = new fabric.fabric.Canvas(el, {
      backgroundColor: "#fff",
      selection: true,
      controlsAboveOverlay: true,
    });
    canvas.setWidth(A4_WIDTH);
    canvas.setHeight(A4_HEIGHT);
    canvasRef.current = canvas;

    const onSelection = () => {
      const active = canvas.getActiveObject() as MapVal | undefined;
      const id = (active as any)?.__id ?? null;
      select(id);
    };
    canvas.on("selection:created", onSelection);
    canvas.on("selection:updated", onSelection);
    canvas.on("selection:cleared", () => select(null));

    return () => {
      canvas.dispose();
      canvasRef.current = null;
      objectMap.current.clear();
    };
  }, [select]);

  // zoom
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    try {
      c.setZoom(zoom);
      c.requestRenderAll();
    } catch {}
  }, [zoom]);

  // sync elements → canvas (very simple diff: recreate all for reliability)
  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !fabric?.fabric) return;

    // remove non-guide objects
    const all = c.getObjects();
    all.forEach((o: any) => c.remove(o));
    objectMap.current.clear();
    clearGuides(c);

    for (const el of elements) {
      if (el.kind === "section") {
        const tb = new (fabric as any).Textbox(el.content || "", {
          left: el.frame.x,
          top: el.frame.y,
          width: el.frame.width,
          height: el.frame.height,
          fontSize: tokens.fontSize,
          fill: tokens.colorPrimary,
          fontFamily: tokens.fontFamily,
          selectable: true,
          editable: true,
          hasControls: true,
          borderColor: "#4f46e5",
          cornerColor: "#111827",
        }) as MapVal;
        tb.__id = el.id;
        c.add(tb);
        objectMap.current.set(el.id, tb);
      } else if (el.kind === "photo") {
        // simple placeholder rect
        const rect = new (fabric as any).Rect({
          left: el.frame.x,
          top: el.frame.y,
          width: el.frame.width,
          height: el.frame.height,
          fill: "#e5e7eb",
          stroke: "#9ca3af",
          selectable: true,
          hasControls: true,
        }) as MapVal;
        rect.__id = el.id;
        c.add(rect);
        objectMap.current.set(el.id, rect);
      }
    }

    c.discardActiveObject();
    c.requestRenderAll();

    // attach move handlers once per render pass
    const onMoving = throttle((opt: any) => {
      const mv = opt?.target;
      if (!mv) return;
      const guides = computeGuides(fabric as any, c, mv, snapThreshold);
      drawGuides(fabric as any, c, guides);
    }, 16);

    const onModified = throttle((opt: any) => {
      const obj = opt?.target as any;
      if (!obj) return;
      const id = (obj as MapVal).__id;
      if (!id) return;
      updateFrame(id, {
        x: Math.round(obj.left || 0),
        y: Math.round(obj.top || 0),
        width: Math.round(obj.getScaledWidth ? obj.getScaledWidth() : obj.width || 0),
        height: Math.round(obj.getScaledHeight ? obj.getScaledHeight() : obj.height || 0),
      });
      clearGuides(c);
      drawOverflowBadges(fabric as any, c);
    }, 50);

    c.on("object:moving", onMoving);
    c.on("object:modified", onModified);
    c.on("object:scaling", onMoving);
    c.on("mouse:up", () => clearGuides(c));

    // initial badges
    drawOverflowBadges(fabric as any, c);

    return () => {
      c.off("object:moving", onMoving);
      c.off("object:modified", onModified);
      c.off("object:scaling", onMoving);
    };
  }, [elements, tokens, snapThreshold, updateFrame]);

  // reflect external selection in canvas
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    if (!selectedId) {
      c.discardActiveObject();
      c.requestRenderAll();
      return;
    }
    const obj = objectMap.current.get(selectedId);
    if (obj) {
      c.setActiveObject(obj);
      c.requestRenderAll();
    }
  }, [selectedId]);

  return (
    <div className="relative" style={{ width: A4_WIDTH, height: A4_HEIGHT }}>
      <canvas ref={ref} />
    </div>
  );
}
