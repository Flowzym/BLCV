// Re-export base types
export * from "@/types/section";

// Enhanced Section interface for CV Designer with canvas positioning
export interface CVSection extends Section {
  // Canvas positioning for the entire section (absolute coordinates)
  x: number;
  y: number;
  width: number;
  height: number;
  
  // Section-specific properties for CV Designer
  sectionType?: 'experience' | 'education' | 'profile' | 'skills' | 'softskills' | 'contact';
  isVisible?: boolean;
  isLocked?: boolean;
}

// Enhanced TextPart with relative positioning within parent section
export interface CVTextPart {
  type: 'text';
  id: string;
  
  // Position relative to parent section's top-left corner
  offsetX: number;
  offsetY: number;
  width?: number;
  height?: number;
  
  // Content
  text: string;
  
  // Complete typography support for individual formatting
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | number;
  fontStyle?: 'normal' | 'italic';
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  
  // Field identification for template-based formatting
  fieldType?: 'title' | 'company' | 'position' | 'period' | 'content' | 'bullet' | 'institution' | 'note';
  order?: number; // For sorting within section
}

// Enhanced Section with canvas positioning and relative text parts
export interface CVSectionWithParts extends CVSection {
  parts: CVTextPart[];
}
