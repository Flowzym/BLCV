export interface CanvasSettings { canvasWidth: number; canvasHeight: number; snapSize: number; snapEnabled: boolean; showGrid: boolean; backgroundColor?: string; }
export interface DragState { isDragging: boolean; draggedElementId: string | null; startPosition: { x: number; y: number }; currentPosition: { x: number; y: number }; }
export interface ResizeState { isResizing: boolean; resizedElementId: string | null; startSize: { width: number; height: number }; currentSize: { width: number; height: number }; }
export interface SelectionState { selectedElementIds: string[]; selectionBox: { x: number; y: number; width: number; height: number } | null; }
export interface PositionedSection { id: string; x: number; y: number; width: number; height: number; }
