// 📄 src/components/StyleEditor.tsx

import React, { useState } from "react";
import { StyleTypographyPanel } from "@/modules/cv-designer/components/StyleTypographyPanel";
import { useStyleConfig } from "@/modules/cv-designer/context/StyleConfigContext";
import { TypographyProvider } from "@/modules/cv-designer/context/TypographyContext";
import { StyleConfig } from "@/types/cv-designer";

interface StyleEditorProps {
  sections?: string[];
  showPresets?: boolean;
  compact?: boolean;
}

export const StyleEditor: React.FC<StyleEditorProps> = ({
  sections = ["colors", "typography", "layout", "spacing"],
  showPresets = true,
  compact = false,
}) => {
  const [activeSection, setActiveSection] = useState(sections[0]);

  // ⚡ Context
  const { styleConfig, updateStyleConfig } = useStyleConfig();

  const handleConfigChange = (updates: Partial<StyleConfig>) => {
    console.log("StyleEditor: handleConfigChange →", updates);
    updateStyleConfig(updates);
  };

  const colorPresets = [
    { name: "Professional Blue", primary: "#1e40af", accent: "#3b82f6", background: "#ffffff", text: "#333333" },
    { name: "Corporate Gray", primary: "#374151", accent: "#6b7280", background: "#ffffff", text: "#1f2937" },
    { name: "Modern Green", primary: "#059669", accent: "#10b981", background: "#ffffff", text: "#333333" },
    { name: "Creative Purple", primary: "#7c3aed", accent: "#a855f7", background: "#ffffff", text: "#333333" },
    { name: "Classic Black", primary: "#000000", accent: "#404040", background: "#ffffff", text: "#1f2937" },
  ];

  /** ---------- Farben ---------- */
  const renderColorsSection = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Farben</h3>

      {showPresets && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Farbvorlagen</label>
          <div className="grid grid-cols-1 gap-2">
            {colorPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => {
                  console.log("StyleEditor: Preset clicked →", preset);
                  // Use complete config object for deep merge
                  handleConfigChange({
                    primaryColor: preset.primary,
                    accentColor: preset.accent,
                    backgroundColor: preset.background,
                    textColor: preset.text,
                    colors: {
                      primary: preset.primary,
                      accent: preset.accent,
                      background: preset.background,
                      text: preset.text,
                    },
                  });
                }}
                className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="flex space-x-1">
                  <div className="w-4 h-4 rounded border" style={{ backgroundColor: preset.primary }} />
                  <div className="w-4 h-4 rounded border" style={{ backgroundColor: preset.accent }} />
                </div>
                <span className="text-sm">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Colors */}
      <div className="grid grid-cols-2 gap-4">
        {["primary", "accent", "background", "text"].map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {key === "primary" && "Primärfarbe"}
              {key === "accent" && "Akzentfarbe"}
              {key === "background" && "Hintergrundfarbe"}
              {key === "text" && "Textfarbe"}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={styleConfig.colors?.[key] || "#000000"}
                onChange={(e) =>
                  handleConfigChange({
                    colors: { ...(styleConfig.colors || {}), [key]: e.target.value },
                  })
                }
                className="w-8 h-8 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={styleConfig.colors?.[key] || "#000000"}
                onChange={(e) =>
                  handleConfigChange({
                    colors: { ...(styleConfig.colors || {}), [key]: e.target.value },
                  })
                }
                className="flex-1 px-2 py-1 text-xs font-mono border rounded"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /** ---------- Typografie ---------- */
  const renderTypographySection = () => (
    <div className="space-y-4">
      <StyleTypographyPanel />
    </div>
  );

  /** ---------- Layout ---------- */
  const renderLayoutSection = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Layout</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Seitenränder</label>
        <div className="grid grid-cols-3 gap-2">
          {["compact", "normal", "wide"].map((margin) => (
            <button
              key={margin}
              onClick={() => handleConfigChange({ margin: margin as any })}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors capitalize ${
                styleConfig.margin === margin
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {margin === "compact" ? "Kompakt" : margin === "normal" ? "Normal" : "Weit"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /** ---------- Abstände ---------- */
  const renderSpacingSection = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Abstände</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          Abstände werden automatisch basierend auf den Layout-Einstellungen berechnet.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Sektionsabstand:</span>
            <span className="font-medium">
              {styleConfig.margin === "compact"
                ? "16px"
                : styleConfig.margin === "normal"
                ? "24px"
                : "32px"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Elementabstand:</span>
            <span className="font-medium">
              {styleConfig.margin === "compact"
                ? "8px"
                : styleConfig.margin === "normal"
                ? "12px"
                : "16px"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Zeilenabstand:</span>
            <span className="font-medium">{styleConfig.font?.lineHeight || 1.6}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-4">
        {sections.includes("colors") && renderColorsSection()}
        {sections.includes("typography") && renderTypographySection()}
        {sections.includes("layout") && renderLayoutSection()}
        {sections.includes("spacing") && renderSpacingSection()}
      </div>
    );
  }

  return (
    <TypographyProvider>
      <div className="space-y-4">
        {/* Section Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-0">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeSection === section
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 border-transparent"
                }`}
              >
                {section === "colors"
                  ? "Farben"
                  : section === "typography"
                  ? "Typografie"
                  : section === "layout"
                  ? "Layout"
                  : "Abstände"}
              </button>
            ))}
          </nav>
        </div>

        {/* Section Content */}
        <div>
          {activeSection === "colors" && renderColorsSection()}
          {activeSection === "typography" && renderTypographySection()}
          {activeSection === "layout" && renderLayoutSection()}
          {activeSection === "spacing" && renderSpacingSection()}
        </div>
      </div>
    </TypographyProvider>
  );
};