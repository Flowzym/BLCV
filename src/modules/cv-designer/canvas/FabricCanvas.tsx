import React, { useEffect, useRef } from "react";
import { useDesignerStore } from "../store/designerStore";
import getFabric from "@/lib/fabric-shim";
import CanvasRegistry from "./canvasRegistry";

const DBG = (msg: string, ...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
    console.log('[FABRIC_CANVAS]', msg, ...args);
  }
};

const PAGE_W = 595, PAGE_H = 842;

export default function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvas = useRef<any>(null);
  const isInitialized = useRef<boolean>(false);

  const elements = useDesignerStore(s => s.elements);
  const version = useDesignerStore(s => s.version);
  const zoom = useDesignerStore(s => s.zoom);
  const updateFrame = useDesignerStore(s => s.updateFrame);

  /* ---------------- Canvas Initialisierung ---------------- */
  useEffect(() => {
    if (isInitialized.current) {
      DBG('Canvas already initialized, skipping');
      return;
    }

    DBG('Initializing FabricCanvas');
    
    (async () => {
      try {
        const fabric = await getFabric();
        const el = canvasRef.current;
        if (!el) {
          DBG('Canvas element not found');
          return;
        }

        // Registry verwenden für sichere Canvas-Erstellung
        const canvas = CanvasRegistry.getOrCreate(el, fabric);
        fabricCanvas.current = canvas;
        isInitialized.current = true;

        // Canvas konfigurieren
        canvas.setWidth(PAGE_W);
        canvas.setHeight(PAGE_H);
        canvas.selection = true;
        canvas.preserveObjectStacking = true;
        canvas.backgroundColor = '#ffffff';

        // Event-Handler für Drag & Drop
        canvas.on('object:moving', (e: any) => {
          const obj = e.target;
          if (obj && obj.elementId) {
            DBG('Object moving:', { id: obj.elementId, left: obj.left, top: obj.top });
          }
        });

        canvas.on('object:moved', (e: any) => {
          const obj = e.target;
          if (obj && obj.elementId) {
            DBG('Object moved:', { id: obj.elementId, left: obj.left, top: obj.top });
            updateFrame(obj.elementId, { x: obj.left, y: obj.top });
          }
        });

        canvas.on('object:scaling', (e: any) => {
          const obj = e.target;
          if (obj && obj.elementId) {
            const newWidth = obj.width * obj.scaleX;
            const newHeight = obj.height * obj.scaleY;
            DBG('Object scaling:', { id: obj.elementId, width: newWidth, height: newHeight });
            updateFrame(obj.elementId, { 
              width: newWidth, 
              height: newHeight,
              x: obj.left,
              y: obj.top
            });
            
            // Reset scale to 1 after applying dimensions
            obj.set({ scaleX: 1, scaleY: 1, width: newWidth, height: newHeight });
          }
        });

        // Probe-Text für Sichtbarkeits-Test
        const probe = new fabric.Text('[probe] Canvas Ready', {
          left: 40,
          top: 40,
          fill: '#111',
          fontSize: 14,
          selectable: false,
          evented: false,
          excludeFromExport: true
        });
        canvas.add(probe);
        
        canvas.requestRenderAll();
        DBG('Canvas initialized successfully');
        
      } catch (error) {
        DBG('Canvas initialization failed:', error);
        isInitialized.current = false;
      }
    })();

    return () => {
      DBG('Canvas cleanup');
      if (canvasRef.current) {
        CanvasRegistry.dispose(canvasRef.current);
      }
      fabricCanvas.current = null;
      isInitialized.current = false;
    };
  }, []); // Nur beim Mount, keine Dependencies

  /* ---------------- Zoom Updates ---------------- */
  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas || !isInitialized.current) return;

    DBG('Updating canvas zoom:', zoom);
    canvas.setZoom(zoom);
    canvas.requestRenderAll();
  }, [zoom]);

  /* ---------------- Element Rendering ---------------- */
  useEffect(() => {
    const canvas = fabricCanvas.current;
    const fabric = CanvasRegistry.get(canvasRef.current!);
    if (!canvas || !fabric || !isInitialized.current) return;

    const safeElements = Array.isArray(elements) ? elements : [];
    
    DBG('Rendering elements:', { 
      elementsCount: safeElements.length, 
      version,
      elements: safeElements.map(e => ({ 
        id: e.id, 
        type: e.type, 
        text: e.text?.substring(0, 30) + '...',
        left: e.left,
        top: e.top
      }))
    });

    // Entferne alle Objekte außer Probe und Guides
    const objects = canvas.getObjects();
    objects.forEach((obj: any) => {
      if (!obj.excludeFromExport && !obj.text?.includes('[probe]')) {
        canvas.remove(obj);
      }
    });

    // Render neue Elemente
    safeElements.forEach((el: any, index: number) => {
      if (el.type === 'text') {
        // Leere Strings durch Leerzeichen ersetzen für Sichtbarkeit
        const displayText = (el.text || '').trim() || ' ';
        
        const textObj = new fabric.Text(displayText, {
          left: el.left ?? 20,
          top: el.top ?? 20,
          fontSize: el.fontSize ?? 12,
          fontFamily: el.fontFamily ?? 'Arial',
          fontWeight: el.bold ? 'bold' : 'normal',
          fontStyle: el.italic ? 'italic' : 'normal',
          fill: '#111',
          // Interaktivität aktivieren
          selectable: true,
          evented: true,
          lockMovementX: false,
          lockMovementY: false,
          hasControls: true,
          perPixelTargetFind: true,
          // Element-ID für Event-Handling
          elementId: el.id
        });

        canvas.add(textObj);
        DBG(`Rendered interactive text ${index}:`, { 
          id: el.id, 
          left: el.left, 
          top: el.top, 
          text: displayText.substring(0, 50) + '...',
          selectable: textObj.selectable,
          evented: textObj.evented
        });
      }
    });

    canvas.requestRenderAll();
    DBG('Canvas render complete:', { 
      totalObjects: canvas.getObjects().length,
      interactiveObjects: canvas.getObjects().filter((o: any) => o.selectable).length
    });
  }, [elements, version, updateFrame]);

  return (
    <div className="w-full h-full overflow-auto bg-neutral-100 flex items-center justify-center">
      <div className="shadow-xl bg-white" style={{ width: PAGE_W, height: PAGE_H }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}