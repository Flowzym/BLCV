// src/modules/cv-designer/canvas/installSectionResize.ts
import { fabric } from "fabric";

/**
 * Ziele:
 * - Gruppenskalierung (scaleX/scaleY) -> echtes width/height (Scale→Resize Normalization).
 * - Textboxen NIE skalieren, nur über 'width' reflowen.
 * - Anchored-Layout: Padding/Indent in px bleiben konstant.
 * - NEU: Vertikales Flow-Layout für Text-Unterfelder (order + gap).
 *   Breite ändern -> Umbruch -> neue Höhen -> darunterliegende Felder werden nachgesetzt.
 */

type WithData = fabric.Object & {
  data?: Record<string, any>;
  __ratiosComputed?: boolean;
  __baseW?: number;
  __baseH?: number;
};

type Ratio = {
  left: number;  // 0..1 relativ zur Gruppenbreite (Top-Left-Referenz)
  top: number;   // 0..1 relativ zur Gruppenhöhe (Top-Left-Referenz)
  width: number; // 0..1 relativ zur Gruppenbreite
  height: number;// 0..1 relativ zur Gruppenhöhe
};

type Anchored = {
  mode: "anchored";
  padL: number;
  padT: number;
  padR: number;
  padB: number;
  indentPx: number; // fester Einzug (px)
  flow?: boolean;   // vertikaler Stack?
  order?: number;   // Sortierreihenfolge im Stack
  gapBefore?: number; // zusätzlicher Abstand VOR diesem Feld (px)
};

type Proportional = {
  mode: "proportional";
  ratio: Ratio;
};

type ChildLayout = Anchored | Proportional;

function isSectionGroup(obj: any): obj is fabric.Group & WithData {
  if (!obj) return false;
  const d = (obj as any).data;
  const hasFlag =
    d?.sectionId !== undefined ||
    d?.type === "section" ||
    d?.kind === "section";
  return obj.type === "group" && hasFlag;
}

