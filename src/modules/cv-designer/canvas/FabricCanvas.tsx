// src/modules/cv-designer/canvas/FabricCanvas.tsx
import React, { useEffect, useRef } from "react";
import fabricNS from "@/lib/fabric-shim";
import { useDesignerStore } from "../store/designerStore";
import { computeGuides, drawGuides, clearGuides, drawOverflowBadges } from "./guides";
import { genId } from "@/lib/id";

const fabric = fabricNS as unknown as typeof import("fabric");

const A4_WIDTH = 595;  // px @ 72dpi
const A4_HEIGHT = 842;

function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let last = 0;
  let t: any = null;
  return function (this: any, ...args: any[]) {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn.apply(this, args);
    } else {
      clearTimeout(t);
      t = setTimeout(() => {
        last = Date.now();
        fn.apply(this, args);
      }, ms - (now - last));
    }
  } as T;
}

// Compute overflow + near-margin warnings and update store
function recomputePreflight(fcanvas: any) {
  try {
    const W = fcanvas.getWidth?.() ?? A4_WIDTH;
    const H = fcanvas.getHeight?.() ?? A4_HEIGHT;
    const { exportMargins, setOverflowIds, setMarginWarnIds } = (useDesignerStore as any).getState();

    const m = exportMargins || { top: 28.35, right: 28.35, bottom: 28.35, left: 28.35 };
    const overflow: string[] = [];
    const near: string[] = [];

    (fcanvas.getObjects() as any[]).forEach((o: any) => {
      if (!o || !o.selectable || o.name === "__guide__" || o.name === "__overflow_badge__") return;
      const l = o.left ?? 0;
      const t = o.top ?? 0;
      const w = o.getScaledWidth?.() ?? o.width ?? 0;
      const h = o.getScaledHeight?.() ?? o.height ?? 0;
      const id = o?.data?.id;
      const isOverflow = l < 0 || t < 0 || l + w > W || t + h > H;
      if (isOverflow && id) overflow.push(id);

      const nearMargin =
        l < m.left ||
        t < m.top ||
        l + w > W - m.right ||
        t + h > H - m.bottom;
      if (!isOverflow && nearMargin && id) near.push(id);

      // Visual overflow hint
      o.set({ stroke: isOverflow ? "#ef4444" : undefined, strokeWidth: isOverflow ? 1 : 0 });
    });

    setOverflowIds(overflow);
    setMarginWarnIds(near);
    fcanvas.requestRenderAll();
  } catch (e) {
    console.warn("[FabricCanvas] preflight recompute failed", e);
  }
}

