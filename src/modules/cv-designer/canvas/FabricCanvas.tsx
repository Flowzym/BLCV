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

// Snap-Konfiguration (nur auf MouseUp angewandt)
const SNAP_ANGLE = 90;
const SNAP_THRESHOLD = 4; // Grad

type SectionKind =
  | "experience"
  | "education"
  | "profile"
  | "skills"
  | "softskills"
  | "contact";

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

// Grad normieren auf 0..360
function normAngle(a: number) {
  let n = a % 360;
  if (n < 0) n += 360;
  return n;
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
  const rotationBadgeRef = useRef<any>(null); // fabric group (rect + text) für Grad-Anzeige
  const rotationDragRef = useRef<{ isRotating: boolean; usedAlt: boolean }>({
    isRotating: false,
    usedAlt: false,
  });
  const nudgeTimerRef = useRef<any>(null);

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

      // === Custom ROTATE Control: poliertes Refresh-Icon (pro Gruppe) ===
      rotateControlRef.current = new fabric.Control({
        x: 0,
        y: -0.5,
        offsetY: -30,
        withConnection: true,
        actionName: "rotate",
        cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
        // wichtig: Handler mit Snapping-Funktion beibehalten; SnapAngle setzen wir auf 0
        actionHandler: fabric.controlsUtils.rotationWithSnapping,
        cornerSize: 28,
        render: (ctx: CanvasRenderingContext2D, left: number, top: number, _style: any, o: any) => {
          const z = o?.canvas?.getZoom?.() || 1;

          const size = 28 / z;
          const rOuter = size / 2;
          const ringW = Math.max(2 / z, 1 / z);
          const arrowW = Math.max(2 / z, 1.5 / z);
          const shadowBlur = 2 / z;

          ctx.save();
          ctx.translate(left, top);

          ctx.shadowColor = "rgba(0,0,0,0.08)";
          ctx.shadowBlur = shadowBlur;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          ctx.beginPath();
          ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();

          ctx.lineWidth = ringW;
          ctx.strokeStyle = SELECT_COLOR;
          ctx.stroke();

          ctx.shadowColor = "transparent";
          const r = rOuter - 6 / z;
          const start = -Math.PI * 0.35;
          const end = start + Math.PI * 1.6;
          ctx.beginPath();
          ctx.arc(0, 0, r, start, end);
          ctx.lineWidth = arrowW;
          ctx.lineCap = "round";
          ctx.strokeStyle = SELECT_COLOR;
          ctx.stroke();

          const ax = r * Math.cos(end);
          const ay = r * Math.sin(end);
          const ah = 6 / z;
          const aw = 4 / z;
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

      // Rotation-Tooltip (Badge)
      const badgeText = new fabric.Text("0°", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "#ffffff",
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
        objectCaching: false,
        strokeUniform: true,
      });
      const badgeRect = new fabric.Rect({
        width: 28,
        height: 18,
        rx: 8,
        ry: 8,
        fill: "rgba(0,0,0,0.75)",
        stroke: "rgba(0,0,0,0.85)",
        strokeWidth: 0.5,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
        objectCaching: false,
        strokeUniform: true,
      });
      const badge = new fabric.Group([badgeRect, badgeText], {
        left: 0,
        top: 0,
        visible: false,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        objectCaching: false,
        originX: "center",
        originY: "center",
      });
      (canvas as any).__rotationBadge = badge;
      rotationBadgeRef.current = { badge, badgeRect, badgeText };
      canvas.add(badge);

      bringObjectToFront(canvas, hoverOutline);
      bringObjectToFront(canvas, selectedOutline);
      bringObjectToFront(canvas, badge);
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

      // Badge Helper
      const showRotationBadge = (target: any, altFree: boolean) => {
        const ref = rotationBadgeRef.current;
        if (!ref) return;
        const { badge, badgeRect, badgeText } = ref;

        const z = canvas.getZoom() || 1;
        const font = 12 / z;
        const padX = 8 / z;
        const padY = 4 / z;

        const angle = normAngle(target.angle || 0);
        const text = `${Math.round(angle * 10) / 10}°${altFree ? " • Free" : ""}`;

        badgeText.set({ text, fontSize: font });
        (badgeText as any).initDimensions?.();

        badgeRect.set({
          width: (badgeText.width || 18) + padX * 2,
          height: (badgeText.height || font) + padY * 2,
          rx: 8 / z,
          ry: 8 / z,
        });

        // oberhalb der Top-Mitte der Gruppe
        const br = target.getBoundingRect(false, true); // canvas space
        const x = br.left + br.width / 2;
        const y = br.top - (28 / z); // Abstand oberhalb

        badge.set({ left: x, top: y, visible: true });
        bringObjectToFront(canvas, badge);
      };
      const hideRotationBadge = () => {
        rotationBadgeRef.current?.badge?.set({ visible: false });
        canvas.requestRenderAll();
      };

      // Hover: auch bei aktiver Selektion zeigen – außer über dem selektierten Feld
      const onMouseMove = (e: any) => {
        const t = canvas.findTarget(e.e, true) as any;
        const tb = getTextboxUnderPointer(t, e.e);

        if (tb) {
          const isSameAsSelected =
            !!activeEditRef.current && activeEditRef.current.textbox === tb;

        if (isSameAsSelected) {
          // nichts
        } else {
            const rect = withOutsetSym(canvas, getTextboxCanvasRect(tb), 0);
            (canvas as any).__hoverOutline.set({ ...rect, visible: true, opacity: 1 });
            bringObjectToFront(canvas, (canvas as any).__hoverOutline);
            canvas.setCursor("text");
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

          // >>> custom rotate-control pro Gruppe; Snap während Drag AUS
          const rc = rotateControlRef.current;
          if (rc) {
            const baseControls = (fabric.Object as any)?.prototype?.controls || {};
            if (!(grp as any).controls) (grp as any).controls = { ...baseControls };
            (grp as any).controls.mtr = rc;
          }
          (grp as any).snapAngle = 0; // wichtig: freies Drehen beim Drag
          (grp as any).snapThreshold = 0;

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

      // Rotation: Grad-Badge live aktualisieren + merken ob Alt genutzt wurde
      const onObjectRotating = (e: any) => {
        const target = e?.target as any;
        if (!target || target.type !== "group" || target.data?.type !== "section") return;

        // Track Drag-Session
        rotationDragRef.current.isRotating = true;
        rotationDragRef.current.usedAlt = rotationDragRef.current.usedAlt || !!e.e?.altKey;

        const altNow = !!e.e?.altKey;
        showRotationBadge(target, altNow);
      };

      // Am Ende der Rotation ggf. snappen (wenn Alt NICHT genutzt)
      const onObjectModified = (e: any) => {
        const target = e?.target as any;
        if (rotationDragRef.current.isRotating && target && target.type === "group") {
          const usedAlt = rotationDragRef.current.usedAlt;
          // Reset Drag-Flags
          rotationDragRef.current.isRotating = false;
          rotationDragRef.current.usedAlt = false;

          if (!usedAlt) {
            const a = normAngle(target.angle || 0);
            const nearest = Math.round(a / SNAP_ANGLE) * SNAP_ANGLE;
            const diff = Math.abs(nearest - a);
            if (diff <= SNAP_THRESHOLD || Math.abs(diff - 360) <= SNAP_THRESHOLD) {
              // auf nächstes 90° snappen
              const newAngle = nearest % 360;
              target.angle = newAngle;
              target.setCoords();
              canvas.requestRenderAll();
            }
          }
        }
        hideRotationBadge();
      };

      // Auch beim Verlassen der Canvas sofort verstecken
      const upperEl = canvas.upperCanvasEl as HTMLCanvasElement | undefined;
      const onDomLeave = () => {
        hideHoverNow();
        hideRotationBadge();
        rotationDragRef.current.isRotating = false;
        rotationDragRef.current.usedAlt = false;
      };

      // Zusätzlich: wenn der Pointer ein Textfeld verlässt → sofort verstecken
      const onMouseOut = (e: any) => {
        const t = e?.target as any;
        if (t && t.type === "textbox") hideHoverNow();
      };

      canvas.on("mouse:move", onMouseMove);
      canvas.on("mouse:up", onMouseUp);
      canvas.on("after:render", onAfterRender);
      canvas.on("mouse:out", onMouseOut);
      canvas.on("object:rotating", onObjectRotating);
      canvas.on("object:modified", onObjectModified);
      canvas.on("selection:cleared", hideRotationBadge);
      upperEl?.addEventListener("mouseleave", onDomLeave);

      installSectionResize(canvas);
      setFabricCanvas(canvas);

      return () => {
        canvas.off("mouse:move", onMouseMove);
        canvas.off("mouse:up", onMouseUp);
        canvas.off("after:render", onAfterRender);
        canvas.off("mouse:out", onMouseOut);
        canvas.off("object:rotating", onObjectRotating);
        canvas.off("object:modified", onObjectModified);
        canvas.off("selection:cleared", hideRotationBadge);
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
    bringObjectToFront(fabricCanvas, (fabricCanvas as any).__rotationBadge);

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
        const indentPx =
          Number(part.indentPx ?? (part.fieldType === "bullet" ? BULLET_INDENT : 0));

        const g =
          (globalFieldStyles as any)?.[section.sectionType || "experience"]?.[
            part.fieldType
          ] || {};
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

      // custom rotate control pro Gruppe setzen; Snap AUS beim Drag
      const rc = rotateControlRef.current;
      if (rc) {
        const baseControls =
          (fabricNamespace.Object as any)?.prototype?.controls || {};
        if (!(sectionGroup as any).controls)
          (sectionGroup as any).controls = { ...baseControls };
        (sectionGroup as any).controls.mtr = rc;
      }
      (sectionGroup as any).snapAngle = 0;
      (sectionGroup as any).snapThreshold = 0;

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

    // Outlines + Badge ganz nach oben
    bringObjectToFront(fabricCanvas, (fabricCanvas as any).__hoverOutline);
    bringObjectToFront(fabricCanvas, (fabricCanvas as any).__selectedOutline);
    bringObjectToFront(fabricCanvas, (fabricCanvas as any).__rotationBadge);
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

  // Keyboard-Nudging für Rotation
  useEffect(() => {
    if (!fabricCanvas) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const obj = fabricCanvas.getActiveObject() as any;
      if (!obj || obj.type !== "group" || obj.data?.type !== "section") return;

      e.preventDefault();

      let step = 0.5;
      if (e.shiftKey) step = 5;
      if (e.altKey) step = 0.1;
      if (e.key === "ArrowLeft") step = -step;

      obj.angle = (obj.angle || 0) + step;
      obj.setCoords();
      fabricCanvas.requestRenderAll();

      // Badge kurz einblenden/aktualisieren
      const show = (target: any) => {
        const z = fabricCanvas.getZoom() || 1;
        const br = target.getBoundingRect(false, true);
        const x = br.left + br.width / 2;
        const y = br.top - (28 / z);
        const ref = rotationBadgeRef.current;
        if (!ref) return;
        const a = normAngle(target.angle || 0);
        const text = `${Math.round(a * 10) / 10}°`;
        ref.badgeText.set({ text, fontSize: 12 / z });
        (ref.badgeText as any).initDimensions?.();
        ref.badgeRect.set({
          width: (ref.badgeText.width || 18) + (8 / z) * 2,
          height: (ref.badgeText.height || 12 / z) + (4 / z) * 2,
          rx: 8 / z,
          ry: 8 / z,
        });
        ref.badge.set({ left: x, top: y, visible: true });
        bringObjectToFront(fabricCanvas, ref.badge);
        fabricCanvas.requestRenderAll();
      };
      show(obj);

      clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = setTimeout(() => {
        rotationBadgeRef.current?.badge?.set({ visible: false });
        fabricCanvas.requestRenderAll();
      }, 800);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fabricCanvas]);

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
        (fabricCanvas as any)?.__rotationBadge?.set({ visible: false });
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
            (fabricCanvas as any)?.__rotationBadge?.set({ visible: false });
            setActiveEdit(null);
            fabricCanvas?.requestRenderAll();
          }}
        />
      )}
    </div>
  );
}
