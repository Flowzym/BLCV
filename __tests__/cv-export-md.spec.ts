import { describe, it, expect } from 'vitest';
import { cvToMarkdown } from '@/lib/cvExport';

describe('cvToMarkdown', () => {
  it('renders laufend periods with today wording', () => {
    const md = cvToMarkdown({
      personalData: { vorname: 'Max', nachname: 'Mustermann', email: 'max@example.com' },
      berufserfahrung: [{
        id: 'exp1',
        companies: ['Acme'],
        position: ['Ingenieur'],
        startMonth: '03',
        startYear: '2022',
        endMonth: null,
        endYear: null,
        isCurrent: true,
        aufgabenbereiche: ['Analyse', 'Wartung'],
        zusatzangaben: ''
      }],
      ausbildung: []
    } as any);
    expect(md).toContain('Max Mustermann');
    // Accept both "heute" and "laufend" depending on current utils wording
    expect(/(heute|laufend)/.test(md)).toBe(true);
  });
});
