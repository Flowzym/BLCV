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
      group: any;
      textbox: any;
    };

// Robust „bring to front“ für Fabric v6 (ohne bringToFront-API)
function bringObjectToFront(canvas: any, obj: any) {
  if (!canvas || !obj) return;
  const arr = canvas.getObjects?.() ?? canvas._objects;
  if (arr?.includes?.(obj)) {
    canvas.remove(obj);
  }
  canvas.add(obj);
}

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

      // Interaktion – toleranteres Hit-Testing
      canvas.selection = true;
      canvas.subTargetCheck = true;
      canvas.perPixelTargetFind = false;
      canvas.targetFindTolerance = 14;

      // Einmalige Hover-Outline (gestrichelt)
      const hoverOutline = new fabric.Rect({
        left: 0, top: 0, width: 10, height: 10,
        fill: "rgba(0,0,0,0)",
        stroke: "#60a5fa",
        strokeWidth: 1.5,
        strokeDashArray: [4, 3],
        selectable: false,
        evented: false,
        visible: false,
        objectCaching: false,
      });
      (canvas as any).__hoverOutline = hoverOutline;
      canvas.add(hoverOutline);
      bringObjectToFront(canvas, hoverOutline);
      canvas.requestRenderAll();

      // Hilfsfunktion: Textbox unter dem Mauszeiger finden (auch wenn Gruppe getroffen wurde)
      const getTextboxUnderPointer = (t: any, e: any) => {
        if (!t) return null;
        if (t.type === "textbox") return t;
        const grp = t.type === "group" ? t : t.group;
        if (!grp) return null;
        const p = canvas.getPointer(e);
        const hit = (grp._objects || []).find((child: any) => {
          if (child.type !== "textbox") return false;
          const r = child.getBoundingRect(true, true);
          return p.x >= r.left && p.x <= r.left + r.width && p.y >= r.top && p.y <= r.top + r.height;
        });
        return hit || null;
      };

      // Hover (nur Text bekommt Cursor/Outline – Controls-Cursor bleibt ungestört)
      const onMouseMove = (e: any) => {
        const t = canvas.findTarget(e.e, true) as any;
        const tb = getTextboxUnderPointer(t, e.e);

        // Outline standardmäßig verstecken
        hoverOutline.set({ visible: false });

        if (tb) {
          // Outline um Textbox legen
          const c = tb.aCoords || (tb.calcACoords && tb.calcACoords());
          if (c) {
            const left = Math.min(c.tl.x, c.bl.x);
            const top = Math.min(c.tl.y, c.tr.y);
            const width = Math.max(c.tr.x, c.br.x) - left;
            const height = Math.max(c.bl.y, c.br.y) - top;
            hoverOutline.set({ left, top, width, height, visible: true });
            canvas.setCursor("text");
            bringObjectToFront(canvas, hoverOutline);
            canvas.requestRenderAll();
            return;
          }
        }

        // WICHTIG: keinen Cursor „move“ mehr setzen → Fabric zeigt die
        // passenden Resize-Cursor an den Handles selbst.
        canvas.setCursor("default");
        canvas.requestRenderAll();
      };

      // Klick: Text → Overlay; sonst Gruppe selektieren
      const onMouseUp = (e: any) => {
        const t = canvas.findTarget(e.e, true) as any;
        const tb = getTextboxUnderPointer(t, e.e);

        if (tb && tb.sectionId && tb.fieldType) {
          const grp = tb.group;
          if (!grp) return;
          setActiveEdit({
            sectionId: tb.sectionId,
            sectionType: grp.sectionType || "experience",
            fieldType: tb.fieldType,
            group: grp,
            textbox: tb,
          });
          return;
        }

        // sonst: Gruppe selektieren (zum Verschieben/Resizen)
        const grp = t?.type === "group" ? t : t?.group;
        if (grp) {
          canvas.setActiveObject(grp);
          grp.selectable = true;
          grp.lockMovementX = false;
          grp.lockMovementY = false;
          grp.hasControls = true;
          return;
        }

        setActiveEdit(null);
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

    return () => { disposed = true; };
  }, []);

  // Renderer: Sektionen + (nicht-blockierende) Hit-Flächen
  const renderSections = useCallback(() => {
    if (!fabricCanvas || !fabricNamespace || !sections) return;

    const hoverOutline = (fabricCanvas as any).__hoverOutline;
    fabricCanvas.clear();
    if (hoverOutline) { fabricCanvas.add(hoverOutline); bringObjectToFront(fabricCanvas, hoverOutline); }

    let nextActive: ActiveEdit = activeEdit;

    for (const section of sections) {
      if (!section.isVisible) continue;
      if (!Array.isArray(section.parts) || section.parts.length === 0) continue;

      const children: any[] = [];

      // Section-Padding (fix in group.data)
      const SEC_PAD_L = Number(section.props?.paddingLeft  ?? 24);
      const SEC_PAD_R = Number(section.props?.paddingRight ?? 24);
      const SEC_PAD_T = Number(section.props?.paddingTop   ?? 16);
      const SEC_PAD_B = Number(section.props?.paddingBottom?? 16);
      const BULLET_INDENT = Number(tokens?.bulletIndent ?? 18);

      // 1) Große (nicht-evented) Hit-Area – erleichtert Greifen, blockiert keine Controls
      const hitArea = new fabricNamespace.Rect({
        left: -section.width / 2,
        top: -section.height / 2,
        width: section.width,
        height: section.height,
        fill: "#000000",
        opacity: 0.01,
        selectable: false,
        evented: false,         // <— wichtig: blockiert nichts
        objectCaching: false,
      }) as any;
      hitArea.data = { type: "hitArea", isHitArea: true };
      children.push(hitArea);

      // 2) Rahmen (dezent)
      const frame = new fabricNamespace.Rect({
        left: -section.width / 2,
        top: -section.height / 2,
        width: section.width,
        height: section.height,
        fill: "rgba(0,0,0,0.02)",
        stroke: section.props?.borderColor || "#e5e7eb",
        strokeWidth: parseInt(section.props?.borderWidth || "1", 10),
        selectable: false,
        evented: false,
        objectCaching: false,
      }) as any;
      frame.data = { type: "frame", isFrame: true };
      children.push(frame);

      // 3) Mapping-Textboxen
      for (const part of section.parts) {
        const padL = SEC_PAD_L;
        const padR = SEC_PAD_R;
        const padT = SEC_PAD_T + Number(part.gapBefore ?? 0);
        const padB = SEC_PAD_B;
        const indentPx = Number(part.indentPx ?? (part.fieldType === "bullet" ? BULLET_INDENT : 0));

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
          originX: "left",
          originY: "top",
          scaleX: 1,
          scaleY: 1,
          hoverCursor: "text",
          moveCursor: "default",
          perPixelTargetFind: false,
          objectCaching: false,
          noScaleCache: true,
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
        const tlX = padL + (indentPx || 0);
        const tlY = padT;
        tb.set({ left: tlX - halfW, top: tlY - section.height / 2 });
        tb.setCoords();

        children.push(tb);
      }

      // 4) Gruppe
      const sectionGroup = new fabricNamespace.Group(children, {
        left: section.x,
        top: section.y,
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
        backgroundColor: "transparent",
        fill: "transparent",
        lockUniScaling: false,
        lockScalingFlip: true,
        cornerStyle: "circle",
        cornerSize: 14,
        transparentCorners: false,
        borderColor: "#3b82f6",
        cornerColor: "#3b82f6",
        padding: 8,
        borderScaleFactor: 2,
        subTargetCheck: true,
      }) as any;

      // Fixe Paddings in group.data
      sectionGroup.data = {
        sectionId: section.id,
        type: "section",
        minHeight: Number(section.props?.minHeight ?? 32),
        padL: SEC_PAD_L,
        padR: SEC_PAD_R,
        secPadT: SEC_PAD_T,
        secPadB: SEC_PAD_B,
      };
      sectionGroup.sectionId = section.id;
      sectionGroup.sectionType = section.sectionType;

      fabricCanvas.add(sectionGroup);

      // Initialer Reflow
      try {
        (sectionGroup as any).scaleX = 1;
        (sectionGroup as any).scaleY = 1;
        fabricCanvas.fire("object:scaling", { target: sectionGroup } as any);
        fabricCanvas.fire("object:modified", { target: sectionGroup } as any);
      } catch {}

      // aktiven Edit auf neue Instanzen rebinden
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

    if (nextActive && activeEdit && (nextActive.textbox !== activeEdit.textbox || nextActive.group !== activeEdit.group)) {
      setActiveEdit(nextActive);
    }

    if (hoverOutline) bringObjectToFront(fabricCanvas, hoverOutline);
    fabricCanvas.requestRenderAll();
  }, [fabricCanvas, fabricNamespace, sections, tokens, margins, globalFieldStyles, partStyles, activeEdit]);

  useEffect(() => {
    if (fabricCanvas && sections) renderSections();
  }, [fabricCanvas, sections, renderSections]);

  // Zoom
  useEffect(() => {
    if (!fabricCanvas) return;
    const safeZoom = Math.max(0.1, Math.min(4, Number(zoom || 1)));
    fabricCanvas.setZoom(safeZoom);
    fabricCanvas.requestRenderAll();
  }, [fabricCanvas, zoom]);

  // ESC → Overlay schließen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveEdit(null);
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
