import React from "react";
import FabricCanvas from "@/modules/cv-designer/components/FabricCanvas";
import { useLiveSyncFromGenerator } from "@/modules/cv-designer/services/useLiveSyncFromGenerator";

// Falls du (noch) keine RightSidebar hast, kommentiere die Zeile aus.
// import RightSidebar from "@/modules/cv-designer/components/RightSidebar";

export default function DesignerPage() {
  useLiveSyncFromGenerator(150); // live Sync vom Generator → Canvas

  return (
    <main className="h-[calc(100vh-64px)] grid grid-cols-[1fr_320px] gap-4 p-4">
      <FabricCanvas />
      {/* <RightSidebar /> */}
    </main>
  );
}
