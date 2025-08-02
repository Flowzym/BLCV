import { useEffect, useState } from "react"
import type { Section } from "@/modules/cv-designer/types/section"
import { useATSAnalysis, type ATSFeedback } from "@/hooks/useATSAnalysis"
import { Button } from "@/components/ui/button"

interface SectionAnalysisBoxProps {
  sections: Section[]
  autoAnalyze?: boolean
  language?: string
  goals?: ("ATS" | "Clarity" | "Tone" | "Keywords")[]
}

export function SectionAnalysisBox({
  sections,
  autoAnalyze = true,
  language = "de",
  goals = ["ATS", "Keywords"]
}: SectionAnalysisBoxProps) {
  const { analyze, isLoading, result, error } = useATSAnalysis()
  const [lastAnalyzed, setLastAnalyzed] = useState<Section[]>([])

  useEffect(() => {
    if (autoAnalyze) {
      analyze(sections, { language, goals })
      setLastAnalyzed(sections)
    }
  }, [sections, autoAnalyze, language, goals])

  const rerunAnalysis = () => {
    analyze(sections, { language, goals })
    setLastAnalyzed(sections)
  }

  const getScoreColor = (score?: number) => {
    if (score === undefined) return "text-gray-500"
    if (score >= 85) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getFeedbackForSection = (sectionId: string): ATSFeedback | undefined =>
    result.find((f) => f.sectionId === sectionId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          📄 Analyseübersicht (ATS, Klarheit, Keywords …)
        </h2>
        {!autoAnalyze && (
          <Button variant="outline" size="sm" onClick={rerunAnalysis} disabled={isLoading}>
            Analyse erneut starten
          </Button>
        )}
      </div>

      {sections.map((section) => {
        const feedback = getFeedbackForSection(section.id)
        const scoreClass = getScoreColor(feedback?.score)

        return (
          <div
            key={section.id}
            className="border rounded-md p-4 bg-white dark:bg-zinc-800 shadow-sm space-y-1"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {section.title || "Abschnitt"}
              </h3>
              {feedback?.score !== undefined && (
                <span className={`text-sm font-semibold ${scoreClass}`}>
                  ATS-Score: {feedback.score} / 100
                </span>
              )}
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {section.content}
            </p>

            {feedback && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1 border-t pt-2">
                {feedback.summary && (
                  <p>
                    <strong>Feedback:</strong> {feedback.summary}
                  </p>
                )}
                {feedback.keywords?.length ? (
                  <p>
                    <strong>Keywords:</strong> {feedback.keywords.join(", ")}
                  </p>
                ) : null}
                {feedback.tone && (
                  <p>
                    <strong>Ton:</strong> {feedback.tone}
                  </p>
                )}
                {feedback.atsFit && (
                  <p>
                    <strong>ATS-Kompatibilität:</strong> {feedback.atsFit}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}

      {isLoading && (
        <p className="text-sm text-blue-600 dark:text-blue-400">Analyse läuft…</p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">Fehler: {error}</p>
      )}
    </div>
  )
}
