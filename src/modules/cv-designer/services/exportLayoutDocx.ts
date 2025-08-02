/**
 * CV-Designer Module - DOCX Export Service
 * Phase 4: Core export functionality for SavedTemplate to DOCX format
 */

import { Document, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { SavedTemplate, TemplateSection } from '../types/template';
import { LayoutElement, Section, LayoutGroup } from '../types/section';
import { StyleConfig, FontConfig } from '../types/styles';

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

    // Create document with page settings
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: pageMargins
          }
        },
        children: await generateDocumentParagraphs(template, effectiveStyles, includeMetadata)
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
  includeMetadata: boolean
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
            size: Math.round(styles.font.size * 1.2) * 2 // Convert to half-points
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
              size: styles.font.size * 2
            })
          ],
          spacing: { after: 240 }
        })
      );
    }
  }

  // Process template sections
  for (const section of template.sections.sort((a, b) => a.order - b.order)) {
    const sectionParagraphs = await generateSectionParagraphs(section, styles);
    paragraphs.push(...sectionParagraphs);
  }

  // Process layout elements
  for (const element of template.layout) {
    const elementParagraphs = await generateLayoutElementParagraphs(element, styles);
    paragraphs.push(...elementParagraphs);
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
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.title,
            bold: true,
            size: Math.round(styles.font.size * 1.1) * 2,
            color: styles.colors.primary.replace('#', '')
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 }
      })
    );
  }

  // Section content
  if (section.content) {
    const contentLines = section.content.split('\n').filter(line => line.trim());
    
    for (const line of contentLines) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.trim(),
              size: styles.font.size * 2,
              color: styles.colors.text?.replace('#', '') || '000000'
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
 * Generates paragraphs for layout elements
 */
async function generateLayoutElementParagraphs(
  element: LayoutElement,
  styles: StyleConfig
): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];

  if (element.type === 'group') {
    const group = element as LayoutGroup;
    
    // Group title if available
    if (group.props?.title) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: group.props.title,
              bold: true,
              size: Math.round(styles.font.size * 1.05) * 2,
              color: styles.colors.primary.replace('#', '')
            })
          ],
          spacing: { before: 200, after: 100 }
        })
      );
    }

    // Process group children
    for (const child of group.children) {
      const childParagraphs = await generateSectionParagraphs(child, styles);
      paragraphs.push(...childParagraphs);
    }
  } else {
    // Handle individual section
    const section = element as Section;
    const sectionParagraphs = await generateSectionParagraphs(section, styles);
    paragraphs.push(...sectionParagraphs);
  }

  return paragraphs;
}

/**
 * Generates paragraphs for individual sections
 */
async function generateSectionParagraphs(
  section: Section,
  styles: StyleConfig
): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];

  // Use section-specific styles if available
  const sectionFont: FontConfig = {
    ...styles.font,
    family: section.fontFamily || styles.font.family,
    size: section.fontSize ? parseInt(section.fontSize) : styles.font.size,
    color: section.color || styles.font.color
  };

  // Process section data
  if (section.data) {
    if (typeof section.data === 'string') {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.data,
              size: sectionFont.size * 2,
              color: sectionFont.color?.replace('#', '') || '000000'
            })
          ],
          spacing: { after: 120 }
        })
      );
    } else if (Array.isArray(section.data)) {
      // Handle array data as list items
      for (const item of section.data) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${String(item)}`,
                size: sectionFont.size * 2,
                color: sectionFont.color?.replace('#', '') || '000000'
              })
            ],
            spacing: { after: 80 }
          })
        );
      }
    } else if (typeof section.data === 'object') {
      // Handle object data as key-value pairs
      for (const [key, value] of Object.entries(section.data)) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${key}: `,
                bold: true,
                size: sectionFont.size * 2,
                color: sectionFont.color?.replace('#', '') || '000000'
              }),
              new TextRun({
                text: String(value),
                size: sectionFont.size * 2,
                color: sectionFont.color?.replace('#', '') || '000000'
              })
            ],
            spacing: { after: 80 }
          })
        );
      }
    }
  }

  return paragraphs;
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
      count += group.children.length;
    }
  }
  
  return count;
}

/**
 * Validates template before export
 */
export function validateTemplateForExport(template: SavedTemplate): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template.id) {
    errors.push('Template ID is required');
  }

  if (!template.name || template.name.trim().length === 0) {
    errors.push('Template name is required');
  }

  if (!template.style) {
    errors.push('Template style configuration is required');
  } else {
    if (!template.style.font) {
      errors.push('Font configuration is required in template style');
    }
    if (!template.style.colors) {
      errors.push('Color configuration is required in template style');
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