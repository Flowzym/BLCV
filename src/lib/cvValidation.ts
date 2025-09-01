/**
 * Minimal runtime validation & normalization for Lebenslauf data (no external deps).
 */
export type PersonalData = Record<string, any>;
export interface Experience {
  id: string; companies: string[]; position: string[];
  startMonth: string | null; startYear: string | null;
  endMonth: string | null; endYear: string | null;
  isCurrent: boolean;
  aufgabenbereiche: string[];
  zusatzangaben: string;
  leasingCompaniesList?: string[];
  source?: 'manual' | 'profile';
}
export interface Education {
  id: string; institution: string[]; ausbildungsart: string[]; abschluss: string[];
  startMonth: string | null; startYear: string | null;
  endMonth: string | null; endYear: string | null;
  isCurrent: boolean; zusatzangaben: string; source?: 'manual' | 'profile';
}
export interface CVSnapshot { personalData: PersonalData; berufserfahrung: Experience[]; ausbildung: Education[]; }

function arrStr(a: any): string[] { return Array.isArray(a) ? a.map(v => String(v)).filter(Boolean) : []; }
function strOrNull(v: any): string | null { if (v === null) return null; if (v === undefined) return null; const s = String(v); return s.trim() === '' ? null : s; }
function bool(v: any): boolean { return v === true; }

export function normalizeExperience(e: any): Experience {
  return {
    id: String(e?.id ?? ''),
    companies: arrStr(e?.companies),
    position: arrStr(e?.position),
    startMonth: strOrNull(e?.startMonth),
    startYear: strOrNull(e?.startYear),
    endMonth: strOrNull(e?.endMonth),
    endYear: strOrNull(e?.endYear),
    isCurrent: bool(e?.isCurrent),
    aufgabenbereiche: arrStr(e?.aufgabenbereiche),
    zusatzangaben: String(e?.zusatzangaben ?? ''),
    leasingCompaniesList: arrStr(e?.leasingCompaniesList),
    source: (e?.source === 'profile') ? 'profile' : 'manual',
  };
}

export function normalizeEducation(e: any): Education {
  return {
    id: String(e?.id ?? ''),
    institution: arrStr(e?.institution),
    ausbildungsart: arrStr(e?.ausbildungsart),
    abschluss: arrStr(e?.abschluss),
    startMonth: strOrNull(e?.startMonth),
    startYear: strOrNull(e?.startYear),
    endMonth: strOrNull(e?.endMonth),
    endYear: strOrNull(e?.endYear),
    isCurrent: bool(e?.isCurrent),
    zusatzangaben: String(e?.zusatzangaben ?? ''),
    source: (e?.source === 'profile') ? 'profile' : 'manual',
  };
}

export function validateAndNormalizeCV(data: any): { ok: boolean; issues: string[]; normalized: CVSnapshot } {
  const issues: string[] = [];
  const p = (typeof data?.personalData === 'object' && data?.personalData) ? data.personalData : {};
  const exp = Array.isArray(data?.berufserfahrung) ? data.berufserfahrung : [];
  const edu = Array.isArray(data?.ausbildung) ? data.ausbildung : [];
  const normExp = exp.map(normalizeExperience).filter(e => e.id);
  const normEdu = edu.map(normalizeEducation).filter(e => e.id);
  if (!Array.isArray(data?.berufserfahrung)) issues.push('berufserfahrung not array');
  if (!Array.isArray(data?.ausbildung)) issues.push('ausbildung not array');
  return { ok: issues.length === 0, issues, normalized: { personalData: p, berufserfahrung: normExp, ausbildung: normEdu } };
}
