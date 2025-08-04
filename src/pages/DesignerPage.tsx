// 📄 src/pages/DesignerPage.tsx
// Überarbeitet – jetzt mit StyleConfigProvider um StyleEditor & Co.
// UploadPanel jetzt mit internen Tabs (Basic, GPT, Assistant)

import React, { useState, useEffect } from "react";
import {
  Palette,
  Eye,
  Layout,
  Type,
  Paintbrush,
  Layers,
  FileText,
  Wand2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

import CVPreview from "../modules/cv-designer/components/CVPreview";
import { StyleEditor } from "../components/StyleEditor";
import { StyleConfig, LayoutElement } from "../types/cv-designer";
import { LayoutDesigner } from "../modules/cv-designer/components/LayoutDesigner";
import { MediaManager } from "../components/MediaManager";
import { TemplateSelector } from "../modules/cv-designer/components/TemplateSelector";
import { useLebenslauf } from "../components/LebenslaufContext";
import UploadPanel from "../modules/cv-designer/components/UploadPanel";
import { mapBetterLetterToDesignerWithTemplate } from "../modules/cv-designer/services/mapBetterLetterWithTemplate";
import { useTemplateStorage } from "../modules/cv-designer/hooks/useTemplateStorage";
import { ExportButtons } from "../modules/cv-designer/components/ExportButtons";
import { StyleConfigProvider } from "../modules/cv-designer/context/StyleConfigContext"; // ✅ hinzugefügt

function normalizeCVData(cvData: any) {
  if (!cvData?.personalData) return cvData;
  const pd = cvData.personalData;
  return {
    ...cvData,
    personalData: {
      vorname: pd.firstName || pd.vorname || "",
      nachname: pd.lastName || pd.nachname || "",
      email: pd.email || "",
      telefon: pd.phone || "",
      adresse: pd.address || "",
      profession: pd.profession || "",
      summary: pd.summary || "",
      profileImage: pd.profileImage || "",
    },
  };
}

type TabId =
  | "layout-style"
  | "typography"
  | "colors"
  | "elements"
  | "design-templates"
  | "layout-editor"
  | "upload"
  | "photo";

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
  const [activeDesignerTab, setActiveDesignerTab] = useState<TabId>("layout-style");
  const { personalData, updatePersonalData } = useLebenslauf();
  const { saveTemplate, templates } = useTemplateStorage();

  // Default-Template laden, falls keine gespeichert
  useEffect(() => {
    if ((!templates || templates.length === 0) && layoutElements.length === 0) {
      const mapped =
        mapBetterLetterToDesignerWithTemplate({ personalData: {} }, "classic") ?? [];

      setLayoutElements(mapped);
      saveTemplate({
        id: "default-classic",
        name: "Classic Default",
        layout: mapped,
        style: styleConfig,
      });
    }
  }, [templates, layoutElements, setLayoutElements, saveTemplate, styleConfig]);

  const handleTemplateSave = () => {
    saveTemplate({
      id: Date.now().toString(),
      name: `${personalData?.vorname ?? "Template"} ${new Date().toLocaleDateString()}`,
      layout: layoutElements,
      style: styleConfig,
    });
  };

  const designerTabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "layout-style", label: "Layout", icon: Layout },
    { id: "typography", label: "Typografie", icon: Type },
    { id: "colors", label: "Farben", icon: Paintbrush },
    { id: "elements", label: "Elemente", icon: Layers },
    { id: "design-templates", label: "Designvorlagen", icon: FileText },
    { id: "layout-editor", label: "Layout Editor", icon: Wand2 },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "photo", label: "Foto", icon: ImageIcon },
  ];

  // Upload callbacks
  const handleLayoutImport = (layout: LayoutElement[]) => setLayoutElements(layout);
  const handleCVDataImport = (cvData: any) => {
    const normalized = normalizeCVData(cvData);
    if (normalized?.personalData) updatePersonalData(normalized.personalData);
    const mapped = mapBetterLetterToDesignerWithTemplate(normalized, "classic") ?? [];
    setLayoutElements(mapped);
  };

  // Tab content
  const renderDesignToolContent = () => {
    switch (activeDesignerTab) {
      case "layout-style":
      case "typography":
      case "colors":
        return (
          <StyleEditor
            config={styleConfig}
            onChange={setStyleConfig}
            sections={
              activeDesignerTab === "layout-style"
                ? ["layout", "spacing"]
                : activeDesignerTab === "typography"
                ? ["typography"]
                : ["colors"]
            }
            compact
            showPresets
          />
        );
      case "layout-editor":
        return (
          <LayoutDesigner initialLayout={layoutElements} onLayoutChange={setLayoutElements} />
        );
      case "upload":
        return (
          <UploadPanel
            onLayoutImport={handleLayoutImport}
            onCVDataImport={handleCVDataImport}
          />
        );
      case "photo":
        return (
          <MediaManager
            currentImage={personalData?.profileImage}
            onImageSelect={(img) =>
              updatePersonalData({ ...personalData, profileImage: img })
            }
            aspectRatio={1}
            shape="circle"
          />
        );
      case "design-templates":
        return (
          <TemplateSelector
            onSelect={(style, layout) => {
              setStyleConfig(style);
              setLayoutElements(layout);
            }}
            allowSave
            onSaveTemplate={handleTemplateSave}
          />
        );
      default:
        return null;
    }
  };

  return (
    <StyleConfigProvider> {/* ✅ Wrapper hinzugefügt */}
      <div className="w-full flex flex-col gap-6 py-8">
        {/* DEBUG: Log DesignerPage render */}
        {console.log('DesignerPage: Rendering with styleConfig:', styleConfig)}
        {console.log('DesignerPage: layoutElements:', layoutElements)}
        
        {/* Tabs header */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 p-4 border-b border-gray-200">
            <Palette className="w-6 h-6 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Lebenslauf Designer</h2>
          </div>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-6 px-4 overflow-x-auto">
              {designerTabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveDesignerTab(id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeDesignerTab === id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Icon className="w-4 h-4" /> {label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-6">
          {/* Left column (tools) */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            {renderDesignToolContent()}
          </div>
            {console.log('DesignerPage: layoutElements being passed to CVPreview:', layoutElements)}
            {console.log('DesignerPage: About to render CVPreview with templateName:', 'classic')}

          {/* Right column (preview)*/}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-orange-500" /> Live‑Vorschau
              </h3>
              <ExportButtons layout={layoutElements} style={styleConfig} />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              {/* DEBUG: Log styleConfig but no longer pass it down manually */}
              {console.log('DesignerPage: styleConfig exists but CVPreview will use useStyleConfig hook:', styleConfig)}
              <CVPreview
                layoutElements={layoutElements}
                templateName="classic"
              />
            </div>
          </div>
        </div>
      </div>
    </StyleConfigProvider>
  );
}