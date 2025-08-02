// 📄 src/modules/cv-designer/components/ReverseUploadAssistant.tsx

import { ChangeEvent, useState } from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { LayoutElement, Section } from "@/modules/cv-designer/types/section"
import { StyleConfig } from "@/modules/cv-designer/types"
import { useAI } from "@/hooks/useAI"
import mammoth from "mammoth"

interface Props {
  onImport: (layout: LayoutElement[]) => void
  onCreateTemplate?: (template: {
    name: string
    layout: LayoutElement[]
    style: StyleConfig
  }) => void
  defaultStyle?: StyleConfig
}

export function ReverseUploadAssistant({
  onImport,
  onCreateTemplate,
  defaultStyle = {
    fontFamily: "Arial",
    fontSize: "14px",
    color: "#333",
    padding: "8px",
  },
}: Props) {
  const [useGPT, setUseGPT] = useState(true)
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
        if (Array.isArray(parsed) && parsed.every((el) => el.type)) {
          finish(parsed as LayoutElement[])
        } else {
          alert("Ungültiges JSON-Format oder Layoutstruktur.")
        }
      }

      else if (ext === "docx") {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.convertToHtml({ arrayBuffer })
        const html = result.value
        const parsedSections = parseHtmlToSections(html)

        if (useGPT) {
          await sendToGPT(parsedSections)
        } else {
          const fallbackLayout: LayoutElement[] = parsedSections.map((s, i) => ({
            id: s.id,
            type: "text",
            title: s.title,
            content: s.content,
            x: 0,
            y: i * 100,
            width: 600,
          }))
          finish(fallbackLayout)
        }
      }

      else {
        alert("Nur .json oder .docx Dateien werden unterstützt.")
      }
    } catch (err) {
      console.error(err)
      alert("Fehler beim Verarbeiten der Datei.")
    } finally {
      setLoading(false)
    }
  }

  const parseHtmlToSections = (html: string): Section[] => {
    const doc = new DOMParser().parseFromString(html, "text/html")
    const paragraphs = Array.from(doc.querySelectorAll("p"))

    const sections: Section[] = []
    let current: Section | null = null

    paragraphs.forEach((p, i) => {
      const text = p.textContent?.trim() || ""
      if (!text) return

      if (text.length < 50 && /^[A-ZÄÖÜ]/.test(text)) {
        if (current) sections.push(current)
        current = {
          id: `sec_${i}`,
          title: text,
          content: "",
          type: "text",
        }
      } else {
        if (current) {
          current.content += (current.content ? "\n" : "") + text
        } else {
          current = {
            id: `sec_${i}`,
            title: "Unbenannt",
            content: text,
            type: "text",
          }
        }
      }
    })

    if (current) sections.push(current)
    return sections
  }

  const sendToGPT = async (sections: Section[]) => {
    const prompt = `
Analysiere diesen Lebenslauf als strukturierte LayoutElement[]-Liste.

- Jedes Element hat: id, type ("text", "skills", "photo"), title, content, x, y, width
- Verwende y in 100er-Schritten, x = 0, width = 600
- Bewahre die Titel- und Inhaltsstruktur bei

Input:
${JSON.stringify(sections, null, 2)}
`
    try {
      const result = await askAI(prompt)
      const parsed = JSON.parse(result.content) as LayoutElement[]
      finish(parsed)
    } catch (err) {
      alert("Fehler beim Parsen der GPT-Antwort.")
      console.error(err)
    }
  }

  const finish = (layout: LayoutElement[]) => {
    onImport(layout)
    if (onCreateTemplate) {
      onCreateTemplate({
        name: "Imported Template",
        layout,
        style: defaultStyle,
      })
    }
  }

  return (
    <div className="space-y-4 border p-4 rounded-md bg-muted/40">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">GPT-Analyse aktivieren</Label>
          <p className="text-xs text-muted-foreground">Strukturierte Layouts mit KI generieren</p>
        </div>
        <Switch checked={useGPT} onCheckedChange={setUseGPT} />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Lebenslauf (.json oder .docx)</Label>
        <Input
          type="file"
          accept=".json,.docx"
          onChange={handleFileUpload}
          disabled={loading}
        />
        {loading && <p className="text-xs text-muted-foreground">⏳ Verarbeitung läuft …</p>}
      </div>
    </div>
  )
}
