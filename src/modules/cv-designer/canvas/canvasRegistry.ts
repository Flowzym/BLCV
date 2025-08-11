// Robust Canvas-Registry, kompatibel mit Lazy-Fabric (fabric-shim)
// - Erzeugt *nur dann* eine Canvas, wenn sowohl ein Canvas-Element (el)
//   als auch ein Fabric-Namespace (fabricNS) übergeben wird.
// - Andernfalls legt sie lediglich/verwaltet einen Eintrag.
// - Bietet zusätzliche Helper (set / setCanvas), um extern erstellte Canvas
//   einzutragen (z. B. nach getFabric()).

export type RegistryEntry = {
  id: string;
  canvas?: any; // fabric.Canvas | undefined
};

type FabricNS = {
  Canvas?: new (el: HTMLCanvasElement, opts?: any) => any;
};

class _CanvasRegistry {
  private map = new Map<string, RegistryEntry>();

  /**
   * Liefert den Eintrag zur ID, legt ihn ggf. an.
   * Erzeugt eine Canvas nur, wenn *sowohl* el als auch fabricNS.Canvas vorhanden sind.
   */
  getOrCreate(
    id: string,
    el?: HTMLCanvasElement | null,
    opts?: any,
    fabricNS?: FabricNS | any
  ): RegistryEntry {
    let entry = this.map.get(id);
    if (!entry) {
      entry = { id, canvas: undefined };
      this.map.set(id, entry);
    }

    // Nur erzeugen, wenn explizit möglich und noch keine Canvas existiert
    if (!entry.canvas && el && fabricNS && fabricNS.Canvas) {
      try {
        entry.canvas = new fabricNS.Canvas(el, opts);
      } catch (err) {
        // Failsafe: nicht crashen – Eintrag bleibt bestehen, Canvas undefined
        // (wird ggf. später via set()/setCanvas() gesetzt)
        console.warn("[CanvasRegistry] Canvas creation failed:", err);
      }
    }

    return entry;
  }

  /** Alias: existiert ein Eintrag für die ID? */
  has(id: string): boolean {
    return this.map.has(id);
  }

  /** Liefert den Eintrag (oder undefined) */
  get(id: string): RegistryEntry | undefined {
    return this.map.get(id);
  }

  /**
   * Setzt/überschreibt die Canvas für eine ID (z. B. nachdem extern via getFabric() erstellt wurde).
   * Kompatibler Alias: set() (für ältere Aufrufer).
   */
  setCanvas(id: string, canvas: any): RegistryEntry {
    let entry = this.map.get(id);
    if (!entry) {
      entry = { id, canvas: undefined };
      this.map.set(id, entry);
    }
    entry.canvas = canvas;
    return entry;
  }

  /** Kompatibilitäts-Alias zu setCanvas */
  set(id: string, canvas: any): RegistryEntry {
    return this.setCanvas(id, canvas);
  }

  /** Entfernt und disposed eine einzelne Canvas, falls vorhanden. */
  dispose(id: string): void {
    const entry = this.map.get(id);
    if (!entry) return;
    try {
      entry.canvas?.dispose?.();
    } catch {}
    this.map.delete(id);
  }

  /** Disposed alle registrierten Canvas und leert die Registry. */
  disposeAll(): void {
    for (const [id, entry] of this.map.entries()) {
      try {
        entry.canvas?.dispose?.();
      } catch {}
      this.map.delete(id);
    }
  }
}

const CanvasRegistry = new _CanvasRegistry();
export default CanvasRegistry;
