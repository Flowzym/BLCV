

import { LayoutElement } from "../types/section";

// Better_Letter CV Data Types (matching existing structure)
interface PersonalData {
  [key: string]: any;
  titel?: string;
  vorname?: string;
  nachname?: string;
  telefon?: string;
  telefonVorwahl?: string;
  email?: string;
  adresse?: string;
  plz?: string;
  ort?: string;
  land?: string;
  geburtsdatum?: string;
  geburtsort?: string;
  geburtsland?: string;
  staatsbuergerschaft?: string;
  familienstand?: string;
  kinder?: string[];
  arbeitsmarktzugang?: string;
  socialMedia?: string[];
  profileImage?: string;
}

interface Experience {
  id: string;
  companies: string[];
  position: string[];
  startMonth: string | null;
  startYear: string | null;
  endMonth: string | null;
  endYear: string | null;
  isCurrent: boolean;
  aufgabenbereiche: string[];
  zusatzangaben?: string;
  leasingCompaniesList?: string[];
}

interface Education {
  id: string;
  institution: string[];
  ausbildungsart: string[];
  abschluss: string[];
  startMonth: string | null;
  startYear: string | null;
  endMonth: string | null;
  endYear: string | null;
  isCurrent: boolean;
  zusatzangaben?: string;
}

interface BetterLetterCVData {
  personalData: PersonalData;
  berufserfahrung: Experience[];
  ausbildung: Education[];
  skills: string[];
  softskills: string[];
}

type TemplateType = 'classic' | 'modern' | 'minimal' | 'creative';

export function mapBetterLetterToDesigner(
  cv: BetterLetterCVData,
  templateName: TemplateType = 'classic'
): LayoutElement[] {
  switch (templateName) {
    case 'classic':
      return mapClassicTemplate(cv);
    case 'modern':
      return mapModernTemplate(cv);
    case 'minimal':
      return mapMinimalTemplate(cv);
    case 'creative':
      return mapCreativeTemplate(cv);
    default:
      return mapClassicTemplate(cv);
  }
}

function mapClassicTemplate(cv: BetterLetterCVData): LayoutElement[] {
  const sections: LayoutElement[] = [];

  // Header with personal data (0, 0, 600, 120)
  const personalInfo = buildPersonalInfo(cv.personalData);
  if (personalInfo) {
    sections.push({
      id: "header",
      type: "profil",
      title: "Persönliche Daten",
      content: personalInfo,
      x: 0,
      y: 0,
      width: 600,
      height: 120
    });
  }

  // Photo (top right, 500, 10, 80, 80)
  if (cv.personalData.profileImage) {
    sections.push({
      id: "photo",
      type: "photo",
      title: "",
      content: cv.personalData.profileImage,
      x: 500,
      y: 10,
      width: 80,
      height: 80
    });
  }

  // Experience (0, 140, 600, 250)
  const experienceContent = buildExperienceContent(cv.berufserfahrung);
  if (experienceContent) {
    sections.push({
      id: "experience",
      type: "erfahrung",
      title: "Berufserfahrung",
      content: experienceContent,
      x: 0,
      y: 140,
      width: 600,
      height: 250
    });
  }

  // Education (0, 410, 600, 150)
  const educationContent = buildEducationContent(cv.ausbildung);
  if (educationContent) {
    sections.push({
      id: "education",
      type: "ausbildung",
      title: "Ausbildung",
      content: educationContent,
      x: 0,
      y: 410,
      width: 600,
      height: 150
    });
  }

  // Skills (0, 580, 600, 100)
  if (cv.skills.length > 0) {
    sections.push({
      id: "skills",
      type: "kenntnisse",
      title: "Fachkompetenzen",
      content: cv.skills.join(', '),
      x: 0,
      y: 580,
      width: 600,
      height: 100
    });
  }

  // Soft Skills (0, 700, 600, 80)
  if (cv.softskills.length > 0) {
    sections.push({
      id: "softskills",
      type: "softskills",
      title: "Persönliche Kompetenzen",
      content: cv.softskills.join(', '),
      x: 0,
      y: 700,
      width: 600,
      height: 80
    });
  }

  return sections;
}

