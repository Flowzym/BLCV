import type { CVSection, CVTextPart, CVSectionWithParts } from "../types/section";
import type { SectionType } from "../store/designerStore";

const DBG = (msg: string, ...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
    console.log('[DESIGNER]', msg, ...args);
  } else {
    console.log('[DESIGNER*]', msg, ...args);
  }
};

function norm(v: any): string {
  if (v == null) return "";
  if (Array.isArray(v)) {
    return v.map(item => String(item ?? "").trim()).filter(Boolean).join(", ");
  }
  return String(v ?? "").trim().replace(/\s+/g, " ");
}

function formatPeriod(startMonth: string | null, startYear: string | null, endMonth: string | null, endYear: string | null, isCurrent: boolean): string {
  const fmt = (m?: string | null, y?: string | null) => {
    if (!y || y === 'null') return '';
    const month = m && m !== 'null' ? m.padStart(2, '0') : '';
    return month ? `${month}.${y}` : y;
  };
  
  const start = fmt(startMonth, startYear);
  const end = isCurrent ? 'heute' : fmt(endMonth, endYear);
  
  if (!start && !end) return '';
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

export function mapLebenslaufToSectionParts(ctx: any): CVSectionWithParts[] {
  DBG('mapLebenslaufToSectionParts input:', {
    personalData: ctx?.personalData ? Object.keys(ctx.personalData) : 'none',
    berufserfahrung: ctx?.berufserfahrung?.length || 0,
    ausbildung: ctx?.ausbildung?.length || 0,
    fullContext: ctx
  });

  const sections: CVSectionWithParts[] = [];
  let currentY = 100; // Start-Y-Position für erste Sektion (weiter unten, damit nicht abgeschnitten)
  const sectionWidth = 500;
  const sectionSpacing = 30;

  // ---- Berufserfahrung ----
  const erfArr = Array.isArray(ctx?.berufserfahrung) ? ctx.berufserfahrung : [];
  DBG('Berufserfahrung array:', {
    length: erfArr.length,
    items: erfArr.map((exp: any, idx: number) => ({
      index: idx,
      id: exp?.id,
      position: exp?.position,
      companies: exp?.companies,
      aufgabenbereiche: exp?.aufgabenbereiche,
      hasData: !!(exp?.position || exp?.companies || exp?.aufgabenbereiche?.length)
    }))
  });
  
  if (erfArr.length > 0) {
    // Berechne Höhe basierend auf Anzahl der Erfahrungen und Aufgaben
    const totalTasks = erfArr.reduce((sum: number, exp: any) => 
      sum + (Array.isArray(exp.aufgabenbereiche) ? exp.aufgabenbereiche.length : 0), 0
    );
    const sectionHeight = Math.max(120, 60 + (erfArr.length * 80) + (totalTasks * 16));
    
    DBG('Experience section calculation:', {
      totalExperiences: erfArr.length,
      totalTasks,
      calculatedHeight: sectionHeight
    });

    const expParts: CVTextPart[] = [];
    let partY = 20; // Start-Y innerhalb der Sektion

    erfArr.forEach((exp: any, idx: number) => {
      const positionLine = Array.isArray(exp.position) ? exp.position.join(" / ") : norm(exp.position);
      const companyLine = [
        Array.isArray(exp.companies) ? exp.companies.join(" // ") : norm(exp.companies),
        (exp.leasingCompaniesList?.length ? `(über ${exp.leasingCompaniesList.join(", ")})` : "")
      ].filter(Boolean).join(" ");
      const periodLine = formatPeriod(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, !!exp.isCurrent);
      
      DBG(`Processing Experience ${idx}:`, { 
        id: exp.id,
        rawPosition: exp.position,
        rawCompanies: exp.companies,
        rawTasks: exp.aufgabenbereiche,
        processedPositionLine: positionLine,
        processedCompanyLine: companyLine,
        processedPeriodLine: periodLine,
        hasPositionData: !!positionLine,
        hasCompanyData: !!companyLine,
        hasPeriodData: !!periodLine,
        currentPartY: partY
      });

      // Zeitraum (über Position)
      if (periodLine) {
        DBG(`Creating period part for exp ${idx}:`, {
          text: periodLine,
          offsetX: 0,
          offsetY: partY,
          width: 350
        });
        expParts.push({
          type: 'text',
          id: `per-${exp.id}`,
          offsetX: 0,
          offsetY: partY,
          width: 350,
          text: periodLine,
          fontSize: 14,
          color: '#000000',
          fieldType: 'period',
          order: idx * 100
        });
        partY += 22;
      }

      // Position (Titel)
      if (positionLine) {
        DBG(`Creating position part for exp ${idx}:`, {
          text: positionLine,
          offsetX: 0,
          offsetY: partY,
          width: 350
        });
        expParts.push({
          type: 'text',
          id: `pos-${exp.id}`,
          offsetX: 0,
          offsetY: partY,
          width: 350,
          text: positionLine,
          fontSize: 18,
          fontWeight: 'bold',
          color: '#000000',
          fieldType: 'title',
          order: idx * 100 + 1
        });
        partY += 26;
      }

      // Unternehmen
      if (companyLine) {
        DBG(`Creating company part for exp ${idx}:`, {
          text: companyLine,
          offsetX: 0,
          offsetY: partY,
          width: 350
        });
        expParts.push({
          type: 'text',
          id: `cmp-${exp.id}`,
          offsetX: 0,
          offsetY: partY,
          width: 350,
          text: companyLine,
          fontSize: 14,
          color: '#000000',
          fieldType: 'company',
          order: idx * 100 + 2
        });
        partY += 22;
      }

      // Aufgaben als Bullet-Points
      if (Array.isArray(exp.aufgabenbereiche) && exp.aufgabenbereiche.length > 0) {
        DBG(`Creating ${exp.aufgabenbereiche.length} task parts for exp ${idx}:`, exp.aufgabenbereiche);
        exp.aufgabenbereiche.forEach((task: string, taskIdx: number) => {
          DBG(`Creating task part ${taskIdx} for exp ${idx}:`, {
            text: `• ${norm(task)}`,
            offsetX: 20,
            offsetY: partY,
            width: 450
          });
          expParts.push({
            type: 'text',
            id: `task-${exp.id}-${taskIdx}`,
            offsetX: 20,
            offsetY: partY,
            width: 450,
            text: `• ${norm(task)}`,
            fontSize: 13,
            color: '#000000',
            lineHeight: 1.4,
            fieldType: 'bullet',
            order: idx * 100 + 10 + taskIdx
          });
          partY += 20;
        });
      }

      partY += 25; // Abstand zwischen Erfahrungen
    });

    DBG('Final experience parts created:', {
      totalParts: expParts.length,
      partDetails: expParts.map(part => ({
        id: part.id,
        fieldType: part.fieldType,
        text: part.text.substring(0, 50) + '...',
        position: { x: part.offsetX, y: part.offsetY },
        size: { width: part.width, fontSize: part.fontSize }
      }))
    });

    const experienceSection: CVSectionWithParts = {
      id: 'experience',
      type: 'erfahrung',
      title: 'Berufserfahrung',
      content: '', // Wird aus parts generiert
      x: 50,
      y: currentY,
      width: sectionWidth,
      height: sectionHeight,
      sectionType: 'experience',
      isVisible: true,
      parts: expParts
    };

    sections.push(experienceSection);
    currentY += sectionHeight + sectionSpacing;
    DBG('Created experience section:', { 
      partsCount: expParts.length, 
      frame: { x: experienceSection.x, y: experienceSection.y, width: experienceSection.width, height: experienceSection.height },
      sectionData: experienceSection
    });
  }

  // ---- Ausbildung ----
  const eduArr = Array.isArray(ctx?.ausbildung) ? ctx.ausbildung : [];
  DBG('Ausbildung array:', {
    length: eduArr.length,
    items: eduArr.map((edu: any, idx: number) => ({
      index: idx,
      id: edu?.id,
      abschluss: edu?.abschluss,
      institution: edu?.institution,
      hasData: !!(edu?.abschluss || edu?.institution)
    }))
  });
  
  if (eduArr.length > 0) {
    const sectionHeight = Math.max(100, 60 + (eduArr.length * 70));
    const eduParts: CVTextPart[] = [];
    let partY = 20;

    eduArr.forEach((edu: any, idx: number) => {
      const titleLine = [
        Array.isArray(edu.ausbildungsart) ? edu.ausbildungsart.join(" / ") : norm(edu.ausbildungsart),
        Array.isArray(edu.abschluss) ? edu.abschluss.join(" / ") : norm(edu.abschluss)
      ].filter(Boolean).join(" - ").trim();
      const institutionLine = Array.isArray(edu.institution) ? edu.institution.join(", ") : norm(edu.institution);
      const periodLine = formatPeriod(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, !!edu.isCurrent);

      DBG(`Processing Education ${idx}:`, { 
        id: edu.id,
        rawAusbildungsart: edu.ausbildungsart,
        rawAbschluss: edu.abschluss,
        rawInstitution: edu.institution,
        processedTitleLine: titleLine,
        processedInstitutionLine: institutionLine,
        processedPeriodLine: periodLine,
        hasTitleData: !!titleLine,
        hasInstitutionData: !!institutionLine,
        hasPeriodData: !!periodLine,
        currentPartY: partY
      });

      // Titel (Ausbildungsart + Abschluss)
      if (titleLine) {
        DBG(`Creating education title part for edu ${idx}:`, {
          text: titleLine,
          offsetX: 0,
          offsetY: partY,
          width: 350
        });
        eduParts.push({
          type: 'text',
          id: `edu-title-${edu.id}`,
          offsetX: 0,
          offsetY: partY,
          width: 350,
          text: titleLine,
          fontSize: 18,
          fontWeight: 'bold',
          color: '#000000',
          fieldType: 'title',
          order: idx * 100
        });
        partY += 26;
      }

      // Institution und Zeitraum
      if (institutionLine || periodLine) {
        if (institutionLine) {
          DBG(`Creating institution part for edu ${idx}:`, {
            text: institutionLine,
            offsetX: 0,
            offsetY: partY,
            width: 300
          });
          eduParts.push({
            type: 'text',
            id: `edu-inst-${edu.id}`,
            offsetX: 0,
            offsetY: partY,
            width: 300,
            text: institutionLine,
            fontSize: 14,
            fontStyle: 'italic',
            color: '#000000',
            fieldType: 'institution',
            order: idx * 100 + 1
          });
        }
        
        if (periodLine) {
          DBG(`Creating period part for edu ${idx}:`, {
            text: periodLine,
            offsetX: 320,
            offsetY: partY,
            width: 150
          });
          eduParts.push({
            type: 'text',
            id: `edu-per-${edu.id}`,
            offsetX: 320,
            offsetY: partY,
            width: 150,
            text: periodLine,
            fontSize: 14,
            color: '#000000',
            fieldType: 'period',
            order: idx * 100 + 2
          });
        }
        partY += 22;
      }

      // Zusatzangaben
      if (edu.zusatzangaben?.trim()) {
        DBG(`Creating note part for edu ${idx}:`, {
          text: norm(edu.zusatzangaben),
          offsetX: 0,
          offsetY: partY,
          width: 470
        });
        eduParts.push({
          type: 'text',
          id: `edu-note-${edu.id}`,
          offsetX: 0,
          offsetY: partY,
          width: 470,
          text: norm(edu.zusatzangaben),
          fontSize: 13,
          color: '#000000',
          lineHeight: 1.4,
          fieldType: 'note',
          order: idx * 100 + 3
        });
        partY += 24;
      }

      partY += 20; // Abstand zwischen Ausbildungen
    });

    DBG('Final education parts created:', {
      totalParts: eduParts.length,
      partDetails: eduParts.map(part => ({
        id: part.id,
        fieldType: part.fieldType,
        text: part.text.substring(0, 50) + '...',
        position: { x: part.offsetX, y: part.offsetY },
        size: { width: part.width, fontSize: part.fontSize }
      }))
    });

    const educationSection: CVSectionWithParts = {
      id: 'education',
      type: 'ausbildung',
      title: 'Ausbildung',
      content: '',
      x: 50,
      y: currentY,
      width: sectionWidth,
      height: sectionHeight,
      sectionType: 'education',
      isVisible: true,
      parts: eduParts
    };

    sections.push(educationSection);
    currentY += sectionHeight + sectionSpacing;
    DBG('Created education section:', { 
      partsCount: eduParts.length,
      frame: { x: educationSection.x, y: educationSection.y, width: educationSection.width, height: educationSection.height },
      sectionData: educationSection
    });
  }

  // ---- Personal Data Sections ----
  const pd = ctx?.personalData ?? {};
  DBG('Personal data:', {
    summary: pd.summary?.substring(0, 50) + '...',
    skillsSummary: pd.skillsSummary?.substring(0, 50) + '...',
    softSkillsSummary: pd.softSkillsSummary?.substring(0, 50) + '...',
    hasSummary: !!pd.summary?.trim(),
    hasSkills: !!pd.skillsSummary?.trim(),
    hasSoftSkills: !!pd.softSkillsSummary?.trim()
  });
  
  if (pd.summary?.trim()) {
    DBG('Creating profile section with summary:', pd.summary);
    const profileSection: CVSectionWithParts = {
      id: 'profile',
      type: 'profil',
      title: 'Profil',
      content: '',
      x: 50,
      y: currentY,
      width: sectionWidth,
      height: 100,
      sectionType: 'profile',
      isVisible: true,
      parts: [{
        type: 'text',
        id: 'profile-summary',
        offsetX: 0,
        offsetY: 30,
        width: 470,
        text: norm(pd.summary),
        fontSize: 14,
        color: '#000000',
        lineHeight: 1.5,
        fieldType: 'content',
        order: 0
      }]
    };
    
    sections.push(profileSection);
    currentY += 100 + sectionSpacing;
    DBG('Created profile section:', { 
      summaryLength: pd.summary.length,
      sectionData: profileSection
    });
  }

  if (pd.skillsSummary?.trim()) {
    DBG('Creating skills section with summary:', pd.skillsSummary);
    const skillsSection: CVSectionWithParts = {
      id: 'skills',
      type: 'kenntnisse',
      title: 'Fachliche Kompetenzen',
      content: '',
      x: 50,
      y: currentY,
      width: sectionWidth,
      height: 80,
      sectionType: 'skills',
      isVisible: true,
      parts: [{
        type: 'text',
        id: 'skills-summary',
        offsetX: 0,
        offsetY: 30,
        width: 470,
        text: norm(pd.skillsSummary),
        fontSize: 14,
        color: '#000000',
        lineHeight: 1.4,
        fieldType: 'content',
        order: 0
      }]
    };
    
    sections.push(skillsSection);
    currentY += 80 + sectionSpacing;
    DBG('Created skills section:', { 
      skillsLength: pd.skillsSummary.length,
      sectionData: skillsSection
    });
  }

  if (pd.softSkillsSummary?.trim()) {
    DBG('Creating softskills section with summary:', pd.softSkillsSummary);
    const softSkillsSection: CVSectionWithParts = {
      id: 'softskills',
      type: 'softskills',
      title: 'Persönliche Kompetenzen',
      content: '',
      x: 50,
      y: currentY,
      width: sectionWidth,
      height: 80,
      sectionType: 'softskills',
      isVisible: true,
      parts: [{
        type: 'text',
        id: 'softskills-summary',
        offsetX: 0,
        offsetY: 30,
        width: 470,
        text: norm(pd.softSkillsSummary),
        fontSize: 14,
        color: '#000000',
        lineHeight: 1.4,
        fieldType: 'content',
        order: 0
      }]
    };
    
    sections.push(softSkillsSection);
    currentY += 80 + sectionSpacing;
    DBG('Created softskills section:', { 
      softSkillsLength: pd.softSkillsSummary.length,
      sectionData: softSkillsSection
    });
  }

  DBG('mapLebenslaufToSectionParts output:', { 
    sectionsCount: sections.length,
    sections: sections.map(s => ({ 
      id: s.id, 
      title: s.title, 
      partsCount: s.parts.length,
      frame: { x: s.x, y: s.y, width: s.width, height: s.height }
    })),
    fullSections: sections
  });

  return sections;
}