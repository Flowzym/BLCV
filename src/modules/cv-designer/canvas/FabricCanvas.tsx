import React, { useRef, useEffect, useState, useCallback } from "react";
import { getFabric } from "@/lib/fabric-shim";
import { useDesignerStore } from "../store/designerStore";
import CanvasRegistry from "./canvasRegistry";
import { installSectionResize } from "./installSectionResize";
import TextEditorOverlay from "../ui/TextEditorOverlay";

const PAGE_W = 595;
const PAGE_H = 842;

// optische Abstände der Outlines – bleiben visuell konstant über Zoom
const OUTSET_PX = 2;           // Basis-Außenrand für Hover
const SELECT_STROKE = 2;       // px
const HOVER_STROKE = 1.5;      // px

// Farb-Tokens (Primärakzent: Orange)
const SELECT_COLOR = "#F29400";                // ausgewählt (solide Outline, Group-Rahmen)
const HOVER_COLOR = "#FFC372";                 // Hover (gestrichelt, heller als Select)
const SELECT_BG_RGBA = "rgba(242,148,0,0.12)"; // zarter Hintergrund fürs selektierte Textfeld

// Asymmetrischer Outset nur für die SELECTED-Outline (links mehr Luft)
const SELECT_OUTSET = { l: 4, t: 2, r: 2, b: 2 } as const;

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

// Symmetrischer Outset (für Hover)
function withOutsetSym(
  canvas: any,
  rect: { left: number; top: number; width: number; height: number },
  extra = 0
) {
  const z = typeof canvas?.getZoom === "function" ? canvas.getZoom() : 1;
  const m = (OUTSET_PX + extra) / Math.max(z, 0.0001);
  return {
    left: rect.left - m,
    top: rect.top - m,
    width: rect.width + 2 * m,
    height: rect.height + 2 * m,
  };
}

