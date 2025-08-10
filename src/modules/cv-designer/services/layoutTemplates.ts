export type SectionType = 'experience' | 'education' | 'profile' | 'skills' | 'softskills';

export interface LayoutItem {
  field: string; // "title" | "company" | "period" | "bullet"
  x: number;     // relative Koordinaten innerhalb der Sektion
  y: number;
  w?: number;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  items: LayoutItem[];
  rowGap?: number; // für Bullets
}

export const EXPERIENCE_LAYOUTS: LayoutTemplate[] = [
  { 
    id: 'default', 
    name: 'Standard', 
    items: [
      { field: 'title',   x: 0,   y: 0,   w: 420 },
      { field: 'period',  x: 440, y: 0,   w: 120 },
      { field: 'company', x: 0,   y: 22,  w: 420 },
      // Bullets werden ab y=44 mit rowGap gesetzt
    ], 
    rowGap: 16 
  },
  { 
    id: 'compact', 
    name: 'Kompakt', 
    items: [
      { field: 'title',   x: 0,   y: 0,   w: 300 },
      { field: 'period',  x: 310, y: 0,   w: 100 },
      { field: 'company', x: 0,   y: 18,  w: 300 },
    ], 
    rowGap: 14 
  },
  { 
    id: 'wide', 
    name: 'Breit', 
    items: [
      { field: 'title',   x: 0,   y: 0,   w: 500 },
      { field: 'period',  x: 510, y: 0,   w: 140 },
      { field: 'company', x: 0,   y: 26,  w: 500 },
    ], 
    rowGap: 18 
  }
];

export const EDUCATION_LAYOUTS: LayoutTemplate[] = [
  { 
    id: 'default', 
    name: 'Standard', 
    items: [
      { field: 'title',       x: 0,   y: 0,   w: 420 },
      { field: 'period',      x: 440, y: 0,   w: 120 },
      { field: 'institution', x: 0,   y: 22,  w: 420 },
    ], 
    rowGap: 16 
  },
  { 
    id: 'compact', 
    name: 'Kompakt', 
    items: [
      { field: 'title',       x: 0,   y: 0,   w: 300 },
      { field: 'period',      x: 310, y: 0,   w: 100 },
      { field: 'institution', x: 0,   y: 18,  w: 300 },
    ], 
    rowGap: 14 
  }
];

export const PROFILE_LAYOUTS: LayoutTemplate[] = [
  { 
    id: 'default', 
    name: 'Standard', 
    items: [
      { field: 'content', x: 0, y: 0, w: 560 },
    ], 
    rowGap: 16 
  }
];

export const SKILLS_LAYOUTS: LayoutTemplate[] = [
  { 
    id: 'default', 
    name: 'Standard', 
    items: [
      { field: 'content', x: 0, y: 0, w: 560 },
    ], 
    rowGap: 16 
  }
];

export const LAYOUT_TEMPLATES: Record<SectionType, LayoutTemplate[]> = {
  experience: EXPERIENCE_LAYOUTS,
  education: EDUCATION_LAYOUTS,
  profile: PROFILE_LAYOUTS,
  skills: SKILLS_LAYOUTS,
  softskills: SKILLS_LAYOUTS
};

export function getLayoutTemplate(sectionType: SectionType, layoutId: string = 'default'): LayoutTemplate {
  const templates = LAYOUT_TEMPLATES[sectionType] || [];
  return templates.find(t => t.id === layoutId) || templates[0] || {
    id: 'fallback',
    name: 'Fallback',
    items: [{ field: 'content', x: 0, y: 0, w: 560 }],
    rowGap: 16
  };
}