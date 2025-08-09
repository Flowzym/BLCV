// src/pages/DesignerPage.tsx
import React from "react";
import DesignerShell from "@/modules/cv-designer/components/DesignerShell";
import { useLiveSyncFromGenerator } from "@/modules/cv-designer/services/useLiveSyncFromGenerator";

export default function DesignerPage() {
  // Aktiviert den Live-Sync (Generator → Canvas), entkoppelt vom Toolbar-Button
  useLiveSyncFromGenerator(200);
  return (
    <main className="h-full">
      <DesignerShell />
    </main>
  );
}