function mapModernTemplate(cv: BetterLetterCVData): LayoutElement[] {
  const sections: LayoutElement[] = [];

  // SIDEBAR (Left Column - 160px wide)
  
  // Photo in sidebar (20, 20, 160, 160)
  if (cv.personalData.profileImage) {
    sections.push({
      id: "sidebar-photo",
      type: "photo",
      title: "",
      content: cv.personalData.profileImage,
      x: 20,
      y: 20,
      width: 160,
      height: 160
    });
  }

  // Contact in sidebar (20, 200, 160, 120)
  const contactInfo = buildContactInfo(cv.personalData);
  if (contactInfo) {
    sections.push({
      id: "sidebar-contact",
      type: "profil",
      title: "Kontakt",
      content: contactInfo,
      x: 20,
      y: 200,
      width: 160,
      height: 120
    });
  }

  // Skills in sidebar (20, 340, 160, 200)
  if (cv.skills.length > 0) {
    sections.push({
      id: "sidebar-skills",
      type: "kenntnisse",
      title: "Skills",
      content: cv.skills.join(', '),
      x: 20,
      y: 340,
      width: 160,
      height: 200
    });
  }

  // Soft Skills in sidebar (20, 560, 160, 120)
  if (cv.softskills.length > 0) {
    sections.push({
      id: "sidebar-softskills",
      type: "softskills",
      title: "Soft Skills",
      content: cv.softskills.join(', '),
      x: 20,
      y: 560,
      width: 160,
      height: 120
    });
  }

  // MAIN COLUMN (Right Column - 380px wide, starts at x=200)
  
  // Profile header (200, 20, 380, 100)
  const profileSummary = buildProfileSummary(cv.personalData);
  if (profileSummary) {
    sections.push({
      id: "main-header",
      type: "profil",
      title: "Profil",
      content: profileSummary,
      x: 200,
      y: 20,
      width: 380,
      height: 100
    });
  }

  // Experience in main (200, 140, 380, 300)
  const experienceContent = buildExperienceContent(cv.berufserfahrung);
  if (experienceContent) {
    sections.push({
      id: "main-experience",
      type: "erfahrung",
      title: "Berufserfahrung",
      content: experienceContent,
      x: 200,
      y: 140,
      width: 380,
      height: 300
    });
  }

  // Education in main (200, 460, 380, 180)
  const educationContent = buildEducationContent(cv.ausbildung);
  if (educationContent) {
    sections.push({
      id: "main-education",
      type: "ausbildung",
      title: "Ausbildung",
      content: educationContent,
      x: 200,
      y: 460,
      width: 380,
      height: 180
    });
  }

  return sections;
}

function mapMinimalTemplate(cv: BetterLetterCVData): LayoutElement[] {
  const sections: LayoutElement[] = [];

  // Minimal header with contact only (0, 0, 600, 80)
  const contactInfo = buildContactInfo(cv.personalData);
  if (contactInfo) {
    sections.push({
      id: "minimal-header",
      type: "profil",
      title: "Kontakt",
      content: contactInfo,
      x: 0,
      y: 0,
      width: 600,
      height: 80
    });
  }

  // Experience takes most space (0, 100, 600, 300)
  const experienceContent = buildExperienceContent(cv.berufserfahrung);
  if (experienceContent) {
    sections.push({
      id: "minimal-experience",
      type: "erfahrung",
      title: "Berufserfahrung",
      content: experienceContent,
      x: 0,
      y: 100,
      width: 600,
      height: 300
    });
  }

  // Skills inline left (0, 420, 300, 80)
  if (cv.skills.length > 0) {
    sections.push({
      id: "minimal-skills-inline",
      type: "kenntnisse",
      title: "Kompetenzen",
      content: cv.skills.join(', '),
      x: 0,
      y: 420,
      width: 300,
      height: 80
    });
  }

  // Education inline right (320, 420, 280, 80)
  const educationContent = buildEducationContent(cv.ausbildung);
  if (educationContent) {
    sections.push({
      id: "minimal-education",
      type: "ausbildung",
      title: "Ausbildung",
      content: educationContent,
      x: 320,
      y: 420,
      width: 280,
      height: 80
    });
  }

  return sections;
}

