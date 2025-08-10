import React, { useState, useEffect } from "react";
import FabricCanvas from "@/modules/cv-designer/canvas/FabricCanvas";
import CanvasToolbar from "@/modules/cv-designer/components/CanvasToolbar";
import RightSidebar from "@/modules/cv-designer/components/RightSidebar";
import { useLiveSyncFromGenerator } from "@/modules/cv-designer/services/useLiveSyncFromGenerator";
import { useLebenslauf } from "@/components/LebenslaufContext"; // ✅ Debug-Overlay

export default function DesignerPage() {
  useLiveSyncFromGenerator(150);
  const ll = useLebenslauf();

  const erfCount = Array.isArray(ll?.berufserfahrung) ? ll.berufserfahrung.length : 0;
  const eduCount = Array.isArray(ll?.ausbildung) ? ll.ausbildung.length : 0;

  return (
    <main className="h-[calc(100vh-64px)] grid grid-cols-[1fr_320px] grid-rows-[auto_1fr] gap-4 p-4">
      <header className="col-span-2 sticky top-0 z-10 bg-white/80 backdrop-blur border rounded-xl px-3 py-2">
        <CanvasToolbar />
        {/* 👉 kleine Debug-Anzeige, bis alles läuft */}
        <div className="mt-2 text-xs text-gray-500">
          <span className="inline-block mr-3">Lebenslauf: <b>{erfCount}</b> Erfahrungen, <b>{eduCount}</b> Ausbildungen</span>
          {erfCount + eduCount === 0 && (
            <span className="text-red-600">Hinweis: Der Designer sieht aktuell 0 Einträge.</span>
          )}
        </div>
      </header>

      <section className="min-h-0 overflow-auto bg-gray-50">
        <FabricCanvas />
      </section>

      <aside className="min-h-0 overflow-auto">
        <RightSidebar />
      </aside>
    </main>
  );
}
