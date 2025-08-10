// src/lib/fabric-shim.ts
// Einheitlicher, idempotenter Zugriff auf 'fabric' – ESM/CJS sicher.
// Liefert IMMER eine Funktion (getFabric), die das Fabric-Namespace-Objekt zurückgibt.

let _cached: any | null = null;

/** Lädt das Fabric-Namespace-Objekt (einmalig, dann Cache). */
export async function getFabric(): Promise<any> {
  if (_cached) return _cached;
  
  // dynamischer Import, um SSR/Build-Probleme zu vermeiden
  const mod: any = await import("fabric");
  
  // Robuste Namespace-Erkennung für verschiedene Export-Varianten
  let ns = null;
  
  // Variante 1: Named export { fabric }
  if (mod?.fabric && typeof mod.fabric === 'object' && mod.fabric.Canvas) {
    ns = mod.fabric;
  }
  // Variante 2: Default export
  else if (mod?.default && typeof mod.default === 'object' && mod.default.Canvas) {
    ns = mod.default;
  }
  // Variante 3: Das Modul selbst ist das Namespace
  else if (mod && typeof mod === 'object' && mod.Canvas) {
    ns = mod;
  }
  
  if (!ns || (typeof ns !== "object" && typeof ns !== "function") || !ns.Canvas) {
    throw new Error(`Fabric konnte nicht korrekt geladen werden. Gefunden: ${Object.keys(mod || {}).join(', ')}`);
  }
  
  _cached = ns;
  console.log('[FABRIC_SHIM] Fabric loaded successfully:', { hasCanvas: !!ns.Canvas, hasText: !!ns.Text });
  return _cached;
}

// Default-Export als Alias – damit beide Importstile funktionieren:
export default getFabric;
