import React from "react";
import CanvasToolbar from "./CanvasToolbar";
import FabricCanvas from "../canvas/FabricCanvas";
import RightSidebar from "./RightSidebar";

export default function DesignerShell() {
  return (
    <div className="flex flex-col h-full">
      <CanvasToolbar />
      <div className="flex min-h-0 flex-1">
        <div className="flex-1 overflow-auto p-4">
          <div className="inline-block shadow border bg-white">
            <FabricCanvas />
          </div>
        </div>
        <RightSidebar />
      </div>
    </div>
  );
}
