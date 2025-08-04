/**
 * CV-Designer Module - DOCX Export Service
 * Phase 4: Core export functionality for SavedTemplate to DOCX format
 */

import { Document, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { SavedTemplate, TemplateSection } from '../types/template';
import { LayoutElement, Section, LayoutGroup } from '../types/section';
import { StyleConfig } from '../../../types/cv-designer';
import { getFontFamilyWithFallback } from '../utils/fonts';
import { 
  renderElementToDocx, 
  A4_WIDTH, 
  A4_HEIGHT,
  validateLayout,
  processTextForExport
} from './layoutRenderer';

/**
 * Export options for DOCX generation
 */
export interface DocxExportOptions {
  pageMargins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  includeMetadata?: boolean;
  customStyles?: Partial<StyleConfig>;
}

/**
 * Result of DOCX export operation
 */
export interface DocxExportResult {
  success: boolean;
  blob?: Blob;
  error?: string;
  metadata: {
    templateId: string;
    templateName: string;
    exportedAt: string;
    sectionsCount: number;
    elementsCount: number;
  };
}

/**
 * Converts a SavedTemplate to DOCX format
 * 
 * @param template - The SavedTemplate to export
 * @param options - Export configuration options
 * @returns Promise<DocxExportResult> - Export result with blob or error
 */
export async function exportTemplateToDocx(
  template: SavedTemplate,
  options: DocxExportOptions = {}
): Promise<DocxExportResult> {
  try {
    // Validate template before processing
    const validation = validateTemplateForDocxExport(template);
    if (!validation.isValid) {
      throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
    }

    const {
      pageMargins = { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch in twips
      includeMetadata = false,
      customStyles
    } = options;

    // Merge template styles with custom overrides
    const effectiveStyles: StyleConfig = {
      ...template.style,
      ...customStyles
    };

    // Validate layout elements
    const layoutValidation = validateLayout(template.layout, A4_WIDTH, A4_HEIGHT);
    if (!layoutValidation.isValid && layoutValidation.warnings.length > 0) {
      console.warn('DOCX Export Layout Warnings:', layoutValidation.warnings);
    }

    // Create document with page settings
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: pageMargins,
            size: {
              width: A4_WIDTH * 20, // Convert to twips
              height: A4_HEIGHT * 20
            }
          }
        },
        children: await generateDocumentParagraphs(template, effectiveStyles, includeMetadata, options)
      }]
    });

    // Generate blob
    const { Packer } = await import('docx');
    const blob = await Packer.toBlob(doc);

    // Count elements for metadata
    const elementsCount = countLayoutElements(template.layout);

    return {
      success: true,
      blob,
      metadata: {
        templateId: template.id,
        templateName: template.name,
        exportedAt: new Date().toISOString(),
        sectionsCount: template.sections.length,
        elementsCount
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown export error',
      metadata: {
        templateId: template.id,
        templateName: template.name,
        exportedAt: new Date().toISOString(),
        sectionsCount: template.sections.length,
        elementsCount: 0
      }
    };
  }
}

/**
 * Generates document paragraphs from template data
 */
async function generateDocumentParagraphs(
  template: SavedTemplate,
  styles: StyleConfig,
  includeMetadata: boolean,
  options: DocxExportOptions = {}
): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];

  // Add metadata header if requested
  if (includeMetadata) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Template: ${template.name}`,
            bold: true,
            size: 24 // 12pt in half-points
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 240 }
      })
    );

    if (template.description) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: template.description,
              italics: true,
              size: 22 // 11pt in half-points
            })
          ],
          spacing: { after: 240 }
        })
      );
    }
  }

  // Process template sections
  if (template.sections && template.sections.length > 0) {
    for (const section of template.sections.sort((a, b) => a.order - b.order)) {
      const sectionParagraphs = await generateSectionParagraphs(section, styles);
      paragraphs.push(...sectionParagraphs);
    }
  }

  // Process layout elements using unified renderer
  for (const element of template.layout) {
    const elementParagraphs = renderElementToDocx(element, styles, {
      pageWidth: A4_WIDTH,
      pageHeight: A4_HEIGHT
    });
    paragraphs.push(...sectionParagraphs);
  }

  return paragraphs;
}

/**
 * Generates paragraphs for a template section
 */
async function generateSectionParagraphs(
  section: TemplateSection,
  styles: StyleConfig
): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];

  // Section title
  if (section.title) {
    const titleFontFamily = getFontFamilyWithFallback(styles.fontFamily).split(',')[0].replace(/"/g, '').trim();
    console.log('DOCX Export: Section title font:', titleFontFamily);
    
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.title,
            bold: true,
            size: 26, // 13pt in half-points
            color: (styles.primaryColor || '#1e40af').replace('#', ''),
            font: titleFontFamily
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 }
      })
    );
  }

  // Section content
  if (section.content) {
    const processedContent = processTextForExport(section.content);
    const contentLines = processedContent.split('\n').filter(line => line.trim());
    const contentFontFamily = getFontFamilyWithFallback(styles.fontFamily).split(',')[0].replace(/"/g, '').trim();
    console.log('DOCX Export: Section content font:', contentFontFamily);
    
    for (const line of contentLines) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.trim(),
              size: 24, // 12pt in half-points
              color: (styles.textColor || '#000000').replace('#', ''),
              font: contentFontFamily
            })
          ],
          spacing: { after: 120 }
        })
      );
    }
  }

  return paragraphs;
}

/**
 * Validates template for DOCX export
 */
function validateTemplateForDocxExport(template: SavedTemplate): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template.id) {
    errors.push('Template ID is required');
  }

  if (!template.name || template.name.trim().length === 0) {
    errors.push('Template name is required for DOCX export');
  }

  if (!template.style || typeof template.style !== 'object') {
    errors.push('Template style configuration is required for DOCX export');
  } else {
    if (!template.style.fontFamily) {
      errors.push('Font family is required in style configuration');
    }
    if (!template.style.primaryColor) {
      errors.push('Primary color is required in style configuration');
    }
  }

  if (!Array.isArray(template.layout)) {
    errors.push('Template layout must be an array');
  }

  if (!Array.isArray(template.sections)) {
    errors.push('Template sections must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Counts total layout elements in template
 */
function countLayoutElements(layout: LayoutElement[]): number {
  let count = 0;
  
  for (const element of layout) {
    count++;
    if (element.type === 'group') {
      const group = element as LayoutGroup;
      if (group.children && Array.isArray(group.children)) {
        count += group.children.length;
      }
    }
  }
  
  return count;
}

export function renderElementToDocx(element: LayoutElement, style: StyleConfig): Paragraph[] {
  const fontSize = calculateFontSize(style.fontSize)
  const leftMargin = Math.round(element.x * 20)
  const elementFontFamily = getFontFamilyWithFallback(style.fontFamily).split(',')[0].replace(/"/g, '').trim();
  console.log('DOCX Export: Element font:', elementFontFamily, 'for element:', element.type);
  
  const paragraphs: Paragraph[] = []

  if (element.content) {
    const lines = element.content.split('\n')
    for (const line of lines) {
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: line.trim(),
            size: fontSize * 2,
            color: (style.textColor || '#000000').replace('#', ''),
            font: elementFontFamily
          })
        ],
        indent: { left: leftMargin }
      }))
    }
  }

  return paragraphs
}