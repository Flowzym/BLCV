import { ChangeEvent } from "react"
import { Input } from "@/components/ui/input"
import type { LayoutElement } from "@/modules/cv-designer/types/section"
import { isValidLayoutElementArray } from "@/modules/cv-designer/utils/validateLayoutElements"

interface ReverseUploadProps {
  onImport: (cvData: LayoutElement[]) => void
}

export function ReverseUploadBasic({ onImport }: ReverseUploadProps) {
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split(".").pop()?.toLowerCase()

    if (ext === "json") {
      const text = await file.text()
      try {
        const parsed = JSON.parse(text)
        if (isValidLayoutElementArray(parsed)) {
          onImport(parsed)
        } else {
          alert("Ungültiges LayoutElement[]-Format.")
        }
      } catch (err) {
        alert("Fehler beim Parsen der JSON-Datei.")
      }
    } else if (ext === "docx") {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const mammoth = await import("mammoth")
        const result = await mammoth.convertToHtml({ arrayBuffer })
        const html = result.value
        const parsed = parseHtmlToSections(html)
        onImport(parsed)
      } catch (err) {
        alert("Fehler beim Lesen der DOCX-Datei.")
      }
    } else {
      alert("Nur .json oder .docx Dateien werden unterstützt.")
    }
  }

  const parseHtmlToSections = (html: string): LayoutElement[] => {
    const doc = new DOMParser().parseFromString(html, "text/html")
    const paragraphs = Array.from(doc.querySelectorAll("p"))

    const sections: LayoutElement[] = []
    let current: LayoutElement | null = null

    paragraphs.forEach((p, i) => {
      const text = p.textContent?.trim() || ""
      if (!text) return

      if (text.length < 50 && /^[A-ZÄÖÜ]/.test(text)) {
        if (current) sections.push(current)
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

    if (current) sections.push(current)
    return sections
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Lebenslauf aus Datei importieren (.json oder .docx)
      </label>
      <Input type="file" accept=".json,.docx" onChange={handleFileUpload} />
    </div>
  )
}
