import { z } from 'zod';

const Month = z.preprocess((v) => (v === '' ? null : v), z.string().regex(/^0[1-9]|1[0-2]$/).nullable().optional());
const Year = z.preprocess((v) => (v === '' ? null : v), z.string().regex(/^\d{4}$/).nullable().optional());

const Str = z.preprocess((v) => (v == null ? '' : String(v)), z.string());
const StrArr = z.preprocess((v) => Array.isArray(v) ? v : (v == null ? [] : [v]), z.array(z.string().transform(s => String(s).trim())).default([]));

export const ExperienceSchema = z.object({
  id: Str.default(''),
  companies: StrArr,
  position: StrArr,
  startMonth: Month.default(null),
  startYear: Year.default(null),
  endMonth: Month.default(null),
  endYear: Year.default(null),
  isCurrent: z.boolean().default(false),
  aufgabenbereiche: StrArr,
  zusatzangaben: Str.default(''),
  source: z.enum(['manual','profile']).optional()
});

export const EducationSchema = z.object({
  id: Str.default(''),
  institution: StrArr,
  ausbildungsart: StrArr,
  abschluss: StrArr,
  startMonth: Month.default(null),
  startYear: Year.default(null),
  endMonth: Month.default(null),
  endYear: Year.default(null),
  isCurrent: z.boolean().default(false),
  zusatzangaben: Str.default(''),
  source: z.enum(['manual','profile']).optional()
});

export const PersonalDataSchema = z.record(z.any()).catchall(z.any());

export const CVSnapshotSchema = z.object({
  version: z.number().optional(),
  personalData: PersonalDataSchema.default({}),
  berufserfahrung: z.array(ExperienceSchema).default([]),
  ausbildung: z.array(EducationSchema).default([]),
  savedAt: z.string().optional()
});

export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type CVSnapshot = z.infer<typeof CVSnapshotSchema>;

export function validateWithZod(input: unknown): { ok: boolean; issues: string[]; normalized: CVSnapshot } {
  const res = CVSnapshotSchema.safeParse(input);
  if (!res.success) {
    const issues = res.error.issues.map(i => `${i.path.join('.')} ${i.message}`);
    // Try best-effort: parse ignoring errors by defaulting
    try {
      const coerced = CVSnapshotSchema.parse(input);
      return { ok: false, issues, normalized: coerced };
    } catch {
      return { ok: false, issues, normalized: { personalData: {}, berufserfahrung: [], ausbildung: [] } as any };
    }
  }
  return { ok: true, issues: [], normalized: res.data };
}
