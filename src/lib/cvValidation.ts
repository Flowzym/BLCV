/**
 * Validation/Normalization wrapper.
 * If VITE_CV_ZOD === 'true', uses Zod schemas; otherwise applies a light, dependency-free normalization.
 */
export type CVSnapshot = {
  version?: number;
  personalData?: Record<string, any>;
  berufserfahrung?: Experience[];
  ausbildung?: Education[];
  savedAt?: string;
};
export type Experience = {
  id?: string;
  companies?: string[];
  position?: string[];
  startMonth?: string | null;
  startYear?: string | null;
  endMonth?: string | null;
  endYear?: string | null;
  isCurrent?: boolean;
  aufgabenbereiche?: string[];
  zusatzangaben?: string;
  source?: 'manual' | 'profile';
};
export type Education = {
  id?: string;
  institution?: string[];
  ausbildungsart?: string[];
  abschluss?: string[];
  startMonth?: string | null;
  startYear?: string | null;
  endMonth?: string | null;
  endYear?: string | null;
  isCurrent?: boolean;
  zusatzangaben?: string;
  source?: 'manual' | 'profile';
};

function strArr(v: any): string[] {
  if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
  if (v == null || v === '') return [];
  return [String(v).trim()];
}
function month(v: any): string | null {
  if (v == null || v === '') return null;
  const s = String(v).padStart(2, '0');
  return /^(0[1-9]|1[0-2])$/.test(s) ? s : null;
}
function year(v: any): string | null {
  if (v == null || v === '') return null;
  const s = String(v);
  return /^\d{4}$/.test(s) ? s : null;
}

export async function validateAndNormalizeCV(input: any): { ok: boolean; issues: string[]; normalized: CVSnapshot } {
  const ENABLE_ZOD = (import.meta as any)?.env?.VITE_CV_ZOD === 'true';
  if (ENABLE_ZOD) {
    try {
      const mod: any = await import('./cvZod'); const validateWithZod = mod.validateWithZod;
      return validateWithZod(input);
    } catch (e) {
      console.warn('Zod validation unavailable, falling back:', e);
    }
  }
  const issues: string[] = [];
  const exps = Array.isArray(input?.berufserfahrung) ? input.berufserfahrung : [];
  const edus = Array.isArray(input?.ausbildung) ? input.ausbildung : [];
  const normalized: CVSnapshot = {
    version: input?.version ?? 1,
    savedAt: input?.savedAt ?? new Date().toISOString(),
    personalData: (input?.personalData && typeof input.personalData === 'object') ? input.personalData : {},
    berufserfahrung: exps.map((e: any, idx: number) => {
      const n = {
        id: String(e?.id ?? `exp_${idx+1}`),
        companies: strArr(e?.companies),
        position: strArr(e?.position),
        startMonth: month(e?.startMonth),
        startYear: year(e?.startYear),
        endMonth: month(e?.endMonth),
        endYear: year(e?.endYear),
        isCurrent: Boolean(e?.isCurrent),
        aufgabenbereiche: strArr(e?.aufgabenbereiche),
        zusatzangaben: String(e?.zusatzangaben ?? '')
      };
      if (n.endYear && n.startYear && n.endYear < n.startYear) {
        issues.push(`experience ${n.id}: endYear < startYear`);
      }
      return n as Experience;
    }),
    ausbildung: edus.map((e: any, idx: number) => {
      const n = {
        id: String(e?.id ?? `edu_${idx+1}`),
        institution: strArr(e?.institution),
        ausbildungsart: strArr(e?.ausbildungsart),
        abschluss: strArr(e?.abschluss),
        startMonth: month(e?.startMonth),
        startYear: year(e?.startYear),
        endMonth: month(e?.endMonth),
        endYear: year(e?.endYear),
        isCurrent: Boolean(e?.isCurrent),
        zusatzangaben: String(e?.zusatzangaben ?? '')
      };
      if (n.endYear && n.startYear && n.endYear < n.startYear) {
        issues.push(`education ${n.id}: endYear < startYear`);
      }
      return n as Education;
    })
  };
  return { ok: issues.length === 0, issues, normalized };
}
