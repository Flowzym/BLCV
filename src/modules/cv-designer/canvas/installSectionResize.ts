/**
 * Canvas Registry - Singleton für Fabric.js Canvas-Instanzen
 * Verhindert Mehrfach-Initialisierung und verwaltet Canvas-Lifecycle
 */

const canvasMap = new Map<HTMLCanvasElement, any>();

const DBG = (msg: string, ...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
    console.log('[CANVAS_REGISTRY]', msg, ...args);
  }
};

export const CanvasRegistry = {
  /**
   * Holt oder erstellt eine Canvas-Instanz für das gegebene Element
   */
  getOrCreate(el: HTMLCanvasElement, fabricNs: any): any {
    // Prüfe ob bereits eine Canvas für dieses Element existiert
    if (canvasMap.has(el)) {
      const existing = canvasMap.get(el);
      DBG('Returning existing canvas for element:', el);
      return existing;
    }

    // Prüfe ob Fabric.js das Element bereits als initialisiert betrachtet
    if ((el as any).__fabricCanvas) {
      DBG('Element has __fabricCanvas marker, disposing first');
      try {
        (el as any).__fabricCanvas.dispose();
      } catch (e) {
        DBG('Error disposing existing fabric canvas:', e);
      }
      delete (el as any).__fabricCanvas;
    }

    // Neue Canvas erstellen
    DBG('Creating new canvas for element:', el);
    const canvas = new fabricNs.Canvas(el, {
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: '#ffffff'
    });

    // In Registry speichern
    canvasMap.set(el, canvas);
    DBG('Canvas registered in map, total canvases:', canvasMap.size);

    return canvas;
  },

  /**
   * Entsorgt eine Canvas und ersetzt das DOM-Element
   */
  dispose(el: HTMLCanvasElement): void {
    DBG('Disposing canvas for element:', el);
    
    const canvas = canvasMap.get(el);
    if (canvas) {
      try {
        canvas.dispose();
        DBG('Canvas disposed successfully');
      } catch (e) {
        DBG('Error disposing canvas:', e);
      }
      canvasMap.delete(el);
    }

    // DOM-Element ersetzen, damit Fabric keine internen Marker mehr findet
    try {
      const parent = el.parentNode;
      if (parent) {
        const fresh = el.cloneNode(false) as HTMLCanvasElement;
        parent.replaceChild(fresh, el);
        DBG('DOM element replaced with fresh clone');
      }
    } catch (e) {
      DBG('Error replacing DOM element:', e);
    }

    // Fabric-Marker explizit löschen
    delete (el as any).__fabricCanvas;
    DBG('Fabric markers cleared');
  },

  /**
   * Prüft ob eine Canvas für das Element existiert
   */
  has(el: HTMLCanvasElement): boolean {
    return canvasMap.has(el);
  },

  /**
   * Holt eine existierende Canvas (ohne zu erstellen)
   */
  get(el: HTMLCanvasElement): any | null {
    return canvasMap.get(el) || null;
  },

  /**
   * Entsorgt alle Canvases (für Cleanup)
   */
  disposeAll(): void {
    DBG('Disposing all canvases, count:', canvasMap.size);
    for (const [el, canvas] of canvasMap.entries()) {
      try {
        canvas.dispose();
        delete (el as any).__fabricCanvas;
      } catch (e) {
        DBG('Error disposing canvas in disposeAll:', e);
      }
    }
    canvasMap.clear();
    DBG('All canvases disposed');
  }
};

export default CanvasRegistry;