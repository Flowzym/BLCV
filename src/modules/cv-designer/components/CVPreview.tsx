/**
 * CV Preview – Debug-Version
 * Robustes Rendern aller LayoutElements mit Try/Catch pro Element
 */

import React from "react";
import { LayoutElement } from "../types/section";
import { StyleConfig } from "../../../types/cv-designer";
import { defaultStyleConfig } from "../config/defaultStyleConfig";
import { useLebenslauf } from "@/components/LebenslaufContext";
import { mapBetterLetterToDesigner } from "../services/mapBetterLetterToDesigner";
import {
  renderElementToCanvas,
  A4_WIDTH,
  A4_HEIGHT,
  validateLayout,
  getLayoutStats
} from "../services/layoutRenderer";

interface CVPreviewProps {
  sections?: LayoutElement[];
  layoutElements?: LayoutElement[];
  styleConfig?: StyleConfig;
  cvData?: any;
  templateName?: 'classic' | 'modern' | 'minimal' | 'creative';
  className?: string;
  showDebugBorders?: boolean;
  scale?: number;
}

const CVPreview: React.FC<CVPreviewProps> = ({
  sections,
  layoutElements = [],
  styleConfig,
  cvData,
  templateName = 'classic',
  className = "",
  showDebugBorders = false,
  scale,
}) => {
  const { personalData, berufserfahrung, ausbildung } = useLebenslauf();

  // Template-Layout + Inhalte
  const sectionsToRender = React.useMemo(() => {
    let elementsToUse: LayoutElement[] = layoutElements.length > 0
      ? layoutElements
      : (sections && sections.length > 0 ? sections : mapBetterLetterToDesigner({
          personalData,
          berufserfahrung,
          ausbildung,
          skills: [],
          softskills: [],
        }, templateName));

    // Content sicherstellen
    return elementsToUse.map((el) => ({
      ...el,
      content: typeof el.content === "string" ? el.content : (el.content ? JSON.stringify(el.content) : "")
    }));
  }, [layoutElements, sections, personalData, berufserfahrung, ausbildung]);

  const safeStyleConfig = styleConfig || defaultStyleConfig;
  const layoutValidation = React.useMemo(() => validateLayout(sectionsToRender, A4_WIDTH, A4_HEIGHT), [sectionsToRender]);
  const layoutStats = React.useMemo(() => getLayoutStats(sectionsToRender), [sectionsToRender]);
  const actualScale = scale || 1;

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: A4_WIDTH,
    height: A4_HEIGHT,
    backgroundColor: safeStyleConfig.backgroundColor || "#ffffff",
    fontFamily: safeStyleConfig.fontFamily || "Inter",
    fontSize: safeStyleConfig.fontSize === "small" ? "10px" : safeStyleConfig.fontSize === "large" ? "14px" : "12px",
    lineHeight: safeStyleConfig.lineHeight || 1.5,
    color: safeStyleConfig.textColor || "#333333",
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transform: actualScale !== 1 ? `scale(${actualScale})` : undefined,
    transformOrigin: "top left"
  };

  return (
    <div className={`cv-preview ${className}`}>
      <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        <div style={containerStyle}>
          {sectionsToRender.map((element) => {
            try {
              const elementStyle = renderElementToCanvas(element, safeStyleConfig);

              return (
                <div key={element.id || Math.random()} style={elementStyle}>
                  {element.title && element.type !== "photo" && (
                    <h3 style={{
                      fontSize: "1em",
                      fontWeight: "600",
                      marginBottom: "6px",
                      color: safeStyleConfig.primaryColor || "#1e40af",
                      borderBottom: `1px solid ${safeStyleConfig.accentColor || "#3b82f6"}`,
                      paddingBottom: "2px",
                      lineHeight: "1.2"
                    }}>
                      {element.title}
                    </h3>
                  )}

                  <div style={{ height: element.title && element.type !== "photo" ? "calc(100% - 24px)" : "100%", overflow: "hidden" }}>
                    <pre style={{ whiteSpace: "pre-wrap", fontSize: "11px" }}>
                      {element.content || "– Keine Daten –"}
                    </pre>
                  </div>
                </div>
              );
            } catch (err) {
              console.error("❌ Fehler beim Rendern Element:", element, err);
              return (
                <div key={element.id || Math.random()} style={{ border: "1px solid red", padding: "4px", margin: "2px" }}>
                  ⚠️ Fehler bei Element {element.id || "unknown"}
                </div>
              );
            }
          })}

          {sectionsToRender.length === 0 && (
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", color: "#6b7280", fontStyle: "italic" }}>
              <div style={{ fontSize: "2em", marginBottom: "12px" }}>📄</div>
              <div style={{ fontSize: "1.2em", marginBottom: "8px" }}>Keine Lebenslaufdaten vorhanden</div>
              <div style={{ fontSize: "0.9em" }}>Bitte füllen Sie die Felder im Lebenslauf-Editor aus</div>
            </div>
          )}

          {showDebugBorders && (
            <div style={{ position: "absolute", top: "5px", right: "5px", background: "rgba(0, 0, 0, 0.8)", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "0.7em", zIndex: 1000 }}>
              A4: {A4_WIDTH}×{A4_HEIGHT}px | {sectionsToRender.length} Elemente
              <br />
              Density: {layoutStats.density.toFixed(1)}% | Overlaps: {layoutValidation.overlaps.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVPreview;
