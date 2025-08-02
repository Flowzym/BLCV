import type { Section } from "@/modules/cv-designer/types/section"
import type { ATSFeedback, AnalysisParams } from "@/modules/cv-designer/hooks/useATSAnalysis"
import { gpt } from "@/lib/gptClient"

export async function analyzeSectionsATS(
  sections: Section[],
  params?: AnalysisParams
): Promise<ATSFeedback[]> {
  const { language = "de", goals = ["ATS", "Clarity", "Keywords"] } = params || {}

  const prompt = `Du bist ein Bewerbungs- und ATS-Optimierungstool.
Analysiere die folgenden Lebenslaufabschnitte mit Fokus auf: ${goals.join(",")}.
Sprache: ${language}

Antwortformat STRICT JSON:
[
  {
    "sectionId": "...",
    "summary": "...",
    "score": 0–100,
    "keywords": ["..."],
    "tone": "...",
    "atsFit": "hoch | mittel | niedrig"
  }
]

Hier sind die Abschnitte:
${sections.map((s) => `SECTION ${s.id} (${s.title ?? "Ohne Titel"}):\n${s.content}`).join("\n\n")}
`

  const res = await gpt.complete({
    prompt,
    temperature: 0.4,
    max_tokens: 1200,
  })

  try {
    const parsed = JSON.parse(res.text)
    if (!Array.isArray(parsed)) throw new Error("No array returned")
    return parsed as ATSFeedback[]
  } catch (e) {
    console.error("ATS JSON Parse Error", e)
    throw new Error("Ungültige GPT-Antwort – keine gültige JSON-Analyse.")
  }
}
