import { fabric } from "fabric";
import { useDesignerStore } from "../store/designerStore";

type FObj = fabric.Object & { data?: Record<string, any> };
type G = fabric.Group & { data?: Record<string, any>; _objects?: FObj[] };

const num = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const FUDGE_Y = 2;

function persistSectionRect(sectionId: string, rect: { x: number; y: number; width: number; height: number }) {
  const st: any = (useDesignerStore as any)?.getState?.() || null;
  if (!st) return;
  const m = st.margins || {};
  const leftM = Number(m.left || 0);
  const topM = Number(m.top || 0);
  rect = { ...rect, x: rect.x, y: rect.y };

  // prefer a single updater if present
  if (typeof st.updateSectionRect === "function") {
    st.updateSectionRect(sectionId, rect);
    return;
  }
  // otherwise fall back to split updaters
  if (typeof st.setSectionPosition === "function") st.setSectionPosition(sectionId, rect.x, rect.y);
  if (typeof st.setSectionSize === "function") st.setSectionSize(sectionId, rect.width, rect.height);
  if (typeof st.updateSectionById === "function") st.updateSectionById(sectionId, { x: rect.x, y: rect.y, width: rect.width, height: rect.height });
  if (typeof st.bump === "function") st.bump();
}

export function installSectionResize(canvas: fabric.Canvas) {
  const layoutPass = (g: G) => {
    const newW = num(g.width) * num(g.scaleX, 1);
    const newH0 = num(g.height) * num(g.scaleY, 1);
    g.set({ width: newW, height: newH0, scaleX: 1, scaleY: 1 });

    const padL = num(g.data?.padL, 0);
    const padR = num(g.data?.padR, 0);
    const secPadT = num(g.data?.secPadT, 0);
    const secPadB = num(g.data?.secPadB, 0);

    const children = (g._objects || []) as FObj[];
    const frame = children.find((c) => c?.data?.isFrame) as fabric.Rect | undefined;
    const hitArea = children.find((c) => c?.data?.isHitArea) as fabric.Rect | undefined;
    const textChildren = children.filter((c) => (c as any).type === "textbox") as (fabric.Textbox & { data?: any })[];

    // Pass 1: width set + height measure
    const contentWidthBase = Math.max(1, newW - padL - padR);
    const heights: number[] = [];
    const gaps: number[] = [];

    textChildren
      .sort((a, b) => num(a.data?.order, 0) - num(b.data?.order, 0))
      .forEach((tb, idx) => {
        const indentPx = num(tb.data?.indentPx, 0);
        const cw = Math.max(1, contentWidthBase - indentPx);
        (tb as any).set({ width: cw, scaleX: 1, scaleY: 1 });
        (tb as any)._clearCache?.();
        (tb as any).initDimensions?.();
        const h = (tb as any).getScaledHeight?.() ?? (tb as any).height ?? 0;
        heights[idx] = Math.max(0, h);
        gaps[idx] = num(tb.data?.gapBefore, 0);
      });

    // Pass 2: local stacking
    let y = -newH0 / 2 + secPadT;
    textChildren.forEach((tb, idx) => {
      const indentPx = num(tb.data?.indentPx, 0);
      const gap = gaps[idx] ?? 0;
      y += gap;
      const x = -newW / 2 + padL + indentPx;
      (tb as any).set({ left: x, top: y, scaleX: 1, scaleY: 1 });
      (tb as any).setCoords?.();
      y += heights[idx] ?? 0;
    });
    y += secPadB;

    const minH = Math.max(num(g.data?.minHeight, 32), y - (-newH0 / 2));
    const finalH = Math.max(minH + FUDGE_Y, newH0);

    if (frame) {
      const halfW = newW / 2;
      const halfH = finalH / 2;
      frame.set({ left: -halfW, top: -halfH, width: newW, height: finalH, scaleX: 1, scaleY: 1 });
      frame.setCoords();
    }
    if (hitArea) {
      const halfW = newW / 2;
      const halfH = finalH / 2;
      hitArea.set({ left: -halfW, top: -halfH, width: newW, height: finalH, scaleX: 1, scaleY: 1 });
      hitArea.setCoords();
    }

    g.set({ width: newW, height: finalH });
    g.setCoords();
    canvas.requestRenderAll();

    // Persist as TOP-LEFT (store format) even though group is centered
    const sid = (g as any).sectionId || g.data?.sectionId;
    if (sid) {
      const m = (useDesignerStore as any)?.getState?.()?.margins || {} as any;
      const leftM = Number((m as any)?.left || 0);
      const topM = Number((m as any)?.top || 0);
      const tlx = num(g.left, 0) - newW / 2 - leftM;
      const tly = num(g.top, 0) - finalH / 2 - topM;
      persistSectionRect(String(sid), { x: tlx, y: tly, width: newW, height: finalH });
    }
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

    g.setCoords();
    (g._objects || []).forEach((ch: any) => ch?.setCoords?.());
    canvas.requestRenderAll();

    const sid = (g as any).sectionId || g.data?.sectionId;
    if (sid) {
      const w = num(g.width, 0);
      const h = num(g.height, 0);
      const m = (useDesignerStore as any)?.getState?.()?.margins || {} as any;
      const leftM = Number((m as any)?.left || 0);
      const topM = Number((m as any)?.top || 0);
      const tlx = num(g.left, 0) - w / 2 - leftM;
      const tly = num(g.top, 0) - h / 2 - topM;
      persistSectionRect(String(sid), { x: tlx, y: tly, width: w, height: h });
    }
  };

  canvas.on("object:scaling", onScaling);
  canvas.on("object:modified", onModified);
}
