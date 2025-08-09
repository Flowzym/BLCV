// src/lib/fabric-shim.ts
// Einheitlicher, idempotenter Zugriff auf 'fabric' – ESM/CJS sicher.
// Liefert IMMER eine Funktion (getFabric), die das Fabric-Namespace-Objekt zurückgibt.

let _cached: any | null = null;

/** Lädt das Fabric-Namespace-Objekt (einmalig, dann Cache). */
export async function getFabric(): Promise<any> {
  if (_cached) return _cached;
  // dynamischer Import, um SSR/Build-Probleme zu vermeiden
  const mod: any = await import("fabric");
  // mögliche Varianten: { fabric }, default, oder das Modul selbst ist already das Namespace
  const ns = mod?.fabric ?? mod?.default ?? mod;
  if (!ns || (typeof ns !== "object" && typeof ns !== "function") || !ns.Canvas) {
    // Minimaler Sanity-Check: Canvas-Konstruktor sollte existieren
    throw new Error("Fabric konnte nicht korrekt geladen werden (unexpected export shape).");
  }
  _cached = ns;
  return _cached;
}

// Default-Export als Alias – damit beide Importstile funktionieren:
export default getFabric;
