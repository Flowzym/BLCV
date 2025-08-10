import React, { useEffect, useRef } from "react";
import { useDesignerStore } from "../store/designerStore";
import getFabric from "@/lib/fabric-shim";
import type { CanvasElement } from "../services/flatten";

const DBG = (msg: string, ...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
    console.log('[DESIGNER]', msg, ...args);
  } else {
    console.log('[DESIGNER*]', msg, ...args);
  }
};

const PAGE_W = 595, PAGE_H = 842;
type FabricNS = any;

export default function FabricCanvas(){
  const canvasRef  = useRef<HTMLCanvasElement|null>(null);
  const fabricNs   = useRef<any>(null);
  const fCanvas    = useRef<any>(null);
  const isInitialized = useRef<boolean>(false);

  const elements = useDesignerStore(s => s.elements);
  const version = useDesignerStore(s => s.version);
  const zoom = useDesignerStore(s => s.zoom);

  /* ---------------- init ---------------- */
  useEffect(()=>{
    // Prevent multiple initializations
    if (isInitialized.current) {
      DBG('Canvas already initialized, skipping');
      return;
    }

    DBG('FabricCanvas mount');
    (async()=>{
      const fabric = await getFabric();
      fabricNs.current = fabric;

      const el = canvasRef.current; 
      if(!el) return;
      
      // Check if canvas is already initialized and dispose it
      if ((el as any).__fabricCanvas) {
        try {
          (el as any).__fabricCanvas.dispose();
          DBG('Disposed existing canvas instance');
        } catch (e) {
          DBG('Error disposing existing canvas:', e);
        }
      }
      
      const c = new fabric.Canvas(el, { 
        preserveObjectStacking: true, 
        selection: true, 
        backgroundColor: "#ffffff" 
      });
      fCanvas.current = c;
      isInitialized.current = true;
      
      c.setWidth(PAGE_W); 
      c.setHeight(PAGE_H); 
      
      // Probe-Text für Sichtbarkeits-Test
      const probe = new fabric.Text('[probe] Hello Designer', { 
        left: 40, 
        top: 40, 
        fill: '#111',
        fontSize: 14,
        visible: true,
        opacity: 1,
        selectable: false
      });
      c.add(probe);
      DBG('Canvas probe added:', { left: 40, top: 40, text: '[probe] Hello Designer' });
      
      c.requestRenderAll();
      DBG('FabricCanvas initialized');
    })();

    return () => {
      try {
        fCanvas.current?.dispose?.();
        // Explicitly clear Fabric.js reference on DOM element
        if (canvasRef.current) {
          (canvasRef.current as any).__fabricCanvas = undefined;
        }
      } catch {}
      fCanvas.current = null;
      fabricNs.current = null;
      isInitialized.current = false;
    };
  }, []);

  /* ----------- zoom updates ----------- */
  useEffect(() => {
    const c = fCanvas.current;
    if (!c) return;
    
    c.setZoom(zoom);
    c.requestRenderAll();
    DBG('Canvas zoom updated:', zoom);
  }, [zoom]);

  /* ----------- elements -> canvas rendering ----------- */
  useEffect(() => {
    const c = fCanvas.current;
    const fabric = fabricNs.current;
    if (!c || !fabric) return;
    
    DBG('Canvas render triggered:', { 
      elementsCount: elements.length, 
      version,
      elements: elements.map(e => ({ id: e.id, type: e.type, text: e.text?.substring(0, 30) + '...' }))
    });

    // Clear existing objects (except probe)
    const objects = c.getObjects();
    objects.forEach((obj: any) => {
      if (obj.text !== '[probe] Hello Designer') {
        c.remove(obj);
      }
    });

    // Render elements
    elements.forEach((el: CanvasElement, index: number) => {
      if (el.type === 'text') {
        const textObj = new fabric.Text(el.text ?? '', {
          left: el.left ?? 20,
          top: el.top ?? 20,
          fontSize: el.fontSize ?? 12,
          fontFamily: el.fontFamily ?? 'Arial',
          fontWeight: el.bold ? 'bold' : 'normal',
          fontStyle: el.italic ? 'italic' : 'normal',
          fill: '#111',
          opacity: 1,
          visible: true,
          selectable: false
        });
        
        c.add(textObj);
        DBG(`Canvas draw text ${index}:`, { 
          id: el.id, 
          left: el.left, 
          top: el.top, 
          text: JSON.stringify(el.text),
          textLength: el.text?.length || 0
        });
      }
    });

    c.requestRenderAll();
    DBG('Canvas rendered:', { objectsCount: c.getObjects().length });
  }, [elements, version]);

  return (
    <div className="w-full h-full overflow-auto bg-neutral-100 flex items-center justify-center">
      <div className="shadow-xl bg-white" style={{ width: PAGE_W*zoom, height: PAGE_H*zoom }}>
        <canvas ref={canvasRef}/>
      </div>
    </div>
  );
}

