import { LayoutElement } from "../types/section"

// Better_Letter CV Data Types
interface PersonalData {
  [key: string]: any
  titel?: string
  vorname?: string
  nachname?: string
  telefon?: string
  telefonVorwahl?: string
  email?: string
  adresse?: string
  plz?: string
  ort?: string
  land?: string
  geburtsdatum?: string
  geburtsort?: string
  geburtsland?: string
  staatsbuergerschaft?: string
  familienstand?: string
  kinder?: string[]
  arbeitsmarktzugang?: string
  socialMedia?: string[]
  profileImage?: string
}

interface Experience {
  id: string
  companies?: string[]
  position?: string[]
  startMonth?: string | null
  startYear?: string | null
  endMonth?: string | null
  endYear?: string | null
  isCurrent?: boolean
  aufgabenbereiche?: string[]
  zusatzangaben?: string
  leasingCompaniesList?: string[]
}

interface Education {
  id: string
  institution?: string[]
  ausbildungsart?: string[]
  abschluss?: string[]
  startMonth?: string | null
  startYear?: string | null
  endMonth?: string | null
  endYear?: string | null
  isCurrent?: boolean
  zusatzangaben?: string
}

interface BetterLetterCVData {
  personalData: PersonalData
  berufserfahrung: Experience[]
  ausbildung: Education[]
  skills: string[]
  softskills: string[]
}

type TemplateType = "classic" | "modern" | "minimal" | "creative"

export function mapBetterLetterToDesigner(
  cv: BetterLetterCVData,
  templateName: TemplateType = "classic"
): LayoutElement[] {
  if (!cv) return []

  switch (templateName) {
    case "classic":
      return mapClassicTemplate(cv)
    case "modern":
      return mapModernTemplate(cv)
    case "minimal":
      return mapMinimalTemplate(cv)
    case "creative":
      return mapCreativeTemplate(cv)
    default:
      return mapClassicTemplate(cv)
  }
}

function mapClassicTemplate(cv: BetterLetterCVData): LayoutElement[] {
  const sections: LayoutElement[] = []

  // Header mit persönlichen Daten
  const personalInfo = buildPersonalInfo(cv.personalData || {})
  if (personalInfo) {
    sections.push({
      id: "header",
      type: "profil",
      title: "Persönliche Daten",
      content: personalInfo,
      x: 0,
      y: 0,
      width: 600,
      height: 120,
    })
  }

  // Foto (optional)
  if (cv.personalData?.profileImage) {
    sections.push({
      id: "photo",
      type: "photo",
      title: "",
      content: cv.personalData.profileImage,
      x: 500,
      y: 10,
      width: 80,
      height: 80,
    })
  }

  // Berufserfahrung
  const experienceContent = buildExperienceContent(cv.berufserfahrung || [])
  if (experienceContent) {
    sections.push({
      id: "experience",
      type: "erfahrung",
      title: "Berufserfahrung",
      content: experienceContent,
      x: 0,
      y: 140,
      width: 600,
      height: 250,
    })
  }

  // Ausbildung
  const educationContent = buildEducationContent(cv.ausbildung || [])
  if (educationContent) {
    sections.push({
      id: "education",
      type: "ausbildung",
      title: "Ausbildung",
      content: educationContent,
      x: 0,
      y: 410,
      width: 600,
      height: 150,
    })
  }

  return sections
}

// Hilfsfunktionen
function buildPersonalInfo(data: PersonalData): string {
  if (!data) return ""
  const parts = [
    [data.titel, data.vorname, data.nachname].filter(Boolean).join(" "),
    data.email,
    [data.telefonVorwahl, data.telefon].filter(Boolean).join(" "),
    [data.adresse, data.plz, data.ort, data.land].filter(Boolean).join(", "),
  ].filter(Boolean)
  return parts.join("\n")
}

function buildExperienceContent(experiences: Experience[]): string {
  if (!Array.isArray(experiences) || experiences.length === 0) return ""
  return experiences
    .map((e) => {
      const position = Array.isArray(e.position) ? e.position.join(" / ") : ""
      const companies = Array.isArray(e.companies) ? e.companies.join(" / ") : ""
      return `${position} @ ${companies}`.trim()
    })
    .filter(Boolean)
    .join("\n")
}

function buildEducationContent(education: Education[]): string {
  if (!Array.isArray(education) || education.length === 0) return ""
  return education
    .map((ed) => {
      const inst = Array.isArray(ed.institution) ? ed.institution.join(" / ") : ""
      const abschluss = Array.isArray(ed.abschluss) ? ed.abschluss.join(" / ") : ""
      return `${inst} – ${abschluss}`.trim()
    })
    .filter(Boolean)
    .join("\n")
}

// Stubs für andere Templates
function mapModernTemplate(cv: BetterLetterCVData): LayoutElement[] {
  return mapClassicTemplate(cv)
}
function mapMinimalTemplate(cv: BetterLetterCVData): LayoutElement[] {
  return mapClassicTemplate(cv)
}
function mapCreativeTemplate(cv: BetterLetterCVData): LayoutElement[] {
  return mapClassicTemplate(cv)
}
