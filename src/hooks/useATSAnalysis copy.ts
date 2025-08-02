import { useState } from "react"
import type { Section } from "@/modules/cv-designer/types/section"
import { analyzeSectionsATS } from "@/modules/cv-designer/services/analyzeSectionsATS_v2"

export interface ATSFeedback {
  sectionId: string
  summary: string
  score?: number
  keywords?: string[]
  tone?: string
  atsFit?: "hoch" | "mittel" | "niedrig"
}

export interface AnalysisParams {
  language?: string
  goals?: ("ATS" | "Clarity" | "Tone" | "Keywords")[]
}

export function useATSAnalysis() {
  const [isLoading, setLoading] = useState(false)
  const [result, setResult] = useState<ATSFeedback[]>([])
  const [error, setError] = useState<string | null>(null)

  const analyze = async (sections: Section[], params?: AnalysisParams) => {
    setLoading(true)
    setError(null)
    try {
      const feedback = await analyzeSectionsATS(sections, params)
      setResult(feedback)
    } catch (e) {
      setError("Fehler bei der Analyse")
    }
    setLoading(false)
  }

  return { analyze, isLoading, result, error }
}
