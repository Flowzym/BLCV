import React from "react";
import { useStyleConfig } from "../context/StyleConfigContext";
import { FontConfig } from "../types/styles";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getEffectiveFontConfig,
  getLocalFontConfig,
  isFontPropertyExplicit,
  resetFontConfig,
  defaultFont,
} from "../utils/fontUtils";

// Only content sections - globals are handled separately
const contentSections: Record<string, string[]> = {
  profil: ["header", "name", "adresse", "mail", "telefon"],
  erfahrung: ["header", "position", "firma", "zeitraum", "taetigkeiten"],
  ausbildung: ["header", "abschluss", "institution", "zeitraum"],
  skills: ["header", "skillname", "level"],
};

const FONT_FAMILIES = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Verdana", label: "Verdana" },
  { value: "Tahoma", label: "Tahoma" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Segoe UI", label: "Segoe UI" },
  { value: "system-ui", label: "System UI" },
  { value: "Courier Prime", label: "Courier Prime" },
];

export const StyleTypographyPanel: React.FC = () => {
  const { styleConfig, updateStyleConfig } = useStyleConfig();

  /**
   * Update font for specific section/field
   */
  const updateFont = (
    sectionId: string,
    type: "header" | "content" | "field",
    key: string | null,
    updates: Partial<FontConfig>
  ) => {
    console.log(`updateFont: ${sectionId}.${type}.${key || 'null'}`, updates);

    // Global sections (allHeaders, name)
    if (sectionId === "allHeaders") {
      updateStyleConfig({
        sections: {
          ...styleConfig.sections,
          allHeaders: {
            header: {
              font: {
                ...styleConfig.sections?.allHeaders?.header?.font,
                ...updates,
              },
            },
          },
        },
      });
      return;
    }

    if (sectionId === "name") {
      updateStyleConfig({
        sections: {
          ...styleConfig.sections,
          name: {
            font: {
              ...styleConfig.sections?.name?.font,
              ...updates,
            },
          },
        },
      });
      return;
    }

    // Regular sections
    const currentSection = styleConfig.sections?.[sectionId] || {};
    
    if (type === "header") {
      updateStyleConfig({
        sections: {
          ...styleConfig.sections,
          [sectionId]: {
            ...currentSection,
            header: {
              font: {
                ...currentSection.header?.font,
                ...updates,
              },
            },
          },
        },
      });
    } else if (type === "content") {
      updateStyleConfig({
        sections: {
          ...styleConfig.sections,
          [sectionId]: {
            ...currentSection,
            font: {
              ...currentSection.font,
              ...updates,
            },
          },
        },
      });
    } else if (key) {
      updateStyleConfig({
        sections: {
          ...styleConfig.sections,
          [sectionId]: {
            ...currentSection,
            fields: {
              ...currentSection.fields,
              [key]: {
                font: {
                  ...currentSection.fields?.[key]?.font,
                  ...updates,
                },
              },
            },
          },
        },
      });
    }
  };

  /**
   * Reset font to enable inheritance
   */
  const resetFont = (
    sectionId: string,
    type: "header" | "content" | "field",
    key: string | null
  ) => {
    console.log(`resetFont: ${sectionId}.${type}.${key || 'null'}`);
    const resetConfig = resetFontConfig(sectionId, key, type);
    updateFont(sectionId, type, key, resetConfig);
  };

  /**
   * Font editor component
   */
  const renderFontEditor = (
    sectionId: string,
    type: "header" | "content" | "field",
    key: string | null,
    title: string
  ) => {
    // Get effective font (what's actually displayed)
    const effectiveFont = getEffectiveFontConfig(sectionId, key, type, styleConfig);
    
    // Get local font (what's explicitly set)
    const localFont = getLocalFontConfig(sectionId, key, type, styleConfig);
    
    // Check which properties are explicitly set
    const isExplicitFamily = isFontPropertyExplicit(sectionId, key, type, 'family', styleConfig);
    const isExplicitSize = isFontPropertyExplicit(sectionId, key, type, 'size', styleConfig);
    const isExplicitWeight = isFontPropertyExplicit(sectionId, key, type, 'weight', styleConfig);
    const isExplicitStyle = isFontPropertyExplicit(sectionId, key, type, 'style', styleConfig);
    const isExplicitColor = isFontPropertyExplicit(sectionId, key, type, 'color', styleConfig);

    return (
      <div key={`${sectionId}-${type}-${key}`} className="space-y-3 border p-3 rounded-md mb-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
          <div className="flex items-center space-x-2">
            {/* Inheritance indicators */}
            {!isExplicitFamily && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Font: inherited
              </span>
            )}
            {!isExplicitSize && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Size: inherited
              </span>
            )}
            {!isExplicitColor && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Color: inherited
              </span>
            )}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <Label>Schriftart</Label>
          <select
            value={effectiveFont.family}
            onChange={(e) => updateFont(sectionId, type, key, { family: e.target.value })}
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isExplicitFamily ? 'bg-yellow-50 border-yellow-300' : 'bg-white'
            }`}
          >
            {FONT_FAMILIES.map((fontFamily) => (
              <option key={fontFamily.value} value={fontFamily.value}>
                {fontFamily.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-2">
          <Label>Größe</Label>
          <Input
            type="number"
            value={effectiveFont.size}
            onChange={(e) =>
              updateFont(sectionId, type, key, {
                size: parseInt(e.target.value, 10) || defaultFont.size,
              })
            }
            className={`w-20 ${
              isExplicitSize ? 'bg-yellow-50 border-yellow-300' : 'bg-white'
            }`}
            min={8}
            max={72}
          />
          <span className="text-xs text-gray-500">px</span>
        </div>

        {/* Font Color */}
        <div className="flex items-center gap-2">
          <Label>Farbe</Label>
          <Input
            type="color"
            value={effectiveFont.color}
            onChange={(e) => updateFont(sectionId, type, key, { color: e.target.value })}
            className={`w-12 h-8 p-0 border-none ${
              isExplicitColor ? 'ring-2 ring-yellow-300' : ''
            }`}
            style={{ backgroundColor: effectiveFont.color }}
          />
          <Input
            type="text"
            value={effectiveFont.color}
            onChange={(e) => updateFont(sectionId, type, key, { color: e.target.value })}
            className={`w-24 text-xs font-mono ${
              isExplicitColor ? 'bg-yellow-50 border-yellow-300' : 'bg-white'
            }`}
            placeholder="#333333"
          />
        </div>

        {/* Font Weight & Style Controls */}
        <div className="flex gap-2">
          <Button
            variant={effectiveFont.weight === "bold" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              updateFont(sectionId, type, key, {
                weight: effectiveFont.weight === "bold" ? "normal" : "bold",
              })
            }
            className={isExplicitWeight ? 'ring-2 ring-yellow-300' : ''}
          >
            <strong>B</strong>
          </Button>

          <Button
            variant={effectiveFont.style === "italic" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              updateFont(sectionId, type, key, {
                style: effectiveFont.style === "italic" ? "normal" : "italic",
              })
            }
            className={isExplicitStyle ? 'ring-2 ring-yellow-300' : ''}
          >
            <em>I</em>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => resetFont(sectionId, type, key)}
            title="Reset to inherit from parent"
          >
            Reset
          </Button>
        </div>

        {/* Letter Spacing */}
        <div>
          <Label>Buchstabenabstand: {effectiveFont.letterSpacing ?? 0}px</Label>
          <Slider
            min={-2}
            max={5}
            step={0.1}
            value={[effectiveFont.letterSpacing ?? 0]}
            onValueChange={(v) => updateFont(sectionId, type, key, { letterSpacing: v[0] })}
            className={isFontPropertyExplicit(sectionId, key, type, 'letterSpacing', styleConfig) ? 'accent-yellow-500' : ''}
          />
        </div>

        {/* Line Height */}
        <div>
          <Label>Zeilenabstand: {effectiveFont.lineHeight ?? 1.6}</Label>
          <Slider
            min={1}
            max={2.5}
            step={0.1}
            value={[effectiveFont.lineHeight ?? 1.6]}
            onValueChange={(v) => updateFont(sectionId, type, key, { lineHeight: v[0] })}
            className={isFontPropertyExplicit(sectionId, key, type, 'lineHeight', styleConfig) ? 'accent-yellow-500' : ''}
          />
        </div>

        {/* Preview */}
        <div 
          className="bg-gray-50 p-3 rounded border"
          style={{
            fontFamily: effectiveFont.family,
            fontSize: `${effectiveFont.size}px`,
            fontWeight: effectiveFont.weight,
            fontStyle: effectiveFont.style,
            color: effectiveFont.color,
            letterSpacing: `${effectiveFont.letterSpacing || 0}px`,
            lineHeight: effectiveFont.lineHeight,
          }}
        >
          {type === "header" ? "Überschrift Beispiel" : "Beispieltext für diese Einstellung"}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-900">Typografie pro Bereich & Subfeld</h3>
      
      {/* Global Settings Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-4">🌐 Globale Einstellungen</h4>
        
        {/* All Headers Global */}
        <div className="mb-6">
          <h5 className="text-sm font-medium text-blue-800 mb-3">Alle Überschriften (Global)</h5>
          {renderFontEditor("allHeaders", "header", null, "Standard für alle Überschriften")}
        </div>

        {/* Name Global */}
        <div>
          <h5 className="text-sm font-medium text-blue-800 mb-3">Name-Feld (Global)</h5>
          {renderFontEditor("name", "field", "name", "Profil-Name Styling")}
        </div>
      </div>

      {/* Content Sections */}
      <Accordion type="multiple" className="space-y-2">
        {Object.entries(contentSections).map(([sectionId, fields]) => (
          <AccordionItem key={sectionId} value={sectionId}>
            <AccordionTrigger className="capitalize">
              {sectionId}
              {/* Show inheritance indicators */}
              <div className="flex items-center space-x-1 ml-2">
                {!getLocalFontConfig(sectionId, null, "header", styleConfig) && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-1 rounded">
                    Header: inherited
                  </span>
                )}
                {!getLocalFontConfig(sectionId, null, "content", styleConfig) && (
                  <span className="text-xs text-green-600 bg-green-100 px-1 rounded">
                    Content: inherited
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {/* Section Header */}
              {renderFontEditor(sectionId, "header", null, "Überschrift")}
              
              {/* Section Content */}
              {renderFontEditor(sectionId, "content", null, "Allgemeiner Inhalt")}
              
              {/* Section Fields */}
              {fields
                .filter((field) => field !== "header")
                .map((fieldKey) => 
                  renderFontEditor(sectionId, "field", fieldKey, `Feld: ${fieldKey}`)
                )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Debug Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">🔍 Debug Information</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Global Font: {styleConfig.font?.family || 'undefined'}</div>
          <div>Global FontSize: {styleConfig.fontSize || 'undefined'}</div>
          <div>AllHeaders Font: {styleConfig.sections?.allHeaders?.header?.font?.family || 'undefined'}</div>
          <div>Name Font: {styleConfig.sections?.name?.font?.family || 'undefined'}</div>
          <div>Profil Header Font: {styleConfig.sections?.profil?.header?.font?.family || 'undefined'}</div>
        </div>
      </div>
    </div>
  );
};