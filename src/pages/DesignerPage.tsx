// src/pages/DesignerPage.tsx
import React from "react";
import FabricCanvas from "@/modules/cv-designer/canvas/FabricCanvas";
import { useLiveSyncFromGenerator } from "@/modules/cv-designer/services/useLiveSyncFromGenerator";

// Optional: Sidebar einhängen, wenn vorhanden
// import RightSidebar from "@/modules/cv-designer/components/RightSidebar";

export default function DesignerPage() {
  // Live-Sync: mapped Rohdaten aus dem Lebenslauf-Generator → Canvas
  useLiveSyncFromGenerator(200);

  return (
    <main className="h-[calc(100vh-64px)] grid grid-cols-[1fr_320px] gap-4 p-4">
      <FabricCanvas />
      {/* <RightSidebar /> */}
    </main>
  );
}
