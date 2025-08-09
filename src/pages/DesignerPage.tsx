import React from "react";
import FabricCanvas from "@/modules/cv-designer/canvas/FabricCanvas";
import CanvasToolbar from "@/modules/cv-designer/components/CanvasToolbar";
import RightSidebar from "@/modules/cv-designer/components/RightSidebar";
import { useLiveSyncFromGenerator } from "@/modules/cv-designer/services/useLiveSyncFromGenerator";

export default function DesignerPage() {
  // Live-Sync: Rohdaten → Canvas (Upsert, mit Lock/Style-Preserve)
  useLiveSyncFromGenerator(200);

  return (
    <main className="h-[calc(100vh-64px)] grid grid-cols-[240px,1fr,320px] gap-4 p-4">
      {/* Linke Werkzeugleiste */}
      <aside className="min-h-0 overflow-auto">
        <CanvasToolbar />
      </aside>

      {/* Canvas-Bereich */}
      <section className="min-h-0 overflow-auto">
        <FabricCanvas />
      </section>

      {/* Rechte Sidebar (Styles, Parts, Export etc.) */}
      <aside className="min-h-0 overflow-auto">
        <RightSidebar />
      </aside>
    </main>
  );
}
