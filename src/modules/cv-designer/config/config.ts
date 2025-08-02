// 📄 src/modules/cv-designer/layout-canvas/config.ts

import { CanvasSettings, LayoutCanvasConfig } from "./types"

export const DEFAULT_CANVAS_SETTINGS: CanvasSettings = {
  snapSize: 20,
  showGrid: true,
  canvasWidth: 800,
  canvasHeight: 1200,
  backgroundColor: "#f8fafc",
  gridColor: "#e2e8f0",
  snapEnabled: true
}

export const LAYOUT_CANVAS_CONFIG: LayoutCanvasConfig = {
  defaultSnapSize: 20,
  minSnapSize: 5,
  maxSnapSize: 100,
  defaultCanvasSize: { width: 800, height: 1200 },
  gridPattern: 'dots',
  showRulers: true,
  showGuides: true
}

export const STORAGE_KEY_SETTINGS = 'cv-canvas-settings'
export const STORAGE_KEY_LAYOUT = 'cv-canvas-layout'
export const STORAGE_KEY_TEMPLATES = 'cv-layout-templates'

export const ELEMENT_DEFAULTS = {
  width: 300,
  height: 100,
  minWidth: 50,
  minHeight: 30,
  maxWidth: 1000,
  maxHeight: 800
}

export const RESIZE_HANDLES = [
  'nw', 'ne', 'sw', 'se', // Ecken
  'n', 's', 'e', 'w'     // Seiten
] as const

export const GRID_PATTERNS = {
  dots: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
  lines: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
  both: 'radial-gradient(circle, #d1d5db 1px, transparent 1px), linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)'
}