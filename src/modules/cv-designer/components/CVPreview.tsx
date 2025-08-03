/**
 * CV Preview – nutzt StyleConfig + Template Layouts
 * Rendert LayoutElements mit absoluter Positionierung auf A4-Fläche (595×842 px)
 */

import React from "react"
import { LayoutElement } from "../types/section"
import { StyleConfig } from "../../../types/cv-designer"
import { defaultStyleConfig } from "../config/defaultStyleConfig"
import { useLebenslauf } from "@/components/LebenslaufContext"
import { mapBetterLetterToDesigner } from "../services/mapBetterLetterToDesigner"
import {
  renderElementToCanvas,
  A4_WIDTH,
  A4_HEIGHT,
  validateLayout,
  getLayoutStats,
} from "../services/layoutRenderer"
import { RenderElementContent } from "../utils/renderElementContent"

interface CVPreviewProps {
  sections?: LayoutElement[]
  layoutElements?: LayoutElement[]
  styleConfig?: StyleConfig
  cvData?: any
  templateName?: "classic" | "modern" | "minimal" | "creative"
  className?: string
  showDebugBorders?: boolean
  scale?: number
}

const CVPreview: React.FC<CVPreviewProps> = ({
  sections,
  layoutElements = [],
  styleConfig,
  cvData,
  templateName = "classic",
  className = "",
  showDebugBorders = false,
  scale,
}) => {
  // Hole Daten aus LebenslaufContext
  const { personalData, berufserfahrung, ausbildung } = useLebenslauf()

  // Template-Layout + Inhalte zusammenführen
  const sectionsToRender = React.useMemo(() => {
    let elementsToUse: LayoutElement[] = []

    if (Array.isArray(layoutElements) && layoutElements.length > 0) {
      elementsToUse = layoutElements
    } else if (Array.isArray(sections) && sections.length > 0) {
      elementsToUse = sections
    } else {
      elementsToUse = mapBetterLetterToDesigner(
        {
          personalData: personalData || {},
          berufserfahrung: berufserfahrung || [],
          ausbildung: ausbildung || [],
          skills: [],
          softskills: [],
        },
        templateName
      )
    }

    // Absicherung: Immer Array zurückgeben
    return Array.isArray(elementsToUse) ? elementsToUse : []
  }, [layoutElements, sections, personalData, berufserfahrung, ausbildung, templateName])

  return (
    <div
      className={`relative border bg-white shadow-md ${className}`}
      style={{ width: A4_WIDTH, height: A4_HEIGHT }}
    >
      {sectionsToRender.length === 0 ? (
        <div className="p-4 text-gray-500">⚠️ Keine Inhalte zum Anzeigen</div>
      ) : (
        sectionsToRender.map((el) => (
          <div
            key={el.id}
            className={`absolute ${showDebugBorders ? "border border-dashed border-red-500" : ""}`}
            style={{
              top: el.y,
              left: el.x,
              width: el.width,
              height: el.height,
              padding: el.style?.padding || "4px",
              fontFamily: el.style?.fontFamily || defaultStyleConfig.fontFamily,
              fontSize: el.style?.fontSize || defaultStyleConfig.fontSize,
              color: el.style?.color || defaultStyleConfig.color,
              backgroundColor: el.style?.backgroundColor || "transparent",
              borderRadius: el.style?.borderRadius || "0px",
              overflow: "hidden",
            }}
          >
            <RenderElementContent element={el} />
          </div>
        ))
      )}
    </div>
  )
}

export default CVPreview
