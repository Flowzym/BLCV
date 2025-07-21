import React, { useState } from 'react';
import { FileText, Edit3, Link, AlertCircle, User, Plus, Bookmark, Briefcase } from 'lucide-react';
import FileUpload from './FileUpload';
import TextInput from './TextInput';
import ProfileInput from './ProfileInput';
import SavedProfilesTab from './SavedProfilesTab';
import JobFieldInput from './JobFieldInput';
import { extractTextFromUrl } from '../services/fileParser';

interface InputSectionProps {
  title: string;
  icon: React.ReactNode;
  onContentChange: (content: string) => void;
  placeholder: string;
  fileAccept?: string;
  showUrlInput?: boolean;
  isProfileSection?: boolean;
  profileConfig?: {
    berufe: string[];
    taetigkeiten: string[];
    skills: string[];
    softskills: string[];
    ausbildung: string[];
  };
}

type InputMode = 'file' | 'text' | 'url' | 'structured' | 'saved' | 'jobfield';

export default function InputSection({ 
  title, 
  icon, 
  onContentChange, 
  placeholder, 
  fileAccept = ".txt,.docx,.pdf",
  showUrlInput = false,
  isProfileSection = false,
  profileConfig = {
    berufe: [],
    taetigkeiten: [],
    skills: [],
    softskills: [],
    ausbildung: [],
  }
}: InputSectionProps) {
  const [mode, setMode] = useState<InputMode>(isProfileSection ? 'structured' : 'text');
  const [textContent, setTextContent] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleTextChange = (content: string) => {
    setTextContent(content);
    onContentChange(content);
  };

  const handleFileChange = (content: string) => {
    setFileContent(content);
    onContentChange(content);
  };

  const handleUrlLoad = async () => {
    if (!urlContent.trim()) return;
    
    setIsLoadingUrl(true);
    setUrlError(null);
    
    try {
      const content = await extractTextFromUrl(urlContent);
      onContentChange(content);
    } catch (error) {
      console.error('Error loading URL:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler beim Laden der URL';
      setUrlError(errorMessage);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const switchToStructuredWithContent = () => {
    setMode('structured');
    // Existing CV text will be passed via initialContent prop in ProfileInput
  };

  // Bestimme die Anzahl der Zeilen basierend auf dem Titel
  const getTextAreaRows = () => {
    if (title.toLowerCase().includes('stellenanzeige')) {
      return 27; // BOLT-UI-ANPASSUNG 2025-01-15: Ca. 50% länger (18 * 1.5 = 27)
    }
    return 8; // Standard für andere Felder
  };

  // Prüfe ob es sich um die Stellenanzeige handelt
  const isJobSection = title.toLowerCase().includes('stellenanzeige');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col overflow-y-auto">
      <div className="sticky top-0 bg-white pb-4 z-10">
        <div className="flex items-center space-x-3 mb-6">
          {/* BOLT-UI-ANPASSUNG 2025-01-15: Icons in #F29400 einfärben */}
          {React.cloneElement(icon as React.ReactElement, { style: { color: '#F29400' } })}
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {isProfileSection && (
          <>
            <button
              onClick={() => setMode('structured')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                mode === 'structured'
                  ? 'bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={mode === 'structured' ? { color: '#F29400' } : {}}
            >
              <User className="h-4 w-4" />
              {/* BOLT-UI-ANPASSUNG 2025-01-15: Reiter umbenannt */}
              <span>Strukturiert</span>
            </button>
            
            <button
              onClick={() => setMode('saved')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                mode === 'saved'
                  ? 'bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={mode === 'saved' ? { color: '#F29400' } : {}}
            >
              <Bookmark className="h-4 w-4" />
              {/* BOLT-UI-ANPASSUNG 2025-01-15: Reiter umbenannt */}
              <span>Profile</span>
            </button>
          </>
        )}
        
        <button
          onClick={() => setMode('file')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            mode === 'file'
              ? 'bg-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          style={mode === 'file' ? { color: '#F29400' } : {}}
        >
          <FileText className="h-4 w-4" />
          {/* BOLT-UI-ANPASSUNG 2025-01-15: Reiter umbenannt */}
          <span>{isJobSection ? 'Datei' : 'Upload'}</span>
        </button>
        
        <button
          onClick={() => setMode('text')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            mode === 'text'
              ? 'bg-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          style={mode === 'text' ? { color: '#F29400' } : {}}
        >
          <Edit3 className="h-4 w-4" />
          {/* BOLT-UI-ANPASSUNG 2025-01-15: Reiter umbenannt */}
          <span>Text</span>
        </button>

        {/* BOLT-UI-ANPASSUNG 2025-01-15: Berufsfeld-Reiter für Stellenanzeige */}
        {isJobSection && (
          <button
            onClick={() => setMode('jobfield')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              mode === 'jobfield'
                ? 'bg-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={mode === 'jobfield' ? { color: '#F29400' } : {}}
          >
            <Briefcase className="h-4 w-4" />
            <span>Berufsfeld</span>
          </button>
        )}

        {showUrlInput && (
          <button
            onClick={() => setMode('url')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              mode === 'url'
                ? 'bg-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={mode === 'url' ? { color: '#F29400' } : {}}
          >
            <Link className="h-4 w-4" />
            <span>URL</span>
          </button>
        )}
      </div>
      </div>

      {mode === 'structured' && isProfileSection && (
        <ProfileInput
          onContentChange={onContentChange}
          profileConfig={profileConfig}
          initialContent={textContent || fileContent}
        />
      )}

      {mode === 'saved' && isProfileSection && (
        <SavedProfilesTab
          onContentChange={onContentChange}
        />
      )}

      {mode === 'file' && (
        <div className="space-y-4">
          <FileUpload
            onContentChange={handleFileChange}
            label=""
            accept={fileAccept}
            placeholder={`${title} als Datei hochladen`}
          />
          
          {/* Option to extend with structured profile for CV section */}
          {isProfileSection && fileContent.trim() && (
            <div className="border rounded-lg p-4" style={{ backgroundColor: '#FEF7EE', borderColor: '#F29400' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium" style={{ color: '#F29400' }}>Lebenslauf erweitern</h4>
                  <p className="text-sm" style={{ color: '#F29400' }}>
                    Möchten Sie Ihren hochgeladenen Lebenslauf mit strukturierten Profildaten erweitern?
                  </p>
                </div>
                <button
                  onClick={() => switchToStructuredWithContent(fileContent)}
                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: '#F29400' }}
                >
                  <Plus className="h-4 w-4" />
                  <span>Erweitern</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'text' && (
        <div className="space-y-4">
          <TextInput
            value={textContent}
            onChange={handleTextChange}
            label=""
            placeholder={isJobSection ? 
              "Hier Stellenanzeige, Anforderungen, Aufgaben, Unternehmensinfos etc. eintragen…" : // BOLT-UI-ANPASSUNG 2025-01-15: Platzhalter angepasst
              placeholder
            }
            rows={getTextAreaRows()}
          />
          
          {/* Option to extend with structured profile for CV section */}
          {isProfileSection && textContent.trim() && (
            <div className="border rounded-lg p-4" style={{ backgroundColor: '#FEF7EE', borderColor: '#F29400' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium" style={{ color: '#F29400' }}>Lebenslauf erweitern</h4>
                  <p className="text-sm" style={{ color: '#F29400' }}>
                    Möchten Sie Ihren eingegebenen Lebenslauf mit strukturierten Profildaten erweitern?
                  </p>
                </div>
                <button
                  onClick={() => switchToStructuredWithContent(textContent)}
                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: '#F29400' }}
                >
                  <Plus className="h-4 w-4" />
                  <span>Erweitern</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOLT-UI-ANPASSUNG 2025-01-15: Berufsfeld-Komponente */}
      {mode === 'jobfield' && isJobSection && (
        <JobFieldInput
          onContentChange={onContentChange}
          profileConfig={profileConfig}
        />
      )}

      {mode === 'url' && showUrlInput && (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="url"
              value={urlContent}
              onChange={(e) => setUrlContent(e.target.value)}
              placeholder="https://beispiel.com/stellenanzeige"
              className="flex-1 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2"
              style={{ 
                borderColor: '#F29400',
                '--tw-ring-color': '#F29400'
              } as React.CSSProperties}
            />
            <button
              onClick={handleUrlLoad}
              disabled={isLoadingUrl || !urlContent.trim()}
              className="px-4 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              style={{ backgroundColor: '#F29400' }}
            >
              {isLoadingUrl ? 'Laden...' : 'Versuchen'}
            </button>
          </div>

          {urlError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#F29400' }} />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Fehler beim Laden der URL</p>
                  <p>{urlError}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}