// src/pages/DesignerPage.tsx
import React from "react";
import FabricCanvas from "@/modules/cv-designer/canvas/FabricCanvas";
import CanvasToolbar from "@/modules/cv-designer/components/CanvasToolbar";
import RightSidebar from "@/modules/cv-designer/components/RightSidebar";
import { useLiveSyncFromGenerator } from "@/modules/cv-designer/services/useLiveSyncFromGenerator";

export default function DesignerPage() {
  // Live-Sync: Rohdaten → Canvas (Upsert, Locks/Styles bleiben erhalten)
  useLiveSyncFromGenerator(200);

  return (
    <main
      className="
        h-[calc(100vh-64px)]
        grid
        grid-cols-[1fr_320px]
        grid-rows-[auto_1fr]
        gap-4 p-4
      "
    >
      {/* Topbar über die volle Breite */}
      <header
        className="
          col-span-2
          sticky top-0 z-10
          bg-white/80 backdrop-blur
          border rounded-xl
          px-3 py-2
        "
      >
        {/* Falls CanvasToolbar vertikal gebaut ist, lassen wir sie hier erstmal
           * so stehen; bei Bedarf bauen wir sie in der Komponente horizontal um. */}
        <div className="min-w-0 overflow-x-auto">
          <CanvasToolbar />
        </div>
      </header>

      {/* Canvas-Bereich (links) */}
      <section className="min-h-0 overflow-auto">
        <FabricCanvas />
      </section>

      {/* Rechte Sidebar (Stile, Parts, Export …) */}
      <aside className="min-h-0 overflow-auto">
        <RightSidebar />
      </aside>
    </main>
  );
}
