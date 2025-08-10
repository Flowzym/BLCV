import React, { useRef, useCallback, useEffect } from "react";
import { useDesignerStore } from "../store/designerStore";
import type { SectionType, Typography } from "../store/designerStore";
import getFabric from "@/lib/fabric-shim";
import { getLayoutTemplate } from "../services/layoutTemplates";

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
  const globalFieldStyles = useDesignerStore(s => s.globalFieldStyles);
  const activeLayoutByType = useDesignerStore(s => s.activeLayoutByType);
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
        height: PAGE_H,
        skipTargetFind: false
      });

      // Referenzen setzen
      fabricCanvasRef.current = canvas;
      (node as any).__fabricCanvas = canvas;
      initSet.current.add(node);

      // Event-Handler für Group-Bewegung
      canvas.on('object:moving', (e: any) => {
        const obj = e.target;
        if (obj && obj.__sectionId) {
          DBG('Section group moving:', { sectionId: obj.__sectionId, left: obj.left, top: obj.top });
          
          // Snap to grid
          const snap = 20; // TODO: get from store
          obj.left = Math.round(obj.left / snap) * snap;
          obj.top = Math.round(obj.top / snap) * snap;
        }
      });

      canvas.on('object:moved', (e: any) => {
        const obj = e.target;
        if (obj && obj.__sectionId) {
          DBG('Section group moved:', { sectionId: obj.__sectionId, left: obj.left, top: obj.top });
          // Update store with new position
          updateFrame(obj.__sectionId, { x: obj.left, y: obj.top });
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

  // Element Rendering mit Section-Gruppierung
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
      elements: safeElements.slice(0, 5).map(e => ({ 
        id: e.id,
        type: e.type,
        text: (e.text || '').substring(0, 30) + '...',
        x: e.x,
        y: e.y
      }))
    });

    (async () => {
      try {
        const fabric = await getFabric();

        // Entferne alle bisherigen Objekte
        const objects = canvas.getObjects();
        objects.forEach((obj: any) => {
          canvas.remove(obj);
        });

        // Erstelle Text-Objekte
        safeElements.forEach((el: any, index: number) => {
          if (!el) return;
          
          const isTextElement = el.type === 'text';
          if (!isTextElement) {
            DBG(`Skipping non-text element ${index}:`, { id: el.id, type: el.type });
            return;
          }
          
          const displayText = (el.text || '').trim() || `Element ${index}`;
          
          // Sichere Positionierung im Canvas (A4: 595x842)
          let x = el.x || 0;
          let y = el.y || 0;
          
          // Korrigiere Positionen die außerhalb sind
          if (x > 500) x = 50 + (index % 2) * 250; // Fallback auf 2-Spalten-Layout
          if (y > 700) y = 50 + Math.floor(index / 2) * 60;
          if (x < 0) x = 50;
          if (y < 0) y = 50;
          
          DBG(`Creating text object ${index}:`, { 
            id: el.id,
            text: displayText.substring(0, 30) + '...',
            originalPosition: { x: el.x, y: el.y },
            finalPosition: { x, y }
          });
          
          const textObj = new fabric.Textbox(displayText, {
            left: x,
            top: y,
            width: el.width || 280,
            fontSize: el.fontSize || 12,
            fontFamily: el.fontFamily || 'Arial',
            fontWeight: el.bold ? 'bold' : 'normal',
            fontStyle: el.italic ? 'italic' : 'normal',
            fill: '#111',
            selectable: true,
            evented: true,
            hasControls: true,
            objectCaching: false
          });
          
          (textObj as any).__elementId = el.id;
          
          canvas.add(textObj);
        });

        canvas.requestRenderAll();        
        DBG('Canvas render complete:', { totalObjects: canvas.getObjects().length });
        
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