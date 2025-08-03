import React, { useState } from "react";
import DesignerPage from "@/pages/DesignerPage";
import { StyleConfig, LayoutElement } from "@/types/cv-designer";

interface HomePageProps {
  styleConfig: StyleConfig;
  setStyleConfig: (config: StyleConfig) => void;
  layoutElements: LayoutElement[];
  setLayoutElements: (elements: LayoutElement[]) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  styleConfig,
  setStyleConfig,
  layoutElements,
  setLayoutElements,
}) => {
  const [activeTab, setActiveTab] = useState<"designer" | "other">("designer");

  return (
    <div className="flex flex-col h-full">
      {/* Tab-Steuerung */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("designer")}
          className={`px-4 py-2 ${
            activeTab === "designer"
              ? "border-b-2 border-orange-500 text-orange-600"
              : "text-gray-500"
          }`}
        >
          CV Designer
        </button>
        <button
          onClick={() => setActiveTab("other")}
          className={`px-4 py-2 ${
            activeTab === "other"
              ? "border-b-2 border-orange-500 text-orange-600"
              : "text-gray-500"
          }`}
        >
          Andere Inhalte
        </button>
      </div>

      {/* Inhalt je Tab */}
      <div className="flex-1 overflow-auto">
        {activeTab === "designer" && (
          <DesignerPage
            styleConfig={styleConfig}
            setStyleConfig={setStyleConfig}
            layoutElements={layoutElements}
            setLayoutElements={setLayoutElements}
          />
        )}

        {activeTab === "other" && (
          <div className="p-6 text-gray-600">
            <h2 className="text-lg font-semibold">Weitere Inhalte</h2>
            <p className="mt-2 text-sm">
              Hier kannst du zusätzliche Module oder Infos einfügen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
