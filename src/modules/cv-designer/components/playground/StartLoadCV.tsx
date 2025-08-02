/**
 * Start / Load CV Phase
 * Entry point for CV workflow - allows users to initialize cvData
 */

import React, { useState } from 'react';
import { CVData } from '@/types/cv-designer';
import { StyleConfig } from '@/types/cv-designer';
import { LayoutElement } from '@/modules/cv-designer/types/section';
import { MockDataSelector } from '@/modules/cv-designer/components/MockDataSelector';
import { ReverseUploadPanel } from '@/modules/cv-designer/components/ReverseUploadPanel';
import { useTemplateStorage } from '@/modules/cv-designer/hooks/useTemplateStorage';
import { useMockData } from '@/modules/cv-designer/hooks/useMockData';
import { getMockCVById } from '@/mocks/cv';
import { getLayoutById } from '@/mocks/layouts';
import { getStyleById } from '@/mocks/styles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Upload, 
  Database, 
  FileText,
  Folder,
  Star,
  Trash2,
  Download
} from 'lucide-react';

interface StartLoadCVProps {
  cvData: CVData | null;
  setCVData: (data: CVData | null) => void;
  styleConfig: StyleConfig;
  setStyleConfig: (config: StyleConfig) => void;
  layoutElements: LayoutElement[];
  setLayoutElements: (elements: LayoutElement[]) => void;
}

// Default empty CV data
const DEFAULT_CV_DATA: CVData = {
  personalData: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    profession: '',
    summary: ''
  },
  workExperience: [],
  education: [],
  skills: []
};

