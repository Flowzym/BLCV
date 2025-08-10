import type { Section, TextPart, RepeaterPart } from "../canvas/types";
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

// Enhanced element with metadata for grouping and styling
export interface EnhancedTextPart extends TextPart {
  sectionId: string;
  sectionType: SectionType;
  field: string;
  order?: number;
  offsetX?: number;
  offsetY?: number;
  width?: number;
}

export function mapLebenslaufToSectionParts(ctx: any): Section[] {
  DBG('mapLebenslaufToSectionParts input:', {
    personalData: ctx?.personalData ? Object.keys(ctx.personalData) : 'none',
    berufserfahrung: ctx?.berufserfahrung?.length || 0,
    ausbildung: ctx?.ausbildung?.length || 0
  });

  const sections: Section[] = [];

  // ---- Berufserfahrung ----
  const erfArr = Array.isArray(ctx?.berufserfahrung) ? ctx.berufserfahrung : [];
  if (erfArr.length > 0) {
    const expItems = erfArr.map((exp: any, idx: number) => {
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

      const sectionId = `experience:${exp.id}`;
      const parts: EnhancedTextPart[] = [
        { 
          type: 'text', 
          id: `pos-${idx}`, 
          x: 40, 
          y: 40 + (idx * 200), 
          text: positionLine, 
          fontSize: 16, 
          bold: true,
          sectionId,
          sectionType: 'experience',
          field: 'title',
          order: 0,
          offsetX: 0,
          offsetY: 0,
          width: 420
        },
        { 
          type: 'text', 
          id: `cmp-${idx}`, 
          x: 40, 
          y: 62 + (idx * 200), 
          text: companyLine, 
          fontSize: 12,
          sectionId,
          sectionType: 'experience',
          field: 'company',
          order: 1,
          offsetX: 0,
          offsetY: 22,
          width: 420
        },
        { 
          type: 'text', 
          id: `per-${idx}`, 
          x: 460, 
          y: 40 + (idx * 200), 
          text: periodLine, 
          fontSize: 12,
          sectionId,
          sectionType: 'experience',
          field: 'period',
          order: 2,
          offsetX: 440,
          offsetY: 0,
          width: 120
        }
      ];

      // Tasks als separate TextParts
      if (Array.isArray(exp.aufgabenbereiche) && exp.aufgabenbereiche.length > 0) {
        exp.aufgabenbereiche.forEach((task: string, taskIdx: number) => {
          parts.push({
            type: 'text',
            id: `task-${idx}-${taskIdx}`,
            x: 60,
            y: 84 + (idx * 200) + (taskIdx * 18),
            text: `• ${norm(task)}`,
            fontSize: 11,
            sectionId,
            sectionType: 'experience',
            field: 'bullet',
            order: 10 + taskIdx,
            offsetX: 0,
            offsetY: 44 + (taskIdx * 16),
            width: 560
          });
        });
      }

      return {
        id: `exp-${idx}`,
        parts
      };
    });

    const experienceSection: Section = {
      id: 'experience',
      title: 'Berufserfahrung',
      parts: [{
        type: 'repeater',
        id: 'experience-repeater',
        items: expItems
      } as RepeaterPart]
    };

    sections.push(experienceSection);
    DBG('Created experience section:', { itemsCount: expItems.length, firstItemPartsCount: expItems[0]?.parts.length });
  }

  // ---- Ausbildung ----
  const eduArr = Array.isArray(ctx?.ausbildung) ? ctx.ausbildung : [];
  if (eduArr.length > 0) {
    const eduItems = eduArr.map((edu: any, idx: number) => {
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

      const sectionId = `education:${edu.id}`;
      const parts: EnhancedTextPart[] = [
        { 
          type: 'text', 
          id: `edu-title-${idx}`, 
          x: 40, 
          y: 40 + (idx * 120), 
          text: titleLine, 
          fontSize: 16, 
          bold: true,
          sectionId,
          sectionType: 'education',
          field: 'title',
          order: 0,
          offsetX: 0,
          offsetY: 0,
          width: 420
        },
        { 
          type: 'text', 
          id: `edu-inst-${idx}`, 
          x: 40, 
          y: 62 + (idx * 120), 
          text: institutionLine, 
          fontSize: 12,
          sectionId,
          sectionType: 'education',
          field: 'institution',
          order: 1,
          offsetX: 0,
          offsetY: 22,
          width: 420
        },
        { 
          type: 'text', 
          id: `edu-per-${idx}`, 
          x: 460, 
          y: 40 + (idx * 120), 
          text: periodLine, 
          fontSize: 12,
          sectionId,
          sectionType: 'education',
          field: 'period',
          order: 2,
          offsetX: 440,
          offsetY: 0,
          width: 120
        }
      ];

      if (edu.zusatzangaben?.trim()) {
        parts.push({
          type: 'text',
          id: `edu-note-${idx}`,
          x: 40,
          y: 84 + (idx * 120),
          text: norm(edu.zusatzangaben),
          fontSize: 11,
          sectionId,
          sectionType: 'education',
          field: 'note',
          order: 3,
          offsetX: 0,
          offsetY: 54,
          width: 560
        });
      }

      return {
        id: `edu-${idx}`,
        parts
      };
    });

    const educationSection: Section = {
      id: 'education',
      title: 'Ausbildung',
      parts: [{
        type: 'repeater',
        id: 'education-repeater',
        items: eduItems
      } as RepeaterPart]
    };

    sections.push(educationSection);
    DBG('Created education section:', { itemsCount: eduItems.length, firstItemPartsCount: eduItems[0]?.parts.length });
  }

  // ---- Personal Data Sections ----
  const pd = ctx?.personalData ?? {};
  if (pd.summary?.trim()) {
    sections.push({
      id: 'profile',
      title: 'Profil',
      parts: [{
        type: 'text',
        id: 'profile-summary',
        x: 40,
        y: 0,
        text: norm(pd.summary),
        fontSize: 12,
        sectionId: 'profile:main',
        sectionType: 'profile',
        field: 'content',
        order: 0,
        offsetX: 0,
        offsetY: 0,
        width: 560
      } as TextPart]
    });
    DBG('Created profile section:', { summaryLength: pd.summary.length });
  }

  if (pd.skillsSummary?.trim()) {
    sections.push({
      id: 'skills',
      title: 'Fachliche Kompetenzen',
      parts: [{
        type: 'text',
        id: 'skills-summary',
        x: 40,
        y: 0,
        text: norm(pd.skillsSummary),
        fontSize: 12,
        sectionId: 'skills:main',
        sectionType: 'skills',
        field: 'content',
        order: 0,
        offsetX: 0,
        offsetY: 0,
        width: 560
      } as TextPart]
    });
    DBG('Created skills section:', { skillsLength: pd.skillsSummary.length });
  }

  if (pd.softSkillsSummary?.trim()) {
    sections.push({
      id: 'softskills',
      title: 'Persönliche Kompetenzen',
      parts: [{
        type: 'text',
        id: 'softskills-summary',
        x: 40,
        y: 0,
        text: norm(pd.softSkillsSummary),
        fontSize: 12,
        sectionId: 'softskills:main',
        sectionType: 'softskills',
        field: 'content',
        order: 0,
        offsetX: 0,
        offsetY: 0,
        width: 560
      } as TextPart]
    });
    DBG('Created softskills section:', { softSkillsLength: pd.softSkillsSummary.length });
  }

  DBG('mapLebenslaufToSectionParts output:', { 
    sectionsCount: sections.length,
    sections: sections.map(s => ({ id: s.id, title: s.title, partsCount: s.parts.length }))
  });

  return sections;
}