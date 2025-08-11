import React, { useRef, useEffect, useState, useCallback } from "react";
import { getFabric } from "@/lib/fabric-shim";
import { useDesignerStore } from "../store/designerStore";
import CanvasRegistry from "./canvasRegistry";
import { installSectionResize } from "./installSectionResize";
import TextEditorOverlay from "../ui/TextEditorOverlay";

const PAGE_W = 595;
const PAGE_H = 842;

// optische Abstände – konstant über Zoom
const OUTSET_PX = 2;           // Basis-Außenrand für Hover
const SELECT_STROKE = 2;       // px
const HOVER_STROKE = 1.5;      // px

// Akzentfarben
const SELECT_COLOR = "#F29400";
const HOVER_COLOR = "#FFC372";
const SELECT_BG_RGBA = "rgba(242,148,0,0.12)";

// Asymmetrischer Outset für SELECTED (links etwas mehr Luft)
const SELECT_OUTSET = { l: 4, t: 2, r: 2, b: 2 } as const;

// Rotation/Snap/Badge
const SNAP_STEP = 45;
const SNAP_THRESHOLD = 6;
const ROTATE_CORNER_SIZE = 28;
const ROTATE_OFFSET_Y = 30;
const BADGE_MARGIN = 10;

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

// bringToFront-Ersatz für Fabric v6
function bringObjectToFront(canvas: any, obj: any) {
  if (!canvas || !obj) return;
  const arr = canvas.getObjects?.() ?? canvas._objects;
  if (arr?.includes?.(obj)) {
    try { canvas.remove(obj); } catch {}
  }
  canvas.add(obj);
}

// Hilfsfunktionen
function normAngle(a: number) {
  let n = a % 360;
  if (n < 0) n += 360;
  return n;
}

function snapAngleToStep(a: number, step: number) {
  const nearest = Math.round(a / step) * step;
  let snapped = nearest % 360;
  if (snapped < 0) snapped += 360;
  return snapped;
}

// ---- Outline-Geometrie (Variante 1: center + angle) ----
// Liefert center (canvas-space), width/height (ohne Rotation) plus Outset in px/zoom
function getOutlineFrame(
  canvas: any,
  tb: any,
  sides: { l: number; t: number; r: number; b: number } | number
) {
  const z = typeof canvas?.getZoom === "function" ? canvas.getZoom() : 1;
  const br = tb.getBoundingRect(false, true); // axis-aligned; center bleibt korrekt
  const cx = br.left + br.width / 2;
  const cy = br.top + br.height / 2;

  const w0 = tb.getScaledWidth?.() ?? br.width;
  const h0 = tb.getScaledHeight?.() ?? br.height;

  const pad =
    typeof sides === "number"
      ? { l: sides, t: sides, r: sides, b: sides }
      : sides;

  const w = Math.max(1, w0 + (pad.l + pad.r) / z);
  const h = Math.max(1, h0 + (pad.t + pad.b) / z);

  const angle = tb.group?.angle ?? tb.angle ?? 0;

  return { cx, cy, w, h, angle };
}

