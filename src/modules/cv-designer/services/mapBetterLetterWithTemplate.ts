import { mapBetterLetterToDesigner } from "./mapBetterLetterToDesigner"
import { getTemplateById } from "../modules/templates/template_registry"
import { LayoutElement, Section } from "../types/section"

/**
 * Map BetterLetter data into a CV-Designer layout with a given template
 * - Nutzt das Template-Layout
 * - Befüllt passende Sections nach type
 * - Hängt nicht gemappte Sections automatisch unten an
 */
export function mapBetterLetterToDesignerWithTemplate(data: any, templateId: string): LayoutElement[] {
  // 1. Basis: Section-Daten aus BetterLetter
  const sections: Section[] = mapBetterLetterToDesigner(data)

  // 2. Template holen
  const template = getTemplateById(templateId)
  if (!template) {
    console.warn(`Template ${templateId} not found, falling back to default layout`)
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
  const usedTypes = new Set<string>()
  const mappedLayout: LayoutElement[] = template.layout.map((element) => {
    const match = sections.find((s) => s.type === element.type)
    if (match) usedTypes.add(match.type)

    return {
      ...element,
      content: match ? match.content : "",
      title: match ? match.title : element.title,
    }
  })

  // 4. Nicht gemappte Sections anhängen (unten unterhalb vom größten Y)
  const maxY = mappedLayout.reduce((acc, el) => Math.max(acc, el.y + el.height), 0)

  const extraSections: LayoutElement[] = sections
    .filter((s) => !usedTypes.has(s.type))
    .map((s, idx) => ({
      id: `${s.id}-extra`,
      type: s.type,
      title: s.title,
      content: s.content,
      x: 0,
      y: maxY + idx * 120,
      width: 600,
      height: 100,
    }))

  return [...mappedLayout, ...extraSections]
}
