/**
 * Design & Layout Editor Phase
 * Combines visual and structural CV editing with live preview
 */

import React, { useState } from 'react';
import { LayoutElement } from '../../types/section';
import { StyleConfig } from '../../types/styles';
import { 
  Palette, 
  Layout, 
  Eye,
  Wand2,
  Grid,
  FileText,
  Sparkles
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
  const [activeTab, setActiveTab] = useState<DesignTab>('style');

  // Handle style config changes
  const handleStyleChange = (newConfig: StyleConfig) => {
    setStyleConfig(newConfig);
  };

  // Handle layout changes
  const handleLayoutChange = (newLayout: LayoutElement[]) => {
    setLayoutElements(newLayout);
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    console.log('Template selected:', templateId);
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
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Style-Einstellungen</h4>
            
            {/* Font Settings */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schriftart</label>
                <select
                  value={styleConfig.font.family}
                  onChange={(e) => handleStyleChange({
                    ...styleConfig,
                    font: { ...styleConfig.font, family: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schriftgröße</label>
                <input
                  type="number"
                  min="10"
                  max="24"
                  value={styleConfig.font.size}
                  onChange={(e) => handleStyleChange({
                    ...styleConfig,
                    font: { ...styleConfig.font, size: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Color Settings */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primärfarbe</label>
                <input
                  type="color"
                  value={styleConfig.colors.primary}
                  onChange={(e) => handleStyleChange({
                    ...styleConfig,
                    colors: { ...styleConfig.colors, primary: e.target.value }
                  })}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sekundärfarbe</label>
                <input
                  type="color"
                  value={styleConfig.colors.secondary || '#3b82f6'}
                  onChange={(e) => handleStyleChange({
                    ...styleConfig,
                    colors: { ...styleConfig.colors, secondary: e.target.value }
                  })}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        );

      case 'layout':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Layout-Editor</h4>
            <div className="h-96 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Grid className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Layout-Editor</p>
                <p className="text-sm">
                  Drag & Drop Layout-Editor wird in einer späteren Phase implementiert.
                </p>
              </div>
            </div>
          </div>
        );

      case 'templates':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Template-Auswahl</h4>
            <div className="text-center py-8 text-gray-500">
              <Layout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Template-Matching</p>
              <p className="text-sm">
                KI-gestützte Template-Vorschläge werden in einer späteren Phase implementiert.
              </p>
            </div>
          </div>
        );

      case 'ai-layout':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">KI-Layout-Generator</h4>
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Smart Layout Generator</p>
              <p className="text-sm">
                Automatische Layout-Generierung wird in einer späteren Phase implementiert.
              </p>
            </div>
          </div>
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
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
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
                3 Sektionen • 
                {layoutElements.length} Layout-Elemente
              </p>
            </div>
          </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - CV Preview */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>Live CV-Vorschau</span>
            </h3>
            <p className="text-sm text-gray-600">
              Sehen Sie Ihre Änderungen in Echtzeit
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
                
                {cvData.skills.length > 0 && (
                  <div>
                    <h2 style={{ color: styleConfig.colors.primary }}>Fähigkeiten</h2>
                    <div className="flex flex-wrap gap-2">
                      {cvData.skills.map(skill => (
                        <span 
                          key={skill.id} 
                          className="px-2 py-1 rounded text-sm"
                          style={{ 
                            backgroundColor: styleConfig.colors.secondary + '20',
                            color: styleConfig.colors.secondary
                          }}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
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
                <span className="text-gray-600">Layout-Elemente:</span>
                <span className="font-medium">{layoutElements.length}</span>
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

        {/* Right Column - Design Tools */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              <span>Design-Tools</span>
            </h3>
            <p className="text-sm text-gray-600">
              Passen Sie Aussehen und Struktur an
            </p>
          </div>
          <div className="p-6">
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
          </div>
        </div>
      </div>

      {/* Design Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg">
        <div className="p-6 border-b border-blue-200">
          <h3 className="text-lg font-semibold flex items-center space-x-2 text-blue-900">
            <Palette className="w-5 h-5" />
            <span>Design-Zusammenfassung</span>
          </h3>
        </div>
        <div className="p-6">
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
                      style={{ backgroundColor: styleConfig.colors.primary }}
                    />
                    <span className="font-mono">{styleConfig.colors.primary}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Akzentfarbe:</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: styleConfig.colors.secondary }}
                    />
                    <span className="font-mono">{styleConfig.colors.secondary}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Schriftart:</span>
                  <span className="font-medium">{styleConfig.font.family}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Schriftgröße:</span>
                  <span className="font-medium">{styleConfig.font.size}px</span>
                </div>
              </div>
            </div>

            {/* Layout Settings */}
            <div>
              <h4 className="font-medium text-blue-900 mb-3">Layout-Einstellungen</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Zeilenabstand:</span>
                  <span className="font-medium">{styleConfig.spacing?.lineHeight || 1.6}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Ränder:</span>
                  <span className="font-medium">{styleConfig.spacing?.margin || 16}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Layout-Elemente:</span>
                  <span className="font-medium">{layoutElements.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Sektionen:</span>
                  <span className="font-medium">3</span>
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
        </div>
      </div>
    </div>
  );
};

export default DesignLayoutEditor;