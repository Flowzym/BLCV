import React, { useRef, useEffect, useState, useCallback } from "react";
import { getFabric } from "@/lib/fabric-shim";
import { useDesignerStore } from "../store/designerStore";
import CanvasRegistry from "./canvasRegistry";
import { installSectionResize } from "./installSectionResize";

const DBG = (msg: string, ...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === "true") {
    console.log("[FABRIC_CANVAS]", msg, ...args);
  }
};

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
      try {
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

  const renderSections = useCallback(async () => {
    if (!fabricCanvas || !fabricNamespace || !sections) return;
    if (!isCanvasAlive(fabricCanvas)) return;

    try {
      fabricCanvas.clear();
    } catch {
      return;
    }

    for (const section of sections) {
      if (!section?.isVisible) continue;
      if (!Array.isArray(section.parts) || section.parts.length === 0) continue;

      const textboxes: any[] = [];

      // → Zentrales Section-Padding (overridebar via section.props)
      const SEC_PAD_L = Number(section.props?.paddingLeft  ?? 24);
      const SEC_PAD_R = Number(section.props?.paddingRight ?? 24);
      const SEC_PAD_T = Number(section.props?.paddingTop   ?? 16);
      const SEC_PAD_B = Number(section.props?.paddingBottom?? 16);

      // → Standard-Einzug & Abstände (können pro part überschrieben werden)
      const BULLET_INDENT = Number(tokens?.bulletIndent ?? 18);
      const defaultGap: Record<string, number> = {
        period: 0,
        title: 6,
        company: 2,
        institution: 2,
        content: 4,
        bullet: 2,
        note: 4,
      };

      for (const part of section.parts) {
        if (part.type !== "text") continue;

        const displayText = part.text ?? "";

        // Anchored-Pads: Top ist jetzt das **section padding**, offsetY wird als Feintuning addiert (default 0)
        const indentPx =
          part.indentPx ??
          (part.fieldType === "bullet" ? BULLET_INDENT : 0);

        const padL = SEC_PAD_L;
        const padT = SEC_PAD_T + Math.max(0, part.offsetY || 0);
        const padR = SEC_PAD_R;
        const padB = SEC_PAD_B;

        // Textbreite folgt der Sectionsbreite abzüglich Pads + indent
        const initialTextWidth = Math.max(1, section.width - padL - padR - indentPx);

        // Styles zusammenführen
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

        // Flow-Metadaten
        tb.data = {
          fieldKey:
            part.id ?? `${section.id}:${part.fieldType}:${Math.random().toString(36).slice(2, 8)}`,
          padL, padT, padR, padB, indentPx,
          flow: true,
          order: Number.isFinite(part.order) ? part.order : 0,
          gapBefore:
            Number(part.gapBefore ??
              (defaultGap[part.fieldType || "content"] ?? 4)),
          type: "textbox",
          lineHeight: finalStyle.lineHeight,
        };

        tb.partId = part.id;
        tb.fieldType = part.fieldType;
        tb.sectionId = section.id;

        // anchored TL -> group center coords
        const halfW = section.width / 2;
        const halfH = section.height / 2;
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

      // wichtig: Installer-Hint
      sectionGroup.data = { sectionId: section.id, type: "section" };
      sectionGroup.sectionId = section.id;
      sectionGroup.sectionType = section.sectionType;

      fabricCanvas.add(sectionGroup);

      // Initial-Layout: verhindert Sprung beim ersten Anfassen
      try {
        (sectionGroup as any).scaleX = 1;
        (sectionGroup as any).scaleY = 1;
        fabricCanvas.fire("object:scaling", { target: sectionGroup } as any);
        fabricCanvas.fire("object:modified", { target: sectionGroup } as any);
      } catch {}
    }

    if (isCanvasAlive(fabricCanvas)) {
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas, fabricNamespace, sections, tokens, margins, globalFieldStyles, partStyles]);

  useEffect(() => {
    if (fabricCanvas && sections) {
      renderSections();
    }
  }, [fabricCanvas, sections, renderSections]);

  useEffect(() => {
    if (!fabricCanvas) return;
    const safeZoom = Math.max(0.1, Math.min(5, zoom || 1));
    if (isCanvasAlive(fabricCanvas)) {
      fabricCanvas.setZoom(safeZoom);
      fabricCanvas.requestRenderAll();
    }
  }, [fabricCanvas, zoom]);

  // Klick-Handler (Vorbereitung Overlay)
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
