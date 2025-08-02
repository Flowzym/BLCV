// 📄 src/modules/cv-designer/utils/fileHelpers.ts
// Hilfsfunktionen für Datei-Import/Export im CV-Designer

import { SavedTemplate } from "../types/template";

// JSON Export
export function exportTemplatesToJson(templates: SavedTemplate[]): void {
  const blob = new Blob([JSON.stringify(templates, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "cv-templates.json";
  link.click();

  URL.revokeObjectURL(url);
}

// JSON Import
export async function importTemplatesFromJson(file: File): Promise<SavedTemplate[] | null> {
  try {
    const text = await file.text();
    const parsed: SavedTemplate[] = JSON.parse(text);
    return parsed;
  } catch (err) {
    console.error("Import error:", err);
    return null;
  }
}
