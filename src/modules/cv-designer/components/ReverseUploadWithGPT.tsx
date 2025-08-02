import { ChangeEvent, useState } from "react"
import { Input } from "@/components/ui/input"
import { LayoutElement } from "@/modules/cv-designer/types/section"
import { useAI } from "@/hooks/useAI"

interface ReverseUploadProps {
  onImport: (layout: LayoutElement[]) => void
}

export function ReverseUploadWithGPT({ onImport }: ReverseUploadProps) {
  const [loading, setLoading] = useState(false)
  const { askAI } = useAI()

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split(".").pop()?.toLowerCase()
    setLoading(true)

    try {
      if (ext === "json") {
        const text = await file.text()
        const parsed = JSON.parse(text)
        if (Array.isArray(parsed)) {
          onImport(parsed)
        } else {
          alert("Ungültiges JSON-Format.")
        }
      } else if (ext === "docx") {
        const buffer = await file.arrayBuffer()
        const mammoth = await import("mammoth")
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
        const html = result.value
        const parsed = parseHtmlToLayout(html)
        await sendToGPT(parsed)
      } else {
        alert("Nur .json oder .docx Dateien werden unterstützt.")
      }
    } catch (err) {
      console.error(err)
      alert("Fehler beim Verarbeiten der Datei.")
    } finally {
      setLoading(false)
    }
  }

  const parseHtmlToLayout = (html: string): LayoutElement[] => {
    const doc = new DOMParser().parseFromString(html, "text/html")
    const paragraphs = Array.from(doc.querySelectorAll("p"))
    const layout: LayoutElement[] = []
    let current: LayoutElement | null = null

    paragraphs.forEach((p, i) => {
      const text = p.textContent?.trim() || ""
      if (!text) return

      if (text.length < 50 && /^[A-ZÄÖÜ]/.test(text)) {
        if (current) layout.push(current)
        current = {
          id: `sec_${i}`,
          type: "text",
          title: text,
          content: "",
          x: 0,
          y: i * 100,
          width: 600,
        }
      } else {
        if (current) {
          current.content += (current.content ? "\n" : "") + text
        } else {
          current = {
            id: `sec_${i}`,
            type: "text",
            title: "Unbenannt",
            content: text,
            x: 0,
            y: i * 100,
            width: 600,
          }
        }
      }
    })

    if (current) layout.push(current)
    return layout
  }

  const sendToGPT = async (layout: LayoutElement[]) => {
    const prompt = `
Analysiere folgende Layoutstruktur und verfeinere sie:
- Gib jedem Element eine klare Struktur (id, type, title, content, x, y, width)
- Bewahre den Titel und Inhalt jedes Abschnitts
- Nutze y-Werte in 100er-Schritten, x=0, width=600

Input:
${JSON.stringify(layout, null, 2)}
    `
    const result = await askAI(prompt)
    try {
      const parsed: LayoutElement[] = JSON.parse(result.content)
      onImport(parsed)
    } catch {
      alert("Fehler beim Parsen der GPT-Antwort.")
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Lebenslauf aus Datei importieren (.json oder .docx)
      </label>
      <Input
        type="file"
        accept=".json,.docx"
        onChange={handleFileUpload}
        disabled={loading}
      />
      {loading && (
        <p className="text-sm text-muted-foreground">⏳ Verarbeitung läuft …</p>
      )}
    </div>
  )
}
