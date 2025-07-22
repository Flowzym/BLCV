import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Globe, ChevronDown, X } from 'lucide-react';

interface CountryDropdownProps {
  value: string;
  onChange: (country: string) => void;
  label?: string;
  placeholder?: string;
  onInputEnter?: () => void;
  highlightClass?: string;
}

const COUNTRIES = [
  { name: 'Österreich', flag: '🇦🇹' },
  { name: 'Deutschland', flag: '🇩🇪' },
  { name: 'Schweiz', flag: '🇨🇭' },
  { name: 'Italien', flag: '🇮🇹' },
  { name: 'Frankreich', flag: '🇫🇷' },
  { name: 'Spanien', flag: '🇪🇸' },
  { name: 'Niederlande', flag: '🇳🇱' },
  { name: 'Belgien', flag: '🇧🇪' },
  { name: 'Polen', flag: '🇵🇱' },
  { name: 'Tschechien', flag: '🇨🇿' },
  { name: 'Slowakei', flag: '🇸🇰' },
  { name: 'Ungarn', flag: '🇭🇺' },
  { name: 'Slowenien', flag: '🇸🇮' },
  { name: 'Kroatien', flag: '🇭🇷' },
  { name: 'Vereinigtes Königreich', flag: '🇬🇧' },
  { name: 'Irland', flag: '🇮🇪' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Griechenland', flag: '🇬🇷' },
  { name: 'Dänemark', flag: '🇩🇰' },
  { name: 'Schweden', flag: '🇸🇪' },
  { name: 'Norwegen', flag: '🇳🇴' },
  { name: 'Finnland', flag: '🇫🇮' },
  { name: 'Luxemburg', flag: '🇱🇺' },
  { name: 'Malta', flag: '🇲🇹' },
  { name: 'Zypern', flag: '🇨🇾' },
  { name: 'Estland', flag: '🇪🇪' },
  { name: 'Lettland', flag: '🇱🇻' },
  { name: 'Litauen', flag: '🇱🇹' },
  { name: 'Bulgarien', flag: '🇧🇬' },
  { name: 'Rumänien', flag: '🇷🇴' },
  { name: 'USA', flag: '🇺🇸' },
  { name: 'Kanada', flag: '🇨🇦' },
  { name: 'Australien', flag: '🇦🇺' },
  { name: 'Neuseeland', flag: '🇳🇿' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Südkorea', flag: '🇰🇷' },
  { name: 'China', flag: '🇨🇳' },
  { name: 'Indien', flag: '🇮🇳' },
  { name: 'Brasilien', flag: '🇧🇷' },
  { name: 'Argentinien', flag: '🇦🇷' },
  { name: 'Mexiko', flag: '🇲🇽' },
  { name: 'Südafrika', flag: '🇿🇦' },
  { name: 'Ägypten', flag: '🇪🇬' },
  { name: 'Türkei', flag: '🇹🇷' },
  { name: 'Russland', flag: '🇷🇺' },
  { name: 'Ukraine', flag: '🇺🇦' },
  { name: 'Israel', flag: '🇮🇱' },
  { name: 'Saudi-Arabien', flag: '🇸🇦' },
  { name: 'Vereinigte Arabische Emirate', flag: '🇦🇪' },
  { name: 'Thailand', flag: '🇹🇭' },
  { name: 'Singapur', flag: '🇸🇬' },
  { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Indonesien', flag: '🇮🇩' },
  { name: 'Philippinen', flag: '🇵🇭' },
  { name: 'Vietnam', flag: '🇻🇳' },
];

const CountryDropdown = forwardRef<HTMLButtonElement, CountryDropdownProps & { className?: string }>(({ 
  value, 
  onChange, 
  label, 
  placeholder = "Land auswählen", 
  className = "",
  onInputEnter,
  highlightClass = ""
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set default value to Austria if empty
  useEffect(() => {
    if (!value) {
      onChange('Österreich');
    }
  }, [value, onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCountry = COUNTRIES.find(country => country.name === value);

  const handleCountrySelect = (countryName: string) => {
    onChange(countryName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearValue = () => {
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onInputEnter?.();
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          ref={ref}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`w-full h-10 flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-500 text-left ${highlightClass}`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg">{selectedCountry?.flag || '🌍'}</span>
            <span className="text-sm">{value || placeholder}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
            {/* Search */}
            <div className="p-2 border-b">
              <input
                type="text"
                id="country-search"
                name="countrySearch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Land suchen..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                autoFocus
              />
            </div>

            {/* Country List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredCountries.map(country => (
                <button
                  key={country.name}
                  onClick={() => handleCountrySelect(country.name)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-3 ${
                    value === country.name ? 'text-white' : 'text-gray-900'
                  }`}
                  style={value === country.name ? { backgroundColor: '#F29400' } : {}}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1">{country.name}</span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Kein Land gefunden
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CountryDropdown.displayName = 'CountryDropdown';

export default CountryDropdown;