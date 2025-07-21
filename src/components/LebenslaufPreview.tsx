import React, { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Download,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { useLebenslauf } from './LebenslaufContext';
import { formatZeitraum } from '../utils/dateUtils';

type PreviewTab = 'gesamt' | 'berufserfahrung' | 'ausbildung' | 'fachkompetenzen' | 'softskills';

export default function LebenslaufPreview() {
  const { 
    personalData, 
    berufserfahrung, 
    ausbildung,
    selectedExperienceId,
    selectedEducationId,
    multiSelectedExperienceIds,
    toggleMultiExperienceSelection,
    previewTab,
    setPreviewTabWithSync,
    bisTranslatorResults
  } = useLebenslauf();

  const [copied, setCopied] = useState(false);
  const [showEmptyFields, setShowEmptyFields] = useState(false);

  // Helper function to check if a field has content
  const hasContent = (value: any): boolean => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'boolean') return value;
    return value != null;
  };

  // Helper function to format arrays
  const formatArray = (arr: string[] | undefined, separator: string = ', '): string => {
    return Array.isArray(arr) ? arr.join(separator) : '';
  };

  // Generate preview content based on active tab
  const generatePreviewContent = (): string => {
    const sections: string[] = [];

    if (previewTab === 'gesamt' || previewTab === 'berufserfahrung') {
      // Personal Data Section
      if (hasContent(personalData?.vorname) || hasContent(personalData?.nachname) || showEmptyFields) {
        const personalSection: string[] = [];
        
        if (hasContent(personalData?.titel)) {
          personalSection.push(`Titel: ${personalData.titel}`);
        }
        
        const fullName = [personalData?.vorname, personalData?.nachname].filter(Boolean).join(' ');
        if (fullName || showEmptyFields) {
          personalSection.push(`Name: ${fullName || '[Name]'}`);
        }
        
        if (hasContent(personalData?.telefon) || showEmptyFields) {
          const phone = personalData?.telefonVorwahl && personalData?.telefon 
            ? `${personalData.telefonVorwahl} ${personalData.telefon}`
            : personalData?.telefon || '[Telefon]';
          personalSection.push(`Telefon: ${phone}`);
        }
        
        if (hasContent(personalData?.email) || showEmptyFields) {
          personalSection.push(`E-Mail: ${personalData?.email || '[E-Mail]'}`);
        }
        
        if (hasContent(personalData?.adresse) || hasContent(personalData?.plz) || hasContent(personalData?.ort) || showEmptyFields) {
          const address = [personalData?.adresse, personalData?.plz, personalData?.ort].filter(Boolean).join(', ');
          personalSection.push(`Adresse: ${address || '[Adresse]'}`);
        }
        
        if (hasContent(personalData?.geburtsdatum) || showEmptyFields) {
          personalSection.push(`Geburtsdatum: ${personalData?.geburtsdatum || '[Geburtsdatum]'}`);
        }
        
        if (personalSection.length > 0) {
          sections.push(`PERSÖNLICHE DATEN\n${personalSection.join('\n')}`);
        }
      }

      // Experience Section
      if (berufserfahrung.length > 0 || showEmptyFields) {
        const experienceSection: string[] = [];
        
        berufserfahrung.forEach((exp, index) => {
          const expLines: string[] = [];
          
          const zeitraum = formatZeitraum(
            exp.startMonth,
            exp.startYear,
            exp.endMonth,
            exp.endYear,
            exp.isCurrent
          );
          
          if (zeitraum || showEmptyFields) {
            expLines.push(`Zeitraum: ${zeitraum || '[Zeitraum]'}`);
          }
          
          if (hasContent(exp.companies) || showEmptyFields) {
            expLines.push(`Unternehmen: ${formatArray(exp.companies) || '[Unternehmen]'}`);
          }
          
          if (hasContent(exp.position) || showEmptyFields) {
            expLines.push(`Position: ${formatArray(exp.position) || '[Position]'}`);
          }
          
          if (hasContent(exp.aufgabenbereiche) || showEmptyFields) {
            expLines.push(`Tätigkeiten: ${formatArray(exp.aufgabenbereiche) || '[Tätigkeiten]'}`);
          }
          
          if (hasContent(exp.zusatzangaben)) {
            expLines.push(`Zusatzangaben: ${exp.zusatzangaben}`);
          }
          
          if (expLines.length > 0) {
            experienceSection.push(`Berufserfahrung ${index + 1}:\n${expLines.join('\n')}`);
          }
        });
        
        if (experienceSection.length > 0) {
          sections.push(`BERUFSERFAHRUNG\n${experienceSection.join('\n\n')}`);
        }
      }
    }

    if (previewTab === 'gesamt' || previewTab === 'ausbildung') {
      // Education Section
      if (ausbildung.length > 0 || showEmptyFields) {
        const educationSection: string[] = [];
        
        ausbildung.forEach((edu, index) => {
          const eduLines: string[] = [];
          
          const zeitraum = formatZeitraum(
            edu.startMonth,
            edu.startYear,
            edu.endMonth,
            edu.endYear,
            edu.isCurrent
          );
          
          if (zeitraum || showEmptyFields) {
            eduLines.push(`Zeitraum: ${zeitraum || '[Zeitraum]'}`);
          }
          
          if (hasContent(edu.institution) || showEmptyFields) {
            eduLines.push(`Institution: ${formatArray(edu.institution) || '[Institution]'}`);
          }
          
          if (hasContent(edu.ausbildungsart) || showEmptyFields) {
            eduLines.push(`Ausbildungsart: ${formatArray(edu.ausbildungsart) || '[Ausbildungsart]'}`);
          }
          
          if (hasContent(edu.abschluss) || showEmptyFields) {
            eduLines.push(`Abschluss: ${formatArray(edu.abschluss) || '[Abschluss]'}`);
          }
          
          if (hasContent(edu.zusatzangaben)) {
            eduLines.push(`Zusatzangaben: ${edu.zusatzangaben}`);
          }
          
          if (eduLines.length > 0) {
            educationSection.push(`Ausbildung ${index + 1}:\n${eduLines.join('\n')}`);
          }
        });
        
        if (educationSection.length > 0) {
          sections.push(`AUSBILDUNG\n${educationSection.join('\n\n')}`);
        }
      }
    }

    return sections.join('\n\n\n') || 'Keine Daten vorhanden';
  };

  const handleCopy = async () => {
    try {
      const content = generatePreviewContent();
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    const content = generatePreviewContent();
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'lebenslauf.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const tabs: { id: PreviewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'gesamt', label: 'Gesamt', icon: <FileText className="h-4 w-4" /> },
    { id: 'berufserfahrung', label: 'Berufserfahrung', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'ausbildung', label: 'Ausbildung', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'fachkompetenzen', label: 'Fachkompetenzen', icon: <User className="h-4 w-4" /> },
    { id: 'softskills', label: 'Softskills', icon: <User className="h-4 w-4" /> }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Eye className="h-6 w-6" style={{ color: '#F29400' }} />
          <h2 className="text-lg font-semibold text-gray-900">Vorschau</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEmptyFields(!showEmptyFields)}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors duration-200"
            title={showEmptyFields ? "Leere Felder ausblenden" : "Leere Felder anzeigen"}
          >
            {showEmptyFields ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span>{showEmptyFields ? "Ausblenden" : "Alle zeigen"}</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors duration-200"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Kopiert!" : "Kopieren"}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-white rounded transition-colors duration-200"
            style={{ backgroundColor: '#F29400' }}
          >
            <Download className="h-3 w-3" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setPreviewTabWithSync(tab.id)}
              className={`flex items-center gap-2 py-2 px-3 -mb-px border-b-2 text-sm font-medium transition-colors duration-200 ${
                previewTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {previewTab === 'berufserfahrung' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Berufserfahrung ({berufserfahrung.length})
              </h3>
              <div className="text-xs text-gray-500">
                {multiSelectedExperienceIds.length > 0 && (
                  <span>{multiSelectedExperienceIds.length} für KI-Assistent ausgewählt</span>
                )}
              </div>
            </div>
            
            {berufserfahrung.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Noch keine Berufserfahrung hinzugefügt</p>
              </div>
            ) : (
              <div className="space-y-4">
                {berufserfahrung.map((exp, index) => {
                  const isSelected = selectedExperienceId === exp.id;
                  const isMultiSelected = multiSelectedExperienceIds.includes(exp.id);
                  
                  return (
                    <div
                      key={exp.id}
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        isSelected 
                          ? 'border-orange-300 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleMultiExperienceSelection(exp.id)}
                            className="text-orange-500 hover:text-orange-600"
                            title="Für KI-Assistent auswählen"
                          >
                            {isMultiSelected ? (
                              <CheckSquare className="h-5 w-5" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                          <h4 className="font-medium text-gray-900">
                            Berufserfahrung {index + 1}
                          </h4>
                        </div>
                        {isSelected && (
                          <span className="px-2 py-1 text-xs text-white rounded-full" style={{ backgroundColor: '#F29400' }}>
                            Bearbeitung
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        {hasContent(formatZeitraum(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.isCurrent)) && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatZeitraum(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.isCurrent)}</span>
                          </div>
                        )}
                        
                        {hasContent(exp.companies) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{formatArray(exp.companies)}</span>
                          </div>
                        )}
                        
                        {hasContent(exp.position) && (
                          <div className="flex items-start gap-2">
                            <Briefcase className="h-4 w-4 text-gray-400 mt-0.5" />
                            <span>{formatArray(exp.position)}</span>
                          </div>
                        )}
                        
                        {hasContent(exp.aufgabenbereiche) && (
                          <div className="space-y-1">
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div className="flex-1">
                                <span className="font-medium text-gray-700">Tätigkeiten:</span>
                                <ul className="mt-1 space-y-1">
                                  {exp.aufgabenbereiche.map((aufgabe, aufgabeIndex) => {
                                    const hasBisTranslation = bisTranslatorResults && bisTranslatorResults[aufgabe];
                                    
                                    return (
                                      <li key={aufgabeIndex} className="text-gray-600">
                                        <div className="flex items-start gap-1">
                                          <span className="text-orange-500 mt-1">•</span>
                                          <div className="flex-1">
                                            <span>{aufgabe}</span>
                                            {hasBisTranslation && (
                                              <div className="mt-1 ml-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                                <div className="font-medium text-green-800 mb-1">BIS-Kompetenzen:</div>
                                                <ul className="space-y-0.5">
                                                  {bisTranslatorResults[aufgabe].map((bisKompetenz, bisIndex) => (
                                                    <li key={bisIndex} className="text-green-700">
                                                      • {bisKompetenz}
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {/* Log BIS translation if found */}
                                        {hasBisTranslation && console.log(`🎯 Found BIS translation for "${aufgabe}":`, bisTranslatorResults[aufgabe])}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {hasContent(exp.zusatzangaben) && (
                          <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                            <span className="text-gray-700 text-sm">{exp.zusatzangaben}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {previewTab === 'ausbildung' && (
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ausbildung ({ausbildung.length})
            </h3>
            
            {ausbildung.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Noch keine Ausbildung hinzugefügt</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ausbildung.map((edu, index) => {
                  const isSelected = selectedEducationId === edu.id;
                  
                  return (
                    <div
                      key={edu.id}
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        isSelected 
                          ? 'border-orange-300 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          Ausbildung {index + 1}
                        </h4>
                        {isSelected && (
                          <span className="px-2 py-1 text-xs text-white rounded-full" style={{ backgroundColor: '#F29400' }}>
                            Bearbeitung
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        {hasContent(formatZeitraum(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, edu.isCurrent)) && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatZeitraum(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, edu.isCurrent)}</span>
                          </div>
                        )}
                        
                        {hasContent(edu.institution) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{formatArray(edu.institution)}</span>
                          </div>
                        )}
                        
                        {hasContent(edu.ausbildungsart) && (
                          <div className="flex items-start gap-2">
                            <GraduationCap className="h-4 w-4 text-gray-400 mt-0.5" />
                            <span>{formatArray(edu.ausbildungsart)}</span>
                          </div>
                        )}
                        
                        {hasContent(edu.abschluss) && (
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-gray-400 mt-0.5" />
                            <span>{formatArray(edu.abschluss)}</span>
                          </div>
                        )}
                        
                        {hasContent(edu.zusatzangaben) && (
                          <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                            <span className="text-gray-700 text-sm">{edu.zusatzangaben}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(previewTab === 'gesamt' || previewTab === 'fachkompetenzen' || previewTab === 'softskills') && (
          <div className="p-4">
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {previewTab === 'gesamt' ? 'Gesamtvorschau' : 
                   previewTab === 'fachkompetenzen' ? 'Fachkompetenzen' : 'Softskills'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {previewTab === 'gesamt' 
                    ? 'Hier wird eine formatierte Gesamtansicht Ihres Lebenslaufs angezeigt.'
                    : `Die ${previewTab}-Sektion wird in einer zukünftigen Version verfügbar sein.`
                  }
                </p>
                <div className="bg-white rounded border p-4 text-left">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {generatePreviewContent()}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}