function mapCreativeTemplate(cv: BetterLetterCVData): LayoutElement[] {
  const sections: LayoutElement[] = [];

  // LEFT SIDE (Creative positioning)
  
  // Photo left top (30, 30, 120, 120)
  if (cv.personalData.profileImage) {
    sections.push({
      id: "creative-photo",
      type: "photo",
      title: "",
      content: cv.personalData.profileImage,
      x: 30,
      y: 30,
      width: 120,
      height: 120
    });
  }

  // Profile below photo (30, 170, 180, 100)
  const profileSummary = buildProfileSummary(cv.personalData);
  if (profileSummary) {
    sections.push({
      id: "creative-profile",
      type: "profil",
      title: "Profil",
      content: profileSummary,
      x: 30,
      y: 170,
      width: 180,
      height: 100
    });
  }

  // Contact left bottom (30, 290, 180, 120)
  const contactInfo = buildContactInfo(cv.personalData);
  if (contactInfo) {
    sections.push({
      id: "creative-contact",
      type: "profil",
      title: "Kontakt",
      content: contactInfo,
      x: 30,
      y: 290,
      width: 180,
      height: 120
    });
  }

  // Skills left lower (30, 430, 180, 150)
  if (cv.skills.length > 0) {
    sections.push({
      id: "creative-skills",
      type: "kenntnisse",
      title: "Skills",
      content: cv.skills.join(', '),
      x: 30,
      y: 430,
      width: 180,
      height: 150
    });
  }

  // RIGHT SIDE (Main content)
  
  // Experience right top (230, 30, 350, 280)
  const experienceContent = buildExperienceContent(cv.berufserfahrung);
  if (experienceContent) {
    sections.push({
      id: "creative-experience",
      type: "erfahrung",
      title: "Berufserfahrung",
      content: experienceContent,
      x: 230,
      y: 30,
      width: 350,
      height: 280
    });
  }

  // Education right middle (230, 330, 350, 150)
  const educationContent = buildEducationContent(cv.ausbildung);
  if (educationContent) {
    sections.push({
      id: "creative-education",
      type: "ausbildung",
      title: "Ausbildung",
      content: educationContent,
      x: 230,
      y: 330,
      width: 350,
      height: 150
    });
  }

  // Soft Skills right bottom (230, 500, 350, 100)
  if (cv.softskills.length > 0) {
    sections.push({
      id: "creative-softskills",
      type: "softskills",
      title: "Persönliche Kompetenzen",
      content: cv.softskills.join(', '),
      x: 230,
      y: 500,
      width: 350,
      height: 100
    });
  }

  return sections;
}

function buildPersonalInfo(personalData: PersonalData): string {
  const info = [];
  
  // Full name
  const fullName = [personalData.titel, personalData.vorname, personalData.nachname]
    .filter(Boolean)
    .join(' ');
  if (fullName) info.push(fullName);
  
  // Contact details
  if (personalData.email) info.push(`📧 ${personalData.email}`);
  if (personalData.telefon) {
    const phone = `${personalData.telefonVorwahl || ''} ${personalData.telefon}`.trim();
    info.push(`📞 ${phone}`);
  }
  
  // Address
  const address = [personalData.adresse, personalData.plz, personalData.ort, personalData.land]
    .filter(Boolean)
    .join(', ');
  if (address) info.push(`📍 ${address}`);
  
  // Birth info
  if (personalData.geburtsdatum) info.push(`🎂 ${personalData.geburtsdatum}`);
  if (personalData.geburtsort) info.push(`🏠 ${personalData.geburtsort}`);
  
  // Additional info
  if (personalData.familienstand) info.push(`👨‍👩‍👧‍👦 ${personalData.familienstand}`);
  if (personalData.kinder && personalData.kinder.length > 0) {
    info.push(`👶 Kinder: ${personalData.kinder.join(', ')}`);
  }
  if (personalData.socialMedia && personalData.socialMedia.length > 0) {
    info.push(`🌐 ${personalData.socialMedia.join(', ')}`);
  }

  return info.join('\n');
}

function buildContactInfo(personalData: PersonalData): string {
  const contact = [];
  
  if (personalData.email) contact.push(`📧 ${personalData.email}`);
  if (personalData.telefon) {
    const phone = `${personalData.telefonVorwahl || ''} ${personalData.telefon}`.trim();
    contact.push(`📞 ${phone}`);
  }
  
  const address = [personalData.adresse, personalData.plz, personalData.ort, personalData.land]
    .filter(Boolean)
    .join(', ');
  if (address) contact.push(`📍 ${address}`);
  
  if (personalData.socialMedia && personalData.socialMedia.length > 0) {
    contact.push(`🌐 ${personalData.socialMedia.join(', ')}`);
  }

  return contact.join('\n');
}

function buildProfileSummary(personalData: PersonalData): string {
  const summary = [];
  
  // Name and title
  const fullName = [personalData.titel, personalData.vorname, personalData.nachname]
    .filter(Boolean)
    .join(' ');
  if (fullName) summary.push(`**${fullName}**`);
  
  // Professional summary (if available in future)
  // For now, build a basic summary from available data
  const profession = personalData.titel || 'Professional';
  summary.push(`${profession} mit umfassender Erfahrung und Expertise.`);
  
  return summary.join('\n\n');
}

