import React, { useMemo, useRef, useState } from 'react';
import PositionTag from './PositionTag';
import TagButtonFavorite from './ui/TagButtonFavorite';
import { useLebenslauf } from './LebenslaufContext';
import AutocompleteInput from './AutocompleteInput';

type FavoriteKind = 'company'|'position'|'aufgabenbereich'|'institution'|'ausbildungsart'|'abschluss';

interface TagSelectorWithFavoritesProps {
  label: string;
  value: string[];
  onChange: (val: string[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  showFavoritesButton?: boolean;
  options?: string[];
  allowCustom: boolean;
  suggestions?: string[];
  kind: FavoriteKind;
  showAddButton?: boolean;
  placeholder?: string;
}

export default function TagSelectorWithFavorites({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  showFavoritesButton = true,
  options = [],
  allowCustom,
  suggestions = [],
  kind,
  showAddButton = true,
  placeholder = ''
}: TagSelectorWithFavoritesProps) {
  const {
    getFavorites,
    sortByFavorite,
    toggleFavorite,
  } = useLebenslauf();

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const favs = getFavorites(kind) || [];

  const orderedSuggestions = useMemo(() => {
    const base = suggestions && suggestions.length ? suggestions : options;
    if (!base || !base.length) return [];
    return sortByFavorite(kind, base).filter(s => !value.includes(s));
  }, [suggestions, options, value, sortByFavorite, kind]);

  const addTag = (tag: string) => {
    const t = (tag || '').trim();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
    setInputValue('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div className="space-y-2">
      {label ? <label className="block text-sm font-medium text-gray-700">{label}</label> : null}

      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <PositionTag key={tag} label={tag} onRemove={() => removeTag(tag)} />
        ))}
      </div>

      <AutocompleteInput
        value={inputValue}
        onChange={setInputValue}
        onFocus={onFocus}
        onBlur={onBlur}
        onAdd={() => addTag(inputValue)}
        onFavoriteClick={(val?: string) => {
          if (!val) return;
          toggleFavorite(kind, val);
        }}
        suggestions={orderedSuggestions}
        placeholder={placeholder}
        showAddButton={showAddButton}
      />

      {showFavoritesButton && favs && favs.length > 0 && (
        <div className="mt-1">
          <div className="text-xs text-gray-500 mb-1">Favoriten</div>
          <div className="flex flex-wrap gap-2">
            {favs
              .filter((item) => !value.includes(item))
              .map((item) => (
                <TagButtonFavorite
                  key={item}
                  label={item}
                  onClick={() => addTag(item)}
                  onRemove={() => toggleFavorite(kind, item)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
