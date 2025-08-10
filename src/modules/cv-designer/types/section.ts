// Re-export base types
export * from "@/types/section";

// Extended Section interface for CV Designer with canvas positioning
export interface CVSection extends Section {
  // Canvas positioning for the entire section
  x: number;
  y: number;
  width: number;
  height: number;
  
  // Section-specific properties
  sectionType?: 'experience' | 'education' | 'profile' | 'skills' | 'softskills' | 'contact';
  isVisible?: boolean;
  isLocked?: boolean;
}

// Enhanced TextPart with relative positioning and full styling
export interface CVTextPart {
  type: 'text';
  id: string;
  
  // Position relative to parent section (not absolute canvas coordinates)
  offsetX: number;
  offsetY: number;
  width?: number;
  height?: number;
  
  // Content
  text: string;
  
  // Full typography support
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | number;
  fontStyle?: 'normal' | 'italic';
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  
  // Field identification for formatting
  fieldType?: 'title' | 'company' | 'position' | 'period' | 'content' | 'bullet' | 'institution' | 'note';
  order?: number; // For sorting within section
}
