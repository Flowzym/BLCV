export interface SectionProps { visible?: boolean; gridSpan?: number; backgroundColor?: string; borderColor?: string; borderWidth?: string; borderRadius?: string; }
export interface Section { id: string; type: string; title?: string; content?: string; x?: number; y?: number; width?: number; height?: number; props?: SectionProps; }
export interface LayoutElement { id: string; type: string; x: number; y: number; width: number; height?: number; title?: string; content?: string; props?: SectionProps; }
export interface LayoutGroup extends LayoutElement { children: LayoutElement[]; }
