// 📄 src/modules/cv-designer/utils/RenderElementContent.tsx

import React from "react";
import { LayoutElement } from "../types/section";
import { StyleConfig, FontConfig } from "../../../types/cv-designer";

interface Props {
  element: LayoutElement;
  style: StyleConfig;
  maxSkills?: number;
}

/**
 * Hilfsfunktion: Stile aus FontConfig in CSS überführen
 */
function fontToStyle(font: FontConfig | undefined): React.CSSProperties {
  if (!font) return {};
  return {
    fontFamily: font.family || "inherit",
    fontSize: font.size ? `${font.size}px` : undefined,
    fontWeight: font.weight || "normal",
    fontStyle: font.weight === "italic" ? "italic" : "normal",
    color: font.color || "inherit",
    letterSpacing:
      font.letterSpacing !== undefined ? `${font.letterSpacing}px` : undefined,
    lineHeight: font.lineHeight || "normal",
  };
}

export const RenderElementContent: React.FC<Props> = ({
  element,
  style,
  maxSkills = 8,
}) => {
  const fieldFont =
    style.sections?.[element.type]?.fields?.[element.field || ""]?.font;

  // Foto
  if (element.type === "photo") {
    return element.content ? (
      <img
        src={element.content}
        alt="Profilfoto"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "50%",
          border: `2px solid ${style.accentColor || "#e5e7eb"}`,
        }}
      />
    ) : (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          backgroundColor: "#f3f4f6",
          border: `2px dashed ${style.accentColor || "#d1d5db"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.6em",
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        📷<br />
        Foto
      </div>
    );
  }

  // Skills als Badges
  if (["kenntnisse", "skills", "softskills"].includes(element.type)) {
    if (!element.content) {
      return (
        <div
          style={{
            ...fontToStyle(fieldFont),
            color: "#9ca3af",
            fontStyle: "italic",
            fontSize: "0.8em",
          }}
        >
          – Keine Fähigkeiten –
        </div>
      );
    }
    const skills = element.content
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {skills.slice(0, maxSkills).map((skill, i) => (
          <span
            key={i}
            style={{
              ...fontToStyle(fieldFont),
              background: style.accentColor || "#3b82f6",
              color: "white",
              padding: "2px 6px",
              borderRadius: "8px",
              fontSize: "0.7em",
              fontWeight: "500",
              whiteSpace: "nowrap",
            }}
          >
            {skill}
          </span>
        ))}
        {skills.length > maxSkills && (
          <span
            style={{
              background: "#6b7280",
              color: "white",
              padding: "2px 6px",
              borderRadius: "8px",
              fontSize: "0.7em",
            }}
          >
            +{skills.length - maxSkills}
          </span>
        )}
      </div>
    );
  }

  // Standard
  return element.content ? (
    <div style={fontToStyle(fieldFont)}>{element.content}</div>
  ) : (
    <div
      style={{
        ...fontToStyle(fieldFont),
        color: "#9ca3af",
        fontStyle: "italic",
        fontSize: "0.8em",
      }}
    >
      – Keine Daten –
    </div>
  );
};
