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
  if (arr?.includes?.(obj)) canvas.remove(obj);
  canvas.add(obj);
}

// Hilfsfunktionen
function normAngle(a: number) {
  let n = a % 360;
  if (n < 0) n += 360;
  return n;
}
function snapAngleToStep(a: number, step = 45) {
  const n = normAngle(a);
  const k = Math.round(n / step);
  return k * step;
}

// width/height (ohne Rotation) plus Outset in px/zoom
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

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: PAGE_W,
        height: PAGE_H,
        selection: false,
        renderOnAddRemove: false,
        preserveObjectStacking: true,
      });
      CanvasRegistry.set(canvasRef.current, canvas);

      // Interaction Baseline
      canvas.uniformScaling = false;
      canvas.altSelectionKey = "altKey";
      canvas.selection = false;
      canvas.fireRightClick = false;
      canvas.targetFindTolerance = 14;

      // ---- Rotate-Control (poliertes Icon) ----
      rotateControlRef.current = new fabric.Control({
        x: 0,
        y: -0.5,
        offsetY: -ROTATE_OFFSET_Y,
        withConnection: true,
        actionName: "rotate",
        cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
        actionHandler: fabric.controlsUtils.rotationWithSnapping, // wir snappen erst beim mouseup
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
          ctx.fillStyle = "white";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
          ctx.lineWidth = ringW;
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.stroke();

          const r = rOuter - 4 / z;
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
      });
      (canvas as any).__selectedOutline = selectedOutline;
      canvas.add(selectedOutline);

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

      // ---- Rotation Badge (° + Free) ----
      const badge = new fabric.Group([], {
        visible: false,
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
      });
      const badgeText = new fabric.Textbox("0°", {
        originX: "center",
        originY: "center",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: 12,
        fill: "white",
        editable: false,
        selectable: false,
        evented: false,
        objectCaching: false,
      });
      badge.addWithUpdate(badgeRect);
      badge.addWithUpdate(badgeText);
      (badge as any).subTargetCheck = false;
      (badge as any).hoverCursor = "default";
      canvas.add(badge);
      const ref = { badge, badgeRect, badgeText };
      rotationBadgeRef.current = ref;

      const positionBadgeAboveHandle = (obj: any) => {
        const z = canvas.getZoom() || 1;
        const br = obj.getBoundingRect(false, true);
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

      // Textbox unter Maus (rotate-aware; präzise Hit-Erkennung auch bei Winkel)
      const getTextboxUnderPointer = (t: any, ev: MouseEvent) => {
        if (!t) return null;
        if (t.type === "textbox") return t;
        const grp = t.type === "group" ? t : t.group;
        if (!grp) return null;

        const p = canvas.getPointer(ev);

        // Punkt-in-Polygon-Test für jede Textbox anhand ihrer aCoords (tl,tr,br,bl)
        const pointInQuad = (pt: {x:number;y:number}, quad: Array<{x:number;y:number}>) => {
          // Winding-Algorithmus (konvex & konkav)
          let inside = false;
          for (let i = 0, j = quad.length - 1; i < quad.length; j = i++) {
            const xi = quad[i].x, yi = quad[i].y;
            const xj = quad[j].x, yj = quad[j].y;
            const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
              (pt.x < (xj - xi) * (pt.y - yi) / ((yj - yi) || 1e-6) + xi);
            if (intersect) inside = !inside;
          }
          return inside;
        };

        const hit = (grp._objects || []).find((child: any) => {
          if (child.type !== "textbox") return false;
          const ac = child.aCoords as any;
          if (ac && ac.tl && ac.tr && ac.br && ac.bl) {
            const quad = [ac.tl, ac.tr, ac.br, ac.bl];
            return pointInQuad(p as any, quad as any);
          }
          // Fallback: axis-aligned BoundingBox
          const r = child.getBoundingRect(true, true);
          return p.x >= r.left && p.x <= r.left + r.width && p.y >= r.top && p.y <= r.top + r.height;
        });
        return hit || null;
      };

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
        if (grp && grp.data?.type === "section") {
          canvas.setActiveObject(grp);
          grp.hoverCursor = "move";
          grp.moveCursor = "move";
          grp.selectable = true;
          grp.lockMovementX = false;
          grp.lockMovementY = false;
          grp.hasControls = true;
          grp.borderColor = SELECT_COLOR;
          grp.cornerColor = SELECT_COLOR;

          // Custom rotate control; Snap während Drag AUS
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

      const onMouseOut = (e: any) => {
        const t = e?.target as any;
        if (t && t.type === "textbox") {
          hoverOutline.set({ visible: false });
          canvas.requestRenderAll();
        }
      };

      // Rotation: Badge live + Snap am Ende (ALT = Free)
      const onObjectRotating = (e: any) => {
        const target = e?.target as any;
        if (!target || target.type !== "group" || target.data?.type !== "section") return;
        rotationDragRef.current.isRotating = true;
        rotationDragRef.current.usedAlt =
          rotationDragRef.current.usedAlt || !!e.e?.altKey;

        const altNow = !!e.e?.altKey;
        showRotationBadge(target, altNow);

        // während der Rotation Marker mitführen
        if (activeEditRef.current) {
          const tb = activeEditRef.current.textbox;
          if (tb && tb.group === target) {
            const { cx, cy, w, h, angle } = getOutlineFrame(canvas, tb, SELECT_OUTSET);
            selectedOutline.set({ left: cx, top: cy, width: w, height: h, angle, visible: true });
            bringObjectToFront(canvas, selectedOutline);
            canvas.requestRenderAll();
          }
        }
      };

      const onObjectModified = (e: any) => {
        const target = e?.target as any;
        if (rotationDragRef.current.isRotating && target && target.type === "group") {
          const usedAlt = rotationDragRef.current.usedAlt;
          rotationDragRef.current.isRotating = false;
          rotationDragRef.current.usedAlt = false;

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

      const hideRotationBadge = () => {
        const ref = rotationBadgeRef.current;
        if (!ref) return;
        ref.badge.set({ visible: false });
        canvas.requestRenderAll();
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

    const SEC_PAD_L = 8;
    const SEC_PAD_R = 8;
    const SEC_PAD_T = 6;
    const SEC_PAD_B = 6;

    for (const section of sections) {
      const children: any[] = [];

      // Frame + HitArea
      const frame = new fabricNamespace.Rect({
        left: 0, top: 0,
        originX: "center", originY: "center",
        width: section.width, height: section.height,
        fill: "rgba(0,0,0,0)",
        stroke: "rgba(0,0,0,0)",
        selectable: false, evented: false,
        objectCaching: false,
      });
      (frame as any).data = { isFrame: true };

      const hitArea = new fabricNamespace.Rect({
        left: 0, top: 0,
        originX: "center", originY: "center",
        width: section.width, height: section.height,
        fill: "rgba(0,0,0,0)",
        stroke: "rgba(0,0,0,0)",
        selectable: false, evented: false,
        objectCaching: false,
      });
      (hitArea as any).data = { isHitArea: true };

      children.push(frame);
      children.push(hitArea);

      // Textparts
      for (const part of section.parts || []) {
        const padL = SEC_PAD_L;
        const padR = SEC_PAD_R;
        const padT = SEC_PAD_T;

        const indentPx =
          Number(part.indentPx ?? (part.fieldType === "bullet" ? 16 : 0));

        const g =
          (globalFieldStyles as any)?.[section.sectionType || "experience"]?.[
            part.fieldType
          ] || {};
        const loc = (partStyles as any)?.[section.id]?.[part.fieldType] || {};
        const finalStyle = {
          fontFamily: loc.fontFamily ?? g.fontFamily ?? "Arial",
          fontSize: Number(loc.fontSize ?? g.fontSize ?? 12),
          color: loc.color ?? g.color ?? "#111827",
          fontWeight: (loc.bold ?? g.bold) ? ("bold" as any) : ("normal" as any),
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
        }) as any;

        tb.fieldType = part.fieldType;
        tb.sectionId = section.id;
        tb.data = {
          order: Number(part.order ?? 0),
          indentPx: indentPx,
          gapBefore: Number(part.gapBefore ?? 0),
        };

        const padB = SEC_PAD_B;
        const padL2 = SEC_PAD_L;
        const padR2 = SEC_PAD_R;
        const padT2 = SEC_PAD_T;

        const padLFinal = padL2;
        const padRFinal = padR2;
        const padTFinal = padT2;
        const padBFinal = padB;

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
        borderColor: SELECT_COLOR,
        cornerColor: SELECT_COLOR,
        padding: 8,
        borderScaleFactor: 2,
        subTargetCheck: true,
        hoverCursor: "move",
        moveCursor: "move",
      }) as any;

      // rotate control pro Gruppe; Snap während Drag AUS
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
          setActiveEdit({ ...ae, group: sectionGroup, textbox: newTb });
          const { cx, cy, w, h, angle } = getOutlineFrame(fabricCanvas, newTb, SELECT_OUTSET);
          selectedOutline.set({ left: cx, top: cy, width: w, height: h, angle, visible: true });
          bringObjectToFront(fabricCanvas, selectedOutline);
        }
      }
    }

    // Badge oben halten
    const ref = rotationBadgeRef.current;
    if (ref) bringObjectToFront(fabricCanvas, ref.badge);

    fabricCanvas.requestRenderAll();
  }, [fabricCanvas, fabricNamespace, sections, globalFieldStyles, partStyles]);

  useEffect(() => {
    renderSections();
  }, [renderSections, zoom, tokens, margins, sections, partStyles, globalFieldStyles]);

  // Editor Overlay
  const [overlayState, setOverlayState] = useState<ActiveEdit>(null);

  useEffect(() => {
    setOverlayState(activeEdit);
  }, [activeEdit]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-auto bg-neutral-50">
      <div className="mx-auto my-6 shadow-xl border rounded bg-white" style={{ width: PAGE_W, height: PAGE_H }}>
        <canvas ref={canvasRef} />
      </div>

      {overlayState && containerRef.current && (
        <TextEditorOverlay
          canvas={fabricCanvas}
          containerEl={containerRef.current}
          group={overlayState.group}
          textbox={overlayState.textbox}
          sectionId={overlayState.sectionId}
          sectionType={overlayState.sectionType}
          fieldType={overlayState.fieldType}
        />
      )}
    </div>
  );
}
