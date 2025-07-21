/**
 * Interface für das Ergebnis der Datumseingabe-Parsing
 */
export interface ParsedMonthYear {
  month?: string;
  year?: string;
  formatted: string;
  isValid: boolean;
  shouldMoveCursor?: boolean;
}

/**
 * Formatiert einen Zeitraum für die Anzeige
 */
export function formatZeitraum(
  startMonth: string | null,
  startYear: string | null,
  endMonth: string | null,
  endYear: string | null,
  isCurrent: boolean,
): string {
  const format = (m: string | null | undefined, y: string | null | undefined) => {
    if (!y) return '';
    return m ? `${m}/${y}` : y;
  };

  const start = format(startMonth ?? undefined, startYear ?? undefined);
  const end = isCurrent ? 'heute' : format(endMonth ?? undefined, endYear ?? undefined);

  if (!start && !end) return '';
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

/**
 * Parst eine Monat/Jahr-Eingabe und gibt strukturierte Informationen zurück
 */
export function parseMonthYearInput(input: string, previousValue?: string): ParsedMonthYear {
  const cleaned = input.replace(/[^\d/]/g, '');
  
  if (!cleaned) {
    return { formatted: '', isValid: false };
  }
  
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    const monthPart = parts[0];
    const yearPart = parts[1];
    
    return {
      month: monthPart,
      year: yearPart,
      formatted: cleaned,
      isValid: isValidMonthYear(monthPart, yearPart)
    };
  }
  
  // Nur Ziffern ohne Schrägstrich
  if (cleaned.length <= 2) {
    return {
      month: cleaned,
      formatted: cleaned,
      isValid: cleaned.length === 2 && isValidTwoDigitMonth(cleaned)
    };
  } else {
    return {
      year: cleaned,
      formatted: cleaned,
      isValid: cleaned.length === 4 && isValidFourDigitYear(cleaned)
    };
  }
}

/**
 * Parst rohe Monat/Jahr-Eingabe ohne Formatierung
 */
export function parseRawMonthYearInput(input: string): { monthPart?: string; yearPart?: string; isValid: boolean } {
  if (!input) return { isValid: false };
  
  if (input.includes('/')) {
    const parts = input.split('/');
    return {
      monthPart: parts[0] || undefined,
      yearPart: parts[1] || undefined,
      isValid: true
    };
  }
  
  if (input.length <= 2) {
    return {
      monthPart: input,
      isValid: isValidTwoDigitMonth(input)
    };
  } else {
    return {
      yearPart: input,
      isValid: isValidFourDigitYear(input)
    };
  }
}

/**
 * Formatiert einen Monat mit führender Null
 */
export function formatMonth(month: string): string {
  const num = parseInt(month, 10);
  if (isNaN(num) || num < 1 || num > 12) return month;
  return String(num).padStart(2, '0');
}

/**
 * Prüft ob ein zweistelliger Monat gültig ist
 */
export function isValidTwoDigitMonth(month: string): boolean {
  if (month.length !== 2) return false;
  const num = parseInt(month, 10);
  return !isNaN(num) && num >= 1 && num <= 12;
}

/**
 * Prüft ob ein vierstelliges Jahr gültig ist
 */
export function isValidFourDigitYear(year: string): boolean {
  if (year.length !== 4) return false;
  const num = parseInt(year, 10);
  return !isNaN(num) && num >= 1900 && num <= 2099;
}

/**
 * Prüft ob Monat und Jahr zusammen gültig sind
 */
export function isValidMonthYear(month?: string, year?: string): boolean {
  if (!month && !year) return false;
  if (month && !isValidTwoDigitMonth(month)) return false;
  if (year && !isValidFourDigitYear(year)) return false;
  return true;
}