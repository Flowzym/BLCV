// 📄 src/modules/cv-designer/components/StyleTypographyPanel.tsx

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
import { Lock, RotateCcw, Eye } from "lucide-react";

// Nur Content Sections – globale Settings werden separat gerendert
const contentSections: Record<string, string[]> = {
  profil: ["header", "name", "adresse", "mail", "telefon"],
  erfahrung: ["header", "position", "firma", "zeitraum", "taetigkeiten"],
  ausbildung: ["header", "abschluss", "institution", "zeitraum"],
  kenntnisse: ["header", "skillname", "level"],
  softskills: ["header", "skillname", "level"],
};

const FONT_FAMILIES = [
  { value: "Inter", label: "Inter", category: "Sans-Serif" },
  { value: "Roboto", label: "Roboto", category: "Sans-Serif" },
  { value: "Open Sans", label: "Open Sans", category: "Sans-Serif" },
  { value: "Lato", label: "Lato", category: "Sans-Serif" },
  { value: "Montserrat", label: "Montserrat", category: "Sans-Serif" },
  { value: "Source Sans Pro", label: "Source Sans Pro", category: "Sans-Serif" },
  { value: "Arial", label: "Arial", category: "System" },
  { value: "Helvetica", label: "Helvetica", category: "System" },
  { value: "Georgia", label: "Georgia", category: "Serif" },
  { value: "Times New Roman", label: "Times New Roman", category: "Serif" },
  { value: "Verdana", label: "Verdana", category: "System" },
  { value: "Tahoma", label: "Tahoma", category: "System" },
  { value: "Trebuchet MS", label: "Trebuchet MS", category: "System" },
  { value: "Segoe UI", label: "Segoe UI", category: "System" },
  { value: "Courier Prime", label: "Courier Prime", category: "Monospace" },
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
    console.log(`🔧 updateFont: ${sectionId}.${type}.${key || "null"}`, updates);

    if (sectionId === "allHeaders") {
      updateStyleConfig({
        sections: {
          ...styleConfig.sections,
          allHeaders: {
            ...styleConfig.sections?.allHeaders,
            header: {
              ...styleConfig.sections?.allHeaders?.header,
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
            ...styleConfig.sections?.name,
            font: {
              ...styleConfig.sections?.name?.font,
              ...updates,
            },
          },
        },
      });
      return;
    }

    if (sectionId === "global") {
      updateStyleConfig({
        font: {
          ...styleConfig.font,
          ...updates,
        },
      });
      return;
    }

    const currentSection = styleConfig.sections?.[sectionId] || {};

    if (type === "header") {
      updateStyleConfig({
        sections: {
          ...styleConfig.sections,
          [sectionId]: {
            ...currentSection,
            header: {
              ...currentSection.header,
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
                ...currentSection.fields?.[key],
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

  const resetFont = (
    sectionId: string,
    type: "header" | "content" | "field",
    key: string | null
  ) => {
    const resetConfig = resetFontConfig(sectionId, key, type);
    updateFont(sectionId, type, key, resetConfig);
  };

  const renderFontEditor = (
    sectionId: string,
    type: "header" | "content" | "field",
    key: string | null,
    title: string
  ) => {
    const effectiveFont = getEffectiveFontConfig(sectionId, key, type, styleConfig);

    const isExplicitFamily = isFontPropertyExplicit(sectionId, key, type, "family", styleConfig);
    const isExplicitSize = isFontPropertyExplicit(sectionId, key, type, "size", styleConfig);
    const isExplicitWeight = isFontPropertyExplicit(sectionId, key, type, "weight", styleConfig);
    const isExplicitStyle = isFontPropertyExplicit(sectionId, key, type, "style", styleConfig);
    const isExplicitColor = isFontPropertyExplicit(sectionId, key, type, "color", styleConfig);
    const isExplicitLetterSpacing = isFontPropertyExplicit(sectionId, key, type, "letterSpacing", styleConfig);
    const isExplicitLineHeight = isFontPropertyExplicit(sectionId, key, type, "lineHeight", styleConfig);

    const hasAnyExplicit =
      isExplicitFamily ||
      isExplicitSize ||
      isExplicitWeight ||
      isExplicitStyle ||
      isExplicitColor ||
      isExplicitLetterSpacing ||
      isExplicitLineHeight;

    return (
      <div key={`${sectionId}-${type}-${key}`} className="space-y-4 border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <div className="flex items-center space-x-2">
            {!hasAnyExplicit && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                Geerbt
              </span>
            )}
            {hasAnyExplicit && (
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                Überschrieben
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetFont(sectionId, type, key)}
              disabled={!hasAnyExplicit}
              className="h-6 px-2"
              title="Auf Vererbung zurücksetzen"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Schriftart</Label>
          <select
            value={effectiveFont.family}
            onChange={(e) => {
              console.log("🔧 Font family changed to:", e.target.value);
              updateFont(sectionId, type, key, { family: e.target.value });
            }}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isExplicitFamily ? "bg-orange-50 border-orange-300" : "bg-white border-gray-300"
            }`}
          >
            {FONT_FAMILIES.map((fontFamily) => (
              <option key={fontFamily.value} value={fontFamily.value}>
                {fontFamily.label} ({fontFamily.category})
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Schriftgröße (px)</Label>
          <div className="flex items-center space-x-3">
            <Input
              type="number"
              value={effectiveFont.size}
              onChange={(e) => {
                const newSize = parseInt(e.target.value, 10) || defaultFont.size;
                console.log("🔧 Font size changed to:", newSize);
                updateFont(sectionId, type, key, { size: newSize });
              }}
              className={`w-20 ${
                isExplicitSize ? "bg-orange-50 border-orange-300" : "bg-white border-gray-300"
              }`}
              min={8}
              max={72}
            />
            <div className="flex-1">
              <Slider
                min={8}
                max={72}
                step={1}
                value={[effectiveFont.size]}
                onValueChange={(value) => {
                  console.log("🔧 Font size slider changed to:", value[0]);
                  updateFont(sectionId, type, key, { size: value[0] });
                }}
              />
            </div>
          </div>
        </div>

        {/* Font Weight & Style */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Schriftstil</Label>
          <div className="flex items-center space-x-2">
            <Button
              variant={effectiveFont.weight === "bold" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newWeight = effectiveFont.weight === "bold" ? "normal" : "bold";
                console.log("🔧 Font weight changed to:", newWeight);
                updateFont(sectionId, type, key, { weight: newWeight });
              }}
              className={`${isExplicitWeight ? "ring-2 ring-orange-300" : ""}`}
            >
              <strong>B</strong>
            </Button>

            <Button
              variant={effectiveFont.style === "italic" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newStyle = effectiveFont.style === "italic" ? "normal" : "italic";
                console.log("🔧 Font style changed to:", newStyle);
                updateFont(sectionId, type, key, { style: newStyle });
              }}
              className={`${isExplicitStyle ? "ring-2 ring-orange-300" : ""}`}
            >
              <em>I</em>
            </Button>
          </div>
        </div>

        {/* Font Color */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Textfarbe</Label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={effectiveFont.color}
              onChange={(e) => {
                console.log("🔧 Font color changed to:", e.target.value);
                updateFont(sectionId, type, key, { color: e.target.value });
              }}
              className={`w-12 h-8 rounded border cursor-pointer ${
                isExplicitColor ? "ring-2 ring-orange-300" : ""
              }`}
            />
            <Input
              type="text"
              value={effectiveFont.color}
              onChange={(e) => {
                console.log("🔧 Font color text changed to:", e.target.value);
                updateFont(sectionId, type, key, { color: e.target.value });
              }}
              className={`flex-1 font-mono text-sm ${
                isExplicitColor ? "bg-orange-50 border-orange-300" : "bg-white border-gray-300"
              }`}
              placeholder="#333333"
            />
          </div>
        </div>

        {/* Letter Spacing */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Buchstabenabstand: {(effectiveFont.letterSpacing ?? 0).toFixed(1)}px
          </Label>
          <Slider
            min={-2}
            max={5}
            step={0.1}
            value={[effectiveFont.letterSpacing ?? 0]}
            onValueChange={(v) => {
              console.log("🔧 Letter spacing changed to:", v[0]);
              updateFont(sectionId, type, key, { letterSpacing: v[0] });
            }}
          />
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Zeilenabstand: {(effectiveFont.lineHeight ?? 1.6).toFixed(1)}
          </Label>
          <Slider
            min={1}
            max={2.5}
            step={0.1}
            value={[effectiveFont.lineHeight ?? 1.6]}
            onValueChange={(v) => {
              console.log("🔧 Line height changed to:", v[0]);
              updateFont(sectionId, type, key, { lineHeight: v[0] });
            }}
          />
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-3 border">
          <Label className="text-xs text-gray-600 mb-2 block">Vorschau:</Label>
          <div
            style={{
              fontFamily: effectiveFont.family,
              fontSize: `${effectiveFont.size}px`,
              fontWeight: effectiveFont.weight,
              fontStyle: effectiveFont.style,
              color: effectiveFont.color,
              letterSpacing: `${effectiveFont.letterSpacing ?? 0}px`,
              lineHeight: effectiveFont.lineHeight ?? 1.6,
            }}
          >
            {type === "header"
              ? "Überschrift Beispiel"
              : key === "name"
              ? "Max Mustermann"
              : "Beispieltext für diese Einstellung"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-900">Typografie-Einstellungen</h3>

      {/* Globale Settings */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-4 flex items-center">🌐 Globale Einstellungen</h4>

        <div className="mb-6">
          <h5 className="text-sm font-medium text-blue-800 mb-3">Basis-Schriftart (Global)</h5>
          {renderFontEditor("global", "content", null, "Globale Basis-Schriftart für alle Texte")}
        </div>

        <div className="mb-6">
          <h5 className="text-sm font-medium text-blue-800 mb-3">Alle Überschriften (Global)</h5>
          {renderFontEditor("allHeaders", "header", null, "Standard für alle Überschriften")}
        </div>

        <div>
          <h5 className="text-sm font-medium text-blue-800 mb-3">Name-Feld (Global)</h5>
          {renderFontEditor("name", "field", "name", "Profil-Name Styling")}
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center">📝 Individuelle Sektions-Einstellungen</h4>

        <Accordion type="multiple" className="space-y-2">
          {Object.entries(contentSections).map(([sectionId, fields]) => (
            <AccordionItem key={sectionId} value={sectionId} className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between w-full">
                  <span className="capitalize font-medium">{sectionId}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Überschrift</h6>
                    {renderFontEditor(sectionId, "header", null, `${sectionId} - Überschrift`)}
                  </div>
                  <div>
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Allgemeiner Inhalt</h6>
                    {renderFontEditor(sectionId, "content", null, `${sectionId} - Inhalt`)}
                  </div>
                  {fields
                    .filter((field) => field !== "header")
                    .map((fieldKey) => (
                      <div key={fieldKey}>
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Feld: {fieldKey}</h6>
                        {renderFontEditor(sectionId, "field", fieldKey, `${sectionId} - ${fieldKey}`)}
                      </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
