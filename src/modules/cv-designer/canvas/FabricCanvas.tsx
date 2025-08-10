import React, { useRef, useEffect, useState, useCallback } from "react";
import { getFabric } from "@/lib/fabric-shim";
import { useDesignerStore } from "../store/designerStore";
import CanvasRegistry from "./canvasRegistry";
import { installSectionResize } from "./installSectionResize";

const DBG = (msg: string, ...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === "true") {
    console.log("[FABRIC_CANVAS]", msg, ...args);
  } else {
    // ruhig, aber sichtbar
    // console.log("[FABRIC_CANVAS*]", msg, ...args);
  }
};

const PAGE_W = 595;
const PAGE_H = 842;

/** Guard: ist der Fabric-Canvas noch „lebendig“? (nach dispose sind Kontexte weg) */
function isCanvasAlive(c: any): c is import("fabric").Canvas {
  return !!c && !!(c as any).contextContainer && !!(c as any).contextTop;
}

export default function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [fabricNamespace, setFabricNamespace] = useState<any>(null);

  // Store
  const sections = useDesignerStore((s) => s.sections);
  const tokens = useDesignerStore((s) => s.tokens);
  const margins = useDesignerStore((s) => s.margins);
  const zoom = useDesignerStore((s) => s.zoom);
  const globalFieldStyles = useDesignerStore((s) => s.globalFieldStyles);
  const partStyles = useDesignerStore((s) => s.partStyles);

  // Fabric init
  useEffect(() => {
    let isMounted = true;

    const initFabric = async () => {
      try {
        const fabric = await getFabric();
        if (!isMounted) return;

        setFabricNamespace(fabric);

        if (canvasRef.current) {
          // evtl. bestehenden Canvas entsorgen
          if (CanvasRegistry.has(canvasRef.current)) {
            CanvasRegistry.dispose(canvasRef.current);
          }

          const canvas = CanvasRegistry.getOrCreate(canvasRef.current, fabric);
          canvas.setDimensions({ width: PAGE_W, height: PAGE_H });
          canvas.backgroundColor = "#ffffff";
          canvas.selection = true;
          canvas.preserveObjectStacking = true;

          setFabricCanvas(canvas);

          // Resize-Installer aktivieren
          installSectionResize(canvas);
        }
      } catch (err) {
        console.error("Fabric initialization failed:", err);
      }
    };

    initFabric();

    return () => {
      isMounted = false;
      if (canvasRef.current && CanvasRegistry.has(canvasRef.current)) {
        CanvasRegistry.dispose(canvasRef.current);
      }
      setFabricCanvas(null);
      setFabricNamespace(null);
    };
  }, []);

  // zentrale Reconciliation
  const renderSections = useCallback(async () => {
    if (!fabricCanvas || !fabricNamespace || !sections) return;
    if (!isCanvasAlive(fabricCanvas)) return;

    // PHASE 1: Canvas säubern (nur wenn alive)
    try {
      fabricCanvas.clear();
    } catch {
      // kann passieren, wenn parallel disposed wird
      return;
    }

    // PHASE 2: Sektionen neu erstellen
    for (const section of sections) {
      if (!section?.isVisible) continue;
      if (!Array.isArray(section.parts) || section.parts.length === 0) continue;

      const textboxes: any[] = [];

      for (const part of section.parts) {
        if (part.type !== "text") continue;

        const displayText = part.text || "";
        const padL = Math.max(0, part.offsetX || 0);
        const padT = Math.max(0, part.offsetY || 0);
        const indentPx = 0; // wir nutzen offsets direkt; optional: für Bullets separat setzen
        const approxWidth = Math.max(50, (part.width ?? (section.width - padL - 20)));
        const padR = Math.max(0, section.width - padL - approxWidth - indentPx);
        const padB = 12;

        // Styles zusammenführen
        const globalStyle = globalFieldStyles[section.sectionType]?.[part.fieldType || "content"] || {};
        const partStyleKey = `${section.sectionType}:${part.fieldType}`;
        const localPartStyle = partStyles[partStyleKey] || {};

        const finalStyle = {
          fontSize: part.fontSize || localPartStyle.fontSize || globalStyle.fontSize || tokens?.fontSize || 12,
          fontFamily: part.fontFamily || localPartStyle.fontFamily || globalStyle.fontFamily || tokens?.fontFamily || "Arial, sans-serif",
          fill: part.color || localPartStyle.color || globalStyle.textColor || tokens?.colorPrimary || "#000000",
          fontWeight: part.fontWeight || localPartStyle.fontWeight || globalStyle.fontWeight || "normal",
          fontStyle: part.fontStyle || (localPartStyle.italic ? "italic" : globalStyle.fontStyle) || "normal",
          lineHeight: part.lineHeight || localPartStyle.lineHeight || globalStyle.lineHeight || tokens?.lineHeight || 1.4,
          charSpacing: ((part.letterSpacing || localPartStyle.letterSpacing || globalStyle.letterSpacing || 0) * 1000),
          textAlign: part.textAlign || "left",
        };

        const tb = new fabricNamespace.Textbox(displayText, {
          left: 0, // initial egal; wir setzen unten anchored TL
          top: 0,
          width: Math.max(1, section.width - padL - padR - indentPx),
          ...finalStyle,
          splitByGrapheme: true,
          breakWords: true,
          // Nicht direkt editierbar in Phase 1
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
          editable: false,
          // Locks
          lockScalingX: true,
          lockScalingY: true,
          lockMovementX: true,
          lockMovementY: true,
          lockUniScaling: true,
          opacity: 1,
          visible: true,
          originX: "left",
          originY: "top",
          scaleX: 1,
          scaleY: 1,
          angle: 0,
          skewX: 0,
          skewY: 0,
        }) as any;

        // Subfield-Metadaten
        tb.data = {
          fieldKey: part.id ?? `${section.id}:${part.fieldType}:${Math.random().toString(36).slice(2, 8)}`,
          padL, padT, padR, padB, indentPx,
          flow: true,
          order: Number.isFinite(part.order) ? part.order : 0,
          gapBefore: Number(part.gapBefore ?? 0),
          type: "textbox",
        };

        tb.partId = part.id;
        tb.fieldType = part.fieldType;
        tb.sectionId = section.id;

        // Initial-Position im Gruppen-Koordsystem (Center-basiert) nach anchored TL
        const halfW = section.width / 2;
        const halfH = section.height / 2;
        const tlX = padL + indentPx;
        const tlY = padT;
        tb.set({ left: tlX - halfW, top: tlY - halfH });
        tb.setCoords();

        textboxes.push(tb);
      }

      // Sektionsgruppe
      const sectionGroup = new fabricNamespace.Group(textboxes, {
        left: section.x,
        top: section.y,
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
        backgroundColor: section.props?.backgroundColor || "transparent",
        stroke: section.props?.borderColor || "#e5e7eb",
        strokeWidth: parseInt(section.props?.borderWidth || "1", 10),
        fill: "transparent",
        lockUniScaling: false,
        cornerStyle: "rect",
        cornerSize: 8,
        transparentCorners: false,
        borderColor: "#3b82f6",
        cornerColor: "#3b82f6",
      }) as any;

      // WICHTIG: data setzen, damit der Installer die Gruppe erkennt!
      sectionGroup.data = { sectionId: section.id, type: "section" };
      sectionGroup.sectionId = section.id;
      sectionGroup.sectionType = section.sectionType;

      fabricCanvas.add(sectionGroup);
    }

    // PHASE 4: rendern
    if (isCanvasAlive(fabricCanvas)) {
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas, fabricNamespace, sections, tokens, margins, globalFieldStyles, partStyles]);

  // Re-render bei Section-Änderung
  useEffect(() => {
    if (fabricCanvas && sections) {
      renderSections();
    }
  }, [fabricCanvas, sections, renderSections]);

  // Zoom
  useEffect(() => {
    if (!fabricCanvas) return;
    const safeZoom = Math.max(0.1, Math.min(5, zoom || 1));
    if (isCanvasAlive(fabricCanvas)) {
      fabricCanvas.setZoom(safeZoom);
      fabricCanvas.requestRenderAll();
    }
  }, [fabricCanvas, zoom]);

  // (Vorbereitung) Klick-Handler – später Overlay-Editor hier öffnen
  useEffect(() => {
    if (!fabricCanvas) return;
    const onMouseDown = (e: any) => {
      const t = e?.target;
      if (t?.type === "textbox" && t?.data?.fieldKey) {
        DBG("Textbox clicked:", {
          fieldKey: t.data.fieldKey,
          sectionId: t.sectionId,
          text: (t.text || "").slice(0, 50),
        });
        // TODO: Overlay-Editor öffnen
      }
    };
    fabricCanvas.on("mouse:down", onMouseDown);
    return () => {
      if (fabricCanvas) fabricCanvas.off("mouse:down", onMouseDown);
    };
  }, [fabricCanvas]);

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, position: "relative" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
