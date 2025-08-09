import React from "react";

// ⬇️ KORREKT: canvas/… statt components/…
import FabricCanvas from "@/modules/cv-designer/canvas/FabricCanvas";
import RightSidebar from "@/modules/cv-designer/components/RightSidebar";
import { useLiveSyncFromGenerator } from "@/modules/cv-designer/services/useLiveSyncFromGenerator";

export default function DesignerPage() {
  // Live-Sync mounten (200 ms Debounce)
  useLiveSyncFromGenerator(200);

  return (
    <main className="flex h-[calc(100vh-56px)]">
      <div className="flex-1 p-4">
        <FabricCanvas />
      </div>
      <RightSidebar />
    </main>
  );
}
