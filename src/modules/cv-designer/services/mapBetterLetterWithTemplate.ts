import { mapBetterLetterToDesigner } from "./mapBetterLetterToDesigner"
import { getTemplateById } from "../modules/templates/template_registry"
import { LayoutElement, Section } from "../types/section"

/**
 * Map BetterLetter data into a CV-Designer layout with a given template
 */
export function mapBetterLetterToDesignerWithTemplate(data: any, templateId: string): LayoutElement[] {
  // 1. Basis: Section-Daten aus BetterLetter
  const sections: Section[] = mapBetterLetterToDesigner(data)

  // 2. Template holen
  const template = getTemplateById(templateId)
  if (!template) {
    console.warn(`Template ${templateId} not found, falling back to default layout`)
    // Fallback: jede Section ohne Layout-Koordinaten zurückgeben
    return sections.map((s, idx) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      content: s.content,
      x: 0,
      y: idx * 120,
      width: 600,
      height: 100,
    }))
  }

  // 3. Template-Layout mappen
  const mappedLayout: LayoutElement[] = template.layout.map((element) => {
    // Section mit gleichem Typ suchen
    const match = sections.find((s) => s.type === element.type)

    return {
      ...element,
      content: match ? match.content : "",
      title: match ? match.title : element.title,
    }
  })

  return mappedLayout
}
