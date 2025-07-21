import React, { useState, useRef, useEffect } from 'react';
import { Phone, ChevronDown, X } from 'lucide-react';

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
}

const COUNTRY_CODES = [
  { code: '+43', country: 'Österreich', flag: '🇦🇹' },
  { code: '+49', country: 'Deutschland', flag: '🇩🇪' },
  { code: '+41', country: 'Schweiz', flag: '🇨🇭' },
  { code: '+1', country: 'USA/Kanada', flag: '🇺🇸' },
  { code: '+44', country: 'Vereinigtes Königreich', flag: '🇬🇧' },
  { code: '+33', country: 'Frankreich', flag: '🇫🇷' },
  { code: '+39', country: 'Italien', flag: '🇮🇹' },
  { code: '+34', country: 'Spanien', flag: '🇪🇸' },
  { code: '+31', country: 'Niederlande', flag: '🇳🇱' },
  { code: '+32', country: 'Belgien', flag: '🇧🇪' },
  { code: '+45', country: 'Dänemark', flag: '🇩🇰' },
  { code: '+46', country: 'Schweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norwegen', flag: '🇳🇴' },
  { code: '+358', country: 'Finnland', flag: '🇫🇮' },
  { code: '+48', country: 'Polen', flag: '🇵🇱' },
  { code: '+420', country: 'Tschechien', flag: '🇨🇿' },
  { code: '+421', country: 'Slowakei', flag: '🇸🇰' },
  { code: '+36', country: 'Ungarn', flag: '🇭🇺' },
  { code: '+385', country: 'Kroatien', flag: '🇭🇷' },
  { code: '+386', country: 'Slowenien', flag: '🇸🇮' },
];

export default function PhoneInput({ countryCode, phoneNumber, onCountryChange, onPhoneChange }: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set default country code if empty
  useEffect(() => {
    if (!countryCode) {
      onCountryChange('+43'); // Default to Austria
    }
  }, [countryCode, onCountryChange]);

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

  const filteredCodes = COUNTRY_CODES.filter(item => 
    item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.includes(searchTerm)
  );

  const selectedCountry = COUNTRY_CODES.find(item => item.code === countryCode);

  const handleCountrySelect = (code: string) => {
    onCountryChange(code);
    setIsOpen(false);
    setSearchTerm('');
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 18 digits maximum
    const limitedDigits = digits.slice(0, 18);
    
    // Format: "123 4567890 xxxx xxxx xxxx"
    if (limitedDigits.length <= 3) return limitedDigits;
    if (limitedDigits.length <= 10) return `${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3)}`;
    if (limitedDigits.length <= 14) return `${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3, 10)} ${limitedDigits.slice(10)}`;
    return `${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3, 10)} ${limitedDigits.slice(10, 14)} ${limitedDigits.slice(14)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorPosition = input.selectionStart || 0;
    const oldValue = phoneNumber;
    const newValue = e.target.value;
    
    const formatted = formatPhoneNumber(newValue);
    onPhoneChange(formatted);
    
    // Calculate new cursor position
    setTimeout(() => {
      if (input) {
        // Count spaces before cursor in old and new value
        const oldSpacesBefore = (oldValue.slice(0, cursorPosition).match(/ /g) || []).length;
        const oldDigitsBefore = oldValue.slice(0, cursorPosition).replace(/\D/g, '').length;
        
        // Find position in formatted string
        let newPosition = 0;
        let digitCount = 0;
        
        for (let i = 0; i < formatted.length; i++) {
          if (formatted[i] === ' ') {
            newPosition++;
          } else {
            if (digitCount < oldDigitsBefore) {
              digitCount++;
              newPosition++;
            } else {
              break;
            }
          }
        }
        
        input.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const clearPhoneNumber = () => {
    onPhoneChange('');
  };

  return (
    <div className="flex space-x-2">
      {/* Country Code Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 h-10 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-500 min-w-[120px]"
        >
          <span className="text-lg">{selectedCountry?.flag || '🌍'}</span>
          <span className="text-sm font-medium">{countryCode || '+43'}</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 min-w-[280px]">
            {/* Search */}
            <div className="p-2 border-b">
              <input
                type="text"
                id="phone-country-search"
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
              {filteredCodes.map(item => (
                <button
                  key={item.code}
                  onClick={() => handleCountrySelect(item.code)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-3 ${
                    countryCode === item.code ? 'text-white' : 'text-gray-900'
                  }`}
                  style={countryCode === item.code ? { backgroundColor: '#F29400' } : {}}
                >
                  <span className="text-lg">{item.flag}</span>
                  <span className="font-medium">{item.code}</span>
                  <span className="flex-1">{item.country}</span>
                </button>
              ))}
              {filteredCodes.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Kein Land gefunden
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phone Number Input */}
      <div className="relative flex-1">
        <input
          type="tel"
          id="phone-number"
          name="phoneNumber"
          value={phoneNumber}
          onChange={handlePhoneChange}
        className="w-full h-10 pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
          placeholder="Telefonnummer"
        />
        {phoneNumber && (
          <button
            type="button"
            onClick={clearPhoneNumber}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Telefonnummer löschen"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}