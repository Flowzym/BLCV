import React, { useRef, useEffect, useState, useCallback } from "react";
import { getFabric } from "@/lib/fabric-shim";
import { useDesignerStore } from "../store/designerStore";
import CanvasRegistry from "./canvasRegistry";
import { installSectionResize } from "./installSectionResize";
import TextEditorOverlay from "../ui/TextEditorOverlay";

const PAGE_W = 595;
const PAGE_H = 842;

type SectionKind = "experience" | "education" | "profile" | "skills" | "softskills" | "contact";

type ActiveEdit =
  | null
  | {
      sectionId: string;
      sectionType: SectionKind;
      fieldType: string;
      group: any;
      textbox: any;
    };

// bringToFront-Ersatz für Fabric v6 (ohne bringToFront-API)
function bringObjectToFront(canvas: any, obj: any) {
  if (!canvas || !obj) return;
  const arr = canvas.getObjects?.() ?? canvas._objects;
  if (arr?.includes?.(obj)) canvas.remove(obj);
  canvas.add(obj);
}

// Canvas-Rect des Textfeldes (zoomsicher, ohne viewport-Umrechnung)
function getTextboxCanvasRect(tb: any) {
  (tb as any)._clearCache?.();
  (tb as any).initDimensions?.();
  const br = tb.getBoundingRect(false, true); // Canvas space
  return {
    left: br.left,
    top: br.top,
    width: Math.max(1, br.width),
    height: Math.max(1, br.height),
  };
}

