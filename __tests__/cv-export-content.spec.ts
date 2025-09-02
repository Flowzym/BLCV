import { describe, it, expect } from 'vitest';
import { cvToMarkdown } from '@/lib/cvExport';

describe('cvToMarkdown – content structure', () => {
  it('includes bullets for tasks and sections', () => {
    const md = cvToMarkdown({
      personalData: { vorname: 'Eva', nachname: 'Beispiel', email: 'e@example.com' },
      berufserfahrung: [{
        id: 'exp1',
        companies: ['FirmaX'],
        position: ['Entwicklerin'],
        startMonth: '02',
        startYear: '2019',
        endMonth: '12',
        endYear: '2020',
        isCurrent: false,
        aufgabenbereiche: ['Feature A', 'Feature B'],
        zusatzangaben: 'Notizen'
      }],
      ausbildung: [{
        id: 'edu1',
        institution: ['FH'],
        ausbildungsart: ['Studium'],
        abschluss: ['MSc'],
        startMonth: '10',
        startYear: '2016',
        endMonth: '07',
        endYear: '2018',
        isCurrent: false,
        zusatzangaben: ''
      }]
    } as any);
    expect(md).toMatch(/## Berufserfahrung/);
    expect(md).toMatch(/- .*Entwicklerin/);
    expect(md).toMatch(/Feature A/);
    expect(md).toMatch(/## Ausbildung/);
  });
});
