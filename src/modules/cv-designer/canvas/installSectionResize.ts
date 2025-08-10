// src/modules/cv-designer/canvas/installSectionResize.ts
import { fabric } from "fabric";

/**
 * Scale→Resize: Gruppen-Scale wird in width/height überführt.
 * Text wird nie skaliert; Umbruch nur via 'width'.
 * Anchored-Padding (px) + optionales Flow-Layout (order/gapBefore).
 * Auto-Height: Gruppenhöhe passt sich nach Layout dem Inhalt an.
 */

type WithData = fabric.Object & {
  data?: Record<string, any>;
  __ratiosComputed?: boolean;
  __baseW?: number;
  __baseH?: number;
};

function asNum(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function installSectionResize(canvas: fabric.Canvas) {
  const onScaling = (e: fabric.IEvent<Event>) => {
    const target = e.target as any;
    if (!target || target.type !== "group") return;

    // Cache sanft deaktivieren für flüssiges Resizing
    const prevCache = target.objectCaching;
    target.objectCaching = false;

    const nw = asNum(target.width, 0) * asNum(target.scaleX, 1);
    const nh = asNum(target.height, 0) * asNum(target.scaleY, 1);

    target.set({ width: nw, height: nh, scaleX: 1, scaleY: 1 });

    // Content-Breite & Anchoring
    const padL = asNum(target.data?.padL, 0); // optional auf Gruppenebene
    const padR = asNum(target.data?.padR, 0);
    const contentWidth = Math.max(1, nw - padL - padR);
    const halfW = nw / 2;

    // Reflow aller Kinder
    let yCursor = -nh / 2;
    const children: any[] = (target._objects || []).slice();

    // Frame-Rect (falls vorhanden) an den Anfang erwarten:
    const frame = children.find((c) => c?.data?.isFrame);
    if (frame) {
      frame.set({
        left: -nw / 2,
        top: -nh / 2,
        width: nw,
        height: nh,
        scaleX: 1,
        scaleY: 1,
      });
      frame.setCoords();
    }

    const textChildren = children.filter((c) => c?.type === "textbox");

    // Flow-Layout: in definierter Reihenfolge, mit Abständen
    textChildren
      .sort((a: any, b: any) => asNum(a.data?.order, 0) - asNum(b.data?.order, 0))
      .forEach((child: any) => {
        const indentPx = asNum(child.data?.indentPx, 0);
        const padT = asNum(child.data?.padT, 0);
        const padB = asNum(child.data?.padB, 0);

        const cw = Math.max(1, contentWidth - indentPx);
        const tlX = -halfW + padL + indentPx;

        // vertikale Positionierung (Flow)
        if (child.data?.flow) {
          yCursor += padT;
          child.set({ left: tlX, top: yCursor, width: cw, scaleX: 1, scaleY: 1 });
          child._clearCache?.();
          child.initDimensions?.();
          child.setCoords();
          const br = child.getBoundingRect(true, true);
          yCursor += br.height + padB + asNum(child.data?.gapBefore, 0);
        } else {
          // Absolut platzierte Kinder beibehalten (nur Breite anpassen)
          child.set({ left: tlX, width: cw, scaleX: 1, scaleY: 1 });
          child._clearCache?.();
          child.initDimensions?.();
          child.setCoords();
        }
      });

    // Auto-Height (mindestens minHeight)
    const minH = asNum(target.data?.minHeight, 32);
    const computedHeight = Math.max(minH, yCursor + nh / 2);
    target.set({ height: computedHeight });

    target.setCoords();
    canvas.requestRenderAll();

    // Cache-Flag wiederherstellen
    target.objectCaching = prevCache;
  };

  const onModified = (e: fabric.IEvent<Event>) => {
    const target = e.target as fabric.Group;
    if (!target || target.type !== "group") return;

    // Sicherheit: Koordinaten neu setzen
    target.setCoords();
    (target._objects || []).forEach((child: any) => child?.setCoords?.());
    canvas.requestRenderAll();
  };

  canvas.on("object:scaling", onScaling);
  canvas.on("object:modified", onModified);
}
