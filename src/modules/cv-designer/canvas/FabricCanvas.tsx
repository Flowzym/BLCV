import React, { useRef, useCallback, useEffect } from "react";
import { useDesignerStore } from "../store/designerStore";
import type { CVSectionWithParts } from "../types/section";
import getFabric from "@/lib/fabric-shim";

const DBG = (msg: string, ...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
    console.log('[FABRIC_CANVAS]', msg, ...args);
  }
};

const PAGE_W = 595, PAGE_H = 842;

export default function FabricCanvas() {
  const fabricCanvasRef = useRef<any>(null);
  const initSet = useRef(new WeakSet<HTMLCanvasElement>());
  
  const sections = useDesignerStore(s => s.sections);
  const version = useDesignerStore(s => s.version);
  const zoom = useDesignerStore(s => s.zoom);
  const updateFrame = useDesignerStore(s => s.updateFrame);
  const updateTypographySelection = useDesignerStore(s => s.setSelectedTypographyField);

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
        if (obj && obj.__sectionId && obj.type === 'group') {
          DBG('Section group moving:', { sectionId: obj.__sectionId, left: obj.left, top: obj.top });
          
          // Snap to grid
          const snap = 20; // TODO: get from store
          obj.left = Math.round(obj.left / snap) * snap;
          obj.top = Math.round(obj.top / snap) * snap;
        }
      });

      canvas.on('object:moved', (e: any) => {
        const obj = e.target;
        if (obj && obj.__sectionId && obj.type === 'group') {
          DBG('Section group moved:', { sectionId: obj.__sectionId, left: obj.left, top: obj.top });
          // Update store with new section position
          updateFrame(obj.__sectionId, { x: obj.left, y: obj.top, width: obj.width, height: obj.height });
        }
      });

      // Handle group scaling - adjust text widths to fit new group size
      canvas.on('object:scaling', (e: any) => {
        const obj = e.target;
        if (obj && obj.__sectionId && obj.type === 'group') {
          DBG('Section group scaling:', { sectionId: obj.__sectionId, scaleX: obj.scaleX, scaleY: obj.scaleY });
          
          // Prevent default scaling behavior - we'll handle it in object:scaled
        }
      });

      canvas.on('object:scaled', (e: any) => {
        const obj = e.target;
        if (obj && obj.__sectionId && obj.type === 'group') {
          DBG('Section group scaled:', { 
            sectionId: obj.__sectionId, 
            originalSize: { width: obj.width, height: obj.height },
            scale: { x: obj.scaleX, y: obj.scaleY }
          });
          
          // Calculate new actual dimensions
          const newWidth = Math.round(obj.width * obj.scaleX);
          const newHeight = Math.round(obj.height * obj.scaleY);
          
          DBG('Calculated new dimensions:', { newWidth, newHeight });
          
          // Store original width for ratio calculations
          const originalGroupWidth = obj.width;
          
          // Update text objects BEFORE resetting group scale
          obj.getObjects().forEach((textObj: any) => {
            if (textObj.type === 'textbox') {
              // Calculate new width maintaining relative position within group
              const relativeWidth = textObj.width / originalGroupWidth;
              const newTextWidth = Math.max(50, Math.round(newWidth * relativeWidth));
              
              DBG('Updating text object:', {
                id: textObj.__partId,
                oldWidth: textObj.width,
                newWidth: newTextWidth,
                relativeWidth
              });
              
              // Apply new width and ensure no scaling
              textObj.set({
                width: newTextWidth,
                scaleX: 1,
                scaleY: 1
              });
              
              // Force text reflow
              textObj._clearCache();
              textObj.initDimensions();
            }
          });
          
          // Reset group scale and apply actual size changes
          obj.set({
            width: newWidth,
            height: newHeight,
            scaleX: 1,
            scaleY: 1
          });
          
          // Update coordinates after scaling
          obj.setCoords();
          
          // Update store with new section dimensions
          updateFrame(obj.__sectionId, { 
            x: Math.round(obj.left), 
            y: Math.round(obj.top), 
            width: newWidth, 
            height: newHeight 
          });
          
          canvas.requestRenderAll();
        }
      });

      // Handle clicks on individual text parts for typography selection
      canvas.on('mouse:down', (e: any) => {
        const target = e.target;
        if (!target) return;
        
        // Check if clicked on a textbox within a group
        if (target.type === 'textbox' && target.__fieldType && target.__sectionType) {
          DBG('Text part clicked:', { 
            sectionType: target.__sectionType, 
            fieldType: target.__fieldType,
            partId: target.__partId 
          });
          
          // Update typography field selection in store
          updateTypographySelection(target.__sectionType, target.__fieldType);
        }
        // Check if clicked on a group (section)
        else if (target.type === 'group' && target.__sectionType) {
          DBG('Section group clicked:', { sectionType: target.__sectionType });
          // Default to 'content' field when clicking on section
          updateTypographySelection(target.__sectionType, 'content');
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

  // Section Rendering mit Fabric Groups
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      DBG('No canvas available for rendering sections');
      return;
    }

    const safeSections = Array.isArray(sections) ? sections : [];
    
    DBG('Rendering sections:', { 
      sectionsCount: safeSections.length, 
      version,
      sections: safeSections.slice(0, 3).map(s => ({ 
        id: s.id,
        title: s.title,
        type: s.type,
        x: s.x,
        y: s.y,
        partsCount: s.parts?.length || 0
      }))
    });

    (async () => {
      try {
        const fabric = await getFabric();
        
        // Get current styles from store
        const state = useDesignerStore.getState();
        const globalFieldStyles = state.globalFieldStyles || {};
        const partStyles = state.partStyles || {};
        const tokens = state.tokens || {};

        // Entferne alle bisherigen Objekte
        const objects = canvas.getObjects();
        objects.forEach((obj: any) => {
          canvas.remove(obj);
        });

        // Erstelle Fabric Groups für jede Section
        safeSections.forEach((section: CVSectionWithParts, sectionIndex: number) => {
          if (!section || !section.parts) {
            DBG(`Skipping invalid section ${sectionIndex}:`, section);
            return;
          }
          
          DBG(`Creating group for section ${sectionIndex}:`, { 
            id: section.id,
            title: section.title,
            frame: { x: section.x, y: section.y, width: section.width, height: section.height },
            partsCount: section.parts.length
          });
          
          // Erstelle Textboxen für alle Parts in dieser Section
          const textObjects: any[] = [];
          
          section.parts.forEach((part: any, partIndex: number) => {
            if (part.type !== 'text') {
              DBG(`Skipping non-text part ${partIndex} in section ${section.id}`);
              return;
            }
            
            const displayText = (part.text || '').trim() || `Part ${partIndex}`;
            
            // Einfache, robuste Style-Anwendung
            const baseStyle = {
              fontSize: part.fontSize || tokens.fontSize || 12,
              fontFamily: part.fontFamily || tokens.fontFamily || 'Arial',
              fontWeight: part.fontWeight || 'normal',
              fontStyle: part.fontStyle || 'normal',
              fill: part.color || tokens.colorPrimary || '#111111',
              lineHeight: part.lineHeight || tokens.lineHeight || 1.4,
              charSpacing: 0,
              textAlign: part.textAlign || 'left'
            };
            
            DBG(`Creating text object ${partIndex} in section ${section.id}:`, { 
              id: part.id,
              text: displayText.substring(0, 30) + '...',
              offset: { x: part.offsetX, y: part.offsetY },
              width: part.width,
              appliedStyle: baseStyle
            });
            
            const textObj = new fabric.Textbox(displayText, {
              left: part.offsetX || 0,
              top: part.offsetY || 0,
              width: part.width || 280,
              ...baseStyle,
              selectable: false, // Parts sind nicht einzeln selektierbar, aber anklickbar
              evented: true, // Enable events for click detection
              hasControls: false,
              hasBorders: false,
              objectCaching: false,
              splitByGrapheme: false,
              editable: false // Verhindert versehentliche Textbearbeitung
            });
            
            (textObj as any).__partId = part.id;
            (textObj as any).__fieldType = part.fieldType;
            (textObj as any).__sectionType = section.sectionType;
            
            textObjects.push(textObj);
          });
          
          // Erstelle Fabric Group für die Section
          if (textObjects.length > 0) {
            const sectionGroup = new fabric.Group(textObjects, {
              left: section.x || 50,
              top: section.y || 50,
              width: section.width || 500,
              height: section.height || 150,
              selectable: true,
              evented: true,
              hasControls: true,
              hasBorders: true,
              borderColor: '#3b82f6',
              cornerColor: '#3b82f6',
              cornerSize: 8,
              transparentCorners: false,
              objectCaching: false
            });
            
            (sectionGroup as any).__sectionId = section.id;
            (sectionGroup as any).__sectionType = section.sectionType;
            (sectionGroup as any).__sectionTitle = section.title;
            
            canvas.add(sectionGroup);
            
            DBG(`Added section group ${sectionIndex}:`, { 
              id: section.id,
              title: section.title,
              position: { left: sectionGroup.left, top: sectionGroup.top },
              size: { width: sectionGroup.width, height: sectionGroup.height },
              textObjectsCount: textObjects.length
            });
          } else {
            DBG(`No text objects created for section ${section.id}, skipping group creation`);
          }
        });

        canvas.requestRenderAll();        
        DBG('Canvas render complete:', { 
          totalGroups: canvas.getObjects().length,
          sectionsProcessed: safeSections.length
        });
        
      } catch (error) {
        DBG('Error rendering sections:', error);
      }
    })();
  }, [sections, version, updateFrame, updateTypographySelection]);

  return (
    <div className="w-full h-full overflow-auto bg-neutral-100 flex items-center justify-center">
      <div className="shadow-xl bg-white" style={{ width: PAGE_W, height: PAGE_H }}>
        <canvas ref={canvasCallbackRef} />
      </div>
    </div>
  );
}