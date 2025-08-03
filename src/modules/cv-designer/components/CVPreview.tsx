/**
 * Übergangs-Version der CV Preview
 * Beibehaltung von Layout/Features (Mehrspalten, Styles, Badges, Profilbild)
 * Bereinigung der Objekt-Renderer -> nur noch Strings/Text aus Adapter
 */

import React from "react";
import { LayoutElement } from "../types/section";
import { StyleConfig } from "../types/styles";
import { defaultStyleConfig } from "../config/defaultStyleConfig";

interface CVPreviewProps {
  sections: LayoutElement[];
  styleConfig?: StyleConfig;
  className?: string;
}

const CVPreview: React.FC<CVPreviewProps> = ({
  sections = [],
  styleConfig,
  className = "",
}) => {
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
            background: "#f4f4f4",
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
      {sections.map((section) => (
        <div
          key={section.id}
          style={{ marginBottom: "1.5rem", pageBreakInside: "avoid" }}
        >
          {section.title && (
            <h2 style={{ fontSize: "1.25em", marginBottom: "0.5rem" }}>
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
          {["skills", "softskills"].includes(section.type) &&
          section.content ? (
            renderBadgeList(
              section.content
                .split(/[,;\n]/)
                .map((s) => s.trim())
                .filter(Boolean)
            )
          ) : (
            // Default: Textblock
            section.content &&
            typeof section.content === "string" && (
              <p style={{ whiteSpace: "pre-line" }}>{section.content}</p>
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default CVPreview;
