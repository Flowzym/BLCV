/**
 * layoutRenderer.ts – Unified headless rendering logic
 * For Preview (Canvas instructions), DOCX, and PDF
 */

import { LayoutElement } from '../types/section'
import { StyleConfig } from '../../../types/cv-designer'
import { Paragraph, TextRun } from 'docx'
import { getFontFamilyWithFallback } from '../utils/fonts'
import { useTypography } from '../context/TypographyContext'

// A4 constants
export const A4_WIDTH = 595
export const A4_HEIGHT = 842

// ---------------- Utilities ----------------
export function calculateFontSize(fontSize: string): number {
  switch (fontSize) {
    case 'small': return 10
    case 'medium': return 12
    case 'large': return 14
    default: return 12
  }
}

export function calculatePadding(margin: string): number {
  switch (margin) {
    case 'narrow': return 4
    case 'normal': return 8
    case 'wide': return 12
    default: return 8
  }
}

export function parseColorToRgb(color: string): { r: number; g: number; b: number } {
  const hex = color.replace('#', '')
  return {
    r: parseInt(hex.substr(0, 2), 16),
    g: parseInt(hex.substr(2, 2), 16),
    b: parseInt(hex.substr(4, 2), 16)
  }
}

export function formatColorForDocx(color: string): string {
  return color.replace('#', '').toUpperCase()
}

export function formatColorForPdf(color: string): [number, number, number] {
  const rgb = parseColorToRgb(color)
  return [rgb.r / 255, rgb.g / 255, rgb.b / 255]
}

export function processTextForExport(text: string, maxLength?: number): string {
  if (!text) return ''
  let processed = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
  if (maxLength && processed.length > maxLength) {
    processed = processed.substring(0, maxLength - 3) + '...'
  }
  return processed
}

// ---------------- Canvas Data ----------------
export interface CanvasElementData {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  content: string
  style: any
}

export function renderElementToCanvas(element: LayoutElement, style: StyleConfig): CanvasElementData {
  console.log('renderElementToCanvas: element.type:', element.type);
  console.log('renderElementToCanvas: style.colors:', style.colors);

  // ⚠️ Nur Layout-relevante Styles übergeben, keine Fonts
  const backgroundColor = style.colors?.background || style.backgroundColor || "#ffffff"
  const borderColor = style.colors?.border || "#e5e7eb"

  return {
    id: element.id,
    type: element.type,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height || 100,
    content: element.content || '',
    style: {
      backgroundColor,
      border: `1px solid ${borderColor}`
    }
  }
}

// ---------------- DOCX ----------------
export function renderElementToDocx(element: LayoutElement, style: StyleConfig, getTypography: (sectionId: string, fieldKey: string) => any): Paragraph[] {
  const [typography] = getTypography(element.type, 'content');
  const leftMargin = Math.round(element.x * 20)
  const docxFontFamily = getFontFamilyWithFallback(typography.fontFamily).split(',')[0].replace(/"/g, '').trim()
  console.log('📄 layoutRenderer DOCX: Using font:', docxFontFamily, 'fontSize:', typography.fontSize, 'for element:', element.type);

  const paragraphs: Paragraph[] = []

  if (element.content) {
    const lines = element.content.split('\n').filter(Boolean)
    lines.forEach(line => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.trim(),
              size: typography.fontSize * 2, // Convert px to half-points
              color: typography.textColor.replace('#', ''),
              font: docxFontFamily,
              bold: typography.fontWeight === "bold",
              italics: typography.italic
            })
          ],
          indent: { left: leftMargin }
        })
      )
    })
  }
  return paragraphs
}

// ---------------- PDF ----------------
export interface PDFElementData {
  id: string
  type: string
  position: { x: number; y: number; width: number; height: number }
  style: {
    fontFamily: string
    fontSize: number
    color: string
    backgroundColor: string
    padding: number
    borderRadius: number
    lineHeight: number
  }
  content: { text: string; lines: string[] }
}

export function renderElementToPdf(element: LayoutElement, style: StyleConfig, getTypography: (sectionId: string, fieldKey: string) => any): PDFElementData {
  const [typography] = getTypography(element.type, 'content');
  const pdfFontFamily = getFontFamilyWithFallback(typography.fontFamily).split(',')[0].replace(/"/g, '').trim()
  console.log('📄 layoutRenderer PDF: Using font:', pdfFontFamily, 'fontSize:', typography.fontSize, 'for element:', element.type);

  return {
    id: element.id,
    type: element.type,
    position: { x: element.x, y: element.y, width: element.width, height: element.height || 100 },
    style: {
      fontFamily: pdfFontFamily,
      fontSize: typography.fontSize, // Already in px
      color: typography.textColor,
      backgroundColor: style.backgroundColor || '#ffffff',
      padding: calculatePadding(style.margin),
      borderRadius: parseInt(style.borderRadius?.replace('px', '') || '0'),
      lineHeight: typography.lineHeight
    },
    content: {
      text: element.content || '',
      lines: element.content ? element.content.split('\n').filter(Boolean) : []
    }
  }
}

// ---------------- Layout Validation ----------------
export function validateLayout(
  elements: LayoutElement[],
  pageWidth: number = A4_WIDTH,
  pageHeight: number = A4_HEIGHT
) {
  const warnings: string[] = []
  const overlaps: Array<{ element1: string; element2: string }> = []

  elements.forEach((element, index) => {
    if (element.x < 0 || element.y < 0) warnings.push(`Element ${element.id} has negative position`)
    if (element.x + element.width > pageWidth) warnings.push(`Element ${element.id} exceeds page width`)
    if (element.y + (element.height || 100) > pageHeight) warnings.push(`Element ${element.id} exceeds page height`)

    elements.slice(index + 1).forEach(other => {
      if (elementsOverlap(element, other)) {
        overlaps.push({ element1: element.id, element2: other.id })
      }
    })
  })

  return { isValid: warnings.length === 0 && overlaps.length === 0, warnings, overlaps }
}

function elementsOverlap(el1: LayoutElement, el2: LayoutElement): boolean {
  const el1Right = el1.x + el1.width
  const el1Bottom = el1.y + (el1.height || 100)
  const el2Right = el2.x + el2.width
  const el2Bottom = el2.y + (el2.height || 100)

  return !(el1Right <= el2.x || el2Right <= el1.x || el1Bottom <= el2.y || el2Bottom <= el1.y)
}

// ---------------- Layout Stats ----------------
export function getLayoutStats(elements: LayoutElement[]) {
  if (elements.length === 0) {
    return {
      totalElements: 0,
      usedArea: 0,
      density: 0,
      averageElementSize: 0,
      largestElement: null,
      smallestElement: null
    }
  }

  const totalArea = A4_WIDTH * A4_HEIGHT
  const elementAreas = elements.map(el => el.width * (el.height || 100))
  const usedArea = elementAreas.reduce((sum, area) => sum + area, 0)
  const averageElementSize = usedArea / elements.length

  const largestElement = elements.reduce((largest, current) => {
    const currentArea = current.width * (current.height || 100)
    const largestArea = largest.width * (largest.height || 100)
    return currentArea > largestArea ? current : largest
  })

  const smallestElement = elements.reduce((smallest, current) => {
    const currentArea = current.width * (current.height || 100)
    const smallestArea = smallest.width * (smallest.height || 100)
    return currentArea < smallestArea ? current : smallest
  })

  return { totalElements: elements.length, usedArea, density: (usedArea / totalArea) * 100, averageElementSize, largestElement, smallestElement }
}