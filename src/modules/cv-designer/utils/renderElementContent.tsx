// 📄 src/modules/cv-designer/components/RenderElementContent.tsx

import React from "react";
import { LayoutElement } from "../types/section";
import { StyleConfig } from "../../../types/cv-designer";

interface Props {
  element: LayoutElement;
  style: StyleConfig;
  field?: string; // 🔑 Subfeld-Key
  maxSkills?: number;
}

export const RenderElementContent: React.FC<Props> = ({
  element,
  style,
  field,
  maxSkills = 8,
}) => {
  // DEBUG: Detailed logging for font config flow
  console.log('=== RenderElementContent DEBUG START ===');
  console.log('RenderElementContent: element.type:', element.type);
  console.log('RenderElementContent: field prop received:', field);
  console.log('RenderElementContent: element.field:', element.field);
  
  // Bestimme den effektiven fieldKey
  const fieldKey = field || element.field || "default";
  console.log('RenderElementContent: calculated fieldKey:', fieldKey);
  
  // Versuche fontConfig zu finden
  const fontConfig = style.sections?.[element.type]?.fields?.[fieldKey]?.font;
  console.log('RenderElementContent: style.sections?.[element.type]:', style.sections?.[element.type]);
  console.log('RenderElementContent: style.sections?.[element.type]?.fields:', style.sections?.[element.type]?.fields);
  console.log('RenderElementContent: style.sections?.[element.type]?.fields?.[fieldKey]:', style.sections?.[element.type]?.fields?.[fieldKey]);
  console.log('RenderElementContent: retrieved fontConfig:', fontConfig);

  const applyFontStyle = (
    content: React.ReactNode,
    extraStyle: React.CSSProperties = {}
  ) => {
    if (!fontConfig) {
      console.log('RenderElementContent: No fontConfig found, using default styling');
      return <span style={extraStyle}>{content}</span>;
    }

    const fontStyle: React.CSSProperties = {
      fontSize: fontConfig.size ? `${fontConfig.size}px` : undefined,
      fontWeight: fontConfig.weight || undefined,
      color: fontConfig.color || undefined,
      letterSpacing:
        fontConfig.letterSpacing !== undefined
          ? `${fontConfig.letterSpacing}px`
          : undefined,
      lineHeight: fontConfig.lineHeight || undefined,
    };
    
    console.log('RenderElementContent: calculated fontStyle object:', fontStyle);
    console.log('RenderElementContent: final combined style:', { ...extraStyle, ...fontStyle });
    console.log('=== RenderElementContent DEBUG END ===');

    return <span style={{ ...extraStyle, ...fontStyle }}>{content}</span>;
  };

  /* -------- Foto -------- */
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

  /* -------- Skills & Softskills -------- */
  if (["kenntnisse", "skills", "softskills"].includes(element.type)) {
    if (!element.content) {
      return applyFontStyle(
        <div style={{ fontStyle: "italic", fontSize: "0.8em", color: "#9ca3af" }}>
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
          applyFontStyle(skill, {
            background: style.accentColor || "#3b82f6",
            color: "white",
            padding: "2px 6px",
            borderRadius: "8px",
            fontSize: "0.7em",
            fontWeight: "500",
            whiteSpace: "nowrap",
          })
        )}
        {skills.length > maxSkills &&
          applyFontStyle(`+${skills.length - maxSkills}`, {
            background: "#6b7280",
            color: "white",
            padding: "2px 6px",
            borderRadius: "8px",
            fontSize: "0.7em",
          })}
      </div>
    );
  }

  /* -------- Standard Text -------- */
  return element.content
    ? applyFontStyle(element.content)
    : applyFontStyle("– Keine Daten –", {
        fontStyle: "italic",
        fontSize: "0.8em",
        color: "#9ca3af",
      });
};
