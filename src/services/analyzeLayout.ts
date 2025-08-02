import { LayoutElement } from "../types/section"
import { analyzeTextContent } from "@/modules/cv-designer/services/analyzeTextContent"

interface LayoutAnalysisResult {
  atsScore: number
  clarityScore: number
  toneScore: number
  keywordDensity: Record<string, number>
  missingSections: string[]
  wordCount: number
  notes: string[]
}

const REQUIRED_SECTIONS = ["profil", "erfahrung", "ausbildung", "kenntnisse"]

export async function analyzeLayout(layout: LayoutElement[], language: "de" | "en" = "de"): Promise<LayoutAnalysisResult> {
  const textBlocks: string[] = []
  const keywordStats: Record<string, number> = {}
  const notes: string[] = []

  const foundSectionTypes = new Set<string>()

  for (const el of layout) {
    if (el.type === "group") {
      for (const child of el.children) {
        if (child.type) foundSectionTypes.add(child.type)
        const content = child.data?.content || ""
        if (content.length > 10) textBlocks.push(content)
      }
    } else {
      if (el.type) foundSectionTypes.add(el.type)
      const content = (el as any).content
      if (content?.length > 10) textBlocks.push(content)
    }
  }

  const fullText = textBlocks.join("\n\n")

  const {
    atsScore,
    clarityScore,
    toneScore,
    keywordDensity,
    wordCount,
  } = await analyzeTextContent(fullText, language)

  const missingSections = REQUIRED_SECTIONS.filter((req) => !foundSectionTypes.has(req))

  if (missingSections.length > 0) {
    notes.push(`Fehlende Abschnitte: ${missingSections.join(", ")}`)
  }

  if (wordCount < 120) {
    notes.push("Gesamtlänge ist sehr kurz – möglicherweise unvollständig.")
  } else if (wordCount > 600) {
    notes.push("Textlänge ist sehr hoch – Kürzung könnte sinnvoll sein.")
  }

  return {
    atsScore,
    clarityScore,
    toneScore,
    keywordDensity,
    missingSections,
    wordCount,
    notes,
  }
}
