import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Star } from 'lucide-react';
import TextInput from './TextInput';
import AutocompleteInput from './AutocompleteInput';

interface JobFieldInputProps {
  onContentChange: (content: string) => void;
  profileConfig: {
    berufe: string[];
    taetigkeiten: string[];
    skills: string[];
    softskills: string[];
    ausbildung: string[];
  };
}

interface JobFieldData {
  berufsfelder: string[];
  zusatzangaben: string;
}

interface FavoritesConfig {
  berufe: string[];
}

export default function JobFieldInput({ onContentChange, profileConfig }: JobFieldInputProps) {
  const [jobFieldData, setJobFieldData] = useState<JobFieldData>({
    berufsfelder: [],
    zusatzangaben: '',
  });

  const [expandedSections, setExpandedSections] = useState({
    berufsfelder: true,
    zusatzangaben: false,
  });

  const [customInput, setCustomInput] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Favoriten-Konfiguration für Berufsfelder
  const [favoritesConfig, setFavoritesConfig] = useState<FavoritesConfig>(() => {
    try {
      const saved = localStorage.getItem('jobFieldFavorites');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading job field favorites:', error);
    }
    
    // Standard-Favoriten (erste 8 Elemente)
    return {
      berufe: profileConfig.berufe.slice(0, 8),
    };
  });

  // Speichere Favoriten in localStorage
  useEffect(() => {
    localStorage.setItem('jobFieldFavorites', JSON.stringify(favoritesConfig));
  }, [favoritesConfig]);

  const updateJobFieldContent = (newData: JobFieldData) => {
    const sections = [];
    
    if (newData.berufsfelder.length > 0) {
      sections.push(`BERUFSFELD:\n${newData.berufsfelder.join(', ')}`);
    }
    
    if (newData.zusatzangaben.trim()) {
      sections.push(`ZUSÄTZLICHE ANGABEN:\n${newData.zusatzangaben.trim()}`);
    }
    
    onContentChange(sections.join('\n\n'));
  };

  const addJobField = (customValue?: string) => {
    const valueToAdd = customValue || customInput.trim();
    
    if (valueToAdd && !jobFieldData.berufsfelder.includes(valueToAdd)) {
      const newData = {
        ...jobFieldData,
        berufsfelder: [...jobFieldData.berufsfelder, valueToAdd]
      };
      setJobFieldData(newData);
      updateJobFieldContent(newData);
      
      if (!customValue) {
        setCustomInput('');
      } else {
        setCustomInput('');
      }
    }
  };

  const removeJobField = (field: string) => {
    const newData = {
      ...jobFieldData,
      berufsfelder: jobFieldData.berufsfelder.filter(f => f !== field)
    };
    setJobFieldData(newData);
    updateJobFieldContent(newData);
  };

  const startEdit = (field: string) => {
    setEditingField(field);
    setEditValue(field || '');
  };

  const confirmEdit = () => {
    if (!editingField) return;
    const trimmed = (editValue || '').trim();
    if (!trimmed) {
      cancelEdit();
      return;
    }
    
    if (trimmed !== (editingField || '')) {
      // Ersetze den alten Wert mit dem neuen
      const newData = {
        ...jobFieldData,
        berufsfelder: (jobFieldData.berufsfelder || []).map(f => f === editingField ? trimmed : f)
      };
      setJobFieldData(newData);
      updateJobFieldContent(newData);
    }
    
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const handleZusatzangabenChange = (value: string) => {
    const newData = { ...jobFieldData, zusatzangaben: value };
    setJobFieldData(newData);
    updateJobFieldContent(newData);
  };

  const addToFavorites = (item: string) => {
    const newFavorites = { ...favoritesConfig };
    if (!newFavorites.berufe.includes(item)) {
      newFavorites.berufe = [...newFavorites.berufe, item];
      setFavoritesConfig(newFavorites);
    }
  };

  const toggleFavorite = (item: string) => {
    const newFavorites = { ...favoritesConfig };
    const currentFavorites = newFavorites.berufe;
    
    if (currentFavorites.includes(item)) {
      newFavorites.berufe = currentFavorites.filter(fav => fav !== item);
    } else {
      newFavorites.berufe = [...currentFavorites, item];
    }
    
    setFavoritesConfig(newFavorites);
  };

  const removeFavorite = (item: string) => {
    const newFavorites = { ...favoritesConfig };
    newFavorites.berufe = newFavorites.berufe.filter(fav => fav !== item);
    setFavoritesConfig(newFavorites);
  };

  const hasJobFieldData = jobFieldData.berufsfelder.length > 0 || jobFieldData.zusatzangaben.trim();
  const favoriteItems = favoritesConfig.berufe || [];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Berufsfelder - ERWEITERT */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            id="berufsfelder-toggle"
            name="toggle-berufsfelder"
            onClick={() => toggleSection('berufsfelder')}
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors duration-200"
            aria-expanded={expandedSections.berufsfelder}
            aria-controls="berufsfelder-content"
          >
            <div className="flex items-center space-x-2">
              <span className="text-base">💼</span> 
             <h3 className="font-medium text-gray-900 text-lg">Berufsfelder</h3>
              {jobFieldData.berufsfelder.length > 0 && (
                <span className="px-2 py-1 text-white text-xs rounded-full" style={{ backgroundColor: '#F29400' }}>
                  {jobFieldData.berufsfelder.length}
                </span>
              )}
            </div>
            {expandedSections.berufsfelder ? (
              <ChevronUp className="h-5 w-5" style={{ color: '#F29400' }} />
            ) : (
              <ChevronDown className="h-5 w-5" style={{ color: '#F29400' }} />
            )}
          </button>

          {expandedSections.berufsfelder && (
            <div id="berufsfelder-content" className="p-4 space-y-4">
              {/* BOLT-UI-ANPASSUNG 2025-01-15: Custom Input mit Autocomplete - Platzhaltertext angepasst */}
              {/* Selected Job Fields with Favorites Button */}
              {jobFieldData.berufsfelder.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ausgewählte Berufsfelder:</h4>
                  <div className="flex flex-wrap gap-2">
                    {jobFieldData.berufsfelder.map((field) => (
                      <div
                        key={field}
                        className="inline-flex items-center px-3 py-1 text-white text-sm rounded-full flex-shrink-0"
                        style={{ backgroundColor: '#F29400' }}
                      >
                        <span>{field}</span>
                        <div className="flex items-center ml-2 space-x-1">
                          {/* Favoriten-Button */}
                          <button
                            id={`favorite-job-field-${field.replace(/\s+/g, '-')}`}
                            name={`favorite-job-field-${field}`}
                            onClick={() => addToFavorites(field)}
                            className={`p-1 rounded-full transition-colors duration-200 ${
                              favoriteItems.includes(field)
                                ? 'text-yellow-300 hover:text-yellow-200'
                                : 'text-white hover:text-yellow-200'
                            }`}
                            title={favoriteItems.includes(field) ? 'Bereits in Favoriten' : 'Zu Favoriten hinzufügen'}
                            disabled={favoriteItems.includes(field)}
                            aria-label={`${field} zu Favoriten hinzufügen`}
                          >
                            <Star className={`h-3 w-3 ${favoriteItems.includes(field) ? 'fill-current' : ''}`} />
                          </button>
                          {/* Entfernen-Button */}
                          <button
                            id={`remove-job-field-${field.replace(/\s+/g, '-')}`}
                            name={`remove-job-field-${field}`}
                            onClick={() => removeJobField(field)}
                            className="text-white hover:text-gray-200"
                            aria-label={`${field} entfernen`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <AutocompleteInput
                  id="job-field-input"
                  label="Berufsfeld eingeben:"
                  value={customInput}
                  onChange={setCustomInput}
                  onAdd={addJobField}
                  suggestions={profileConfig.berufe}
                  className="text-black px-2 py-1 rounded bg-white"
                  size={editValue.length || 1}
                  style={{
                    width: `${editValue.length * 0.8 + 1}ch`,
                    minWidth: `${editValue.length * 0.8 + 1}ch`
                  }}
                  buttonColor="orange"
                />
              </div>

              {/* Favorite Options - ORANGE UMRANDUNG + X INNERHALB */}
              {favoriteItems.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="h-4 w-4 fill-current" style={{ color: '#F29400' }} />
                    <h4 className="text-sm font-medium text-gray-700">Favoriten:</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {favoriteItems
                      .filter(item => !jobFieldData.berufsfelder.includes(item))
                      .map((item) => (
                        <button
                          key={item}
                          id={`favorite-option-${item.replace(/\s+/g, '-')}`}
                          name={`favorite-option-${item}`}
                          onClick={() => addJobField(item)}
                          className="inline-flex items-center justify-between px-3 py-1 text-gray-700 text-sm rounded-full border hover:bg-gray-200 transition-colors duration-200"
                          style={{ backgroundColor: '#F3F4F6', borderColor: '#F29400' }}
                          aria-label={`${item} auswählen`}
                        >
                          <span className="mr-2">{item}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavorite(item);
                            }}
                            className="text-gray-600 hover:text-gray-800"
                            title="Aus Favoriten entfernen"
                            aria-label={`${item} aus Favoriten entfernen`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* All Available Options - STANDARDMÄSSIG ZUGEKLAPPT + STERN INNERHALB */}
              {profileConfig.berufe.length > 0 && (
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center space-x-2">
                    <span>Alle verfügbaren Berufsfelder ({profileConfig.berufe.length})</span>
                    <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" style={{ color: '#F29400' }} />
                  </summary>
                  <div className="mt-3 space-y-3">
                    {/* SCROLLBARES FELD - GENAU WIE IM BILD */}
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex flex-wrap gap-2">
                        {profileConfig.berufe
                          .filter(beruf => !jobFieldData.berufsfelder.includes(beruf))
                          .map((beruf) => (
                            <div key={beruf} className="flex items-center space-x-1">
                              <button
                                id={`available-beruf-${beruf.replace(/\s+/g, '-')}`}
                                name={`available-beruf-${beruf}`}
                                onClick={() => addJobField(beruf)}
                                className="inline-flex items-center justify-between px-3 py-1 bg-white text-gray-700 text-sm rounded-full transition-colors duration-200 border border-gray-300 hover:bg-gray-100"
                                aria-label={`${beruf} auswählen`}
                              >
                                <span className="mr-2">{beruf}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(beruf);
                                  }}
                                  className={`transition-colors duration-200 ${
                                    favoriteItems.includes(beruf)
                                      ? 'hover:opacity-80'
                                      : 'text-gray-400 hover:opacity-80'
                                  }`}
                                  style={{ color: favoriteItems.includes(beruf) ? '#F29400' : undefined }}
                                  title={favoriteItems.includes(beruf) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                                  aria-label={favoriteItems.includes(beruf) ? `${beruf} aus Favoriten entfernen` : `${beruf} zu Favoriten hinzufügen`}
                                >
                                  <Star className={`h-3 w-3 ${favoriteItems.includes(beruf) ? 'fill-current' : ''}`} />
                                </button>
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Zusatzangaben */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            id="zusatzangaben-toggle"
            name="toggle-zusatzangaben"
            onClick={() => toggleSection('zusatzangaben')}
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors duration-200"
            aria-expanded={expandedSections.zusatzangaben}
            aria-controls="zusatzangaben-content"
          >
            <div className="flex items-center space-x-2">
              <span className="text-base">📝</span>
              <h3 className="font-medium text-gray-900 text-sm">Zusätzliche Angaben</h3>
              {jobFieldData.zusatzangaben.trim() && (
                <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
                  Vorhanden
                </span>
              )}
            </div>
            {expandedSections.zusatzangaben ? (
              <ChevronUp className="h-5 w-5" style={{ color: '#F29400' }} />
            ) : (
              <ChevronDown className="h-5 w-5" style={{ color: '#F29400' }} />
            )}
          </button>

          {expandedSections.zusatzangaben && (
            <div id="zusatzangaben-content" className="p-4">
              <TextInput
                id="job-field-zusatzangaben"
                name="jobFieldZusatzangaben"
                value={jobFieldData.zusatzangaben}
                onChange={handleZusatzangabenChange}
                label=""
                placeholder="Hinzufügen..." // BOLT-UI-ANPASSUNG 2025-01-15: Platzhaltertext angepasst
                rows={6}
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {hasJobFieldData && (
        <div className="p-6 rounded-lg border" style={{ backgroundColor: '#FEF7EE', borderColor: '#F29400' }}>
          <h4 className="font-bold text-xl mb-4" style={{ color: '#F29400' }}>📋 Berufsfeld-Zusammenfassung</h4>
          
          <div className="space-y-4" style={{ color: '#F29400' }}>
            {jobFieldData.berufsfelder.length > 0 && (
              <div>
                <h5 className="font-bold text-lg mb-2">💼 Ausgewählte Berufsfelder ({jobFieldData.berufsfelder.length})</h5>
                <div className="ml-4 text-gray-700 space-y-1">
                  {jobFieldData.berufsfelder.map((field, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span style={{ color: '#F29400' }} className="mt-1">•</span>
                      <span>{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {jobFieldData.zusatzangaben.trim() && (
              <div>
                <h5 className="font-bold text-lg mb-2">📝 Zusätzliche Angaben</h5>
                <div className="ml-4 text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {jobFieldData.zusatzangaben}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t" style={{ borderColor: '#F29400' }}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Gesamtanzahl Einträge:</span>
              <span className="font-bold">
                {jobFieldData.berufsfelder.length + (jobFieldData.zusatzangaben.trim() ? 1 : 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}