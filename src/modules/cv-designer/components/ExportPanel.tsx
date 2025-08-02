/**
 * Export Panel Component
 * Unified interface for all export functionality
 */

import React, { useState } from 'react';
import { CVData } from '@/types/cv-designer';
import { StyleConfig } from '@/types/cv-designer';
import { ExportButton } from '@/components/ExportButton';
import { AdvancedExportButton } from '@/components/AdvancedExportButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  FileText, 
  File, 
  Database,
  Settings,
  Zap,
  Eye,
  CheckCircle
} from 'lucide-react';

interface ExportPanelProps {
  cvData?: CVData;
  styleConfig?: StyleConfig;
  className?: string;
}

type ExportMode = 'simple' | 'advanced' | 'batch' | 'preview';

export const ExportPanel: React.FC<ExportPanelProps> = ({
  cvData,
  styleConfig,
  className = ''
}) => {
  const [activeMode, setActiveMode] = useState<ExportMode>('simple');
  const [exportSettings, setExportSettings] = useState({
    quality: 'print' as 'screen' | 'print' | 'high-res',
    includeMetadata: true,
    includeWatermark: false,
    pageNumbers: true,
    customFileName: ''
  });

  const exportModes = [
    {
      id: 'simple' as ExportMode,
      label: 'Quick Export',
      icon: Download,
      description: 'Fast export with default settings'
    },
    {
      id: 'advanced' as ExportMode,
      label: 'Advanced Export',
      icon: Settings,
      description: 'Full control over export options'
    },
    {
      id: 'batch' as ExportMode,
      label: 'Batch Export',
      icon: Database,
      description: 'Export multiple CVs at once'
    },
    {
      id: 'preview' as ExportMode,
      label: 'Export Preview',
      icon: Eye,
      description: 'Preview before exporting'
    }
  ];

  const renderExportContent = () => {
    if (!cvData || !styleConfig) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Download className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Select a CV from Mock Data to enable export options</p>
          </div>
        </div>
      );
    }

    switch (activeMode) {
      case 'simple':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ExportButton
                cvData={cvData}
                designConfig={designConfig}
                format="pdf"
                className="w-full h-24 flex flex-col items-center justify-center"
              >
                <FileText className="w-8 h-8 mb-2" />
                <span>Export PDF</span>
              </ExportButton>
              
              <ExportButton
                cvData={cvData}
                designConfig={designConfig}
                format="docx"
                className="w-full h-24 flex flex-col items-center justify-center"
              >
                <File className="w-8 h-8 mb-2" />
                <span>Export DOCX</span>
              </ExportButton>
              
              <ExportButton
                cvData={cvData}
                designConfig={designConfig}
                showDropdown={true}
                className="w-full h-24 flex flex-col items-center justify-center"
              >
                <Database className="w-8 h-8 mb-2" />
                <span>All Formats</span>
              </ExportButton>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Ready to Export</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Your CV is ready for export in multiple formats with optimized settings.
              </p>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            {/* Export Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quality">Export Quality</Label>
                  <select
                    id="quality"
                    value={exportSettings.quality}
                    onChange={(e) => setExportSettings(prev => ({ 
                      ...prev, 
                      quality: e.target.value as any 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="screen">Screen (72 DPI)</option>
                    <option value="print">Print (300 DPI)</option>
                    <option value="high-res">High-Res (600 DPI)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="fileName">Custom Filename</Label>
                  <Input
                    id="fileName"
                    value={exportSettings.customFileName}
                    onChange={(e) => setExportSettings(prev => ({ 
                      ...prev, 
                      customFileName: e.target.value 
                    }))}
                    placeholder="Leave empty for auto-generated name"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="metadata"
                      checked={exportSettings.includeMetadata}
                      onCheckedChange={(checked) => setExportSettings(prev => ({ 
                        ...prev, 
                        includeMetadata: !!checked 
                      }))}
                    />
                    <Label htmlFor="metadata">Include metadata</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="watermark"
                      checked={exportSettings.includeWatermark}
                      onCheckedChange={(checked) => setExportSettings(prev => ({ 
                        ...prev, 
                        includeWatermark: !!checked 
                      }))}
                    />
                    <Label htmlFor="watermark">Add watermark</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pageNumbers"
                      checked={exportSettings.pageNumbers}
                      onCheckedChange={(checked) => setExportSettings(prev => ({ 
                        ...prev, 
                        pageNumbers: !!checked 
                      }))}
                    />
                    <Label htmlFor="pageNumbers">Page numbers</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Export Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AdvancedExportButton
                cvData={cvData}
                designConfig={designConfig}
                defaultFormat="pdf"
                className="w-full"
              >
                <FileText className="w-5 h-5 mr-2" />
                Advanced PDF
              </AdvancedExportButton>
              
              <AdvancedExportButton
                cvData={cvData}
                designConfig={designConfig}
                defaultFormat="docx"
                className="w-full"
              >
                <File className="w-5 h-5 mr-2" />
                Advanced DOCX
              </AdvancedExportButton>
              
              <AdvancedExportButton
                cvData={cvData}
                designConfig={designConfig}
                defaultFormat="json"
                className="w-full"
              >
                <Database className="w-5 h-5 mr-2" />
                JSON Export
              </AdvancedExportButton>
            </div>
          </div>
        );

      case 'batch':
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-yellow-800">
                <Database className="w-5 h-5" />
                <span className="font-medium">Batch Export</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Batch export functionality requires multiple CVs. Currently showing single CV export.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ExportButton
                cvData={cvData}
                designConfig={designConfig}
                format="pdf"
                className="w-full"
              >
                Batch Export PDF
              </ExportButton>
              
              <ExportButton
                cvData={cvData}
                designConfig={designConfig}
                format="docx"
                className="w-full"
              >
                Batch Export DOCX
              </ExportButton>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 min-h-64">
              <div className="text-center text-gray-500">
                <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Export Preview</h3>
                <p>Preview how your CV will look in different export formats</p>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <div>PDF Preview</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <File className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div>DOCX Preview</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <Database className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div>JSON Preview</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`export-panel space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Download className="w-6 h-6 mr-2 text-green-600" />
            Export & Download
          </h2>
          <p className="text-gray-600 mt-1">
            Export your CV in multiple formats with advanced options
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-green-600" />
          <span className="text-sm text-gray-600">
            Professional quality exports
          </span>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {exportModes.map(mode => {
          const Icon = mode.icon;
          return (
            <Button
              key={mode.id}
             styleConfig={styleConfig}
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => setActiveMode(mode.id)}
            >
              <Icon className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">{mode.label}</div>
                <div className="text-xs opacity-75">{mode.description}</div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Export Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {React.createElement(exportModes.find(m => m.id === activeMode)?.icon || Download, { 
              className: "w-5 h-5" 
            })}
            <span>{exportModes.find(m => m.id === activeMode)?.label}</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            {exportModes.find(m => m.id === activeMode)?.description}
          </p>
        </CardHeader>
        <CardContent>
          {renderExportContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportPanel;