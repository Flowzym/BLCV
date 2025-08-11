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

type BadgeRefs = {
  badge: any | null;
  circle: any | null;
  text: any | null;
};

type RotationDragRef = {
  isRotating: boolean;
  usedAlt: boolean;
};

function FabricCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [fabricNamespace, setFabricNamespace] = useState<any>(null);
  const [activeEdit, setActiveEdit] = useState<ActiveEdit>(null);
  const activeEditRef = useRef<ActiveEdit>(null);
  const lastSelectedTextboxRef = useRef<any>(null);
  const rotationBadgeRef = useRef<BadgeRefs>({ badge: null, circle: null, text: null });
  const rotationDragRef = useRef<RotationDragRef>({ isRotating: false, usedAlt: false });

  const sections = useDesignerStore((s) => s.sections);
  const tokens = useDesignerStore((s) => s.tokens);
  const margins = useDesignerStore((s) => s.margins);
  const globalFieldStyles = useDesignerStore((s) => s.globalFieldStyles);
  const partStyles = useDesignerStore((s) => s.partStyles);
  const zoom = useDesignerStore((s) => s.zoom ?? 1);

  const DBG = (...args: any[]) => {
    if (import.meta.env.VITE_DEBUG_CV === "true") {
      console.log("[CV]", ...args);
    }
  };

  useEffect(() => {
    let disposed = false;
    (async () => {
      const fabric = await getFabric();
      if (disposed) return;

      setFabricNamespace(fabric);

      const registry = CanvasRegistry.getOrCreate("cv-designer");
      let canvas = registry.canvas as any;
      if (!canvas) {
        canvas = new fabric.Canvas(canvasRef.current, {
          width: PAGE_W + (margins?.left ?? 0) + (margins?.right ?? 0),
          height: PAGE_H + (margins?.top ?? 0) + (margins?.bottom ?? 0),
          selection: true,
          renderOnAddRemove: false,
          preserveObjectStacking: true,
          fireRightClick: true,
          stopContextMenu: true,
          backgroundColor: "#ffffff",
        }) as any;
        CanvasRegistry.setCanvas("cv-designer", canvas);
      }

      canvas.selection = true;
      canvas.hoverCursor = "default";
      canvas.moveCursor = "move";
      canvas.defaultCursor = "default";
      canvas.perPixelTargetFind = false;
      canvas.targetFindTolerance = 14;
      canvas.subTargetCheck = true;

      // --- Rotate Control (custom MTR with badge space) ---
      const { fabric: fabricNS } = { fabric };
      const circle = new fabricNS.Circle({
        radius: ROTATE_CORNER_SIZE / 2,
        fill: SELECT_COLOR,
        stroke: SELECT_COLOR,
        strokeWidth: 1,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
        objectCaching: false,
        strokeUniform: true,
      });
      const badgeText = new fabricNS.Text("0°", {
        fontSize: 12,
        fill: "#000",
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
        objectCaching: false,
        strokeUniform: true,
      });
      const badgeRect = new fabricNS.Rect({
        rx: 8,
        ry: 8,
        width: 32,
        height: 18,
        fill: "#fff",
        stroke: SELECT_COLOR,
        strokeWidth: 1,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
        objectCaching: false,
        strokeUniform: true,
      });
      const badge = new fabricNS.Group([badgeRect, badgeText], {
        left: 0,
        top: 0,
        visible: false,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        objectCaching: false,
      });

      (canvas as any).__rotationBadge = badge;
      (canvas as any).__badgeRect = badgeRect;
      (canvas as any).__badgeText = badgeText;
      (canvas as any).__badgeCircle = circle;

      canvas.add(badge);

      const rotateControl = new fabricNS.Control({
        x: 0,
        y: -0.5,
        cursorStyle: "crosshair",
        actionHandler: fabricNS.controlsUtils.rotationWithSnapping,
        offsetY: -ROTATE_OFFSET_Y,
        withConnection: true,
        actionName: "rotate",
        render: (ctx: CanvasRenderingContext2D, left: number, top: number) => {
          const size = ROTATE_CORNER_SIZE;
          ctx.save();
          ctx.translate(left, top);
          ctx.beginPath();
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
          ctx.fillStyle = SELECT_COLOR;
          ctx.fill();
          ctx.restore();
        },
      });
      (rotateControl as any).sizeX = ROTATE_CORNER_SIZE;
      (rotateControl as any).sizeY = ROTATE_CORNER_SIZE;
      (rotateControl as any).offsetY = -ROTATE_OFFSET_Y;

      (canvas as any).__rotateControl = rotateControl;
      rotationBadgeRef.current = { badge, circle, text: badgeText };

      setFabricCanvas(canvas);

      return () => {
        try {
          canvas.dispose();
        } catch {}
        setFabricCanvas(null);
      };
    })();

    return () => {
      disposed = true;
    };
  }, [margins]);

  useEffect(() => {
    activeEditRef.current = activeEdit;
  }, [activeEdit]);

  const bringObjectToFront = (canvas: any, obj: any) => {
    try {
      if (!obj) return;
      canvas.bringToFront(obj);
    } catch {}
  };

  const normAngle = (a: number) => {
    let res = a % 360;
    if (res < 0) res += 360;
    return res;
  };

  const snapAngleToStep = (a: number, step: number) => {
    const q = Math.round(a / step);
    let s = q * step;
    if (s === 360) s = 0;
    return s;
  };

  const getOutlineFrame = (canvas: any, tb: any, outset?: { l: number; t: number; r: number; b: number }) => {
    const zoom = canvas.getZoom ? canvas.getZoom() : 1;
    const outL = (outset?.l ?? OUTSET_PX) / zoom;
    const outT = (outset?.t ?? OUTSET_PX) / zoom;
    const outR = (outset?.r ?? OUTSET_PX) / zoom;
    const outB = (outset?.b ?? OUTSET_PX) / zoom;

    const r = tb.getBoundingRect(false, true);
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const w0 = tb.getScaledWidth ? tb.getScaledWidth() : r.width;
    const h0 = tb.getScaledHeight ? tb.getScaledHeight() : r.height;
    const w = w0 + outL + outR;
    const h = h0 + outT + outB;
    const angle = tb.group?.angle ?? tb.angle ?? 0;
    return { cx, cy, w, h, angle };
  };

  const renderSections = useCallback(() => {
    if (!fabricCanvas || !fabricNamespace) return;

    const canvas: any = fabricCanvas;
    const fabric: any = fabricNamespace;

    canvas.off("mouse:move");
    canvas.off("mouse:up");
    canvas.off("after:render");
    canvas.off("mouse:out");
    canvas.off("object:rotating");
    canvas.off("object:modified");
    canvas.off("selection:cleared");

    const upperEl = canvas.upperCanvasEl as HTMLCanvasElement | undefined;

    // Hover & Selected Outlines
    const hoverOutline = new fabric.Rect({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      stroke: HOVER_COLOR,
      strokeWidth: HOVER_STROKE,
      fill: "transparent",
      originX: "center",
      originY: "center",
      visible: false,
      evented: false,
      selectable: false,
      objectCaching: false,
      strokeUniform: true,
      rx: 4,
      ry: 4,
    });

    const selectedOutline = new fabric.Rect({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      stroke: SELECT_COLOR,
      strokeWidth: SELECT_STROKE,
      fill: "transparent",
      originX: "center",
      originY: "center",
      visible: false,
      evented: false,
      selectable: false,
      objectCaching: false,
      strokeUniform: true,
      rx: 6,
      ry: 6,
    });

    canvas.add(hoverOutline);
    canvas.add(selectedOutline);
    (canvas as any).__hoverOutline = hoverOutline;
    (canvas as any).__selectedOutline = selectedOutline;

    const showRotationBadge = (grp: any, _showAlt: boolean) => {
      const badge = rotationBadgeRef.current?.badge;
      const text = rotationBadgeRef.current?.text;
      const circle = rotationBadgeRef.current?.circle;
      if (!badge || !text || !circle) return;

      const r = grp.getBoundingRect(false, true);
      const centerX = r.left + r.width / 2;
      const topY = r.top - BADGE_MARGIN;

      text.set({ text: `${Math.round(normAngle(grp.angle ?? 0))}°` });
      badge.set({ left: centerX, top: topY, visible: true });
      circle.set({ left: centerX, top: topY - ROTATE_OFFSET_Y, visible: true });
      bringObjectToFront(canvas, badge);
      bringObjectToFront(canvas, circle);
      canvas.requestRenderAll();
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
      // Live snapping while rotating (ALT disables snap)
      if (!altNow) {
        const a = normAngle(target.angle || 0);
        const nearest = snapAngleToStep(a, SNAP_STEP);
        const rawDiff = Math.abs(nearest - a);
        const diff = Math.min(rawDiff, 360 - rawDiff);
        if (diff <= SNAP_THRESHOLD) {
          target.angle = nearest;
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

        if (!usedAlt) {
          const a = normAngle(target.angle || 0);
          const nearest = snapAngleToStep(a, SNAP_STEP);
          const rawDiff = Math.abs(nearest - a);
          const diff = Math.min(rawDiff, 360 - rawDiff);
          if (diff <= SNAP_THRESHOLD) {
            target.angle = nearest;
          }
        }
        hideRotationBadge();
      }
    };

    const hideHover = () => {
      hoverOutline.set({ visible: false });
      canvas.requestRenderAll();
    };

    const getTextboxUnderPointer = (t: any, ev: MouseEvent) => {
      if (!t) return null;
      const grp = t.type === "group" ? t : t.group;
      if (t.type === "textbox") return t;
      if (!grp) return null;

      const p = canvas.getPointer(ev);
      const pt = new fabricNamespace.Point(p.x, p.y);

      for (const child of grp._objects || []) {
        if (!child || child.type !== "textbox") continue;

        try {
          if (typeof (child as any).containsPoint === "function") {
            if ((child as any).containsPoint(pt)) return child;
          }
        } catch {}

        try {
          const m = (child as any).calcTransformMatrix?.() || (child as any).transformMatrix;
          if (m) {
            const inv = fabricNamespace.util.invertTransform(m);
            const lp = fabricNamespace.util.transformPoint(pt, inv);
            const oW = (child as any).width ?? 0;
            const oH = (child as any).height ?? 0;
            if (lp.x >= 0 && lp.y >= 0 && lp.x <= oW && lp.y <= oH) {
              return child;
            }
          }
        } catch {}
      }
      return null;
    };

    const CLEAR_BG = () => {
      if (lastSelectedTextboxRef.current) {
        try {
          (lastSelectedTextboxRef.current as any).set({ backgroundColor: "transparent" });
        } catch {}
        lastSelectedTextboxRef.current = null;
      }
    };

    const SET_BG = (tb: any) => {
      CLEAR_BG();
      try {
        (tb as any).set({ backgroundColor: SELECT_BG_RGBA });
        lastSelectedTextboxRef.current = tb;
      } catch {}
    };

    const UPDATE_HOVER_MARKER = (tb: any) => {
      const { cx, cy, w, h, angle } = getOutlineFrame(canvas, tb);
      hoverOutline.set({ left: cx, top: cy, width: w, height: h, angle, visible: true });
      bringObjectToFront(canvas, hoverOutline);
    };

    const UPDATE_SELECTED_MARKER = (tb: any) => {
      const { cx, cy, w, h, angle } = getOutlineFrame(canvas, tb, SELECT_OUTSET);
      selectedOutline.set({ left: cx, top: cy, width: w, height: h, angle, visible: true });
      bringObjectToFront(canvas, selectedOutline);
      bringObjectToFront(canvas, rotationBadgeRef.current?.badge);
      canvas.requestRenderAll();
    };

    const onMouseMove = (e: any) => {
      const t = canvas.findTarget(e.e, true) as any;
      if (!t) {
        hideHover();
        return;
      }
      const tb = getTextboxUnderPointer(t, e.e);
      if (tb) {
        UPDATE_HOVER_MARKER(tb);
      } else {
        hideHover();
      }
    };

    const onMouseOut = () => {
      hideHover();
    };

    const SET_SELECTION = (tb: any) => {
      if (!tb || !tb.group) return;

      SET_BG(tb);
      UPDATE_SELECTED_MARKER(tb);

      bringObjectToFront(canvas, selectedOutline);
      bringObjectToFront(canvas, rotationBadgeRef.current?.badge);
      canvas.requestRenderAll();

      const grp = tb.group;
      canvas.setActiveObject(grp);
      canvas.requestRenderAll();

      setActiveEdit({
        sectionId: tb.sectionId,
        sectionType: grp.sectionType as SectionKind,
        fieldType: tb.fieldType,
        group: grp,
        textbox: tb,
      });
    };

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
        canvas.requestRenderAll();
      }
    };

    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", onMouseUp);
    canvas.on("after:render", () => {});
    canvas.on("mouse:out", onMouseOut);
    canvas.on("object:rotating", onObjectRotating);
    canvas.on("object:modified", onObjectModified);
    canvas.on("selection:cleared", hideRotationBadge);
    upperEl?.addEventListener("mouseleave", onMouseOut);

    // --- Render actual Sections ---
    canvas.getObjects().forEach((o: any) => {
      try {
        if (o && !o.excludeFromExport && !o.data?.__system) canvas.remove(o);
      } catch {}
    });

    if (Array.isArray(sections)) {
      sections.forEach((section: any) => {
        const SEC_PAD_L = Number(section.props?.paddingLeft ?? 24);
        const SEC_PAD_R = Number(section.props?.paddingRight ?? 24);
        const SEC_PAD_T = Number(section.props?.paddingTop ?? 16);
        const SEC_PAD_B = Number(section.props?.paddingBottom ?? 16);

        const children: any[] = [];

        // HitArea
        const hitArea = new fabricNamespace.Rect({
          left: -section.width / 2,
          top: -section.height / 2,
          width: section.width,
          height: section.height,
          fill: "rgba(0,0,0,0.001)",
          stroke: "transparent",
          strokeWidth: 0,
          originX: "left",
          originY: "top",
          selectable: false,
          evented: false,
          objectCaching: false,
        }) as any;
        (hitArea as any).data = { isHitArea: true, sectionId: section.id };

        // Frame
        const frame = new fabricNamespace.Rect({
          left: -section.width / 2,
          top: -section.height / 2,
          width: section.width,
          height: section.height,
          fill: "transparent",
          stroke: "rgba(0,0,0,0.08)",
          strokeWidth: 1,
          originX: "left",
          originY: "top",
          selectable: false,
          evented: false,
          objectCaching: false,
          strokeUniform: true,
        }) as any;
        (frame as any).data = { isFrame: true, sectionId: section.id };

        children.push(hitArea);
        children.push(frame);

        // Parts → Textboxen
        for (const part of section.parts || []) {
          const loc = (partStyles?.[section.id]?.[part.id]) || {};
          const g = globalFieldStyles?.[part.fieldType] || {};
          const finalStyle = {
            fontFamily: loc.fontFamily ?? g.fontFamily ?? tokens?.fonts?.base ?? "Arial",
            fontSize: Number(loc.fontSize ?? g.fontSize ?? 16),
            color: loc.color ?? g.color ?? "#000000",
            fontWeight: loc.fontWeight ?? g.fontWeight ?? "normal",
            fontStyle: loc.fontStyle ?? g.fontStyle ?? "normal",
            lineHeight: Number(loc.lineHeight ?? g.lineHeight ?? 1.4),
            letterSpacing: Number(loc.letterSpacing ?? g.letterSpacing ?? 0),
          };

          const indentPx = Number(loc.indentPx ?? g.indentPx ?? 0);

          const contentWidth = Math.max(1, section.width - SEC_PAD_L - SEC_PAD_R - indentPx);
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
            padL: SEC_PAD_L,
            padT: SEC_PAD_T,
            padR: SEC_PAD_R,
            padB: SEC_PAD_B,
            indentPx,
            order: Number(part.order ?? 0),
            gapBefore: Number(part.gapBefore ?? 0),
            lineHeight: finalStyle.lineHeight,
            isMappingField: true,
          };

          const halfW = section.width / 2;
          const tlX = SEC_PAD_L + indentPx;
          const tlY = SEC_PAD_T;
          tb.set({ left: tlX - halfW, top: tlY - section.height / 2 });
          tb.setCoords();

          children.push(tb);
        }

        // Gruppe
        const sectionGroup = new fabricNamespace.Group(children, {
          left: section.x,
          top: section.y,
          originX: "center",
          originY: "center",
          centeredRotation: true,
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

        const rc = (canvas as any).__rotateControl;
        if (rc) {
          const baseControls =
            (fabricNamespace.Object as any)?.prototype?.controls || {};
          if (!(sectionGroup as any).controls)
            (sectionGroup as any).controls = { ...baseControls };
          (sectionGroup as any).controls.mtr = rc;
        }
        (sectionGroup as any).snapAngle = SNAP_STEP;
        (sectionGroup as any).snapThreshold = SNAP_THRESHOLD;

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

        canvas.add(sectionGroup);

        // Initialer Reflow
        try {
          (sectionGroup as any).scaleX = 1;
          (sectionGroup as any).scaleY = 1;
          canvas.fire("object:scaling", { target: sectionGroup } as any);
          canvas.fire("object:modified", { target: sectionGroup } as any);
        } catch {}
      });
    }

    bringObjectToFront(canvas, hoverOutline);
    bringObjectToFront(canvas, selectedOutline);
    bringObjectToFront(canvas, (canvas as any).__rotationBadge);
    canvas.requestRenderAll();
  }, [fabricCanvas, fabricNamespace, sections, tokens, margins, globalFieldStyles, partStyles]);

  useEffect(() => {
    if (fabricCanvas && sections) renderSections();
  }, [fabricCanvas, sections, renderSections]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas ref={canvasRef} />
      {activeEdit && (
        <TextEditorOverlay
          canvas={fabricCanvas}
          textbox={activeEdit.textbox}
          group={activeEdit.group}
          sectionId={activeEdit.sectionId}
          fieldType={activeEdit.fieldType}
          onClose={() => setActiveEdit(null)}
        />
      )}
    </div>
  );
}

export default FabricCanvas;
