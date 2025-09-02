import { useState } from 'react';
import CompanyTag from './CompanyTag';
import TagButtonFavorite from './ui/TagButtonFavorite';
import AutocompleteInput from './AutocompleteInput';
import { useLebenslauf } from './LebenslaufContext';

interface CompaniesTagInputProps {
  value: string[];
  onChange: (companies: string[]) => void;
  suggestions?: string[];
}

export default function CompaniesTagInput({ value, onChange, suggestions = [] }: CompaniesTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { favoriteCompanies: favorites, toggleFavoriteCompany, sortByFavorite } =
    useLebenslauf();

  const addCompany = (val?: string) => {
    const c = (val ?? inputValue).trim();
    if (!c || value.includes(c)) return;
    onChange([...value, c]);
    setInputValue('');
  };

  const removeCompany = (c: string) => {
    onChange(value.filter((v) => v !== c));
  };

  const updateCompany = (oldVal: string, newVal: string) => {
    onChange(value.map((v) => (v === oldVal ? newVal : v)));
  };

  const handleAddFavoriteInput = (val?: string) => {
    const company = (val ?? inputValue).trim();
    if (!company) return;
    toggleFavoriteCompany(company);
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
              onRemove={() => removeCompany(c)}
              onEdit={(val) => updateCompany(c, val)}
            />
          ))}
        </div>
      )}

      <AutocompleteInput
        value={inputValue}
        onChange={setInputValue}
        onAdd={addCompany}
        onFavoriteClick={handleAddFavoriteInput}
        suggestions={sortByFavorite('company', (suggestions || []).filter(s => !value.includes(s)))}
        placeholder="Hinzufügen..."
        showFavoritesButton={true}
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
                  onClick={() => addCompany(f)}
                  onRemove={() => toggleFavoriteCompany(f)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
