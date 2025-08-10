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
        type: e.type || 'unknown',
        text: (e.text || '').substring(0, 30) + '...',
        x: e.x || 0,
        y: e.y || 0,
        sectionId: (e as any).sectionId || 'unknown',
        sectionType: (e as any).sectionType || 'unknown',
        field: (e as any).field || 'unknown'
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

        // Erstelle einzelne Text-Objekte (erstmal ohne Gruppierung für Debugging)
        safeElements.forEach((el: any, index: number) => {
          if (!el || el.type !== 'text') return;
          
          const displayText = (el.text || '').trim() || `Element ${index}`;
          const x = el.x ?? el.left ?? 40 + (index * 20);
          const y = el.y ?? el.top ?? 40 + (index * 30);
          
          DBG(`Creating text object ${index}:`, { 
            id: el.id,
            text: displayText.substring(0, 30) + '...',
            x, y,
            sectionId: el.sectionId,
            field: el.field
          });
          
          // Hole globale Typografie falls verfügbar
          const sectionType = el.sectionType as SectionType;
          const field = el.field || 'content';
          const typography = globalFieldStyles[sectionType]?.[field] || {};
          
          const textObj = new fabric.Textbox(displayText, {
            left: x,
            top: y,
            width: el.width ?? 300,
            fontSize: typography.fontSize ?? el.fontSize ?? 12,
            fontFamily: typography.fontFamily ?? el.fontFamily ?? 'Arial',
            fontWeight: typography.fontWeight ?? (el.bold ? 'bold' : 'normal'),
            fontStyle: typography.fontStyle ?? (el.italic ? 'italic' : 'normal'),
            fill: typography.color ?? '#111',
            lineHeight: typography.lineHeight ?? 1.4,
            charSpacing: typography.letterSpacing ? Math.round(typography.letterSpacing * 100) : 0,
            // Erstmal alle selektierbar für Debugging
            selectable: true,
            evented: true,
            hasControls: true,
            lockMovementX: false,
            lockMovementY: false,
            hoverCursor: 'move',
            moveCursor: 'move',
            objectCaching: false
          });
          
          // Metadaten für Event-Handler
          (textObj as any).__elementId = el.id;
          (textObj as any).__sectionId = el.sectionId;
          (textObj as any).__sectionType = sectionType;
          (textObj as any).__field = field;
          
          canvas.add(textObj);
          
          DBG(`Added text object:`, { 
            id: el.id,
            text: displayText.substring(0, 20),
            position: `${x},${y}`,
            size: `${el.width ?? 300}x${textObj.height}`
          });
        });

        canvas.requestRenderAll();
        DBG('Canvas render complete (individual objects):', { 
          totalObjects: canvas.getObjects().length,
          selectableObjects: canvas.getObjects().filter((o: any) => o.selectable).length
        });
        
      } catch (error) {
        DBG('Error rendering elements:', error);
      }
    })();
  }, [elements, version, globalFieldStyles, activeLayoutByType]);

  return (
    <div className="w-full h-full overflow-auto bg-neutral-100 flex items-center justify-center">
      <div className="shadow-xl bg-white" style={{ width: PAGE_W, height: PAGE_H }}>
        <canvas ref={canvasCallbackRef} />
      </div>
    </div>
  );
}