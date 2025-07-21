export const POSITIONS_TO_TASKS: Record<string, string[]> = {
  Softwareentwickler: [
    'Programmierung und Softwareentwicklung',
    'Code Reviews durchführen',
    'Software-Tests erstellen und durchführen',
    'Deployment und Release-Management',
    'Technische Dokumentation erstellen',
    'Fehleranalyse und Bugfixing',
    'Teilnahme an Scrum/Agile Meetings',
    'Zusammenarbeit mit Produktmanagement'
  ],
  Projektmanager: [
    'Projektplanung und -koordination',
    'Ressourcen- und Kapazitätsplanung',
    'Budget- und Kostenkontrolle',
    'Stakeholder-Management und -Kommunikation',
    'Risikomanagement',
    'Reporting und Statusberichte',
    'Team-Führung und -Motivation',
    'Qualitätssicherung'
  ],
  Techniker: [
    'Reparatur und Instandhaltung',
    'Wartung und Inspektion',
    'Fehlerdiagnose und -behebung',
    'Dokumentation von Arbeiten',
    'Kundenberatung',
    'Materialbeschaffung',
    'Qualitätskontrolle'
  ],
  'Marketing Manager': [
    'Kampagnenplanung und -umsetzung',
    'Marktanalysen und Wettbewerbsbeobachtung',
    'Content-Strategie und -Erstellung',
    'Social Media Management',
    'Erfolgsmessung und KPI-Tracking',
    'Budgetplanung und -kontrolle',
    'Zusammenarbeit mit Agenturen',
    'Markenentwicklung und -pflege'
  ],
  'Vertriebsmitarbeiter': [
    'Kundenakquise und -betreuung',
    'Angebotserstellung und Verhandlung',
    'Verkaufsgespräche führen',
    'Kundenbedürfnisse analysieren',
    'Umsatz- und Absatzplanung',
    'Marktbeobachtung',
    'Reporting und Dokumentation',
    'Teilnahme an Messen und Events'
  ],
  'Buchhalter': [
    'Buchung laufender Geschäftsvorfälle',
    'Erstellung von Monats- und Jahresabschlüssen',
    'Debitoren- und Kreditorenbuchhaltung',
    'Vorbereitung der Steuererklärungen',
    'Abstimmung von Konten',
    'Rechnungsprüfung und -freigabe',
    'Mahnwesen und Zahlungsverkehr',
    'Reporting und Controlling'
  ]
};

export function getTasksForPosition(position: string): string[] {
  // Case-insensitive Suche
  const positionLower = position.toLowerCase();
  
  // Suche nach exaktem Match (case-insensitive)
  for (const [key, tasks] of Object.entries(POSITIONS_TO_TASKS)) {
    if (key.toLowerCase() === positionLower) {
      return tasks;
    }
  }
  
  // Suche nach teilweisem Match
  for (const [key, tasks] of Object.entries(POSITIONS_TO_TASKS)) {
    if (key.toLowerCase().includes(positionLower) || positionLower.includes(key.toLowerCase())) {
      return tasks;
    }
  }
  
  return [];
}

export function getTasksForPositions(positions: string[]): string[] {
  if (!positions || positions.length === 0) return [];
  
  const tasks = positions.flatMap(p => {
    const positionTasks = getTasksForPosition(p);
    console.log(`Tasks for position "${p}":`, positionTasks);
    return positionTasks;
  });
  
  console.log('All tasks from positions:', tasks);
  return Array.from(new Set(tasks));
}