export default function FabricCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [fabricNamespace, setFabricNamespace] = useState<any>(null);
  const [activeEdit, setActiveEdit] = useState<ActiveEdit>(null);
  const activeEditRef = useRef<ActiveEdit>(null);
  const lastSelectedTextboxRef = useRef<any>(null);
  const rotateControlRef = useRef<any>(null);
  const rotationBadgeRef = useRef<any>(null);
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

      // ---- Rotate-Control (poliertes Icon) ----
      rotateControlRef.current = new fabric.Control({
        x: 0,
        y: -0.5,
        offsetY: -ROTATE_OFFSET_Y,
        withConnection: true,
        actionName: "rotate",
        cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
        actionHandler: fabric.controlsUtils.rotationWithSnapping,
        cornerSize: ROTATE_CORNER_SIZE,
        render: (ctx: CanvasRenderingContext2D, left: number, top: number, _s: any, o: any) => {
          const z = o?.canvas?.getZoom?.() || 1;
          const size = ROTATE_CORNER_SIZE / z;
          const rOuter = size / 2;
          const ringW = Math.max(2 / z, 1 / z);
          const arrowW = Math.max(2 / z, 1.5 / z);
          const shadowBlur = 2 / z;

          ctx.save();
          ctx.translate(left, top);

          ctx.shadowColor = "rgba(0,0,0,0.08)";
          ctx.shadowBlur = shadowBlur;

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

      // ---- Hover-Outline (center-origin, mit Winkel) ----
      const hoverOutline = new fabric.Rect({
        left: 0,
        top: 0,
        width: 10,
        height: 10,
        originX: "center",
        originY: "center",
        angle: 0,
        fill: "rgba(0,0,0,0)",
        stroke: HOVER_COLOR,
        strokeWidth: HOVER_STROKE,
        strokeDashArray: [4, 3],
        strokeUniform: true,
        selectable: false,
        evented: false,
        visible: false,
        objectCaching: false,
        excludeFromExport: true,
        rx: 2,
        ry: 2,
      });
      (canvas as any).__hoverOutline = hoverOutline;
      canvas.add(hoverOutline);

      // ---- Selected-Outline (center-origin, mit Winkel) ----
      const selectedOutline = new fabric.Rect({
        left: 0,
        top: 0,
        width: 10,
        height: 10,
        originX: "center",
        originY: "center",
        angle: 0,
        fill: "rgba(0,0,0,0)",
        stroke: SELECT_COLOR,
        strokeWidth: SELECT_STROKE,
        strokeUniform: true,
        selectable: false,
        evented: false,
        visible: false,
        objectCaching: false,
        excludeFromExport: true,
        rx: 2,
        ry: 2,
      });
      (canvas as any).__selectedOutline = selectedOutline;
      canvas.add(selectedOutline);

      // ---- Rotation-Badge ----
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

      // --- Content area (A4 margins) as system guide ---
      const ensureContentRect = () => {
        const leftM = Number((margins as any)?.left ?? 0);
        const topM = Number((margins as any)?.top ?? 0);
        const rightM = Number((margins as any)?.right ?? 0);
        const bottomM = Number((margins as any)?.bottom ?? 0);
        const w = Math.max(0, PAGE_W - leftM - rightM);
        const h = Math.max(0, PAGE_H - topM - bottomM);

        let contentRect = (canvas.getObjects() as any[]).find(o => o?.data?.__systemContentRect);
        if (!contentRect) {
          contentRect = new fabric.Rect({
            left: leftM,
            top: topM,
            width: w,
            height: h,
            fill: "rgba(0,0,0,0.02)",
            stroke: "rgba(0,0,0,0.15)",
            strokeWidth: 1,
            strokeDashArray: [6, 4],
            originX: "left",
            originY: "top",
            selectable: false,
            evented: false,
            objectCaching: false,
            strokeUniform: true,
          }) as any;
          (contentRect as any).data = { __system: true, __systemContentRect: true };
          canvas.add(contentRect);
          canvas.sendToBack?.(contentRect);
        } else {
          contentRect.set({ left: leftM, top: topM, width: w, height: h });
          contentRect.setCoords();
        }
      };
      ensureContentRect();
      bringObjectToFront(canvas, selectedOutline);
      bringObjectToFront(canvas, badge);
      canvas.requestRenderAll();

      // Textbox unter Maus (rotation-aware)
      const getTextboxUnderPointer = (t: any, ev: MouseEvent) => {
        if (!t) return null;
        if (t.type === "textbox") return t;
        const grp = t.type === "group" ? t : t.group;
        if (!grp) return null;

        const p = canvas.getPointer(ev);
        const pt = new fabric.Point(p.x, p.y);

        for (const child of (grp._objects || [])) {
          if (!child || child.type !== "textbox") continue;

          // Prefer Fabric's containsPoint (matrix-aware)
          try {
            if (typeof (child as any).containsPoint === "function") {
              if ((child as any).containsPoint(pt)) return child;
            }
          } catch {}

          // Manual local-space hit test via inverted matrix
          try {
            const m = (child as any).calcTransformMatrix?.() || (child as any).transformMatrix;
            if (m) {
              const inv = fabric.util.invertTransform(m);
              const lp = fabric.util.transformPoint(pt, inv);
              const w = (child as any).width ?? 0;
              const h = (child as any).height ?? 0;
              if (lp.x >= 0 && lp.y >= 0 && lp.x <= w && lp.y <= h) {
                return child;
              }
            }
          } catch {}
        }
        return null;
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
        tb.set({ backgroundColor: SELECT_BG_RGBA });
        tb.dirty = true;
        lastSelectedTextboxRef.current = tb;
      };

      const UPDATE_SELECTED_MARKER = () => {
        const ae = activeEditRef.current;
        if (!ae || !ae.textbox) return;
        const { cx, cy, w, h, angle } = getOutlineFrame(canvas, ae.textbox, SELECT_OUTSET);
        selectedOutline.set({ left: cx, top: cy, width: w, height: h, angle, visible: true });
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

      // Hover – nun ebenfalls mit Winkel
      const hideHover = () => {
        hoverOutline.set({ visible: false });
        canvas.requestRenderAll();
      };

      const onMouseMove = (e: any) => {
        const t = canvas.findTarget(e.e, true) as any;
        const tb = getTextboxUnderPointer(t, e.e);

        if (tb) {
          const isSame =
            !!activeEditRef.current && activeEditRef.current.textbox === tb;
          if (!isSame) {
            const { cx, cy, w, h, angle } = getOutlineFrame(canvas, tb, OUTSET_PX);
            hoverOutline.set({
              left: cx,
              top: cy,
              width: w,
              height: h,
              angle,
              visible: true,
              opacity: 1,
            });
            bringObjectToFront(canvas, hoverOutline);
            canvas.setCursor("text");
            canvas.requestRenderAll();
            return;
          }
        }
        hideHover();
      };

      // Klick: Text → Selection; Gruppe → aktivieren + Controls
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
          grp.centeredRotation = true; // rotate around center

          // Custom rotate control; Snap während Drag: wir ergänzen Live-Snap unten
          const rc = rotateControlRef.current;
          if (rc) {
            const baseControls = (fabric.Object as any)?.prototype?.controls || {};
            if (!(grp as any).controls) (grp as any).controls = { ...baseControls };
            (grp as any).controls.mtr = rc;
          }
          (grp as any).snapAngle = 0;
          (grp as any).snapThreshold = 0;

          canvas.requestRenderAll();
          return;
        }
        CLEAR_SELECTION();
      };

      // Nach jedem Render: Selected-Marker mitführen (inkl. Rotation/Zoom)
      const onAfterRender = () => {
        if (activeEditRef.current) UPDATE_SELECTED_MARKER();
      };

      // Rotation: Badge + Selected-Outline live aktualisieren
      const positionBadgeAboveHandle = (target: any) => {
        const z = canvas.getZoom() || 1;
        const br = target.getBoundingRect(false, true);
        const x = br.left + br.width / 2;
        const y =
          br.top -
          (ROTATE_OFFSET_Y / z + (ROTATE_CORNER_SIZE / z) / 2 + BADGE_MARGIN / z);
        return { x, y };
      };

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

        const { x, y } = positionBadgeAboveHandle(target);
        badge.set({ left: x, top: y, visible: true });
        bringObjectToFront(canvas, badge);
      };

      const hideRotationBadge = () => {
        rotationBadgeRef.current?.badge?.set({ visible: false });
        canvas.requestRenderAll();
      };

      const onObjectRotating = (e: any) => {
        const target = e?.target as any;
        if (!target || target.type !== "group" || target.data?.type !== "section") return;
        rotationDragRef.current.isRotating = true;
        rotationDragRef.current.usedAlt =
          rotationDragRef.current.usedAlt || !!e.e?.altKey;

        const altNow = !!e.e?.altKey;

        // Live-Snap: nur wenn ALT *nicht* gedrückt
        if (!altNow) {
          const a = normAngle(target.angle || 0);
          const nearest = snapAngleToStep(a, SNAP_STEP);
          const rawDiff = Math.abs(nearest - a);
          const diff = Math.min(rawDiff, 360 - rawDiff);
          if (diff <= SNAP_THRESHOLD) {
            target.angle = nearest === 360 ? 0 : nearest;
          }
        }

        showRotationBadge(target, altNow);

        // während der Rotation Marker mitführen
        if (activeEditRef.current) {
          const tb = activeEditRef.current.textbox;
          if (tb && tb.group === target) {
            const { cx, cy, w, h, angle } = getOutlineFrame(canvas, tb, SELECT_OUTSET);
            selectedOutline.set({ left: cx, top: cy, width: w, height: h, angle, visible: true });
          }
        }
      };

      const onObjectModified = (e: any) => {
        const target = e?.target as any;
        if (rotationDragRef.current.isRotating && target && target.type === "group") {
          const usedAlt = rotationDragRef.current.usedAlt;
          rotationDragRef.current.isRotating = false;
          rotationDragRef.current.usedAlt = false;

          // Final-Snap falls ALT nicht genutzt wurde
          if (!usedAlt) {
            const a = normAngle(target.angle || 0);
            const nearest = snapAngleToStep(a, SNAP_STEP);
            const rawDiff = Math.abs(nearest - a);
            const diff = Math.min(rawDiff, 360 - rawDiff);
            if (diff <= SNAP_THRESHOLD) {
              target.angle = nearest === 360 ? 0 : nearest;
              target.setCoords();
              canvas.requestRenderAll();
            }
          }
        }
        hideRotationBadge();
        // nach Snapping: Marker final positionieren
        if (activeEditRef.current) UPDATE_SELECTED_MARKER();
      };

      // Canvas verlassen → aufräumen
      const upperEl = canvas.upperCanvasEl as HTMLCanvasElement | undefined;
      const onDomLeave = () => {
        hoverOutline.set({ visible: false });
        hideRotationBadge();
        rotationDragRef.current.isRotating = false;
        rotationDragRef.current.usedAlt = false;
      };

      const onMouseOut = (e: any) => {
        const t = e?.target as any;
        if (t && t.type === "textbox") {
          hoverOutline.set({ visible: false });
          canvas.requestRenderAll();
        }
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

  // ----- Render Sections -----
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

      // große unauffällige Hit-Area
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
        const secW = section.width;
        const secH = section.height;
        const leftM = Number((margins as any)?.left ?? 0);
        const topM = Number((margins as any)?.top ?? 0);
        const groupLeft = Number(section.x) + leftM + secW / 2;
        const groupTop = Number(section.y) + topM + secH / 2;
      const sectionGroup = new fabricNamespace.Group(children, { originX: "center", originY: "center", centeredRotation: true,
        left: groupLeft,
        top: groupTop,
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
        borderColor: SELECT_COLOR,
        cornerColor: SELECT_COLOR,
        padding: 8,
        borderScaleFactor: 2,
        subTargetCheck: true,
        hoverCursor: "move",
        moveCursor: "move",
        centeredRotation: true,
      }) as any;

      // rotate control pro Gruppe; Snap während Drag AUS (Live-Snap im Event)
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

      // Rebind selektiertes Mapping
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

          const { cx, cy, w, h, angle } = getOutlineFrame(fabricCanvas, newTb, SELECT_OUTSET);
          (fabricCanvas as any).__selectedOutline?.set({ left: cx, top: cy, width: w, height: h, angle, visible: true });
        }
      }
    }

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

  // Keyboard-Nudging
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

      // Badge kurz zeigen
      const ref = rotationBadgeRef.current;
      if (ref) {
        const z = fabricCanvas.getZoom() || 1;
        const a = normAngle(obj.angle || 0);
        const text = `${Math.round(a * 10) / 10}°`;
        ref.badgeText.set({ text, fontSize: 12 / z });
        (ref.badgeText as any).initDimensions?.();
        ref.badgeRect.set({
          width: (ref.badgeText.width || 18) + (8 / z) * 2,
          height: (ref.badgeText.height || 12 / z) + (4 / z) * 2,
          rx: 8 / z,
          ry: 8 / z,
        });
        const br = obj.getBoundingRect(false, true);
        const x = br.left + br.width / 2;
        const y =
          br.top -
          (ROTATE_OFFSET_Y / z + (ROTATE_CORNER_SIZE / z) / 2 + BADGE_MARGIN / z);
        ref.badge.set({ left: x, top: y, visible: true });
        bringObjectToFront(fabricCanvas, ref.badge);
        fabricCanvas.requestRenderAll();
      }

      clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = setTimeout(() => {
        rotationBadgeRef.current?.badge?.set({ visible: false });
        fabricCanvas.requestRenderAll();
      }, 800);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fabricCanvas]);

  // ESC → Overlay schließen
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
