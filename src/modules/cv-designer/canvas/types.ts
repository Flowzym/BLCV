export type TextPart = {
  type: 'text';
  id: string;
  x: number; 
  y: number; 
  w?: number; 
  h?: number;
  text: string;            // verbindlich, NICHT "value"/"content"
  fontSize?: number; 
  fontFamily?: string; 
  lineHeight?: number;
  bold?: boolean; 
  italic?: boolean;
};

export type RepeaterPart = {
  type: 'repeater';
  id: string;
  items: Array<{
    id: string;
    parts: TextPart[];     // nur Text genügt fürs Erste
  }>;
};

export type Section = {
  id: string;
  title?: string;
  parts: Array<TextPart | RepeaterPart>;
};