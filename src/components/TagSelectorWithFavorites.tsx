import { useState } from 'react';
import PositionTag from './PositionTag';
import TagButtonFavorite from './ui/TagButtonFavorite';
import { useLebenslauf } from './LebenslaufContext';
import { sortByFavorite as sortByFavoriteUtil } from '@/lib/favorites';
import AutocompleteInput from './AutocompleteInput';

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
  suggestions,
}: TagSelectorWithFavoritesProps) {
  const [inputValue, setInputValue] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { favoritePositions: favorites, toggleFavoritePosition, sortByFavorite } = useLebenslauf();


  const addTag = (val?: string) => {
    const trimmed = (val ?? inputValue).trim();
    if (!trimmed || value.includes(trimmed)) return;
    const opts = suggestions ?? options;
    if (!allowCustom && !opts.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const toggleFavorite = (val?: string) => {
    const trimmed = (val ?? inputValue).trim();
    if (!trimmed) return;
    toggleFavoritePosition(trimmed);
    setInputValue('');
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    // Verzögerung hinzufügen, damit Button-Klicks noch registriert werden
    setTimeout(() => setIsFocused(false), 200);
    onBlur?.();
  };

  // Buttons nur bei Fokus anzeigen
  const shouldShowButtons = isFocused;
  const hasInputValue = inputValue.trim().length > 0;

  const updateTag = (oldTag: string, newTag: string) => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    const updatedTags = value.map(tag => tag === oldTag ? trimmed : tag);
    onChange(updatedTags);
  };

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <PositionTag
              key={tag}
              label={tag}
              onRemove={() => removeTag(tag)}
              onEdit={(newTag) => updateTag(tag, newTag)}
            />
          ))}
        </div>
      )}

      <AutocompleteInput
        label={label}
        value={inputValue}
        onChange={setInputValue}
        onAdd={addTag}
        onFavoriteClick={toggleFavorite}
        onFocus={handleFocus}
        onBlur={handleBlur}
        suggestions={sortByFavorite('position', (suggestions ?? options) || [])}
        placeholder="Hinzufügen..."
        showFavoritesButton={shouldShowButtons && showFavoritesButton}
        showAddButton={shouldShowButtons}
        className={hasInputValue && !isFocused ? 'border-orange-500' : ''}
      />

      {favorites.filter((f) => !value.includes(f)).length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon
                points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2"
                fill="none"
              />
            </svg>
            <h4 className="text-sm font-medium text-gray-700">Favoriten:</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {favorites
              .filter((item) => !value.includes(item))
              .map((item) => (
                <TagButtonFavorite
                  key={item}
                  label={item}
                  onClick={() => addTag(item)}
                  onRemove={() => toggleFavorite(item)}
                />
              ))}
          </div>
        </div>
      )}

    </div>
  );
}