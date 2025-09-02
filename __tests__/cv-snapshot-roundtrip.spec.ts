import { describe, it, expect } from 'vitest';
import { validateAndNormalizeCV } from '@/lib/cvValidation';

describe('CV snapshot roundtrip (v2)', () => {
  it('normalizes and preserves core fields', () => {
    const snapshot = {
      version: 2,
      savedAt: new Date().toISOString(),
      personalData: { vorname: 'Max', nachname: 'Mustermann' },
      berufserfahrung: [{
        id: 'exp_1',
        companies: ['Acme'],
        position: ['Tech'],
        startMonth: '01',
        startYear: '2020',
        endMonth: '05',
        endYear: '2021',
        isCurrent: false,
        aufgabenbereiche: ['A', 'B', 'C'],
        zusatzangaben: ''
      }],
      ausbildung: [{
        id: 'edu_1',
        institution: ['Uni'],
        ausbildungsart: ['Studium'],
        abschluss: ['BSc'],
        startMonth: '10',
        startYear: '2015',
        endMonth: '07',
        endYear: '2018',
        isCurrent: false,
        zusatzangaben: ''
      }]
    };
    const { ok, normalized } = validateAndNormalizeCV(snapshot as any);
    expect(ok).toBe(true);
    expect(normalized.berufserfahrung.length).toBe(1);
    expect(normalized.ausbildung.length).toBe(1);
    expect(normalized.berufserfahrung[0].aufgabenbereiche).toEqual(['A', 'B', 'C']);
  });
});
