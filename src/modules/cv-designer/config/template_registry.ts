/**
 * Template Registry
 * Defines predefined CV templates with different layouts and styles
 */

import { StyleConfig } from "../../../types/cv-designer";
import { LayoutElement } from "../types/section";

export interface PredefinedTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  styleConfig: StyleConfig;
  layout: LayoutElement[];
  category: "classic" | "modern" | "minimal" | "creative";
  tags: string[];
}

/**
 * Predefined CV Templates with real layout differences
 */
export const predefinedTemplates: PredefinedTemplate[] = [
  // CLASSIC TEMPLATE
  {
    id: "classic",
    name: "Klassisch",
    description: "Traditionelles einspaltiges Layout mit Foto oben und Standard-Reihenfolge der Abschnitte",
    thumbnail: "/templates/classic.png",
    category: "classic",
    tags: ["traditionell", "einspaltig", "konservativ"],
    styleConfig: {
      primaryColor: "#1f2937",
      accentColor: "#6b7280",
      fontFamily: "Georgia",
      fontSize: "medium",
      lineHeight: 1.6,
      margin: "wide",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      borderRadius: "4px",
      sectionSpacing: 32,
      snapSize: 20,
      widthPercent: 100,
      padding: "24px",
      border: "1px solid #e5e7eb",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    layout: [
      { id: "header", type: "profil", title: "Persönliche Daten", content: "", x: 0, y: 0, width: 600, height: 120 },
      { id: "photo", type: "photo", title: "Profilbild", content: "", x: 500, y: 10, width: 80, height: 80 },
      { id: "experience", type: "erfahrung", title: "Berufserfahrung", content: "", x: 0, y: 140, width: 600, height: 250 },
      { id: "education", type: "ausbildung", title: "Ausbildung", content: "", x: 0, y: 410, width: 600, height: 150 },
      { id: "skills", type: "kenntnisse", title: "Fachkompetenzen", content: "", x: 0, y: 580, width: 600, height: 100 },
    ],
  },

  // MODERN TEMPLATE
  {
    id: "modern",
    name: "Modern Zweispaltig",
    description: "Modernes zweispaltiges Layout mit linker Sidebar für Foto & Skills, rechte Hauptspalte für Erfahrung",
    thumbnail: "/templates/modern.png",
    category: "modern",
    tags: ["modern", "zweispaltig", "sidebar", "business"],
    styleConfig: {
      primaryColor: "#1e40af",
      accentColor: "#3b82f6",
      fontFamily: "Inter",
      fontSize: "medium",
      lineHeight: 1.5,
      margin: "normal",
      backgroundColor: "#ffffff",
      textColor: "#374151",
      borderRadius: "8px",
      sectionSpacing: 24,
      snapSize: 20,
      widthPercent: 100,
      padding: "20px",
      border: "1px solid #e5e7eb",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    layout: [
      { id: "sidebar-photo", type: "photo", title: "Profilbild", content: "", x: 20, y: 20, width: 160, height: 160 },
      { id: "sidebar-contact", type: "profil", title: "Kontakt", content: "", x: 20, y: 200, width: 160, height: 120 },
      { id: "sidebar-skills", type: "kenntnisse", title: "Skills", content: "", x: 20, y: 340, width: 160, height: 200 },
      { id: "sidebar-softskills", type: "softskills", title: "Soft Skills", content: "", x: 20, y: 560, width: 160, height: 120 },
      { id: "main-header", type: "profil", title: "Profil", content: "", x: 200, y: 20, width: 380, height: 100 },
      { id: "main-experience", type: "erfahrung", title: "Berufserfahrung", content: "", x: 200, y: 140, width: 380, height: 300 },
      { id: "main-education", type: "ausbildung", title: "Ausbildung", content: "", x: 200, y: 460, width: 380, height: 180 },
    ],
  },

  // MINIMAL TEMPLATE
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Sehr reduziertes einspaltiges Layout ohne Foto, Fokus auf Erfahrung mit inline Skills",
    thumbnail: "/templates/minimal.png",
    category: "minimal",
    tags: ["minimal", "clean", "fokussiert", "tech"],
    styleConfig: {
      primaryColor: "#000000",
      accentColor: "#4b5563",
      fontFamily: "Inter",
      fontSize: "small",
      lineHeight: 1.4,
      margin: "narrow",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      borderRadius: "0px",
      sectionSpacing: 16,
      snapSize: 20,
      widthPercent: 100,
      padding: "16px",
      border: "none",
      boxShadow: "none",
    },
    layout: [
      { id: "minimal-header", type: "profil", title: "Kontakt", content: "", x: 0, y: 0, width: 600, height: 80 },
      { id: "minimal-experience", type: "erfahrung", title: "Berufserfahrung", content: "", x: 0, y: 100, width: 600, height: 300 },
      { id: "minimal-skills-inline", type: "kenntnisse", title: "Kompetenzen", content: "", x: 0, y: 420, width: 300, height: 80 },
      { id: "minimal-education", type: "ausbildung", title: "Ausbildung", content: "", x: 320, y: 420, width: 280, height: 80 },
    ],
  },

  // CREATIVE TEMPLATE
  {
    id: "creative",
    name: "Kreativ",
    description: "Asymmetrisches, auffälliges Layout mit Fokus auf Portfolio und Design-Elemente",
    thumbnail: "/templates/creative.png",
    category: "creative",
    tags: ["kreativ", "design", "asymmetrisch"],
    styleConfig: {
      primaryColor: "#be185d",
      accentColor: "#ec4899",
      fontFamily: "Poppins",
      fontSize: "large",
      lineHeight: 1.5,
      margin: "wide",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      borderRadius: "8px",
      sectionSpacing: 24,
      snapSize: 20,
      widthPercent: 100,
      padding: "20px",
      border: "1px solid #e5e7eb",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    layout: [
      { id: "creative-photo", type: "photo", title: "Profilbild", content: "", x: 20, y: 20, width: 140, height: 140 },
      { id: "creative-profile", type: "profil", title: "Profil", content: "", x: 180, y: 20, width: 400, height: 100 },
      { id: "creative-experience", type: "erfahrung", title: "Erfahrung", content: "", x: 180, y: 140, width: 400, height: 250 },
      { id: "creative-education", type: "ausbildung", title: "Ausbildung", content: "", x: 180, y: 400, width: 400, height: 180 },
      { id: "creative-portfolio", type: "portfolio", title: "Portfolio", content: "", x: 20, y: 180, width: 140, height: 400 },
    ],
  },

  // TIMELINE TEMPLATE
  {
    id: "timeline",
    name: "Timeline",
    description: "Chronologisches Layout mit Fokus auf Berufserfahrung als Zeitstrahl",
    thumbnail: "/templates/timeline.png",
    category: "modern",
    tags: ["timeline", "chronologisch", "übersichtlich"],
    styleConfig: {
      ...modernStyle,
      primaryColor: "#0f766e",
      accentColor: "#14b8a6",
    },
    layout: [
      { id: "timeline-header", type: "profil", title: "Profil", content: "", x: 0, y: 0, width: 600, height: 100 },
      { id: "timeline-experience", type: "erfahrung", title: "Berufserfahrung", content: "", x: 0, y: 120, width: 600, height: 400 },
      { id: "timeline-education", type: "ausbildung", title: "Ausbildung", content: "", x: 0, y: 540, width: 600, height: 200 },
    ],
  },

  // SIDEBAR TOP TEMPLATE
  {
    id: "sidebarTop",
    name: "Sidebar Top",
    description: "Sidebar links kombiniert mit Header-Bereich oben",
    thumbnail: "/templates/sidebarTop.png",
    category: "modern",
    tags: ["sidebar", "header", "zweispaltig"],
    styleConfig: {
      ...modernStyle,
      primaryColor: "#7c3aed",
      accentColor: "#a78bfa",
    },
    layout: [
      { id: "sidebar-photo", type: "photo", title: "Foto", content: "", x: 20, y: 20, width: 120, height: 120 },
      { id: "sidebar-skills", type: "kenntnisse", title: "Skills", content: "", x: 20, y: 160, width: 120, height: 200 },
      { id: "sidebar-contact", type: "profil", title: "Kontakt", content: "", x: 20, y: 380, width: 120, height: 200 },
      { id: "header-profile", type: "profil", title: "Profil", content: "", x: 160, y: 20, width: 420, height: 100 },
      { id: "main-experience", type: "erfahrung", title: "Erfahrung", content: "", x: 160, y: 140, width: 420, height: 300 },
      { id: "main-education", type: "ausbildung", title: "Ausbildung", content: "", x: 160, y: 460, width: 420, height: 200 },
    ],
  },

  // PORTFOLIO TEMPLATE
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Großer Showcase-Bereich für Arbeitsproben",
    thumbnail: "/templates/portfolio.png",
    category: "creative",
    tags: ["portfolio", "showcase", "design"],
    styleConfig: {
      ...creativeStyle,
      primaryColor: "#1d4ed8",
      accentColor: "#60a5fa",
    },
    layout: [
      { id: "portfolio-header", type: "profil", title: "Profil", content: "", x: 0, y: 0, width: 600, height: 80 },
      { id: "portfolio-showcase", type: "portfolio", title: "Portfolio", content: "", x: 0, y: 100, width: 600, height: 350 },
      { id: "portfolio-experience", type: "erfahrung", title: "Erfahrung", content: "", x: 0, y: 470, width: 600, height: 200 },
    ],
  },
];

/**
 * Utility Functions
 */
export function getTemplateById(id: string): PredefinedTemplate | undefined {
  return predefinedTemplates.find((template) => template.id === id);
}

export function getTemplatesByCategory(
  category: PredefinedTemplate["category"]
): PredefinedTemplate[] {
  return predefinedTemplates.filter((template) => template.category === category);
}

export function getTemplateCategories(): PredefinedTemplate["category"][] {
  return Array.from(new Set(predefinedTemplates.map((template) => template.category)));
}

export function searchTemplatesByTags(tags: string[]): PredefinedTemplate[] {
  return predefinedTemplates.filter((template) =>
    tags.some((tag) => template.tags.includes(tag))
  );
}
