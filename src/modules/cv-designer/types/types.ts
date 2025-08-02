// 📄 src/modules/cv-designer/layout-canvas/types.ts

import { Section } from "@/modules/cv-designer/types/section"

export interface PositionedSection {
  section: Section
  x: number
  y: number
  width: number
  height: number
}

export interface CanvasSettings {
  snapSize: number
  showGrid: boolean
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
  gridColor: string
  snapEnabled: boolean
}

export interface LayoutCanvasConfig {
  defaultSnapSize: number
  minSnapSize: number
  maxSnapSize: number
  defaultCanvasSize: { width: number; height: number }
  gridPattern: 'dots' | 'lines' | 'both'
  showRulers: boolean
  showGuides: boolean
}

export interface DragState {
  isDragging: boolean
  draggedElementId: string | null
  startPosition: { x: number; y: number }
  currentPosition: { x: number; y: number }
}

export interface ResizeState {
  isResizing: boolean
  resizedElementId: string | null
  resizeHandle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null
  startSize: { width: number; height: number }
  startPosition: { x: number; y: number }
}

export interface SelectionState {
  selectedElementIds: string[]
  selectionBox: {
    x: number
    y: number
    width: number
    height: number
  } | null
}

export interface LayoutTemplate {
  id: string
  name: string
  description: string
  layout: PositionedSection[]
  metadata: {
    tags: string[]
    category: string
    createdAt: string
    updatedAt: string
  }
}