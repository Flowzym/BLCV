import React, { useState, useRef, useEffect } from 'react';
import { Plus, Star, X } from 'lucide-react';

interface AutocompleteInputProps<T = string> {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onAdd?: (valueToAdd?: string | T) => void;
  onFavoriteClick?: (valueToAdd?: string, category?: string) => void;
  onInputEnter?: () => void;
  suggestions: T[];
  placeholder: string;
  disabled?: boolean;
  className?: string;
  highlightClass?: string;
  showAddButton?: boolean;
  showFavoritesButton?: boolean;
  buttonColor?: string;
  id?: string;
  label?: string;
  category?: string;
  formatSuggestion?: (item: T) => React.ReactNode;
  getSearchableString?: (item: T) => string;
  getKey?: (item: T) => string;
}

export default function AutocompleteInput<T = string>({
  value,
  onChange,
  onFocus,
  onBlur,
  onAdd,
  onFavoriteClick,
  onInputEnter,
  suggestions,
  placeholder,
  disabled = false,
  className = '',
  highlightClass = '',
  id,
  label,
  showAddButton = true,
  showFavoritesButton = true,
  buttonColor = '#F6A800',
  category,
  formatSuggestion,
  getSearchableString,
  getKey
}: AutocompleteInputProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<T[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasInput = (value || '').trim().length > 0;
  const [isFocused, setIsFocused] = useState(false);

  // Buttons nur bei Fokus, wenn Handler vorhanden sind
  const shouldShowAddButton = isFocused && hasInput && onAdd && showAddButton;
  const shouldShowFavoritesButton = isFocused && hasInput && onFavoriteClick && showFavoritesButton;

  // Helper functions with defaults for string suggestions
  const getSuggestionText = (item: T): string => {
    if (getSearchableString) {
      return getSearchableString(item);
    }
    return typeof item === 'string' ? item : String(item);
  };

  const getSuggestionKey = (item: T): string => {
    if (getKey) {
      return getKey(item);
    }
    return typeof item === 'string' ? item : String(item);
  };

  const formatSuggestionDisplay = (item: T): React.ReactNode => {
    if (formatSuggestion) {
      return formatSuggestion(item);
    }
    return getSuggestionText(item);
  };

  // Generate unique IDs if not provided
  const inputId = id || `autocomplete-input-${Math.random().toString(36).substr(2, 9)}`;
  const favoritesButtonId = `${inputId}-favorites`;
  const addButtonId = `${inputId}-add`;

  // Intelligent filtering and sorting of suggestions
  useEffect(() => {
    if ((value || '').trim() && (value || '').length > 0) {
      const searchTerm = (value || '').toLowerCase();
      
      const startsWithMatches: T[] = [];
      const containsMatches: T[] = [];
      
      suggestions.forEach(suggestion => {
        const suggestionText = getSuggestionText(suggestion);
        const suggestionLower = suggestionText.toLowerCase();
        
        if (suggestionLower === searchTerm) {
          return;
        }
        
        if (suggestionLower.startsWith(searchTerm)) {
          startsWithMatches.push(suggestion);
        } else if (suggestionLower.includes(searchTerm)) {
          containsMatches.push(suggestion);
        }
      });
      
      startsWithMatches.sort((a, b) => getSuggestionText(a).localeCompare(getSuggestionText(b), 'de', { sensitivity: 'base' }));
      containsMatches.sort((a, b) => getSuggestionText(a).localeCompare(getSuggestionText(b), 'de', { sensitivity: 'base' }));
      
      const combinedResults = [...startsWithMatches, ...containsMatches];
      const limitedResults = combinedResults.slice(0, 8);
      
      setFilteredSuggestions(limitedResults);
      setIsOpen(limitedResults.length > 0);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  }, [value, suggestions]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus event handler - prevents editor focus
  const handleFocus = (e: React.FocusEvent) => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay setting isFocused to false to allow button clicks to register
    setTimeout(() => setIsFocused(false), 200);
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredSuggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onAdd?.();
        onInputEnter?.();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : filteredSuggestions.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
          handleSuggestionSelect(filteredSuggestions[highlightedIndex]);
        } else {
          onAdd?.();
          onInputEnter?.();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        e.preventDefault();
        break;
      case 'Tab':
        if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
          handleSuggestionSelect(filteredSuggestions[highlightedIndex]);
          e.preventDefault();
        }
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: T) => {
    onChange(getSuggestionText(suggestion));
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSuggestionClick = (suggestion: T) => {
    onAdd?.(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleAddToFavorites = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Verhindert, dass das Blur-Event ausgelöst wird
    }
    console.log('AutocompleteInput: handleAddToFavorites called', { value: value.trim(), category, hasInput });
    if (onFavoriteClick && hasInput) {
      console.log('AutocompleteInput: calling onFavoriteClick with', value.trim(), category);
      onFavoriteClick(value.trim(), category);
      setIsOpen(false); // Dropdown explizit schließen
      onChange(''); // Eingabefeld leeren nach Favoriten-Hinzufügung
    } else {
      console.log('AutocompleteInput: onFavoriteClick not called', { onFavoriteClick: !!onFavoriteClick, hasInput });
    }
  };

  const handleAdd = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!hasInput) return;
    onAdd?.(value.trim());
  };

  return (
    <div ref={containerRef} className="relative profile-input autocomplete-input">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="flex items-center w-full space-x-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            id={inputId}
            name={id || `autocomplete-${inputId}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 h-10 border rounded-md transition-all focus:outline-none focus:ring-1 pr-10 ${hasInput ? 'border-orange-500' : 'border-gray-300'} ${highlightClass}`}
            style={isFocused ? {
              '--tw-ring-color': '#F29400'
            } : {
              borderColor: '#D1D5DB',
              '--tw-ring-color': '#F29400'
            } as React.CSSProperties}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            role="combobox"
          />
          {hasInput && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onChange('');
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Textfeld leeren"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {(shouldShowAddButton || shouldShowFavoritesButton) && (
          <div className="flex-shrink-0 flex space-x-2">
            {/* Add button */}
            {shouldShowAddButton && (
              <button
                id={addButtonId}
                name={`add-${inputId}`}
                onClick={handleAdd}
                className="w-10 h-10 bg-[#F6A800] text-white rounded-md flex items-center justify-center transition-colors duration-200 hover:bg-[#E8950C]"
                title="Hinzufügen"
                aria-label="Hinzufügen"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            
            {/* Favorites button */}
            {shouldShowFavoritesButton && (
              <button
                id={favoritesButtonId}
                name={`favorites-${inputId}`}
                disabled={disabled}
                onMouseDown={handleAddToFavorites} // onMouseDown statt onClick, wird vor onBlur ausgelöst
                className="w-10 h-10 bg-[#F6A800] text-white rounded-md flex items-center justify-center transition-colors duration-200 hover:bg-[#E8950C]"
                title="Zu Favoriten hinzufügen"
                aria-label="Zu Favoriten hinzufügen"
              >
                <Star className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

        {/* Dropdown with improved sorting */}
        {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef} 
          className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
          style={{
            borderColor: hasInput ? '#F29400' : '#D1D5DB',
            left: '0'
          }}
          role="listbox"
          aria-label="Vorschläge"
        >
          {filteredSuggestions.map((suggestion, index) => {
            const searchTerm = (value || '').toLowerCase(); 
            const suggestionText = getSuggestionText(suggestion);
            const suggestionLower = suggestionText.toLowerCase();
            const startsWithSearch = suggestionLower.startsWith(searchTerm);
                
            return (
              <button
                key={getSuggestionKey(suggestion)}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                  index === highlightedIndex ? 'text-white' : 'text-gray-900'
                }`}
                style={index === highlightedIndex ? { backgroundColor: '#F29400' } : {}}
                title={startsWithSearch ? 'Beginnt mit Ihrer Eingabe' : 'Enthält Ihre Eingabe'}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                <span className={startsWithSearch ? 'font-medium' : 'font-normal'}>
                  {formatSuggestionDisplay(suggestion)}
                </span>
                {startsWithSearch && suggestion && (
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