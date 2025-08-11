import { fabric } from "fabric";

type FObj = fabric.Object & { data?: Record<string, any> };
type G = fabric.Group & { data?: Record<string, any>; _objects?: FObj[] };

const num = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const FUDGE_Y = 2;

export function installSectionResize(canvas: fabric.Canvas) {
  const onScaling = (e: fabric.IEvent<Event>) => {
    const g = e.target as G;
    if (!g || g.type !== "group") return;

    const prevCache = g.objectCaching;
    g.objectCaching = false;

    // Scale → echte width/height
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

    // ——— Pass 1: Breiten setzen + Höhe messen (ohne endgültige Top-Position) ———
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

    // Gesamthöhe berechnen
    const contentHeight = secPadT + gaps.reduce((a, g) => a + g, 0) + measuredHeights.reduce((a, h) => a + h, 0) + secPadB + FUDGE_Y;
    const minH = num(g.data?.minHeight, 32);
    const finalH = Math.max(minH, contentHeight);

    // ——— Pass 2: Endgültige Positionen relativ zu -finalH/2 setzen ———
    const halfW = newW / 2;
    const halfH = finalH / 2;
    let cursorY = -halfH + secPadT;

    textChildren.forEach((tb, idx) => {
      const indentPx = num(tb.data?.indentPx, 0);
      const left = -halfW + padL + indentPx;

      cursorY += gaps[idx];               // gapBefore
      (tb as any).set({ left, top: cursorY, scaleX: 1, scaleY: 1 });
      (tb as any).setCoords();

      cursorY += measuredHeights[idx];
    });

    // Gruppe & Frames auf finale Höhe bringen
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
    g.objectCaching = prevCache;
  };

  const onModified = (e: fabric.IEvent<Event>) => {
    const g = e.target as G;
    if (!g || g.type !== "group") return;
    g.setCoords();
    (g._objects || []).forEach((ch: any) => ch?.setCoords?.());
    canvas.requestRenderAll();
  };

  canvas.on("object:scaling", onScaling);
  canvas.on("object:modified", onModified);
}
