import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { installSectionResize } from "./installSectionResize";
import { useDesignerStore } from "../store/designerStore";
import TextEditorOverlay from "../ui/TextEditorOverlay";

type Props = {
  width: number;
  height: number;
};

export default function FabricCanvas({ width, height }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const sections = useDesignerStore((s) => s.sections);
  const selectionMode = useDesignerStore((s) => s.selectionMode); // optional
  const setActiveEdit = useDesignerStore((s) => s.setActiveEdit);

  // Mount canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const el = document.createElement("canvas");
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(el);

    const c = new fabric.Canvas(el, {
      width,
      height,
      backgroundColor: "#fff",
      selection: true,
      selectionFullyContained: false,
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: false,
      perPixelTargetFind: true,
      targetFindTolerance: 6,
      hoverCursor: "move",
    });

    // Better defaults for selection/drag
    c.on("mouse:down", () => {
      // Close overlay if clicking empty area
      if (!c.findTarget((c as any)._curPointer, true)) {
        setOverlayOpen(false);
      }
    });

    // Subtarget selection: prefer group selection unless Alt pressed
    c.on("mouse:up", (e: fabric.IEvent<Event>) => {
      const tgt = e.target as any;
      if (!tgt) return;

      // Enable dragging sections (groups)
      const group = tgt.type === "group" ? tgt : tgt.group;
      if (group) {
        group.selectable = true;
        group.lockMovementX = false;
        group.lockMovementY = false;
        group.hasControls = true;
        group.hoverCursor = "move";
        c.setActiveObject(group);
      }

      // If a textbox is the focus, open overlay
      const isTextbox = tgt.type === "textbox" || (e.subTargets && e.subTargets.some((st: any) => st.type === "textbox"));
      if (isTextbox) {
        setOverlayOpen(true);
      }
    });

    // Hover highlight for mapping fields (textboxes)
    let lastHover: fabric.Object | null = null;
    c.on("mouse:move", (e) => {
      const t = c.findTarget(e.e, true) as any;
      if (t === lastHover) return;
      if (lastHover && (lastHover as any).__hoverStroke) {
        (lastHover as any).set({ stroke: (lastHover as any).__origStroke, strokeWidth: (lastHover as any).__origStrokeWidth });
        (lastHover as any).__hoverStroke = false;
      }
      lastHover = null;

      if (t && (t.type === "textbox" || t.data?.isMappingField)) {
        (t as any).__origStroke = t.stroke;
        (t as any).__origStrokeWidth = t.strokeWidth;
        t.set({ stroke: "#60a5fa", strokeWidth: 1.25 }); // tailwind blue-400
        (t as any).__hoverStroke = true;
        c.requestRenderAll();
        c.setCursor("text");
        lastHover = t;
      } else {
        c.setCursor("default");
      }
    });

    // Install resize behavior on groups/sections
    installSectionResize(c);

    setCanvas(c);
    return () => {
      c.dispose();
      setCanvas(null);
    };
  }, [width, height]);

  // Render sections (simplified – assumes external service draws them)
  useEffect(() => {
    if (!canvas) return;
    // external render/update handled elsewhere in your codebase
    canvas.requestRenderAll();
  }, [canvas, sections]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOverlayOpen(false);
        setActiveEdit(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setActiveEdit]);

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {canvas && overlayOpen && containerRef.current && (
        <TextEditorOverlay
          canvas={canvas}
          containerEl={containerRef.current}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </div>
  );
}
