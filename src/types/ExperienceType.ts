export interface ExperienceEntry {
  id: string;
  companies: string[];
  position: string[];
  startMonth: string | null;
  startYear: string;
  endMonth: string | null;
  endYear: string | null;
  isCurrent: boolean;
  aufgabenbereiche: string[];
  zusatzangaben?: string;
  leasingCompaniesList?: string[];
}
