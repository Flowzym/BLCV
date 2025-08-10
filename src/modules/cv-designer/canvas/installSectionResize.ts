// src/modules/cv-designer/canvas/installSectionResize.ts
import { fabric } from "fabric";

/**
 * Ziel:
 * - Gruppenskalierung (scaleX/scaleY) → echte width/height-Änderung (Normalization).
 * - Textboxen werden NIE skaliert, nur über 'width' reflowed.
 * - Padding/Indent in px bleiben konstant.
 * - Reflow wird bei JEDER Größenänderung getriggert (auch nur Höhe).
 */

type WithData = fabric.Object & {
  data?: Record<string, any>;
  __ratiosComputed?: boolean;
  __baseW?: number;
  __baseH?: number;
};

type Ratio = {
  left: number;   // 0..1 relativ zur Gruppenbreite (Top-Left-Referenz)
  top: number;    // 0..1 relativ zur Gruppenhöhe (Top-Left-Referenz)
  width: number;  // 0..1 relativ zur Gruppenbreite
  height: number; // 0..1 relativ zur Gruppenhöhe
};

type Anchored = {
  mode: "anchored";
  padL: number;
  padT: number;
  padR: number;
  padB: number;
  indentPx: number; // fester Einzug (px)
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
 * Initialisiere Layout-Metadaten pro Kind:
 * - Textbox → anchored (px-Padding/Indent)
 * - andere → proportional (Ratio)
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

      child.__layout = {
        mode: "anchored",
        padL, padT, padR, padB, indentPx,
      } as Anchored;
    } else {
      const childWidth = (child.width ?? 0) * (child.scaleX ?? 1);
      const childHeight = (child.height ?? 0) * (child.scaleY ?? 1);
      const relLeft = (child.left ?? 0) + halfW; // Center → TL umrechnen
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

/**
 * Layout anwenden:
 * - Text (anchored): IMMER Zielbreite setzen (erzwingt Reflow) + Cache/Dims refresh.
 * - Proportional: Maße/Position aus Ratio.
 */
function applyLayout(
  group: fabric.Group & WithData,
  newW: number,
  newH: number
) {
  const halfW = newW / 2;
  const halfH = newH / 2;

  (group._objects || []).forEach((child: any) => {
    const layout: ChildLayout | undefined = child.__layout;
    if (!layout) return;

    if (layout.mode === "anchored") {
      const { padL, padT, padR, /* padB */ , indentPx } = layout;

      // TL-Position bleibt in px konstant
      const tlX = padL + indentPx;
      const tlY = padT;

      if (child.type === "textbox") {
        const targetW = Math.max(1, newW - padL - padR - indentPx);

        // ⚠️ immer Reflow, auch bei reiner Höhenänderung
        child.set({
          width: targetW,
          scaleX: 1,
          scaleY: 1,
          objectCaching: false, // während Interaktion kein Bitmap-Cache
        });

        // Fabric intern sanft „wecken“
        if (typeof child._clearCache === "function") child._clearCache();
        if (typeof child.initDimensions === "function") child.initDimensions();
        child.set("dirty", true);
      } else {
        child.set({ scaleX: 1, scaleY: 1 });
      }

      // TL → Center-Koordinaten der Gruppe
      child.set({
        left: tlX - halfW,
        top:  tlY - halfH,
      });
      child.setCoords();

    } else {
      // proportional
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
      } else if (child.type === "textbox") {
        // Safety: falls Text fälschlich proportional markiert wurde
        child.set({
          width: targetW,
          scaleX: 1,
          scaleY: 1,
          objectCaching: false,
        });
        if (typeof child._clearCache === "function") child._clearCache();
        if (typeof child.initDimensions === "function") child.initDimensions();
        child.set("dirty", true);
      } else {
        child.set({ scaleX: 1, scaleY: 1 });
      }

      child.set({
        left: tlX - halfW,
        top:  tlY - halfH,
      });
      child.setCoords();
    }
  });

  group.setCoords();
}

/**
 * Installer: konvertiert Scale → echtes Resize und triggert stabilen Reflow.
 */
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

    // Normalize: echtes Resize statt Scale
    const newW = Math.max(1, scaledW);
    const newH = Math.max(1, scaledH);

    target.set({ width: newW, height: newH, scaleX: 1, scaleY: 1 });
    applyLayout(target as fabric.Group & WithData, newW, newH);

    // Baselines aktualisieren
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
        // Cache wieder aktivieren & final refresh
        child.set({ objectCaching: true });
        if (typeof child._clearCache === "function") child._clearCache();
        if (typeof child.initDimensions === "function") child.initDimensions();
        child.set("dirty", true);
      }
      child.setCoords();
    });

    target.setCoords();
    canvas.requestRenderAll();
  });
}
