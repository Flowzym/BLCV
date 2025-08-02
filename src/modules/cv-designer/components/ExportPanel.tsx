/**
 * Export Panel Component
 * Provides export options and controls for CV documents
 */

import React, { useState } from 'react';
import { CVData } from '@/types/cv-designer';
import { StyleConfig } from '@/types/cv-designer';

interface ExportPanelProps {
  cvData: CVData;
  styleConfig: StyleConfig;
}

type ExportFormat = 'pdf' | 'docx' | 'json' | 'html';

interface ExportOptions {
  format: ExportFormat;
  quality: 'draft' | 'standard' | 'high';
  includeImages: boolean;
  includeColors: boolean;
  pageSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  cvData,
  styleConfig
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    quality: 'standard',
    includeImages: true,
    includeColors: true,
    pageSize: 'a4',
    orientation: 'portrait'
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportFormats = [
    {
      id: 'pdf' as ExportFormat,
      name: 'PDF',
      description: 'Ideal für Bewerbungen',
      icon: '📄',
      features: ['Nicht bearbeitbar', 'Universell lesbar', 'Print-optimiert']
    },
    {
      id: 'docx' as ExportFormat,
      name: 'Word (DOCX)',
      description: 'Bearbeitbar in Microsoft Word',
      icon: '📝',
      features: ['Bearbeitbar', 'Formatierung erhalten', 'Kollaboration möglich']
    },
    {
      id: 'json' as ExportFormat,
      name: 'JSON',
      description: 'Vollständige Datenstruktur',
      icon: '💾',
      features: ['Wiederimport möglich', 'Backup-Zwecke', 'Entwickler-freundlich']
    },
    {
      id: 'html' as ExportFormat,
      name: 'HTML',
      description: 'Web-optimiert',
      icon: '🌐',
      features: ['Online teilbar', 'Responsive', 'Interaktiv']
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Generate export based on format
      switch (exportOptions.format) {
        case 'pdf':
          await exportToPDF();
          break;
        case 'docx':
          await exportToDOCX();
          break;
        case 'json':
          await exportToJSON();
          break;
        case 'html':
          await exportToHTML();
          break;
      }

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportToPDF = async () => {
    // Mock PDF export
    const filename = `${cvData.personalData.firstName}_${cvData.personalData.lastName}_CV.pdf`;
    console.log(`Exporting to PDF: ${filename}`);
    
    // In a real implementation, this would use a PDF library
    alert(`PDF-Export simuliert: ${filename}`);
  };

  const exportToDOCX = async () => {
    // Mock DOCX export
    const filename = `${cvData.personalData.firstName}_${cvData.personalData.lastName}_CV.docx`;
    console.log(`Exporting to DOCX: ${filename}`);
    
    // In a real implementation, this would use the DOCX service
    alert(`DOCX-Export simuliert: ${filename}`);
  };

  const exportToJSON = async () => {
    const exportData = {
      cvData,
      styleConfig,
      exportOptions,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cvData.personalData.firstName}_${cvData.personalData.lastName}_CV.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const exportToHTML = async () => {
    // Mock HTML export
    const filename = `${cvData.personalData.firstName}_${cvData.personalData.lastName}_CV.html`;
    console.log(`Exporting to HTML: ${filename}`);
    
    // In a real implementation, this would generate HTML
    alert(`HTML-Export simuliert: ${filename}`);
  };

  const updateExportOptions = (updates: Partial<ExportOptions>) => {
    setExportOptions(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Export-Format wählen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exportFormats.map(format => (
            <button
              key={format.id}
              onClick={() => updateExportOptions({ format: format.id })}
              className={`p-4 border rounded-lg text-left transition-colors ${
                exportOptions.format === format.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{format.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{format.name}</div>
                  <div className="text-sm text-gray-600">{format.description}</div>
                </div>
              </div>
              <ul className="text-xs text-gray-500 space-y-1">
                {format.features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Export-Einstellungen</h3>
        
        {/* Quality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qualität
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'draft', label: 'Entwurf' },
              { value: 'standard', label: 'Standard' },
              { value: 'high', label: 'Hoch' }
            ].map(quality => (
              <button
                key={quality.value}
                onClick={() => updateExportOptions({ quality: quality.value as any })}
                className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                  exportOptions.quality === quality.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {quality.label}
              </button>
            ))}
          </div>
        </div>

        {/* Page Settings */}
        {(exportOptions.format === 'pdf' || exportOptions.format === 'html') && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seitengröße
              </label>
              <select
                value={exportOptions.pageSize}
                onChange={(e) => updateExportOptions({ pageSize: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ausrichtung
              </label>
              <select
                value={exportOptions.orientation}
                onChange={(e) => updateExportOptions({ orientation: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="portrait">Hochformat</option>
                <option value="landscape">Querformat</option>
              </select>
            </div>
          </div>
        )}

        {/* Include Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="include-images"
              checked={exportOptions.includeImages}
              onChange={(e) => updateExportOptions({ includeImages: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="include-images" className="text-sm text-gray-700">
              Bilder einschließen
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="include-colors"
              checked={exportOptions.includeColors}
              onChange={(e) => updateExportOptions({ includeColors: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="include-colors" className="text-sm text-gray-700">
              Farben beibehalten
            </label>
          </div>
        </div>
      </div>

      {/* Export Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Export-Vorschau</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Format:</span>
            <span className="font-medium">{exportOptions.format.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Qualität:</span>
            <span className="font-medium capitalize">{exportOptions.quality}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Seitengröße:</span>
            <span className="font-medium">{exportOptions.pageSize.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Geschätzte Größe:</span>
            <span className="font-medium">
              {exportOptions.format === 'pdf' ? '~500 KB' :
               exportOptions.format === 'docx' ? '~300 KB' :
               exportOptions.format === 'json' ? '~50 KB' : '~200 KB'}
            </span>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div>
        {isExporting ? (
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-600">
              Exportiere... {exportProgress}%
            </p>
          </div>
        ) : (
          <button
            onClick={handleExport}
            className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Als {exportOptions.format.toUpperCase()} exportieren
          </button>
        )}
      </div>

      {/* Export Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Export-Tipp</h4>
        <p className="text-sm text-blue-800">
          {exportOptions.format === 'pdf' && 'PDF-Dateien sind ideal für Bewerbungen, da sie auf allen Geräten gleich aussehen.'}
          {exportOptions.format === 'docx' && 'DOCX-Dateien können in Microsoft Word weiter bearbeitet werden.'}
          {exportOptions.format === 'json' && 'JSON-Dateien enthalten alle Daten und können später wieder importiert werden.'}
          {exportOptions.format === 'html' && 'HTML-Dateien können online geteilt und in jedem Browser angezeigt werden.'}
        </p>
      </div>
    </div>
  );
};