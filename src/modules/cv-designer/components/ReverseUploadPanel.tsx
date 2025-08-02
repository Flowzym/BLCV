import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { ReverseUploadAssistant } from "./ReverseUploadAssistant"
import ReverseUploadBasic from "@/modules/cv-designer/components/ReverseUploadBasic"
import { ReverseUploadWithGPT } from "./ReverseUploadWithGPT"
import { LayoutElement } from "@/modules/cv-designer/types/section"
import { StyleConfig } from "@/types/styles"

interface Props {
  onImport: (layout: LayoutElement[]) => void
  onCreateTemplate?: (template: {
    name: string
    layout: LayoutElement[]
    style: StyleConfig
  }) => void
  defaultStyle?: StyleConfig
}

export function ReverseUploadPanel({
  onImport,
  onCreateTemplate,
  defaultStyle
}: Props) {
  const [mode, setMode] = useState<"assistant" | "basic" | "gpt">("assistant")

  return (
    <div className="space-y-4 border p-4 rounded-md bg-muted/50">
      <div className="space-y-1">
        <Label className="text-sm font-medium">Upload-Modus wählen</Label>
        <Select value={mode} onValueChange={(v) => setMode(v as any)}>
          <SelectTrigger className="w-[260px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="assistant">Assistent (mit/ohne GPT)</SelectItem>
            <SelectItem value="basic">Nur Upload (.json/.docx)</SelectItem>
            <SelectItem value="gpt">Upload + GPT-Strukturierung</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mode === "assistant" && (
        <ReverseUploadAssistant
          onImport={onImport}
          onCreateTemplate={onCreateTemplate}
          defaultStyle={defaultStyle}
        />
      )}

      {mode === "basic" && (
        <ReverseUploadBasic
          onImport={onImport}
        />
      )}

      {mode === "gpt" && (
        <ReverseUploadWithGPT
          onImport={onImport}
        />
      )}
    </div>
  )
}
