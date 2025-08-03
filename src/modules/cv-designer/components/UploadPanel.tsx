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
        const text = reader.result as string
        const parsed = JSON.parse(text)

        // Unterscheiden: Layout- oder CV-Daten
        if (parsed && parsed[0] && parsed[0].type) {
          // vermutlich LayoutElement[]
          onLayoutImport(parsed)
        } else {
          // vermutlich CV-Daten
          onCVDataImport(parsed)
        }
      } catch (err) {
        console.error("❌ Fehler beim Parsen:", err)
        alert("Die Datei konnte nicht gelesen werden. Bitte stellen Sie sicher, dass es JSON ist.")
      }
    }
    reader.readAsText(file)
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
