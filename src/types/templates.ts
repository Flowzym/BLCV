// src/types/template.ts
import type { StyleConfig } from "@/types/cv-designer";

/**
 * Minimaler Shape, der zu templateRegistry.ts, TemplateManager.tsx
 * und utils/fileHelpers.ts passt.
 */
export interface SavedTemplate {
  id: string;
  name: string;
  category?: string;      // z.B. "classic" | "modern"
  tags?: string[];        // freie Schlagwörter
  data: {
    layout: any[];        // später: dein LayoutElement[]
    style: StyleConfig;   // nutzt vorhandene StyleConfig
    preview?: string;     // optional: Data-URL oder Pfad
  };
}