/**
 * Initialisiert Layout-Metadaten pro Kind:
 * - Textbox -> anchored (px-Padding & Einzug); optionale Flow-Flags aus child.data
 * - andere -> proportional (Ratio zur Gruppe)
 * Idempotent: vorhandenes __layout wird nicht überschrieben.
 */
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
      const flow = Boolean(child.data?.flow ?? true);   // default: Flow AN
      const order = Number(child.data?.order ?? 0);
      const gapBefore = Number(child.data?.gapBefore ?? 0);

      child.__layout = {
        mode: "anchored",
        padL, padT, padR, padB, indentPx,
        flow, order, gapBefore,
      } as Anchored;
    } else {
      const childWidth = (child.width ?? 0) * (child.scaleX ?? 1);
      const childHeight = (child.height ?? 0) * (child.scaleY ?? 1);
      const relLeft = (child.left ?? 0) + halfW; // Center -> TL
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

/** Hilfen für Text-Reflow */
function forceTextReflow(tb: any) {
  const txt = tb.text || "";
  tb.set("text", "");
  tb._clearCache?.();
  tb.initDimensions?.();
  tb._splitTextIntoLines?.();

  tb.set("text", txt);
  tb._clearCache?.();
  tb.initDimensions?.();
  tb._splitTextIntoLines?.();
  tb.dirty = true;
}

/**
 * Layout anwenden:
 * - 1) Alle Textboxen: Zielbreite setzen & harten Reflow auslösen (damit aktuelle Höhe vorliegt)
 * - 2) Flow-Textboxen nach 'order' vertikal stapeln (padT + gapBefore + kumulierte Höhen)
 * - 3) Positionen setzen (TL -> center coords); Shapes proportional wie gehabt
 */
function applyLayout(
  group: fabric.Group & WithData,
  newW: number,
  newH: number
) {
  const halfW = newW / 2;
  const halfH = newH / 2;

  const children = (group._objects || []) as any[];

  // --- Schritt 1: alle Textboxen Breite setzen + Reflow, Maße normalisieren
  children.forEach((child) => {
    const layout: ChildLayout | undefined = child.__layout;
    if (!layout) return;

    if (layout.mode === "anchored" && child.type === "textbox") {
      const { padL, padR, indentPx } = layout as Anchored;
      const targetW = Math.max(1, newW - padL - padR - indentPx);

      child.set({
        width: targetW,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        skewX: 0,
        skewY: 0,
        originX: "left",
        originY: "top",
        objectCaching: false,
      });

      // optionale Stabilisierung der Textmetriken
      const safeLH = Number(child.data?.lineHeight ?? 1.2);
      child.set({
        lineHeight: isFinite(safeLH) && safeLH > 0 ? safeLH : 1.2,
        styles: {}, // per-char/per-line styles deaktivieren (kann später wieder aktiviert werden)
      });

      forceTextReflow(child);
    }
  });

  // --- Schritt 2: Vertikal-Flow anwenden (nur anchored Textboxen mit flow=true)
  const flowItems = children.filter((c) => {
    const l: ChildLayout | undefined = c.__layout;
    return c.type === "textbox" && l && l.mode === "anchored" && (l as Anchored).flow;
  }) as (fabric.Textbox & any)[];

  flowItems.sort((a, b) => {
    const la = (a.__layout as Anchored).order ?? 0;
    const lb = (b.__layout as Anchored).order ?? 0;
    return la - lb;
  });

  // Baseline: minimaler padT der Flow-Items (damit Header mit größerem padT nicht nach oben gezogen wird)
  let currentTopTL = Math.min(
    ...flowItems.map((c) => (c.__layout as Anchored).padT)
  );
  if (!isFinite(currentTopTL)) currentTopTL = 0;

  flowItems.forEach((tb, idx) => {
    const L = tb.__layout as Anchored;
    if (idx === 0) {
      // ersten Eintrag exakt auf seinen eigenen padT setzen
      currentTopTL = L.padT;
    } else {
      // vor diesem Feld einen optionalen Gap berücksichtigen
      currentTopTL += L.gapBefore ?? 0;
    }

    // Position TL für diesen Text
    const tlX = L.padL + L.indentPx;
    const tlY = currentTopTL;

    tb.set({
      left: tlX - halfW,
      top:  tlY - halfH,
    });
    tb.setCoords();

    // Nachpositionierung fürs nächste Feld: addiere echte Text-Höhe + padB (unterer Innenabstand)
    const h = Math.max(0, tb.height ?? (tb.getScaledHeight?.() ?? 0));
    currentTopTL = tlY + h;
  });

  // --- Schritt 3: Nicht-Flow-Elemente positionieren (anchored static + proportional)
  children.forEach((child) => {
    const layout: ChildLayout | undefined = child.__layout;
    if (!layout) return;

    if (child.type === "textbox") {
      // Flow-Textboxen wurden bereits oben gesetzt.
      const L = layout as Anchored;
      if (L.mode === "anchored" && !L.flow) {
        const tlX = L.padL + L.indentPx;
        const tlY = L.padT;
        child.set({ left: tlX - halfW, top: tlY - halfH });
        child.setCoords();
      }
    } else if (layout.mode === "proportional") {
      const r = (layout as Proportional).ratio;
      const tlX = r.left * newW;
      const tlY = r.top  * newH;
      const targetW = Math.max(1, r.width  * newW);
      const targetH = Math.max(1, r.height * newH);

      if (
        child.type === "rect" ||
        child.type === "image" ||
        child.type === "line" ||
        child.type === "circle" ||
        child.type === "triangle"
      ) {
        child.set({ width: targetW, height: targetH, scaleX: 1, scaleY: 1 });
      } else {
        child.set({ scaleX: 1, scaleY: 1 });
      }

      child.set({ left: tlX - halfW, top: tlY - halfH });
      child.setCoords();
    }
  });

  group.setCoords();
}

/** Installer */
export function installSectionResize(canvas: fabric.Canvas) {
  let isResizing = false;

  canvas.on("object:scaling", (e) => {
    const target = e.target as fabric.Object & WithData;
    if (!isSectionGroup(target)) return;
    if (isResizing) return;

    isResizing = true;

    if (!target.__ratiosComputed) {
      ensureChildLayouts(target as fabric.Group & WithData);
    }

    const baseW = target.width ?? 0;
    const baseH = target.height ?? 0;
    const scaledW = baseW * (target.scaleX ?? 1);
    const scaledH = baseH * (target.scaleY ?? 1);

    const newW = Math.max(1, scaledW);
    const newH = Math.max(1, scaledH);

    target.set({ width: newW, height: newH, scaleX: 1, scaleY: 1 });
    applyLayout(target as fabric.Group & WithData, newW, newH);

    target.__baseW = newW;
    target.__baseH = newH;

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
