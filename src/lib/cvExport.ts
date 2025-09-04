import type { CVSnapshot, Experience, Education } from '@/lib/cvValidation';
import { formatZeitraum } from '@/utils/dateUtils';

/** Convert CV snapshot to Markdown text */
export function cvToMarkdown(data: CVSnapshot): string {
  const lines: string[] = [];
  const pd = data.personalData || {};
  const name = [pd.vorname, pd.nachname].filter(Boolean).join(' ') || pd.name || 'Lebenslauf';
  lines.push(`# ${name}`);
  const contact: string[] = [];
  if (pd.adresse) contact.push(String(pd.adresse));
  if (pd.plz || pd.ort) contact.push([pd.plz, pd.ort].filter(Boolean).join(' '));
  if (pd.telefon) contact.push(String(pd.telefon));
  if (pd.email) contact.push(String(pd.email));
  if (contact.length) lines.push(contact.join(' • '));
  if (pd.summary) { lines.push('', pd.summary); }

  if (Array.isArray(data.berufserfahrung) && data.berufserfahrung.length) {
    lines.push('', '## Berufserfahrung');
    data.berufserfahrung.forEach((exp: Experience) => {
      const companies = (exp.companies||[]).join(' · ');
      const positions = (exp.position||[]).join(' · ');
      const when = formatZeitraum(exp.startMonth as any, exp.startYear as any, exp.endMonth as any, exp.endYear as any, Boolean(exp.isCurrent));
      const header = ['- ', positions || 'Position', companies && `@ ${companies}`, when && `(${when})`].filter(Boolean).join(' ');
      lines.push(header);
      if (Array.isArray(exp.aufgabenbereiche) && exp.aufgabenbereiche.length) {
        exp.aufgabenbereiche.forEach(task => { if (task) lines.push(`  - ${task}`); });
      }
      if (exp.zusatzangaben) lines.push(`  - _${exp.zusatzangaben}_`);
    });
  }

  if (Array.isArray(data.ausbildung) && data.ausbildung.length) {
    lines.push('', '## Ausbildung');
    data.ausbildung.forEach((edu: Education) => {
      const inst = (edu.institution||[]).join(' · ');
      const kind = (edu.ausbildungsart||[]).join(' · ');
      const degree = (edu.abschluss||[]).join(' · ');
      const when = formatZeitraum(exp.startMonth as any, exp.startYear as any, exp.endMonth as any, exp.endYear as any, Boolean(exp.isCurrent));
      const header = ['- ', degree || kind || 'Ausbildung', inst && `@ ${inst}`, when && `(${when})`].filter(Boolean).join(' ');
      lines.push(header);
      if (edu.zusatzangaben) lines.push(`  - _${edu.zusatzangaben}_`);
    });
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n');
}

export function downloadText(filename: string, text: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

