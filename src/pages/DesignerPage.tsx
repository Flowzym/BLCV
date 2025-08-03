import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Palette,
  Eye,
  Brain,
  Sparkles,
  Layout,
  Type,
  Paintbrush,
  Layers,
  Image as ImageIcon,
  FileText,
  Wand2,
} from "lucide-react";
import CVPreview from "../modules/cv-designer/components/CVPreview";
import { StyleEditor } from "../components/StyleEditor";
import { StyleConfig, LayoutElement } from "../types/cv-designer";
import { TemplateMatchingAssistant } from "../components/ai/TemplateMatchingAssistant";
import { LayoutDesigner } from "../modules/cv-designer/components/LayoutDesigner";
import { MediaManager } from "../components/MediaManager";
import { TemplateSelector } from "../modules/cv-designer/components/TemplateSelector";
import { useLebenslauf } from "../components/LebenslaufContext";
import UploadPanel from "../modules/cv-designer/components/UploadPanel";

interface DesignerPageProps {
  styleConfig: StyleConfig;
  setStyleConfig: (config: StyleConfig) => void;
  layoutElements: LayoutElement[];
  setLayoutElements: (elements: LayoutElement[]) => void;
}

export default function DesignerPage({
  styleConfig,
  setStyleConfig,
  layoutElements,
  setLayoutElements,
}: DesignerPageProps) {
  const navigate = useNavigate();
  const [activeDesignerTab, setActiveDesignerTab] = useState("layout-style");

  // Daten aus Context
  const { personalData, updatePersonalData } = useLebenslauf();

  // Tabs
  const designerTabs = [
    { id: "layout-style", label: "Layout", icon: Layout },
    { id: "typography", label: "Typografie", icon: Type },
    { id: "colors", label: "Farben", icon: Paintbrush },
    { id: "elements", label: "Elemente", icon: Layers },
    { id: "design-templates", label: "Designvorlagen", icon: FileText },
    { id: "layout-editor", label: "Layout Editor", icon: Wand2 },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "photo", label: "Foto", icon: ImageIcon },
  ];

  // Inhalte je Tab
  const renderDesignToolContent = () => {
    switch (activeDesignerTab) {
      case "layout-style":
        return (
          <StyleEditor
            config={styleConfig}
            onChange={setStyleConfig}
            sections={["layout", "spacing"]}
            showPresets={true}
            compact={true}
          />
        );
      case "typography":
        return (
          <StyleEditor
            config={styleConfig}
            onChange={setStyleConfig}
            sections={["typography"]}
            showPresets={true}
            compact={true}
          />
        );
      case "colors":
        return (
          <StyleEditor
            config={styleConfig}
            onChange={setStyleConfig}
            sections={["colors"]}
            showPresets={true}
            compact={true}
          />
        );
      case "elements":
        return (
          <div className="p-4 text-gray-600">
            <h3 className="font-medium text-gray-900 mb-2">
              Elemente-Einstellungen
            </h3>
            <p className="text-sm">
              Hier könnten zukünftig Einstellungen für einzelne CV-Elemente
              (z.B. Icons, Linien, Abstände) vorgenommen werden.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Diese Funktion ist noch in Entwicklung.
            </p>
          </div>
        );
      case "design-templates":
        // Mock-Daten für KI-Template-Assistent
        const mockCVData = {
          personalData: {
            firstName: personalData?.vorname || "Max",
            lastName: personalData?.nachname || "Mustermann",
            email: personalData?.email || "max.mustermann@email.de",
            phone: personalData?.telefon || "+49 123 456789",
            address: personalData?.adresse || "Berlin, Deutschland",
            profession: "Software Engineer",
            summary:
              "Erfahrener Software Engineer mit Fokus auf moderne Webtechnologien.",
            profileImage: personalData?.profileImage,
          },
          workExperience: [],
          education: [],
          skills: [],
          languages: [],
        };

        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-gray-900">Fixe Vorlagen</h3>
              <p className="text-sm text-gray-600 mb-4">
                Wählen Sie aus vorgefertigten Templates mit unterschiedlichen Layouts
              </p>
              <TemplateSelector
                onSelect={(style, layout) => {
                  setStyleConfig(style);
                  setLayoutElements(layout);
                }}
                compact={true}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2 text-gray-900">
                KI Design-Assistent
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Lassen Sie die KI das beste Template für Ihren Lebenslauf empfehlen
              </p>
              <TemplateMatchingAssistant
                cvData={mockCVData}
                onTemplateSelect={(template) => {
                  console.log("KI Template selected:", template);
                }}
              />
            </div>
          </div>
        );
      case "layout-editor":
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
      case "photo":
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
      case "upload":
        return (
          <UploadPanel
            onLayoutImport={(layout) => {
              console.log('Layout imported:', layout);
              setLayoutElements(layout);
            }}
            onCVDataImport={(cvData) => {
              console.log('CV Data imported:', cvData);
              // Could update personalData here if needed
            }}
          />
        );
      default:
        return (
          <StyleEditor
            config={styleConfig}
            onChange={setStyleConfig}
            sections={["colors", "typography", "layout", "spacing"]}
            showPresets={true}
            compact={true}
          />
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 relative overflow-hidden py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 p-4 border-b border-gray-200">
          <Palette
            className="h-6 w-6 mr-2"
            style={{ color: "#F29400" }}
            stroke="#F29400"
            fill="none"
          />
          <h2 className="text-lg font-semibold text-gray-900">
            Lebenslauf Designer
          </h2>
        </div>

        {/* Tabs */}
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
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr_1fr] gap-6 relative overflow-hidden">
        {/* Left */}
        <div className="min-w-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
              <Palette className="h-6 w-6" style={{ color: "#F29400" }} />
              <h2 className="text-lg font-semibold text-gray-900">
                Design-Werkzeuge
              </h2>
            </div>
            {renderDesignToolContent()}
          </div>
        </div>

        {/* Middle */}
        <div className="min-w-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
              <Eye className="h-6 w-6" style={{ color: "#F29400" }} />
              <h2 className="text-lg font-semibold text-gray-900">
                Live-Vorschau
              </h2>
            </div>
            <CVPreview
              styleConfig={styleConfig}
              layoutElements={layoutElements}
              templateName="classic"
            />
          </div>
        </div>

        {/* Right */}
        <div className="min-w-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
              <Brain className="h-6 w-6" style={{ color: "#F29400" }} />
              <h2 className="text-lg font-semibold text-gray-900">Design-KI</h2>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
            {/* Platzhalter für KI Features */}
            <div className="space-y-4">
              <div className="border rounded-lg p-3 bg-purple-50">
                <h3 className="font-medium text-purple-800 mb-2">
                  Layout-Optimierung
                </h3>
                <p className="text-sm text-purple-600">
                  KI-gestützte Vorschläge für optimale Layout-Strukturen.
                </p>
              </div>
              <div className="border rounded-lg p-3 bg-blue-50">
                <h3 className="font-medium text-blue-800 mb-2">
                  Design-Analyse
                </h3>
                <p className="text-sm text-blue-600">
                  Automatische Analyse und Verbesserungsvorschläge.
                </p>
              </div>
              <div className="border rounded-lg p-3 bg-green-50">
                <h3 className="font-medium text-green-800 mb-2">
                  Branchenspezifische Anpassungen
                </h3>
                <p className="text-sm text-green-600">
                  Empfehlungen basierend auf Branche & Position.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}