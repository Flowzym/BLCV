// Kleine Bridge zwischen Generator und Designer – ohne Inline-Script.

type Parts = unknown[]; // <-- bei dir ggf. richtiger Typ (CanvasPart[])

declare global {
  interface Window {
    ns_setupCallback?: (cb: (parts: Parts) => void) => void;
    ns_dispatchPartsFromGenerator?: (parts: Parts) => void;
  }
}

let listener: ((parts: Parts) => void) | null = null;

export function initDesignerBridge() {
  // Sicherstellen, dass die globalen Funktionen immer definiert sind
  // Designer registriert seinen Callback
  window.ns_setupCallback = (cb) => { listener = cb; };
  // Generator ruft diese Funktion auf, um Parts zu senden
  window.ns_dispatchPartsFromGenerator = (parts) => { listener?.(parts); };
