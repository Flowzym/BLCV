import React from "react"
import { Upload } from "lucide-react"

interface UploadPanelProps {
  onLayoutImport: (layout: any) => void
  onCVDataImport: (cvData: any) => void
}

export default function UploadPanel({ onLayoutImport, onCVDataImport }: UploadPanelProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        let raw: any = reader.result
        if (raw instanceof ArrayBuffer) {
          raw = new TextDecoder("utf-8").decode(raw)
        }
        if (typeof raw !== "string") {
          raw = String(raw)
        }

        const cleanText = raw.trim().replace(/^\uFEFF/, "")
        const parsed = JSON.parse(cleanText)
        console.log("✅ Parsed JSON:", parsed)

        try {
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
            console.log("▶ Dispatching to onLayoutImport")
            onLayoutImport(parsed)
          } else if (parsed && typeof parsed === "object") {
            console.log("▶ Dispatching to onCVDataImport")
            onCVDataImport(parsed)
          } else {
            alert("❌ Unbekanntes JSON-Format")
          }
        } catch (innerErr) {
          console.error("❌ Fehler in onLayoutImport/onCVDataImport:", innerErr, parsed)
        }
      } catch (err) {
        console.error("❌ Fehler beim Parsen des Files:", err)
        alert("❌ Fehler beim Lesen der Datei. Siehe Console.")
      }
    }

    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-medium flex items-center gap-2 mb-2">
          <Upload className="w-4 h-4 text-gray-600" />
          JSON hochladen
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          Laden Sie ein JSON hoch (Layout oder Lebenslaufdaten).
        </p>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
        />
      </div>
    </div>
  )
}
