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

type Ratio = { left: number; top: number; width: number; height: number };

type Anchored = {
  mode: "anchored";
  padL: number; padT: number; padR: number; padB: number;
  indentPx: number;
  flow?: boolean; order?: number; gapBefore?: number;
};

type Proportional = { mode: "proportional"; ratio: Ratio };
type ChildLayout = Anchored | Proportional;

function isSectionGroup(obj: any): obj is fabric.Group & WithData {
  const d = (obj as any)?.data;
  const hasFlag = d?.sectionId !== undefined || d?.type === "section" || d?.kind === "section";
  return !!obj && obj.type === "group" && hasFlag;
}

function ensureChildLayouts(group: fabric.Group & WithData) {
  const gw = group.width ?? 1;
  const gh = group.height ?? 1;
  const halfW = gw / 2;
  const halfH = gh / 2;

  if (!group.__baseW) group.__baseW = gw;
  if (!group.__baseH) group.__baseH = gh;

  (group._objects || []).forEach((child: any) => {
    if (child.__layout) return;

    if (child.type === "textbox") {
      const padL = Number(child.data?.padL ?? 16);
      const padT = Number(child.data?.padT ?? 12);
      const padR = Number(child.data?.padR ?? 16);
      const padB = Number(child.data?.padB ?? 12);
      const indentPx = Number(child.data?.indentPx ?? 0);
      const flow = Boolean(child.data?.flow ?? true);
      const order = Number(child.data?.order ?? 0);
      const gapBefore = Number(child.data?.gapBefore ?? 0);

      child.__layout = { mode: "anchored", padL, padT, padR, padB, indentPx, flow, order, gapBefore } as Anchored;
    } else {
      const childWidth = (child.width ?? 0) * (child.scaleX ?? 1);
      const childHeight = (child.height ?? 0) * (child.scaleY ?? 1);
      const relLeft = (child.left ?? 0) + halfW;
      const relTop  = (child.top  ?? 0) + halfH;

      const ratio: Ratio = {
        left: gw ? relLeft / gw : 0,
        top:  gh ? relTop  / gh : 0,
        width: gw ? childWidth / gw : 0,
        height: gh ? childHeight / gh : 0,
      };
      child.__layout = { mode: "proportional", ratio } as Proportional;
    }
  });

  (group as WithData).__ratiosComputed = true;
}

function forceTextReflow(tb: any) {
  const txt = tb.text != null ? String(tb.text) : "";
  tb.set("text", txt);
  tb._clearCache?.();
  tb.initDimensions?.();
  tb.dirty = true;
}

/**
 * Layout anwenden + Auto-Height:
 * - Breite setzen → Reflow
 * - Flow stapeln (order + gapBefore)
 * - Gruppenhöhe so setzen, dass Inhalt + unteres Padding (max padB) sauber Platz haben
 */
