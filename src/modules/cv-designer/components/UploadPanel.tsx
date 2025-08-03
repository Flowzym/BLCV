// 📄 src/modules/cv-designer/components/UploadPanel.tsx

import React, { useState } from "react";
import { ReverseUploadBasic } from "./ReverseUploadBasic";
import { ReverseUploadWithGPT } from "./ReverseUploadWithGPT";
import { ReverseUploadAssistant } from "./ReverseUploadAssistant";

type UploadPanelProps = {
  onLayoutImport: (layout: any[]) => void;
  onCVDataImport: (cvData: any) => void;
};

type TabId = "basic" | "gpt" | "assistant";

export default function UploadPanel({ onLayoutImport, onCVDataImport }: UploadPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("basic");

  const tabs: { id: TabId; label: string }[] = [
    { id: "basic", label: "📄 Rohdaten Upload" },
    { id: "gpt", label: "🤖 Upload mit KI" },
    { id: "assistant", label: "🎨 Design-Übernahme" },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Tabs Header */}
      <div className="flex space-x-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        {activeTab === "basic" && (
          <ReverseUploadBasic
            onLayoutImport={onLayoutImport}
            onCVDataImport={onCVDataImport}
          />
        )}
        {activeTab === "gpt" && (
          <ReverseUploadWithGPT
            onLayoutImport={onLayoutImport}
            onCVDataImport={onCVDataImport}
          />
        )}
        {activeTab === "assistant" && (
          <ReverseUploadAssistant
            onLayoutImport={onLayoutImport}
            onCVDataImport={onCVDataImport}
          />
        )}
      </div>
    </div>
  );
}
