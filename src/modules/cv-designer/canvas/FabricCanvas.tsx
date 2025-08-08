// src/modules/cv-designer/canvas/FabricCanvas.tsx
import React, { useEffect, useRef } from "react";
import fabricNS from "@/lib/fabric-shim";
import { useDesignerStore } from "../store/designerStore";
import { computeGuides, drawGuides, clearGuides, drawOverflowBadges } from "./guides";

const FNS: any = fabricNS; // normalize later

const A4_WIDTH = 595;   // px @ 72dpi
const A4_HEIGHT = 842;

type MapVal = import("fabric").fabric.Object & { __id?: string };

function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let last = 0;
  let timer: any = null;
  return function (this: any, ...args: any[]) {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn.apply(this, args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        last = Date.now();
        fn.apply(this, args);
      }, ms - (now - last));
    }
  } as T;
}

export default function FabricCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<import("fabric").fabric.Canvas | null>(null);
  const objectMap = useRef<Map<string, MapVal>>(new Map());
  const marginLayer = useRef<MapVal | null>(null);
  const pageLayer = useRef<MapVal | null>(null);

  const elements = useDesignerStore((s) => s.elements);
  const tokens = useDesignerStore((s) => s.tokens);
  const selectedId = useDesignerStore((s) => s.selectedId);
  const select = useDesignerStore((s) => s.select);
  const updateFrame = useDesignerStore((s) => s.updateFrame);
  const snapThreshold = useDesignerStore((s) => s.snapThreshold);
  const zoom = useDesignerStore((s) => s.zoom);
  const exportMargins = useDesignerStore((s) => s.exportMargins);

  // mount
  useEffect(() => {
    const el = ref.current;
    const F = (FNS as any)?.fabric ?? (FNS as any);
    if (!el || !F?.Canvas) return;

    const c = new F.Canvas(el, { backgroundColor: "#fff", selection: true });
    c.setWidth(A4_WIDTH);
    c.setHeight(A4_HEIGHT);
    canvasRef.current = c;

    // page frame
    pageLayer.current = new F.Rect({
      left: 0, top: 0, width: A4_WIDTH, height: A4_HEIGHT,
      selectable: false, evented: false, fill: "#ffffff"
    }) as any;
    c.add(pageLayer.current);
    pageLayer.current.moveTo?.(0);

    // initial margins overlay
    const m = exportMargins;
    marginLayer.current = new F.Rect({
      left: m.left, top: m.top,
      width: A4_WIDTH - m.left - m.right,
      height: A4_HEIGHT - m.top - m.bottom,
      stroke: "#e5e7eb", strokeDashArray: [4, 4],
      fill: "rgba(0,0,0,0)", selectable: false, evented: false
    }) as any;
    c.add(marginLayer.current);
    marginLayer.current.moveTo?.(0);

    const onSelection = () => {
      const active = c.getActiveObject() as MapVal | undefined;
      const id = (active as any)?.__id ?? null;
      select(id);
    };
    c.on("selection:created", onSelection);
    c.on("selection:updated", onSelection);
    c.on("selection:cleared", () => select(null));

    // dblclick for inline editing
    c.on("mouse:dblclick", (e: any) => {
      const t = e?.target as any;
      if (t && t.type === "textbox" && typeof t.enterEditing === "function") {
        t.enterEditing();
        t.selectAll();
      }
    });

    // keyboard delete
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Delete" || ev.key === "Backspace") {
        const a = c.getActiveObject() as MapVal | undefined;
        if (a && a.selectable) {
          c.remove(a);
          // update store by removing element
          const id = (a as any).__id;
          if (id) {
            const next = elements.filter((e) => e.id !== id);
            (useDesignerStore.getState() as any).addElement; // touch types
            useDesignerStore.setState((s) => ({ elements: next }));
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      c.dispose?.();
      canvasRef.current = null;
      objectMap.current.clear();
      pageLayer.current = null;
      marginLayer.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // zoom
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    try { c.setZoom(zoom); c.requestRenderAll(); } catch {}
  }, [zoom]);

  // margins overlay update
  useEffect(() => {
    const c = canvasRef.current;
    const F = (FNS as any)?.fabric ?? (FNS as any);
    if (!c || !F) return;
    const m = exportMargins;
    if (!marginLayer.current) return;
    marginLayer.current.set({
      left: m.left, top: m.top,
      width: A4_WIDTH - m.left - m.right,
      height: A4_HEIGHT - m.top - m.bottom
    });
    c.requestRenderAll();
  }, [exportMargins]);

  // tokens-change → only style update
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.getObjects().forEach((o: any) => {
      if (o === marginLayer.current || o === pageLayer.current) return;
      if (o.type === "textbox") {
        o.set({ fontSize: tokens.fontSize, fill: tokens.colorPrimary, fontFamily: tokens.fontFamily });
      }
    });
    c.requestRenderAll();
  }, [tokens]);

  // elements-change → diff instead of rebuild
  useEffect(() => {
    const c = canvasRef.current;
    const F = (FNS as any)?.fabric ?? (FNS as any);
    if (!c || !F?.Canvas) return;

    const present = new Set<string>();
    for (const el of elements) {
      present.add(el.id);
      const exists = objectMap.current.get(el.id);
      if (!exists) {
        // create
        let obj: MapVal;
        if (el.kind === "section") {
          obj = new F.Textbox(el.content || "", {
            left: el.frame.x, top: el.frame.y,
            width: el.frame.width, height: el.frame.height,
            fontSize: tokens.fontSize, fill: tokens.colorPrimary, fontFamily: tokens.fontFamily,
            selectable: true, editable: true, hasControls: true,
            borderColor: "#4f46e5", cornerColor: "#111827",
          }) as MapVal;
        } else {
          obj = new F.Rect({
            left: el.frame.x, top: el.frame.y,
            width: el.frame.width, height: el.frame.height,
            fill: "#e5e7eb", stroke: "#9ca3af",
            selectable: true, hasControls: true
          }) as MapVal;
        }
        obj.__id = el.id;
        c.add(obj);
        objectMap.current.set(el.id, obj);
      } else {
        // update
        exists.set({ left: el.frame.x, top: el.frame.y });
        if ((exists as any).type === "textbox") {
          (exists as any).set({ width: el.frame.width, height: el.frame.height, text: el.content || (exists as any).text });
        } else {
          (exists as any).set({ width: el.frame.width, height: el.frame.height });
        }
      }
    }

    // remove deleted
    for (const [id, obj] of Array.from(objectMap.current.entries())) {
      if (!present.has(id)) {
        c.remove(obj);
        objectMap.current.delete(id);
      }
    }

    c.requestRenderAll();

    const snapMove = (opt: any) => {
      const mv = opt?.target as any;
      if (!mv) return;
      const guides = computeGuides(F, c, mv, snapThreshold);
      // snap to nearest guide if within threshold
      if (guides.length) {
        for (const g of guides) {
          if (g.type === "v") {
            const w = mv.getScaledWidth ? mv.getScaledWidth() : mv.width || 0;
            const cx = (mv.left ?? 0) + w / 2;
            const dCenter = Math.abs(cx - g.pos);
            const dLeft = Math.abs((mv.left ?? 0) - g.pos);
            const dRight = Math.abs(((mv.left ?? 0) + w) - g.pos);
            if (dCenter <= snapThreshold) mv.set("left", Math.round(g.pos - w / 2));
            else if (dLeft <= snapThreshold) mv.set("left", Math.round(g.pos));
            else if (dRight <= snapThreshold) mv.set("left", Math.round(g.pos - w));
          } else {
            const h = mv.getScaledHeight ? mv.getScaledHeight() : mv.height || 0;
            const cy = (mv.top ?? 0) + h / 2;
            const dCenter = Math.abs(cy - g.pos);
            const dTop = Math.abs((mv.top ?? 0) - g.pos);
            const dBottom = Math.abs(((mv.top ?? 0) + h) - g.pos);
            if (dCenter <= snapThreshold) mv.set("top", Math.round(g.pos - h / 2));
            else if (dTop <= snapThreshold) mv.set("top", Math.round(g.pos));
            else if (dBottom <= snapThreshold) mv.set("top", Math.round(g.pos - h));
          }
        }
      }
      drawGuides(F, c, guides);
      c.requestRenderAll();
    };

    const commit = throttle((opt: any) => {
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
      drawOverflowBadges(F, c);
    }, 80);

    c.on("object:moving", snapMove);
    c.on("object:scaling", snapMove);
    c.on("object:modified", commit);
    c.on("mouse:up", () => clearGuides(c));

    // initial badges
    drawOverflowBadges(F, c);

    return () => {
      c.off("object:moving", snapMove);
      c.off("object:scaling", snapMove);
      c.off("object:modified", commit);
    };
  }, [elements, snapThreshold, tokens.fontFamily, tokens.fontSize, tokens.colorPrimary, updateFrame]);

  // selection reflect
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
"""
open(root_out/"FabricCanvas.tsx", "w", encoding="utf-8").write(fabric_canvas_v2)

print("File ready at:", root_out/"FabricCanvas.tsx") ​:contentReference[oaicite:0]{index=0}​
