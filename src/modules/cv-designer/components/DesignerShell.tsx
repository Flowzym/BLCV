import React from "react";
import { FabricCanvas } from "../canvas/FabricCanvas";
import { RightSidebar } from "./RightSidebar";

export const DesignerShell: React.FC = () => {
  return (
    <div className="flex h-full">
      <div className="relative flex-1 flex items-center justify-center bg-gray-100">
        <FabricCanvas />
      </div>
      <RightSidebar />
    </div>
  );
};
