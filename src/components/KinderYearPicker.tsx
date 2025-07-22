import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

interface KinderYearPickerProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onInputEnter?: () => void;
  highlightClass?: string;
}

const KinderYearPicker = forwardRef<HTMLInputElement, KinderYearPickerProps>(({ 
  value, 
  onChange, 
  onAdd,
  onInputEnter,
  highlightClass = ""
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate years from current year down to 1901 (descending)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1901 + 1 }, (_, i) => currentYear - i);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleYearSelect = (year: number) => {
    onChange(String(year));
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input, max 4 digits
    const numericValue = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
    onChange(numericValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd();
      onInputEnter?.();
    }
  };

  const isValidYear = (yearStr: string) => {
    if (yearStr.length !== 4) return false;
    const year = parseInt(yearStr, 10);
    return !isNaN(year) && year >= 1901 && year <= currentYear;
  };

  const hasValue = value.trim().length > 0;
  const isValid = isValidYear(value);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={handleInputChange}
            onFocus={() => {
              setIsFocused(true);
              setIsOpen(true);
            }}
            onBlur={() => setIsFocused(false)}
            onKeyPress={handleKeyPress}
            className={`w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 pr-8 ${
              hasValue && !isValid 
                ? 'border-red-500' 
                : highlightClass || 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#F29400' } as React.CSSProperties}
            placeholder="Geburtsjahr"
            maxLength={4}
          />
          
          {/* Dropdown Arrow */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        
        {hasValue && (
          <button
            onClick={onAdd}
            className="w-10 h-10 text-white rounded-md transition-colors duration-200 flex items-center justify-center"
            style={{ backgroundColor: '#F6A800' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F29400'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F6A800'}
          >
            <Plus className="w-7 h-7" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
          {years.map(year => (
            <button
              key={year}
              onClick={() => handleYearSelect(year)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                value === String(year) ? 'text-white' : 'text-gray-900'
              }`}
              style={value === String(year) ? { backgroundColor: '#F29400' } : {}}
            >
              {year}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

KinderYearPicker.displayName = 'KinderYearPicker';

export default KinderYearPicker;