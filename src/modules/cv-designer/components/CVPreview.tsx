/**
 * CV Preview – nutzt StyleConfig + Template Layouts
 * Inhalte aus LebenslaufContext werden in LayoutElements injiziert
 */

import React from "react";
import { LayoutElement } from "../types/section";
import { StyleConfig } from "../types/styles";
import { defaultStyleConfig } from "../config/defaultStyleConfig";
import { useLebenslauf } from "@/components/LebenslaufContext";
import { mapBetterLetterToDesigner } from "../services/mapBetterLetterToDesigner";

interface CVPreviewProps {
  layoutElements?: LayoutElement[];
  styleConfig?: StyleConfig;
  className?: string;
}

const CVPreview: React.FC<CVPreviewProps> = ({
  layoutElements = [],
  styleConfig,
  className = "",
}) => {
  // Hole Daten aus LebenslaufContext
  const { personalData, berufserfahrung, ausbildung, skills, softskills } =
    useLebenslauf();

  // Template-Layout + Inhalte zusammenführen
  const sectionsToRender = React.useMemo(() => {
    if (layoutElements.length > 0) {
      return layoutElements.map((el) => {
        let content = "";

        switch (el.type) {
          case "profil":
            content = [
              personalData?.vorname,
              personalData?.nachname,
              personalData?.email,
              personalData?.telefon,
              personalData?.geburtsland,
            ]
              .filter(Boolean)
              .join("\n");
            break;
          case "erfahrung":
            content = berufserfahrung
              .map(
                (e) =>
                  `${e.position} @ ${e.companies.join(", ")} (${e.von} – ${
                    e.bis
                  })\n${e.aufgabenbereiche?.join("\n") || ""}`
              )
              .join("\n\n");
            break;
          case "ausbildung":
            content = ausbildung
              .map(
                (a) =>
                  `${a.ausbildungsart} – ${a.institution} (${a.von} – ${a.bis})`
              )
              .join("\n\n");
            break;
          case "kenntnisse":
            content = skills.join(", ");
            break;
          case "softskills":
            content = softskills.join(", ");
            break;
          case "photo":
            content = personalData?.profileImage || "";
            break;
        }

        return { ...el, content };
      });
    } else {
      // Fallback: Standard Mapping (einspaltig)
      return mapBetterLetterToDesigner({
        personalData,
        berufserfahrung,
        ausbildung,
        skills,
        softskills,
      });
    }
  }, [layoutElements, personalData, berufserfahrung, ausbildung, skills, softskills]);

  const safeStyleConfig = styleConfig || defaultStyleConfig;

  const containerStyle: React.CSSProperties = {
    position: "relative",
    fontFamily: safeStyleConfig.fontFamily || "Arial",
    fontSize:
      safeStyleConfig.fontSize === "small"
        ? "14px"
        : safeStyleConfig.fontSize === "large"
        ? "18px"
        : "16px",
    lineHeight: safeStyleConfig.lineHeight || 1.5,
    borderRadius: safeStyleConfig.borderRadius,
    border: safeStyleConfig.border,
    boxShadow: safeStyleConfig.boxShadow,
    backgroundColor: safeStyleConfig.backgroundColor || "#fff",
    color: safeStyleConfig.textColor || "#333",
    width: safeStyleConfig.widthPercent
      ? `${safeStyleConfig.widthPercent}%`
      : "210mm",
    minHeight: "297mm", // A4
    margin: "0 auto",
    overflow: "hidden",
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
          style={{
            position: "absolute",
            top: section.y ?? 0,
            left: section.x ?? 0,
            width: section.width ?? "auto",
            height: section.height ?? "auto",
            padding: safeStyleConfig.padding || "8px",
            boxSizing: "border-box",
          }}
        >
          {section.title && section.type !== "photo" && (
            <h2
              style={{
                fontSize: "1.1em",
                marginBottom: "0.25rem",
                color: safeStyleConfig.primaryColor || "#1e40af",
                borderBottom: `1px solid ${
                  safeStyleConfig.accentColor || "#3b82f6"
                }`,
              }}
            >
              {section.title}
            </h2>
          )}

          {/* Profilbild */}
          {section.type === "photo" && section.content ? (
            <img
              src={section.content}
              alt="Profilfoto"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
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
            section.content &&
            typeof section.content === "string" && (
              <div style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
                {section.content}
              </div>
            )
          )}
        </div>
      ))}

      {sectionsToRender.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "#6b7280",
            padding: "2rem",
            fontStyle: "italic",
          }}
        >
          Keine Lebenslaufdaten vorhanden. Bitte füllen Sie die Felder im
          Lebenslauf-Editor aus.
        </div>
      )}
    </div>
  );
};

export default CVPreview;
