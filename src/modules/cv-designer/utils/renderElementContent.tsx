// 📄 src/modules/cv-designer/components/RenderElementContent.tsx

import React from "react";
import { LayoutElement } from "../types/section";
import { StyleConfig, FontConfig } from "../../../types/cv-designer";

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
  console.log("RenderElementContent: element.type:", element.type);
  console.log("RenderElementContent: field prop (contentFieldKey):", field);
  console.log('RenderElementContent: style.colors:', style.colors);
  console.log('RenderElementContent: style.sections for', element.type, ':', style.sections?.[element.type]);

  // 1. Field-spezifisches FontConfig
  let effectiveFontConfig: FontConfig | undefined;
  if (field) {
    effectiveFontConfig =
      style.sections?.[element.type]?.fields?.[field]?.font;
    console.log("field-specific fontConfig:", effectiveFontConfig);
  }

  // 2. Section-spezifisches FontConfig
  if (!effectiveFontConfig) {
    if (field === "header") {
      effectiveFontConfig = style.sections?.[element.type]?.header?.font;
    } else {
      effectiveFontConfig = style.sections?.[element.type]?.font;
    }
    console.log("section fontConfig:", effectiveFontConfig);
  }

  // 3. Globales FontConfig
  if (!effectiveFontConfig) {
    effectiveFontConfig = style.font;
    console.log("global fontConfig:", effectiveFontConfig);
  }

  console.log("final effectiveFontConfig:", effectiveFontConfig);

  // Hilfsfunktion: Fonts + Farben anwenden
  const applyFontStyle = (
    content: React.ReactNode,
    extraStyle: React.CSSProperties = {}
  ) => {
    const fontStyle: React.CSSProperties = {
      fontSize: effectiveFontConfig?.size
        ? `${effectiveFontConfig.size}px`
        : undefined,
      fontWeight: effectiveFontConfig?.weight,
      // 🟢 Farb-Fallbacks: erst FontConfig.color, dann section/field, dann global colors
      color:
        effectiveFontConfig?.color ||
        style.sections?.[element.type]?.color ||
        (field === "header" 
          ? (style.colors && style.colors.primary) || style.primaryColor || "#1e40af"
          : (style.colors && style.colors.text) || style.textColor || "#333333"),
      letterSpacing:
        effectiveFontConfig?.letterSpacing !== undefined
          ? `${effectiveFontConfig.letterSpacing}px`
          : undefined,
      lineHeight: effectiveFontConfig?.lineHeight,
    };

    console.log("applied fontStyle:", fontStyle);

    return <span style={{ ...extraStyle, ...fontStyle }}>{content}</span>;
  };

  console.log("About to process element type:", element.type);

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
          border: `2px solid ${(style.colors && style.colors.accent) || style.accentColor || "#e5e7eb"}`,
        }}
      />
    ) : (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          backgroundColor: (style.colors && style.colors.background) || style.backgroundColor || "#f3f4f6",
          border: `2px dashed ${(style.colors && style.colors.accent) || style.accentColor || "#d1d5db"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.6em",
          color: (style.colors && style.colors.textSecondary) || "#6b7280",
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
        <div style={{ 
          fontStyle: "italic", 
          fontSize: "0.8em", 
          color: style.colors?.textSecondary || "#9ca3af" 
        }}>
          – Keine Fähigkeiten –
        </div>
      );
    }

    const skills = element.content
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    console.log('RenderElementContent: Rendering skills with accent color:', (style.colors && style.colors.accent) || style.accentColor);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {skills.slice(0, maxSkills).map((skill, i) =>
          applyFontStyle(skill, {
            background: (style.colors && style.colors.accent) || style.accentColor || "#3b82f6",
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
            background: (style.colors && style.colors.textSecondary) || "#6b7280",
            color: "white",
            padding: "2px 6px",
            borderRadius: "8px",
            fontSize: "0.7em",
          })}
      </div>
    );
  }

  /* -------- Standard Text -------- */
  console.log('RenderElementContent: Processing standard text element, content length:', element.content?.length || 0);
  return element.content
    ? applyFontStyle(element.content)
    : applyFontStyle("– Keine Daten –", {
        fontStyle: "italic",
        fontSize: "0.8em",
        color: (style.colors && style.colors.textSecondary) || "#9ca3af",
      });
};
