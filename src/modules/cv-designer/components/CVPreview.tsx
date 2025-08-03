/**
 * Übergangs-Version der CV Preview
 * Beibehaltung von Layout/Features (Mehrspalten, Styles, Badges, Profilbild)
 * Bereinigung der Objekt-Renderer -> nur noch Strings/Text aus Adapter
 */

import React from "react";
import { LayoutElement } from "../types/section";
import { StyleConfig } from "../types/styles";
import { defaultStyleConfig } from "../config/defaultStyleConfig";
import { useLebenslauf } from "@/components/LebenslaufContext";
import { mapBetterLetterToDesigner } from "../services/mapBetterLetterToDesigner";

interface CVPreviewProps {
  sections?: LayoutElement[]; // Optional - will be overridden by LebenslaufContext data
  styleConfig?: StyleConfig;
  className?: string;
}

const CVPreview: React.FC<CVPreviewProps> = ({
  sections: propSections = [],
  styleConfig,
  className = "",
}) => {
  // Hole Daten aus LebenslaufContext
  const { 
    personalData, 
    berufserfahrung, 
    ausbildung, 
    skills, 
    softskills 
  } = useLebenslauf();

  // Konvertiere BetterLetter-Daten zu LayoutElement[] via Adapter
  const mappedSections = React.useMemo(() => {
    return mapBetterLetterToDesigner({
      personalData,
      berufserfahrung,
      ausbildung,
      skills,
      softskills,
    });
  }, [personalData, berufserfahrung, ausbildung, skills, softskills]);

  // Verwende gemappte Sections, fallback auf prop sections
  const sectionsToRender = mappedSections.length > 0 ? mappedSections : propSections;
  
  const safeStyleConfig = styleConfig || defaultStyleConfig;

  const containerStyle: React.CSSProperties = {
    fontFamily: safeStyleConfig.fontFamily || "Arial",
    fontSize:
      safeStyleConfig.fontSize === "small"
        ? "14px"
        : safeStyleConfig.fontSize === "large"
        ? "18px"
        : "16px",
    lineHeight: safeStyleConfig.lineHeight || 1.5,
    padding: safeStyleConfig.padding || "16px",
    borderRadius: safeStyleConfig.borderRadius,
    border: safeStyleConfig.border,
    boxShadow: safeStyleConfig.boxShadow,
    backgroundColor: safeStyleConfig.backgroundColor || "#fff",
    color: safeStyleConfig.textColor || "#333",
    width: safeStyleConfig.widthPercent
      ? `${safeStyleConfig.widthPercent}%`
      : "210mm",
    minHeight: "297mm", // A4
  };

  const renderBadgeList = (items: string[] = []) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {items.map((item, idx) => (
        <span
          key={idx}
          style={{
            background: safeStyleConfig.accentColor || "#f4f4f4",
            color: "white",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "0.85em",
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className={`cv-preview ${className}`} style={containerStyle}>
      {sectionsToRender.map((section) => (
        <div
          key={section.id}
          style={{ marginBottom: "1.5rem", pageBreakInside: "avoid" }}
        >
          {section.title && (
            <h2 
              style={{ 
                fontSize: "1.25em", 
                marginBottom: "0.5rem",
                color: safeStyleConfig.primaryColor || "#1e40af",
                borderBottom: `2px solid ${safeStyleConfig.accentColor || "#3b82f6"}`,
                paddingBottom: "0.25rem"
              }}
            >
              {section.title}
            </h2>
          )}

          {/* Profilbild separat behandeln */}
          {section.type === "photo" && section.content ? (
            <img
              src={section.content}
              alt="Profilfoto"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "50%",
                marginBottom: "1rem",
              }}
            />
          ) : null}

          {/* Skills/Softskills als Badges */}
          {["skills", "softskills", "kenntnisse"].includes(section.type) &&
          section.content ? (
            renderBadgeList(
              section.content
                .split(/[,;\n]/)
                .map((s) => s.trim())
                .filter(Boolean)
            )
          ) : (
            // Default: Textblock für alle anderen Sections
            section.content &&
            typeof section.content === "string" && (
              <div style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
                {section.content}
              </div>
            )
          )}
        </div>
      ))}

      {/* Fallback wenn keine Sections vorhanden */}
      {sectionsToRender.length === 0 && (
        <div style={{ 
          textAlign: "center", 
          color: "#6b7280", 
          padding: "2rem",
          fontStyle: "italic"
        }}>
          Keine Lebenslaufdaten vorhanden. Bitte füllen Sie die Felder im Lebenslauf-Editor aus.
        </div>
      )}
    </div>
  );
};

export default CVPreview;