function buildExperienceContent(berufserfahrung: Experience[]): string {
  if (!berufserfahrung || berufserfahrung.length === 0) {
    return '';
  }

  return berufserfahrung.map(exp => {
    const parts = [];
    
    // Position and companies
    const position = Array.isArray(exp.position) ? exp.position.join(' / ') : (exp.position || '');
    const companies = Array.isArray(exp.companies) ? exp.companies.join(' // ') : (exp.companies || '');
    
    if (position && companies) {
      parts.push(`**${position}**`);
      parts.push(`${companies}`);
    } else if (position) {
      parts.push(`**${position}**`);
    } else if (companies) {
      parts.push(`**${companies}**`);
    }
    
    // Time period
    const startDate = exp.startMonth && exp.startYear ? `${exp.startMonth}.${exp.startYear}` : exp.startYear || '';
    const endDate = exp.isCurrent ? 'heute' : 
                   (exp.endMonth && exp.endYear ? `${exp.endMonth}.${exp.endYear}` : exp.endYear || '');
    
    if (startDate || endDate) {
      const zeitraum = startDate && endDate ? `${startDate} – ${endDate}` : (startDate || endDate);
      parts.push(`*${zeitraum}*`);
    }
    
    // Leasing companies
    if (exp.leasingCompaniesList && exp.leasingCompaniesList.length > 0) {
      parts.push(`über ${exp.leasingCompaniesList.join(', ')}`);
    }
    
    let result = parts.join('\n');
    
    // Tasks (limit to 4 for space)
    if (exp.aufgabenbereiche && exp.aufgabenbereiche.length > 0) {
      const tasks = exp.aufgabenbereiche.slice(0, 4);
      result += '\n\n• ' + tasks.join('\n• ');
      if (exp.aufgabenbereiche.length > 4) {
        result += `\n• ... (+${exp.aufgabenbereiche.length - 4} weitere)`;
      }
    }
    
    // Additional info
    if (exp.zusatzangaben && exp.zusatzangaben.trim()) {
      result += '\n\n' + exp.zusatzangaben.trim();
    }
    
    return result;
  }).join('\n\n---\n\n');
}

function buildEducationContent(ausbildung: Education[]): string {
  if (!ausbildung || ausbildung.length === 0) {
    return '';
  }

  return ausbildung.map(edu => {
    const parts = [];
    
    // Education type and degree
    const ausbildungsart = Array.isArray(edu.ausbildungsart) ? edu.ausbildungsart.join(' / ') : (edu.ausbildungsart || '');
    const abschluss = Array.isArray(edu.abschluss) ? edu.abschluss.join(' / ') : (edu.abschluss || '');
    
    if (ausbildungsart && abschluss) {
      parts.push(`**${ausbildungsart}**`);
      parts.push(`${abschluss}`);
    } else if (ausbildungsart) {
      parts.push(`**${ausbildungsart}**`);
    } else if (abschluss) {
      parts.push(`**${abschluss}**`);
    }
    
    // Institution
    const institution = Array.isArray(edu.institution) ? edu.institution.join(', ') : (edu.institution || '');
    if (institution) {
      parts.push(`*${institution}*`);
    }
    
    // Time period
    const startDate = edu.startMonth && edu.startYear ? `${edu.startMonth}.${edu.startYear}` : edu.startYear || '';
    const endDate = edu.isCurrent ? 'heute' : 
                   (edu.endMonth && edu.endYear ? `${edu.endMonth}.${edu.endYear}` : edu.endYear || '');
    
    if (startDate || endDate) {
      const zeitraum = startDate && endDate ? `${startDate} – ${endDate}` : (startDate || endDate);
      parts.push(`(${zeitraum})`);
    }
    
    let result = parts.join('\n');
    
    // Additional info
    if (edu.zusatzangaben && edu.zusatzangaben.trim()) {
      result += '\n\n' + edu.zusatzangaben.trim();
    }
    
    return result;
  }).join('\n\n---\n\n');
}

export function mapBetterLetterToDesignerLegacy(cv: BetterLetterCVData): LayoutElement[] {
  console.warn('[mapBetterLetterToDesigner] Legacy function called. Use mapBetterLetterToDesigner(cv, templateName) instead.');
  return mapBetterLetterToDesigner(cv, 'classic');
}

// Export legacy function as default for backward compatibility
export default mapBetterLetterToDesignerLegacy;