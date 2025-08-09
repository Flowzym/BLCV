// src/modules/cv-designer/config/consolidated_layout_templates.ts
import type { DesignTemplate, StyleConfig } from "@/types/cv-designer";

const baseStyle = (overrides: Partial<StyleConfig> = {}): StyleConfig => ({
  primaryColor: "#111111",
  accentColor: "#0ea5e9",
  fontFamily: "Inter, Arial, sans-serif",
  fontSize: "medium",
  lineHeight: 1.4,
  margin: "normal",
  ...overrides,
});

export const layoutTemplates: DesignTemplate[] = [
  {
    id: "classic-two-col",
    title: "Classic Zweispaltig",
    description: "Kopfbereich mit Name; links schmal, rechts Inhalte.",
    category: "classic",
    tags: ["zweispaltig", "klassisch"],
    layout: [],                   // später mit LayoutElement[] füllen
    style: baseStyle(),
    preview: "",
  },
  {
    id: "modern-single",
    title: "Modern Einspaltig",
    description: "Luftige Einspalt-Variante mit größeren Abständen.",
    category: "modern",
    tags: ["einspaltig", "modern"],
    layout: [],
    style: baseStyle({ lineHeight: 1.5, margin: "wide" }),
    preview: "",
  },
];
