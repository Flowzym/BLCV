import { mockAnalyzeText } from "../utils/mockAnalysis" // Optional: Für Offline-Debugging

interface AnalysisResult {
  atsScore: number
  clarityScore: number
  toneScore: number
  keywordDensity: Record<string, number>
  wordCount: number
}

export async function analyzeTextContent(
  text: string,
  language: "de" | "en" = "de"
): Promise<AnalysisResult> {
  if (!text || text.length < 20) {
    return {
      atsScore: 0,
      clarityScore: 0,
      toneScore: 0,
      keywordDensity: {},
      wordCount: 0,
    }
  }

  // TODO: Ersetze diesen Block durch echte GPT-/API-Analyse
  const result = await mockAnalyzeText(text, language)

  return result
}
