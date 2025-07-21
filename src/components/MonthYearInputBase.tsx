import React, { useRef, useState, useEffect } from 'react';
import { parseRawMonthYearInput, formatMonth, isValidTwoDigitMonth, isValidFourDigitYear } from '../utils/dateUtils';

interface MonthYearInputBaseProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Basis-Komponente für Monat/Jahr-Eingabe
 * Endgültig korrigierte Implementierung
 */
export default function MonthYearInputBase({
  value,
  onChange,
  placeholder = "MM/YYYY",
  disabled = false,
  className = "",
  onFocus,
  onBlur,
  onKeyDown
}: MonthYearInputBaseProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(value);

  // Synchronisiere mit externem value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  /**
   * Formatiert die Eingabe während des Tippens
   */
  const applyFormatting = (input: string): string => {
    // Nur Ziffern und Schrägstriche zulassen
    const cleaned = input.replace(/[^\d/]/g, '');
    
    // Wenn bereits ein Schrägstrich vorhanden ist, nicht weiter formatieren
    if (cleaned.includes('/')) {
      const parts = cleaned.split('/');
      const monthPart = parts[0].slice(0, 2); // Max 2 Ziffern für Monat
      const yearPart = parts[1].slice(0, 4);  // Max 4 Ziffern für Jahr
      return monthPart + (yearPart ? `/${yearPart}` : '/');
    }
    
    // Ohne Schrägstrich
    if (cleaned.length === 0) {
      return '';
    }
    
    // 1-2 Ziffern: könnte Monat sein
    // Wenn wir 2 Ziffern haben und es ein gültiger Monat ist, automatisch "/" hinzufügen
    if (cleaned.length === 2) {
      const monthNum = parseInt(cleaned, 10);
      if (monthNum >= 1 && monthNum <= 12) {
        return `${cleaned}/`;
      }
      return cleaned;
    }
    
    if (cleaned.length === 1) {
      return cleaned;
    }
    
    // 3+ Ziffern: erste 2 als Monat, Rest als Jahr
    const monthPart = cleaned.slice(0, 2);
    const yearPart = cleaned.slice(2, 6); // Max 4 Ziffern für Jahr
    
    // Prüfen ob die ersten 2 Ziffern ein gültiger Monat sind
    const monthNum = parseInt(monthPart, 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return `${monthPart}/${yearPart}`;
    }
    
    // Wenn nicht gültiger Monat, als Jahr behandeln
    return cleaned.slice(0, 4);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const input = inputRef.current;
    if (!input) return;

    // Aktuelle Cursor-Position merken
    const cursorPos = input.selectionStart ?? 0;
    const oldValue = internalValue;
    
    // Formatierung anwenden
    const formatted = applyFormatting(newValue);
    
    // Neue Cursor-Position berechnen
    let newCursorPos = cursorPos;
    
    // Spezialfall: Automatischer Schrägstrich nach gültigem 2-stelligen Monat
    if (formatted.includes('/') && !oldValue.includes('/') && !newValue.includes('/') && formatted.length === 3) {
      // "11" → "11/" - Cursor soll nach dem "/" stehen
      newCursorPos = 3;
    }
    // Wenn ein Schrägstrich automatisch hinzugefügt wurde bei längerer Eingabe
    else if (formatted.includes('/') && !oldValue.includes('/') && !newValue.includes('/')) {
      const slashPos = formatted.indexOf('/');
      newCursorPos = slashPos + 1;
    }
    // Wenn Text länger wurde
    else if (formatted.length > oldValue.length) {
      const diff = formatted.length - oldValue.length;
      newCursorPos = cursorPos + diff;
    }
    // Wenn Text kürzer wurde
    else if (formatted.length < oldValue.length) {
      newCursorPos = Math.min(cursorPos, formatted.length);
    }
    
    // Wert aktualisieren
    setInternalValue(formatted);
    onChange(formatted);
    
    // Cursor-Position setzen
    setTimeout(() => {
      if (inputRef.current) {
        const finalPos = Math.min(newCursorPos, formatted.length);
        inputRef.current.setSelectionRange(finalPos, finalPos);
      }
    }, 0);
  };

  const handleClick = () => {
    const input = inputRef.current;
    if (!input) return;
    
    const pos = input.selectionStart ?? 0;
    const currentValue = internalValue;
    
    // Intelligente Selektion basierend auf Position und Inhalt
    if (currentValue.includes('/')) {
      const slashPos = currentValue.indexOf('/');
      if (pos <= slashPos) {
        // Monat selektieren
        setTimeout(() => input.setSelectionRange(0, slashPos), 0);
      } else {
        // Jahr selektieren
        setTimeout(() => input.setSelectionRange(slashPos + 1, currentValue.length), 0);
      }
    } else if (currentValue.length === 4) {
      // Nur Jahr: ganzes Jahr selektieren
      setTimeout(() => input.setSelectionRange(0, currentValue.length), 0);
    } else if (currentValue.length <= 2) {
      // Nur Monat: ganzen Monat selektieren
      setTimeout(() => input.setSelectionRange(0, currentValue.length), 0);
    } else {
      // Fallback: alles selektieren
      setTimeout(() => input.setSelectionRange(0, currentValue.length), 0);
    }
  };

  const handleBlur = () => {
    const parsed = parseRawMonthYearInput(internalValue);
    let finalValue = internalValue;
    
    // Finale Formatierung und Validierung
    if (parsed.monthPart && !parsed.yearPart) {
      // Nur Monat: führende Null hinzufügen wenn nötig
      if (parsed.monthPart.length === 1) {
        const num = parseInt(parsed.monthPart, 10);
        if (num >= 1 && num <= 9) {
          finalValue = formatMonth(parsed.monthPart);
        } else {
          finalValue = ''; // Ungültiger Monat
        }
      } else if (parsed.monthPart.length === 2) {
        if (isValidTwoDigitMonth(parsed.monthPart)) {
          finalValue = parsed.monthPart;
        } else {
          finalValue = ''; // Ungültiger Monat
        }
      } else {
        finalValue = ''; // Zu lang
      }
    } else if (parsed.yearPart && !parsed.monthPart) {
      // Nur Jahr: validieren
      if (parsed.yearPart.length === 4) {
        if (isValidFourDigitYear(parsed.yearPart)) {
          finalValue = parsed.yearPart;
        } else {
          finalValue = ''; // Ungültiges Jahr
        }
      } else {
        finalValue = ''; // Unvollständiges Jahr
      }
    } else if (parsed.monthPart && parsed.yearPart) {
      // Monat und Jahr: beide validieren und formatieren
      let validMonth = false;
      let validYear = false;
      let formattedMonth = parsed.monthPart;
      
      if (parsed.monthPart.length === 1) {
        const num = parseInt(parsed.monthPart, 10);
        if (num >= 1 && num <= 9) {
          formattedMonth = formatMonth(parsed.monthPart);
          validMonth = true;
        }
      } else if (parsed.monthPart.length === 2) {
        validMonth = isValidTwoDigitMonth(parsed.monthPart);
        formattedMonth = parsed.monthPart;
      }
      
      if (parsed.yearPart.length === 4) {
        validYear = isValidFourDigitYear(parsed.yearPart);
      }
      
      if (validMonth && validYear) {
        finalValue = `${formattedMonth}/${parsed.yearPart}`;
      } else if (validMonth) {
        finalValue = formattedMonth;
      } else if (validYear) {
        finalValue = parsed.yearPart;
      } else {
        finalValue = ''; // Beide ungültig
      }
    } else if (internalValue.trim() && !parsed.isValid) {
      finalValue = ''; // Ungültige Eingabe
    }
    
    // Wert aktualisieren wenn geändert
    if (finalValue !== internalValue) {
      setInternalValue(finalValue);
      onChange(finalValue);
    }
    
    // Externe onBlur-Handler aufrufen
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = inputRef.current;
    if (!input) return;
    
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const hasSelection = start !== end;
    const currentValue = internalValue;
    
    // Spezialbehandlung für Ziffern-Eingabe bei Selektion
    if (/^\d$/.test(e.key) && hasSelection) {
      const digit = e.key;
      
      // Fall 1: Monat ist selektiert (MM/YYYY)
      if (currentValue.includes('/')) {
        const slashPos = currentValue.indexOf('/');
        if (start === 0 && end === slashPos) {
          e.preventDefault();
          
          const yearPart = currentValue.substring(slashPos + 1);
          const newValue = `${digit}/${yearPart}`;
          
          setInternalValue(newValue);
          onChange(newValue);
          
          // Cursor nach der ersten Ziffer positionieren
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.setSelectionRange(1, 1);
            }
          }, 0);
          return;
        }
        
        // Fall 2: Jahr ist selektiert (MM/YYYY)
        if (start === slashPos + 1 && end === currentValue.length) {
          e.preventDefault();
          
          const monthPart = currentValue.substring(0, slashPos + 1);
          const newValue = `${monthPart}${digit}`;
          setInternalValue(newValue);
          onChange(newValue);
          
          // Cursor nach der Ziffer positionieren
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.setSelectionRange(slashPos + 2, slashPos + 2);
            }
          }, 0);
          return;
        }
      }
      
      // Fall 3: Alles ist selektiert oder nur Jahr vorhanden
      if (start === 0 && end === currentValue.length) {
        e.preventDefault();
        
        setInternalValue(digit);
        onChange(digit);
        
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(1, 1);
          }
        }, 0);
        return;
      }
    }
    
    // Nach normaler Eingabe prüfen ob Jahr markiert werden soll
    setTimeout(() => {
      if (inputRef.current) {
        const currentVal = inputRef.current.value;
        if (currentVal.includes('/')) {
          const slashPos = currentVal.indexOf('/');
          const monthPart = currentVal.substring(0, slashPos);
          const yearPart = currentVal.substring(slashPos + 1);
          // Wenn Monat jetzt 2-stellig und gültig ist, Jahr markieren
          if (monthPart.length === 2 && isValidTwoDigitMonth(monthPart) && yearPart.length === 4) {
            inputRef.current.setSelectionRange(slashPos + 1, currentVal.length);
          }
        }
      }
    }, 10);
    
    // Externe KeyDown-Handler aufrufen
    onKeyDown?.(e);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={internalValue}
      onChange={handleChange}
      onClick={handleClick}
      onFocus={onFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      inputMode="numeric"
      maxLength={7}
      className={`w-28 h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 ${className}`}
      style={{ '--tw-ring-color': '#F29400' } as React.CSSProperties}
    />
  );
}