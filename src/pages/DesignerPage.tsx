import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Palette, Eye, Brain, Sparkles, Layout, Type, Paintbrush, Layers, Image as ImageIcon, FileText, Wand2 } from 'lucide-react';
import { CVPreview } from '../modules/cv-designer/components/CVPreview';
import { StyleEditor } from '../components/StyleEditor';
import { StyleConfig, LayoutElement } from '../types/cv-designer';
import { TemplateMatchingAssistant } from '../components/ai/TemplateMatchingAssistant';
import { LayoutDesigner } from '../modules/cv-designer/components/LayoutDesigner';
import { MediaManager } from '../components/MediaManager';
import { useLebenslauf } from '../components/LebenslaufContext';

interface DesignerPageProps {
  styleConfig: StyleConfig;
  layoutElements: LayoutElement[];
  setLayoutElements: (elements: LayoutElement[]) => void;
}

export default function DesignerPage({ styleConfig, setStyleConfig, layoutElements, setLayoutElements }: DesignerPageProps) {
  const navigate = useNavigate();
  const [activeDesignerTab, setActiveDesignerTab] = useState('layout-style');

  // Access LebenslaufContext for CV data and profile image
  const { personalData, updatePersonalData } = useLebenslauf();

  // Access LebenslaufContext for CV data and profile image
  const { personalData, updatePersonalData } = useLebenslauf();

  // Designer tabs configuration
  const designerTabs = [
    { 
      id: 'layout-style', 
      label: 'Layout', 
      icon: Layout 
    },
    { 
      id: 'typography', 
      label: 'Typografie', 
      icon: Type 
    },
    { 
      id: 'colors', 
      label: 'Farben', 
      icon: Paintbrush 
    },
    { 
      id: 'elements', 
      label: 'Elemente', 
      icon: Layers 
    },
    {
      id: 'design-templates',
      label: 'Designvorlagen',
      icon: FileText
    },
    {
      id: 'layout-editor',
      label: 'Layout Editor',
      icon: Wand2
    },
    {
      id: 'photo',
      label: 'Foto',
      icon: ImageIcon
    },
    {
      id: 'design-templates',
      label: 'Designvorlagen',
      icon: FileText
    },
    {
      id: 'layout-editor',
      label: 'Layout Editor',
      icon: Wand2
    },
    {
      id: 'photo',
      label: 'Foto',
      icon: ImageIcon
    }
  ];

  // Function to render content for the left column based on active tab
  const renderDesignToolContent = () => {
    switch (activeDesignerTab) {
      case 'layout-style':
        return (
          <StyleEditor 
            config={styleConfig} 
            onChange={setStyleConfig} 
            sections={['layout', 'spacing']} 
            showPresets={true} 
            compact={true} 
          />
        );
      case 'typography':
        return (
          <StyleEditor 
            config={styleConfig} 
            onChange={setStyleConfig} 
            sections={['typography']} 
            showPresets={true} 
            compact={true} 
          />
        );
      case 'colors':
        return (
          <StyleEditor 
            config={styleConfig} 
            onChange={setStyleConfig} 
            sections={['colors']} 
            showPresets={true} 
            compact={true} 
          />
        );
      case 'elements':
        return (
          <div className="p-4 text-gray-600">
            <h3 className="font-medium text-gray-900 mb-2">Elemente-Einstellungen</h3>
            <p className="text-sm">Hier könnten zukünftig Einstellungen für einzelne CV-Elemente (z.B. Icons, Linien, Abstände zwischen Elementen) vorgenommen werden.</p>
            <p className="mt-2 text-xs text-gray-500">Diese Funktion ist noch in Entwicklung.</p>
          </div>
        );
      case 'design-templates':
        // Create mock CV data from LebenslaufContext
        const mockCVData = {
          personalData: {
            firstName: personalData?.vorname || '',
            lastName: personalData?.nachname || '',
            email: personalData?.email || '',
            phone: personalData?.telefon || '',
            address: personalData?.adresse || '',
            profession: personalData?.profession || '',
            summary: personalData?.summary || '',
            profileImage: personalData?.profileImage
          },
          workExperience: [],
          education: [],
          skills: [],
          languages: []
        };
        return (
          <TemplateMatchingAssistant 
            cvData={mockCVData}
            onTemplateSelect={(template) => {
              console.log('Template selected:', template);
              // Handle template selection - could update styleConfig
            }} 
          />
        );
      case 'layout-editor':
        return (
          <div className="h-96 overflow-hidden">
            <LayoutDesigner 
              initialLayout={layoutElements}
              onLayoutChange={setLayoutElements}
              onSave={(layout, style) => {
                setLayoutElements(layout);
                setStyleConfig(style);
              }}
            />
          </div>
        );
      case 'photo':
        const handleImageSelect = (imageSrc: string) => {
          updatePersonalData({ ...personalData, profileImage: imageSrc });
        };
        return (
          <MediaManager 
            onImageSelect={handleImageSelect} 
            currentImage={personalData?.profileImage} 
            aspectRatio={1}
            shape="circle"
          />
        );
      default:
        return (
          <StyleEditor 
            config={styleConfig} 
            onChange={setStyleConfig} 
            sections={['colors', 'typography', 'layout', 'spacing']} 
            showPresets={true} 
            compact={true} 
          />
        );
    }
  };
  // Function to render content for the left column based on active tab
  const renderDesignToolContent = () => {
    switch (activeDesignerTab) {
      case 'layout-style':
        return (
          <StyleEditor 
            config={styleConfig} 
            onChange={setStyleConfig} 
            sections={['layout', 'spacing']} 
            showPresets={true} 
            compact={true} 
          />
        );
      case 'typography':
        return (
          <StyleEditor 
            config={styleConfig} 
            onChange={setStyleConfig} 
            sections={['typography']} 
            showPresets={true} 
            compact={true} 
          />
        );
      case 'colors':
        return (
          <StyleEditor 
            config={styleConfig} 
            onChange={setStyleConfig} 
            sections={['colors']} 
            showPresets={true} 
            compact={true} 
          />
        );
      case 'elements':
        return (
          <div className="p-4 text-gray-600">
            <h3 className="font-medium text-gray-900 mb-2">Elemente-Einstellungen</h3>
            <p className="text-sm">Hier könnten zukünftig Einstellungen für einzelne CV-Elemente (z.B. Icons, Linien, Abstände zwischen Elementen) vorgenommen werden.</p>
            <p className="mt-2 text-xs text-gray-500">Diese Funktion ist noch in Entwicklung.</p>
          </div>
        );
      case 'design-templates':
        // Create mock CV data from LebenslaufContext
        const mockCVData = {
          personalData: {
            firstName: personalData?.vorname || '',
            lastName: personalData?.nachname || '',
            email: personalData?.email || '',
            phone: personalData?.telefon || '',
            address: personalData?.adresse || '',
            profession: personalData?.profession || '',
            summary: personalData?.summary || '',
            profileImage: personalData?.profileImage
          },
          workExperience: [],
          education: [],
          skills: [],
          languages: []
        };
        return (
          <TemplateMatchingAssistant 
            cvData={mockCVData}
            onTemplateSelect={(template) => {
              console.log('Template selected:', template);
              // Handle template selection - could update styleConfig
            }} 
          />
        );
      case 'layout-editor':
        return (
          <div className="h-96 overflow-hidden">
            <LayoutDesigner 
              initialLayout={layoutElements}
              onLayoutChange={setLayoutElements}
              onSave={(layout, style) => {
                setLayoutElements(layout);
                setStyleConfig(style);
              }}
            />
          </div>
        );
      case 'photo':
        const handleImageSelect = (imageSrc: string) => {
          updatePersonalData({ ...personalData, profileImage: imageSrc });
        };
        return (
          <MediaManager 
            onImageSelect={handleImageSelect} 
            currentImage={personalData?.profileImage} 
            aspectRatio={1}
            shape="circle"
          />
        );
      default:
        return (
          <StyleEditor 
            config={styleConfig} 
            onChange={setStyleConfig} 
            sections={['colors', 'typography', 'layout', 'spacing']} 
            showPresets={true} 
            compact={true} 
          />
        );
    }
  };
  return (
    <div className="w-full flex flex-col gap-6 relative overflow-hidden py-8">
          {/* Header with tab navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 p-4 border-b border-gray-200">
              <Palette className="h-6 w-6 mr-2" style={{ color: '#F29400' }} stroke="#F29400" fill="none" />
              <h2 className="text-lg font-semibold text-gray-900">Lebenslauf Designer</h2>
            </div>

            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-4">
                {designerTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDesignerTab(tab.id)}
                      className={`py-3 px-1 border-b-2 font-medium text-sm ${
                        activeDesignerTab === tab.id
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        {tab.label}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content grid with design tools, preview, and AI help */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr_1fr] gap-6 relative overflow-hidden">
            {/* Left Column: Design Tools */}
            <div className="min-w-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
                  <Palette className="h-6 w-6" style={{ color: '#F29400' }} />
                  <h2 className="text-lg font-semibold text-gray-900">Design-Werkzeuge</h2>
                </div>
                
                {renderDesignToolContent()}
                  compact={true}
                />
              </div>
            </div>

            {/* Middle Column: Live Design Preview */}
            <div className="min-w-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
                  <Eye className="h-6 w-6" style={{ color: '#F29400' }} />
                  <h2 className="text-lg font-semibold text-gray-900">Live-Vorschau</h2>
                </div>
                
                {/* Use CVPreview component here */}
                  <CVPreview styleConfig={styleConfig} />
                </div>
              </div>
            </div>

            {/* Right Column: AI Assistant for Design */}
            <div className="min-w-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
                  <Brain className="h-6 w-6" style={{ color: '#F29400' }} />
                  <h2 className="text-lg font-semibold text-gray-900">Design-KI</h2>
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-3 bg-purple-50">
                    <h3 className="font-medium text-purple-800 mb-2">Layout-Optimierung</h3>
                    <p className="text-sm text-purple-600">
                      KI-gestützte Vorschläge für optimale Layout-Strukturen basierend auf Ihren Daten.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-blue-50">
                    <h3 className="font-medium text-blue-800 mb-2">Design-Analyse</h3>
                    <p className="text-sm text-blue-600">
                      Automatische Analyse und Verbesserungsvorschläge für Ihr Lebenslauf-Design.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-green-50">
                    <h3 className="font-medium text-green-800 mb-2">Branchenspezifische Anpassungen</h3>
                    <p className="text-sm text-green-600">
                      Design-Empfehlungen basierend auf Ihrer Zielbranche und Position.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Weitere geplante Funktionen:</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        <span className="text-gray-700">Farb-Harmonien</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        <span className="text-gray-700">Typografie-Matching</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        <span className="text-gray-700">Responsive Anpassungen</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        <span className="text-gray-700">ATS-Optimierung</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </div>
  );
}