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
      elements: safeElements.map(e => ({ 
        id: e.id, 
        type: e.type, 
        text: e.text?.substring(0, 30) + '...',
        left: e.left,
        top: e.top,
        sectionId: (e as any).sectionId,
        sectionType: (e as any).sectionType,
        field: (e as any).field
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

        // Gruppiere Elemente nach sectionId
        const elementsBySectionId = new Map<string, any[]>();
        safeElements.forEach((el: any) => {
          if (el.type === 'text' && el.sectionId) {
            if (!elementsBySectionId.has(el.sectionId)) {
              elementsBySectionId.set(el.sectionId, []);
            }
            elementsBySectionId.get(el.sectionId)!.push(el);
          }
        });

        DBG('Grouped elements by section:', { 
          sectionsCount: elementsBySectionId.size,
          sections: Array.from(elementsBySectionId.keys())
        });

        // Render jede Sektion als Group
        for (const [sectionId, sectionElements] of elementsBySectionId) {
          if (sectionElements.length === 0) continue;

          const firstElement = sectionElements[0];
          const sectionType = firstElement.sectionType as SectionType;
          
          // Hole Layout-Template
          const layoutId = activeLayoutByType[sectionType] || 'default';
          const layout = getLayoutTemplate(sectionType, layoutId);
          
          DBG(`Rendering section ${sectionId}:`, { 
            sectionType, 
            layoutId, 
            elementsCount: sectionElements.length,
            layout: layout.items.map(i => ({ field: i.field, x: i.x, y: i.y }))
          });

          // Berechne Section-Position (aus erstem Element)
          const sectionLeft = firstElement.left ?? 40;
          const sectionTop = firstElement.top ?? 40;

          // Erstelle Group zunächst leer
          const group = new fabric.Group([], {
            left: sectionLeft,
            top: sectionTop,
            selectable: true,
            evented: true,
            hasControls: true,
            subTargetCheck: false, // Wichtig: Klicks nicht an Kinder delegieren
            lockMovementX: false,
            lockMovementY: false,
            hoverCursor: 'move',
            moveCursor: 'move',
            objectCaching: false
          }) as any;

          // Metadaten für Event-Handler
          group.__sectionId = sectionId;
          group.__sectionType = sectionType;

          // Erstelle Kinder-Objekte und füge sie zur Group hinzu
          
          sectionElements.forEach((el: any) => {
            // Hole Layout-Position für dieses Feld
            const layoutItem = layout.items.find(item => item.field === el.field);
            const x = layoutItem?.x ?? el.offsetX ?? 0;
            let y = layoutItem?.y ?? el.offsetY ?? 0;
            const width = layoutItem?.w ?? el.width ?? 420;

            // Spezialbehandlung für Bullets
            if (el.field === 'bullet' && el.order !== undefined) {
              const bulletIndex = el.order - 10; // order starts at 10 for bullets
              const bulletY = 44 + (bulletIndex * (layout.rowGap || 16));
              y = bulletY;
            }

            // Hole globale Typografie für dieses Feld
            const typography = globalFieldStyles[sectionType]?.[el.field] || {};
            
            // Erstelle Text-Objekt (nicht selektierbar)
            const displayText = (el.text || '').trim() || ' ';
            const textObj = new fabric.Textbox(displayText, {
              left: x,
              top: y,
              width: width,
              fontSize: typography.fontSize ?? el.fontSize ?? 12,
              fontFamily: typography.fontFamily ?? 'Arial',
              fontWeight: typography.fontWeight ?? (el.bold ? 'bold' : 'normal'),
              fontStyle: typography.fontStyle ?? (el.italic ? 'italic' : 'normal'),
              fill: typography.color ?? '#111',
              lineHeight: typography.lineHeight ?? 1.4,
              charSpacing: typography.letterSpacing ? Math.round(typography.letterSpacing * 100) : 0,
              // Kinder sind NICHT selektierbar/dragbar
              selectable: false,
              evented: false,
              hasBorders: false,
              hasControls: false,
              lockMovementX: true,
              lockMovementY: true,
              hoverCursor: 'default',
              objectCaching: false
            });

            // Metadaten für Debugging
            (textObj as any).__field = el.field;
            (textObj as any).__sectionType = sectionType;
            (textObj as any).__elementId = el.id;

            // Füge Text-Objekt zur Group hinzu
            group.add(textObj);
            
            DBG(`Created child text for ${el.field}:`, { 
              text: displayText.substring(0, 30) + '...', 
              x, y, width,
              typography: Object.keys(typography)
            });
          });

          // Aktualisiere Group-Dimensionen nach dem Hinzufügen aller Kinder
          group.addWithUpdate();
          group.setCoords();

          canvas.add(group);
          
          DBG(`Added section group:`, { 
            sectionId, 
            sectionType, 
            left: sectionLeft, 
            top: sectionTop,
            childrenCount: group.getObjects().length,
            selectable: group.selectable,
            evented: group.evented
          });
        }

        canvas.requestRenderAll();
        DBG('Canvas render complete:', { 
          totalObjects: canvas.getObjects().length,
          selectableObjects: canvas.getObjects().filter((o: any) => o.selectable).length,
          groups: canvas.getObjects().filter((o: any) => o.type === 'group').length
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