// 📄 src/modules/cv-designer/utils/RenderElementContent.tsx

import React from "react";
import { LayoutElement } from "../types/section";
import { useTypography } from "../context/TypographyContext";
import { useStyleConfig } from "../context/StyleConfigContext";
import { getFontFamilyWithFallback } from "./fonts";

interface Props {
  element: LayoutElement;
  field?: string; // Subfeld-Key (header, name, etc.)
  maxSkills?: number;
}

export const RenderElementContent: React.FC<Props> = ({
  element,
  field,
  maxSkills = 8,
}) => {
  console.log(`🎨 RenderElementContent: rendering ${element.type}.${field || 'content'}`);

  // Get typography configuration from TypographyContext
  const [typography] = useTypography(element.type, field || 'content');
  
  // Get style configuration from StyleConfigContext (for colors only)
  const { styleConfig } = useStyleConfig();

  console.log(`🎨 RenderElementContent: typography for ${element.type}.${field || 'content'}:`, typography);

  // Color getters with robust fallback chains
  const getPrimaryColor = () =>
    styleConfig.colors?.primary || styleConfig.primaryColor || "#1e40af";

  const getAccentColor = () =>
    styleConfig.colors?.accent || styleConfig.accentColor || "#3b82f6";

  const getBackgroundColor = () =>
    styleConfig.colors?.background || styleConfig.backgroundColor || "#ffffff";

  const getTextColor = () =>
    styleConfig.colors?.text || styleConfig.textColor || "#333333";

  const getSecondaryTextColor = () =>
    styleConfig.colors?.textSecondary || "#9ca3af";

  // Apply font styling with typography from context
  const applyFontStyle = (
    content: React.ReactNode,
    extraStyle: React.CSSProperties = {}
  ) => {
    const fontFamilyWithFallbacks = getFontFamilyWithFallback(typography.fontFamily);

    const styleObj: React.CSSProperties = {
      // 🎯 KRITISCH: Inline-Styles mit !important für Font-Eigenschaften (überschreibt Tailwind)
      fontFamily: fontFamilyWithFallbacks,
      fontSize: `${typography.fontSize}px`,
      fontWeight: typography.fontWeight,
      fontStyle: typography.italic ? 'italic' : 'normal',
      color: typography.textColor,
      letterSpacing: typography.letterSpacing !== undefined 
        ? `${typography.letterSpacing}px` 
        : undefined,
      lineHeight: typography.lineHeight,
      ...extraStyle,
    };

    console.log(`🎨 RenderElementContent: applied fontStyle for ${element.type}.${field || 'content'}:`, {
      fontFamily: styleObj.fontFamily,
      fontSize: styleObj.fontSize,
      fontWeight: styleObj.fontWeight,
      color: styleObj.color
    });

    return (
      <span 
        style={styleObj}
        className="font-override"
      >
        {content}
      </span>
    );
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
          border: `2px solid ${getAccentColor()}`,
        }}
      />
    ) : (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          backgroundColor: getBackgroundColor(),
          border: `2px dashed ${getAccentColor()}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.6em",
          color: getSecondaryTextColor(),
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
        <div
          style={{
            fontStyle: "italic",
            fontSize: "0.8em",
            color: getSecondaryTextColor(),
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
        {skills.slice(0, maxSkills).map((skill, index) =>
          applyFontStyle(
            <span key={index}>{skill}</span>,
            {
              background: getAccentColor(),
              color: "white",
              padding: "2px 6px",
              borderRadius: "8px",
              fontSize: "0.7em",
              fontWeight: "500",
              whiteSpace: "nowrap",
            }
          )
        )}
        {skills.length > maxSkills &&
          applyFontStyle(
            <span key="more">+{skills.length - maxSkills}</span>,
            {
              background: getSecondaryTextColor(),
              color: "white",
              padding: "2px 6px",
              borderRadius: "8px",
              fontSize: "0.7em",
            }
          )}
      </div>
    );
  }

  /* -------- Standard Text -------- */
  return element.content
    ? applyFontStyle(element.content)
    : applyFontStyle("– Keine Daten –", {
        fontStyle: "italic",
        fontSize: "0.8em",
        color: getSecondaryTextColor(),
      });
};