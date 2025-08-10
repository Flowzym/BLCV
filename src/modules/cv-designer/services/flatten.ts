import type { Section, TextPart, RepeaterPart } from "../canvas/types";

const DBG = (msg: string, ...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
    console.log('[DESIGNER]', msg, ...args);
  } else {
    console.log('[DESIGNER*]', msg, ...args);
  }
};

export interface CanvasElement {
  type: 'text';
  id: string;
  left: number;
  top: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
}

export function flattenSectionsToElements(sections: Section[]): CanvasElement[] {
  const elements: CanvasElement[] = [];
  
  DBG('flattenSectionsToElements input:', { sectionsCount: sections.length });
  
  sections.forEach((section, sectionIndex) => {
    DBG(`Processing section ${sectionIndex}:`, { id: section.id, title: section.title, partsCount: section.parts.length });
    
    section.parts.forEach((part, partIndex) => {
      if (part.type === 'text') {
        const textPart = part as TextPart;
        const element: CanvasElement = {
          type: 'text',
          id: textPart.id,
          left: textPart.x,
          top: textPart.y,
          text: (textPart.text ?? '').trim(),
          fontSize: textPart.fontSize,
          fontFamily: textPart.fontFamily,
          bold: textPart.bold,
          italic: textPart.italic
        };
        elements.push(element);
        DBG(`Added TextPart:`, { id: element.id, text: element.text, pos: `${element.left},${element.top}` });
      }
      
      if (part.type === 'repeater') {
        const repeaterPart = part as RepeaterPart;
        DBG(`Processing repeater with ${repeaterPart.items.length} items`);
        
        repeaterPart.items.forEach((item, itemIndex) => {
          const offsetY = itemIndex * 64; // stack items vertically
          DBG(`Processing repeater item ${itemIndex}:`, { id: item.id, partsCount: item.parts.length, offsetY });
          
          item.parts.forEach((itemPart) => {
            if (itemPart.type === 'text') {
              const element: CanvasElement = {
                type: 'text',
                id: `${itemPart.id}-${itemIndex}`,
                left: itemPart.x,
                top: (itemPart.y ?? 0) + offsetY,
                text: (itemPart.text ?? '').trim(),
                fontSize: itemPart.fontSize,
                fontFamily: itemPart.fontFamily,
                bold: itemPart.bold,
                italic: itemPart.italic
              };
              elements.push(element);
              DBG(`Added RepeaterPart text:`, { id: element.id, text: element.text, pos: `${element.left},${element.top}` });
            }
          });
        });
      }
    });
  });
  
  DBG('flattenSectionsToElements output:', { elementsCount: elements.length, firstText: elements[0]?.text });
  return elements;
}