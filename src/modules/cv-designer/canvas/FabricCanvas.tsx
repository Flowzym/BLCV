
import React, { useEffect, useRef } from "react";

/**
 * Defensive import for fabric.js that works with both ESM v5 (`{ fabric }`)
 * and UMD/CommonJS builds (default export).
 */
// @ts-ignore - typings differ across builds
import * as FabricNS from "fabric";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fabric: any =
  // ESM build: { fabric }
  // @ts-ignore
  (FabricNS as any).fabric ??
  // Some bundlers expose default
  // @ts-ignore
  (FabricNS as any).default ??
  // Fallback: namespace itself
  (FabricNS as any);

const DEBUG =
  // @ts-ignore - Vite provides import.meta.env
  (typeof import.meta !== "undefined" &&
    import.meta?.env?.VITE_DEBUG_DESIGNER_SYNC === "true");

/** Basic element model the designer feeds into the canvas. Extend as needed. */
export type TextElement = {
  id: string;
  type: "text";
  x: number;
  y: number;
  w?: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  align?: "left" | "center" | "right" | "justify";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  lineHeight?: number;
  opacity?: number;
  visible?: boolean;
};

export type CanvasElement = TextElement; // extend with other element types when needed

export interface FabricCanvasProps {
  width: number;
  height: number;
  zoom: number; // percent, e.g., 100 = 1.0
  background?: string;
  elements: CanvasElement[];
  /**
   * Optional callback to expose the underlying fabric.Canvas instance.
   */
  onReady?: (canvas: any) => void;
}

/**
 * FabricCanvas
 * - Initializes fabric.Canvas exactly once per mount
 * - Uses a dedicated wrapper DIV and creates/removes a <canvas> node manually to avoid
 *   "already initialized" errors (esp. with React 18 StrictMode double-invoke & HMR)
 * - Applies zoom via a separate effect
 * - Renders text elements with safe fallbacks (space for empty strings)
 */
const FabricCanvas: React.FC<FabricCanvasProps> = ({
  width,
  height,
  zoom,
  background = "#ffffff",
  elements,
  onReady
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const nodeRef = useRef<HTMLCanvasElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canvasRef = useRef<any | null>(null);

  // Mount / Unmount (create & dispose real <canvas> and fabric.Canvas)
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Ensure host is empty (important for HMR/StrictMode remounts)
    while (host.firstChild) {
      host.removeChild(host.firstChild);
    }

    // Create a fresh <canvas> element every time we mount
    const cnv = document.createElement("canvas");
    cnv.setAttribute("data-fabric-root", "1");
    cnv.width = Math.max(1, Math.floor(width));
    cnv.height = Math.max(1, Math.floor(height));

    host.appendChild(cnv);
    nodeRef.current = cnv;

    // Initialize fabric.Canvas on this brand-new node
    const canvas = new fabric.Canvas(cnv, {
      backgroundColor: background,
      selection: false,
      preserveObjectStacking: true
    });

    canvas.setHeight(height);
    canvas.setWidth(width);
    canvasRef.current = canvas;

    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log("[FabricCanvas] init", { width, height, background });
    }

    onReady?.(canvas);

    return () => {
      try {
        if (DEBUG) {
          // eslint-disable-next-line no-console
          console.log("[FabricCanvas] dispose");
        }
        // Dispose fabric instance
        canvasRef.current?.dispose();
      } catch (_) {
        // ignore
      } finally {
        canvasRef.current = null;
      }

      // Remove the <canvas> node entirely so fabric never sees a reused node
      if (nodeRef.current && nodeRef.current.parentNode) {
        try {
          nodeRef.current.parentNode.removeChild(nodeRef.current);
        } catch {
          /* ignore */
        }
      }
      nodeRef.current = null;

      // As an extra guard, empty the host
      if (hostRef.current) {
        while (hostRef.current.firstChild) {
          hostRef.current.removeChild(hostRef.current.firstChild);
        }
      }
    };
    // Only run on mount/unmount. Width/height updates handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep canvas size in sync
  useEffect(() => {
    const canvas = canvasRef.current;
    const node = nodeRef.current;
    if (!canvas || !node) return;

    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log("[FabricCanvas] resize", { width, height });
    }

    node.width = Math.max(1, Math.floor(width));
    node.height = Math.max(1, Math.floor(height));
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.calcOffset();
    canvas.requestRenderAll();
  }, [width, height]);

  // Apply zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // convert percent to factor
    const factor = Math.max(0.1, (isFinite(zoom) ? zoom : 100) / 100);
    canvas.setZoom(factor);
    canvas.requestRenderAll();

    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log("[FabricCanvas] zoom", { zoom, factor });
    }
  }, [zoom]);

  // Render elements (simple re-create strategy for robustness)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log("[FabricCanvas] render elements", elements);
    }

    // Clear everything and re-add (safe & simple; can be optimized later)
    canvas.getObjects().forEach((o: any) => canvas.remove(o));

    elements.forEach((el) => {
      if (el.type === "text") {
        const text = (el.text ?? "").toString();
        // Fabric renders nothing for truly empty string, so add a space as fallback
        const safeText = text.trim().length > 0 ? text : " ";

        const textbox = new fabric.Textbox(safeText, {
          left: Math.round(el.x),
          top: Math.round(el.y),
          width: el.w ? Math.max(1, Math.round(el.w)) : undefined,
          fontSize: el.fontSize ?? 14,
          fontFamily: el.fontFamily ?? "Inter, Arial, sans-serif",
          fill: el.fill ?? "#111111",
          textAlign: el.align ?? "left",
          fontWeight: el.bold ? "bold" : "normal",
          fontStyle: el.italic ? "italic" : "normal",
          underline: !!el.underline,
          lineHeight: el.lineHeight ?? 1.2,
          opacity: el.opacity ?? 1,
          visible: el.visible ?? true,
          selectable: false,
          evented: false,
          hoverCursor: "default",
          // Ensure minimum height so tiny/empty boxes still show a baseline
          // @ts-ignore - property exists on fabric.Textbox options
          minHeight: 20
        });

        // lock movement/transform in designer preview
        textbox.lockScalingFlip = true;
        textbox.lockRotation = true;
        textbox.lockScalingX = true;
        textbox.lockScalingY = true;
        textbox.lockMovementX = true;
        textbox.lockMovementY = true;

        canvas.add(textbox);
      } else {
        if (DEBUG) {
          // eslint-disable-next-line no-console
          console.warn("[FabricCanvas] unknown element type", el);
        }
      }
    });

    canvas.requestRenderAll();
  }, [elements]);

  return (
    <div
      ref={hostRef}
      style={{
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
        background
      }}
      data-testid="fabric-canvas-host"
    />
  );
};

export default FabricCanvas;
