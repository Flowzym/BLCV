import React, { useRef, useCallback, useEffect } from "react";
import { useDesignerStore } from "../store/designerStore";
import type { CVSectionWithParts } from "../types/section";
import getFabric from "@/lib/fabric-shim";

const DBG = (msg: string, ...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
    console.log('[FABRIC_CANVAS]', msg, ...args);
  } else {
    // Temporär: Alle Debug-Logs anzeigen für Debugging
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
      
      // CRITICAL: Set correct canvas dimensions BEFORE creating Fabric instance
      node.width = PAGE_W;
      node.height = PAGE_H;
      node.style.width = `${PAGE_W}px`;
      node.style.height = `${PAGE_H}px`;
      
      // DEBUG: Canvas-Element-Dimensionen überprüfen
      const rect = node.getBoundingClientRect();
      DBG('Canvas DOM element dimensions:', {
        width: node.width,
        height: node.height,
        clientWidth: node.clientWidth,
        clientHeight: node.clientHeight,
        boundingRect: rect,
        style: {
          width: node.style.width,
          height: node.style.height,
          display: node.style.display,
          visibility: node.style.visibility
        }
      });
      
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
      
      // DEBUG: Canvas-Instanz-Eigenschaften überprüfen
      DBG('Canvas instance created:', {
        canvasWidth: canvas.getWidth(),
        canvasHeight: canvas.getHeight(),
        backgroundColor: canvas.backgroundColor,
        zoom: canvas.getZoom(),
        viewportTransform: canvas.viewportTransform
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
        }
      });

      canvas.on('object:scaled', (e: any) => {
        const obj = e.target;
        if (obj && obj.__sectionId && obj.type === 'group') {
          try {
            DBG('Section group scaled:', { 
              sectionId: obj.__sectionId, 
              originalSize: { width: obj.width, height: obj.height },
              scale: { x: obj.scaleX, y: obj.scaleY }
            });
            
            // Store original dimensions BEFORE scaling calculations
            const originalGroupWidth = obj.width / obj.scaleX;
            const originalGroupHeight = obj.height / obj.scaleY;
            
            // Calculate new actual dimensions
            const newWidth = Math.round(originalGroupWidth * obj.scaleX);
            const newHeight = Math.round(originalGroupHeight * obj.scaleY);
            
            DBG('Calculated new dimensions:', { 
              originalGroupWidth, 
              originalGroupHeight, 
              newWidth, 
              newHeight 
            });
            
            // Update text objects BEFORE resetting group scale
            obj.getObjects().forEach((textObj: any) => {
              if (textObj.type === 'textbox') {
                // Get original text width (before any scaling)
                const originalTextWidth = textObj.width / (textObj.scaleX || 1);
                
                // Calculate new width maintaining relative position within group
                const relativeWidth = originalTextWidth / originalGroupWidth;
                const newTextWidth = Math.max(50, Math.round(newWidth * relativeWidth));
                
                DBG('Updating text object:', {
                  id: textObj.__partId,
                  originalTextWidth,
                  newTextWidth,
                  relativeWidth,
                  oldScale: { x: textObj.scaleX, y: textObj.scaleY }
                });
                
                // Apply new width and RESET all scaling
                textObj.set({
                  width: newTextWidth,
                  scaleX: 1,
                  scaleY: 1
                });
                
                // Force text reflow and dimension recalculation
                textObj._clearCache?.();
                textObj.initDimensions?.();
                textObj.setCoords?.();
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
          } catch (error) {
            DBG('Error in object:scaled handler:', error);
          }
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
    
    // DEBUG: Zoom-Werte überprüfen
    DBG('Zoom details:', {
      requestedZoom: zoom,
      currentZoom: canvas.getZoom(),
      viewportTransform: canvas.viewportTransform
    });
    
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
    
    DBG('=== RENDERING SECTIONS START ===');
    DBG('Input sections data:', { 
      sectionsCount: safeSections.length, 
      version,
      sectionsDetailed: safeSections.map(s => ({ 
        id: s.id,
        title: s.title,
        type: s.type,
        sectionType: s.sectionType,
        x: s.x,
        y: s.y,
        width: s.width,
        height: s.height,
        partsCount: s.parts?.length || 0,
        partsPreview: s.parts?.slice(0, 2).map(p => ({
          id: p.id,
          fieldType: p.fieldType,
          text: p.text?.substring(0, 30) + '...',
          offsetX: p.offsetX,
          offsetY: p.offsetY,
          width: p.width
        })) || []
      }))
    });

    // CRITICAL: Früher Exit wenn keine Sections
    if (safeSections.length === 0) {
      DBG('No sections to render, clearing canvas');
      canvas.clear();
      canvas.requestRenderAll();
      return;
    }

    (async () => {
      try {
        const fabric = await getFabric();
        DBG('Fabric loaded successfully, proceeding with rendering');
        
        // Entferne alle bisherigen Objekte
        const objects = canvas.getObjects();
        DBG('Clearing existing objects:', objects.length);
        objects.forEach((obj: any) => {
          canvas.remove(obj);
        });

        // Erstelle Fabric Groups für jede Section
        safeSections.forEach((section: CVSectionWithParts, sectionIndex: number) => {
          if (!section || !section.parts) {
            DBG(`Skipping invalid section ${sectionIndex}:`, section);
            return;
          }
          
          DBG(`=== PROCESSING SECTION ${sectionIndex} ===`);
          DBG(`Section details:`, { 
            id: section.id,
            title: section.title,
            sectionType: section.sectionType,
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
            
            // Verwende echten Text aus den Parts
            const displayText = (part.text || '').trim() || `[Kein Text für ${part.fieldType}]`;
            
            DBG(`Creating text part ${partIndex}:`, {
              id: part.id,
              fieldType: part.fieldType,
              text: displayText.substring(0, 50) + '...',
              displayText: displayText,
              offset: { x: part.offsetX, y: part.offsetY },
              width: part.width,
              rawPart: part
            });
            
            // Berechne finale Styles aus verschiedenen Quellen
            const tokens = useDesignerStore.getState().tokens || {};
            const partStyles = useDesignerStore.getState().partStyles || {};
            const globalFieldStyles = useDesignerStore.getState().globalFieldStyles || {};
            
            // Style-Hierarchie (niedrigste zu höchste Priorität):
            // 1. tokens (base) 
            // 2. partStyles (alte globale Styles, gekeyt nach group:partKey)
            // 3. globalFieldStyles (neue globale Styles, gekeyt nach sectionType:fieldType) 
            // 4. part inline (höchste Priorität)
            
            const baseStyle = {
              fontFamily: tokens.fontFamily || 'Inter, Arial, sans-serif',
              fontSize: tokens.fontSize || 12,
              lineHeight: tokens.lineHeight || 1.4,
              fill: tokens.colorPrimary || '#111111'
            };
            
            // Alte globale Feld-Styles (aus Store, gekeyt nach group:partKey)
            const partStyleKey = `${section.type}:${part.fieldType}`;
            const legacyGlobalStyle = partStyles[partStyleKey] || {};
            
            // Neue globale Feld-Styles für diesen Sektionstyp und Feldtyp
            const newGlobalStyle = globalFieldStyles[section.sectionType]?.[part.fieldType] || {};
            
            // Inline-Styles aus dem Part selbst
            const inlineStyle = {
              fontFamily: part.fontFamily,
              fontSize: part.fontSize,
              fontWeight: part.fontWeight || 'normal',
              fontStyle: part.fontStyle || 'normal',
              fill: part.color,
              lineHeight: part.lineHeight,
              charSpacing: part.letterSpacing ? part.letterSpacing * (part.fontSize || baseStyle.fontSize) : undefined
            };
            
            // Finale Style-Kombination mit korrekter Prioritätsreihenfolge
            // Verwende Object.assign für explizite Überschreibung
            const finalStyle = {
              ...baseStyle,
              // Legacy global styles (niedrigere Priorität)
              ...(legacyGlobalStyle.fontFamily && { fontFamily: legacyGlobalStyle.fontFamily }),
              ...(legacyGlobalStyle.fontSize && { fontSize: legacyGlobalStyle.fontSize }),
              ...(legacyGlobalStyle.fontWeight && { fontWeight: legacyGlobalStyle.fontWeight }),
              ...(legacyGlobalStyle.italic && { fontStyle: 'italic' }),
              ...(legacyGlobalStyle.color && { fill: legacyGlobalStyle.color }),
              ...(legacyGlobalStyle.lineHeight && { lineHeight: legacyGlobalStyle.lineHeight }),
              ...(legacyGlobalStyle.letterSpacing && { charSpacing: legacyGlobalStyle.letterSpacing * (legacyGlobalStyle.fontSize || baseStyle.fontSize) }),
              
              // New global field styles (höhere Priorität)
              ...(newGlobalStyle.fontFamily && { fontFamily: newGlobalStyle.fontFamily }),
              ...(newGlobalStyle.fontSize && { fontSize: newGlobalStyle.fontSize }),
              ...(newGlobalStyle.fontWeight && { fontWeight: newGlobalStyle.fontWeight }),
              ...(newGlobalStyle.fontStyle && { fontStyle: newGlobalStyle.fontStyle }),
              ...(newGlobalStyle.textColor && { fill: newGlobalStyle.textColor }),
              ...(newGlobalStyle.lineHeight && { lineHeight: newGlobalStyle.lineHeight }),
              ...(newGlobalStyle.letterSpacing && { charSpacing: newGlobalStyle.letterSpacing * (newGlobalStyle.fontSize || baseStyle.fontSize) }),
              
              // Inline styles (höchste Priorität)
              ...(inlineStyle.fontFamily && { fontFamily: inlineStyle.fontFamily }),
              ...(inlineStyle.fontSize && { fontSize: inlineStyle.fontSize }),
              ...(inlineStyle.fontWeight && { fontWeight: inlineStyle.fontWeight }),
              ...(inlineStyle.fontStyle && { fontStyle: inlineStyle.fontStyle }),
              ...(inlineStyle.fill && { fill: inlineStyle.fill }),
              ...(inlineStyle.lineHeight && { lineHeight: inlineStyle.lineHeight }),
              ...(inlineStyle.charSpacing !== undefined && { charSpacing: inlineStyle.charSpacing }),
              
              // Text alignment
              textAlign: part.textAlign || 'left'
            };
            
            // CRITICAL: Ensure text is always visible with black color fallback
            if (!finalStyle.fill || finalStyle.fill === '#ffffff' || finalStyle.fill === 'white') {
              finalStyle.fill = '#000000';
            }
            
            DBG(`Calculated final style:`, finalStyle);
            
            // DEBUG: Style-Validierung
            if (finalStyle.fontSize <= 0) {
              DBG('WARNING: fontSize is zero or negative!', finalStyle.fontSize);
              finalStyle.fontSize = 12; // Fallback
            }
            
            // CRITICAL: Ensure we have actual text content
            if (!displayText || displayText.trim() === '' || displayText === '[Kein Text für undefined]') {
              DBG(`WARNING: Skipping text part with empty/invalid text:`, {
                partId: part.id,
                fieldType: part.fieldType,
                originalText: part.text,
                displayText: displayText
              });
              return;
            }
            
            try {
              DBG(`About to create Textbox with:`, {
                text: displayText,
                left: part.offsetX || 0,
                top: part.offsetY || 0,
                width: part.width || 280,
                style: finalStyle
              });
              
              const textObj = new fabric.Textbox(displayText, {
                left: part.offsetX || 0,
                top: part.offsetY || 0,
                width: part.width || 280,
                fontFamily: finalStyle.fontFamily,
                fontSize: finalStyle.fontSize,
                fontWeight: finalStyle.fontWeight,
                fontStyle: finalStyle.fontStyle,
                fill: finalStyle.fill,
                lineHeight: finalStyle.lineHeight,
                charSpacing: finalStyle.charSpacing,
                textAlign: finalStyle.textAlign,
                selectable: false,
                evented: true,
                hasControls: false,
                hasBorders: false,
                objectCaching: false,
                splitByGrapheme: false,
                editable: false,
                visible: true,
                opacity: 1
              });
            
              DBG(`Textbox created with properties:`, {
                id: part.id,
                left: textObj.left,
                top: textObj.top,
                width: textObj.width,
                height: textObj.height,
                fontSize: textObj.fontSize,
                fill: textObj.fill,
                text: textObj.text,
                visible: textObj.visible,
                opacity: textObj.opacity,
                actualTextLength: textObj.text?.length || 0
              });
            
              // Metadaten für Interaktion
              (textObj as any).__partId = part.id;
              (textObj as any).__fieldType = part.fieldType;
              (textObj as any).__sectionType = section.sectionType;
            
              textObjects.push(textObj);
              DBG(`Text object created successfully for part ${partIndex}:`, {
                id: part.id,
                fabricObject: {
                  left: textObj.left,
                  top: textObj.top,
                  width: textObj.width,
                  height: textObj.height,
                  text: textObj.text
                }
              });
              
            } catch (error) {
              DBG(`Error creating text object for part ${partIndex}:`, error);
            }
          });
          
          DBG(`Text objects created for section ${section.id}:`, {
            count: textObjects.length,
            expectedCount: section.parts?.length || 0,
            objects: textObjects.map(obj => ({
              left: obj.left,
              top: obj.top,
              width: obj.width,
              height: obj.height,
              text: obj.text?.substring(0, 20) + '...',
              fill: obj.fill,
              fontSize: obj.fontSize,
              visible: obj.visible
            }))
          });
          
          // Erstelle Fabric Group für die Section
          if (textObjects.length > 0) {
            try {
              DBG(`Creating group for section ${section.id} with frame:`, {
                left: section.x || 50,
                top: section.y || 50,
                width: section.width || 500,
                height: section.height || 150
              });
              
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
                objectCaching: false,
                visible: true,
                opacity: 1
              });
            
              DBG(`Group created with properties:`, {
                sectionId: section.id,
                left: sectionGroup.left,
                top: sectionGroup.top,
                width: sectionGroup.width,
                height: sectionGroup.height,
                objectsInGroup: sectionGroup.getObjects().length,
                visible: sectionGroup.visible,
                opacity: sectionGroup.opacity
              });
            
              (sectionGroup as any).__sectionId = section.id;
              (sectionGroup as any).__sectionType = section.sectionType;
              (sectionGroup as any).__sectionTitle = section.title;
            
              DBG(`About to add group to canvas:`, {
                sectionId: section.id,
                groupPosition: { left: sectionGroup.left, top: sectionGroup.top },
                groupSize: { width: sectionGroup.width, height: sectionGroup.height },
                textObjectsInGroup: sectionGroup.getObjects().length
              });
              
              canvas.add(sectionGroup);
              
              // DEBUG: Canvas-Zustand nach Hinzufügen der Gruppe überprüfen
              DBG(`Canvas state after adding group:`, {
                totalObjects: canvas.getObjects().length,
                canvasSize: { width: canvas.getWidth(), height: canvas.getHeight() },
                zoom: canvas.getZoom(),
                backgroundColor: canvas.backgroundColor,
                lastAddedGroup: {
                  id: section.id,
                  position: { left: sectionGroup.left, top: sectionGroup.top },
                  size: { width: sectionGroup.width, height: sectionGroup.height },
                  visible: sectionGroup.visible,
                  opacity: sectionGroup.opacity,
                  groupBounds: sectionGroup.getBoundingRect?.() || 'unknown'
                }
              });
            
              DBG(`✅ Successfully added section group ${sectionIndex}:`, { 
                id: section.id,
                title: section.title,
                position: { left: sectionGroup.left, top: sectionGroup.top },
                size: { width: sectionGroup.width, height: sectionGroup.height },
                textObjectsCount: textObjects.length
              });
              
            } catch (error) {
              console.error(`CRITICAL: Error creating section group ${sectionIndex}:`, error);
            }
          } else {
            console.warn(`WARNING: No text objects created for section ${section.id}, skipping group creation`);
            DBG(`WARNING: No text objects created for section ${section.id}, skipping group creation. Section data:`, {
              sectionId: section.id,
              sectionTitle: section.title,
              partsCount: section.parts?.length || 0,
              parts: section.parts?.map(p => ({
                id: p.id,
                fieldType: p.fieldType,
                text: p.text,
                hasText: !!p.text?.trim()
              })) || []
            });
          }
        });

        DBG('About to request canvas render...');
        canvas.requestRenderAll();
        DBG('✅ Canvas render complete:', { 
          totalGroups: canvas.getObjects().length,
          sectionsProcessed: safeSections.length,
          canvasSize: { width: canvas.getWidth(), height: canvas.getHeight() },
          finalCanvasObjects: canvas.getObjects().map((obj: any) => ({
            type: obj.type,
            left: obj.left,
            top: obj.top,
            width: obj.width,
            height: obj.height,
            visible: obj.visible,
            sectionId: obj.__sectionId || 'unknown'
          }))
        });
        DBG('=== RENDERING SECTIONS END ===');
        
      } catch (error) {
        console.error('CRITICAL: FabricCanvas rendering error:', error);
      }
    })();
  }, [sections, version, updateFrame, updateTypographySelection]);

  return (
    <div className="w-full h-full overflow-auto bg-gray-50" style={{ minHeight: '600px' }}>
      <div className="shadow-lg" style={{ 
        width: PAGE_W, 
        height: PAGE_H, 
        backgroundColor: '#ffffff',
        border: '3px solid blue'
      }}>
        <canvas ref={canvasCallbackRef} />
      </div>
    </div>
  );
}