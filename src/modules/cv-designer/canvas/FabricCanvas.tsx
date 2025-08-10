import React, { useRef, useEffect, useState, useCallback } from "react";
import { getFabric } from "@/lib/fabric-shim";
import { useDesignerStore } from "../store/designerStore";
import CanvasRegistry from "./canvasRegistry";
import { installSectionResize } from "./installSectionResize";

const PAGE_W = 595;
const PAGE_H = 842;

function isCanvasAlive(c: any): c is import("fabric").Canvas {
  return !!c && !!(c as any).contextContainer && !!(c as any).contextTop;
}

export default function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [fabricNamespace, setFabricNamespace] = useState<any>(null);

  const sections = useDesignerStore((s) => s.sections);
  const tokens = useDesignerStore((s) => s.tokens);
  const margins = useDesignerStore((s) => s.margins);
  const zoom = useDesignerStore((s) => s.zoom);
  const globalFieldStyles = useDesignerStore((s) => s.globalFieldStyles);
  const partStyles = useDesignerStore((s) => s.partStyles);

  useEffect(() => {
    let isMounted = true;

    const initFabric = async () => {
      const fabric = await getFabric();
      if (!isMounted) return;

      setFabricNamespace(fabric);

      if (canvasRef.current) {
        if (CanvasRegistry.has(canvasRef.current)) {
          CanvasRegistry.dispose(canvasRef.current);
        }

        const canvas = CanvasRegistry.getOrCreate(canvasRef.current, fabric);
        canvas.setDimensions({ width: PAGE_W, height: PAGE_H });
        canvas.backgroundColor = "#ffffff";
        canvas.selection = true;
        canvas.preserveObjectStacking = true;

        setFabricCanvas(canvas);
        installSectionResize(canvas);
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

  const renderSections = useCallback(async () => {
    if (!fabricCanvas || !fabricNamespace || !sections) return;
    if (!isCanvasAlive(fabricCanvas)) return;

    fabricCanvas.clear();

    for (const section of sections) {
      if (!section?.isVisible) continue;
      if (!Array.isArray(section.parts) || section.parts.length === 0) continue;

      const textboxes: any[] = [];

      // zentrales Section-Padding (overridebar via section.props)
      const SEC_PAD_L = Number(section.props?.paddingLeft  ?? 24);
      const SEC_PAD_R = Number(section.props?.paddingRight ?? 24);
      const SEC_PAD_T = Number(section.props?.paddingTop   ?? 16);
      const SEC_PAD_B = Number(section.props?.paddingBottom?? 16);

      const BULLET_INDENT = Number(tokens?.bulletIndent ?? 18);

      for (const part of section.parts) {
        if (part.type !== "text") continue;

        const displayText = part.text ?? "";

        const indentPx = part.indentPx ?? (part.fieldType === "bullet" ? BULLET_INDENT : 0);
        const padL = SEC_PAD_L;
        const padT = SEC_PAD_T + Math.max(0, part.offsetY || 0); // offsetY nur als Feintuning
        const padR = SEC_PAD_R;
        const padB = SEC_PAD_B;

        const initialTextWidth = Math.max(1, section.width - padL - padR - indentPx);

        const globalStyle =
          globalFieldStyles[section.sectionType]?.[part.fieldType || "content"] || {};
        const partStyleKey = `${section.sectionType}:${part.fieldType}`;
        const localPartStyle = partStyles[partStyleKey] || {};

        const finalStyle = {
          fontSize:
            part.fontSize ||
            localPartStyle.fontSize ||
            globalStyle.fontSize ||
            tokens?.fontSize ||
            12,
          fontFamily:
            part.fontFamily ||
            localPartStyle.fontFamily ||
            globalStyle.fontFamily ||
            tokens?.fontFamily ||
            "Arial, sans-serif",
          fill:
            part.color ||
            localPartStyle.color ||
            globalStyle.textColor ||
            tokens?.colorPrimary ||
            "#000000",
          fontWeight:
            part.fontWeight || localPartStyle.fontWeight || globalStyle.fontWeight || "normal",
          fontStyle:
            part.fontStyle ||
            (localPartStyle.italic ? "italic" : globalStyle.fontStyle) ||
            "normal",
          lineHeight:
            part.lineHeight ||
            localPartStyle.lineHeight ||
            globalStyle.lineHeight ||
            tokens?.lineHeight ||
            1.4,
          charSpacing:
            (part.letterSpacing ||
              localPartStyle.letterSpacing ||
              globalStyle.letterSpacing ||
              0) * 1000,
          textAlign: part.textAlign || "left",
        };

        const tb = new fabricNamespace.Textbox(displayText, {
          left: 0, top: 0, width: initialTextWidth,
          ...finalStyle,
          splitByGrapheme: true,
          breakWords: true,
          selectable: false, evented: false,
          hasControls: false, hasBorders: false, editable: false,
          lockScalingX: true, lockScalingY: true,
          lockMovementX: true, lockMovementY: true, lockUniScaling: true,
          opacity: 1, visible: true,
          originX: "left", originY: "top",
          scaleX: 1, scaleY: 1, angle: 0, skewX: 0, skewY: 0,
        }) as any;

        tb.data = {
          fieldKey: part.id ?? `${section.id}:${part.fieldType}:${Math.random().toString(36).slice(2, 8)}`,
          padL, padT, padR, padB, indentPx,
          flow: true,
          order: Number.isFinite(part.order) ? part.order : 0,
          gapBefore: Number(part.gapBefore ?? 0),
          type: "textbox",
          lineHeight: finalStyle.lineHeight,
        };

        // Pre-Position TL→Center (wird im Installer finalisiert)
        const halfW = section.width / 2;
        const halfH = (section.height ?? 1) / 2;
        const tlX = padL + (indentPx || 0);
        const tlY = padT;
        tb.set({ left: tlX - halfW, top: tlY - halfH });
        tb.setCoords();

        textboxes.push(tb);
      }

      const sectionGroup = new fabricNamespace.Group(textboxes, {
        left: section.x,
        top: section.y,
        selectable: true, evented: true,
        hasControls: true, hasBorders: true,
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

      // Meta für Installer
      sectionGroup.data = {
        sectionId: section.id,
        type: "section",
        minHeight: Number(section.props?.minHeight ?? 32), // optionaler Mindestwert
      };
      sectionGroup.sectionId = section.id;
      sectionGroup.sectionType = section.sectionType;

      fabricCanvas.add(sectionGroup);

      // Initial-Layout: triggert Flow + Auto-Height sofort
      try {
        (sectionGroup as any).scaleX = 1;
        (sectionGroup as any).scaleY = 1;
        fabricCanvas.fire("object:scaling", { target: sectionGroup } as any);
        fabricCanvas.fire("object:modified", { target: sectionGroup } as any);
      } catch {}
    }

    fabricCanvas.renderAll();
  }, [fabricCanvas, fabricNamespace, sections, tokens, margins, globalFieldStyles, partStyles]);

  useEffect(() => {
    if (fabricCanvas && sections) {
      renderSections();
    }
  }, [fabricCanvas, sections, renderSections]);

  useEffect(() => {
    if (!fabricCanvas) return;
    const safeZoom = Math.max(0.1, Math.min(5, zoom || 1));
    fabricCanvas.setZoom(safeZoom);
    fabricCanvas.requestRenderAll();
  }, [fabricCanvas, zoom]);

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, position: "relative" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
