// 📄 src/modules/cv-designer/utils/RenderElementContent.tsx

import React from "react";
import { LayoutElement } from "../types/section";
import { StyleConfig, FontConfig } from "../../../types/cv-designer";
import { getFontFamilyWithFallback } from "./fonts";

interface Props {
  element: LayoutElement;
  style: StyleConfig;
  field?: string; // Subfeld-Key
  maxSkills?: number;
}

export const RenderElementContent: React.FC<Props> = ({
  element,
  style,
  field,
  maxSkills = 8,
}) => {
  let effectiveFontConfig: FontConfig | undefined;

  // 1. Field-spezifisches FontConfig
  if (field) {
    effectiveFontConfig = style.sections?.[element.type]?.fields?.[field]?.font;
  }

  // 2. Section-spezifisches FontConfig
  if (!effectiveFontConfig) {
    if (field === "header") {
      effectiveFontConfig = style.sections?.[element.type]?.header?.font;
    } else {
      effectiveFontConfig = style.sections?.[element.type]?.font;
    }
  }

  // 3. Sonderfälle: globale Tabs ("allHeaders", "name")
  if (!effectiveFontConfig) {
    if (field === "header" && style.sections) {
      // Fallback: globaler "allHeaders"
      effectiveFontConfig = Object.values(style.sections)
        .map((sec: any) => sec?.header?.font)
        .find(Boolean);
    }
    if (element.type === "profil" && field === "name") {
      effectiveFontConfig = style.sections?.profil?.fields?.name?.font;
    }
  }

  // 4. Globales FontConfig
  if (!effectiveFontConfig) {
    effectiveFontConfig = style.font;
  }

  // ---------------- Farb-Getter ----------------
  const getPrimaryColor = () =>
    style.colors?.primary || style.primaryColor || "#1e40af";

  const getAccentColor = () =>
    style.colors?.accent || style.accentColor || "#3b82f6";

  const getBackgroundColor = () =>
    style.colors?.background || style.backgroundColor || "#ffffff";

  const getTextColor = () =>
    style.colors?.text || style.textColor || "#333333";

  const getSecondaryTextColor = () =>
    style.colors?.textSecondary || "#9ca3af";

  // ---------------- Font anwenden ----------------
  const applyFontStyle = (
    content: React.ReactNode,
    extraStyle: React.CSSProperties = {}
  ) => {
    const fontWeight: React.CSSProperties["fontWeight"] =
      effectiveFontConfig?.weight ?? "normal";
    const fontStyle: React.CSSProperties["fontStyle"] =
      effectiveFontConfig?.style ?? "normal";

    const fontFamilyWithFallbacks = getFontFamilyWithFallback(
      effectiveFontConfig?.family
    );

    const styleObj: React.CSSProperties = {
      fontFamily: fontFamilyWithFallbacks,
      fontSize: effectiveFontConfig?.size
        ? `${effectiveFontConfig.size}px`
        : undefined,
      fontWeight,
      fontStyle,
      color:
        effectiveFontConfig?.color ||
        (field === "header" ? getPrimaryColor() : getTextColor()),
      letterSpacing:
        effectiveFontConfig?.letterSpacing !== undefined
          ? `${effectiveFontConfig.letterSpacing}px`
          : undefined,
      lineHeight: effectiveFontConfig?.lineHeight,
    };

    return <span style={{ ...extraStyle, ...styleObj }}>{content}</span>;
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
        {skills.slice(0, maxSkills).map((skill, i) =>
          applyFontStyle(skill, {
            background: getAccentColor(),
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
            background: getSecondaryTextColor(),
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
        color: getSecondaryTextColor(),
      });
};
