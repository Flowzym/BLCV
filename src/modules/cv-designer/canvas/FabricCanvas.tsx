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
            const calculatedStyle = {
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
            
            // 🔥 AGGRESSIVE DEBUG OVERRIDES - FORCE VISIBLE STYLES 🔥
            const finalStyle = {
              // Start with calculated style
              ...calculatedStyle,
              
              // FORCE visible properties for debugging
              fill: 'red',                    // 🔥 Force red text to make it visible
              fontSize: 24,                   // 🔥 Force large font size
              fontFamily: 'Arial, sans-serif', // 🔥 Force basic font
              fontWeight: 'bold',             // 🔥 Force bold for visibility
              backgroundColor: 'yellow',       // 🔥 Force yellow background
              stroke: 'blue',                 // 🔥 Force blue outline
              strokeWidth: 2,                 // 🔥 Force thick outline
              opacity: 1,                     // 🔥 Force full opacity
              visible: true,                  // 🔥 Force visible
              textAlign: 'left'               // 🔥 Force left alignment
            };
            
            // 🔥 EXTENDED DEBUG LOGGING 🔥
            DBG(`🔥 AGGRESSIVE DEBUG - Style calculation for part ${partIndex}:`, {
              partId: part.id,
              fieldType: part.fieldType,
              originalText: part.text,
              displayText: displayText,
              
              // Style sources
              baseStyle: baseStyle,
              legacyGlobalStyle: legacyGlobalStyle,
              newGlobalStyle: newGlobalStyle,
              inlineStyle: inlineStyle,
              
              // Calculated vs Final
              calculatedStyle: calculatedStyle,
              finalStyle: finalStyle,
              
              // Critical properties
              finalFill: finalStyle.fill,
              finalFontSize: finalStyle.fontSize,
              finalFontFamily: finalStyle.fontFamily,
              finalWidth: part.width || 280,
              finalOpacity: finalStyle.opacity,
              finalVisible: finalStyle.visible,
              
              // Position
              offsetX: part.offsetX || 0,
              offsetY: part.offsetY || 0,
              
              // Validation checks
              hasValidText: !!(displayText && displayText.trim()),
              hasValidFill: !!(finalStyle.fill && finalStyle.fill !== 'transparent'),
              hasValidSize: finalStyle.fontSize > 0,
              hasValidWidth: (part.width || 280) > 0
            }
            );
            
            // 🔥 VALIDATE CRITICAL PROPERTIES 🔥
            if (!displayText || displayText.trim() === '') {
              DBG(`🚨 CRITICAL: Empty text detected for part ${partIndex}!`, {
                partId: part.id,
                originalText: part.text,
                displayText: displayText,
                textLength: displayText?.length || 0
              });
              return; // Skip this part
            }
            
            if (finalStyle.fontSize <= 0) {
              DBG(`🚨 CRITICAL: Invalid fontSize detected for part ${partIndex}!`, {
                partId: part.id,
                fontSize: finalStyle.fontSize,
                calculatedFontSize: calculatedStyle.fontSize,
                baseFontSize: baseStyle.fontSize
              });
              finalStyle.fontSize = 24; // Force fallback
            }
            
            if ((part.width || 280) <= 0) {
              DBG(`🚨 CRITICAL: Invalid width detected for part ${partIndex}!`, {
                partId: part.id,
                width: part.width,
                fallbackWidth: 280
              });
              part.width = 280; // Force fallback
            
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
              DBG(`🔥 About to create Textbox with AGGRESSIVE OVERRIDES:`, {
                text: displayText,
                left: part.offsetX || 0,
                top: part.offsetY || 0,
                width: part.width || 280,
                style: finalStyle,
                actualTextLength: displayText.length,
                isValidText: displayText.trim().length > 0,
                
                // 🔥 AGGRESSIVE DEBUG PROPERTIES 🔥
                forcedFill: finalStyle.fill,
                forcedFontSize: finalStyle.fontSize,
                forcedFontFamily: finalStyle.fontFamily,
                forcedBackgroundColor: finalStyle.backgroundColor,
                forcedStroke: finalStyle.stroke,
                forcedStrokeWidth: finalStyle.strokeWidth,
                forcedOpacity: finalStyle.opacity,
                forcedVisible: finalStyle.visible
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
                
                // 🔥 AGGRESSIVE VISIBILITY OVERRIDES 🔥
                backgroundColor: finalStyle.backgroundColor,
                stroke: finalStyle.stroke,
                strokeWidth: finalStyle.strokeWidth,
                opacity: finalStyle.opacity,
                visible: finalStyle.visible,
                
                // 🔥 FORCE FABRIC.JS PROPERTIES FOR DEBUGGING 🔥
                selectable: false,
                evented: true,
                hasControls: false,
                hasBorders: false,
                objectCaching: false,
                splitByGrapheme: false,
                editable: false,
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                hoverCursor: 'pointer',
                moveCursor: 'pointer'
              });
            
              // 🔥 COMPREHENSIVE POST-CREATION VALIDATION 🔥
              DBG(`🔥 Textbox created - COMPREHENSIVE VALIDATION:`, {
                id: part.id,
                fieldType: part.fieldType,
                
                // Position and size
                left: textObj.left,
                top: textObj.top,
                width: textObj.width,
                height: textObj.height,
                
                // Typography
                fontSize: textObj.fontSize,
                fontFamily: textObj.fontFamily,
                fontWeight: textObj.fontWeight,
                fontStyle: textObj.fontStyle,
                
                // Colors and visibility
                fill: textObj.fill,
                backgroundColor: textObj.backgroundColor,
                stroke: textObj.stroke,
                strokeWidth: textObj.strokeWidth,
                opacity: textObj.opacity,
                visible: textObj.visible,
                
                // Text content
                text: textObj.text,
                actualTextLength: textObj.text?.length || 0,
                fabricTextLength: textObj.text?.length || 0,
                isTextEmpty: !textObj.text || textObj.text.trim() === '',
                
                // Fabric.js internal properties
                type: textObj.type,
                canvas: !!textObj.canvas,
                group: !!textObj.group,
                
                // Bounding box
                boundingRect: textObj.getBoundingRect ? textObj.getBoundingRect() : 'not available',
                
                // 🔥 CRITICAL VALIDATION FLAGS 🔥
                isTextValid: !!(textObj.text && textObj.text.trim()),
                isSizeValid: textObj.fontSize > 0 && textObj.width > 0,
                isColorValid: !!(textObj.fill && textObj.fill !== 'transparent'),
                isPositionValid: textObj.left >= 0 && textObj.top >= 0,
                isVisibilityValid: textObj.visible === true && textObj.opacity > 0
              });
              
              // CRITICAL: Additional validation after creation
              if (!textObj.text || textObj.text.trim() === '') {
                DBG(`ERROR: Textbox created but has no text content!`, {
                  originalDisplayText: displayText,
                  fabricText: textObj.text,
                  partId: part.id
                });
                return;
              }
              
              // 🔥 ADDITIONAL FABRIC.JS VALIDATION 🔥
              if (textObj.fontSize <= 0) {
                DBG(`🚨 CRITICAL: Textbox has invalid fontSize after creation!`, {
                  partId: part.id,
                  fontSize: textObj.fontSize,
                  requestedFontSize: finalStyle.fontSize
                });
              }
              
              if (!textObj.fill || textObj.fill === 'transparent') {
                DBG(`🚨 CRITICAL: Textbox has invalid fill after creation!`, {
                  partId: part.id,
                  fill: textObj.fill,
                  requestedFill: finalStyle.fill
                });
              }
              
              if (textObj.width <= 0) {
                DBG(`🚨 CRITICAL: Textbox has invalid width after creation!`, {
                  partId: part.id,
                  width: textObj.width,
                  requestedWidth: part.width || 280
                });
              }
              
              // 🔥 FORCE RENDER PROPERTIES IF NEEDED 🔥
              if (textObj.fontSize <= 0) {
                textObj.set('fontSize', 24);
                DBG(`🔧 FIXED: Forced fontSize to 24 for part ${part.id}`);
              }
              
              if (!textObj.fill || textObj.fill === 'transparent') {
                textObj.set('fill', 'red');
                DBG(`🔧 FIXED: Forced fill to red for part ${part.id}`);
              }
              
              if (textObj.width <= 0) {
                textObj.set('width', 300);
                DBG(`🔧 FIXED: Forced width to 300 for part ${part.id}`);
              }
            
              // Metadaten für Interaktion
              (textObj as any).__partId = part.id;
              (textObj as any).__fieldType = part.fieldType;
              (textObj as any).__sectionType = section.sectionType;
            
              textObjects.push(textObj);
              DBG(`🔥 Text object FINAL VALIDATION for part ${partIndex}:`, {
                id: part.id,
                fieldType: part.fieldType,
                
                // Final Fabric.js object properties
                fabricObject: {
                  left: textObj.left,
                  top: textObj.top,
                  width: textObj.width,
                  height: textObj.height,
                  text: textObj.text,
                  textPreview: textObj.text?.substring(0, 30) + '...',
                  hasValidText: !!(textObj.text && textObj.text.trim()),
                  
                  // 🔥 CRITICAL RENDERING PROPERTIES 🔥
                  fill: textObj.fill,
                  fontSize: textObj.fontSize,
                  fontFamily: textObj.fontFamily,
                  backgroundColor: textObj.backgroundColor,
                  stroke: textObj.stroke,
                  strokeWidth: textObj.strokeWidth,
                  opacity: textObj.opacity,
                  visible: textObj.visible,
                  
                  // 🔥 VALIDATION RESULTS 🔥
                  isTextValid: !!(textObj.text && textObj.text.trim()),
                  isSizeValid: textObj.fontSize > 0 && textObj.width > 0,
                  isColorValid: !!(textObj.fill && textObj.fill !== 'transparent'),
                  isPositionValid: textObj.left >= 0 && textObj.top >= 0,
                  isVisibilityValid: textObj.visible === true && textObj.opacity > 0,
                  
                  // 🔥 FABRIC.JS INTERNAL STATE 🔥
                  fabricType: textObj.type,
                  fabricCanvas: !!textObj.canvas,
                  fabricGroup: !!textObj.group,
                  fabricBounds: textObj.getBoundingRect ? textObj.getBoundingRect() : 'not available'
                }
              });
              
            } catch (error) {
              DBG(`🚨 CRITICAL ERROR creating text object for part ${partIndex}:`, {
                error: error,
                errorMessage: error instanceof Error ? error.message : String(error),
                errorStack: error instanceof Error ? error.stack : 'no stack',
                partData: part,
                displayText: displayText,
                calculatedStyle: calculatedStyle,
                finalStyle: finalStyle,
                
                // Context for debugging
                sectionId: section.id,
                sectionType: section.sectionType,
                partIndex: partIndex,
                totalPartsInSection: section.parts?.length || 0
              });
              
              // 🔥 TRY TO CREATE A MINIMAL FALLBACK TEXTBOX 🔥
              try {
                DBG(`🔧 Attempting to create fallback textbox for part ${partIndex}...`);
                const fallbackTextObj = new fabric.Textbox(`FALLBACK: ${displayText}`, {
                  left: part.offsetX || 0,
                  top: part.offsetY || 0,
                  width: 300,
                  fontSize: 20,
                  fill: 'red',
                  fontFamily: 'Arial',
                  backgroundColor: 'yellow',
                  selectable: false,
                  evented: false
                });
                
                (fallbackTextObj as any).__partId = part.id + '-fallback';
                (fallbackTextObj as any).__fieldType = part.fieldType;
                (fallbackTextObj as any).__sectionType = section.sectionType;
                
                textObjects.push(fallbackTextObj);
                DBG(`🔧 Fallback textbox created successfully for part ${partIndex}`);
              } catch (fallbackError) {
                DBG(`🚨 FALLBACK CREATION ALSO FAILED for part ${partIndex}:`, fallbackError);
              }
            }
          });
          
          DBG(`🔥 COMPREHENSIVE TEXT OBJECTS SUMMARY for section ${section.id}:`, {
            count: textObjects.length,
            expectedCount: section.parts?.length || 0,
            successRate: `${textObjects.length}/${section.parts?.length || 0}`,
            
            // 🔥 DETAILED OBJECT ANALYSIS 🔥
            objects: textObjects.map((obj, idx) => ({
              index: idx,
              id: obj.__partId || 'unknown',
              fieldType: obj.__fieldType || 'unknown',
              
              // Position and size
              left: obj.left,
              top: obj.top,
              width: obj.width,
              height: obj.height,
              
              // Text content
              text: obj.text?.substring(0, 20) + '...',
              fullText: obj.text,
              textLength: obj.text?.length || 0,
              
              // Visual properties
              fill: obj.fill,
              fontSize: obj.fontSize,
              fontFamily: obj.fontFamily,
              backgroundColor: obj.backgroundColor,
              stroke: obj.stroke,
              strokeWidth: obj.strokeWidth,
              opacity: obj.opacity,
              visible: obj.visible,
              
              // 🔥 VALIDATION FLAGS 🔥
              hasValidText: !!(obj.text && obj.text.trim()),
              hasValidFill: !!(obj.fill && obj.fill !== 'transparent'),
              hasValidSize: obj.fontSize > 0 && obj.width > 0,
              hasValidPosition: obj.left >= 0 && obj.top >= 0,
              isFullyValid: !!(obj.text && obj.text.trim()) && 
                           !!(obj.fill && obj.fill !== 'transparent') && 
                           obj.fontSize > 0 && obj.width > 0 && 
                           obj.left >= 0 && obj.top >= 0 && 
                           obj.visible === true && obj.opacity > 0,
              
              // 🔥 FABRIC.JS INTERNAL STATE 🔥
              fabricType: obj.type,
              fabricCanvas: !!obj.canvas,
              fabricGroup: !!obj.group
            }))
          });
          
          // Erstelle Fabric Group für die Section
          if (textObjects.length > 0) {
            try {
              DBG(`🔥 Creating group for section ${section.id} - COMPREHENSIVE ANALYSIS:`, {
                sectionId: section.id,
                sectionTitle: section.title,
                sectionType: section.sectionType,
                
                // Group frame
                left: section.x || 50,
                top: section.y || 50,
                width: section.width || 500,
                height: section.height || 150,
                
                // Text objects to be grouped
                textObjectsCount: textObjects.length,
                validTextObjects: textObjects.filter(obj => 
                  !!(obj.text && obj.text.trim()) && 
                  !!(obj.fill && obj.fill !== 'transparent') && 
                  obj.fontSize > 0 && obj.width > 0
                ).length,
                
                // 🔥 TEXT OBJECTS DETAILED ANALYSIS 🔥
                textObjectsAnalysis: textObjects.map((obj, idx) => ({
                  index: idx,
                  id: obj.__partId,
                  text: obj.text?.substring(0, 15) + '...',
                  position: { left: obj.left, top: obj.top },
                  size: { width: obj.width, height: obj.height },
                  style: { 
                    fill: obj.fill, 
                    fontSize: obj.fontSize, 
                    fontFamily: obj.fontFamily,
                    backgroundColor: obj.backgroundColor,
                    stroke: obj.stroke,
                    opacity: obj.opacity,
                    visible: obj.visible
                  },
                  isValid: !!(obj.text && obj.text.trim()) && 
                          !!(obj.fill && obj.fill !== 'transparent') && 
                          obj.fontSize > 0 && obj.width > 0 && 
                          obj.visible === true && obj.opacity > 0
                }))
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
                opacity: 1,
                // 🔥 FORCE GROUP VISIBILITY 🔥
                backgroundColor: 'rgba(0, 255, 0, 0.1)', // Light green background for debugging
                stroke: 'green',
                strokeWidth: 3
              });
            
              // 🔥 COMPREHENSIVE GROUP VALIDATION 🔥
              DBG(`🔥 Group created - COMPREHENSIVE VALIDATION:`, {
                sectionId: section.id,
                sectionTitle: section.title,
                
                // Group properties
                left: sectionGroup.left,
                top: sectionGroup.top,
                width: sectionGroup.width,
                height: sectionGroup.height,
                
                // Group visibility
                visible: sectionGroup.visible,
                opacity: sectionGroup.opacity,
                backgroundColor: sectionGroup.backgroundColor,
                stroke: sectionGroup.stroke,
                strokeWidth: sectionGroup.strokeWidth,
                
                // Objects in group
                objectsInGroup: sectionGroup.getObjects().length,
                textObjectsWithContent: sectionGroup.getObjects().filter((obj: any) => obj.text && obj.text.trim()).length,
                
                // 🔥 GROUP OBJECTS DETAILED ANALYSIS 🔥
                groupObjectsAnalysis: sectionGroup.getObjects().map((obj: any, idx: number) => ({
                  index: idx,
                  type: obj.type,
                  id: obj.__partId || 'unknown',
                  text: obj.text?.substring(0, 15) + '...',
                  position: { left: obj.left, top: obj.top },
                  size: { width: obj.width, height: obj.height },
                  fill: obj.fill,
                  fontSize: obj.fontSize,
                  visible: obj.visible,
                  opacity: obj.opacity,
                  hasValidText: !!(obj.text && obj.text.trim()),
                  isVisible: obj.visible === true && obj.opacity > 0
                })),
                
                // 🔥 GROUP VALIDATION FLAGS 🔥
                hasValidObjects: sectionGroup.getObjects().length > 0,
                hasVisibleObjects: sectionGroup.getObjects().filter((obj: any) => 
                  obj.visible === true && obj.opacity > 0
                ).length,
                hasTextObjects: sectionGroup.getObjects().filter((obj: any) => 
                  obj.text && obj.text.trim()
                ).length,
                groupBoundingRect: sectionGroup.getBoundingRect ? sectionGroup.getBoundingRect() : 'not available'
              });
            
              (sectionGroup as any).__sectionId = section.id;
              (sectionGroup as any).__sectionType = section.sectionType;
              (sectionGroup as any).__sectionTitle = section.title;
            
              DBG(`🔥 About to add group to canvas - FINAL CHECK:`, {
                sectionId: section.id,
                sectionTitle: section.title,
                groupPosition: { left: sectionGroup.left, top: sectionGroup.top },
                groupSize: { width: sectionGroup.width, height: sectionGroup.height },
                textObjectsInGroup: sectionGroup.getObjects().length,
                validTextObjects: sectionGroup.getObjects().filter((obj: any) => obj.text && obj.text.trim()).length,
                
                // 🔥 CANVAS STATE BEFORE ADDING 🔥
                canvasObjectsBeforeAdd: canvas.getObjects().length,
                canvasSize: { width: canvas.getWidth(), height: canvas.getHeight() },
                canvasZoom: canvas.getZoom(),
                canvasBackgroundColor: canvas.backgroundColor
              });
              
              canvas.add(sectionGroup);
              
              // 🔥 COMPREHENSIVE CANVAS STATE AFTER ADDING GROUP 🔥
              DBG(`🔥 Canvas state after adding group - COMPREHENSIVE ANALYSIS:`, {
                sectionId: section.id,
                
                // Canvas state
                totalObjects: canvas.getObjects().length,
                canvasSize: { width: canvas.getWidth(), height: canvas.getHeight() },
                zoom: canvas.getZoom(),
                backgroundColor: canvas.backgroundColor,
                
                // Added group analysis
                addedGroup: {
                  id: section.id,
                  title: section.title,
                  position: { left: sectionGroup.left, top: sectionGroup.top },
                  size: { width: sectionGroup.width, height: sectionGroup.height },
                  visible: sectionGroup.visible,
                  opacity: sectionGroup.opacity,
                  backgroundColor: sectionGroup.backgroundColor,
                  stroke: sectionGroup.stroke,
                  groupBounds: sectionGroup.getBoundingRect?.() || 'unknown',
                  
                  // 🔥 DETAILED TEXT OBJECTS IN GROUP 🔥
                  textObjectsInGroup: sectionGroup.getObjects().map((obj: any, idx: number) => ({
                    index: idx,
                    type: obj.type,
                    id: obj.__partId || 'unknown',
                    fieldType: obj.__fieldType || 'unknown',
                    text: obj.text?.substring(0, 30) + '...',
                    fullText: obj.text,
                    
                    // Position within group
                    left: obj.left,
                    top: obj.top,
                    width: obj.width,
                    height: obj.height,
                    
                    // Visual properties
                    fill: obj.fill,
                    fontSize: obj.fontSize,
                    fontFamily: obj.fontFamily,
                    backgroundColor: obj.backgroundColor,
                    stroke: obj.stroke,
                    strokeWidth: obj.strokeWidth,
                    opacity: obj.opacity,
                    visible: obj.visible,
                    
                    // 🔥 VALIDATION FOR EACH OBJECT 🔥
                    isTextValid: !!(obj.text && obj.text.trim()),
                    isSizeValid: obj.fontSize > 0 && obj.width > 0,
                    isColorValid: !!(obj.fill && obj.fill !== 'transparent'),
                    isPositionValid: obj.left >= 0 && obj.top >= 0,
                    isVisibilityValid: obj.visible === true && obj.opacity > 0,
                    isFullyValid: !!(obj.text && obj.text.trim()) && 
                                 !!(obj.fill && obj.fill !== 'transparent') && 
                                 obj.fontSize > 0 && obj.width > 0 && 
                                 obj.left >= 0 && obj.top >= 0 && 
                                 obj.visible === true && obj.opacity > 0
                  }))
                },
                
                // 🔥 CANVAS OBJECTS OVERVIEW 🔥
                allCanvasObjects: canvas.getObjects().map((obj: any, idx: number) => ({
                  index: idx,
                  type: obj.type,
                  id: obj.__sectionId || 'unknown',
                  position: { left: obj.left, top: obj.top },
                  size: { width: obj.width, height: obj.height },
                  visible: obj.visible,
                  opacity: obj.opacity,
                  hasObjects: obj.type === 'group' ? obj.getObjects().length : 'not-group'
                }))
              });
            
              DBG(`🔥 ✅ Successfully added section group ${sectionIndex} - FINAL SUMMARY:`, { 
                id: section.id,
                title: section.title,
                sectionType: section.sectionType,
                position: { left: sectionGroup.left, top: sectionGroup.top },
                size: { width: sectionGroup.width, height: sectionGroup.height },
                textObjectsCount: textObjects.length,
                validTextObjectsCount: textObjects.filter(obj => 
                  !!(obj.text && obj.text.trim()) && 
                  !!(obj.fill && obj.fill !== 'transparent') && 
                  obj.fontSize > 0 && obj.width > 0 && 
                  obj.visible === true && obj.opacity > 0
                ).length,
                
                // 🔥 SUCCESS INDICATORS 🔥
                groupAddedToCanvas: canvas.getObjects().includes(sectionGroup),
                groupHasTextObjects: sectionGroup.getObjects().length > 0,
                groupIsVisible: sectionGroup.visible === true && sectionGroup.opacity > 0
              });
              
            } catch (error) {
              DBG(`🚨 CRITICAL: Error creating section group ${sectionIndex}:`, {
                error: error,
                errorMessage: error instanceof Error ? error.message : String(error),
                errorStack: error instanceof Error ? error.stack : 'no stack',
                sectionData: section,
                sectionId: section.id,
                sectionTitle: section.title,
                sectionType: section.sectionType,
                
                // Text objects that failed to group
                textObjectsData: textObjects.map(obj => ({
                  id: obj.__partId,
                  fieldType: obj.__fieldType,
                  text: obj.text,
                  textLength: obj.text?.length || 0,
                  left: obj.left,
                  top: obj.top,
                  width: obj.width,
                  height: obj.height,
                  fontSize: obj.fontSize,
                  fill: obj.fill,
                  visible: obj.visible,
                  opacity: obj.opacity
                })),
                
                // Context
                totalTextObjectsCreated: textObjects.length,
                expectedPartsCount: section.parts?.length || 0
              });
            }
          } else {
            DBG(`🚨 WARNING: No text objects created for section ${section.id}, skipping group creation. DETAILED ANALYSIS:`, {
              sectionId: section.id,
              sectionTitle: section.title,
              sectionType: section.sectionType,
              
              // Section frame
              sectionFrame: {
                x: section.x,
                y: section.y,
                width: section.width,
                height: section.height
              },
              
              // Parts analysis
              partsCount: section.parts?.length || 0,
              parts: section.parts?.map((p, idx) => ({
                index: idx,
                id: p.id,
                fieldType: p.fieldType,
                type: p.type,
                text: p.text,
                textLength: p.text?.length || 0,
                hasText: !!p.text?.trim(),
                
                // Position and size
                offsetX: p.offsetX,
                offsetY: p.offsetY,
                width: p.width,
                
                // Style properties
                fontSize: p.fontSize,
                fontFamily: p.fontFamily,
                color: p.color,
                fontWeight: p.fontWeight,
                fontStyle: p.fontStyle,
                
                // 🔥 VALIDATION FOR EACH PART 🔥
                isTextValid: !!(p.text && p.text.trim()),
                isPositionValid: (p.offsetX || 0) >= 0 && (p.offsetY || 0) >= 0,
                isSizeValid: (p.width || 280) > 0,
                isTypeValid: p.type === 'text'
              })) || [],
              
              // 🔥 SECTION VALIDATION SUMMARY 🔥
              hasValidParts: (section.parts || []).length > 0,
              hasTextParts: (section.parts || []).filter(p => p.type === 'text').length,
              hasPartsWithText: (section.parts || []).filter(p => p.text && p.text.trim()).length,
              hasPartsWithValidPosition: (section.parts || []).filter(p => 
                (p.offsetX || 0) >= 0 && (p.offsetY || 0) >= 0
              ).length,
              hasPartsWithValidSize: (section.parts || []).filter(p => (p.width || 280) > 0).length
            });
          }
        });

        DBG('🔥 About to request canvas render - FINAL CANVAS STATE:');
        
        // 🔥 FINAL CANVAS ANALYSIS BEFORE RENDER 🔥
        const finalCanvasObjects = canvas.getObjects();
        DBG(`🔥 FINAL CANVAS ANALYSIS:`, {
          totalCanvasObjects: finalCanvasObjects.length,
          canvasSize: { width: canvas.getWidth(), height: canvas.getHeight() },
          canvasZoom: canvas.getZoom(),
          canvasBackgroundColor: canvas.backgroundColor,
          
          // 🔥 DETAILED ANALYSIS OF ALL CANVAS OBJECTS 🔥
          canvasObjectsDetailed: finalCanvasObjects.map((obj: any, idx: number) => ({
            index: idx,
            type: obj.type,
            id: obj.__sectionId || 'unknown',
            title: obj.__sectionTitle || 'unknown',
            
            // Position and size
            position: { left: obj.left, top: obj.top },
            size: { width: obj.width, height: obj.height },
            
            // Visibility
            visible: obj.visible,
            opacity: obj.opacity,
            backgroundColor: obj.backgroundColor,
            stroke: obj.stroke,
            
            // Group analysis
            isGroup: obj.type === 'group',
            objectsInGroup: obj.type === 'group' ? obj.getObjects().length : 'not-group',
            
            // Text objects in group (if it's a group)
            textObjectsInGroup: obj.type === 'group' ? obj.getObjects().map((textObj: any, textIdx: number) => ({
              index: textIdx,
              type: textObj.type,
              id: textObj.__partId || 'unknown',
              fieldType: textObj.__fieldType || 'unknown',
              text: textObj.text?.substring(0, 20) + '...',
              position: { left: textObj.left, top: textObj.top },
              size: { width: textObj.width, height: textObj.height },
              fill: textObj.fill,
              fontSize: textObj.fontSize,
              visible: textObj.visible,
              opacity: textObj.opacity,
              hasText: !!(textObj.text && textObj.text.trim()),
              isFullyValid: !!(textObj.text && textObj.text.trim()) && 
                           !!(textObj.fill && textObj.fill !== 'transparent') && 
                           textObj.fontSize > 0 && textObj.width > 0 && 
                           textObj.visible === true && textObj.opacity > 0
            })) : 'not-group',
            
            // 🔥 VALIDATION FLAGS FOR EACH CANVAS OBJECT 🔥
            isPositionValid: obj.left >= 0 && obj.top >= 0,
            isSizeValid: obj.width > 0 && obj.height > 0,
            isVisibilityValid: obj.visible === true && obj.opacity > 0,
            isWithinCanvasBounds: obj.left < canvas.getWidth() && obj.top < canvas.getHeight()
          })),
          
          // 🔥 OVERALL VALIDATION SUMMARY 🔥
          totalValidObjects: finalCanvasObjects.filter((obj: any) => 
            obj.visible === true && obj.opacity > 0 && 
            obj.left >= 0 && obj.top >= 0 && 
            obj.width > 0 && obj.height > 0
          ).length,
          totalGroupsWithTextObjects: finalCanvasObjects.filter((obj: any) => 
            obj.type === 'group' && obj.getObjects().length > 0
          ).length,
          totalTextObjectsAcrossAllGroups: finalCanvasObjects.reduce((sum: number, obj: any) => 
            sum + (obj.type === 'group' ? obj.getObjects().length : 0), 0
          )
        });
        
        canvas.requestRenderAll();
        
        // 🔥 POST-RENDER VALIDATION 🔥
        setTimeout(() => {
          DBG(`🔥 POST-RENDER VALIDATION (after requestRenderAll):`, {
            canvasObjectsCount: canvas.getObjects().length,
            canvasIsRendered: true,
            
            // Check if objects are actually rendered
            renderedObjects: canvas.getObjects().map((obj: any) => ({
              type: obj.type,
              id: obj.__sectionId || 'unknown',
              visible: obj.visible,
              opacity: obj.opacity,
              isOnCanvas: !!obj.canvas,
              boundingRect: obj.getBoundingRect ? obj.getBoundingRect() : 'not available'
            }))
          });
        }, 100);
        
        DBG('🔥 ✅ Canvas render complete - SUMMARY:', { 
          totalGroups: canvas.getObjects().length,
          sectionsProcessed: safeSections.length,
          canvasSize: { width: canvas.getWidth(), height: canvas.getHeight() },
          
          // 🔥 FINAL SUMMARY OF CANVAS OBJECTS 🔥
          finalCanvasObjectsSummary: canvas.getObjects().map((obj: any, idx: number) => ({
            index: idx,
            type: obj.type,
            id: obj.__sectionId || 'unknown',
            title: obj.__sectionTitle || 'unknown',
            left: obj.left,
            top: obj.top,
            width: obj.width,
            height: obj.height,
            visible: obj.visible,
            opacity: obj.opacity,
            backgroundColor: obj.backgroundColor,
            stroke: obj.stroke,
            hasTextObjects: obj.type === 'group' ? obj.getObjects().length : 'not-group',
            validTextObjects: obj.type === 'group' ? obj.getObjects().filter((textObj: any) => 
              !!(textObj.text && textObj.text.trim()) && 
              !!(textObj.fill && textObj.fill !== 'transparent') && 
              textObj.fontSize > 0 && textObj.width > 0 && 
              textObj.visible === true && textObj.opacity > 0
            ).length : 'not-group',
            
            // 🔥 VALIDATION FLAGS 🔥
            isPositionValid: obj.left >= 0 && obj.top >= 0,
            isSizeValid: obj.width > 0 && obj.height > 0,
            isVisibilityValid: obj.visible === true && obj.opacity > 0,
            isWithinCanvas: obj.left < canvas.getWidth() && obj.top < canvas.getHeight(),
            isFullyValid: obj.visible === true && obj.opacity > 0 && 
                         obj.left >= 0 && obj.top >= 0 && 
                         obj.width > 0 && obj.height > 0 && 
                         obj.left < canvas.getWidth() && obj.top < canvas.getHeight()
          })),
          
          // 🔥 OVERALL SUCCESS METRICS 🔥
          successMetrics: {
            sectionsProcessed: safeSections.length,
            groupsCreated: canvas.getObjects().length,
            totalTextObjectsCreated: canvas.getObjects().reduce((sum: number, obj: any) => 
              sum + (obj.type === 'group' ? obj.getObjects().length : 0), 0
            ),
            fullyValidGroups: canvas.getObjects().filter((obj: any) => 
              obj.type === 'group' && obj.visible === true && obj.opacity > 0 && 
              obj.getObjects().length > 0
            ).length,
            renderingSuccessful: canvas.getObjects().length > 0
          }
        });
        
        // 🔥 ADD A SIMPLE TEST RECTANGLE FOR COMPARISON 🔥
        try {
          const testRect = new fabric.Rect({
            left: 10,
            top: 10,
            width: 100,
            height: 50,
            fill: 'purple',
            stroke: 'orange',
            strokeWidth: 3,
            selectable: false,
            evented: false
          });
          
          canvas.add(testRect);
          DBG(`🔥 TEST RECTANGLE ADDED:`, {
            position: { left: testRect.left, top: testRect.top },
            size: { width: testRect.width, height: testRect.height },
            fill: testRect.fill,
            stroke: testRect.stroke,
            visible: testRect.visible,
            opacity: testObj.opacity
          });
        } catch (testError) {
          DBG(`🚨 FAILED TO CREATE TEST RECTANGLE:`, testError);
        }
        
        DBG('🔥 === RENDERING SECTIONS END ===');
        
      } catch (error) {
        DBG('🚨 CRITICAL: FabricCanvas rendering error:', {
          error: error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : 'no stack',
              text: textObj.text?.substring(0, 20) + '...',
              hasText: !!(textObj.text && textObj.text.trim())
            })) : 'not-group'
          }))
        });
        DBG('=== RENDERING SECTIONS END ===');
        
      } catch (error) {
        DBG('CRITICAL: FabricCanvas rendering error:', {
          error: error,
          sectionsData: safeSections,
          sectionsCount: safeSections.length,
          canvasState: {
            width: canvas.getWidth(),
            height: canvas.getHeight(),
            objectCount: canvas.getObjects().length,
            zoom: canvas.getZoom(),
            backgroundColor: canvas.backgroundColor
          }
        });
      }
    })();
  }, [sections, version, updateFrame, updateTypographySelection]);

  return (
    <div style={{ 
        width: PAGE_W, 
        height: PAGE_H, 
        backgroundColor: '#ffffff'
      }}>
      <canvas ref={canvasCallbackRef} />
    </div>
  );
}