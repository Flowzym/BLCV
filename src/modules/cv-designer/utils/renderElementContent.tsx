// 📄 src/modules/cv-designer/utils/RenderElementContent.tsx

import React from "react";
import { LayoutElement } from "../types/section";
import { StyleConfig, FontConfig } from "../../../types/cv-designer";
import { getFontFamilyWithFallback } from "./fonts";

interface Props {
  element: LayoutElement;
  style: StyleConfig;
  field?: string; // Subfeld-Key (header, name, etc.)
  maxSkills?: number;
}

/**
 * Hilfsfunktion: Merge-Strategie mit Priorität
 * 1. Defaults
 * 2. allHeaders / name (globale Defaults)
 * 3. Section-spezifische Fonts
 * 4. Field-spezifische Fonts
 */
const mergeFonts = (
  base: FontConfig,
  overrides: (FontConfig | undefined)[]
): FontConfig => {
  let merged = { ...base };
  for (const ov of overrides) {
    if (ov) merged = { ...merged, ...ov };
  }
  return merged;
};

export const RenderElementContent: React.FC<Props> = ({
  element,
  style,
  field,
  maxSkills = 8,
}) => {
  // ---- Schritt 1: Basisfont aus globalem StyleConfig ----
  const baseFont = style.font || {
    family: "Inter",
    size: 12,
    weight: "normal",
    style: "normal",
    color: "#333333",
    letterSpacing: 0,
    lineHeight: 1.6,
  };

  // ---- Schritt 2: Globale Defaults (allHeaders, name) ----
  const allHeadersFont =
    field === "header" ? style.sections?.allHeaders?.header?.font : undefined;

  const nameFont =
    element.type === "profil" && field === "name"
      ? style.sections?.name?.font
      : undefined;

  // ---- Schritt 3: Section-spezifisch ----
  const sectionFont =
    field === "header"
      ? style.sections?.[element.type]?.header?.font
      : field
      ? style.sections?.[element.type]?.fields?.[field]?.font
      : style.sections?.[element.type]?.font;

  // ---- Schritt 4: Endgültiger Merge ----
  const effectiveFontConfig = mergeFonts(baseFont, [
    allHeadersFont,
    nameFont,
    sectionFont,
  ]);

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
        {skills.slice(0, maxSkills).map((skill) =>
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
