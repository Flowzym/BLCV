export async function mockAnalyzeText(text: string, language: "de" | "en") {
  const words = text.split(/\s+/).filter((w) => w.length > 2)
  const freq: Record<string, number> = {}

  for (const word of words) {
    const w = word.toLowerCase()
    freq[w] = (freq[w] || 0) + 1
  }

  const keywordDensity = Object.fromEntries(
    Object.entries(freq).filter(([_, v]) => v >= 2)
  )

  return {
    atsScore: 0.7,
    clarityScore: 0.75,
    toneScore: 0.65,
    keywordDensity,
    wordCount: words.length,
  }
}
