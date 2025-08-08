// src/modules/cv-designer/components/DesignerShell.tsx
import React from "react";
import CanvasToolbar from "./CanvasToolbar";
import FabricCanvas from "../canvas/FabricCanvas";
import RightSidebar from "./RightSidebar";

export default function DesignerShell() {
  return (
    <div className="flex h-[calc(100vh-120px)] w-full">
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <CanvasToolbar />
        <div className="flex min-h-0 flex-1 overflow-auto rounded border bg-gray-50 p-6">
          <div className="mx-auto">
            <FabricCanvas />
          </div>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}
