import type { CanvasSettings } from "@/components/layout-canvas/types";
export const DEFAULT_CANVAS_SETTINGS: CanvasSettings = { canvasWidth: 595, canvasHeight: 842, snapSize: 20, snapEnabled: true, showGrid: true, backgroundColor: "#ffffff" };
export const ELEMENT_DEFAULTS = { height: 80, minWidth: 50, minHeight: 40, maxWidth: 2000, maxHeight: 2000 };
export const RESIZE_HANDLES = ['top','bottom','left','right','topLeft','topRight','bottomLeft','bottomRight'] as const;
export const GRID_PATTERNS = { dots: 'dots', lines: 'lines' } as const;
