/**
 * Content Suggestion Panel
 * AI-powered content suggestions for CV sections
 */

import React, { useState } from 'react';

interface ContentSuggestionPanelProps {
  cvData: any;
  onContentUpdate: (sectionType: string, newContent: string) => void;
}

export const ContentSuggestionPanel: React.FC<ContentSuggestionPanelProps> = ({
  cvData,
  onContentUpdate
}) => {
  const [selectedSection, setSelectedSection] = useState<string>('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const sections = [
    { id: 'summary', label: 'Profil-Zusammenfassung', icon: '👤' },
    { id: 'experience', label: 'Berufserfahrung', icon: '💼' },
    { id: 'education', label: 'Ausbildung', icon: '🎓' },
    { id: 'skills', label: 'Fähigkeiten', icon: '🧠' }
  ];

  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const mockSuggestions = [
        'Erfahrener Softwareentwickler mit Fokus auf moderne Web-Technologien',
        'Leidenschaftlicher Entwickler mit starken Problemlösungsfähigkeiten',
        'Teamorientierter Professional mit Expertise in agilen Entwicklungsmethoden'
      ];
      setSuggestions(mockSuggestions);
      setIsGenerating(false);
    }, 2000);
  };

  const applySuggestion = (suggestion: string) => {
    onContentUpdate(selectedSection, suggestion);
  };

  return (
    <div className="content-suggestion-panel space-y-4">
      {/* Section Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sektion auswählen
        </label>
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {sections.map(section => (
            <option key={section.id} value={section.id}>
              {section.icon} {section.label}
            </option>
          ))}
        </select>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateSuggestions}
        disabled={isGenerating}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            KI generiert Vorschläge...
          </span>
        ) : (
          '✨ KI-Vorschläge generieren'
        )}
      </button>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Vorschläge für {sections.find(s => s.id === selectedSection)?.label}
          </h4>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => applySuggestion(suggestion)}
              >
                <p className="text-sm text-gray-700">{suggestion}</p>
                <button className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                  Übernehmen →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Content Preview */}
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Aktueller Inhalt
        </h4>
        <div className="text-sm text-gray-600">
          {selectedSection === 'summary' && cvData?.personalData?.summary && (
            <p>{cvData.personalData.summary}</p>
          )}
          {selectedSection === 'experience' && cvData?.workExperience?.[0]?.description && (
            <p>{cvData.workExperience[0].description}</p>
          )}
          {selectedSection === 'education' && cvData?.education?.[0]?.description && (
            <p>{cvData.education[0].description}</p>
          )}
          {!cvData && (
            <p className="italic">Kein Inhalt vorhanden</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentSuggestionPanel;