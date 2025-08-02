/**
 * Design & Layout Editor Phase
 * Combines visual and structural CV editing with live preview
 */

import React, { useState, useEffect } from 'react';
import { CVData } from '@/types/cv-designer';
import { StyleConfig } from '@/types/cv-designer';
import { LayoutElement } from '@/modules/cv-designer/types/section';
import { CVPreview } from '../CVPreview';
import { StyleEditor } from '../../../components/StyleEditor';
import { LayoutDesigner } from '@/modules/cv-designer/components/LayoutDesigner';
import { TemplateMatchingAssistant } from '@/components/ai/TemplateMatchingAssistant';
import { SmartLayoutGenerator } from '@/components/ai/SmartLayoutGenerator';
import { useMapping } from '@/modules/cv-designer/hooks/useMapping';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Palette, 
  Layout, 
  Eye,
  Wand2,
  Grid,
  FileText,
  Sparkles
} from 'lucide-react';

interface DesignLayoutEditorProps {
  cvData: CVData | null;
  styleConfig: StyleConfig;
  setStyleConfig: (config: StyleConfig) => void;
  layoutElements: LayoutElement[];
  setLayoutElements: (elements: LayoutElement[]) => void;
  setCVData?: (data: CVData) => void;
}

type DesignTab = 'style' | 'layout' | 'templates' | 'ai-layout';

export const DesignLayoutEditor: React.FC<DesignLayoutEditorProps> = ({
  cvData,
  styleConfig,
  setStyleConfig,
  layoutElements,
  setLayoutElements,
  setCVData
}) => {
  // Debug log for received styleConfig prop
  console.log('DesignLayoutEditor received styleConfig prop:', styleConfig);
  
  const [activeTab, setActiveTab] = useState<DesignTab>('style');
  
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
    } else {
      setMappedSections([]);
    }
  }, [cvData, mapCVData]);

  // Handle style config changes
  const handleStyleChange = (newConfig: StyleConfig) => {
    // Use functional update to ensure we always have the latest state
    setStyleConfig(newConfig);
  };

  // Handle layout changes
  const handleLayoutChange = (newLayout: LayoutElement[]) => {
    setLayoutElements(newLayout);
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    console.log('Template selected:', templateId);
    // Template selection logic would be implemented here
    // For now, we'll just log it
  };

  // Handle AI layout generation
  const handleLayoutGenerated = (layout: LayoutElement[]) => {
    setLayoutElements(layout);
  };

  const designTabs = [
    {
      id: 'style' as DesignTab,
      label: 'Style Editor',
      icon: Palette,
      description: 'Farben, Schriftarten und Abstände anpassen'
    },
    {
      id: 'layout' as DesignTab,
      label: 'Layout Editor',
      icon: Grid,
      description: 'Drag & Drop Strukturbearbeitung'
    },
    {
      id: 'templates' as DesignTab,
      label: 'Template Selector',
      icon: Layout,
      description: 'Vorgefertigte Templates auswählen'
    },
    {
      id: 'ai-layout' as DesignTab,
      label: 'KI-Assistent',
      icon: Sparkles,
      description: 'KI-gestützte Template-Vorschläge und Layout-Generierung'
    }
  ];

  const renderTabContent = () => {
    if (!cvData) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Laden Sie zuerst einen CV in Phase 1</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'style':
        return (
          <StyleEditor
            config={styleConfig}
            onChange={(newConfig) => {
              console.log('StyleEditor onChange:', newConfig);
              setStyleConfig(newConfig);
            }}
            sections={['colors', 'typography', 'layout', 'spacing']}
            showPresets={true}
            showLivePreview={false}
            compact={false}
          />
        );

      case 'layout':
        return (
          <div className="h-96 border rounded-lg overflow-hidden">
            <LayoutDesigner
              initialLayout={layoutElements}
              onLayoutChange={handleLayoutChange}
              onSave={(layout, style) => {
                setLayoutElements(layout);
                setStyleConfig(style);
              }}
            />
          </div>
        );

      case 'templates':
        return (
          <TemplateMatchingAssistant
            cvData={cvData}
            onTemplateSelect={handleTemplateSelect}
          />
        );

      case 'ai-layout':
        return (
          <SmartLayoutGenerator
            cvData={cvData}
            onLayoutGenerated={handleLayoutGenerated}
          />
        );

      default:
        return null;
    }
  };

  if (!cvData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Design & Layout</h2>
          <p className="text-gray-600">
            Gestalten Sie das visuelle Erscheinungsbild und die Struktur Ihres Lebenslaufs.
          </p>
        </div>
        
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Design & Layout</h2>
        <p className="text-gray-600">
          Gestalten Sie das visuelle Erscheinungsbild und die Struktur Ihres Lebenslaufs.
        </p>
      </div>

      {/* Current CV Info */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Palette className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-900">
                Design: {cvData.personalData.firstName} {cvData.personalData.lastName}
              </h3>
              <p className="text-sm text-purple-700">
                {cvData.personalData.profession || 'Keine Berufsbezeichnung'} • 
                {mappedSections.length} Sektionen • 
                {layoutElements.length} Layout-Elemente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - CV Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>Live CV-Vorschau</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Sehen Sie Ihre Änderungen in Echtzeit
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
                <span className="text-gray-600">Layout-Elemente:</span>
                <span className="font-medium">{layoutElements.length}</span>
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

        {/* Right Column - Design Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              <span>Design-Tools</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Passen Sie Aussehen und Struktur an
            </p>
          </CardHeader>
          <CardContent>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-0">
                {designTabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'text-blue-600 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700 border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="max-h-96 overflow-y-auto">
              {renderTabContent()}
            </div>

            {/* Tab Description */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {designTabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Design Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Palette className="w-5 h-5" />
            <span>Design-Zusammenfassung</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Style Settings */}
            <div>
              <h4 className="font-medium text-blue-900 mb-3">Style-Einstellungen</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Primärfarbe:</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: styleConfig.primaryColor }}
                    />
                    <span className="font-mono">{styleConfig.primaryColor}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Akzentfarbe:</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: styleConfig.accentColor }}
                    />
                    <span className="font-mono">{styleConfig.accentColor}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Schriftart:</span>
                  <span className="font-medium">{styleConfig.fontFamily}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Schriftgröße:</span>
                  <span className="font-medium">{styleConfig.fontSize}</span>
                </div>
              </div>
            </div>

            {/* Layout Settings */}
            <div>
              <h4 className="font-medium text-blue-900 mb-3">Layout-Einstellungen</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Zeilenabstand:</span>
                  <span className="font-medium">{styleConfig.lineHeight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Ränder:</span>
                  <span className="font-medium">{styleConfig.margin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Layout-Elemente:</span>
                  <span className="font-medium">{layoutElements.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Sektionen:</span>
                  <span className="font-medium">{mappedSections.length}</span>
                </div>
              </div>
            </div>

            {/* Content Overview */}
            <div>
              <h4 className="font-medium text-blue-900 mb-3">Inhalts-Übersicht</h4>
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
                  <span className="text-blue-700">Profilbild:</span>
                  <span className="font-medium">
                    {cvData.personalData.profileImage ? 'Vorhanden' : 'Nicht vorhanden'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignLayoutEditor;