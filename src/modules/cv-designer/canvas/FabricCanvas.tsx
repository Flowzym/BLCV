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

          // Add test rectangle to verify canvas is working
          const testRect = new fabric.Rect({
            left: 50,
            top: 50,
            width: 100,
            height: 50,
            fill: 'purple',
            stroke: 'black',
            strokeWidth: 2
          });
          canvas.add(testRect);
          DBG('Added purple test rectangle');

          canvas.renderAll();
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

  // Sections rendern
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

    DBG('=== STARTING SECTION RENDERING ===');
    DBG('Sections to render:', {
      count: sections.length,
      sections: sections.map(s => ({
        id: s.id,
        title: s.title,
        type: s.type,
        sectionType: s.sectionType,
        frame: { x: s.x, y: s.y, width: s.width, height: s.height },
        partsCount: s.parts?.length || 0,
        parts: s.parts?.map(p => ({
          id: p.id,
          fieldType: p.fieldType,
          text: p.text?.substring(0, 30) + '...',
          offset: { x: p.offsetX, y: p.offsetY },
          width: p.width
        })) || []
      }))
    });

    // Clear existing objects (except test rectangle)
    const objects = fabricCanvas.getObjects();
    const testObjects = objects.filter((obj: any) => obj.fill === 'purple');
    fabricCanvas.clear();
    
    // Re-add test objects
    testObjects.forEach((obj: any) => fabricCanvas.add(obj));

    // Render each section
    for (const section of sections) {
      DBG(`=== RENDERING SECTION: ${section.id} ===`);
      DBG('Section data:', {
        id: section.id,
        title: section.title,
        type: section.type,
        sectionType: section.sectionType,
        frame: { x: section.x, y: section.y, width: section.width, height: section.height },
        isVisible: section.isVisible,
        partsCount: section.parts?.length || 0
      });

      if (!section.isVisible) {
        DBG(`Skipping invisible section: ${section.id}`);
        continue;
      }

      if (!Array.isArray(section.parts) || section.parts.length === 0) {
        DBG(`Section ${section.id} has no parts to render`);
        continue;
      }

      // Create group for section with aggressive debug styling
      const sectionGroup = new fabricNamespace.Group([], {
        left: section.x,
        top: section.y,
        width: section.width,
        height: section.height,
        // AGGRESSIVE DEBUG: Make groups highly visible
        backgroundColor: 'rgba(0, 255, 0, 0.1)', // Light green background
        stroke: 'green',
        strokeWidth: 3,
        selectable: true,
        evented: true
      });

      DBG(`Created section group for ${section.id}:`, {
        left: sectionGroup.left,
        top: sectionGroup.top,
        width: sectionGroup.width,
        height: sectionGroup.height
      });

      // Render parts within section
      for (const part of section.parts) {
        DBG(`=== RENDERING PART: ${part.id} ===`);
        DBG('Part data:', {
          id: part.id,
          type: part.type,
          fieldType: part.fieldType,
          text: part.text,
          textLength: part.text?.length || 0,
          offset: { x: part.offsetX, y: part.offsetY },
          width: part.width,
          height: part.height,
          fontSize: part.fontSize,
          color: part.color,
          fontWeight: part.fontWeight,
          fontStyle: part.fontStyle
        });

        if (part.type !== 'text') {
          DBG(`Skipping non-text part: ${part.id} (type: ${part.type})`);
          continue;
        }

        const displayText = part.text || `[Empty ${part.fieldType}]`;
        
        if (!displayText.trim()) {
          DBG(`Part ${part.id} has empty text, using placeholder`);
        }

        // AGGRESSIVE DEBUG OVERRIDES - Force highly visible properties
        const debugTextObj = new fabricNamespace.Textbox(displayText, {
          left: part.offsetX || 0,
          top: part.offsetY || 0,
          width: part.width || 300,
          height: part.height || 50,
          
          // AGGRESSIVE OVERRIDES - These should be VERY visible
          fill: 'red',                    // Bright red text
          fontSize: 24,                   // Large font size
          fontFamily: 'Arial, sans-serif', // Basic font
          backgroundColor: 'yellow',       // Yellow background
          stroke: 'blue',                 // Blue outline
          strokeWidth: 1,
          
          // Text properties
          textAlign: 'left',
          splitByGrapheme: false,
          editable: false,
          selectable: true,
          evented: true,
          
          // Ensure visibility
          opacity: 1,
          visible: true
        });

        DBG(`Created textbox for ${part.id}:`, {
          text: displayText.substring(0, 50) + '...',
          left: debugTextObj.left,
          top: debugTextObj.top,
          width: debugTextObj.width,
          height: debugTextObj.height,
          fill: debugTextObj.fill,
          fontSize: debugTextObj.fontSize,
          fontFamily: debugTextObj.fontFamily,
          backgroundColor: debugTextObj.backgroundColor,
          stroke: debugTextObj.stroke,
          opacity: debugTextObj.opacity,
          visible: debugTextObj.visible
        });

        // Add to section group
        sectionGroup.addWithUpdate(debugTextObj);
        DBG(`Added textbox to section group ${section.id}`);
      }

      // Update group coordinates after adding all objects
      sectionGroup.setCoords();
      DBG(`Updated coordinates for section group ${section.id}`);

      // Add section group to canvas
      fabricCanvas.add(sectionGroup);
      DBG(`Added section group ${section.id} to canvas`);
    }

    // Final canvas state
    const allObjects = fabricCanvas.getObjects();
    DBG('=== FINAL CANVAS STATE ===');
    DBG('Canvas objects:', {
      totalObjects: allObjects.length,
      objects: allObjects.map((obj: any, index: number) => ({
        index,
        type: obj.type,
        left: obj.left,
        top: obj.top,
        width: obj.width,
        height: obj.height,
        fill: obj.fill,
        visible: obj.visible,
        opacity: obj.opacity,
        isGroup: obj.type === 'group',
        groupObjects: obj.type === 'group' ? obj.getObjects?.()?.length || 0 : 'N/A'
      }))
    });

    fabricCanvas.renderAll();
    DBG('Canvas render completed');

  }, [fabricCanvas, fabricNamespace, sections, tokens, margins, globalFieldStyles, partStyles]);

  // Re-render when sections change
  useEffect(() => {
    if (fabricCanvas && sections) {
      DBG('Sections changed, triggering re-render:', {
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
          </div>
        </div>
      </div>
    </div>
  );
}