/**
 * Interface für das Ergebnis der Datumseingabe-Parsing
 */
export interface ParsedMonthYear {
  month?: string;
  year?: string;
  formatted: string;
  isValid: boolean;
  shouldMoveCursor?: boolean;
  shouldMoveCursor?: boolean;
}