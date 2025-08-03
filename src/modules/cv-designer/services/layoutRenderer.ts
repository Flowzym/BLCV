/**
 * Layout Renderer Service
 * Unified rendering logic for Preview (Canvas), DOCX Export, and PDF Export
 * Ensures visual and structural consistency across all output formats
 */

import { LayoutElement } from '../types/section';
import { StyleConfig } from '../../../types/cv-designer';
import { Document, Paragraph, TextRun, AlignmentType } from 'docx';

// A4 Constants
export const A4_WIDTH = 595; // px at 72 DPI
export const A4_HEIGHT = 842; // px at 72 DPI

/**
 * Shared style calculation utilities
 */
export function calculateFontSize(fontSize: string): number {
  switch (fontSize) {
    case 'small': return 10;
    case 'medium': return 12;
    case 'large': return 14;
    default: return 12;
  }
}

export function calculatePadding(margin: string): number {
  switch (margin) {
    case 'narrow': return 4;
    case 'normal': return 8;
    case 'wide': return 12;
    default: return 8;
  }
}

export function parseColorToRgb(color: string): { r: number; g: number; b: number } {
  // Simple hex color parser
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return { r, g, b };
}

/**
 * Canvas/Preview Rendering
 * Renders LayoutElement to HTML/CSS for browser preview
 */
export function renderElementToCanvas(
  element: LayoutElement,
  style: StyleConfig,
  options: {
    showDebugBorders?: boolean;
    scale?: number;
  } = {}
): React.CSSProperties {
  const { showDebugBorders = false, scale = 1 } = options;
  const fontSize = calculateFontSize(style.fontSize);
  const padding = calculatePadding(style.margin);

  return {
    position: 'absolute',
    left: element.x * scale,
    top: element.y * scale,
    width: element.width * scale,
    height: (element.height || 100) * scale,
    fontFamily: style.fontFamily,
    fontSize: `${fontSize * scale}px`,
    lineHeight: style.lineHeight,
    color: style.textColor || '#000000',
    backgroundColor: style.backgroundColor || '#ffffff',
    padding: `${padding * scale}px`,
    borderRadius: style.borderRadius || '4px',
    border: showDebugBorders ? '1px dashed #d1d5db' : style.border || 'none',
    boxShadow: style.boxShadow || 'none',
    overflow: 'hidden',
    boxSizing: 'border-box',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  };
}

/**
 * Canvas Content Rendering
 * Renders the actual content of an element for preview
 */
