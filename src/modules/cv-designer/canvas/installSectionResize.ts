// src/modules/cv-designer/canvas/installSectionResize.ts
import { fabric } from "fabric";

type WithData = fabric.Object & {
  data?: Record<string, any>;
  __ratiosComputed?: boolean;
  __baseW?: number;
  __baseH?: number;
};

type Ratio = {
  left: number;   // 0..1 relativ zur Gruppenbreite (TL-Referenz)
  top: number;    // 0..1 relativ zur Gruppenhöhe (TL-Referenz)
  width: number;  // 0..1 relativ zur Gruppenbreite
  height: number; // 0..1 relativ zur Gruppenhöhe
};

type Anchored = {
  mode: "anchored";
  padL: number;
  padT: number;
  padR: number;
  padB: number;
  indentPx: number; // zusätzlicher Einzug vor dem Text (px)
};

type Proportional = {
  mode: "proportional";
  ratio: Ratio;
};

type ChildLayout = Anchored | Proportional;

declare global {
  interface Object {
    __layout?: ChildLayout;
  }
}

function isSectionGroup(obj: any): obj is fabric.Group & WithData {
  if (!obj) return false;
  const d = (obj as any).data;
  const hasFlag = d?.sectionId !== undefined || d?.type === "section" || d?.kind === "section";
  return obj.type === "group" && hasFlag;
}

/**
 * Initialisiert pro Kind das Layout:
 * - Textbox: anchored (px-basiertes Padding/Indent)
 * - andere: proportional (Ratio)
 * Hinweis: Wenn bereits __layout existiert, nicht überschreiben (idempotent).
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
      // Default-Padding/Indent aus child.data oder konservativ wählen
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
      // Proportional berechnen (Koordinaten relativ zu TL der Gruppe)
      const childWidth = (child.width ?? 0) * (child.scaleX ?? 1);
      const childHeight = (child.height ?? 0) * (child.scaleY ?? 1);
      const relLeft = (child.left ?? 0) + halfW; // von Center auf TL
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
 * Wendet Layout auf neue Gruppenmaße an.
 * - Text (anchored): Padding/Indent in px bleiben konstant.
 * - Proportional: Maße/Position skalieren mit der Gruppe.
 * - Text: nur width setzen (Reflow), niemals height/scaleY.
 */
function applyLayout(
  group: fabric.Group & WithData,
  newW: number,
  newH: number,
  widthChanged: boolean
) {
  const halfW = newW / 2;
  const halfH = newH / 2;

  (group._objects || []).forEach((child: any) => {
    const layout: ChildLayout | undefined = child.__layout;
    if (!layout) return;

    if (layout.mode === "anchored") {
      const { padL, padT, padR, padB, indentPx } = layout;

      // Position: feste Pixelabstände von TL
      const tlX = padL + indentPx;
      const tlY = padT;

      // Textbreite hängt nur von Gruppenbreite ab (abzgl. Padding)
      if (child.type === "textbox") {
        if (widthChanged) {
          const targetW = Math.max(1, newW - padL - padR - indentPx);
          child.set({
            width: targetW,
            scaleX: 1,
            scaleY: 1,
            objectCaching: false,
          });
          child.set("dirty", true);
        } else {
          // nur repositionieren (falls Gruppe sich verschiebt/height ändert)
          child.set({ scaleX: 1, scaleY: 1 });
        }
      } else {
        // Falls doch kein Text (Edge Case), verhalte dich neutral
        child.set({ scaleX: 1, scaleY: 1 });
      }

      // von TL auf Center-Koordinaten umsetzen
      child.set({
        left: tlX - halfW,
        top:  tlY - halfH,
      });
      child.setCoords();

    } else {
      // proportional
      const r = layout.ratio;
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
        // Falls jemand Text in "proportional" steckte: defensiv nur width anpassen.
        if (widthChanged) {
          child.set({ width: targetW, scaleX: 1, scaleY: 1, objectCaching: false });
          child.set("dirty", true);
        } else {
          child.set({ scaleX: 1, scaleY: 1 });
        }
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
 * Installer: konvertiert Gruppenskalierung in echtes Resize
 * und hält Text-Metriken stabil (Padding/Indent in px).
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

    // Ermitteln, ob sich die Breite tatsächlich geändert hat (für Text-Reflow)
    const prevW = target.__baseW ?? baseW;
    const widthChanged = Math.abs(scaledW - prevW) > 0.5;

    // normalize: echtes Resize statt Scale
    target.set({ width: Math.max(1, scaledW), height: Math.max(1, scaledH), scaleX: 1, scaleY: 1 });

    applyLayout(target as fabric.Group & WithData, Math.max(1, scaledW), Math.max(1, scaledH), widthChanged);

    // Baseline für nächsten Schritt aktualisieren
    target.__baseW = Math.max(1, scaledW);
    target.__baseH = Math.max(1, scaledH);

    canvas.requestRenderAll();
    isResizing = false;
  });

  canvas.on("object:modified", (e) => {
    const target = e.target as fabric.Object & WithData;
    if (!isSectionGroup(target)) return;

    // Text-Caching wieder aktivieren
    (target._objects || []).forEach((child: any) => {
      if (child.type === "textbox") {
        child.set({ objectCaching: true });
        child.set("dirty", true);
      }
      child.setCoords();
    });

    target.setCoords();
    canvas.requestRenderAll();
  });
}
