import { LayoutElement } from "../types/section";
import { getDefaultTemplate } from "./defaultTemplates";

/**
 * Wandelt BetterLetter-Daten + Template in LayoutElemente um
 */
export function mapBetterLetterToDesignerWithTemplate(
  data: any,
  template: string
): LayoutElement[] {
  if (!data) return [];

  // Falls keine Sections existieren → leeres Array
  const sections = Array.isArray(data.sections) ? data.sections : [];

  // Wenn leer → Default-Template zurückgeben
  if (sections.length === 0) {
    return getDefaultTemplate(template);
  }

  // Normal: Section-Daten mappen
  return sections.map((s: any) => ({
    id: s.id || crypto.randomUUID(),
    type: s.type || "text",
    title: s.title || "",
    content: s.content || "",
    style: s.style || {},
    position: s.position || { x: 0, y: 0 },
  }));
}
