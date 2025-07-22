import React, { useRef, useState, useEffect, forwardRef } from 'react';

interface DateInputBaseProps {
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
 * Basis-Komponente für Datumseingabe (TT.MM.JJJJ)
 * Basiert auf der bewährten MonthYearInputBase-Logik mit Verbesserungen
 */
const DateInputBase = forwardRef<HTMLInputElement, DateInputBaseProps>(({
  value,
  onChange,
  placeholder = "TT.MM.JJJJ",
  disabled = false,
  className = "",
  onFocus,
  onBlur,
  onKeyDown
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(value);

  // Combine internal ref with forwarded ref
  const setRefs = (instance: HTMLInputElement | null) => {
    inputRef.current = instance;
    if (typeof ref === 'function') {
      ref(instance);
    } else if (ref && typeof ref === 'object') {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = instance;
    }
  };

  // Synchronisiere mit externem value
  useEffect(() => {
    console.log('DateInputBase: External value changed from', internalValue, 'to', value);
    setInternalValue(value);
  }, [value]);

  /**
   * Formatiert die Eingabe während des Tippens
   */
  const applyFormatting = (input: string): string => {
    // Nur Ziffern zulassen
    const cleaned = input.replace(/[^\d]/g, '');
    
    if (cleaned.length === 0) {
      return '';
    }
    
    // Auto-Formatierung: TTMMJJJJ -> TT.MM.JJJJ
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    } else {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 4)}.${cleaned.slice(4, 8)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const input = inputRef.current;
    if (!input) return;

    console.log('DateInputBase: handleChange called with:', newValue);

    // Aktuelle Cursor-Position merken
    const cursorPos = input.selectionStart ?? 0;
    const oldValue = internalValue;
    
    // Formatierung anwenden
    const formatted = applyFormatting(newValue);
    
    console.log('DateInputBase: Formatted value:', formatted);
    
    // Neue Cursor-Position berechnen
    let newCursorPos = cursorPos;
    
    // Automatische Punkte hinzugefügt
    if (formatted.length > oldValue.length) {
      const dotsAdded = (formatted.match(/\./g) || []).length - (oldValue.match(/\./g) || []).length;
      if (dotsAdded > 0) {
        newCursorPos = cursorPos + dotsAdded;
      }
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
    
    // Intelligente Selektion basierend auf Position
    if (currentValue.includes('.')) {
      const firstDot = currentValue.indexOf('.');
      const secondDot = currentValue.lastIndexOf('.');
      
      if (pos <= firstDot) {
        // Tag selektieren (TT)
        setTimeout(() => input.setSelectionRange(0, firstDot), 0);
      } else if (pos <= secondDot) {
        // Monat selektieren (MM)
        setTimeout(() => input.setSelectionRange(firstDot + 1, secondDot), 0);
      } else {
        // Jahr selektieren (JJJJ)
        setTimeout(() => input.setSelectionRange(secondDot + 1, currentValue.length), 0);
      }
    } else {
      // Alles selektieren wenn keine Punkte
      setTimeout(() => input.setSelectionRange(0, currentValue.length), 0);
    }
  };

  const handleBlur = () => {
    console.log('DateInputBase: handleBlur called with value:', internalValue);
    console.log('DateInputBase: internalValue length:', internalValue.length);
    
    // Nur bei komplett leeren Feldern oder eindeutig ungültigen VOLLSTÄNDIGEN Daten löschen
    
    if (!internalValue || internalValue.trim() === '') {
      console.log('DateInputBase: Empty value, keeping as is');
      onBlur?.();
      return;
    }
    
    const parts = internalValue.split('.');
    console.log('DateInputBase: parts:', parts);
    
    // Nur bei vollständigen Eingaben validieren (alle 3 Teile vorhanden und korrekte Länge)
    if (parts.length === 3 && parts[0] && parts[1] && parts[2] && 
        parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      
      console.log('DateInputBase: Parsed date:', { day, month, year });
      
      // Strenge Validierung nur bei vollständigen Eingaben
      let isValid = true;
      if (day < 1 || day > 31) isValid = false;
      if (month < 1 || month > 12) isValid = false;
      if (year < 1900 || year > 2099) isValid = false;
      
      console.log('DateInputBase: isValid:', isValid);
      
      if (!isValid) {
        console.log('DateInputBase: Invalid complete date, clearing field');
        setInternalValue('');
        onChange('');
      } else {
        console.log('DateInputBase: Valid complete date, keeping value');
      }
    } else {
      // Unvollständige Eingaben bleiben IMMER erhalten
      console.log('DateInputBase: Incomplete date, keeping value:', internalValue);
    }
    
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
      
      if (currentValue.includes('.')) {
        const firstDot = currentValue.indexOf('.');
        const secondDot = currentValue.lastIndexOf('.');
        
        // Tag selektiert (TT)
        if (start === 0 && end === firstDot) {
          e.preventDefault();
          const monthPart = currentValue.substring(firstDot + 1, secondDot);
          const yearPart = currentValue.substring(secondDot + 1);
          const newValue = `${digit}.${monthPart}.${yearPart}`;
          
          setInternalValue(newValue);
          onChange(newValue);
          
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.setSelectionRange(1, 1);
            }
          }, 0);
          return;
        }
        
        // Monat selektiert (MM)
        if (start === firstDot + 1 && end === secondDot) {
          e.preventDefault();
          const dayPart = currentValue.substring(0, firstDot);
          const yearPart = currentValue.substring(secondDot + 1);
          const newValue = `${dayPart}.${digit}.${yearPart}`;
          
          setInternalValue(newValue);
          onChange(newValue);
          
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.setSelectionRange(firstDot + 2, firstDot + 2);
            }
          }, 0);
          return;
        }
        
        // Jahr selektiert (JJJJ)
        if (start === secondDot + 1 && end === currentValue.length) {
          e.preventDefault();
          const dayPart = currentValue.substring(0, firstDot);
          const monthPart = currentValue.substring(firstDot + 1, secondDot);
          const newValue = `${dayPart}.${monthPart}.${digit}`;
          
          setInternalValue(newValue);
          onChange(newValue);
          
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.setSelectionRange(secondDot + 2, secondDot + 2);
            }
          }, 0);
          return;
        }
      }
    }
    
    // Jahr-Navigation mit Pfeiltasten
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const parts = currentValue.split('.');
      if (parts.length === 3 && parts[2].length === 4) {
        const increment = e.key === 'ArrowUp' ? 1 : -1;
        let newYear = parseInt(parts[2], 10) + increment;
        
        if (newYear < 1900) newYear = 1900;
        if (newYear > 2099) newYear = 2099;
        
        const newValue = `${parts[0]}.${parts[1]}.${newYear}`;
        setInternalValue(newValue);
        onChange(newValue);
        
        setTimeout(() => {
          if (inputRef.current) {
            const secondDot = newValue.lastIndexOf('.');
            inputRef.current.setSelectionRange(secondDot + 1, newValue.length);
          }
        }, 0);
      }
    }
    
    // Automatisches Weiterschalten zwischen Segmenten nach Eingabe
    setTimeout(() => {
      if (inputRef.current) {
        const currentVal = inputRef.current.value;
        if (currentVal.includes('.')) {
          const firstDot = currentVal.indexOf('.');
          const secondDot = currentVal.lastIndexOf('.');
          const dayPart = currentVal.substring(0, firstDot);
          const monthPart = currentVal.substring(firstDot + 1, secondDot);
          const yearPart = currentVal.substring(secondDot + 1);
          
          // Nach 2-stelligem Tag -> Monat markieren
          if (dayPart.length === 2 && monthPart.length === 0) {
            inputRef.current.setSelectionRange(firstDot + 1, secondDot);
          }
          // Nach 2-stelligem Monat -> Jahr markieren
          else if (monthPart.length === 2 && yearPart.length === 0) {
            inputRef.current.setSelectionRange(secondDot + 1, currentVal.length);
          }
          // WICHTIG: Jahr wird NICHT nach 2 Ziffern markiert - 4 Ziffern möglich!
        }
      }
    }, 10);
    
    onKeyDown?.(e);
  };

  // Bestimme Textfarbe basierend auf Inhalt
  const isPlaceholderOnly = !internalValue || internalValue.trim() === '';
  const textColor = isPlaceholderOnly ? '#9CA3AF' : '#1F2937';

  return (
    <input
      ref={setRefs}
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
      maxLength={10}
      className={`w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 ${className}`}
      style={{ 
        '--tw-ring-color': '#F29400',
        color: textColor
      } as React.CSSProperties}
    />
  );
});

DateInputBase.displayName = 'DateInputBase';

export default DateInputBase;