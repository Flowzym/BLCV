import React, { useRef, useEffect, useState, useCallback } from "react";
import { getFabric } from "@/lib/fabric-shim";
import { useDesignerStore } from "../store/designerStore";
import CanvasRegistry from "./canvasRegistry";

const DBG = (msg: string, ...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
    console.log('[FABRIC_CANVAS]', msg, ...args);
  } else {
    console.log('[FABRIC_CANVAS*]', msg, ...args);
  }
};

const PAGE_W = 595;
const PAGE_H = 842;

export default function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [fabricNamespace, setFabricNamespace] = useState<any>(null);

  // Store-Zugriff
  const sections = useDesignerStore((s) => s.sections);
  const tokens = useDesignerStore((s) => s.tokens);
  const margins = useDesignerStore((s) => s.margins);
  const zoom = useDesignerStore((s) => s.zoom);
  const globalFieldStyles = useDesignerStore((s) => s.globalFieldStyles);
  const partStyles = useDesignerStore((s) => s.partStyles);

  DBG('FabricCanvas render:', {
    sectionsCount: sections?.length || 0,
    hasTokens: !!tokens,
    hasMargins: !!margins,
    zoom: zoom,
    hasGlobalFieldStyles: !!globalFieldStyles,
    hasPartStyles: !!partStyles
  });

  // Fabric.js initialisieren
  useEffect(() => {
    let isMounted = true;

    const initFabric = async () => {
      try {
        DBG('Initializing Fabric.js...');
        const fabric = await getFabric();
        
        if (!isMounted) {
          DBG('Component unmounted during Fabric initialization');
          return;
        }

        setFabricNamespace(fabric);
        DBG('Fabric namespace loaded successfully');

        if (canvasRef.current) {
          DBG('Creating Fabric canvas...');
          
          // Dispose existing canvas if any
          if (CanvasRegistry.has(canvasRef.current)) {
            CanvasRegistry.dispose(canvasRef.current);
          }

          const canvas = CanvasRegistry.getOrCreate(canvasRef.current, fabric);
          
          canvas.setDimensions({
            width: PAGE_W,
            height: PAGE_H
          });

          canvas.backgroundColor = '#ffffff';
          canvas.selection = true;
          canvas.preserveObjectStacking = true;

          setFabricCanvas(canvas);
          DBG('Fabric canvas created successfully:', {
            width: canvas.getWidth(),
            height: canvas.getHeight(),
            backgroundColor: canvas.backgroundColor
          });
        }
      } catch (error) {
        DBG('Error initializing Fabric:', error);
        console.error('Fabric initialization failed:', error);
      }
    };

    initFabric();

    return () => {
      isMounted = false;
      if (canvasRef.current && CanvasRegistry.has(canvasRef.current)) {
        CanvasRegistry.dispose(canvasRef.current);
      }
    };
  }, []);

  // Zentrale Canvas-Reconciliation-Funktion
  const renderSections = useCallback(async () => {
    if (!fabricCanvas || !fabricNamespace || !sections) {
      DBG('Cannot render sections - missing dependencies:', {
        hasFabricCanvas: !!fabricCanvas,
        hasFabricNamespace: !!fabricNamespace,
        hasSections: !!sections,
        sectionsLength: sections?.length || 0
      });
      return;
    }

    DBG('=== STARTING CENTRAL CANVAS RECONCILIATION ===');
    DBG('Sections to render:', {
      count: sections.length,
      sections: sections.map(s => ({
        id: s.id,
        title: s.title,
        type: s.type,
        sectionType: s.sectionType,
        frame: { x: s.x, y: s.y, width: s.width, height: s.height },
        partsCount: s.parts?.length || 0,
        isVisible: s.isVisible
      }))
    });

    // PHASE 1: Komplette Canvas-Bereinigung
    fabricCanvas.clear();
    DBG('Canvas cleared completely');

    // PHASE 2: Sektionen neu erstellen
    for (const section of sections) {
      DBG(`=== CREATING SECTION: ${section.id} ===`);
      
      if (!section.isVisible) {
        DBG(`Skipping invisible section: ${section.id}`);
        continue;
      }

      if (!Array.isArray(section.parts) || section.parts.length === 0) {
        DBG(`Section ${section.id} has no parts to render`);
        continue;
      }

      // Erstelle Textboxen für alle Parts der Sektion
      const textboxes: any[] = [];
      
      for (const part of section.parts) {
        DBG(`=== CREATING TEXTBOX FOR PART: ${part.id} ===`);
        
        if (part.type !== 'text') {
          DBG(`Skipping non-text part: ${part.id}`);
          continue;
        }

        const displayText = part.text || `[Empty ${part.fieldType}]`;
        
        // Berechne Textbox-Breite basierend auf Sektion und Offset
        const textboxWidth = Math.max(50, section.width - (part.offsetX || 0) - 20);
        
        // Hole globale Styles für dieses Feld
        const globalStyle = globalFieldStyles[section.sectionType]?.[part.fieldType || 'content'] || {};
        const partStyleKey = `${section.sectionType}:${part.fieldType}`;
        const localPartStyle = partStyles[partStyleKey] || {};
        
        // Merge Styles: part > localPartStyle > globalStyle > tokens > defaults
        const finalStyle = {
          fontSize: part.fontSize || localPartStyle.fontSize || globalStyle.fontSize || tokens?.fontSize || 12,
          fontFamily: part.fontFamily || localPartStyle.fontFamily || globalStyle.fontFamily || tokens?.fontFamily || 'Arial, sans-serif',
          fill: part.color || localPartStyle.color || globalStyle.textColor || tokens?.colorPrimary || '#000000',
          fontWeight: part.fontWeight || localPartStyle.fontWeight || globalStyle.fontWeight || 'normal',
          fontStyle: part.fontStyle || (localPartStyle.italic ? 'italic' : globalStyle.fontStyle) || 'normal',
          lineHeight: part.lineHeight || localPartStyle.lineHeight || globalStyle.lineHeight || tokens?.lineHeight || 1.4,
          charSpacing: ((part.letterSpacing || localPartStyle.letterSpacing || globalStyle.letterSpacing || 0) * 1000) // Fabric uses 1/1000 em
        };

        DBG(`Creating textbox with final style:`, {
          partId: part.id,
          text: displayText.substring(0, 30) + '...',
          position: { x: part.offsetX, y: part.offsetY },
          width: textboxWidth,
          style: finalStyle
        });

        // PHASE 1 KRITISCH: Textboxen sind NICHT individuell selektierbar
        const textObj = new fabricNamespace.Textbox(displayText, {
          // Position relativ zur Gruppe (wird später durch Gruppe transformiert)
          left: part.offsetX || 0,
          top: part.offsetY || 0,
          width: textboxWidth,
          
          // Styling
          ...finalStyle,
          
          // Text-Eigenschaften
          textAlign: part.textAlign || 'left',
          splitByGrapheme: true,
          breakWords: true,
          
          // PHASE 1 KRITISCH: Keine direkte Interaktivität für Textboxen
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
          editable: false,
          
          // PHASE 1 KRITISCH: Sperren aller Transformationen
          lockScalingX: true,
          lockScalingY: true,
          lockMovementX: true,
          lockMovementY: true,
          lockUniScaling: true,
          
          // Sichtbarkeit
          opacity: 1,
          visible: true
        });

        // Metadaten für spätere Referenz speichern
        textObj.partId = part.id;
        textObj.fieldType = part.fieldType;
        textObj.sectionId = section.id;
        textObj.originalOffsetX = part.offsetX || 0;
        textObj.originalOffsetY = part.offsetY || 0;
        
        textboxes.push(textObj);
        
        DBG(`Created textbox for ${part.id}:`, {
          left: textObj.left,
          top: textObj.top,
          width: textObj.width,
          selectable: textObj.selectable,
          evented: textObj.evented,
          hasControls: textObj.hasControls,
          lockMovementX: textObj.lockMovementX,
          lockMovementY: textObj.lockMovementY
        });
      }

      // PHASE 2: Erstelle Sektionsgruppe mit allen Textboxen
      const sectionGroup = new fabricNamespace.Group(textboxes, {
        left: section.x,
        top: section.y,
        
        // PHASE 1 KRITISCH: Nur die Gruppe ist interaktiv
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
        
        // Styling der Sektion
        backgroundColor: section.props?.backgroundColor || 'transparent',
        stroke: section.props?.borderColor || '#e5e7eb',
        strokeWidth: parseInt(section.props?.borderWidth || '1', 10),
        fill: 'transparent',
        
        // Skalierung vermeiden
        lockUniScaling: false,
        
        // Eckstil
        cornerStyle: 'rect',
        cornerSize: 8,
        transparentCorners: false,
        borderColor: '#3b82f6',
        cornerColor: '#3b82f6'
      });

      // Metadaten für Sektion speichern
      sectionGroup.sectionId = section.id;
      sectionGroup.sectionType = section.sectionType;
      
      DBG(`Created section group for ${section.id}:`, {
        left: sectionGroup.left,
        top: sectionGroup.top,
        width: sectionGroup.width,
        height: sectionGroup.height,
        objectsCount: textboxes.length,
        selectable: sectionGroup.selectable,
        hasControls: sectionGroup.hasControls
      });

      // PHASE 1 KRITISCH: Vereinfachter modified-Handler nur für Canvas-Refresh
      sectionGroup.on('modified', function() {
        DBG(`Section ${section.id} modified - triggering canvas refresh`);
        fabricCanvas.renderAll();
      });

      // PHASE 3: Gruppe zum Canvas hinzufügen
      fabricCanvas.add(sectionGroup);
      DBG(`Added section group ${section.id} to canvas`);
    }

    // PHASE 4: Canvas final rendern
    fabricCanvas.renderAll();
    DBG('=== CENTRAL CANVAS RECONCILIATION COMPLETE ===');

  }, [fabricCanvas, fabricNamespace, sections, tokens, margins, globalFieldStyles, partStyles]);

  // Re-render when sections change (zentrale Reconciliation)
  useEffect(() => {
    if (fabricCanvas && sections) {
      DBG('Sections changed, triggering central reconciliation:', {
        sectionsCount: sections.length,
        canvasReady: !!fabricCanvas
      });
      renderSections();
    }
  }, [fabricCanvas, sections, renderSections]);

  // Zoom handling
  useEffect(() => {
    if (!fabricCanvas) return;
    
    const safeZoom = Math.max(0.1, Math.min(5, zoom || 1));
    DBG('Applying zoom:', { zoom, safeZoom });
    
    fabricCanvas.setZoom(safeZoom);
    fabricCanvas.renderAll();
  }, [fabricCanvas, zoom]);

  // PHASE 1: Click-Handler für Textbox-Auswahl (Vorbereitung für Phase 2)
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleCanvasClick = (e: any) => {
      const target = e.target;
      
      if (target && target.partId && target.fieldType && target.sectionId) {
        DBG('Textbox clicked:', {
          partId: target.partId,
          fieldType: target.fieldType,
          sectionId: target.sectionId,
          text: target.text?.substring(0, 30) + '...'
        });
        
        // TODO Phase 2: Hier wird später das HTML-Overlay für Textbearbeitung aktiviert
        console.log('TODO: Activate text editing overlay for:', target.fieldType);
      }
    };

    fabricCanvas.on('mouse:down', handleCanvasClick);
    
    return () => {
      fabricCanvas.off('mouse:down', handleCanvasClick);
    };
  }, [fabricCanvas]);

  return (
    <div className="relative bg-gray-100 p-4">
      <div className="bg-white shadow-lg border border-gray-300">
        {/* Canvas margins visualization */}
        <div 
          className="relative border-2 border-dashed border-orange-300"
          style={{
            width: PAGE_W,
            height: PAGE_H,
            margin: '20px'
          }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            style={{
              width: '100%',
              height: '100%'
            }}
          />
          
          {/* Debug overlay */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
            <div>Canvas: {PAGE_W}×{PAGE_H}</div>
            <div>Sections: {sections?.length || 0}</div>
            <div>Zoom: {Math.round((zoom || 1) * 100)}%</div>
            <div>Fabric: {fabricCanvas ? '✓' : '✗'}</div>
            <div className="text-green-400">Phase 1: Stabilized</div>
          </div>
        </div>
      </div>
    </div>
  );
}