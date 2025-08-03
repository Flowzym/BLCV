import { LayoutElement } from "../types/section";

// Import types from the correct path
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

/**
 * Adapter: BetterLetter CV-Daten -> CV-Designer Sections
 * 
 * Konvertiert die Datenstruktur aus LebenslaufContext in LayoutElement[]
 * für die Verwendung in CVPreview.
 */
export function mapBetterLetterToDesigner(cv: {
  personalData: PersonalData;
  berufserfahrung: Experience[];
  ausbildung: Education[];
  skills: string[];
  softskills: string[];
}): LayoutElement[] {
  const sections: LayoutElement[] = [];

  // 1. Persönliche Daten
  if (cv.personalData && Object.keys(cv.personalData).length > 0) {
    const personalInfo = [];
    
    // Name zusammensetzen
    const fullName = [cv.personalData.titel, cv.personalData.vorname, cv.personalData.nachname]
      .filter(Boolean)
      .join(' ');
    if (fullName) personalInfo.push(`Name: ${fullName}`);
    
    // Kontaktdaten
    if (cv.personalData.email) personalInfo.push(`E-Mail: ${cv.personalData.email}`);
    if (cv.personalData.telefon) {
      const phone = `${cv.personalData.telefonVorwahl || ''} ${cv.personalData.telefon}`.trim();
      personalInfo.push(`Telefon: ${phone}`);
    }
    
    // Adresse
    const address = [cv.personalData.adresse, cv.personalData.plz, cv.personalData.ort, cv.personalData.land]
      .filter(Boolean)
      .join(', ');
    if (address) personalInfo.push(`Adresse: ${address}`);
    
    // Geburtsdaten
    if (cv.personalData.geburtsdatum) personalInfo.push(`Geburtsdatum: ${cv.personalData.geburtsdatum}`);
    if (cv.personalData.geburtsort) personalInfo.push(`Geburtsort: ${cv.personalData.geburtsort}`);
    if (cv.personalData.geburtsland) personalInfo.push(`Geburtsland: ${cv.personalData.geburtsland}`);
    
    // Weitere Daten
    if (cv.personalData.staatsbuergerschaft) personalInfo.push(`Staatsbürgerschaft: ${cv.personalData.staatsbuergerschaft}`);
    if (cv.personalData.familienstand) personalInfo.push(`Familienstand: ${cv.personalData.familienstand}`);
    if (cv.personalData.kinder && cv.personalData.kinder.length > 0) {
      personalInfo.push(`Kinder: ${cv.personalData.kinder.join(', ')}`);
    }
    if (cv.personalData.arbeitsmarktzugang) personalInfo.push(`Arbeitsmarktzugang: ${cv.personalData.arbeitsmarktzugang}`);
    if (cv.personalData.socialMedia && cv.personalData.socialMedia.length > 0) {
      personalInfo.push(`Social Media: ${cv.personalData.socialMedia.join(', ')}`);
    }

    if (personalInfo.length > 0) {
      sections.push({
        id: "personal-data",
        type: "profil",
        title: "Persönliche Daten",
        content: personalInfo.join('\n'),
        x: 0,
        y: 0,
        width: 600,
        height: 200
      });
    }
  }

  // 2. Berufserfahrung
  if (cv.berufserfahrung && cv.berufserfahrung.length > 0) {
    const experienceContent = cv.berufserfahrung.map(e => {
      const parts = [];
      
      // Position und Unternehmen
      const position = Array.isArray(e.position) ? e.position.join(' / ') : (e.position || '');
      const companies = Array.isArray(e.companies) ? e.companies.join(' // ') : (e.companies || '');
      
      if (position && companies) {
        parts.push(`${position} @ ${companies}`);
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
      
      // Leasing-Unternehmen
      if (e.leasingCompaniesList && e.leasingCompaniesList.length > 0) {
        parts.push(`über ${e.leasingCompaniesList.join(', ')}`);
      }
      
      let result = parts.join(' ');
      
      // Aufgabenbereiche
      if (e.aufgabenbereiche && e.aufgabenbereiche.length > 0) {
        result += '\n• ' + e.aufgabenbereiche.join('\n• ');
      }
      
      // Zusatzangaben
      if (e.zusatzangaben && e.zusatzangaben.trim()) {
        result += '\n' + e.zusatzangaben.trim();
      }
      
      return result;
    }).join('\n\n');

    sections.push({
      id: "work-experience",
      type: "erfahrung",
      title: "Berufserfahrung",
      content: experienceContent,
      x: 0,
      y: 220,
      width: 600,
      height: 300
    });
  }

  // 3. Ausbildung
  if (cv.ausbildung && cv.ausbildung.length > 0) {
    const educationContent = cv.ausbildung.map(a => {
      const parts = [];
      
      // Ausbildungsart und Abschluss
      const ausbildungsart = Array.isArray(a.ausbildungsart) ? a.ausbildungsart.join(' / ') : (a.ausbildungsart || '');
      const abschluss = Array.isArray(a.abschluss) ? a.abschluss.join(' / ') : (a.abschluss || '');
      
      if (ausbildungsart && abschluss) {
        parts.push(`${ausbildungsart} – ${abschluss}`);
      } else if (ausbildungsart) {
        parts.push(ausbildungsart);
      } else if (abschluss) {
        parts.push(abschluss);
      }
      
      // Institution
      const institution = Array.isArray(a.institution) ? a.institution.join(', ') : (a.institution || '');
      if (institution) {
        parts.push(`@ ${institution}`);
      }
      
      // Zeitraum
      const startDate = a.startMonth && a.startYear ? `${a.startMonth}.${a.startYear}` : a.startYear || '';
      const endDate = a.isCurrent ? 'heute' : 
                     (a.endMonth && a.endYear ? `${a.endMonth}.${a.endYear}` : a.endYear || '');
      
      if (startDate || endDate) {
        const zeitraum = startDate && endDate ? `${startDate} – ${endDate}` : (startDate || endDate);
        parts.push(`(${zeitraum})`);
      }
      
      let result = parts.join(' ');
      
      // Zusatzangaben
      if (a.zusatzangaben && a.zusatzangaben.trim()) {
        result += '\n' + a.zusatzangaben.trim();
      }
      
      return result;
    }).join('\n\n');

    sections.push({
      id: "education",
      type: "ausbildung",
      title: "Ausbildung",
      content: educationContent,
      x: 0,
      y: 540,
      width: 600,
      height: 200
    });
  }

  // 4. Fachkompetenzen
  if (cv.skills && cv.skills.length > 0) {
    sections.push({
      id: "skills",
      type: "kenntnisse",
      title: "Fachkompetenzen",
      content: cv.skills.join(', '),
      x: 0,
      y: 760,
      width: 600,
      height: 100
    });
  }

  // 5. Soft Skills
  if (cv.softskills && cv.softskills.length > 0) {
    sections.push({
      id: "softskills",
      type: "softskills",
      title: "Soft Skills",
      content: cv.softskills.join(', '),
      x: 0,
      y: 880,
      width: 600,
      height: 100
    });
  }

  return sections;
}