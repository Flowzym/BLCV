import React from "react";
import DesignerShell from "@/modules/cv-designer/components/DesignerShell";
import { useLiveSyncFromGenerator } from "@/modules/cv-designer/services/useLiveSyncFromGenerator";

export default function DesignerPage() {
  useLiveSyncFromGenerator(200); // Live-Sync ohne Button
  return (
    <main className="h-full">
      <DesignerShell />
    </main>
  );
}
