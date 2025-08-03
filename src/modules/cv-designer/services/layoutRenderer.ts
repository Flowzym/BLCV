/**
 * layoutRenderer.ts – Unified non-React rendering logic
 */
import { LayoutElement } from '../types/section';
import { StyleConfig } from '../../../types/cv-designer';
import { Document, Paragraph, TextRun } from 'docx';

// --- A4 constants ---
export const A4_WIDTH = 595;
export const A4_HEIGHT = 842;

// --- Utilities ---
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
  const hex = color.replace('#', '');
  return {
    r: parseInt(hex.substr(0, 2), 16),
    g: parseInt(hex.substr(2, 2), 16),
    b: parseInt(hex.substr(4, 2), 16)
  };
}

// --- Canvas Rendering (returns instruction object) ---
export interface CanvasElementData {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style: StyleConfig;
}

export function renderElementToCanvas(element: LayoutElement, style: StyleConfig): CanvasElementData {
  return {
    id: element.id,
    type: element.type,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height || 100,
    content: element.content || "",
    style
  };
}

// --- DOCX Rendering ---
export function renderElementToDocx(element: LayoutElement, style: StyleConfig): Paragraph[] {
  const fontSize = calculateFontSize(style.fontSize);
  const leftMargin = Math.round(element.x * 20);
  const paragraphs: Paragraph[] = [];

  if (element.content) {
    const lines = element.content.split("\n").filter(Boolean);
    lines.forEach(line => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.trim(),
              size: fontSize * 2,
              color: (style.textColor || "#000000").replace("#", "")
            })
          ],
          indent: { left: leftMargin },
        })
      );
    });
  }
  return paragraphs;
}

// --- PDF Rendering ---
export interface PDFElementData {
  id: string;
  type: string;
  position: { x: number; y: number; width: number; height: number };
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    backgroundColor: string;
    padding: number;
    borderRadius: number;
    lineHeight: number;
  };
  content: { text: string; lines: string[] };
}

export function renderElementToPdf(element: LayoutElement, style: StyleConfig): PDFElementData {
  return {
    id: element.id,
    type: element.type,
    position: { x: element.x, y: element.y, width: element.width, height: element.height || 100 },
    style: {
      fontFamily: style.fontFamily,
      fontSize: calculateFontSize(style.fontSize),
      color: style.textColor || "#000000",
      backgroundColor: style.backgroundColor || "#ffffff",
      padding: calculatePadding(style.margin),
      borderRadius: parseInt(style.borderRadius?.replace("px", "") || "0"),
      lineHeight: style.lineHeight
    },
    content: {
      text: element.content || "",
      lines: element.content ? element.content.split("\n").filter(Boolean) : []
    }
  };
}
