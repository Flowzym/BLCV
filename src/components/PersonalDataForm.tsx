import React, { useState, useEffect } from 'react';
import { X, ToggleLeft, ToggleRight, Eraser } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import TagButtonFavorite from './ui/TagButtonFavorite';
import TagButtonSelected from './ui/TagButtonSelected';
import DatePicker from './DatePicker';
import PhoneInput from './PhoneInput';
import CountryAutocomplete from './CountryAutocomplete';
import CountryDropdown from './CountryDropdown';
import ToggleSwitch from './ToggleSwitch';
import Card from './cards/Card';
import KinderYearPicker from './KinderYearPicker';

interface PersonalData {
  titel: string;
  vorname: string;
  nachname: string;
  telefon: string;
  telefonVorwahl: string;
  email: string;
  adresse: string;
  plz: string;
  ort: string;
  land: string;
  ausland: boolean;
  geburtsdatum: string;
  geburtsort: string;
  geburtsland: string;
  staatsbuergerschaft: string;
  staatsbuergerschaftCheckbox: boolean;
  familienstand: string;
  kinder: string[];
  arbeitsmarktzugang: string;
  socialMedia: string[];
}

interface PersonalDataFormProps {
  data?: PersonalData;
  onChange?: (data: PersonalData) => void;
}

