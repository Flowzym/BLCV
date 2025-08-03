/**
 * CV Preview – nutzt StyleConfig + Template Layouts
 * Rendert LayoutElements mit absoluter Positionierung für echte Template-Layouts
 */

import React from "react";
import { LayoutElement } from "../types/section";
import { StyleConfig } from "../types/styles";
import { defaultStyleConfig } from "../config/defaultStyleConfig";
import { useLebenslauf } from "@/components/LebenslaufContext";
import { mapBetterLetterToDesigner } from "../services/mapBetterLetterToDesigner";

interface CVPreviewProps {
  sections?: LayoutElement[];
  layoutElements?: LayoutElement[];
  styleConfig?: StyleConfig;
  cvData?: any;
  className?: string;
}

const CVPreview: React.FC<CVPreviewProps> = ({
  sections,
  layoutElements = [],
  styleConfig,
  cvData,
  className = "",
}) => {
  // Hole Daten aus LebenslaufContext
  const { personalData, berufserfahrung, ausbildung } = useLebenslauf();

  // Template-Layout + Inhalte zusammenführen
  const sectionsToRender = React.useMemo(() => {
    // Priorität: layoutElements > sections > fallback mapping
    let elementsToUse: LayoutElement[] = [];
    
    if (layoutElements.length > 0) {
      elementsToUse = layoutElements;
    } else if (sections && sections.length > 0) {
      elementsToUse = sections;
    } else {
      // Fallback: Standard Mapping (einspaltig)
      elementsToUse = mapBetterLetterToDesigner({
        personalData,
        berufserfahrung,
        ausbildung,
        skills: [],
        softskills: [],
      });
    }

    // Inhalte aus Context in Template-Layout injizieren
    return elementsToUse.map((el) => {
      let content: string = "";

      switch (el.type) {
        case "profil":
        case "personal":
          const personalInfo = [];
          
          // Name zusammensetzen
          const fullName = [personalData?.titel, personalData?.vorname, personalData?.nachname]
            .filter(Boolean)
            .join(' ');
          if (fullName) personalInfo.push(fullName);
          
          // Kontaktdaten
          if (personalData?.email) personalInfo.push(`📧 ${personalData.email}`);
          if (personalData?.telefon) {
            const phone = `${personalData.telefonVorwahl || ''} ${personalData.telefon}`.trim();
            personalInfo.push(`📞 ${phone}`);
          }
          
          // Adresse
          const address = [personalData?.adresse, personalData?.plz, personalData?.ort, personalData?.land]
            .filter(Boolean)
            .join(', ');
          if (address) personalInfo.push(`📍 ${address}`);
          
          content = personalInfo.join('\n') || "– Keine persönlichen Daten –";
          break;

        case "erfahrung":
        case "experience":
          if (berufserfahrung && berufserfahrung.length > 0) {
            content = berufserfahrung.map(e => {
              const parts = [];
              
              // Position und Unternehmen
              const position = Array.isArray(e.position) ? e.position.join(' / ') : (e.position || '');
              const companies = Array.isArray(e.companies) ? e.companies.join(' // ') : (e.companies || '');
              
              if (position && companies) {
                parts.push(`${position}\n${companies}`);
              } else if (position) {
                parts.push(position);
              } else if (companies) {
                parts.push(companies);
              }
              
              // Zeitraum
              const startDate = e.startMonth && e.startYear ? `${e.startMonth}.${e.startYear}` : e.startYear || '';
              const endDate = e.isCurrent ? 'heute' : 
                             (e.endMonth && e.endYear ? `${e.endMonth}.${e.endYear}` : e.endYear || '');
              
              if (startDate || endDate) {
                const zeitraum = startDate && endDate ? `${startDate} – ${endDate}` : (startDate || endDate);
                parts.push(`(${zeitraum})`);
              }
              
              let result = parts.join('\n');
              
              // Aufgabenbereiche
              if (e.aufgabenbereiche && e.aufgabenbereiche.length > 0) {
                result += '\n\n• ' + e.aufgabenbereiche.join('\n• ');
              }
              
              return result;
            }).join('\n\n');
          } else {
            content = "– Keine Berufserfahrung –";
          }
          break;

        case "ausbildung":
        case "education":
          if (ausbildung && ausbildung.length > 0) {
            content = ausbildung.map(a => {
              const parts = [];
              
              // Ausbildungsart und Abschluss
              const ausbildungsart = Array.isArray(a.ausbildungsart) ? a.ausbildungsart.join(' / ') : (a.ausbildungsart || '');
              const abschluss = Array.isArray(a.abschluss) ? a.abschluss.join(' / ') : (a.abschluss || '');
              
              if (ausbildungsart && abschluss) {
                parts.push(`${ausbildungsart}\n${abschluss}`);
              } else if (ausbildungsart) {
                parts.push(ausbildungsart);
              } else if (abschluss) {
                parts.push(abschluss);
              }
              
              // Institution
              const institution = Array.isArray(a.institution) ? a.institution.join(', ') : (a.institution || '');
              if (institution) {
                parts.push(institution);
              }
              
              // Zeitraum
              const startDate = a.startMonth && a.startYear ? `${a.startMonth}.${a.startYear}` : a.startYear || '';
              const endDate = a.isCurrent ? 'heute' : 
                             (a.endMonth && a.endYear ? `${a.endMonth}.${a.endYear}` : a.endYear || '');
              
              if (startDate || endDate) {
                const zeitraum = startDate && endDate ? `${startDate} – ${endDate}` : (startDate || endDate);
                parts.push(`(${zeitraum})`);
              }
              
              return parts.join('\n');
            }).join('\n\n');
          } else {
            content = "– Keine Ausbildung –";
          }
          break;

        case "kenntnisse":
        case "skills":
          content = "JavaScript, React, TypeScript, Node.js, Python, SQL, Git, Docker";
          break;

        case "softskills":
          content = "Teamfähigkeit, Kommunikationsstärke, Problemlösungskompetenz, Organisationstalent";
          break;

        case "photo":
          // Profilbild wird speziell behandelt
          content = personalData?.profileImage || "";
          break;

        default:
          content = el.content || "– Keine Daten –";
      }

      return { ...el, content };
    });
  }, [layoutElements, sections, personalData, berufserfahrung, ausbildung]);

  const safeStyleConfig = styleConfig || defaultStyleConfig;

  // Container-Style für A4-ähnliche Proportionen
  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "842px", // A4 Höhe in px (bei 72 DPI)
    maxWidth: "595px", // A4 Breite in px (bei 72 DPI)
    margin: "0 auto",
    backgroundColor: safeStyleConfig.backgroundColor || "#ffffff",
    fontFamily: safeStyleConfig.fontFamily || "Inter",
    fontSize: safeStyleConfig.fontSize === "small" ? "12px" : 
              safeStyleConfig.fontSize === "large" ? "16px" : "14px",
    lineHeight: safeStyleConfig.lineHeight || 1.5,
    color: safeStyleConfig.textColor || "#333333",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "auto",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
  };

  // Funktion zum Rendern von Skills als Badges
  const renderSkillsBadges = (content: string) => {
    const skills = content.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {skills.map((skill, idx) => (
          <span
            key={idx}
            style={{
              background: safeStyleConfig.accentColor || "#3b82f6",
              color: "white",
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "0.75em",
              fontWeight: "500"
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    );
  };

  // Funktion zum Rendern von Content
  const renderContent = (element: LayoutElement) => {
    const { type, content, title } = element;

    // Profilbild spezielle Behandlung
    if (type === "photo") {
      return content ? (
        <img
          src={content}
          alt="Profilfoto"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
            border: `2px solid ${safeStyleConfig.accentColor || "#e5e7eb"}`
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: "#f3f4f6",
            border: `2px dashed ${safeStyleConfig.accentColor || "#d1d5db"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75em",
            color: "#6b7280"
          }}
        >
          📷 Foto
        </div>
      );
    }

    // Skills als Badges rendern
    if (type === "kenntnisse" || type === "skills" || type === "softskills") {
      return content ? renderSkillsBadges(content) : (
        <div style={{ color: "#9ca3af", fontStyle: "italic", fontSize: "0.875em" }}>
          – Keine {type === "softskills" ? "Soft Skills" : "Fähigkeiten"} –
        </div>
      );
    }

    // Standard Content-Rendering
    return (
      <div style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
        {content || (
          <div style={{ color: "#9ca3af", fontStyle: "italic", fontSize: "0.875em" }}>
            – Keine Daten –
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`cv-preview ${className}`} style={containerStyle}>
      {sectionsToRender.map((element) => (
        <div
          key={element.id}
          style={{
            position: "absolute",
            left: `${element.x}px`,
            top: `${element.y}px`,
            width: `${element.width}px`,
            height: `${element.height}px`,
            padding: safeStyleConfig.padding || "12px",
            boxSizing: "border-box",
            overflow: "hidden"
          }}
        >
          {/* Section Title */}
          {element.title && element.type !== "photo" && (
            <h3
              style={{
                fontSize: "1.1em",
                fontWeight: "600",
                marginBottom: "8px",
                color: safeStyleConfig.primaryColor || "#1e40af",
                borderBottom: `1px solid ${safeStyleConfig.accentColor || "#3b82f6"}`,
                paddingBottom: "4px"
              }}
            >
              {element.title}
            </h3>
          )}

          {/* Section Content */}
          <div style={{ 
            height: element.title && element.type !== "photo" ? "calc(100% - 32px)" : "100%",
            overflow: "hidden"
          }}>
            {renderContent(element)}
          </div>
        </div>
      ))}

      {/* Fallback wenn keine Sections vorhanden */}
      {sectionsToRender.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "#6b7280",
            fontStyle: "italic"
          }}
        >
          <div style={{ fontSize: "3em", marginBottom: "16px" }}>📄</div>
          <div>Keine Lebenslaufdaten vorhanden</div>
          <div style={{ fontSize: "0.875em", marginTop: "8px" }}>
            Bitte füllen Sie die Felder im Lebenslauf-Editor aus
          </div>
        </div>
      )}
    </div>
  );
};

export default CVPreview;