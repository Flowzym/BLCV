import {
  useState,
  useEffect,
  type ChangeEvent,
  type CSSProperties,
} from 'react';
import {
  Bookmark,
  FolderOpen,
  Trash2,
  Download,
  Upload,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';

interface ProfileData {
  berufe: string[];
  taetigkeiten: string[];
  skills: string[];
  softskills: string[];
  ausbildung: string[];
  zusatzangaben: string;
}

interface SavedProfile {
  id: string;
  name: string;
  data: ProfileData;
  createdAt: string;
}

interface SavedProfilesTabProps {
  onContentChange: (content: string) => void;
}

export default function SavedProfilesTab({ onContentChange }: SavedProfilesTabProps) {
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [showSaveForm, setShowSaveForm] = useState(false); // BOLT-UI-ANPASSUNG 2025-01-15: Profil speichern im Profile-Reiter
  const [profileName, setProfileName] = useState(''); // BOLT-UI-ANPASSUNG 2025-01-15: Profil speichern im Profile-Reiter

  // Load saved profiles from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedProfiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SavedProfile[]; // parsed from storage
        setSavedProfiles(parsed);
      } catch (error) {
        console.error('Error loading saved profiles:', error);
      }
    }
  }, []);

  // Save profiles to localStorage whenever savedProfiles changes
  useEffect(() => {
    localStorage.setItem('savedProfiles', JSON.stringify(savedProfiles));
  }, [savedProfiles]);

  const loadProfile = (profile: SavedProfile) => {
    const sections: string[] = []; // build textual sections
    
    if (profile.data.berufe && profile.data.berufe.length > 0) {
      sections.push(`BERUFE:\n${(profile.data.berufe || []).join(', ')}`);
    }
    
    if (profile.data.taetigkeiten && profile.data.taetigkeiten.length > 0) {
      sections.push(`TÄTIGKEITEN:\n${(profile.data.taetigkeiten || []).join(', ')}`);
    }
    
    if (profile.data.skills && profile.data.skills.length > 0) {
      sections.push(`SKILLS:\n${(profile.data.skills || []).join(', ')}`);
    }
    
    if (profile.data.softskills && profile.data.softskills.length > 0) {
      sections.push(`SOFT SKILLS:\n${(profile.data.softskills || []).join(', ')}`);
    }
    
    if (profile.data.ausbildung && profile.data.ausbildung.length > 0) { 
      sections.push(`AUSBILDUNG/QUALIFIKATIONEN:\n${(profile.data.ausbildung || []).join(', ')}`);
    }
    
    if (profile.data.zusatzangaben && profile.data.zusatzangaben.trim()) {
      sections.push(`ZUSÄTZLICHE ANGABEN:\n${(profile.data.zusatzangaben || '').trim()}`);
    }
    
    onContentChange(sections.join('\n\n'));
  };

  const deleteProfile = (profileId: string) => {
    setSavedProfiles(savedProfiles.filter(p => p.id !== profileId));
  };

  const exportProfile = (profile: SavedProfile) => {
    const content = JSON.stringify(profile, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profil-${profile.name.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    try {
      const content = await file.text();
      const profile = JSON.parse(content) as SavedProfile; // parsed import file

      // Validate the structure
      if (!profile.id || !profile.name || !profile.data || !profile.createdAt) {
        throw new Error('Ungültiges Profil-Format. Die Datei enthält nicht alle erforderlichen Felder.');
      }

      // Validate data structure
      const requiredFields = ['berufe', 'taetigkeiten', 'skills', 'softskills', 'zusatzangaben'];
      for (const field of requiredFields) {
        if (field === 'zusatzangaben') {
          if (typeof profile.data[field] !== 'string') {
            throw new Error(`Ungültiges Format für ${field}.`);
          }
        } else {
          if (!Array.isArray(profile.data[field])) {
            throw new Error(`Ungültiges Format für ${field}.`);
          }
        }
      }

      // Check if profile already exists
      const existingProfile = savedProfiles.find(p => p.id === profile.id);
      if (existingProfile) {
        throw new Error('Ein Profil mit dieser ID existiert bereits.');
      }

      // Add the profile
      setSavedProfiles([...savedProfiles, profile]);
      setImportSuccess(`Profil "${profile.name}" erfolgreich importiert!`);
      
      // Clear the file input
      event.target.value = '';
    } catch (error) {
      console.error('Import error:', error);
      setImportError(error instanceof Error ? error.message : 'Unbekannter Fehler beim Importieren der Datei.');
      event.target.value = '';
    }
  };

  // BOLT-UI-ANPASSUNG 2025-01-15: Profil speichern im Profile-Reiter
  const saveProfile = () => {
    if (!profileName.trim()) return;

    // Hole das aktuelle Profil aus dem localStorage
    try {
      const currentProfileData = localStorage.getItem('currentProfileData');
      if (!currentProfileData) {
        setImportError('Kein aktuelles Profil zum Speichern vorhanden.');
        return;
      }

      const profileData = JSON.parse(currentProfileData) as ProfileData; // current profile
      const newProfile: SavedProfile = {
        id: Date.now().toString(),
        name: profileName.trim(),
        data: profileData,
        createdAt: new Date().toISOString(),
      };

      setSavedProfiles([...savedProfiles, newProfile]);
      setProfileName('');
      setShowSaveForm(false);
      setImportSuccess(`Profil "${newProfile.name}" erfolgreich gespeichert!`);
    } catch (error) {
      console.error('Error saving profile:', error);
      setImportError('Fehler beim Speichern des Profils.');
    }
  };

  return (
    <div className="space-y-6">
      {/* BOLT-UI-ANPASSUNG 2025-01-15: Keine Überschrift nach Reiterauswahl */}

      {/* Import Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-3">Profil importieren</h3>
        <p className="text-sm text-blue-700 mb-4">
          Laden Sie ein zuvor exportiertes Profil hoch.
        </p>
        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200">
            <Upload className="h-4 w-4" />
            <span>Profil-Datei auswählen</span>
          </button>
        </div>

        {/* BOLT-UI-ANPASSUNG 2025-01-15: Profil speichern im Profile-Reiter */}
        <div className="mt-4">
          <h3 className="font-medium text-blue-900 mb-3">Aktuelles Profil speichern</h3>
          {!showSaveForm ? (
            <button
              onClick={() => setShowSaveForm(true)}
              className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors duration-200"
              style={{ backgroundColor: '#F29400' }}
            >
              <Bookmark className="h-4 w-4" />
              <span>Profil speichern</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Profilname eingeben..."
                  className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as CSSProperties}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      saveProfile();
                    }
                  }}
                />
                <button
                  onClick={saveProfile}
                  disabled={!profileName.trim()}
                  className="px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: '#F29400' }}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setShowSaveForm(false);
                    setProfileName('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-lg transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Import Messages */}
        {importError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#F29400' }} />
              <p className="text-sm font-medium">Fehler beim Import:</p>
            </div>
            <p className="text-red-600 text-sm mt-1">{importError}</p>
          </div>
        )}

        {importSuccess && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-green-700">
              <Check className="h-4 w-4 flex-shrink-0" style={{ color: '#F29400' }} />
              <p className="text-sm font-medium">{importSuccess}</p>
            </div>
          </div>
        )}
      </div>

      {/* Saved Profiles List */}
      {savedProfiles.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Verfügbare Profile ({savedProfiles.length})</h3>
          <div className="grid gap-4">
            {savedProfiles.map((profile) => (
              <div key={profile.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">{profile.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Erstellt: {new Date(profile.createdAt).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    
                    {/* Profile Summary */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.data.berufe.length > 0 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {profile.data.berufe.length} Berufe
                        </span>
                      )}
                      {profile.data.taetigkeiten.length > 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {profile.data.taetigkeiten.length} Tätigkeiten
                        </span>
                      )}
                      {profile.data.skills.length > 0 && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          {profile.data.skills.length} Skills
                        </span>
                      )}
                      {profile.data.softskills.length > 0 && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                          {profile.data.softskills.length} Soft Skills
                        </span>
                      )}
                      {profile.data.ausbildung && profile.data.ausbildung.length > 0 && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                          {profile.data.ausbildung.length} Qualifikationen
                        </span>
                      )}
                      {profile.data.zusatzangaben.trim() && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          Zusatzangaben
                        </span>
                      )}
                    </div>

                    {/* Preview of content */}
                    <div className="text-sm text-gray-600">
                      {profile.data.berufe.length > 0 && (
                        <p><strong>Berufe:</strong> {profile.data.berufe.slice(0, 3).join(', ')}{profile.data.berufe.length > 3 ? '...' : ''}</p>
                      )}
                      {profile.data.skills.length > 0 && (
                        <p><strong>Skills:</strong> {profile.data.skills.slice(0, 3).join(', ')}{profile.data.skills.length > 3 ? '...' : ''}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => loadProfile(profile)}
                      className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm transition-colors duration-200"
                      title="Profil laden"
                    >
                      <FolderOpen className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => exportProfile(profile)}
                      className="px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md text-sm transition-colors duration-200"
                      title="Profil exportieren"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteProfile(profile.id)}
                      className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md text-sm transition-colors duration-200"
                      title="Profil löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Bookmark className="h-16 w-16 mx-auto mb-4" style={{ color: '#F29400' }} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine gespeicherten Profile</h3>
          <p className="text-gray-600 mb-4">
            Sie haben noch keine Profile gespeichert. Erstellen Sie ein Profil über die strukturierte Eingabe 
            und speichern Sie es für die spätere Verwendung.
          </p>
          <p className="text-sm text-gray-500">
            Sie können auch ein zuvor exportiertes Profil über die Import-Funktion oben laden.
          </p>
        </div>
      )}
    </div>
  );
}