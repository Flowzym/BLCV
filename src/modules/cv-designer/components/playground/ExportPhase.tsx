/**
 * Export Phase
 * Allows users to download their finished CV in various formats
 */

import React, { useState, useEffect } from 'react';
import { CVData } from '@/types/cv-designer';
import { StyleConfig } from '@/types/cv-designer';
import { CVPreview } from '@/modules/cv-designer/components/CVPreview';
import { ExportPanel } from '@/modules/cv-designer/components/ExportPanel';
import { useMapping } from '@/modules/cv-designer/hooks/useMapping';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Eye, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

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

  // Mapping hook to convert CV data to sections for preview
  const { mapCVData } = useMapping();
  const [mappedSections, setMappedSections] = useState<any[]>([]);

  // Map CV data when it changes
  useEffect(() => {
    if (cvData) {
      const result = mapCVData(cvData, {
        locale: 'de',
        layoutType: 'classic-one-column'
      });
      setMappedSections(result.sections);
      
      // Check export readiness
      checkExportReadiness(cvData, result.sections);
    } else {
      setMappedSections([]);
      setExportReadiness({ isReady: false, issues: ['Kein CV geladen'], warnings: [] });
    }
  }, [cvData, mapCVData]);

  // Check if CV is ready for export
  const checkExportReadiness = (cv: CVData, sections: any[]) => {
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

    // Sections check
    if (sections.length === 0) {
      issues.push('Keine Sektionen zum Exportieren vorhanden');
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
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
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
                  {mappedSections.length} Sektionen • 
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
        </CardContent>
      </Card>

      {/* Export Readiness Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Issues */}
        {exportReadiness.issues.length > 0 && (
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-900">
                <AlertTriangle className="w-5 h-5" />
                <span>Probleme beheben</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {exportReadiness.issues.map((issue, index) => (
                  <li key={index} className="flex items-start space-x-2 text-red-800">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-red-600" />
                    <span className="text-sm">{issue}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Warnings */}
        {exportReadiness.warnings.length > 0 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-900">
                <AlertTriangle className="w-5 h-5" />
                <span>Empfehlungen</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {exportReadiness.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-2 text-yellow-800">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-600" />
                    <span className="text-sm">{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Ready Status */}
        {exportReadiness.isReady && (
          <Card className="bg-green-50 border-green-200 md:col-span-2">
            <CardContent className="p-4">
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Export Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - CV Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>Finale CV-Vorschau</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              So wird Ihr CV in den exportierten Dokumenten aussehen
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto border rounded-lg bg-white">
              <CVPreview
                sections={mappedSections}
                styleConfig={styleConfig}
                cvData={cvData}
              />
            </div>
            
            {/* Preview Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sektionen:</span>
                <span className="font-medium">{mappedSections.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vollständigkeit:</span>
                <span className="font-medium">{getCompletenessPercentage()}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Schriftart:</span>
                <span className="font-medium">{styleConfig.fontFamily}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Primärfarbe:</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: styleConfig.primaryColor }}
                  />
                  <span className="font-mono text-xs">{styleConfig.primaryColor}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-green-600" />
              <span>Export-Optionen</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Wählen Sie Format und Qualitätseinstellungen für Ihren Export
            </p>
          </CardHeader>
          <CardContent>
            <ExportPanel
              cvData={cvData}
              styleConfig={styleConfig}
            />
          </CardContent>
        </Card>
      </div>

      {/* Export Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <FileText className="w-5 h-5" />
            <span>Export-Zusammenfassung</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  <span className="font-medium">{styleConfig.fontFamily}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Schriftgröße:</span>
                  <span className="font-medium">{styleConfig.fontSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Zeilenabstand:</span>
                  <span className="font-medium">{styleConfig.lineHeight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Ränder:</span>
                  <span className="font-medium">{styleConfig.margin}</span>
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
        </CardContent>
      </Card>

      {/* Export Tips */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm text-gray-900">💡 Export-Tipps</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportPhase;