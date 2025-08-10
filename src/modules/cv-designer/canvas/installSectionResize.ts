import { fabric } from "fabric";

// Normalize group scaling to real resize and trigger child reflow
export function installSectionResize(canvas: fabric.Canvas) {
  const onScaling = (e: fabric.IEvent<Event>) => {
    const group = e.target as fabric.Group;
    if (!group || group.type !== "group") return;

    // smooth drag without cache artifacts
    const prevCache = group.objectCaching;
    group.objectCaching = false;

    const nw = (group.width ?? 0) * (group.scaleX ?? 1);
    const nh = (group.height ?? 0) * (group.scaleY ?? 1);

    group.set({ width: nw, height: nh, scaleX: 1, scaleY: 1 });

    // reflow children
    const padL = Number((group as any).data?.padL ?? 0);
    const padR = Number((group as any).data?.padR ?? 0);
    const contentWidth = Math.max(1, nw - padL - padR);
    const halfW = nw / 2;

    (group._objects || []).forEach((child: any) => {
      if (child.type === "textbox") {
        const indentPx = Number(child.data?.indentPx ?? 0);
        const w = Math.max(1, contentWidth - indentPx);
        const tlX = -halfW + padL + indentPx;
        child.set({ left: tlX, width: w, scaleX: 1, scaleY: 1 });
        child._clearCache?.();
        child.initDimensions?.();
        child.setCoords();
      } else {
        // keep ratio within content box
        const cl = -halfW + padL;
        const cr = halfW - padR;
        const cw = Math.max(1, cr - cl);
        const relX = (child.left ?? 0) / (group.width || 1);
        const relW = (child.width || 0) / (group.width || 1);
        child.set({
          left: cl + relX * cw,
          scaleX: 1,
          scaleY: 1,
        });
        child.setCoords();
      }
    });

    group.setCoords();
    canvas.requestRenderAll();
    // restore cache flag after render
    group.objectCaching = prevCache;
  };

  const onModified = (e: fabric.IEvent<Event>) => {
    const group = e.target as fabric.Group;
    if (!group || group.type !== "group") return;
    group.setCoords();
    canvas.requestRenderAll();
  };

  canvas.on("object:scaling", onScaling);
  canvas.on("object:modified", onModified);
}
