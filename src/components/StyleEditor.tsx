/**
 * Style Editor Component
 * Provides comprehensive styling controls for CV design
 */

import React, { useState } from "react";
import { StyleConfig } from "@/modules/cv-designer/types/styles";
import { StyleTypographyPanel } from "@/modules/cv-designer/components/StyleTypographyPanel";

interface StyleEditorProps {
  config: StyleConfig;
  onChange: (config: StyleConfig) => void;
  sections?: string[];
  showPresets?: boolean;
  showLivePreview?: boolean;
  compact?: boolean;
}

export const StyleEditor: React.FC<StyleEditorProps> = ({
  config,
  onChange,
  sections = ["colors", "typography", "layout", "spacing"],
  showPresets = true,
  compact = false,
}) => {
  const [activeSection, setActiveSection] = useState(sections[0]);

  const handleConfigChange = (updates: Partial<StyleConfig>) => {
    const newConfig = { ...config, ...updates };
    onChange(newConfig);
  };

  const colorPresets = [
    { name: "Professional Blue", primary: "#1e40af", accent: "#3b82f6" },
    { name: "Corporate Gray", primary: "#374151", accent: "#6b7280" },
    { name: "Modern Green", primary: "#059669", accent: "#10b981" },
    { name: "Creative Purple", primary: "#7c3aed", accent: "#a855f7" },
    { name: "Classic Black", primary: "#000000", accent: "#404040" },
  ];

  const renderColorsSection = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Farben</h3>

      {/* Color Presets */}
      {showPresets && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Farbvorlagen
          </label>
          <div className="grid grid-cols-1 gap-2">
            {colorPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() =>
                  handleConfigChange({
                    colors: {
                      ...config.colors,
                      primary: preset.primary,
                      secondary: preset.accent,
                    },
                  })
                }
                className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="flex space-x-1">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <span className="text-sm">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primärfarbe
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={config.colors.primary}
              onChange={(e) =>
                handleConfigChange({
                  colors: { ...config.colors, primary: e.target.value },
                })
              }
              className="w-8 h-8 border rounded cursor-pointer"
            />
            <input
              type="text"
              value={config.colors.primary}
              onChange={(e) =>
                handleConfigChange({
                  colors: { ...config.colors, primary: e.target.value },
                })
              }
              className="flex-1 px-2 py-1 text-xs font-mono border rounded"
              placeholder="#1e40af"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Akzentfarbe
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={config.colors.secondary || "#3b82f6"}
              onChange={(e) =>
                handleConfigChange({
                  colors: { ...config.colors, secondary: e.target.value },
                })
              }
              className="w-8 h-8 border rounded cursor-pointer"
            />
            <input
              type="text"
              value={config.colors.secondary || "#3b82f6"}
              onChange={(e) =>
                handleConfigChange({
                  colors: { ...config.colors, secondary: e.target.value },
                })
              }
              className="flex-1 px-2 py-1 text-xs font-mono border rounded"
              placeholder="#3b82f6"
            />
          </div>
        </div>
      </div>
    </div>
  );

  /** ⬇️ Neu: Typografie kommt aus eigenem Panel */
  const renderTypographySection = () => (
    <div className="space-y-4">
      <StyleTypographyPanel />
    </div>
  );

  const renderLayoutSection = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Layout</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seitenränder
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[16, 24, 32].map((margin) => (
            <button
              key={margin}
              onClick={() =>
                handleConfigChange({
                  spacing: { ...config.spacing, margin },
                })
              }
              className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                config.spacing?.margin === margin
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {margin === 16 ? "Kompakt" : margin === 24 ? "Normal" : "Weit"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSpacingSection = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Abstände</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          Abstände werden automatisch basierend auf den Layout-Einstellungen
          berechnet.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Sektionsabstand:</span>
            <span className="font-medium">
              {config.spacing?.margin
                ? `${config.spacing.margin}px`
                : "Standard (24px)"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Padding:</span>
            <span className="font-medium">
              {config.spacing?.padding
                ? `${config.spacing.padding}px`
                : "Standard (12px)"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Zeilenabstand:</span>
            <span className="font-medium">
              {config.font.lineHeight || 1.6}
            </span>
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
  );
};
