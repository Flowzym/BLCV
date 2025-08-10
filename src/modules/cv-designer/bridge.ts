// Bridge zwischen Generator und Designer – robuste Initialisierung

type Parts = unknown[]; // <-- bei dir ggf. richtiger Typ (CanvasPart[])

declare global {
  interface Window {
    ns_setupCallback?: (cb: (parts: Parts) => void) => void;
    ns_dispatchPartsFromGenerator?: (parts: Parts) => void;
  }
}

let listener: ((parts: Parts) => void) | null = null;

export function initDesignerBridge() {
  console.log('[BRIDGE] Initializing designer bridge...');
  
  // Prüfe ob bereits initialisiert
  if (window.ns_setupCallback && window.ns_dispatchPartsFromGenerator) {
    console.log('[BRIDGE] Bridge already initialized, skipping');
    return;
  }
  
  // Robuste Initialisierung: Funktionen sind IMMER definiert
  window.ns_setupCallback = (cb: (parts: Parts) => void) => {
    console.log('[BRIDGE] Callback registered');
    listener = cb;
  };
  
  window.ns_dispatchPartsFromGenerator = (parts: Parts) => {
    console.log('[BRIDGE] Dispatching parts:', parts);
    if (listener) {
      listener(parts);
    } else {
      console.warn('[BRIDGE] No listener registered yet, parts ignored');
    }
  };
  
  console.log('[BRIDGE] Bridge initialized successfully');
}