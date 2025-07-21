import React, { useEffect, useState, useMemo } from 'react';
import { X, Pencil, Star } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import { getTasksForPositions } from '../constants/positionsToTasks';

interface AufgabenbereichInputProps {
  value: string[];
  onChange: (neueListe: string[]) => void;
  positionen: string[];
  vorschlaege?: string[];
  favoriten?: string[];
}

export default function AufgabenbereichInput({
  value,
  onChange,
  positionen,
  vorschlaege = [],
  favoriten = [],
}: AufgabenbereichInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('aufgabenFavoriten');
      if (stored) {
        return JSON.parse(stored) as string[];
      }
    } catch {
      // ignore parse errors
    }
    return favoriten;
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        'aufgabenFavoriten',
        JSON.stringify(favorites.slice(-10))
      );
    } catch {
      // ignore
    }
  }, [favorites]);

  const allOptions = useMemo(() => {
    const fromPositions = getTasksForPositions(positionen);
    const combined = [...fromPositions, ...vorschlaege];
    const unique = Array.from(new Set(combined));
    unique.sort((a, b) => a.localeCompare(b, 'de', { sensitivity: 'base' }));
    return unique;
  }, [positionen, vorschlaege]);

  const gefilterteVorschlaege = allOptions.filter(
    (option) => !value.includes(option)
  );

  const addTask = (task?: string) => {
    const t = (task ?? inputValue).trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    setInputValue('');
  };

  const removeTask = (task: string) => {
    onChange(value.filter((t) => t !== task));
  };

  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(value[index]);
  };

  const confirmEdit = () => {
    if (editIndex === null) return;
    const trimmed = editValue.trim();
    if (!trimmed) return;
    const newTasks = value.map((t, i) => (i === editIndex ? trimmed : t));
    onChange(newTasks);
    setEditIndex(null);
    setEditValue('');
  };

  const addToFavorites = (task: string) => {
    if (!favorites.includes(task)) {
      setFavorites([...favorites.slice(-9), task]);
    }
  };

  const toggleFavorite = (task: string) => {
    setFavorites(
      favorites.includes(task)
        ? favorites.filter((f) => f !== task)
        : [...favorites.slice(-9), task]
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Aufgaben/Tätigkeiten</h3>

      {value.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Ausgewählt:</h4>
          <div className="flex flex-wrap gap-2">
            {value.map((task, index) => (
              <div
                key={`${task}-${index}`}
                className="inline-flex items-center px-3 py-1 text-sm rounded-full text-white"
                style={{ backgroundColor: '#F29400' }}
              >
              {editIndex === index ? (
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={confirmEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmEdit();
                  }}
                  className="text-black px-1 py-0.5 rounded"
                  autoFocus
                />
              ) : (
                <span className="mr-2">{task}</span>
              )}
              {editIndex !== index && (
                <button
                  onClick={() => startEdit(index)}
                  className="mr-1 text-white hover:text-gray-200"
                  aria-label="Bearbeiten"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              )}
              <button
                onClick={() => removeTask(task)}
                className="text-white hover:text-gray-200"
                aria-label="Entfernen"
              >
                <X className="h-3 w-3" />
              </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <AutocompleteInput
        value={inputValue}
        onChange={setInputValue}
        onAdd={() => addTask()}
        onFavoriteClick={(val) => addToFavorites(val ?? inputValue)}
        suggestions={gefilterteVorschlaege}
        placeholder="Hinzufügen..."
        showFavoritesButton
      />

      {gefilterteVorschlaege.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {gefilterteVorschlaege.map((s) => (
            <div key={s} className="flex items-center space-x-1">
              <button
                onClick={() => addTask(s)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  value.includes(s) ? 'text-white' : 'hover:bg-gray-100'
                }`}
                style={
                  value.includes(s)
                    ? { backgroundColor: '#F29400', borderColor: '#F29400' }
                    : { borderColor: '#F29400' }
                }
              >
                {s}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(s);
                }}
                className={`transition-colors duration-200 ${
                  favorites.includes(s) ? 'hover:opacity-80' : 'text-gray-400 hover:opacity-80'
                }`}
                style={{ color: favorites.includes(s) ? '#F29400' : undefined }}
                aria-label={
                  favorites.includes(s)
                    ? `${s} aus Favoriten entfernen`
                    : `${s} zu Favoriten hinzufügen`
                }
                title={favorites.includes(s) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
              >
                <Star className={`h-3 w-3 ${favorites.includes(s) ? 'fill-current' : ''}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {favorites.filter((f) => !value.includes(f)).length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Star className="h-4 w-4" style={{ color: '#F29400' }} />
            <h4 className="text-sm font-medium text-gray-700">Favoriten:</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {favorites
              .filter((item) => !value.includes(item))
              .map((item) => (
                <button
                  key={item}
                  onClick={() => addTask(item)}
                  className="inline-flex items-center justify-between px-3 py-1 bg-white text-gray-700 text-sm rounded-full transition-colors duration-200 border border-gray-300 hover:bg-gray-100"
                >
                  <span className="mr-2">{item}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item);
                    }}
                    className="transition-colors duration-200 text-gray-400 hover:opacity-80"
                    aria-label={`${item} aus Favoriten entfernen`}
                    title="Aus Favoriten entfernen"
                  >
                    <Star className="h-3 w-3 fill-current" />
                  </button>
                </button>
              ))}
          </div>
        </div>
      )}

    </div>
  );
}

