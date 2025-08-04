import React from "react";
import { LayoutElement } from "../types/section";
import { StyleConfig } from "../../../types/cv-designer";

interface Props {
  element: LayoutElement;
  style: StyleConfig;
  field?: string;     // 🔑 neu: Subfeld
  maxSkills?: number;
}

export const RenderElementContent: React.FC<Props> = ({
  element,
  style,
  field,
  maxSkills = 8,
}) => {
  const fieldKey = field || element.field || "default";
  const fontConfig =
    style.sections?.[element.type]?.fields?.[fieldKey]?.font;

  const applyFontStyle = (content: React.ReactNode) => {
    if (!fontConfig) return content;
    return (
      <span
        style={{
          fontSize: fontConfig.size ? `${fontConfig.size}px` : undefined,
          fontWeight: fontConfig.weight || undefined,
          color: fontConfig.color || undefined,
          letterSpacing:
            fontConfig.letterSpacing !== undefined
              ? `${fontConfig.letterSpacing}px`
              : undefined,
          lineHeight: fontConfig.lineHeight || undefined,
        }}
      >
        {content}
      </span>
    );
  };

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

  if (["kenntnisse", "skills", "softskills"].includes(element.type)) {
    if (!element.content) {
      return (
        <div
          style={{ color: "#9ca3af", fontStyle: "italic", fontSize: "0.8em" }}
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
        {skills.slice(0, maxSkills).map((skill, i) =>
          applyFontStyle(
            <span
              key={i}
              style={{
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
          )
        )}
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

  return element.content
    ? applyFontStyle(element.content)
    : applyFontStyle(
        <div
          style={{
            color: "#9ca3af",
            fontStyle: "italic",
            fontSize: "0.8em",
          }}
        >
          – Keine Daten –
        </div>
      );
};
