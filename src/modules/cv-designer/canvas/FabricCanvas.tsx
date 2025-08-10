import React, { useEffect, useMemo, useRef } from "react";
// Defensive import that works with both ESM and UMD builds of fabric under Vite/HMR
// Some builds expose `fabric` as a named export, others as default, and others as the module itself.
// We normalize it to a single `fabric` object.
import * as FabricNS from "fabric";

type AnyFabric = any;
const fabric: AnyFabric = (FabricNS as any).fabric ?? (FabricNS as any).default ?? (FabricNS as any);

// ---- Types the canvas expects (keep minimal + tolerant) --------------------
export type CanvasTextElement = {
  id: string;
  type: "text";
  x: number;
  y: number;
  w?: number;
  h?: number;
  text?: string | null;
  fontSize?: number;
  fontFamily?: string;
  align?: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  lineHeight?: number;
  opacity?: number;
  fill?: string;
  visible?: boolean;
};

export type FabricCanvasProps = {
  width: number;
  height: number;
  zoom?: number; // in %
  background?: string;
  elements?: CanvasTextElement[]; // may be undefined → handled defensively
  onReady?: (canvas: any) => void;
};

const DEBUG = String(import.meta.env?.VITE_DEBUG_DESIGNER_SYNC ?? "").toLowerCase() === "true";
const log = (...args: any[]) => { if (DEBUG) console.log("[FabricCanvas]", ...args); };
const warn = (...args: any[]) => { if (DEBUG) console.warn("[FabricCanvas]", ...args); };

// ---- Component -------------------------------------------------------------
const FabricCanvas: React.FC<FabricCanvasProps> = (props) => {
  const { width, height, zoom = 100, background = "#ffffff", elements = [], onReady } = props;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<any | null>(null);

  // Ensure width/height are positive to avoid fabric internal assertions
  const [safeW, safeH, safeZoom] = useMemo(() => {
    const w = Number.isFinite(width) && width > 0 ? Math.round(width) : 794;  // A4 width @ ~96dpi
    const h = Number.isFinite(height) && height > 0 ? Math.round(height) : 1123;
    const z = Number.isFinite(zoom) && zoom > 0 ? zoom : 100;
    return [w, h, z];
  }, [width, height, zoom]);

  // --- Mount: create a fresh <canvas> and Fabric instance, cleanup on unmount
  useEffect(() => {
    const host = wrapperRef.current;
    if (!host) return;

    // guard: don't double-init within same mount
    if (fabricRef.current) {
      warn("init skipped: instance already present");
      return;
    }

    // create a fresh canvas element so Fabric never sees a previously-initialized node
    const el = document.createElement("canvas");
    el.width = safeW;
    el.height = safeH;
    el.style.width = safeW + "px";
    el.style.height = safeH + "px";
    el.setAttribute("data-fabric", "cv-designer");
    host.appendChild(el);
    canvasElRef.current = el;

    // instantiate fabric on *this* fresh element
    let instance: any;
    try {
      instance = new fabric.Canvas(el, {
        selection: false,
        preserveObjectStacking: true,
        renderOnAddRemove: true,
      });
    } catch (e) {
      console.error("Failed to initialize fabric.Canvas:", e);
      // cleanup the DOM node to avoid leaving a zombie element
      try { host.removeChild(el); } catch {}
      canvasElRef.current = null;
      return;
    }

    fabricRef.current = instance;

    // set base background
    try {
      instance.setBackgroundColor(background, () => instance.requestRenderAll());
    } catch { /* no-op */ }

    // apply initial zoom
    try {
      instance.setZoom(safeZoom / 100);
    } catch { /* no-op */ }

    log("initialized", { size: { w: safeW, h: safeH }, zoom: safeZoom });
    onReady?.(instance);

    return () => {
      // dispose fabric and remove element
      try {
        instance.dispose();
      } catch (e) {
        warn("dispose error (ignored)", e);
      }
      try {
        if (host.contains(el)) host.removeChild(el);
      } catch { /* no-op */ }

      // clear refs
      fabricRef.current = null;
      canvasElRef.current = null;

      log("disposed");
    };
    // we intentionally *don't* include safeW/safeH/safeZoom in deps to avoid re-init.
    // Those are handled in dedicated effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Keep size in sync (without re-instantiating)
  useEffect(() => {
    const el = canvasElRef.current;
    const inst = fabricRef.current;
    if (!el || !inst) return;
    if (el.width !== safeW || el.height !== safeH) {
      el.width = safeW;
      el.height = safeH;
      el.style.width = safeW + "px";
      el.style.height = safeH + "px";
      try { inst.setWidth(safeW); inst.setHeight(safeH); } catch {}
      inst.requestRenderAll();
      log("resized", { w: safeW, h: safeH });
    }
  }, [safeW, safeH]);

  // --- Keep zoom in sync
  useEffect(() => {
    const inst = fabricRef.current;
    if (!inst) return;
    try {
      inst.setZoom(safeZoom / 100);
      inst.requestRenderAll();
      log("zoom", safeZoom);
    } catch { /* no-op */ }
  }, [safeZoom]);

  // --- Render elements
  useEffect(() => {
    const inst = fabricRef.current;
    if (!inst) return;
    const list = Array.isArray(elements) ? elements : [];

    // wipe previous objects (simple but safe; optimize later with diffing)
    try {
      const toRemove = inst.getObjects();
      if (toRemove && toRemove.length) inst.remove(...toRemove);
    } catch { /* no-op */ }

    // add all elements
    list.forEach((el) => {
      if (!el) return;
      if (el.type !== "text") return; // extend for shapes/images later

      const txt = (el.text ?? "").toString();
      const isEmpty = txt.trim().length === 0;
      const content = isEmpty ? " " : txt; // fabric refuses empty strings → render space

      const obj = new fabric.Textbox(content, {
        left: Math.round(el.x ?? 0),
        top: Math.round(el.y ?? 0),
        width: Math.max(10, Math.round(el.w ?? 0)),
        // height is auto-calculated by fabric; set minimum lineHeight for visibility
        fill: el.fill ?? "#111111",
        fontSize: Math.round(el.fontSize ?? 14),
        fontFamily: el.fontFamily ?? "Inter, Arial, sans-serif",
        fontStyle: el.italic ? "italic" : "normal",
        fontWeight: el.bold ? 700 : 400,
        underline: !!el.underline,
        textAlign: el.align ?? "left",
        lineHeight: el.lineHeight ?? 1.2,
        opacity: el.opacity ?? 1,
        visible: el.visible !== false,
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
      } as any);

      try { inst.add(obj); } catch (e) { warn("add error", e); }
    });

    try { inst.requestRenderAll(); } catch {}
    log("rendered elements", list.length);
  }, [elements]);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: safeW,
        height: safeH,
        background,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.05) inset",
      }}
    />
  );
};

export default FabricCanvas;
