/**
 * Export Phase
 * Allows users to download their finished CV in various formats
 */

import React, { useState } from 'react';
import { StyleConfig } from '../../types/styles';
import { exportTemplateToDocx } from '../../services/exportLayoutDocx';
import { useCvContext } from '../../context/CvContext';
import { 
  Download, 
  Eye, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

// Mock CVData interface for playground
interface CVData {
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    profession?: string;
    summary?: string;
    profileImage?: string;
  };
  workExperience: Array<{
    id: string;
    position: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate: string;
    description?: string;
    grade?: string;
    fieldOfStudy?: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category?: string;
  }>;
  languages?: Array<{
    id: string;
    name: string;
    level: string;
  }>;
}

interface ExportPhaseProps {
  cvData: CVData | null;
  styleConfig: StyleConfig;
}

export const ExportPhase: React.FC<ExportPhaseProps> = ({
  cvData,
  styleConfig
}) => {
  const [exportReadiness, setExportReadiness] = useState<{
    isReady: boolean;
    issues: string[];
    warnings: string[];
  }>({ isReady: false, issues: [], warnings: [] });
  const [isExporting, setIsExporting] = useState(false);
  
  // Access CV context for template operations
  const { saveTemplate } = useCvContext();

  // Check export readiness when CV data changes
  React.useEffect(() => {
    if (cvData) {
      checkExportReadiness(cvData);
    } else {
      setExportReadiness({ isReady: false, issues: ['Kein CV geladen'], warnings: [] });
    }
  }, [cvData]);

  // Check if CV is ready for export
  const checkExportReadiness = (cv: CVData) => {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Required fields check
    if (!cv.personalData.firstName || !cv.personalData.lastName) {
      issues.push('Vor- und Nachname sind erforderlich');
    }
    if (!cv.personalData.email) {
      issues.push('E-Mail-Adresse ist erforderlich');
    }

    // Content completeness check
    if (cv.workExperience.length === 0) {
      warnings.push('Keine Berufserfahrung angegeben');
    }
    if (cv.education.length === 0) {
      warnings.push('Keine Ausbildung angegeben');
    }
    if (cv.skills.length === 0) {
      warnings.push('Keine Fähigkeiten angegeben');
    }
    if (!cv.personalData.summary) {
      warnings.push('Profil-Zusammenfassung fehlt');
    }

    setExportReadiness({
      isReady: issues.length === 0,
      issues,
      warnings
    });
  };

  // Calculate completeness percentage
  const getCompletenessPercentage = () => {
    if (!cvData) return 0;
    
    const checks = [
      !!cvData.personalData.firstName,
      !!cvData.personalData.lastName,
      !!cvData.personalData.email,
      !!cvData.personalData.phone,
      !!cvData.personalData.address,
      !!cvData.personalData.profession,
      !!cvData.personalData.summary,
      cvData.workExperience.length > 0,
      cvData.education.length > 0,
      cvData.skills.length > 0
    ];
    
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  // Handle export to different formats
  const handleExport = async (format: 'pdf' | 'docx' | 'json') => {
    if (!cvData) return;
    
    setIsExporting(true);
    try {
      if (format === 'json') {
        // Export as JSON
        const exportData = {
          cvData,
          styleConfig,
          exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cv-${cvData.personalData.firstName}-${cvData.personalData.lastName}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'docx') {
        // Create a template from current CV data and export as DOCX
        const templateId = await saveTemplate({
          name: `${cvData.personalData.firstName} ${cvData.personalData.lastName} CV`,
          category: 'export',
          tags: ['export', 'cv'],
          isFavorite: false,
          layout: [],
          style: styleConfig,
          sections: [
            {
              id: 'personal',
              type: 'personal',
              title: 'Persönliche Daten',
              content: `${cvData.personalData.firstName} ${cvData.personalData.lastName}\n${cvData.personalData.email}\n${cvData.personalData.phone}`,
              order: 1,
              required: true
            }
          ]
        });
        
        // Export the template as DOCX
        // This would use the exportTemplateToDocx function from services
        console.log('DOCX export would be implemented here with template ID:', templateId);
      } else if (format === 'pdf') {
        console.log('PDF export would be implemented here');
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!cvData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Exportieren</h2>
          <p className="text-gray-600">
            Laden Sie Ihren fertigen Lebenslauf in verschiedenen Formaten herunter.
          </p>
        </div>
        
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Download className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Kein CV geladen</p>
            <p className="text-sm">
              Gehen Sie zur "Start / CV laden"-Phase, um einen CV zu laden oder zu erstellen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Exportieren</h2>
        <p className="text-gray-600">
          Laden Sie Ihren fertigen Lebenslauf in verschiedenen Formaten herunter.
        </p>
      </div>

      {/* Current CV Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-900">
                  Export: {cvData.personalData.firstName} {cvData.personalData.lastName}
                </h3>
                <p className="text-sm text-green-700">
                  {cvData.personalData.profession || 'Keine Berufsbezeichnung'} • 
                  3 Sektionen • 
                  {getCompletenessPercentage()}% vollständig
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {getCompletenessPercentage()}%
              </div>
              <div className="text-sm text-green-700">Vollständigkeit</div>
            </div>
          </div>
      </div>

      {/* Export Readiness Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Issues */}
        {exportReadiness.issues.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg">
            <div className="p-6 border-b border-red-200">
              <h3 className="text-lg font-semibold flex items-center space-x-2 text-red-900">
                <AlertTriangle className="w-5 h-5" />
                <span>Probleme beheben</span>
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-1">
                {exportReadiness.issues.map((issue, index) => (
                  <li key={index} className="flex items-start space-x-2 text-red-800">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-red-600" />
                    <span className="text-sm">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Warnings */}
        {exportReadiness.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="p-6 border-b border-yellow-200">
              <h3 className="text-lg font-semibold flex items-center space-x-2 text-yellow-900">
                <AlertTriangle className="w-5 h-5" />
                <span>Empfehlungen</span>
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-1">
                {exportReadiness.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-2 text-yellow-800">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-600" />
                    <span className="text-sm">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Ready Status */}
        {exportReadiness.isReady && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 md:col-span-2">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-900">Export bereit!</h3>
                  <p className="text-sm text-green-700">
                    Ihr CV ist vollständig und kann in allen Formaten exportiert werden.
                  </p>
                </div>
                <div className="ml-auto">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
              </div>
          </div>
        )}
      </div>

      {/* Main Export Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - CV Preview */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>Finale CV-Vorschau</span>
            </h3>
            <p className="text-sm text-gray-600">
              So wird Ihr CV in den exportierten Dokumenten aussehen
            </p>
          </div>
          <div className="p-6">
            <div className="max-h-96 overflow-y-auto border rounded-lg bg-white p-4">
              <div className="space-y-4" style={{ 
                fontFamily: styleConfig.font.family,
                fontSize: `${styleConfig.font.size}px`,
                color: styleConfig.font.color
              }}>
                <div>
                  <h1 style={{ color: styleConfig.colors.primary, fontSize: `${styleConfig.font.size + 6}px` }}>
                    {cvData.personalData.firstName} {cvData.personalData.lastName}
                  </h1>
                  <p style={{ color: styleConfig.colors.secondary }}>{cvData.personalData.profession}</p>
                </div>
                
                {cvData.personalData.summary && (
                  <div>
                    <h2 style={{ color: styleConfig.colors.primary }}>Profil</h2>
                    <p>{cvData.personalData.summary}</p>
                  </div>
                )}
                
                {cvData.workExperience.length > 0 && (
                  <div>
                    <h2 style={{ color: styleConfig.colors.primary }}>Berufserfahrung</h2>
                    {cvData.workExperience.map(exp => (
                      <div key={exp.id} className="mb-2">
                        <h3 className="font-medium">{exp.position}</h3>
                        <p className="text-sm opacity-75">{exp.company} • {exp.startDate} - {exp.endDate}</p>
                        <p className="text-sm">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Preview Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sektionen:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vollständigkeit:</span>
                <span className="font-medium">{getCompletenessPercentage()}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Schriftart:</span>
                <span className="font-medium">{styleConfig.font.family}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Primärfarbe:</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: styleConfig.colors.primary }}
                  />
                  <span className="font-mono text-xs">{styleConfig.colors.primary}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Export Options */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Download className="w-5 h-5 text-green-600" />
              <span>Export-Optionen</span>
            </h3>
            <p className="text-sm text-gray-600">
              Wählen Sie Format und Qualitätseinstellungen für Ihren Export
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Export-Formate</h4>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={!exportReadiness.isReady || isExporting}
                  className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-red-600" />
                    <div className="text-left">
                      <div className="font-medium">PDF Export</div>
                      <div className="text-sm text-gray-600">Ideal für Bewerbungen</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
                
                <button
                  onClick={() => handleExport('docx')}
                  disabled={!exportReadiness.isReady || isExporting}
                  className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">DOCX Export</div>
                      <div className="text-sm text-gray-600">Bearbeitbar in Word</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
                
                <button
                  onClick={() => handleExport('json')}
                  disabled={isExporting}
                  className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">JSON Export</div>
                      <div className="text-sm text-gray-600">Vollständige Datenstruktur</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              {isExporting && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Exportiere...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg">
        <div className="p-6 border-b border-blue-200">
          <h3 className="text-lg font-semibold flex items-center space-x-2 text-blue-900">
            <FileText className="w-5 h-5" />
            <span>Export-Zusammenfassung</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CV Statistics */}
            <div>
              <h4 className="font-medium text-blue-900 mb-3">CV-Statistiken</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Berufserfahrung:</span>
                  <span className="font-medium">{cvData.workExperience.length} Positionen</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Ausbildung:</span>
                  <span className="font-medium">{cvData.education.length} Abschlüsse</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Fähigkeiten:</span>
                  <span className="font-medium">{cvData.skills.length} Skills</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Sprachen:</span>
                  <span className="font-medium">{cvData.languages?.length || 0} Sprachen</span>
                </div>
              </div>
            </div>

            {/* Design Statistics */}
            <div>
              <h4 className="font-medium text-blue-900 mb-3">Design-Einstellungen</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Schriftart:</span>
                  <span className="font-medium">{styleConfig.font.family}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Schriftgröße:</span>
                  <span className="font-medium">{styleConfig.font.size}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Zeilenabstand:</span>
                  <span className="font-medium">{styleConfig.spacing?.lineHeight || 1.6}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Ränder:</span>
                  <span className="font-medium">{styleConfig.spacing?.margin || 16}px</span>
                </div>
              </div>
            </div>

            {/* Export Quality */}
            <div>
              <h4 className="font-medium text-blue-900 mb-3">Export-Qualität</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-blue-700">PDF: Print-Ready (300 DPI)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-blue-700">DOCX: Bearbeitbar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-blue-700">JSON: Vollständige Daten</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="text-blue-700">KI-optimiert</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">💡 Export-Tipps</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <h5 className="font-medium mb-2">📄 PDF-Export</h5>
              <ul className="space-y-1 text-xs">
                <li>• Ideal für Bewerbungen</li>
                <li>• Nicht bearbeitbar</li>
                <li>• Universell lesbar</li>
                <li>• Print-optimiert</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">📝 DOCX-Export</h5>
              <ul className="space-y-1 text-xs">
                <li>• Bearbeitbar in Word</li>
                <li>• Weitere Anpassungen möglich</li>
                <li>• Formatierung erhalten</li>
                <li>• Kollaboration möglich</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">💾 JSON-Export</h5>
              <ul className="space-y-1 text-xs">
                <li>• Vollständige Datenstruktur</li>
                <li>• Wiederimport möglich</li>
                <li>• Backup-Zwecke</li>
                <li>• Entwickler-freundlich</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPhase;