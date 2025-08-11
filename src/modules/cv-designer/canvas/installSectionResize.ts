import { fabric } from "fabric";

type FObj = fabric.Object & { data?: Record<string, any> };
type G = fabric.Group & { data?: Record<string, any>; _objects?: FObj[] };

const num = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

export function installSectionResize(canvas: fabric.Canvas) {
  const onScaling = (e: fabric.IEvent<Event>) => {
    const g = e.target as G;
    if (!g || g.type !== "group") return;

    const prevCache = g.objectCaching;
    g.objectCaching = false;

    const newW = num(g.width) * num(g.scaleX, 1);
    const newH = num(g.height) * num(g.scaleY, 1);
    g.set({ width: newW, height: newH, scaleX: 1, scaleY: 1 });

    const halfW = newW / 2;
    const halfH = newH / 2;
    const children = (g._objects || []) as FObj[];

    const frame = children.find((c) => c?.data?.isFrame) as fabric.Rect | undefined;
    if (frame) {
      frame.set({ left: -halfW, top: -halfH, width: newW, height: newH, scaleX: 1, scaleY: 1 });
      frame.setCoords();
    }

    const textChildren = children.filter((c) => (c as any).type === "textbox") as (fabric.Textbox & { data?: any })[];

    const secPadT = textChildren.length
      ? Math.max(0, Math.min(...textChildren.map((t) => num(t.data?.padT) - num(t.data?.gapBefore))))
      : 0;
    const secPadB = textChildren.length ? Math.max(...textChildren.map((t) => num(t.data?.padB))) : 0;

    let cursorY = -halfH + secPadT;
    let contentHeight = secPadT;

    textChildren
      .sort((a, b) => num(a.data?.order, 0) - num(b.data?.order, 0))
      .forEach((tb) => {
        const padL = num(tb.data?.padL, 0);
        const padR = num(tb.data?.padR, 0);
        const indentPx = num(tb.data?.indentPx, 0);
        const gapBefore = num(tb.data?.gapBefore, 0);

        const availW = Math.max(1, newW - padL - padR - indentPx);
        const left = -halfW + padL + indentPx;

        cursorY += gapBefore;
        contentHeight += gapBefore;

        (tb as any).set({ left, top: cursorY, width: availW, scaleX: 1, scaleY: 1 });
        (tb as any)._clearCache?.();
        (tb as any).initDimensions?.();
        (tb as any).setCoords();

        const br = (tb as any).getBoundingRect(true, true);
        cursorY += br.height;
        contentHeight += br.height;
      });

    contentHeight += secPadB;

    const minH = num(g.data?.minHeight, 32);
    const finalH = Math.max(minH, contentHeight);
    g.set({ height: finalH });

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