export function renderElementContent(
  element: LayoutElement,
  style: StyleConfig,
  options: {
    renderSkillsBadges?: boolean;
    maxSkills?: number;
    maxTasks?: number;
  } = {}
): React.ReactNode {
  const { renderSkillsBadges = true, maxSkills = 8, maxTasks = 3 } = options;

  // Photo handling
  if (element.type === 'photo') {
    return element.content ? (
      <img
        src={element.content}
        alt="Profilfoto"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%',
          border: `2px solid ${style.accentColor || '#e5e7eb'}`
        }}
      />
    ) : (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: '#f3f4f6',
          border: `2px dashed ${style.accentColor || '#d1d5db'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.6em',
          color: '#6b7280',
          textAlign: 'center'
        }}
      >
        📷<br/>Foto
      </div>
    );
  }

  // Skills as badges
  if ((element.type === 'kenntnisse' || element.type === 'skills' || element.type === 'softskills') && renderSkillsBadges) {
    if (!element.content) {
      return (
        <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.8em' }}>
          – Keine {element.type === 'softskills' ? 'Soft Skills' : 'Fähigkeiten'} –
        </div>
      );
    }

    const skills = element.content.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {skills.slice(0, maxSkills).map((skill, idx) => (
          <span
            key={idx}
            style={{
              background: style.accentColor || '#3b82f6',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '0.7em',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            {skill}
          </span>
        ))}
        {skills.length > maxSkills && (
          <span
            style={{
              background: '#6b7280',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '0.7em',
              fontWeight: '500'
            }}
          >
            +{skills.length - maxSkills}
          </span>
        )}
      </div>
    );
  }

  // Standard content
  return element.content || (
    <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.8em' }}>
      – Keine Daten –
    </div>
  );
}

/**
 * DOCX Rendering
 * Converts LayoutElement to DOCX paragraphs with proper positioning
 */
export function renderElementToDocx(
  element: LayoutElement,
  style: StyleConfig,
  options: {
    pageWidth?: number;
    pageHeight?: number;
  } = {}
): Paragraph[] {
  const { pageWidth = A4_WIDTH, pageHeight = A4_HEIGHT } = options;
  const fontSize = calculateFontSize(style.fontSize);
  const paragraphs: Paragraph[] = [];

  // Calculate relative positioning for DOCX (convert px to twips: 1px = 20 twips)
  const leftMargin = Math.round(element.x * 20);
  const topMargin = Math.round(element.y * 20);

  // Element title
  if (element.title && element.type !== 'photo') {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: element.title,
            bold: true,
            size: Math.round(fontSize * 1.2) * 2, // Convert to half-points
            color: (style.primaryColor || '#1e40af').replace('#', '')
          })
        ],
        spacing: { before: topMargin, after: 120 },
        indent: { left: leftMargin }
      })
    );
  }

  // Element content
  if (element.content) {
    const contentLines = element.content.split('\n').filter(line => line.trim());
    
    contentLines.forEach((line, index) => {
      // Handle different content types
      if (element.type === 'kenntnisse' || element.type === 'skills' || element.type === 'softskills') {
        // Skills as comma-separated list in DOCX
        const skills = line.split(/[,;]/).map(s => s.trim()).filter(Boolean);
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: skills.join(' • '),
                size: fontSize * 2,
                color: (style.textColor || '#000000').replace('#', '')
              })
            ],
            spacing: { after: 80 },
            indent: { left: leftMargin }
          })
        );
      } else {
        // Regular text content
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.trim(),
                size: fontSize * 2,
                color: (style.textColor || '#000000').replace('#', '')
              })
            ],
            spacing: { after: index === contentLines.length - 1 ? 120 : 80 },
            indent: { left: leftMargin }
          })
        );
      }
    });
  }

  return paragraphs;
}

/**
 * PDF Rendering
 * Converts LayoutElement to PDF content with absolute positioning
 */
export function renderElementToPdf(
  element: LayoutElement,
  style: StyleConfig,
  options: {
    pageWidth?: number;
    pageHeight?: number;
  } = {}
): PDFElementData {
  const { pageWidth = A4_WIDTH, pageHeight = A4_HEIGHT } = options;
  const fontSize = calculateFontSize(style.fontSize);
  const padding = calculatePadding(style.margin);

  return {
    id: element.id,
    type: element.type,
    position: {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height || 100
    },
    style: {
      fontFamily: style.fontFamily,
      fontSize: fontSize,
      color: style.textColor || '#000000',
      backgroundColor: style.backgroundColor || '#ffffff',
      padding: padding,
      borderRadius: parseInt(style.borderRadius?.replace('px', '') || '0'),
      lineHeight: style.lineHeight
    },
    content: {
      title: element.title || '',
      text: element.content || '',
      lines: element.content ? element.content.split('\n').filter(line => line.trim()) : []
    }
  };
}

/**
 * Layout Validation
 * Ensures elements don't overlap and fit within page bounds
 */
export function validateLayout(
  elements: LayoutElement[],
  pageWidth: number = A4_WIDTH,
  pageHeight: number = A4_HEIGHT
): {
  isValid: boolean;
  warnings: string[];
  overlaps: Array<{ element1: string; element2: string }>;
} {
  const warnings: string[] = [];
  const overlaps: Array<{ element1: string; element2: string }> = [];

  elements.forEach((element, index) => {
    // Check page bounds
    if (element.x < 0 || element.y < 0) {
      warnings.push(`Element ${element.id} has negative position`);
    }
    if (element.x + element.width > pageWidth) {
      warnings.push(`Element ${element.id} exceeds page width`);
    }
    if (element.y + (element.height || 100) > pageHeight) {
      warnings.push(`Element ${element.id} exceeds page height`);
    }

    // Check overlaps with other elements
    elements.slice(index + 1).forEach(otherElement => {
      if (elementsOverlap(element, otherElement)) {
        overlaps.push({
          element1: element.id,
          element2: otherElement.id
        });
      }
    });
  });

  return {
    isValid: warnings.length === 0 && overlaps.length === 0,
    warnings,
    overlaps
  };
}

/**
 * Helper function to check if two elements overlap
 */
function elementsOverlap(el1: LayoutElement, el2: LayoutElement): boolean {
  const el1Right = el1.x + el1.width;
  const el1Bottom = el1.y + (el1.height || 100);
  const el2Right = el2.x + el2.width;
  const el2Bottom = el2.y + (el2.height || 100);

  return !(
    el1Right <= el2.x ||
    el2Right <= el1.x ||
    el1Bottom <= el2.y ||
    el2Bottom <= el1.y
  );
}

/**
 * Layout Statistics
 * Provides useful metrics about the layout
 */
export function getLayoutStats(elements: LayoutElement[]): {
  totalElements: number;
  usedArea: number;
  density: number;
  averageElementSize: number;
  largestElement: LayoutElement | null;
  smallestElement: LayoutElement | null;
} {
  if (elements.length === 0) {
    return {
      totalElements: 0,
      usedArea: 0,
      density: 0,
      averageElementSize: 0,
      largestElement: null,
      smallestElement: null
    };
  }

  const totalArea = A4_WIDTH * A4_HEIGHT;
  const elementAreas = elements.map(el => el.width * (el.height || 100));
  const usedArea = elementAreas.reduce((sum, area) => sum + area, 0);
  const averageElementSize = usedArea / elements.length;

  const largestElement = elements.reduce((largest, current) => {
    const currentArea = current.width * (current.height || 100);
    const largestArea = largest.width * (largest.height || 100);
    return currentArea > largestArea ? current : largest;
  });

  const smallestElement = elements.reduce((smallest, current) => {
    const currentArea = current.width * (current.height || 100);
    const smallestArea = smallest.width * (smallest.height || 100);
    return currentArea < smallestArea ? current : smallest;
  });

  return {
    totalElements: elements.length,
    usedArea,
    density: (usedArea / totalArea) * 100,
    averageElementSize,
    largestElement,
    smallestElement
  };
}

/**
 * Types for PDF rendering
 */
export interface PDFElementData {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    backgroundColor: string;
    padding: number;
    borderRadius: number;
    lineHeight: number;
  };
  content: {
    title: string;
    text: string;
    lines: string[];
  };
}

/**
 * Utility function to create consistent spacing
 */
export function createSpacing(style: StyleConfig): {
  sectionSpacing: number;
  elementPadding: number;
  lineSpacing: number;
} {
  return {
    sectionSpacing: style.sectionSpacing || 24,
    elementPadding: calculatePadding(style.margin),
    lineSpacing: Math.round(calculateFontSize(style.fontSize) * style.lineHeight)
  };
}

/**
 * Color utilities for different formats
 */
export function formatColorForDocx(color: string): string {
  return color.replace('#', '').toUpperCase();
}

export function formatColorForPdf(color: string): [number, number, number] {
  const rgb = parseColorToRgb(color);
  return [rgb.r / 255, rgb.g / 255, rgb.b / 255];
}

/**
 * Text processing utilities
 */
export function processTextForExport(text: string, maxLength?: number): string {
  if (!text) return '';
  
  // Clean up text
  let processed = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
  
  // Truncate if needed
  if (maxLength && processed.length > maxLength) {
    processed = processed.substring(0, maxLength - 3) + '...';
  }
  
  return processed;
}

/**
 * Element type utilities
 */
export function isPhotoElement(element: LayoutElement): boolean {
  return element.type === 'photo';
}

export function isSkillsElement(element: LayoutElement): boolean {
  return ['kenntnisse', 'skills', 'softskills'].includes(element.type);
}

export function isTextElement(element: LayoutElement): boolean {
  return !isPhotoElement(element) && !isSkillsElement(element);
}