// Asymmetrischer Outset (für Selected)
function withOutsetSides(
  canvas: any,
  rect: { left: number; top: number; width: number; height: number },
  sides: { l: number; t: number; r: number; b: number }
) {
  const z = typeof canvas?.getZoom === "function" ? canvas.getZoom() : 1;
  const ml = sides.l / Math.max(z, 0.0001);
  const mt = sides.t / Math.max(z, 0.0001);
  const mr = sides.r / Math.max(z, 0.0001);
  const mb = sides.b / Math.max(z, 0.0001);
  return {
    left: rect.left - ml,
    top: rect.top - mt,
    width: rect.width + ml + mr,
    height: rect.height + mt + mb,
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
  const rotateControlRef = useRef<any>(null); // custom rotate control

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

      // === Custom ROTATE Control: sauberes Refresh-Icon (pro Gruppe) ===
      rotateControlRef.current = new fabric.Control({
        x: 0,
        y: -0.5,
        offsetY: -30,           // Abstand oberhalb der Top-Kante
        withConnection: true,   // Verbindungslinie beibehalten
        actionName: "rotate",
        cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
        actionHandler: fabric.controlsUtils.rotationWithSnapping,
        cornerSize: 28,
        render: (ctx: CanvasRenderingContext2D, left: number, top: number, _style: any, o: any) => {
          const z = o?.canvas?.getZoom?.() || 1;

          // Größen & Strichstärken zoom-sicher
          const size = 28 / z;
          const rOuter = size / 2;
          const ringW = Math.max(2 / z, 1 / z);
          const arrowW = Math.max(2 / z, 1.5 / z);
          const shadowBlur = 2 / z;

          ctx.save();
          ctx.translate(left, top);

          // subtile Schattenkante
          ctx.shadowColor = "rgba(0,0,0,0.08)";
          ctx.shadowBlur = shadowBlur;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // runder Button
          ctx.beginPath();
          ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();

          // orangener Ring
          ctx.lineWidth = ringW;
          ctx.strokeStyle = SELECT_COLOR;
          ctx.stroke();

          // innerer Refresh-Bogen
          ctx.shadowColor = "transparent";
          const r = rOuter - 6 / z;
          const start = -Math.PI * 0.35;     // ~ -63°
          const end = start + Math.PI * 1.6; // ~ 288°
          ctx.beginPath();
          ctx.arc(0, 0, r, start, end);
          ctx.lineWidth = arrowW;
          ctx.lineCap = "round";
          ctx.strokeStyle = SELECT_COLOR;
          ctx.stroke();

          // Pfeilspitze am Ende (kleine Keilform)
          const ax = r * Math.cos(end);
          const ay = r * Math.sin(end);
          const ah = 6 / z; // länge
          const aw = 4 / z; // breite
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax - ah, ay - aw);
          ctx.lineTo(ax - aw, ay + ah);
          ctx.closePath();
          ctx.fillStyle = SELECT_COLOR;
          ctx.fill();

          ctx.restore();
        },
      });

      // Hover-Outline (gestrichelt, Root-Objekt)
      const hoverOutline = new fabric.Rect({
        left: 0,
        top: 0,
        width: 10,
        height: 10,
        fill: "rgba(0,0,0,0)",
        stroke: HOVER_COLOR,
        strokeWidth: HOVER_STROKE,
        strokeDashArray: [4, 3],
        selectable: false,
        evented: false,
        visible: false,
        opacity: 1,
        objectCaching: false,
        strokeUniform: true,
        excludeFromExport: true,
        originX: "left",
        originY: "top",
        rx: 2,
        ry: 2,
      });
      (canvas as any).__hoverOutline = hoverOutline;
      canvas.add(hoverOutline);

      // Selected-Outline (solide, Root-Objekt)
      const selectedOutline = new fabric.Rect({
        left: 0,
        top: 0,
        width: 10,
        height: 10,
        fill: "rgba(0,0,0,0)",
        stroke: SELECT_COLOR,
        strokeWidth: SELECT_STROKE,
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

      bringObjectToFront(canvas, hoverOutline);
      bringObjectToFront(canvas, selectedOutline);
      canvas.requestRenderAll();

      // Textbox unter Maus (auch wenn Gruppe getroffen)
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
        tb.set({ backgroundColor: SELECT_BG_RGBA });
        tb.dirty = true;
        lastSelectedTextboxRef.current = tb;
      };

      const UPDATE_SELECTED_MARKER = () => {
        if (!activeEditRef.current || !activeEditRef.current.textbox) return;
        const tb = activeEditRef.current.textbox;
        const rect = withOutsetSides(canvas, getTextboxCanvasRect(tb), SELECT_OUTSET);
        selectedOutline.set({ ...rect, visible: true });
        bringObjectToFront(canvas, selectedOutline);
      };

      const SET_SELECTION = (tb: any) => {
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
        UPDATE_SELECTED_MARKER();
        canvas.requestRenderAll();
      };

      const CLEAR_SELECTION = () => {
        CLEAR_BG();
        selectedOutline.set({ visible: false });
        setActiveEdit(null);
        canvas.requestRenderAll();
      };

      // Sofortiges Verstecken der Hover-Outline (ohne Delay)
      const hideHoverNow = () => {
        (canvas as any).__hoverOutline?.set({ visible: false });
        canvas.requestRenderAll();
      };

      // Hover: auch bei aktiver Selektion zeigen – außer über dem selektierten Feld
      const onMouseMove = (e: any) => {
        const t = canvas.findTarget(e.e, true) as any;
        const tb = getTextboxUnderPointer(t, e.e);

        if (tb) {
          const isSameAsSelected =
            !!activeEditRef.current && activeEditRef.current.textbox === tb;

          if (!isSameAsSelected) {
            const rect = withOutsetSym(canvas, getTextboxCanvasRect(tb), 0);
            (canvas as any).__hoverOutline.set({ ...rect, visible: true, opacity: 1 });
            bringObjectToFront(canvas, (canvas as any).__hoverOutline);
            canvas.setCursor("text"); // Cursor NUR bei Text
            canvas.requestRenderAll();
            return;
          }
        }

        // kein Text unter dem Zeiger → sofort ausblenden (ohne Delay)
        hideHoverNow();
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
          grp.hoverCursor = "move";
          grp.moveCursor = "move";
          grp.selectable = true;
          grp.lockMovementX = false;
          grp.lockMovementY = false;
          grp.hasControls = true;
          grp.borderColor = SELECT_COLOR;
          grp.cornerColor = SELECT_COLOR;
          // >>> custom rotate-control pro Gruppe
          const rc = rotateControlRef.current;
          if (rc) {
            const baseControls = (fabricNamespace.Object as any)?.prototype?.controls;
            if (!(grp as any).controls) (grp as any).controls = baseControls ? { ...baseControls } : {};
            (grp as any).controls.mtr = rc;
          }
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

      // Auch beim Verlassen der Canvas sofort verstecken
      const upperEl = canvas.upperCanvasEl as HTMLCanvasElement | undefined;
      const onDomLeave = () => hideHoverNow();

      // Zusätzlich: wenn der Pointer ein Textfeld verlässt → sofort verstecken
      const onMouseOut = (e: any) => {
        const t = e?.target as any;
        if (t && t.type === "textbox") hideHoverNow();
      };

      canvas.on("mouse:move", onMouseMove);
      canvas.on("mouse:up", onMouseUp);
      canvas.on("after:render", onAfterRender);
      canvas.on("mouse:out", onMouseOut);
      upperEl?.addEventListener("mouseleave", onDomLeave);

      installSectionResize(canvas);
      setFabricCanvas(canvas);

      return () => {
        canvas.off("mouse:move", onMouseMove);
        canvas.off("mouse:up", onMouseUp);
        canvas.off("after:render", onAfterRender);
        canvas.off("mouse:out", onMouseOut);
        upperEl?.removeEventListener("mouseleave", onDomLeave);
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
        borderColor: SELECT_COLOR, // Akzentfarbe
        cornerColor: SELECT_COLOR, // Akzentfarbe
        padding: 8,
        borderScaleFactor: 2,
        subTargetCheck: true,
        hoverCursor: "move",
        moveCursor: "move",
      }) as any;

      // custom rotate control pro Gruppe setzen
      const rc = rotateControlRef.current;
      if (rc) {
        const baseControls = (fabricNamespace.Object as any)?.prototype?.controls;
        if (!(sectionGroup as any).controls) (sectionGroup as any).controls = baseControls ? { ...baseControls } : {};
        (sectionGroup as any).controls.mtr = rc;
      }

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

      // Rebind: selektiertes Mapping an neue Instanz koppeln
      const ae = activeEditRef.current;
      if (ae && ae.sectionId === section.id) {
        const newTb = (sectionGroup._objects || []).find(
          (o: any) => o?.type === "textbox" && o.fieldType === ae.fieldType
        );
        if (newTb && (ae.textbox !== newTb || ae.group !== sectionGroup)) {
          if (lastSelectedTextboxRef.current && lastSelectedTextboxRef.current !== newTb) {
            lastSelectedTextboxRef.current.set({ backgroundColor: "" });
          }
          newTb.set({ backgroundColor: SELECT_BG_RGBA });
          lastSelectedTextboxRef.current = newTb;

          setActiveEdit({
            sectionId: ae.sectionId,
            sectionType: sectionGroup.sectionType,
            fieldType: ae.fieldType,
            group: sectionGroup,
            textbox: newTb,
          });

          const rect = withOutsetSides(fabricCanvas, getTextboxCanvasRect(newTb), SELECT_OUTSET);
          const selectedOutline = (fabricCanvas as any).__selectedOutline;
          if (selectedOutline) selectedOutline.set({ ...rect, visible: true });
        }
      }
    }

    // Outlines ganz nach oben
    bringObjectToFront(fabricCanvas, (fabricCanvas as any).__hoverOutline);
    bringObjectToFront(fabricCanvas, (fabricCanvas as any).__selectedOutline);
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

  // ESC → Overlay schließen (inkl. Selected reset)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
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