const phoneCountryCodes = [
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+43', country: 'Österreich', flag: '🇦🇹' },
  { code: '+49', country: 'Deutschland', flag: '🇩🇪' },
  { code: '+41', country: 'Schweiz', flag: '🇨🇭' },
  { code: '+33', country: 'Frankreich', flag: '🇫🇷' },
  { code: '+39', country: 'Italien', flag: '🇮🇹' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
];

const titleSuggestions = ['Dr.', 'Mag.', 'DI', 'Prof.', 'MSc', 'BSc', 'MBA'];
const citySuggestions = ['Wien', 'Graz', 'Salzburg', 'Innsbruck', 'Linz', 'Klagenfurt'];
const countrySuggestions = ['Österreich', 'Deutschland', 'Schweiz', 'Italien', 'Frankreich'];
const familienstandOptions = ['Keine Angabe', 'ledig', 'verheiratet', 'geschieden', 'verwitwet'];
const arbeitsmarktzugangOptions = ['Keine Angabe', 'Freier Zugang', 'Beschränkt', 'In Prüfung', 'Asylverfahren', 'Kein Zugang'];

export default function PersonalDataForm({ data = {}, onChange = () => {} }: PersonalDataFormProps) {
  // Ensure data has all required properties with defaults
  const safeData: PersonalData = {
    titel: '',
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    telefonVorwahl: '+43',
    adresse: '',
    plz: '',
    ort: '',
    land: '',
    geburtsort: '',
    geburtsland: '',
    geburtsdatum: '',
    staatsangehoerigkeit: '',
    familienstand: '',
    kinder: [],
    socialMedia: [],
    ausland: false,
    staatsbuergerschaftCheckbox: false,
    ...data
  };

  const [favorites, setFavorites] = useState({
    ort: citySuggestions.slice(0, 5),
    geburtsort: citySuggestions.slice(0, 5),
    arbeitsmarktzugang: arbeitsmarktzugangOptions.slice(0, 2),
    land: countrySuggestions.slice(0, 4),
  });

  const [newChild, setNewChild] = useState('');
  const [newSocialMedia, setNewSocialMedia] = useState('');
  const [newHomepage, setNewHomepage] = useState('');
  const [showSocialMedia, setShowSocialMedia] = useState(false);
  const [isKinderInputFocused, setIsKinderInputFocused] = useState(false);
  
  // Set default values for country fields
  useEffect(() => {
    if (!safeData.geburtsland) {
      updateData('geburtsland', 'Österreich');
    }
  }, []);

  // Sync Staatsbürgerschaft with Geburtsland when checkbox is active and Geburtsland changes
  useEffect(() => {
    if (safeData.geburtsland && safeData.staatsbuergerschaftCheckbox) {
      updateData('staatsbuergerschaft', safeData.geburtsland);
    }
  }, [safeData.geburtsland, safeData.staatsbuergerschaftCheckbox]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('personalDataFavorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('personalDataFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  const updateData = (field: keyof PersonalData, value: any) => {
    onChange({ ...safeData, [field]: value });
  };

  const toggleFavorite = (category: keyof typeof favorites, value: string) => {
    console.log('toggleFavorite called with:', category, value);
    setFavorites(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const addChild = () => {
    const trimmedChild = newChild.trim();
    if (trimmedChild) {
      // Strikte Validierung: Nur 4-stellige Jahre zwischen 1901 und 2099
      const year = parseInt(trimmedChild, 10);
      if (trimmedChild.length === 4 && year >= 1901 && year <= 2099) {
        updateData('kinder', [...safeData.kinder, trimmedChild]);
        setNewChild('');
      }
      // Ungültige Eingaben werden ignoriert (nicht hinzugefügt)
    }
  };

  const removeChild = (index: number) => {
    updateData('kinder', safeData.kinder.filter((_, i) => i !== index));
  };

  const addSocialMedia = () => {
    if (newSocialMedia.trim()) {
      updateData('socialMedia', [...safeData.socialMedia, newSocialMedia.trim()]);
      setNewSocialMedia('');
    }
  };

  const addHomepage = () => {
    if (newHomepage.trim()) {
      updateData('socialMedia', [...safeData.socialMedia, newHomepage.trim()]);
      setNewHomepage('');
    }
  };

  const removeSocialMedia = (index: number) => {
    updateData('socialMedia', safeData.socialMedia.filter((_, i) => i !== index));
  };

  const handleNumericInput = (value: string, setter: (val: string) => void) => {
    // Nur Ziffern zulassen
    const numericValue = value.replace(/[^\d]/g, '');
    setter(numericValue);
  };

  // Helper function to check if any field in a card has content
  const hasNameContent = safeData.titel || safeData.vorname || safeData.nachname;
  const hasContactContent = safeData.telefon || safeData.email || safeData.socialMedia.length > 0;
  const hasAddressContent = safeData.adresse || safeData.plz || safeData.ort || safeData.land;
  const hasBirthContent = safeData.geburtsdatum || safeData.geburtsort || safeData.geburtsland || safeData.staatsbuergerschaft || safeData.arbeitsmarktzugang;
  const hasFamilyContent = safeData.familienstand || safeData.kinder.length > 0;

  const clearNameData = () => {
    updateData('titel', '');
    updateData('vorname', '');
    updateData('nachname', '');
  };

  const clearContactData = () => {
    updateData('telefon', '');
    updateData('telefonVorwahl', '+43');
    updateData('email', '');
    updateData('socialMedia', []);
    setNewSocialMedia('');
    setNewHomepage('');
    setShowSocialMedia(false);
  };

  const clearAddressData = () => {
    updateData('adresse', '');
    updateData('plz', '');
    updateData('ort', '');
    updateData('land', '');
    updateData('ausland', false);
  };

  const clearBirthData = () => {
    updateData('geburtsdatum', '');
    updateData('geburtsort', '');
    updateData('geburtsland', '');
    updateData('staatsbuergerschaft', '');
    updateData('arbeitsmarktzugang', '');
    updateData('staatsbuergerschaftCheckbox', false);
  };

  const clearFamilyData = () => {
    updateData('familienstand', '');
    updateData('kinder', []);
    setNewChild('');
  };

  return (
    <div className="space-y-4">
      {/* Name & Titel */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4 space-y-4 relative">
        {hasNameContent && (
          <button
            type="button"
            onClick={clearNameData}
            className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            title="Alle Name & Titel Daten zurücksetzen"
          >
            <Eraser className="h-4 w-4" />
          </button>
        )}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vorname
            </label>
            <div className="relative">
              <input
                type="text"
                id="personal-vorname"
                name="vorname"
                value={safeData.vorname || ''}
                onChange={(e) => updateData('vorname', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 pr-10"
                placeholder="Vorname"
              />
              {safeData.vorname && (
                <button
                  type="button"
                  onClick={() => updateData('vorname', '')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
                  aria-label="Vorname löschen"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nachname
            </label>
            <div className="relative">
              <input
                type="text"
                id="personal-nachname"
                name="nachname"
                value={safeData.nachname || ''}
                onChange={(e) => updateData('nachname', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 pr-10"
                placeholder="Nachname"
              />
              {safeData.nachname && (
                <button
                  type="button"
                  onClick={() => updateData('nachname', '')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
                  aria-label="Nachname löschen"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="col-span-4">
            <AutocompleteInput
              label="Titel"
              value={safeData.titel}
              onChange={(value) => updateData('titel', value)}
              showAddButton={false}
              showFavoritesButton={false}
              suggestions={titleSuggestions}
              placeholder="Titel"
            />
          </div>
        </div>
      </div>

      {/* Kontaktdaten */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4 space-y-4 relative">
        {hasContactContent && (
          <button
            type="button"
            onClick={clearContactData}
            className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            title="Alle Kontaktdaten zurücksetzen"
          >
            <Eraser className="h-4 w-4" />
          </button>
        )}
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <PhoneInput
                countryCode={safeData.telefonVorwahl || '+43'}
                phoneNumber={safeData.telefon || ''}
                onCountryChange={(code) => updateData('telefonVorwahl', code)}
                onPhoneChange={(phone) => updateData('telefon', phone)}
              />
            </div>
            
            <div className="col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="personal-email"
                  name="email"
                  value={safeData.email || ''}
                  onChange={(e) => updateData('email', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 pr-10"
                  placeholder="email@beispiel.com"
                />
                {safeData.email && (
                  <button
                    type="button"
                    onClick={() => updateData('email', '')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
                    aria-label="E-Mail löschen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Social Media Checkbox */}
          <div className="flex items-center justify-end space-x-2">
            <ToggleSwitch
              checked={showSocialMedia}
              onChange={setShowSocialMedia}
              label="Social Media / Homepage"
            />
          </div>

          {/* Social Media Fields */}
          {showSocialMedia && (
            <div>
              <div className="grid grid-cols-2 gap-4">
                {/* Social Media */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Social Media
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="personal-social-media"
                      name="socialMedia"
                      value={newSocialMedia}
                      onChange={(e) => setNewSocialMedia(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSocialMedia()}
                      className="flex-1 h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="https://linkedin.com/in/..."
                    />
                    {newSocialMedia.trim() && (
                      <button
                        onClick={addSocialMedia}
                        className="w-10 h-10 text-white rounded-md transition-colors duration-200 flex items-center justify-center"
                        style={{ backgroundColor: '#F6A800' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F29400'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F6A800'}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>

                {/* Homepage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Homepage
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="personal-homepage"
                      name="homepage"
                      value={newHomepage}
                      onChange={(e) => setNewHomepage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addHomepage()}
                      className="flex-1 h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="https://meine-website.com"
                    />
                    {newHomepage.trim() && (
                      <button
                        onClick={addHomepage}
                        className="w-10 h-10 text-white rounded-md transition-colors duration-200 flex items-center justify-center"
                        style={{ backgroundColor: '#F6A800' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F29400'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F6A800'}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Social Media Tags below fields */}
              {safeData.socialMedia.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {safeData.socialMedia.map((link, index) => (
                    <TagButtonSelected
                      key={index}
                      label={link}
                      onRemove={() => removeSocialMedia(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Adresse */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4 space-y-4 relative">
        {hasAddressContent && (
          <button
            type="button"
            onClick={clearAddressData}
            className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            title="Alle Adressdaten zurücksetzen"
          >
            <Eraser className="h-4 w-4" />
          </button>
        )}
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Straße & Hausnummer
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="personal-adresse"
                  name="adresse"
                  value={safeData.adresse || ''}
                  onChange={(e) => updateData('adresse', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 pr-10"
                  placeholder="Musterstraße 123"
                />
                {safeData.adresse && (
                  <button
                    type="button"
                    onClick={() => updateData('adresse', '')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
                    aria-label="Adresse löschen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PLZ
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="personal-plz"
                  name="plz"
                  value={safeData.plz || ''}
                  onChange={(e) => handleNumericInput(e.target.value, (val) => updateData('plz', val))}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 pr-10"
                  placeholder="1010"
                />
                {safeData.plz && (
                  <button
                    type="button"
                    onClick={() => updateData('plz', '')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
                    aria-label="PLZ löschen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="col-span-5">
              <AutocompleteInput
                label="Ort"
                category="ort"
                value={safeData.ort || ''}
                onChange={(value) => updateData('ort', value)}
                showAddButton={false}
                showFavoritesButton={true}
                onFavoriteClick={(value, cat) => {
                  console.log('Ort onFavoriteClick:', value, cat);
                  if (value && cat) toggleFavorite(cat as keyof typeof favorites, value);
                }}
                suggestions={Array.from(new Set([...favorites.ort, ...citySuggestions]))}
                placeholder="Wien"
              />
            </div>
          </div>

          {/* Ort Favoriten */}
          {favorites.ort.filter(item => item !== (safeData.ort || '')).length > 0 && (
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
                <h4 className="text-sm font-medium text-gray-700">Orte:</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {favorites.ort
                  .filter(item => item !== (safeData.ort || ''))
                  .map((item) => (
                    <TagButtonFavorite
                      key={item}
                      label={item}
                      onClick={() => updateData('ort', item)}
                      onRemove={() => toggleFavorite('ort', item)}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Ausland Checkbox */}
          <div className="flex items-center justify-end space-x-2">
            <ToggleSwitch
              checked={safeData.ausland || false}
              onChange={(checked) => updateData('ausland', checked)}
              label="Ausland"
            />
          </div>
        </div>
      </div>

      {/* Geburtsdaten & Staatsbürgerschaft */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4 space-y-4 relative">
        {hasBirthContent && (
          <button
            type="button"
            onClick={clearBirthData}
            className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            title="Alle Geburtsdaten zurücksetzen"
          >
            <Eraser className="h-4 w-4" />
          </button>
        )}
          {/* Geburtsdaten mit Checkbox */}
          <div className="grid grid-cols-3 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geburtsdatum
              </label>
              <DatePicker
                className="w-full"
                value={safeData.geburtsdatum || ''}
                onChange={(value) => updateData('geburtsdatum', value)}
              />
            </div>
            
            <div>
              <AutocompleteInput
                className="w-full"
                label="Geburtsort"
                category="geburtsort"
                value={safeData.geburtsort || ''}
                onChange={(value) => updateData('geburtsort', value)}
                showAddButton={false}
                showFavoritesButton={true}
                onFavoriteClick={(value, cat) => {
                  console.log('Geburtsort onFavoriteClick:', value, cat);
                  if (value && cat) toggleFavorite(cat as keyof typeof favorites, value);
                }}
                suggestions={Array.from(new Set([...favorites.geburtsort, ...citySuggestions]))}
                placeholder="Geburtsort"
              />
            </div>
            
            <div>
              <CountryDropdown
                className="w-full"
                label="Geburtsland"
                value={safeData.geburtsland || ''}
                onChange={(value) => updateData('geburtsland', value)}
              />
            </div>
          </div>

          {/* Geburtsort Favoriten */}
          {favorites.geburtsort.filter(item => item !== (safeData.geburtsort || '')).length > 0 && (
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
                <h4 className="text-sm font-medium text-gray-700">Orte:</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {favorites.geburtsort
                  .filter(item => item !== (safeData.geburtsort || ''))
                  .map((item) => (
                    <TagButtonFavorite
                      key={item}
                      label={item}
                      onClick={() => updateData('geburtsort', item)}
                      onRemove={() => toggleFavorite('geburtsort', item)}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Staatsbürgerschaft Checkbox */}
          <div className="flex items-center justify-end space-x-2">
            <ToggleSwitch
              checked={safeData.staatsbuergerschaftCheckbox || false}
              onChange={(checked) => updateData('staatsbuergerschaftCheckbox', checked)}
              label="Staatsbürgerschaft"
            />
          </div>

          {/* Land Field - shown in new row when Ausland is checked */}
          {safeData.ausland && (
            <div>
              <CountryDropdown
                label="Land"
                value={safeData.land || ''}
                onChange={(value) => updateData('land', value)}
              />
            </div>
          )}
          {/* Bedingte Felder für Staatsbürgerschaft und Arbeitsmarktzugang */}
          {safeData.staatsbuergerschaftCheckbox && (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <CountryDropdown
                  label="Staatsbürgerschaft"
                  value={safeData.staatsbuergerschaft || ''}
                  onChange={(value) => updateData('staatsbuergerschaft', value)}
                />
              </div>
              
              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arbeitsmarktzugang
                </label>
                <select
                  id="personal-arbeitsmarktzugang"
                  name="arbeitsmarktzugang"
                  value={safeData.arbeitsmarktzugang || ''}
                  onChange={(e) => updateData('arbeitsmarktzugang', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                >
                  {arbeitsmarktzugangOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

      </div>

      {/* Familienstand */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4 space-y-4 relative">
        {hasFamilyContent && (
          <button
            type="button"
            onClick={clearFamilyData}
            className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            title="Alle Familiendaten zurücksetzen"
          >
            <Eraser className="h-4 w-4" />
          </button>
        )}
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 items-start">
            <div className="col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Familienstand
              </label>
              <select
                id="personal-familienstand"
                name="familienstand"
                value={safeData.familienstand || ''}
                onChange={(e) => updateData('familienstand', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
              >
                {familienstandOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Kinder */}
            <div className="col-span-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geburtsjahr
              </label>
              
              <KinderYearPicker
                value={newChild}
                onChange={setNewChild}
                onAdd={addChild}
              />
              
              {/* Kinder Tags below field */}
              {(safeData.kinder || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(safeData.kinder || []).map((child, index) => (
                    <TagButtonSelected
                      key={index}
                      label={child}
                      onRemove={() => removeChild(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}