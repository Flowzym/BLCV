import { useState } from 'react';
import CompanyTag from './CompanyTag';
import TagButtonFavorite from './ui/TagButtonFavorite';
import { useLebenslauf } from './LebenslaufContext';
import AutocompleteInput from './AutocompleteInput';

interface InstitutionTagInputProps {
  value: string[];
  onChange: (institutions: string[]) => void;
  suggestions?: string[];
}

export default function InstitutionTagInput({ value, onChange, suggestions = [] }: InstitutionTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { favoriteInstitutions: favorites, toggleFavoriteInstitution } =
    useLebenslauf();

  const addInstitution = (val?: string) => {
    const c = (val ?? inputValue).trim();
    if (!c || value.includes(c)) return;
    onChange([...value, c]);
    setInputValue('');
  };

  const removeInstitution = (c: string) => {
    onChange(value.filter((v) => v !== c));
  };

  const updateInstitution = (oldVal: string, newVal: string) => {
    onChange(value.map((v) => (v === oldVal ? newVal : v)));
  };

  const handleAddFavoriteInput = (val?: string) => {
    const trimmed = (val ?? inputValue).trim();
    if (!trimmed) return;
    toggleFavoriteInstitution(trimmed);
    setInputValue('');
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {value.map((c) => (
            <CompanyTag
              key={c}
              label={c}
              onRemove={() => removeInstitution(c)}
              onEdit={(val) => updateInstitution(c, val)}
            />
          ))}
        </div>
      )}

      <AutocompleteInput
        value={inputValue}
        onChange={setInputValue}
        onAdd={addInstitution}
        onFavoriteClick={handleAddFavoriteInput}
        suggestions={suggestions}
        placeholder="Hinzufügen..."
        showFavoritesButton
        className="w-full"
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
              <polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2" fill="none" />
            </svg>
            <h4 className="text-sm font-medium text-gray-700">Favoriten:</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {favorites
              .filter((f) => !value.includes(f))
              .map((f) => (
                <TagButtonFavorite
                  key={f}
                  label={f}
                  onClick={() => addInstitution(f)}
                  onRemove={() => toggleFavoriteInstitution(f)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}