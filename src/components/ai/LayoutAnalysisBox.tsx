import { useEffect, useState } from "react"
import { LayoutElement } from "../types/section"
import { analyzeLayout } from "@/services/analyzeLayout"

interface Props {
  layout: LayoutElement[]
  autoStart?: boolean
  language?: "de" | "en"
}

export function LayoutAnalysisBox({ layout, autoStart = false, language = "de" }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | Awaited<ReturnType<typeof analyzeLayout>>>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const res = await analyzeLayout(layout, language)
      setResult(res)
    } catch (err) {
      console.error("Analysefehler:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoStart) handleAnalyze()
  }, [autoStart])

  return (
    <div className="p-4 border rounded bg-white space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold">📊 Layout-Analyse</h3>
        <button
          onClick={handleAnalyze}
          className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Analysiere ..." : "Neu analysieren"}
        </button>
      </div>

      {result && (
        <div className="space-y-2 text-sm">
          <div>📄 Wörter: <strong>{result.wordCount}</strong></div>
          <div>🧠 ATS-Score: <strong>{(result.atsScore * 100).toFixed(0)}%</strong></div>
          <div>🔍 Klarheit: <strong>{(result.clarityScore * 100).toFixed(0)}%</strong></div>
          <div>🎯 Tonalität: <strong>{(result.toneScore * 100).toFixed(0)}%</strong></div>

          {result.notes.length > 0 && (
            <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2 text-yellow-900">
              <div className="font-medium mb-1">⚠️ Hinweise:</div>
              <ul className="list-disc list-inside space-y-1">
                {result.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(result.keywordDensity).length > 0 && (
            <div className="mt-2">
              <div className="font-medium">📌 Häufige Begriffe:</div>
              <div className="text-xs mt-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                {Object.entries(result.keywordDensity)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 20)
                  .map(([word, count]) => (
                    <div key={word} className="bg-gray-100 px-2 py-1 rounded">
                      {word} <span className="text-gray-500">({count})</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
