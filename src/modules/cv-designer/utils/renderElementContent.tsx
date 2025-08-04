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
  field, // Verwenden Sie 'field' als Prop-Namen
  maxSkills = 8,
}) => {
  // Debugging-Logs
  console.log('RenderElementContent: element.type:', element.type);
  console.log('RenderElementContent: field prop (contentFieldKey):', field);
  console.log('RenderElementContent: element.content length:', element.content?.length || 0);
  console.log('RenderElementContent: element.title:', element.title);
  console.log('RenderElementContent: style.sections available:', !!style.sections);
  console.log('RenderElementContent: style.sections keys:', style.sections ? Object.keys(style.sections) : 'none');

  // 1. Font für spezifisches Feld (z.B. 'profil.fields.name.font' oder 'profil.fields.header.font')
  let effectiveFontConfig: FontConfig | undefined = undefined;
  if (field) {
    effectiveFontConfig = style.sections?.[element.type]?.fields?.[field]?.font;
    console.log('RenderElementContent: field-specific fontConfig:', effectiveFontConfig);
    console.log('RenderElementContent: field lookup path:', `style.sections.${element.type}.fields.${field}.font`);
  }

  // 2. Allgemeiner Font für die Sektion (z.B. 'profil.font')
  if (!effectiveFontConfig) {
    if (field === 'header') {
      effectiveFontConfig = style.sections?.[element.type]?.header?.font;
      console.log('RenderElementContent: section-header fontConfig:', effectiveFontConfig);
      console.log('RenderElementContent: header lookup path:', `style.sections.${element.type}.header.font`);
    } else {
      effectiveFontConfig = style.sections?.[element.type]?.font;
      console.log('RenderElementContent: section-general fontConfig:', effectiveFontConfig);
      console.log('RenderElementContent: section lookup path:', `style.sections.${element.type}.font`);
    }
    console.log('RenderElementContent: section-general fontConfig:', effectiveFontConfig);
  }

  // 3. Globaler Standard-Font
  if (!effectiveFontConfig) {
    effectiveFontConfig = style.font;
    console.log('RenderElementContent: global fontConfig:', effectiveFontConfig);
    console.log('RenderElementContent: global lookup path:', 'style.font');
  }

  console.log('RenderElementContent: final effectiveFontConfig:', effectiveFontConfig);

  const applyFontStyle = (
    content: React.ReactNode,
    extraStyle: React.CSSProperties = {}
  ) => {
    if (!effectiveFontConfig) {
      console.log('RenderElementContent: No effectiveFontConfig found. Applying default styles.');
      return <span style={extraStyle}>{content}</span>;
    }

    const fontStyle: React.CSSProperties = {
      fontSize: effectiveFontConfig.size ? `${effectiveFontConfig.size}px` : undefined,
      fontWeight: effectiveFontConfig.weight || undefined,
      color: effectiveFontConfig.color || undefined,
      letterSpacing:
        effectiveFontConfig.letterSpacing !== undefined
          ? `${effectiveFontConfig.letterSpacing}px`
          : undefined,
      lineHeight: effectiveFontConfig.lineHeight || undefined,
    };
    console.log('RenderElementContent: applied fontStyle:', fontStyle);

    return <span style={{ ...extraStyle, ...fontStyle }}>{content}</span>;
  };

  console.log('RenderElementContent: About to process element type:', element.type);

  /* -------- Foto -------- */
  if (element.type === "photo") {
    console.log('RenderElementContent: Processing photo element');
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
    console.log('RenderElementContent: Processing skills/softskills element');
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
            background: style.colors?.accent || style.accentColor || "#3b82f6",
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
  console.log('RenderElementContent: Processing standard text element, returning content:', element.content);
  console.log('RenderElementContent: About to return with effectiveFontConfig:', effectiveFontConfig);
  return element.content
    ? applyFontStyle(element.content)
    : applyFontStyle("– Keine Daten –", {
        fontStyle: "italic",
        fontSize: "0.8em",
        color: "#9ca3af",
      });
};
