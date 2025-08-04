// 📄 src/modules/cv-designer/components/CVPreview.tsx

/**
 * CV Preview – rendert LayoutElements im A4-Format
 * Nutzt StyleConfig, Templates & Context-Daten
 * Features: Skalierung, DebugOverlay, LayoutValidation
 */

import React from "react";
import { LayoutElement } from "../types/section";
import { StyleConfig } from "../../../types/cv-designer";
import { defaultStyleConfig } from "../config/defaultStyleConfig";
import { useLebenslauf } from "@/components/LebenslaufContext";
import { mapBetterLetterToDesigner } from "../services/mapBetterLetterToDesigner";
import {
  renderElementToCanvas,
  A4_WIDTH,
  A4_HEIGHT,
  validateLayout,
  getLayoutStats,
} from "../services/layoutRenderer";
import { RenderElementContent } from "../utils/renderElementContent";

/* ---------- Props ---------- */
interface CVPreviewProps {
  sections?: LayoutElement[];
  layoutElements?: LayoutElement[];
  styleConfig?: StyleConfig;
  cvData?: any;
  templateName?: "classic" | "modern" | "minimal" | "creative";
  className?: string;
  showDebugBorders?: boolean;
  scale?: number;
}

/* ---------- Hilfskomponenten ---------- */
const EmptyState = () => (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      textAlign: "center",
      color: "#6b7280",
      fontStyle: "italic",
    }}
  >
    <div style={{ fontSize: "2em", marginBottom: "12px" }}>📄</div>
    <div style={{ fontSize: "1.2em", marginBottom: "8px" }}>
      Keine Lebenslaufdaten vorhanden
    </div>
    <div style={{ fontSize: "0.9em" }}>
      Bitte füllen Sie die Felder im Lebenslauf-Editor aus
    </div>
  </div>
);

const DebugOverlay = ({
  stats,
  validation,
}: {
  stats: { density: number };
  validation: { overlaps: any[] };
}) => (
  <div
    style={{
      position: "absolute",
      top: "5px",
      right: "5px",
      background: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "0.7em",
      zIndex: 1000,
    }}
  >
    A4: {A4_WIDTH}×{A4_HEIGHT}px | Density: {stats.density.toFixed(1)}% | Overlaps:{" "}
    {validation.overlaps.length}
  </div>
);

/* ---------- Section Renderer ---------- */
const SectionRenderer = ({
  element,
  styleConfig,
}: {
  element: LayoutElement;
  styleConfig: StyleConfig;
}) => {
  const elementStyle = renderElementToCanvas(element, styleConfig);

  // Header-FontConfig aus styleConfig
  const headerFont =
    styleConfig.sections?.[element.type]?.fields?.header?.font || {
      size: 14,
      weight: "600",
      color: styleConfig.colors?.primary || "#1e40af",
      lineHeight: 1.2,
      letterSpacing: 0,
    };

  return (
    <div key={element.id} style={elementStyle}>
      {element.title && element.type !== "photo" && (
        <h3
          style={{
            fontSize: headerFont.size ? `${headerFont.size}px` : "14px",
            fontWeight: headerFont.weight || "600",
            color: headerFont.color || styleConfig.colors?.primary || "#1e40af",
            lineHeight: headerFont.lineHeight || 1.2,
            letterSpacing: headerFont.letterSpacing
              ? `${headerFont.letterSpacing}px`
              : "0px",
            marginBottom: "6px",
            borderBottom: `1px solid ${styleConfig.colors?.secondary || "#3b82f6"}`,
            paddingBottom: "2px",
          }}
        >
          {element.title}
        </h3>
      )}

      <div
        style={{
          height:
            element.title && element.type !== "photo"
              ? "calc(100% - 24px)"
              : "100%",
          overflow: "hidden",
        }}
      >
        {/* 🔑 field wird übergeben, damit Subfeld-Styles wirken */}
        <RenderElementContent
          element={element}
          style={styleConfig}
          field={element.field}
        />
      </div>
    </div>
  );
};

/* ---------- Hauptkomponente ---------- */
const CVPreview: React.FC<CVPreviewProps> = ({
  sections,
  layoutElements = [],
  styleConfig,
  cvData,
  templateName = "classic",
  className = "",
  showDebugBorders = false,
  scale,
}) => {
  const { personalData, berufserfahrung, ausbildung } = useLebenslauf();

  // Template-Layout + Inhalte zusammenführen
  const sectionsToRender = React.useMemo(() => {
    let elementsToUse: LayoutElement[] = [];

    if (layoutElements.length > 0) {
      elementsToUse = layoutElements;
    } else if (sections && sections.length > 0) {
      elementsToUse = sections;
    } else {
      elementsToUse = mapBetterLetterToDesigner(
        {
          personalData,
          berufserfahrung,
          ausbildung,
          skills: [],
          softskills: [],
        },
        templateName
      );
    }

    return elementsToUse;
  }, [layoutElements, sections, personalData, berufserfahrung, ausbildung, templateName]);

  const safeStyleConfig = styleConfig || defaultStyleConfig;
  const layoutValidation = React.useMemo(
    () => validateLayout(sectionsToRender, A4_WIDTH, A4_HEIGHT),
    [sectionsToRender]
  );
  const layoutStats = React.useMemo(
    () => getLayoutStats(sectionsToRender),
    [sectionsToRender]
  );
  const actualScale = scale || 1;

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: A4_WIDTH,
    height: A4_HEIGHT,
    backgroundColor: safeStyleConfig.backgroundColor || "#ffffff",
    fontFamily: safeStyleConfig.fontFamily || "Inter",
    fontSize:
      safeStyleConfig.fontSize === "small"
        ? "10px"
        : safeStyleConfig.fontSize === "large"
        ? "14px"
        : "12px",
    lineHeight: safeStyleConfig.lineHeight || 1.5,
    color: safeStyleConfig.textColor || "#333333",
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transform: actualScale !== 1 ? `scale(${actualScale})` : undefined,
    transformOrigin: "top left",
  };

  return (
    <div className={`cv-preview ${className}`}>
      <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        <div style={containerStyle}>
          {sectionsToRender.map((element) => (
            <SectionRenderer
              key={element.id}
              element={element}
              styleConfig={safeStyleConfig}
            />
          ))}

          {sectionsToRender.length === 0 && <EmptyState />}
          {showDebugBorders && (
            <DebugOverlay stats={layoutStats} validation={layoutValidation} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CVPreview;