function applyLayout(group: fabric.Group & WithData, newW: number, newH: number) {
  const halfW = newW / 2;
  const halfH = newH / 2;
  const children = (group._objects || []) as any[];

  // 1) Textbreiten setzen + Reflow
  children.forEach((child) => {
    const layout: ChildLayout | undefined = child.__layout;
    if (!layout) return;

    if (layout.mode === "anchored" && child.type === "textbox") {
      const { padL, padR, indentPx } = layout as Anchored;
      const targetW = Math.max(1, newW - padL - padR - indentPx);

      const next: any = {
        width: targetW,
        scaleX: 1, scaleY: 1,
        angle: 0, skewX: 0, skewY: 0,
        originX: "left", originY: "top",
        objectCaching: false,
      };
      if (child.data?.lineHeight != null && isFinite(child.data.lineHeight) && child.data.lineHeight > 0) {
        next.lineHeight = child.data.lineHeight;
      }
      child.set(next);
      forceTextReflow(child);
    }
  });

  // 2) Flow stapeln
  const flowItems = children.filter((c) => {
    const l: ChildLayout | undefined = c.__layout;
    return c.type === "textbox" && l && l.mode === "anchored" && (l as Anchored).flow;
  }) as (fabric.Textbox & any)[];

  flowItems.sort((a, b) => ((a.__layout as Anchored).order ?? 0) - ((b.__layout as Anchored).order ?? 0));

  let currentTopTL = Math.min(...flowItems.map((c) => (c.__layout as Anchored).padT));
  if (!Number.isFinite(currentTopTL)) currentTopTL = 0;

  // zur Auto-Height-Berechnung
  let contentTopTL = Number.isFinite(currentTopTL) ? currentTopTL : 0;
  let contentBottomTL = contentTopTL;
  let maxPadB = 0;

  flowItems.forEach((tb, idx) => {
    const L = tb.__layout as Anchored;
    if (idx === 0) currentTopTL = L.padT; else currentTopTL += (L.gapBefore ?? 0);

    const tlX = L.padL + L.indentPx;
    const tlY = currentTopTL;

    tb.set({ left: tlX - halfW, top: tlY - halfH });
    tb.setCoords();

    const h = Math.max(0, tb.height ?? tb.getScaledHeight?.() ?? 0);
    const bottom = tlY + h;

    if (idx === 0) contentTopTL = tlY;
    contentBottomTL = Math.max(contentBottomTL, bottom);
    maxPadB = Math.max(maxPadB, L.padB ?? 0);

    currentTopTL = bottom; // nächstes Element direkt darunter (plus evtl. gapBefore beim nächsten Loop-Anfang)
  });

  // 3) übrige (anchored ohne Flow / proportional)
  children.forEach((child) => {
    const layout: ChildLayout | undefined = child.__layout;
    if (!layout) return;

    if (child.type === "textbox") {
      const L = layout as Anchored;
      if (L.mode === "anchored" && !L.flow) {
        const tlX = L.padL + L.indentPx;
        const tlY = L.padT;
        child.set({ left: tlX - halfW, top: tlY - halfH });
        child.setCoords();

        const h = Math.max(0, child.height ?? child.getScaledHeight?.() ?? 0);
        const bottom = tlY + h;
        contentTopTL = Math.min(contentTopTL, tlY);
        contentBottomTL = Math.max(contentBottomTL, bottom);
        maxPadB = Math.max(maxPadB, L.padB ?? 0);
      }
    } else if (layout.mode === "proportional") {
      const r = (layout as Proportional).ratio;
      const tlX = r.left * newW;
      const tlY = r.top  * newH;
      const targetW = Math.max(1, r.width  * newW);
      const targetH = Math.max(1, r.height * newH);

      child.set({ left: tlX - halfW, top: tlY - halfH });
      if (child.type === "rect" || child.type === "image" || child.type === "line" || child.type === "circle" || child.type === "triangle") {
        child.set({ width: targetW, height: targetH, scaleX: 1, scaleY: 1 });
      } else {
        child.set({ scaleX: 1, scaleY: 1 });
      }
      child.setCoords();
    }
  });

  // 4) Auto-Height: Gruppenhöhe auf Inhalt begrenzen/ausweiten
  //    minHeight = 32 verhindert „Einklappen“ auf 0, kann via group.data.minHeight überschrieben werden.
  const minHeight = Math.max(32, Number((group as any).data?.minHeight ?? 0));
  const targetHeight = Math.max(minHeight, (contentBottomTL + maxPadB) - 0 /* contentTopTL ist TL-referenziert */);

  // newW ist bereits korrekt; newH kann durch Auto-Height ersetzt werden
  group.set({ width: newW, height: targetHeight });
  group.setCoords();
}

export function installSectionResize(canvas: fabric.Canvas) {
  let isResizing = false;

  canvas.on("object:scaling", (e) => {
    const target = e.target as fabric.Object & WithData;
    if (!isSectionGroup(target) || isResizing) return;
    isResizing = true;

    if (!target.__ratiosComputed) ensureChildLayouts(target as fabric.Group & WithData);

    const baseW = target.width ?? 0;
    const baseH = target.height ?? 0;
    const newW = Math.max(1, baseW * (target.scaleX ?? 1));
    const newH = Math.max(1, baseH * (target.scaleY ?? 1));

    // Höhe wird in applyLayout ggf. per Auto-Height überschrieben
    target.set({ width: newW, height: newH, scaleX: 1, scaleY: 1 });
    applyLayout(target as fabric.Group & WithData, newW, newH);
    target.__baseW = newW; target.__baseH = target.height ?? newH;

    canvas.requestRenderAll();
    isResizing = false;
  });

  canvas.on("object:modified", (e) => {
    const target = e.target as fabric.Object & WithData;
    if (!isSectionGroup(target)) return;

    (target._objects || []).forEach((child: any) => {
      if (child.type === "textbox") {
        child.set({ objectCaching: true });
        child._clearCache?.();
        child.initDimensions?.();
        child.dirty = true;
      }
      child.setCoords();
    });

    target.setCoords();
    canvas.requestRenderAll();
  });
}
