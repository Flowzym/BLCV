import React, { useState, useRef, useEffect } from 'react';
import { Globe, X } from 'lucide-react';

interface CountryAutocompleteProps {
  value: string;
  onChange: (country: string) => void;
  placeholder?: string;
}

const COUNTRIES = [
  'Afghanistan', 'Albanien', 'Algerien', 'Andorra', 'Angola', 'Antigua und Barbuda',
  'Argentinien', 'Armenien', 'Australien', 'Österreich', 'Aserbaidschan', 'Bahamas',
  'Bahrain', 'Bangladesch', 'Barbados', 'Belarus', 'Belgien', 'Belize', 'Benin',
  'Bhutan', 'Bolivien', 'Bosnien und Herzegowina', 'Botswana', 'Brasilien', 'Brunei',
  'Bulgarien', 'Burkina Faso', 'Burundi', 'Kambodscha', 'Kamerun', 'Kanada',
  'Kap Verde', 'Zentralafrikanische Republik', 'Tschad', 'Chile', 'China', 'Kolumbien',
  'Komoren', 'Kongo', 'Costa Rica', 'Kroatien', 'Kuba', 'Zypern', 'Tschechien',
  'Dänemark', 'Dschibuti', 'Dominica', 'Dominikanische Republik', 'Ecuador', 'Ägypten',
  'El Salvador', 'Äquatorialguinea', 'Eritrea', 'Estland', 'Eswatini', 'Äthiopien',
  'Fidschi', 'Finnland', 'Frankreich', 'Gabun', 'Gambia', 'Georgien', 'Deutschland',
  'Ghana', 'Griechenland', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Ungarn', 'Island', 'Indien', 'Indonesien', 'Iran', 'Irak',
  'Irland', 'Israel', 'Italien', 'Jamaika', 'Japan', 'Jordanien', 'Kasachstan',
  'Kenia', 'Kiribati', 'Nordkorea', 'Südkorea', 'Kuwait', 'Kirgisistan', 'Laos',
  'Lettland', 'Libanon', 'Lesotho', 'Liberia', 'Libyen', 'Liechtenstein', 'Litauen',
  'Luxemburg', 'Madagaskar', 'Malawi', 'Malaysia', 'Malediven', 'Mali', 'Malta',
  'Marshallinseln', 'Mauretanien', 'Mauritius', 'Mexiko', 'Mikronesien', 'Moldau',
  'Monaco', 'Mongolei', 'Montenegro', 'Marokko', 'Mosambik', 'Myanmar', 'Namibia',
  'Nauru', 'Nepal', 'Niederlande', 'Neuseeland', 'Nicaragua', 'Niger', 'Nigeria',
  'Nordmazedonien', 'Norwegen', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua-Neuguinea',
  'Paraguay', 'Peru', 'Philippinen', 'Polen', 'Portugal', 'Katar', 'Rumänien',
  'Russland', 'Ruanda', 'Saint Kitts und Nevis', 'Saint Lucia', 'Saint Vincent und die Grenadinen',
  'Samoa', 'San Marino', 'São Tomé und Príncipe', 'Saudi-Arabien', 'Senegal', 'Serbien',
  'Seychellen', 'Sierra Leone', 'Singapur', 'Slowakei', 'Slowenien', 'Salomonen',
  'Somalia', 'Südafrika', 'Südsudan', 'Spanien', 'Sri Lanka', 'Sudan', 'Suriname',
  'Schweden', 'Schweiz', 'Syrien', 'Taiwan', 'Tadschikistan', 'Tansania', 'Thailand',
  'Timor-Leste', 'Togo', 'Tonga', 'Trinidad und Tobago', 'Tunesien', 'Türkei',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'Vereinigte Arabische Emirate',
  'Vereinigtes Königreich', 'Vereinigte Staaten', 'Uruguay', 'Usbekistan', 'Vanuatu',
  'Vatikanstadt', 'Venezuela', 'Vietnam', 'Jemen', 'Sambia', 'Simbabwe'
];

export default function CountryAutocomplete({ value, onChange, placeholder = "Land auswählen" }: CountryAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter countries based on input
  useEffect(() => {
    if (value.trim() && value.length > 0) {
      const searchTerm = value.toLowerCase();
      
      const startsWithMatches: string[] = [];
      const containsMatches: string[] = [];
      
      COUNTRIES.forEach(country => {
        const countryLower = country.toLowerCase();
        
        if (countryLower === searchTerm) {
          return;
        }
        
        if (countryLower.startsWith(searchTerm)) {
          startsWithMatches.push(country);
        } else if (countryLower.includes(searchTerm)) {
          containsMatches.push(country);
        }
      });
      
      const combinedResults = [...startsWithMatches, ...containsMatches];
      const limitedResults = combinedResults.slice(0, 8);
      
      setFilteredCountries(limitedResults);
      setIsOpen(limitedResults.length > 0);
    } else {
      setFilteredCountries([]);
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredCountries.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCountries.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : filteredCountries.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredCountries.length) {
          handleCountrySelect(filteredCountries[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        e.preventDefault();
        break;
      case 'Tab':
        if (highlightedIndex >= 0 && highlightedIndex < filteredCountries.length) {
          handleCountrySelect(filteredCountries[highlightedIndex]);
          e.preventDefault();
        }
        break;
    }
  };

  const handleCountrySelect = (country: string) => {
    onChange(country);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const clearValue = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2"
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:border-orange-500"
          style={{ '--tw-ring-color': '#F29400' } as React.CSSProperties}
          placeholder={placeholder}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        {value && (
          <button
            onClick={clearValue}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Land löschen"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && filteredCountries.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto z-50"
          role="listbox"
          aria-label="Länder-Vorschläge"
        >
          {filteredCountries.map((country, index) => {
            const searchTerm = value.toLowerCase();
            const countryLower = country.toLowerCase();
            const startsWithSearch = countryLower.startsWith(searchTerm);
                
            return (
              <button
                key={country}
                onClick={() => handleCountrySelect(country)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                  index === highlightedIndex ? 'text-white' : 'text-gray-900'
                }`}
                style={index === highlightedIndex ? { backgroundColor: '#F29400' } : {}}
                title={startsWithSearch ? 'Beginnt mit Ihrer Eingabe' : 'Enthält Ihre Eingabe'}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                <span className={startsWithSearch ? 'font-medium' : 'font-normal'}>
                  {country}
                </span>
                {startsWithSearch && (
                  <span className="ml-2 text-xs opacity-60">
                    ↗
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}