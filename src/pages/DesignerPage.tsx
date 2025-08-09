import React from "react";
import FabricCanvas from "@/modules/cv-designer/components/FabricCanvas";
import RightSidebar from "@/modules/cv-designer/components/RightSidebar";
import { useLiveSyncFromGenerator } from "@/modules/cv-designer/services/useLiveSyncFromGenerator";

export default function DesignerPage() {
  // <— Live-Sync immer aktiv (200 ms debounce)
  useLiveSyncFromGenerator(200);

  return (
    <main className="flex h-[calc(100vh-56px)]">
      <div className="flex-1 p-4"><FabricCanvas /></div>
      <RightSidebar />
    </main>
  );
}
