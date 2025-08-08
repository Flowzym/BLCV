// src/modules/cv-designer/components/DesignerShell.tsx
import React, { useEffect, useRef } from "react";
import FabricCanvas from "../canvas/FabricCanvas";
import RightSidebar from "./RightSidebar";
import CanvasToolbar from "./CanvasToolbar";
import { useDesignerStore } from "../store/designerStore";

export default function DesignerShell() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fitToScreen = useDesignerStore((s) => s.fitToScreen);
  const zoom100 = useDesignerStore((s) => s.zoom100);
  const zoomIn = useDesignerStore((s) => s.zoomIn);
  const zoomOut = useDesignerStore((s) => s.zoomOut);

  // hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmd = e.ctrlKey || e.metaKey;
      if (isCmd && e.key === "0") {
        e.preventDefault();
        const r = containerRef.current?.getBoundingClientRect();
        if (r) fitToScreen(r.width, r.height);
        return;
      }
      if (isCmd && e.key === "1") {
        e.preventDefault();
        zoom100();
        return;
      }
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomOut();
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fitToScreen, zoom100, zoomIn, zoomOut]);

  return (
    <div className="flex h-full">
      <div ref={containerRef} className="relative flex-1 p-4 bg-gray-100">
        <CanvasToolbar />
        <div className="rounded border border-gray-200 bg-white p-4 inline-block">
          <FabricCanvas />
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}
