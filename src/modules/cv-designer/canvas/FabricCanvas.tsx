import React, { useRef, useCallback, useEffect } from "react";
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
  const fabricCanvasRef = useRef<any>(null);
  const initSet = useRef(new WeakSet<HTMLCanvasElement>());
  
  const elements = useDesignerStore(s => s.elements);
  const version = useDesignerStore(s => s.version);
  const zoom = useDesignerStore(s => s.zoom);
  const updateFrame = useDesignerStore(s => s.updateFrame);

  // HMR Cleanup
  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        DBG('HMR cleanup triggered');
        fabricCanvasRef.current?.dispose?.();
        fabricCanvasRef.current = null;
      });
    }
  }, []);

  // Canvas Initialisierung via Callback-Ref
  const canvasCallbackRef = useCallback(async (node: HTMLCanvasElement | null) => {
    DBG('Canvas callback ref called:', { node: !!node, hasExisting: !!fabricCanvasRef.current });
    
    // Cleanup bei Unmount
    if (!node) {
      DBG('Canvas unmounting, cleaning up');
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.dispose();
          DBG('Canvas disposed successfully');
        } catch (e) {
          DBG('Error disposing canvas:', e);
        }
        fabricCanvasRef.current = null;
      }
      return;
    }

    // Verhindere Doppel-Initialisierung desselben DOM-Knotens
    if (initSet.current.has(node)) {
      DBG('Canvas node already initialized, skipping');
      return;
    }

    try {
      DBG('Initializing new canvas on node');
      
      // Prüfe und entsorge alte Fabric-Instanz auf diesem Element
      if ((node as any).__fabricCanvas) {
        DBG('Found existing fabric canvas on node, disposing');
        try {
          (node as any).__fabricCanvas.dispose();
        } catch (e) {
          DBG('Error disposing existing canvas:', e);
        }
        delete (node as any).__fabricCanvas;
      }

      const fabric = await getFabric();
      
      // Neue Canvas erstellen
      const canvas = new fabric.Canvas(node, {
        preserveObjectStacking: true,
        selection: true,
        backgroundColor: '#ffffff',
        width: PAGE_W,
        height: PAGE_H
      });

      // Referenzen setzen
      fabricCanvasRef.current = canvas;
      (node as any).__fabricCanvas = canvas;
      initSet.current.add(node);

      // Event-Handler für Interaktivität
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
          canvas.requestRenderAll();
        }
      });

      // Initiales Rendering
      canvas.requestRenderAll();
      DBG('Canvas initialized successfully');
      
    } catch (error) {
      DBG('Canvas initialization failed:', error);
      fabricCanvasRef.current = null;
    }
  }, [updateFrame]);

  // Zoom Updates
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    DBG('Updating canvas zoom:', zoom);
    canvas.setZoom(zoom);
    canvas.requestRenderAll();
  }, [zoom]);

  // Element Rendering
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      DBG('No canvas available for rendering elements');
      return;
    }

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

    (async () => {
      try {
        const fabric = await getFabric();

        // Entferne alle bisherigen Inhaltsobjekte, behalte aber Guides/Overlays
        const objects = canvas.getObjects();
        objects.forEach((obj: any) => {
          if (!obj.excludeFromExport && !obj.isGuide && !obj.isOverlay) {
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
        
      } catch (error) {
        DBG('Error rendering elements:', error);
      }
    })();
  }, [elements, version]);

  return (
    <div className="w-full h-full overflow-auto bg-neutral-100 flex items-center justify-center">
      <div className="shadow-xl bg-white" style={{ width: PAGE_W, height: PAGE_H }}>
        <canvas ref={canvasCallbackRef} />
      </div>
    </div>
  );
}