export const StartLoadCV: React.FC<StartLoadCVProps> = ({
  cvData,
  setCVData,
  styleConfig,
  setStyleConfig,
  layoutElements,
  setLayoutElements
}) => {
  const [activeTab, setActiveTab] = useState<'mock' | 'upload' | 'templates' | 'empty'>('mock');
  
  // Mock Data Hook
  const { 
    cvs: mockCVs, 
    selectedCV, 
    selectCV,
    selectedLayout,
    selectedStyle 
  } = useMockData();

  // Template Storage Hook
  const {
    templates,
    loadTemplate,
    deleteTemplate,
    getStats
  } = useTemplateStorage();

  // Handle Mock CV Selection
  const handleMockCVSelect = (cvId: string) => {
    selectCV(cvId);
    
    // Get the newly selected CV data directly
    const newlySelectedCV = getMockCVById(cvId);
    
    if (newlySelectedCV) {
      // Update central state with selected CV data
      setCVData(newlySelectedCV.cvData);
      
      // Update design config from associated style
      const associatedStyle = getStyleById(newlySelectedCV.metadata.styleId);
      if (associatedStyle) {
        setStyleConfig(associatedStyle.styleConfig);
      }
      
      // Update layout elements from associated layout
      const associatedLayout = getLayoutById(newlySelectedCV.metadata.layoutId);
      if (associatedLayout) {
        setLayoutElements(associatedLayout.layoutElements);
      }
    } else {
      console.error('CV not found:', cvId);
    }
  };

  // Handle File Import
  const handleFileImport = (importedLayout: LayoutElement[]) => {
    setLayoutElements(importedLayout);
    
    // Try to extract CV data from imported layout if possible
    // This is a simplified extraction - in a real app this would be more sophisticated
    const extractedCVData = extractCVDataFromLayout(importedLayout);
    if (extractedCVData) {
      setCVData(extractedCVData);
    }
  };

  // Handle Template Creation from Import
  const handleTemplateCreation = (template: any) => {
    console.log('Template created from import:', template);
    // Template is automatically saved by ReverseUploadPanel
  };

  // Handle Empty CV Creation
  const handleCreateEmptyCV = () => {
    setCVData(DEFAULT_CV_DATA);
    setLayoutElements([]);
    setStyleConfig({
      primaryColor: '#1e40af',
      accentColor: '#3b82f6',
      fontFamily: 'Inter',
      fontSize: 'medium',
      lineHeight: 1.6,
      margin: 'normal',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderRadius: '8px',
      sectionSpacing: 24,
      snapSize: 20,
      widthPercent: 100
    });
  };

  // Handle Template Loading
  const handleTemplateLoad = (templateId: string) => {
    const template = loadTemplate(templateId);
    if (template) {
      setLayoutElements(template.layout);
      setStyleConfig(template.style);
      
      // If template contains CV data, use it
      if (template.sections && template.sections.length > 0) {
        // Convert template sections to basic CV data
        const cvDataFromTemplate = convertTemplateToCVData(template);
        setCVData(cvDataFromTemplate);
      }
    }
  };

  // Helper function to extract CV data from layout elements
  const extractCVDataFromLayout = (layout: LayoutElement[]): CVData | null => {
    // This is a simplified extraction - in a real implementation this would be more sophisticated
    const personalDataElement = layout.find(el => el.type === 'profil' || el.type === 'summary');
    
    if (personalDataElement && personalDataElement.content) {
      return {
        personalData: {
          firstName: 'Imported',
          lastName: 'User',
          email: 'imported@example.com',
          phone: '+49 123 456789',
          address: 'Imported Address',
          profession: personalDataElement.title || 'Imported Profession',
          summary: personalDataElement.content
        },
        workExperience: [],
        education: [],
        skills: []
      };
    }
    
    return null;
  };

  // Helper function to convert template to CV data
  const convertTemplateToCVData = (template: any): CVData => {
    // This is a simplified conversion - in a real implementation this would be more sophisticated
    return {
      personalData: {
        firstName: 'Template',
        lastName: 'User',
        email: 'template@example.com',
        phone: '+49 123 456789',
        address: 'Template Address',
        profession: template.name || 'Template Profession',
        summary: template.description || 'CV created from template'
      },
      workExperience: [],
      education: [],
      skills: []
    };
  };

  const tabs = [
    { id: 'mock', label: 'Mock Data', icon: Database, description: 'Vorgefertigte Test-CVs' },
    { id: 'upload', label: 'Import', icon: Upload, description: 'Aus Datei importieren' },
    { id: 'templates', label: 'Templates', icon: FileText, description: 'Gespeicherte Vorlagen' },
    { id: 'empty', label: 'Neu erstellen', icon: Plus, description: 'Leeren CV beginnen' }
  ];

  const templateStats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Start / CV laden</h2>
        <p className="text-gray-600">
          Beginnen Sie mit einem neuen CV oder laden Sie einen bestehenden Lebenslauf.
        </p>
      </div>

      {/* Current State Display */}
      {cvData && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-900">
                  CV geladen: {cvData.personalData.firstName} {cvData.personalData.lastName}
                </h3>
                <p className="text-sm text-green-700">
                  {cvData.personalData.profession || 'Keine Berufsbezeichnung'} • 
                  {cvData.workExperience.length} Berufserfahrungen • 
                  {cvData.skills.length} Fähigkeiten
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'mock' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span>Mock CV Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MockDataSelector
                onCVSelect={handleMockCVSelect}
                selectedCVId={selectedCV?.id}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-purple-600" />
                <span>Import from File</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReverseUploadPanel
                onImport={handleFileImport}
                onCreateTemplate={handleTemplateCreation}
                defaultStyle={designConfig}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'templates' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span>Saved Templates</span>
              </CardTitle>
              {templateStats.totalTemplates > 0 && (
                <p className="text-sm text-gray-600">
                  {templateStats.totalTemplates} Templates • {templateStats.favoriteTemplates} Favoriten
                </p>
              )}
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Keine Templates gespeichert</p>
                  <p className="text-sm">
                    Erstellen Sie Templates in der Design-Phase oder importieren Sie welche über den Upload-Tab.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 flex items-center">
                            {template.name}
                            {template.isFavorite && (
                              <Star className="w-4 h-4 text-yellow-500 ml-2" />
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {template.description || 'Keine Beschreibung'}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Template löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{template.tags.length - 3}
                            </span>
                          )}
                        </div>
                        
                        <Button
                          onClick={() => handleTemplateLoad(template.id)}
                          size="sm"
                          className="ml-3"
                        >
                          Laden
                        </Button>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500">
                        Erstellt: {new Date(template.createdAt).toLocaleDateString()} • 
                        {template.layout.length} Elemente • 
                        {template.metadata.usageCount} mal verwendet
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'empty' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-orange-600" />
                <span>Neuen CV erstellen</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-12 h-12 text-orange-600" />
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Neuen Lebenslauf erstellen
                </h3>
                <p className="text-gray-600 mb-6">
                  Beginnen Sie mit einem leeren CV und fügen Sie Ihre Informationen hinzu.
                </p>
                
                <Button
                  onClick={handleCreateEmptyCV}
                  size="lg"
                  className="px-8 py-3"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Leeren CV erstellen
                </Button>
                
                <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-2">Was passiert als nächstes?</h4>
                  <ul className="text-sm text-orange-800 space-y-1 text-left">
                    <li>• Sie können Ihre persönlichen Daten eingeben</li>
                    <li>• Berufserfahrung und Ausbildung hinzufügen</li>
                    <li>• Design und Layout anpassen</li>
                    <li>• KI-Optimierungen nutzen</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-blue-900">Mock Data</h4>
            <p className="text-sm text-blue-700">{mockCVs.length} Test-CVs verfügbar</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-purple-900">Import</h4>
            <p className="text-sm text-purple-700">DOCX, PDF, JSON unterstützt</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-green-900">Templates</h4>
            <p className="text-sm text-green-700">{templateStats.totalTemplates} gespeicherte Vorlagen</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StartLoadCV;