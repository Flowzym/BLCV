// src/modules/cv-designer/canvas/installSectionResize.ts
import { fabric } from "fabric";

type WithData = fabric.Object & {
  data?: Record<string, any>;
  // interne Hilfsmarker
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

declare global {
  // wir hängen pro Child ein Ratio an (TS-Hilfstyp)
  interface Object {
    __ratio?: Ratio;
  }
}

function isSectionGroup(obj: any): obj is fabric.Group & WithData {
  if (!obj) return false;
  // Erkennung: Group + Kennzeichen (passe bei Bedarf an eure Datenstruktur an)
  const hasFlag =
    (obj as any).data?.sectionId !== undefined ||
    (obj as any).data?.type === "section" ||
    (obj as any).data?.kind === "section";
  return obj.type === "group" && hasFlag;
}

/**
 * Initiale Ratio-Berechnung für Kinder relativ zur aktuellen Gruppenbox.
 * Koordinatenbasis: Gruppen-Top-Left (nicht Center).
 */
function ensureChildRatios(group: fabric.Group & WithData) {
  const gw = group.width ?? 1;
  const gh = group.height ?? 1;
  const halfW = gw / 2;
  const halfH = gh / 2;

  // Merke Basismaße für spätere Resizes
  if (!group.__baseW) group.__baseW = gw;
  if (!group.__baseH) group.__baseH = gh;

  (group._objects || []).forEach((child: any) => {
    // Fabric-Group arbeitet standardmäßig mit child.left/top relativ zum Gruppenmittelpunkt.
    // Wir rechnen auf TL-Referenz um:
    const childWidth = (child.width ?? 0) * (child.scaleX ?? 1);
    const childHeight = (child.height ?? 0) * (child.scaleY ?? 1);

    // child.left/top: relativ zum Gruppenmittelpunkt
    const relLeft = (child.left ?? 0) + halfW;
    const relTop = (child.top ?? 0) + halfH;

    child.__ratio = {
      left: gw ? relLeft / gw : 0,
      top: gh ? relTop / gh : 0,
      width: gw ? childWidth / gw : 0,
      height: gh ? childHeight / gh : 0,
    } as Ratio;
  });

  (group as WithData).__ratiosComputed = true;
}

/**
 * Wendet die gespeicherten Ratios auf neue Gruppenmaße an.
 * - Textboxen: nur über 'width' reflowen, scaleX/Y zurück auf 1
 * - Shapes/Bilder: Breite/Höhe proportional setzen
 * - Position: aus Ratio auf TL-Referenz berechnen und wieder in Center-Referenz übertragen
 */
function applyRatios(
  group: fabric.Group & WithData,
  newW: number,
  newH: number
) {
  const halfW = newW / 2;
  const halfH = newH / 2;

  (group._objects || []).forEach((child: any) => {
    const r: Ratio | undefined = child.__ratio;
    if (!r) return;

    // Ziel-Position relativ zur Gruppen-TL
    const tlX = r.left * newW;
    const tlY = r.top * newH;

    // Ziel-Maße
    const targetW = Math.max(1, r.width * newW);
    const targetH = Math.max(1, r.height * newH);

    if (child.type === "textbox") {
      // Text reflow via width, niemals skalieren
      child.set({
        width: targetW,
        scaleX: 1,
        scaleY: 1,
        objectCaching: false, // Bitmap-Verzerrung vermeiden
      });
      child.set("dirty", true);
      // Höhe ermittelt Fabric dynamisch nach dem nächste Render
    } else if (
      child.type === "rect" ||
      child.type === "image" ||
      child.type === "line" ||
      child.type === "circle" ||
      child.type === "triangle"
    ) {
      child.set({
        width: targetW,
        height: targetH,
        scaleX: 1,
        scaleY: 1,
      });
    } else {
      // Fallback: nicht skalieren
      child.set({ scaleX: 1, scaleY: 1 });
    }

    // Position wieder relativ zum Gruppenmittelpunkt (Fabric-Group-Koord-System)
    child.set({
      left: tlX - halfW,
      top: tlY - halfH,
    });

    child.setCoords();
  });

  group.setCoords();
}

/**
 * Installer: konvertiert Gruppenskalierung in echtes Resize
 * und verhindert so Textverzerrung in Textboxen.
 */
export function installSectionResize(canvas: fabric.Canvas) {
  // Während der Interaktion nicht mehrfach feuern lassen
  let isResizing = false;

  canvas.on("object:scaling", (e) => {
    const target = e.target as fabric.Object & WithData;
    if (!isSectionGroup(target)) return;
    if (isResizing) return;

    isResizing = true;

    // Basisratios einmalig vorbereiten
    if (!target.__ratiosComputed) {
      ensureChildRatios(target as fabric.Group & WithData);
    }

    // neue Maße aus aktueller Skalierung ableiten
    const baseW = target.width ?? 0;
    const baseH = target.height ?? 0;
    const newW = Math.max(1, baseW * (target.scaleX ?? 1));
    const newH = Math.max(1, baseH * (target.scaleY ?? 1));

    // Gruppenskalierung neutralisieren -> echtes Resize
    target.set({
      width: newW,
      height: newH,
      scaleX: 1,
      scaleY: 1,
    });

    applyRatios(target as fabric.Group & WithData, newW, newH);

    // Render & Cleanup
    canvas.requestRenderAll();
    isResizing = false;
  });

  canvas.on("object:modified", (e) => {
    const target = e.target as fabric.Object & WithData;
    if (!isSectionGroup(target)) return;

    // Nach dem finalen Loslassen Caches wieder aktivieren
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
