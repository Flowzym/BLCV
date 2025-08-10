import { fabric } from "fabric";

/**
 * Scale→Resize: Gruppen-Scale wird in width/height überführt.
 * Text wird nie skaliert; Umbruch nur via 'width'.
 * Anchored-Padding (px) + optionales Flow-Layout (order/gapBefore).
 * Auto-Height: Gruppenhöhe passt sich nach Layout dem Inhalt an.
 * WICHTIG: 2-Phasen-Layout, damit halfH immer zur finalen Höhe passt.
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
      const relLeft = (child.left ?? 0) + halfW; // Center→TL
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
 * 2-Phasen-Layout:
 *  Phase A: Breiten setzen, Text reflowen, Flow stapeln → Positionen NUR PLANEN, contentBottom ermitteln.
 *  Phase B: group.height = targetHeight; danach ALLE Kinder mit neuem halfH positionieren.
 */
function applyLayout(group: fabric.Group & WithData, newW: number, newH: number) {
  const children = (group._objects || []) as any[];

  // --- Phase A: Maße vorbereiten (Textbox-Breiten) + Reflow ---
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

  // Plan-Objekte sammeln, statt sofort zu positionieren
  type Plan = { child: any; tlX: number; tlY: number; targetW?: number; targetH?: number; proportional?: boolean };
  const plans: Plan[] = [];

  // Flow stapeln
  const flowItems = children.filter((c) => {
    const l: ChildLayout | undefined = c.__layout;
    return c.type === "textbox" && l && l.mode === "anchored" && (l as Anchored).flow;
  }) as (fabric.Textbox & any)[];

  flowItems.sort((a, b) => ((a.__layout as Anchored).order ?? 0) - ((b.__layout as Anchored).order ?? 0));

  let currentTopTL = Math.min(...flowItems.map((c) => (c.__layout as Anchored).padT));
  if (!Number.isFinite(currentTopTL)) currentTopTL = 0;

  let contentTopTL = Number.isFinite(currentTopTL) ? currentTopTL : 0;
  let contentBottomTL = contentTopTL;
  let maxPadB = 0;

  flowItems.forEach((tb, idx) => {
    const L = tb.__layout as Anchored;
    if (idx === 0) currentTopTL = L.padT; else currentTopTL += (L.gapBefore ?? 0);

    const tlX = L.padL + L.indentPx;
    const tlY = currentTopTL;

    const h = Math.max(0, tb.height ?? tb.getScaledHeight?.() ?? 0);
    const bottom = tlY + h;

    if (idx === 0) contentTopTL = tlY;
    contentBottomTL = Math.max(contentBottomTL, bottom);
    maxPadB = Math.max(maxPadB, L.padB ?? 0);

    plans.push({ child: tb, tlX, tlY });
    currentTopTL = bottom; // nächstes Element schließt unmittelbar an
  });

  // Anchored ohne Flow + Proportionale vorbereiten
  children.forEach((child) => {
    const layout: ChildLayout | undefined = child.__layout;
    if (!layout) return;

    if (child.type === "textbox") {
      const L = layout as Anchored;
      if (L.mode === "anchored" && !L.flow) {
        const tlX = L.padL + L.indentPx;
        const tlY = L.padT;
        const h = Math.max(0, child.height ?? child.getScaledHeight?.() ?? 0);
        const bottom = tlY + h;

        contentTopTL = Math.min(contentTopTL, tlY);
        contentBottomTL = Math.max(contentBottomTL, bottom);
        maxPadB = Math.max(maxPadB, L.padB ?? 0);

        plans.push({ child, tlX, tlY });
      }
    } else if (layout.mode === "proportional") {
      const r = (layout as Proportional).ratio;
      plans.push({
        child,
        tlX: r.left * newW,
        tlY: r.top  * newH,
        targetW: r.width  * newW,
        targetH: r.height * newH,
        proportional: true,
      });
    }
  });

  // Zielhöhe (Auto-Height)
  const minHeight = Math.max(32, Number((group as any).data?.minHeight ?? 0));
  const targetHeight = Math.max(minHeight, contentBottomTL + maxPadB);

  // --- Phase B: Gruppe auf Zielhöhe setzen, dann ALLE Kinder mit neuem halfH positionieren ---
  group.set({ width: newW, height: targetHeight });

  const halfW = newW / 2;
  const halfH = targetHeight / 2;

  plans.forEach((p) => {
    if (p.proportional) {
      p.child.set({
        left: p.tlX - halfW,
        top:  p.tlY - halfH,
        scaleX: 1, scaleY: 1,
        ...(p.targetW != null ? { width: Math.max(1, p.targetW) } : {}),
        ...(p.targetH != null ? { height: Math.max(1, p.targetH) } : {}),
      });
    } else {
      p.child.set({ left: p.tlX - halfW, top: p.tlY - halfH });
    }
    p.child.setCoords();
  });

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

    // Höhe wird in applyLayout ggf. per Auto-Height ersetzt
    target.set({ width: newW, height: newH, scaleX: 1, scaleY: 1 });
    applyLayout(target as fabric.Group & WithData, newW, newH);

    target.__baseW = newW;
    target.__baseH = target.height ?? newH;

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
