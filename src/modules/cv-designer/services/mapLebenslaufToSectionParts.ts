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
    ausbildung: ctx?.ausbildung?.length || 0
  });

  const sections: CVSectionWithParts[] = [];
  let currentY = 50; // Start-Y-Position für erste Sektion
  const sectionWidth = 500;
  const sectionSpacing = 30;

  // ---- Berufserfahrung ----
  const erfArr = Array.isArray(ctx?.berufserfahrung) ? ctx.berufserfahrung : [];
  if (erfArr.length > 0) {
    // Berechne Höhe basierend auf Anzahl der Erfahrungen und Aufgaben
    const totalTasks = erfArr.reduce((sum: number, exp: any) => 
      sum + (Array.isArray(exp.aufgabenbereiche) ? exp.aufgabenbereiche.length : 0), 0
    );
    const sectionHeight = Math.max(120, 60 + (erfArr.length * 80) + (totalTasks * 16));

    const expParts: CVTextPart[] = [];
    let partY = 20; // Start-Y innerhalb der Sektion

    erfArr.forEach((exp: any, idx: number) => {
      const positionLine = Array.isArray(exp.position) ? exp.position.join(" / ") : norm(exp.position);
      const companyLine = [
        Array.isArray(exp.companies) ? exp.companies.join(" // ") : norm(exp.companies),
        (exp.leasingCompaniesList?.length ? `(über ${exp.leasingCompaniesList.join(", ")})` : "")
      ].filter(Boolean).join(" ");
      const periodLine = formatPeriod(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, !!exp.isCurrent);
      
      DBG(`Experience ${idx}:`, { 
        id: exp.id, 
        positionLine: positionLine.substring(0, 30) + '...', 
        companyLine: companyLine.substring(0, 30) + '...', 
        periodLine 
      });

      // Position (Titel)
      if (positionLine) {
        expParts.push({
          type: 'text',
          id: `pos-${exp.id}`,
          offsetX: 0,
          offsetY: partY,
          width: 350,
          text: positionLine,
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1f2937',
          fieldType: 'title',
          order: idx * 100
        });
        partY += 22;
      }

      // Unternehmen und Zeitraum in einer Zeile
      if (companyLine || periodLine) {
        if (companyLine) {
          expParts.push({
            type: 'text',
            id: `cmp-${exp.id}`,
            offsetX: 0,
            offsetY: partY,
            width: 300,
            text: companyLine,
            fontSize: 12,
            color: '#374151',
            fieldType: 'company',
            order: idx * 100 + 1
          });
        }
        
        if (periodLine) {
          expParts.push({
            type: 'text',
            id: `per-${exp.id}`,
            offsetX: 320,
            offsetY: partY,
            width: 150,
            text: periodLine,
            fontSize: 12,
            color: '#6b7280',
            fieldType: 'period',
            order: idx * 100 + 2
          });
        }
        partY += 18;
      }

      // Aufgaben als Bullet-Points
      if (Array.isArray(exp.aufgabenbereiche) && exp.aufgabenbereiche.length > 0) {
        exp.aufgabenbereiche.forEach((task: string, taskIdx: number) => {
          expParts.push({
            type: 'text',
            id: `task-${exp.id}-${taskIdx}`,
            offsetX: 20,
            offsetY: partY,
            width: 450,
            text: `• ${norm(task)}`,
            fontSize: 11,
            color: '#374151',
            lineHeight: 1.4,
            fieldType: 'bullet',
            order: idx * 100 + 10 + taskIdx
          });
          partY += 16;
        });
      }

      partY += 20; // Abstand zwischen Erfahrungen
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
      frame: { x: experienceSection.x, y: experienceSection.y, width: experienceSection.width, height: experienceSection.height }
    });
  }

  // ---- Ausbildung ----
  const eduArr = Array.isArray(ctx?.ausbildung) ? ctx.ausbildung : [];
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

      DBG(`Education ${idx}:`, { 
        id: edu.id, 
        titleLine: titleLine.substring(0, 30) + '...', 
        institutionLine: institutionLine.substring(0, 30) + '...', 
        periodLine 
      });

      // Titel (Ausbildungsart + Abschluss)
      if (titleLine) {
        eduParts.push({
          type: 'text',
          id: `edu-title-${edu.id}`,
          offsetX: 0,
          offsetY: partY,
          width: 350,
          text: titleLine,
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1f2937',
          fieldType: 'title',
          order: idx * 100
        });
        partY += 22;
      }

      // Institution und Zeitraum
      if (institutionLine || periodLine) {
        if (institutionLine) {
          eduParts.push({
            type: 'text',
            id: `edu-inst-${edu.id}`,
            offsetX: 0,
            offsetY: partY,
            width: 300,
            text: institutionLine,
            fontSize: 12,
            fontStyle: 'italic',
            color: '#374151',
            fieldType: 'institution',
            order: idx * 100 + 1
          });
        }
        
        if (periodLine) {
          eduParts.push({
            type: 'text',
            id: `edu-per-${edu.id}`,
            offsetX: 320,
            offsetY: partY,
            width: 150,
            text: periodLine,
            fontSize: 12,
            color: '#6b7280',
            fieldType: 'period',
            order: idx * 100 + 2
          });
        }
        partY += 18;
      }

      // Zusatzangaben
      if (edu.zusatzangaben?.trim()) {
        eduParts.push({
          type: 'text',
          id: `edu-note-${edu.id}`,
          offsetX: 0,
          offsetY: partY,
          width: 470,
          text: norm(edu.zusatzangaben),
          fontSize: 11,
          color: '#6b7280',
          lineHeight: 1.4,
          fieldType: 'note',
          order: idx * 100 + 3
        });
        partY += 20;
      }

      partY += 15; // Abstand zwischen Ausbildungen
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
      frame: { x: educationSection.x, y: educationSection.y, width: educationSection.width, height: educationSection.height }
    });
  }

  // ---- Personal Data Sections ----
  const pd = ctx?.personalData ?? {};
  if (pd.summary?.trim()) {
    const profileSection: CVSectionWithParts = {
      id: 'profile',
      type: 'profil',
      title: 'Profil',
      content: '',
      x: 50,
      y: currentY,
      width: sectionWidth,
      height: 80,
      sectionType: 'profile',
      isVisible: true,
      parts: [{
        type: 'text',
        id: 'profile-summary',
        offsetX: 0,
        offsetY: 20,
        width: 470,
        text: norm(pd.summary),
        fontSize: 12,
        color: '#374151',
        lineHeight: 1.5,
        fieldType: 'content',
        order: 0
      }]
    };
    
    sections.push(profileSection);
    currentY += 80 + sectionSpacing;
    DBG('Created profile section:', { summaryLength: pd.summary.length });
  }

  if (pd.skillsSummary?.trim()) {
    const skillsSection: CVSectionWithParts = {
      id: 'skills',
      type: 'kenntnisse',
      title: 'Fachliche Kompetenzen',
      content: '',
      x: 50,
      y: currentY,
      width: sectionWidth,
      height: 60,
      sectionType: 'skills',
      isVisible: true,
      parts: [{
        type: 'text',
        id: 'skills-summary',
        offsetX: 0,
        offsetY: 20,
        width: 470,
        text: norm(pd.skillsSummary),
        fontSize: 12,
        color: '#374151',
        lineHeight: 1.4,
        fieldType: 'content',
        order: 0
      }]
    };
    
    sections.push(skillsSection);
    currentY += 60 + sectionSpacing;
    DBG('Created skills section:', { skillsLength: pd.skillsSummary.length });
  }

  if (pd.softSkillsSummary?.trim()) {
    const softSkillsSection: CVSectionWithParts = {
      id: 'softskills',
      type: 'softskills',
      title: 'Persönliche Kompetenzen',
      content: '',
      x: 50,
      y: currentY,
      width: sectionWidth,
      height: 60,
      sectionType: 'softskills',
      isVisible: true,
      parts: [{
        type: 'text',
        id: 'softskills-summary',
        offsetX: 0,
        offsetY: 20,
        width: 470,
        text: norm(pd.softSkillsSummary),
        fontSize: 12,
        color: '#374151',
        lineHeight: 1.4,
        fieldType: 'content',
        order: 0
      }]
    };
    
    sections.push(softSkillsSection);
    currentY += 60 + sectionSpacing;
    DBG('Created softskills section:', { softSkillsLength: pd.softSkillsSummary.length });
  }

  DBG('mapLebenslaufToSectionParts output:', { 
    sectionsCount: sections.length,
    sections: sections.map(s => ({ 
      id: s.id, 
      title: s.title, 
      partsCount: s.parts.length,
      frame: { x: s.x, y: s.y, width: s.width, height: s.height }
    }))
  });

  return sections;
}