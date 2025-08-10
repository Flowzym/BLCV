// src/modules/cv-designer/canvas/FabricCanvas.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import { getFabric } from "@/lib/fabric-shim";
import { useDesignerStore } from "../store/designerStore";
import CanvasRegistry from "./canvasRegistry";
import { installSectionResize } from "./installSectionResize";
import TextEditorOverlay from "../ui/TextEditorOverlay";

const PAGE_W = 595;
const PAGE_H = 842;

type ActiveEdit =
  | null
  | {
      sectionId: string;
      sectionType: "experience" | "education" | "profile" | "skills" | "softskills" | "contact";
      fieldType: string;
      group: any;   // fabric.Group
      textbox: any; // fabric.Textbox
    };

export default function FabricCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [fabricNamespace, setFabricNamespace] = useState<any>(null);
  const [activeEdit, setActiveEdit] = useState<ActiveEdit>(null);

  // Store
  const sections = useDesignerStore((s) => s.sections);
  const tokens = useDesignerStore((s) => s.tokens);
  const margins = useDesignerStore((s) => s.margins);
  const zoom = useDesignerStore((s) => s.zoom);
  const globalFieldStyles = useDesignerStore((s) => s.globalFieldStyles);
  const partStyles = useDesignerStore((s) => s.partStyles);

  // Mount Canvas
  useEffect(() => {
    let disposed = false;
    (async () => {
      const fabric = await getFabric();
      if (disposed) return;

      setFabricNamespace(fabric);

      if (!canvasRef.current) return;
      if (CanvasRegistry.has(canvasRef.current)) {
        CanvasRegistry.dispose(canvasRef.current);
      }

      const canvas = CanvasRegistry.getOrCreate(canvasRef.current, fabric);
      canvas.setDimensions({ width: PAGE_W, height: PAGE_H });
      canvas.backgroundColor = "#ffffff";

      // Interaktion
      canvas.selection = true;
      canvas.subTargetCheck = true;
      canvas.perPixelTargetFind = true;
      canvas.targetFindTolerance = 6;

      // Hover-Highlight
      let lastHover: any = null;
      const onMouseMove = (e: any) => {
        const t = canvas.findTarget(e.e, true) as any;
        if (t === lastHover) return;

        if (lastHover && lastHover.__hoverStroke) {
          lastHover.set({ stroke: lastHover.__origStroke, strokeWidth: lastHover.__origStrokeWidth });
          lastHover.__hoverStroke = false;
          canvas.requestRenderAll();
        }
        lastHover = null;

        if (t && (t.type === "textbox" || t.data?.isMappingField)) {
          t.__origStroke = t.stroke;
          t.__origStrokeWidth = t.strokeWidth;
          t.set({ stroke: "#60a5fa", strokeWidth: 1.25 }); // blue-400
          t.__hoverStroke = true;
          canvas.setCursor("text");
          lastHover = t;
          canvas.requestRenderAll();
        } else {
          canvas.setCursor("default");
        }
      };

      // Textklick → Overlay öffnen; Leerklick → Overlay zu
      const onMouseUp = (e: any) => {
        let t: any = null;

        if (Array.isArray(e.subTargets) && e.subTargets.length) {
          t = e.subTargets.find((o: any) => o?.type === "textbox") ?? null;
        }
        if (!t && e.target && e.target.type === "textbox") t = e.target;

        // Klick in die Gruppe → ggf. Textbox via Point-Hit finden
        if (!t && e.target && e.target.type === "group") {
          const grp = e.target;
          const p = canvas.getPointer(e.e);
          const hit = (grp._objects || []).find((child: any) => {
            if (child.type !== "textbox") return false;
            const r = child.getBoundingRect(true, true);
            return p.x >= r.left && p.x <= r.left + r.width && p.y >= r.top && p.y <= r.top + r.height;
          });
          if (hit) t = hit;
        }

        if (!t) {
          setActiveEdit(null);
          return;
        }

        if (t.type === "textbox" && t.sectionId && t.fieldType) {
          const grp = t.group;
          if (!grp) return;
          setActiveEdit({
            sectionId: t.sectionId,
            sectionType: grp.sectionType || "experience",
            fieldType: t.fieldType,
            group: grp,
            textbox: t,
          });
        }
      };

      canvas.on("mouse:move", onMouseMove);
      canvas.on("mouse:up", onMouseUp);

      installSectionResize(canvas);

      setFabricCanvas(canvas);

      return () => {
        canvas.off("mouse:move", onMouseMove);
        canvas.off("mouse:up", onMouseUp);
        CanvasRegistry.dispose(canvasRef.current!);
        setFabricCanvas(null);
      };
    })();

    return () => {
      disposed = true;
    };
  }, []);

  // Renderer: zeichnet alle Sektionen + Mapping-Textboxen
  const renderSections = useCallback(() => {
    if (!fabricCanvas || !fabricNamespace || !sections) return;

    fabricCanvas.clear();

    let nextActive: ActiveEdit = activeEdit;

    for (const section of sections) {
      if (!section.isVisible) continue;
      if (!Array.isArray(section.parts) || section.parts.length === 0) continue;

      const textboxes: any[] = [];

      // Section-Padding
      const SEC_PAD_L = Number(section.props?.paddingLeft  ?? 24);
      const SEC_PAD_R = Number(section.props?.paddingRight ?? 24);
      const SEC_PAD_T = Number(section.props?.paddingTop   ?? 16);
      const SEC_PAD_B = Number(section.props?.paddingBottom?? 16);
      const BULLET_INDENT = Number(tokens?.bulletIndent ?? 18);

      // Hintergrund-Frame (unsichtbar, aber klick-/dragbar)
      const frame = new fabricNamespace.Rect({
        left: -section.width / 2,
        top: -section.height / 2,
        width: section.width,
        height: section.height,
        fill: "rgba(0,0,0,0)",
        stroke: section.props?.borderColor || "#e5e7eb",
        strokeWidth: parseInt(section.props?.borderWidth || "1", 10),
        selectable: false, // wird als Group-Kind dragbar
        evented: true,
        hoverCursor: "move",
        objectCaching: false,
      }) as any;
      frame.data = { type: "frame", isFrame: true };

      // Alle Parts → Textboxen
      for (const part of section.parts) {
        const padL = SEC_PAD_L;
        const padR = SEC_PAD_R;
        const padT = SEC_PAD_T + Number(part.gapBefore ?? 0);
        const padB = SEC_PAD_B;
        const indentPx = Number(part.indentPx ?? (part.fieldType === "bullet" ? BULLET_INDENT : 0));

        // Stil auflösen: global <— lokal
        const g = (globalFieldStyles as any)?.[section.sectionType || "experience"]?.[part.fieldType] || {};
        const loc = (partStyles as any)?.[section.id]?.[part.fieldType] || {};
        const finalStyle = {
          fontFamily: loc.fontFamily ?? g.fontFamily ?? "Arial",
          fontSize: Number(loc.fontSize ?? g.fontSize ?? 12),
          color: loc.color ?? g.color ?? "#111827",
          fontWeight: (loc.fontWeight ?? (g.bold ? "bold" : "normal")) as any,
          fontStyle: (loc.italic ?? g.italic) ? ("italic" as any) : ("" as any),
          lineHeight: Number(loc.lineHeight ?? g.lineHeight ?? 1.2),
          letterSpacing: Number(loc.letterSpacing ?? g.letterSpacing ?? 0),
        };

        const contentWidth = Math.max(1, section.width - padL - padR - indentPx);
        const tb = new fabricNamespace.Textbox(part.text ?? "", {
          width: contentWidth,
          fontFamily: finalStyle.fontFamily,
          fontSize: finalStyle.fontSize,
          fill: finalStyle.color,
          fontWeight: finalStyle.fontWeight,
          fontStyle: finalStyle.fontStyle,
          lineHeight: finalStyle.lineHeight,
          charSpacing: Math.round(finalStyle.letterSpacing * 1000),
          textAlign: "left",
          editable: false,
          selectable: true,
          evented: true,
          hasControls: false,
          hasBorders: false,
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
          hoverCursor: "text",
          moveCursor: "default",
        }) as any;

        tb.partId = part.id;
        tb.fieldType = part.fieldType;
        tb.sectionId = section.id;

        tb.data = {
          fieldKey: part.id ?? `${section.id}:${part.fieldType}`,
          padL, padT, padR, padB, indentPx,
          flow: true,
          order: Number.isFinite(part.order) ? part.order : 0,
          gapBefore: Number(part.gapBefore ?? 0),
          type: "textbox",
          lineHeight: finalStyle.lineHeight,
          isMappingField: true,
        };

        const halfW = section.width / 2;
        const halfH = (section.height ?? 1) / 2;
        const tlX = padL + (indentPx || 0);
        const tlY = padT;
        tb.set({ left: tlX - halfW, top: tlY - halfH });
        tb.setCoords();

        textboxes.push(tb);
      }

      // Gruppe inkl. Frame
      const sectionGroup = new fabricNamespace.Group([frame, ...textboxes], {
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
        subTargetCheck: true,
        hoverCursor: "move",
      }) as any;

      sectionGroup.data = {
        sectionId: section.id,
        type: "section",
        minHeight: Number(section.props?.minHeight ?? 32),
      };
      sectionGroup.sectionId = section.id;
      sectionGroup.sectionType = section.sectionType;

      fabricCanvas.add(sectionGroup);

      // Reflow initial triggern
      try {
        (sectionGroup as any).scaleX = 1;
        (sectionGroup as any).scaleY = 1;
        fabricCanvas.fire("object:scaling", { target: sectionGroup } as any);
        fabricCanvas.fire("object:modified", { target: sectionGroup } as any);
      } catch {}

      // Aktiven Edit auf neue Instanzen rebinden (nach Neu-Render)
      if (activeEdit && activeEdit.sectionId === section.id) {
        const hit = (sectionGroup._objects || []).find(
          (o: any) => o?.type === "textbox" && o.fieldType === activeEdit.fieldType
        );
        if (hit && (activeEdit.textbox !== hit || activeEdit.group !== sectionGroup)) {
          nextActive = {
            sectionId: activeEdit.sectionId,
            sectionType: (sectionGroup as any).sectionType || "experience",
            fieldType: activeEdit.fieldType,
            group: sectionGroup,
            textbox: hit,
          };
        }
      }
    }

    if (
      nextActive &&
      activeEdit &&
      (nextActive.textbox !== activeEdit.textbox || nextActive.group !== activeEdit.group)
    ) {
      setActiveEdit(nextActive);
    }

    fabricCanvas.renderAll();
  }, [fabricCanvas, fabricNamespace, sections, tokens, margins, globalFieldStyles, partStyles, activeEdit]);

  useEffect(() => {
    if (fabricCanvas && sections) renderSections();
  }, [fabricCanvas, sections, renderSections]);

  // Zoom (falls genutzt)
  useEffect(() => {
    if (!fabricCanvas) return;
    const safeZoom = Math.max(0.1, Math.min(4, Number(zoom || 1)));
    fabricCanvas.setZoom(safeZoom);
    fabricCanvas.requestRenderAll();
  }, [fabricCanvas, zoom]);

  // ESC schließt Overlay
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveEdit(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={containerRef} style={{ width: PAGE_W, height: PAGE_H, position: "relative" }}>
      <canvas ref={canvasRef} />
      {fabricCanvas && activeEdit && containerRef.current && (
        <TextEditorOverlay
          canvas={fabricCanvas}
          containerEl={containerRef.current}
          group={activeEdit.group}
          textbox={activeEdit.textbox}
          sectionId={activeEdit.sectionId}
          sectionType={activeEdit.sectionType}
          fieldType={activeEdit.fieldType}
          onClose={() => setActiveEdit(null)}
        />
      )}
    </div>
  );
}
