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

  // Mock implementation - replace with real API analysis
  const words = text.split(/\s+/).filter(word => word.length > 0)
  const wordCount = words.length
  
  // Simple keyword density calculation
  const keywordDensity: Record<string, number> = {}
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '')
    if (cleanWord.length > 3) {
      keywordDensity[cleanWord] = (keywordDensity[cleanWord] || 0) + 1
    }
  })
  
  // Mock scores based on text length and complexity
  const result = {
    atsScore: Math.min(90, Math.max(30, wordCount * 2)),
    clarityScore: Math.min(95, Math.max(40, 100 - (text.split('.').length * 5))),
    toneScore: Math.min(85, Math.max(50, wordCount > 50 ? 80 : 60)),
    keywordDensity,
    wordCount
  }

  return result
}
