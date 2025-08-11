import { fabric } from "fabric";
import { useDesignerStore } from "../store/designerStore";

type FObj = fabric.Object & { data?: Record<string, any> };
type G = fabric.Group & { data?: Record<string, any>; _objects?: FObj[] };

const num = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const FUDGE_Y = 2;

function persistSectionRect(sectionId: string, rect: { x: number; y: number; width: number; height: number }) {
  // tolerant gegen unterschiedliche Store-APIs
  const st: any = (useDesignerStore as any)?.getState?.() || null;
  if (!st) return;
  if (typeof st.updateSectionRect === "function") {
    st.updateSectionRect(sectionId, rect);
  } else {
    if (typeof st.setSectionPosition === "function") st.setSectionPosition(sectionId, rect.x, rect.y);
    if (typeof st.setSectionSize === "function") st.setSectionSize(sectionId, rect.width, rect.height);
    if (typeof st.updateSectionById === "function") st.updateSectionById(sectionId, { x: rect.x, y: rect.y, width: rect.width, height: rect.height });
  }
  if (typeof st.bump === "function") st.bump(); // optionaler Render-Trigger
}

export function installSectionResize(canvas: fabric.Canvas) {
  const layoutPass = (g: G) => {
    const newW = num(g.width) * num(g.scaleX, 1);
    const newH = num(g.height) * num(g.scaleY, 1);
    g.set({ width: newW, height: newH, scaleX: 1, scaleY: 1 });

    const padL = num(g.data?.padL, 0);
    const padR = num(g.data?.padR, 0);
    const secPadT = num(g.data?.secPadT, 0);
    const secPadB = num(g.data?.secPadB, 0);

    const children = (g._objects || []) as FObj[];
    const frame = children.find((c) => c?.data?.isFrame) as fabric.Rect | undefined;
    const hitArea = children.find((c) => c?.data?.isHitArea) as fabric.Rect | undefined;
    const textChildren = children.filter((c) => (c as any).type === "textbox") as (fabric.Textbox & { data?: any })[];

    // Pass 1: Breite setzen + Höhe messen
    const contentWidthBase = Math.max(1, newW - padL - padR);
    const measuredHeights: number[] = [];
    const gaps: number[] = [];

    textChildren
      .sort((a, b) => num(a.data?.order, 0) - num(b.data?.order, 0))
      .forEach((tb, idx) => {
        const indentPx = num(tb.data?.indentPx, 0);
        const cw = Math.max(1, contentWidthBase - indentPx);

        (tb as any).set({ width: cw, scaleX: 1, scaleY: 1 });
        (tb as any)._clearCache?.();
        (tb as any).initDimensions?.();

        const br = (tb as any).getBoundingRect(true, true);
        measuredHeights[idx] = br.height;
        gaps[idx] = num(tb.data?.gapBefore, 0);
      });

    // Endhöhe bestimmen
    const contentHeight =
      secPadT + gaps.reduce((a, g) => a + g, 0) + measuredHeights.reduce((a, h) => a + h, 0) + secPadB + FUDGE_Y;
    const minH = num(g.data?.minHeight, 32);
    const finalH = Math.max(minH, contentHeight);

    // Pass 2: Positionen setzen
    const halfW = newW / 2;
    const halfH = finalH / 2;
    let cursorY = -halfH + secPadT;

    textChildren.forEach((tb, idx) => {
      const indentPx = num(tb.data?.indentPx, 0);
      const left = -halfW + padL + indentPx;
      cursorY += gaps[idx];
      (tb as any).set({ left, top: cursorY, scaleX: 1, scaleY: 1 });
      (tb as any).setCoords();
      cursorY += measuredHeights[idx];
    });

    g.set({ height: finalH });

    if (frame) {
      frame.set({ left: -halfW, top: -halfH, width: newW, height: finalH, scaleX: 1, scaleY: 1 });
      frame.setCoords();
    }
    if (hitArea) {
      hitArea.set({ left: -halfW, top: -halfH, width: newW, height: finalH, scaleX: 1, scaleY: 1 });
      hitArea.setCoords();
    }

    g.setCoords();
    canvas.requestRenderAll();

    // Persistieren (Größe)
    const sid = (g as any).sectionId || g.data?.sectionId;
    if (sid) persistSectionRect(String(sid), { x: g.left ?? 0, y: g.top ?? 0, width: newW, height: finalH });
  };

  const onScaling = (e: fabric.IEvent<Event>) => {
    const g = e.target as G;
    if (!g || g.type !== "group") return;
    const prevCache = g.objectCaching;
    g.objectCaching = false;

    layoutPass(g);

    g.objectCaching = prevCache;
  };

  const onModified = (e: fabric.IEvent<Event>) => {
    const g = e.target as G;
    if (!g || g.type !== "group") return;

    // Persistieren (Position) + Koordinaten
    const sid = (g as any).sectionId || g.data?.sectionId;
    if (sid) {
      // width/height stammen bereits aus letztem layoutPass()
      const w = num(g.width, 0);
      const h = num(g.height, 0);
      persistSectionRect(String(sid), { x: num(g.left, 0), y: num(g.top, 0), width: w, height: h });
    }

    g.setCoords();
    (g._objects || []).forEach((ch: any) => ch?.setCoords?.());
    canvas.requestRenderAll();
  };

  canvas.on("object:scaling", onScaling);
  canvas.on("object:modified", onModified);
}