export default function FabricCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [fabricNamespace, setFabricNamespace] = useState<any>(null);
  const [activeEdit, setActiveEdit] = useState<ActiveEdit>(null);
  const activeEditRef = useRef<ActiveEdit>(null);
  const lastSelectedTextboxRef = useRef<any>(null);

  useEffect(() => {
    activeEditRef.current = activeEdit;
  }, [activeEdit]);

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
      if (CanvasRegistry.has(canvasRef.current)) CanvasRegistry.dispose(canvasRef.current);

      const canvas = CanvasRegistry.getOrCreate(canvasRef.current, fabric);
      canvas.setDimensions({ width: PAGE_W, height: PAGE_H });
      canvas.backgroundColor = "#ffffff";

      canvas.selection = true;
      canvas.subTargetCheck = true;
      canvas.perPixelTargetFind = false;
      canvas.targetFindTolerance = 14;

      // Hover-Outline (gestrichelt, Root-Objekt)
      const hoverOutline = new fabric.Rect({
        left: 0,
        top: 0,
        width: 10,
        height: 10,
        fill: "rgba(0,0,0,0)",
        stroke: "#60a5fa",
        strokeWidth: 1.5,
        strokeDashArray: [4, 3],
        selectable: false,
        evented: false,
        visible: false,
        objectCaching: false,
        strokeUniform: true,
        excludeFromExport: true,
        originX: "left",
        originY: "top",
      });
      (canvas as any).__hoverOutline = hoverOutline;
      canvas.add(hoverOutline);

      // Selected-Outline (solide, Root-Objekt) – bleibt bis zur Abwahl sichtbar
      const selectedOutline = new fabric.Rect({
        left: 0,
        top: 0,
        width: 10,
        height: 10,
        fill: "rgba(0,0,0,0)",
        stroke: "#2563eb",
        strokeWidth: 2,
        selectable: false,
        evented: false,
        visible: false,
        objectCaching: false,
        strokeUniform: true,
        excludeFromExport: true,
        originX: "left",
        originY: "top",
        rx: 2,
        ry: 2,
      });
      (canvas as any).__selectedOutline = selectedOutline;
      canvas.add(selectedOutline);

      // ganz nach oben
      bringObjectToFront(canvas, hoverOutline);
      bringObjectToFront(canvas, selectedOutline);
      canvas.requestRenderAll();

      // Textbox unter Maus (auch wenn die Gruppe getroffen wurde)
      const getTextboxUnderPointer = (t: any, ev: MouseEvent) => {
        if (!t) return null;
        if (t.type === "textbox") return t;
        const grp = t.type === "group" ? t : t.group;
        if (!grp) return null;

        const p = canvas.getPointer(ev); // Canvas space
        const hit = (grp._objects || []).find((child: any) => {
          if (child.type !== "textbox") return false;
          const r = child.getBoundingRect(false, true);
          return p.x >= r.left && p.x <= r.left + r.width && p.y >= r.top && p.y <= r.top + r.height;
        });
        return hit || null;
      };

      // --- Selection Helpers ---
      const CLEAR_BG = () => {
        const prev = lastSelectedTextboxRef.current;
        if (prev && !prev._disposed) {
          prev.set({ backgroundColor: "" });
          prev.dirty = true;
        }
        lastSelectedTextboxRef.current = null;
      };

      const APPLY_BG = (tb: any) => {
        if (!tb) return;
        tb.set({ backgroundColor: "rgba(96,165,250,0.12)" }); // zarter Blauton
        tb.dirty = true;
        lastSelectedTextboxRef.current = tb;
      };

      const UPDATE_SELECTED_MARKER = () => {
        if (!activeEditRef.current || !activeEditRef.current.textbox) return;
        const tb = activeEditRef.current.textbox;
        const rect = getTextboxCanvasRect(tb);
        selectedOutline.set({ ...rect, visible: true });
        bringObjectToFront(canvas, selectedOutline);
      };

      const SET_SELECTION = (tb: any) => {
        // vorherige Markierung entfernen
        if (lastSelectedTextboxRef.current && lastSelectedTextboxRef.current !== tb) {
          CLEAR_BG();
        }
        APPLY_BG(tb);
        setActiveEdit({
          sectionId: tb.sectionId,
          sectionType: (tb.group?.sectionType as SectionKind) || "experience",
          fieldType: tb.fieldType,
          group: tb.group,
          textbox: tb,
        });
        // Outline setzen
        UPDATE_SELECTED_MARKER();
        canvas.requestRenderAll();
      };

      const CLEAR_SELECTION = () => {
        CLEAR_BG();
        selectedOutline.set({ visible: false });
        setActiveEdit(null);
        canvas.requestRenderAll();
      };

      // Hover: nur zeigen, wenn KEINE Selektion aktiv ist
      const onMouseMove = (e: any) => {
        const hoverAllowed = !activeEditRef.current; // bei aktiver Selektion: keine Hover-Outline
        if (!hoverAllowed) {
          hoverOutline.set({ visible: false });
          canvas.setCursor("default");
          return;
        }

        const t = canvas.findTarget(e.e, true) as any;
        const tb = getTextboxUnderPointer(t, e.e);

        hoverOutline.set({ visible: false });

        if (tb) {
          const rect = getTextboxCanvasRect(tb);
          hoverOutline.set({ ...rect, visible: true });
          bringObjectToFront(canvas, hoverOutline);
          canvas.setCursor("text");
          canvas.requestRenderAll();
          return;
        }

        canvas.setCursor("default");
        canvas.requestRenderAll();
      };

      // Klick: Text → Selection + Overlay; sonst Gruppe selektieren/Abwahl
      const onMouseUp = (e: any) => {
        const t = canvas.findTarget(e.e, true) as any;
        const tb = getTextboxUnderPointer(t, e.e);

        if (tb && tb.sectionId && tb.fieldType) {
          SET_SELECTION(tb);
          return;
        }

        const grp = t?.type === "group" ? t : t?.group;
        if (grp) {
          canvas.setActiveObject(grp);
          grp.selectable = true;
          grp.lockMovementX = false;
          grp.lockMovementY = false;
          grp.hasControls = true;
          // Selektion bleibt bestehen, wenn man nur die Gruppe greift
          canvas.requestRenderAll();
          return;
        }

        // Klick ins Leere → Abwahl
        CLEAR_SELECTION();
      };

      // Nach jedem Render: Selected-Marker mitführen
      const onAfterRender = () => {
        if (activeEditRef.current) {
          UPDATE_SELECTED_MARKER();
        }
      };

      canvas.on("mouse:move", onMouseMove);
      canvas.on("mouse:up", onMouseUp);
      canvas.on("after:render", onAfterRender);

      installSectionResize(canvas);
      setFabricCanvas(canvas);

      return () => {
        canvas.off("mouse:move", onMouseMove);
        canvas.off("mouse:up", onMouseUp);
        canvas.off("after:render", onAfterRender);
        CanvasRegistry.dispose(canvasRef.current!);
        setFabricCanvas(null);
      };
    })();

    return () => {
      disposed = true;
    };
  }, []);

  // Renderer (ohne activeEdit als Dep → keine Sprünge)
  const renderSections = useCallback(() => {
    if (!fabricCanvas || !fabricNamespace || !sections) return;

    const hoverOutline = (fabricCanvas as any).__hoverOutline;
    const selectedOutline = (fabricCanvas as any).__selectedOutline;

    fabricCanvas.clear();
    if (hoverOutline) fabricCanvas.add(hoverOutline);
    if (selectedOutline) fabricCanvas.add(selectedOutline);
    bringObjectToFront(fabricCanvas, hoverOutline);
    bringObjectToFront(fabricCanvas, selectedOutline);

    for (const section of sections) {
      if (!section.isVisible) continue;
      if (!Array.isArray(section.parts) || section.parts.length === 0) continue;

      const children: any[] = [];

      const SEC_PAD_L = Number(section.props?.paddingLeft ?? 24);
      const SEC_PAD_R = Number(section.props?.paddingRight ?? 24);
      const SEC_PAD_T = Number(section.props?.paddingTop ?? 16);
      const SEC_PAD_B = Number(section.props?.paddingBottom ?? 16);
      const BULLET_INDENT = Number(tokens?.bulletIndent ?? 18);

      // große, nicht-evented Hit-Area
      const hitArea = new fabricNamespace.Rect({
        left: -section.width / 2,
        top: -section.height / 2,
        width: section.width,
        height: section.height,
        fill: "#000000",
        opacity: 0.01,
        selectable: false,
        evented: false,
        objectCaching: false,
      }) as any;
      hitArea.data = { type: "hitArea", isHitArea: true };
      children.push(hitArea);

      // dezenter Frame
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

      // Mapping-Textboxen
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
          padL,
          padT,
          padR,
          padB,
          indentPx,
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

      // Gruppe
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
      sectionGroup.sectionType = section.sectionType as SectionKind;

      fabricCanvas.add(sectionGroup);

      // Initialer Reflow
      try {
        (sectionGroup as any).scaleX = 1;
        (sectionGroup as any).scaleY = 1;
        fabricCanvas.fire("object:scaling", { target: sectionGroup } as any);
        fabricCanvas.fire("object:modified", { target: sectionGroup } as any);
      } catch {}

      // Rebind: falls ein Mapping selektiert ist, binde auf neue Instanz + markiere es
      const ae = activeEditRef.current;
      if (ae && ae.sectionId === section.id) {
        const newTb = (sectionGroup._objects || []).find(
          (o: any) => o?.type === "textbox" && o.fieldType === ae.fieldType
        );
        if (newTb && (ae.textbox !== newTb || ae.group !== sectionGroup)) {
          // Hintergrund neu setzen (alte Instanz ent-färben)
          if (lastSelectedTextboxRef.current && lastSelectedTextboxRef.current !== newTb) {
            lastSelectedTextboxRef.current.set({ backgroundColor: "" });
          }
          newTb.set({ backgroundColor: "rgba(96,165,250,0.12)" });
          lastSelectedTextboxRef.current = newTb;

          // State und Marker aktualisieren
          setActiveEdit({
            sectionId: ae.sectionId,
            sectionType: sectionGroup.sectionType,
            fieldType: ae.fieldType,
            group: sectionGroup,
            textbox: newTb,
          });

          const rect = getTextboxCanvasRect(newTb);
          selectedOutline.set({ ...rect, visible: true });
        }
      }
    }

    bringObjectToFront(fabricCanvas, hoverOutline);
    bringObjectToFront(fabricCanvas, selectedOutline);
    fabricCanvas.requestRenderAll();
  }, [fabricCanvas, fabricNamespace, sections, tokens, margins, globalFieldStyles, partStyles]);

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

  // ESC → Overlay schließen (inkl. Sichtbarkeit Selected)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // vollständige Demarkierung
        const selectedOutline = (fabricCanvas as any)?.__selectedOutline;
        if (selectedOutline) selectedOutline.set({ visible: false });
        if (lastSelectedTextboxRef.current) {
          lastSelectedTextboxRef.current.set({ backgroundColor: "" });
          lastSelectedTextboxRef.current = null;
        }
        setActiveEdit(null);
        fabricCanvas?.requestRenderAll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fabricCanvas]);

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
          // Overlay-Schließen demarkiert auch visuell
          onClose={() => {
            const selectedOutline = (fabricCanvas as any)?.__selectedOutline;
            if (selectedOutline) selectedOutline.set({ visible: false });
            if (lastSelectedTextboxRef.current) {
              lastSelectedTextboxRef.current.set({ backgroundColor: "" });
              lastSelectedTextboxRef.current = null;
            }
            setActiveEdit(null);
            fabricCanvas?.requestRenderAll();
          }}
        />
      )}
    </div>
  );
}
