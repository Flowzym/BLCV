
import React, { useEffect, useMemo, useRef } from 'react';
import { fabric } from 'fabric';

// -----------------------------------------------------------------------------
// Types (self-contained so this file can drop into most codebases)
// -----------------------------------------------------------------------------

export type CanvasTextElement = {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text: string | null | undefined;
  fontFamily?: string;
  fontSize?: number; // px
  lineHeight?: number; // unitless
  fontWeight?: number | string;
  fill?: string; // color
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  visible?: boolean;
  opacity?: number;
};

export type CanvasRectElement = {
  id: string;
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rx?: number;
  ry?: number;
  visible?: boolean;
  opacity?: number;
};

export type CanvasElement = CanvasTextElement | CanvasRectElement;

export interface FabricCanvasProps {
  /** Raw elements to render */
  elements: CanvasElement[];
  /** Unscaled canvas size in pixels */
  width: number;
  height: number;
  /** Percent 100 = 1.0 */
  zoom?: number;
  /** Background color (optional) */
  backgroundColor?: string;
  /** Called once the canvas is ready */
  onReady?: (canvas: fabric.Canvas) => void;
  /** When true (VITE_DEBUG_DESIGNER_SYNC=true), prints verbose logs */
  debug?: boolean;
}

// -----------------------------------------------------------------------------
// Helper utils
// -----------------------------------------------------------------------------

const MIN_W = 20;
const MIN_H = 20;

function isText(el: CanvasElement): el is CanvasTextElement {
  return el.type === 'text';
}

function isRect(el: CanvasElement): el is CanvasRectElement {
  return el.type === 'rect';
}

function toNumberOr<T>(val: any, fallback: T): number | T {
  const n = typeof val === 'string' ? parseFloat(val) : (typeof val === 'number' ? val : NaN);
  return Number.isFinite(n) ? (n as number) : fallback;
}

function safeText(v: any): string {
  // Fabric renders nothing for empty "", so ensure at least a whitespace
  const s = v == null ? '' : String(v);
  return s.trim().length > 0 ? s : ' ';
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

/**
 * FabricCanvas
 * - Initializes fabric.Canvas exactly once per mount.
 * - Disposes cleanly on unmount (and clears __fabricCanvas flag).
 * - Applies zoom updates without re-creating the canvas.
 * - Renders elements in a "clear & rebuild" strategy (stable and simple).
 * - Avoids the dreaded "Trying to initialize a canvas that has already been initialized".
 */
export default function FabricCanvas(props: FabricCanvasProps) {
  const {
    elements,
    width,
    height,
    zoom = 100,
    backgroundColor = '#ffffff',
    onReady,
  } = props;

  // Allow env to toggle debug without wiring prop everywhere
  const debug = props.debug ?? (import.meta as any)?.env?.VITE_DEBUG_DESIGNER_SYNC === 'true';

  const htmlCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const initializedRef = useRef(false);

  // Derived zoom factor
  const z = useMemo(() => {
    const n = toNumberOr(zoom, 100) as number;
    return Math.max(10, Math.min(600, n)) / 100; // clamp between 0.1 and 6.0
  }, [zoom]);

  // ---- Mount / Unmount: create & dispose fabric.Canvas ----------------------
  useEffect(() => {
    const el = htmlCanvasRef.current;
    if (!el) return;

    if (initializedRef.current) {
      // Should not happen with [] deps, but let's be defensive
      if (debug) console.warn('[FabricCanvas] init skipped (already initialized)');
      return;
    }

    // If some prior instance leaked, clean it up
    const anyEl = el as any;
    const leaked: fabric.Canvas | undefined = anyEl.__fabricCanvas;
    if (leaked) {
      try { leaked.dispose(); } catch {}
      delete anyEl.__fabricCanvas;
    }

    // Create the canvas
    const canvas = new fabric.Canvas(el, {
      selection: false,
      backgroundColor,
    });

    // Store references & flags
    fabricRef.current = canvas;
    initializedRef.current = true;
    (el as any).__fabricCanvas = canvas;

    // Resize to the desired size
    canvas.setWidth(width);
    canvas.setHeight(height);

    if (debug) {
      console.log('[FabricCanvas]init', { width, height, backgroundColor });
    }

    // Fire onReady
    onReady?.(canvas);

    // Cleanup
    return () => {
      if (debug) console.log('[FabricCanvas]dispose');
      try {
        canvas.dispose();
      } finally {
        if ((el as any).__fabricCanvas) delete (el as any).__fabricCanvas;
        fabricRef.current = null;
        initializedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Size updates (if width/height change) --------------------------------
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (debug) console.log('[FabricCanvas]size', { width, height });

    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.requestRenderAll();
  }, [width, height, debug]);

  // ---- Zoom updates ----------------------------------------------------------
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const vp = canvas.viewportTransform ?? fabric.iMatrix.concat();
    const prevZoom = canvas.getZoom();
    if (Math.abs(prevZoom - z) < 0.0001) return;

    // Zoom to top-left origin to keep coordinates intuitive
    const point = new fabric.Point(0, 0);
    canvas.zoomToPoint(point, z);

    if (debug) console.log('[FabricCanvas]zoom', { prev: prevZoom, next: z });
  }, [z, debug]);

  // ---- Render elements -------------------------------------------------------
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (debug) {
      console.log('[FabricCanvas]render elements', {
        count: elements.length,
        sample: elements.slice(0, 5),
      });
    }

    // Clear old
    canvas.clear();
    canvas.setBackgroundColor(backgroundColor, () => {});

    // Add objects
    for (const el of elements) {
      if (isText(el)) {
        const txt = new fabric.Textbox(safeText(el.text), {
          left: el.x,
          top: el.y,
          width: Math.max(MIN_W, el.width ?? MIN_W),
          height: Math.max(MIN_H, el.height ?? MIN_H),
          fontFamily: el.fontFamily ?? 'Inter, Arial, sans-serif',
          fontSize: toNumberOr(el.fontSize, 14) as number,
          lineHeight: toNumberOr(el.lineHeight, 1.4) as number,
          fontWeight: el.fontWeight ?? 400,
          fill: el.fill ?? '#111111',
          textAlign: el.textAlign ?? 'left',
          opacity: toNumberOr(el.opacity, 1) as number,
          visible: el.visible !== false,
          editable: false,
          selectable: false,
          hoverCursor: 'default',
        });
        (txt as any).meta = { id: el.id, type: el.type };
        canvas.add(txt);
      } else if (isRect(el)) {
        const rect = new fabric.Rect({
          left: el.x,
          top: el.y,
          width: Math.max(MIN_W, el.width),
          height: Math.max(MIN_H, el.height),
          fill: el.fill ?? 'transparent',
          stroke: el.stroke ?? '#e5e7eb',
          strokeWidth: toNumberOr(el.strokeWidth, 1) as number,
          rx: toNumberOr(el.rx, 0) as number,
          ry: toNumberOr(el.ry, 0) as number,
          opacity: toNumberOr(el.opacity, 1) as number,
          visible: el.visible !== false,
          selectable: false,
          hoverCursor: 'default',
        });
        (rect as any).meta = { id: el.id, type: el.type };
        canvas.add(rect);
      } else {
        if (debug) console.warn('[FabricCanvas]Unknown element', el);
      }
    }

    canvas.requestRenderAll();
  }, [elements, backgroundColor, debug]);

  // ---- Render canvas element -------------------------------------------------
  return (
    <canvas
      ref={htmlCanvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'block',
      }}
    />
  );
}
