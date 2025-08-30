import type { CVSection, CVTextPart, CVSectionWithParts } from "../types/section";
import type { SectionType } from "../store/designerStore";

// Layout baseline (keep in sync with FabricCanvas)
const PAGE_W = 595; // A4 width in px
const DEFAULT_MARGINS = { left: 36, right: 36 } as const;

const DBG = (msg: string, ...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
    console.log('[DESIGNER]', msg, ...args);
  }
};

// ---------- Helpers ----------
function norm(v: any): string {
  if (v == null) return "";
  if (Array.isArray(v)) {
    return v.map(item => String(item ?? "").trim()).filter(Boolean).join(", ");
  }
  return String(v ?? "").trim().replace(/\s+/g, " ");
}

function formatPeriod(
  startMonth: string | null,
  startYear: string | null,
  endMonth: string | null,
  endYear: string | null,
  isCurrent: boolean
): string {
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

// ---------- Mapper ----------
export function mapLebenslaufToSectionParts(ctx: any): CVSectionWithParts[] {
  const sections: CVSectionWithParts[] = [];
  let currentY = 120;               // Startposition auf der Seite
  const sectionWidth = Math.min(500, PAGE_W - DEFAULT_MARGINS.left - DEFAULT_MARGINS.right);
  const sectionSpacing = 30;

  // ---- Berufserfahrung ----
  const erfArr = Array.isArray(ctx?.berufserfahrung) ? ctx.berufserfahrung : [];
  if (erfArr.length > 0) {
    const totalTasks = erfArr.reduce((sum: number, exp: any) =>
      sum + (Array.isArray(exp.aufgabenbereiche) ? exp.aufgabenbereiche.length : 0), 0
    );
    const sectionHeight = Math.max(120, 60 + (erfArr.length * 80) + (totalTasks * 16));

    const expParts: CVTextPart[] = [];

    erfArr.forEach((exp: any, idx: number) => {
      const base = idx * 100;

      const positionLine = Array.isArray(exp.position) ? exp.position.join(" / ") : norm(exp.position);
      const companyLine = [
        Array.isArray(exp.companies) ? exp.companies.join(" // ") : norm(exp.companies),
        (exp.leasingCompaniesList?.length ? `(über ${exp.leasingCompaniesList.join(", ")})` : "")
      ].filter(Boolean).join(" ");
      const periodLine = formatPeriod(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, !!exp.isCurrent);

      if (periodLine) {
        expParts.push({
          type: "text",
          id: `per-${exp.id}`,
          offsetX: 0,
          offsetY: 0,                 // Flow übernimmt Vertikal-Position
          width: 350,
          text: periodLine,
          fontSize: 14,
          color: "#000000",
          fieldType: "period",
          order: base + 0,
          gapBefore: 0,
        });
      }

      if (positionLine) {
        expParts.push({
          type: "text",
          id: `pos-${exp.id}`,
          offsetX: 0,
          offsetY: 0,
          width: 350,
          text: positionLine,
          fontSize: 20,
          fontWeight: "bold",
          color: "#000000",
          fieldType: "title",
          order: base + 1,
          gapBefore: 6,
        });
      }

      if (companyLine) {
        expParts.push({
          type: "text",
          id: `cmp-${exp.id}`,
          offsetX: 0,
          offsetY: 0,
          width: 350,
          text: companyLine,
          fontSize: 16,
          color: "#000000",
          fieldType: "company",
          order: base + 2,
          gapBefore: 2,
        });
      }

      if (Array.isArray(exp.aufgabenbereiche) && exp.aufgabenbereiche.length > 0) {
        exp.aufgabenbereiche.forEach((task: string, taskIdx: number) => {
          const bulletText = `• ${norm(task)}`;
          expParts.push({
            type: "text",
            id: `task-${exp.id}-${taskIdx}`,
            offsetX: 0,                // Einzug via indentPx, nicht via offset
            offsetY: 0,
            width: 460,
            text: bulletText,
            fontSize: 15,
            color: "#000000",
            lineHeight: 1.4,
            fieldType: "bullet",
            order: base + 10 + taskIdx,
            gapBefore: taskIdx === 0 ? 6 : 2,
          });
        });
      }
    });

    const experienceSection: CVSectionWithParts = {
      id: "experience",
      type: "erfahrung",
      title: "Berufserfahrung",
      content: "",
      x: 50,
      y: currentY,
      width: sectionWidth,
      height: Math.max(sectionHeight, 160),
      sectionType: "experience",
      isVisible: true,
      parts: expParts,
      props: {
        paddingTop: 16, paddingLeft: 24, paddingRight: 24, paddingBottom: 16,
      } as any,
    };

    sections.push(experienceSection);
    currentY += experienceSection.height + sectionSpacing;
  }

  // ---- Ausbildung ----
  const eduArr = Array.isArray(ctx?.ausbildung) ? ctx.ausbildung : [];
  if (eduArr.length > 0) {
    const sectionHeight = Math.max(100, 60 + (eduArr.length * 70));
    const eduParts: CVTextPart[] = [];

    eduArr.forEach((edu: any, idx: number) => {
      const base = idx * 100;

      const titleLine = [
        Array.isArray(edu.ausbildungsart) ? edu.ausbildungsart.join(" / ") : norm(edu.ausbildungsart),
        Array.isArray(edu.abschluss) ? edu.abschluss.join(" / ") : norm(edu.abschluss)
      ].filter(Boolean).join(" - ").trim();
      const institutionLine = Array.isArray(edu.institution) ? edu.institution.join(", ") : norm(edu.institution);
      const periodLine = formatPeriod(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, !!edu.isCurrent);

      if (titleLine) {
        eduParts.push({
          type: "text",
          id: `edu-title-${edu.id}`,
          offsetX: 0, offsetY: 0,
          width: 350,
          text: titleLine,
          fontSize: 20,
          fontWeight: "bold",
          color: "#000000",
          fieldType: "title",
          order: base + 0,
          gapBefore: 0,
        });
      }

      if (institutionLine) {
        eduParts.push({
          type: "text",
          id: `edu-inst-${edu.id}`,
          offsetX: 0, offsetY: 0,
          width: 300,
          text: institutionLine,
          fontSize: 16,
          fontStyle: "italic",
          color: "#000000",
          fieldType: "institution",
          order: base + 1,
          gapBefore: 2,
        });
      }

      if (periodLine) {
        eduParts.push({
          type: "text",
          id: `edu-per-${edu.id}`,
          offsetX: 0, offsetY: 0,
          width: 150,
          text: periodLine,
          fontSize: 16,
          color: "#000000",
          fieldType: "period",
          order: base + 2,
          gapBefore: 2,
        });
      }

      if (edu.zusatzangaben?.trim()) {
        eduParts.push({
          type: "text",
          id: `edu-note-${edu.id}`,
          offsetX: 0, offsetY: 0,
          width: 470,
          text: norm(edu.zusatzangaben),
          fontSize: 15,
          color: "#000000",
          lineHeight: 1.4,
          fieldType: "note",
          order: base + 3,
          gapBefore: 6,
        });
      }
    });

    const educationSection: CVSectionWithParts = {
      id: "education",
      type: "ausbildung",
      title: "Ausbildung",
      content: "",
      x: 50,
      y: currentY,
      width: sectionWidth,
      height: Math.max(sectionHeight, 140),
      sectionType: "education",
      isVisible: true,
      parts: eduParts,
      props: { paddingTop: 16, paddingLeft: 24, paddingRight: 24, paddingBottom: 16 } as any,
    };

    sections.push(educationSection);
    currentY += educationSection.height + sectionSpacing;
  }

  // ---- Profile / Skills / Softskills / Tätigkeiten ----
  const pd = ctx?.personalData ?? {};
  const pushSimple = (id: string, title: string, fieldType: string, text: string, height: number) => {
    const s: CVSectionWithParts = {
      id, type: fieldType, title, content: "",
      x: Math.round(DEFAULT_MARGINS.left + ((PAGE_W - DEFAULT_MARGINS.left - DEFAULT_MARGINS.right - sectionWidth) / 2)), y: currentY, width: sectionWidth, height,
      sectionType: fieldType, isVisible: true,
      parts: [{
        type: "text",
        id: `${id}-content`,
        offsetX: 0, offsetY: 0,
        width: 470,
        text: norm(text),
        fontSize: 16,
        color: "#000000",
        lineHeight: 1.45,
        fieldType: "content",
        order: 0,
        gapBefore: 0,
      }],
      props: { paddingTop: 16, paddingLeft: 24, paddingRight: 24, paddingBottom: 16 } as any,
    };
    sections.push(s);
    currentY += height + sectionSpacing;
  };

  if (pd.summary?.trim())            pushSimple("profile",     "Profil",                 "profile",    pd.summary,          100);
  if (pd.skillsSummary?.trim())      pushSimple("skills",      "Fachliche Kompetenzen",  "skills",     pd.skillsSummary,     80);
  if (pd.softSkillsSummary?.trim())  pushSimple("softskills",  "Persönliche Kompetenzen","softskills", pd.softSkillsSummary, 80);
  if (pd.taetigkeitenSummary?.trim())pushSimple("taetigkeiten","Tätigkeitsbereiche",    "skills",     pd.taetigkeitenSummary,80);

  return sections;
}
