import { useState, useEffect } from 'react';
import MonthYearInputBase from './MonthYearInputBase';
import { parseMonthYearInput } from '../utils/dateUtils';

interface MonthYearInputProps {
  value: string;
  onChange: (val: string) => void;
}

/**
 * Monat/Jahr-Eingabefeld mit Validierung
 * Nutzt MonthYearInputBase für die Grundfunktionalität
 */
export default function MonthYearInput({ value, onChange }: MonthYearInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  // Synchronisiere mit externem Wert
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange(newValue);
  };

  const handleBlur = () => {
    // Validierung beim Verlassen des Feldes
    const parsed = parseMonthYearInput(internalValue);
    if (!parsed.isValid && internalValue.trim()) {
      // Bei ungültiger Eingabe zurücksetzen
      setInternalValue('');
      onChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Jahr-Navigation mit Pfeiltasten
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const parsed = parseMonthYearInput(internalValue);
      if (parsed.year && parsed.year.length === 4) {
        const increment = e.key === 'ArrowUp' ? 1 : -1;
        let newYear = parseInt(parsed.year, 10) + increment;
        
        // Jahr-Grenzen einhalten
        if (newYear < 1955) newYear = 1955;
        if (newYear > 2055) newYear = 2055;
        
        const newValue = parsed.month ? `${parsed.month}/${newYear}` : String(newYear);
        handleChange(newValue);
      }
    }
  };

  return (
    <MonthYearInputBase
      value={internalValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-20"
    />
  );
}