export default function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Read current elements, zoom and actions from store
  const elements = useDesignerStore((s) => s.elements);
  const updateFrame = useDesignerStore((s) => s.updateFrame);
  const select = useDesignerStore((s) => s.select);
  const zoom = useDesignerStore((s) => s.zoom);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fcanvas = new (fabric as any).Canvas(canvasRef.current, {
      backgroundColor: "#ffffff",
      width: A4_WIDTH,
      height: A4_HEIGHT,
      selection: true,
      preserveObjectStacking: true,
    });

    // Apply zoom from store
    fcanvas.setZoom(zoom);
    (useDesignerStore as any).subscribe(
      (s: any) => {
        try {
          fcanvas.setZoom(s.zoom);
          fcanvas.requestRenderAll();
        } catch {}
      }
    );

    // Ensure IDs for new objects
    fcanvas.on("object:added", (e: any) => {
      try {
        const obj: any = e?.target;
        if (!obj) return;
        const data = (obj.data = obj.data || {});
        if (!data.id) data.id = genId("el");
      } catch {}
    });

    // Snapping with guides on moving
    const handleMove = throttle((e: any) => {
      const obj: any = e?.target;
      if (!obj) return;
      const thr: number = (useDesignerStore as any).getState().snapThreshold ?? 6;
      try {
        const guides = computeGuides(fabric as any, fcanvas, obj, thr);
        drawGuides(fabric as any, fcanvas, guides);

        // Center/edge snap (hard snap on first vertical/horizontal guide found)
        const w = obj.getScaledWidth ? obj.getScaledWidth() : obj.width || 0;
        const h = obj.getScaledHeight ? obj.getScaledHeight() : obj.height || 0;

        const vg = guides.find((g) => g.type === "v");
        const hg = guides.find((g) => g.type === "h");
        if (vg && typeof vg.pos === "number") {
          if ((vg.kind as any).includes("center")) obj.set("left", Math.round(vg.pos - w / 2));
          else if ((vg.kind as any).includes("left")) obj.set("left", Math.round(vg.pos));
          else if ((vg.kind as any).includes("right")) obj.set("left", Math.round(vg.pos - w));
        }
        if (hg && typeof hg.pos === "number") {
          if ((hg.kind as any).includes("center")) obj.set("top", Math.round(hg.pos - h / 2));
          else if ((hg.kind as any).includes("top")) obj.set("top", Math.round(hg.pos));
          else if ((hg.kind as any).includes("bottom")) obj.set("top", Math.round(hg.pos - h));
        }
        fcanvas.requestRenderAll();
      } catch (err) {
        console.warn("[FabricCanvas] moving/snap error", err);
      }
    }, 16);

    const handleModified = throttle((e: any) => {
      const obj: any = e?.target;
      if (!obj) return;
      const id = obj?.data?.id;
      if (!id) return;
      const width = obj.getScaledWidth ? obj.getScaledWidth() : obj.width;
      const height = obj.getScaledHeight ? obj.getScaledHeight() : obj.height;
      updateFrame(id, {
        x: obj.left || 0,
        y: obj.top || 0,
        width: width || 0,
        height: height || 0,
      });

      // Recompute overflow + badges after updates
      recomputePreflight(fcanvas);
      drawOverflowBadges(fabric as any, fcanvas);
    }, 120);

    fcanvas.on("object:moving", handleMove);
    fcanvas.on("object:scaling", handleModified);
    fcanvas.on("object:rotating", handleModified);
    fcanvas.on("object:modified", handleModified);

    fcanvas.on("mouse:up", () => {
      // Clear guides on release, redraw overflow badges
      clearGuides(fcanvas);
      recomputePreflight(fcanvas);
      drawOverflowBadges(fabric as any, fcanvas);
    });

    fcanvas.on("selection:created", (e: any) => {
      const obj: any = e?.target;
      select(obj?.data?.id ?? null);
    });
    fcanvas.on("selection:updated", (e: any) => {
      const obj: any = e?.target;
      select(obj?.data?.id ?? null);
    });
    fcanvas.on("selection:cleared", () => select(null));

    // Render current elements (text/image)
    const addText = (text: string, frame: { x: number; y: number; width: number; height: number }, id: string) => {
      const tb = new (fabric as any).Textbox(text || "", {
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
        fontSize: 14,
        fill: "#111827",
        hasControls: true,
        selectable: true,
        editable: true,
      });
      tb.set("data", { id });
      fcanvas.add(tb);
    };

    const addImage = (src: string, frame: { x: number; y: number; width: number; height: number }, id: string) => {
      if (!src || typeof src !== "string") {
        const rect = new (fabric as any).Rect({
          left: frame.x,
          top: frame.y,
          width: frame.width,
          height: frame.height,
          fill: "#e5e7eb",
          stroke: "#f59e0b",
        });
        rect.set("data", { id });
        fcanvas.add(rect);
        return;
      }
      try {
        (fabric as any).Image.fromURL(
          src,
          (img: any) => {
            if (!img) return;
            const iw = img.width || 1;
            const ih = img.height || 1;
            img.set({
              left: frame.x,
              top: frame.y,
              scaleX: frame.width / iw,
              scaleY: frame.height / ih,
              selectable: true,
            });
            img.set("data", { id });
            fcanvas.add(img);
            fcanvas.requestRenderAll();
          },
          { crossOrigin: "anonymous" }
        );
      } catch (e) {
        console.warn("[FabricCanvas] image load failed:", e);
        const rect = new (fabric as any).Rect({
          left: frame.x,
          top: frame.y,
          width: frame.width,
          height: frame.height,
          fill: "#e5e7eb",
          stroke: "#f59e0b",
        });
        rect.set("data", { id });
        fcanvas.add(rect);
      }
    };

    elements.forEach((el) => {
      if (el.kind === "section") {
        addText(el.content, el.frame, el.id);
      } else if (el.kind === "photo") {
        addImage(el.src, el.frame, el.id);
      }
    });

    // Initial preflight pass
    recomputePreflight(fcanvas);
    drawOverflowBadges(fabric as any, fcanvas);

    return () => {
      try {
        fcanvas.dispose();
      } catch {}
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={A4_WIDTH}
        height={A4_HEIGHT}
        style={{ border: "1px solid #e5e7eb", background: "#ffffff" }}
      />
    </div>
  );
}
