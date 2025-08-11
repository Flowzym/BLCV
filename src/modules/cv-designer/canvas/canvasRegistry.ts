// CanvasRegistry compatible with two calling styles:
// - getOrCreate(canvasEl, fabricNS, opts?) → returns fabric.Canvas
// - getOrCreate(id, el?, opts?, fabricNS?) → returns { id, canvas }
// Also provides has(), set(), setCanvas(), dispose(), disposeAll().

type FabricNS = {
  Canvas?: new (el: HTMLCanvasElement, opts?: any) => any;
};

type Entry = { key: any; canvas?: any };

class _CanvasRegistry {
  private map = new Map<any, Entry>();

  getOrCreate(...args: any): any {
    // Style A: (canvasEl, fabricNS, opts?)
    if (args[0] instanceof HTMLCanvasElement) {
      const el: HTMLCanvasElement = args[0];
      const fabricNS: FabricNS | any = args[1];
      const opts = args[2] || {};

      let entry = this.map.get(el);
      if (!entry) {
        entry = { key: el, canvas: undefined };
        this.map.set(el, entry);
      }
      if (!entry.canvas && fabricNS?.Canvas) {
        try {
          entry.canvas = new fabricNS.Canvas(el, opts);
        } catch (e) {
          console.warn("[CanvasRegistry] failed to create canvas:", e);
        }
      }
      return entry.canvas;
    }

    // Style B: (id, el?, opts?, fabricNS?)
    const id = args[0];
    const el: HTMLCanvasElement | null | undefined = args[1];
    const opts = args[2] || {};
    const fabricNS: FabricNS | any = args[3];

    let entry = this.map.get(id);
    if (!entry) {
      entry = { key: id, canvas: undefined };
      this.map.set(id, entry);
    }

    if (!entry.canvas && el && fabricNS?.Canvas) {
      try {
        entry.canvas = new fabricNS.Canvas(el, opts);
      } catch (e) {
        console.warn("[CanvasRegistry] failed to create canvas:", e);
      }
    }

    return entry; // style B returns entry to be compatible with earlier variant
  }

  has(key: any): boolean {
    return this.map.has(key);
  }

  get(key: any): any {
    const e = this.map.get(key);
    return e?.canvas;
  }

  setCanvas(key: any, canvas: any) {
    let entry = this.map.get(key);
    if (!entry) {
      entry = { key, canvas: undefined };
      this.map.set(key, entry);
    }
    entry.canvas = canvas;
  }

  set(key: any, canvas: any) {
    this.setCanvas(key, canvas);
  }

  dispose(key: any) {
    const entry = this.map.get(key);
    if (!entry) return;
    try { entry.canvas?.dispose?.(); } catch {}
    this.map.delete(key);
  }

  disposeAll() {
    for (const [key, entry] of this.map.entries()) {
      try { entry.canvas?.dispose?.(); } catch {}
      this.map.delete(key);
    }
  }
}

const CanvasRegistry = new _CanvasRegistry();
export default CanvasRegistry;
