// Zoom-/Scroll-sichere Umrechnung einer Fabric-Textbox in DOM-Koordinaten relativ
// zu dem Container, der dein <canvas> enthält (der gleiche Wrapper, in dem wir das Overlay rendern).
import type { fabric } from "fabric";

export type DomRectLike = { left: number; top: number; width: number; height: number };

export function fabricToDomRect(
  canvas: fabric.Canvas,
  obj: fabric.Object,
  containerEl: HTMLElement
): DomRectLike {
  const rect = obj.getBoundingRect(true, true); // absolute Bounding Box in Canvas-Koordinaten
  const vt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0]; // [a,b,c,d,e,f]
  const zoom = canvas.getZoom ? canvas.getZoom() : vt[0] || 1;

  // Canvas-Koordinaten (mit viewportTransform) -> Screen
  const screenLeft = rect.left * zoom + vt[4];
  const screenTop = rect.top * zoom + vt[5];
  const screenWidth = rect.width * zoom;
  const screenHeight = rect.height * zoom;

  // Container-BBox relativ zur Seite
  const containerBox = containerEl.getBoundingClientRect();

  // Weil das Overlay absolut relativ zum Container positioniert wird,
  // ziehen wir die Container-Position vom Screen-Rechteck ab.
  return {
    left: screenLeft - containerBox.left,
    top: screenTop - containerBox.top,
    width: screenWidth,
    height: screenHeight,
  };
}
