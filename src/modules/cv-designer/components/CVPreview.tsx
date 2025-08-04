// 📄 src/modules/cv-designer/components/CVPreview.tsx

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
import { useStyleConfig } from "../context/StyleConfigContext";

interface CVPreviewProps {
  sections?: LayoutElement[];
  layoutElements?: LayoutElement[];
  cvData?: any;
  templateName?: "classic" | "modern" | "minimal" | "creative";
  className?: string;
  showDebugBorders?: boolean;
  scale?: number;
}

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

const SectionRenderer = ({
  element,
}: {
  element: LayoutElement;
}) => {
  // Use context instead of prop drilling
  const { styleConfig } = useStyleConfig();
  const elementStyle = renderElementToCanvas(element, styleConfig);

  return (
    <div key={element.id} style={elementStyle}>
      {/* NEU: Render element.title via RenderElementContent mit field="header" */}
      {element.title && element.type !== "photo" && (
        <>
          {console.log('SectionRenderer: About to render TITLE via RenderElementContent:', {
            elementId: element.id,
            elementType: element.type,
            title: element.title,
            field: 'header'
          })}
          <div
            style={{
              marginBottom: "6px",
              borderBottom: `1px solid ${styleConfig.colors?.accent || styleConfig.accentColor || "#3b82f6"}`,
              paddingBottom: "2px",
            }}
          >
            <RenderElementContent
              element={{ ...element, content: element.title }} // Titel als Inhalt übergeben
              style={styleConfig}
              field="header" // Spezieller Feld-Key für Überschriften
            />
          </div>
        </>
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
        {console.log('SectionRenderer: About to render CONTENT via RenderElementContent:', {
          elementId: element.id,
          elementType: element.type,
          contentLength: element.content?.length || 0,
          field: 'content'
        })}
        {/* Bestehender Aufruf für element.content, jetzt mit field="content" */}
        <RenderElementContent
          element={element}
          style={styleConfig}
          field="content" // Spezieller Feld-Key für den Hauptinhalt
        />
      </div>
    </div>
  );
};

const CVPreview: React.FC<CVPreviewProps> = ({
  sections,
  layoutElements = [],
  cvData,
  templateName = "classic",
  className = "",
  showDebugBorders = false,
  scale,
}) => {
  // DEBUG: Log styleConfig received in CVPreview
  console.log('CVPreview: Component render started with props:', {
    sectionsLength: sections?.length || 0,
    layoutElementsLength: layoutElements?.length || 0,
    templateName,
    className
  });
  console.log('CVPreview: layoutElements received:', layoutElements);
  
  // Use context instead of prop drilling
  const { styleConfig } = useStyleConfig();
  
  console.log('CVPreview: styleConfig from context:', styleConfig);
  console.log('CVPreview: styleConfig.sections from context:', styleConfig?.sections);
  
  const { personalData, berufserfahrung, ausbildung } = useLebenslauf();

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

    return elementsToUse.map((el) => {
      let content = "";

      switch (el.type) {
        case "profil":
        case "personal": {
          const personalInfo: string[] = [];
          const fullName = [personalData?.titel, personalData?.vorname, personalData?.nachname]
            .filter(Boolean)
            .join(" ");
          if (fullName) personalInfo.push(fullName);
          if (personalData?.email) personalInfo.push(`📧 ${personalData.email}`);
          if (personalData?.telefon) {
            const phone = `${personalData.telefonVorwahl || ""} ${personalData.telefon}`.trim();
            personalInfo.push(`📞 ${phone}`);
          }
          const address = [personalData?.adresse, personalData?.plz, personalData?.ort, personalData?.land]
            .filter(Boolean)
            .join(", ");
          if (address) personalInfo.push(`📍 ${address}`);
          content = personalInfo.join("\n") || "– Keine persönlichen Daten –";
          break;
        }

        case "erfahrung":
        case "experience":
          if (berufserfahrung?.length > 0) {
            content = berufserfahrung
              .map((e) => {
                const parts: string[] = [];
                const position = Array.isArray(e.position)
                  ? e.position.join(" / ")
                  : e.position || "";
                const companies = Array.isArray(e.companies)
                  ? e.companies.join(" // ")
                  : e.companies || "";
                if (position && companies) parts.push(`${position}\n${companies}`);
                else if (position) parts.push(position);
                else if (companies) parts.push(companies);

                const startDate =
                  e.startMonth && e.startYear ? `${e.startMonth}.${e.startYear}` : e.startYear || "";
                const endDate = e.isCurrent
                  ? "heute"
                  : e.endMonth && e.endYear
                  ? `${e.endMonth}.${e.endYear}`
                  : e.endYear || "";
                if (startDate || endDate) {
                  const zeitraum =
                    startDate && endDate ? `${startDate} – ${endDate}` : startDate || endDate;
                  parts.push(`(${zeitraum})`);
                }

                let result = parts.join("\n");
                if (e.aufgabenbereiche?.length > 0) {
                  const tasks = e.aufgabenbereiche.slice(0, 3);
                  result += "\n\n• " + tasks.join("\n• ");
                  if (e.aufgabenbereiche.length > 3)
                    result += `\n• ... (+${e.aufgabenbereiche.length - 3} weitere)`;
                }
                return result;
              })
              .join("\n\n");
          } else {
            content = "– Keine Berufserfahrung –";
          }
          break;

        case "ausbildung":
        case "education":
          if (ausbildung?.length > 0) {
            content = ausbildung
              .map((a) => {
                const parts: string[] = [];
                const ausbildungsart = Array.isArray(a.ausbildungsart)
                  ? a.ausbildungsart.join(" / ")
                  : a.ausbildungsart || "";
                const abschluss = Array.isArray(a.abschluss)
                  ? a.abschluss.join(" / ")
                  : a.abschluss || "";
                if (ausbildungsart && abschluss) parts.push(`${ausbildungsart}\n${abschluss}`);
                else if (ausbildungsart) parts.push(ausbildungsart);
                else if (abschluss) parts.push(abschluss);
                const institution = Array.isArray(a.institution)
                  ? a.institution.join(", ")
                  : a.institution || "";
                if (institution) parts.push(institution);
                const startDate =
                  a.startMonth && a.startYear ? `${a.startMonth}.${a.startYear}` : a.startYear || "";
                const endDate = a.isCurrent
                  ? "heute"
                  : a.endMonth && a.endYear
                  ? `${a.endMonth}.${a.endYear}`
                  : a.endYear || "";
                if (startDate || endDate) {
                  const zeitraum =
                    startDate && endDate ? `${startDate} – ${endDate}` : startDate || endDate;
                  parts.push(`(${zeitraum})`);
                }
                return parts.join("\n");
              })
              .join("\n\n");
          } else {
            content = "– Keine Ausbildung –";
          }
          break;

        case "kenntnisse":
        case "skills":
          content =
            "JavaScript, React, TypeScript, Node.js, Python, SQL, Git, Docker";
          break;

        case "softskills":
          content =
            "Teamfähigkeit, Kommunikationsstärke, Problemlösungskompetenz, Organisationstalent";
          break;

        case "photo":
          content = personalData?.profileImage || "";
          break;

        default:
          content = el.content || "– Keine Daten –";
      }
      return { ...el, content };
    });
  }, [layoutElements, sections, personalData, berufserfahrung, ausbildung, templateName]);

  console.log('CVPreview: sectionsToRender built:', {
    length: sectionsToRender.length,
    elements: sectionsToRender.map(el => ({
      id: el.id,
      type: el.type,
      title: el.title,
      contentLength: el.content?.length || 0
    }))
  });

  const safeStyleConfig = styleConfig || defaultStyleConfig;
  console.log('CVPreview: Using safeStyleConfig:', safeStyleConfig);
  console.log('CVPreview: safeStyleConfig.sections:', safeStyleConfig.sections);
  
  const layoutValidation = React.useMemo(
    () => validateLayout(sectionsToRender, A4_WIDTH, A4_HEIGHT),
    [sectionsToRender]
  );
  const layoutStats = React.useMemo(() => getLayoutStats(sectionsToRender), [sectionsToRender]);
  const actualScale = scale || 1;

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: A4_WIDTH,
    height: A4_HEIGHT,
    backgroundColor: (safeStyleConfig.colors && safeStyleConfig.colors.background) || safeStyleConfig.backgroundColor || "#ffffff",
    fontFamily: safeStyleConfig.font?.family || "Inter",
    fontSize:
      safeStyleConfig.font?.size === "small"
        ? "10px"
        : safeStyleConfig.fontSize === "large"
        ? "14px"
        : "12px",
    lineHeight: safeStyleConfig.lineHeight || 1.5,
    color: (safeStyleConfig.colors && safeStyleConfig.colors.text) || safeStyleConfig.textColor || "#333333",
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
        {console.log('CVPreview: About to render container with', sectionsToRender.length, 'sections')}
        <div style={containerStyle}>
          {sectionsToRender.map((element) => (
            <>
              {console.log('CVPreview: Mapping element for SectionRenderer:', element.id, element.type)}
              <SectionRenderer
                key={element.id}
                element={element}
              />
            </>
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