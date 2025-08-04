import React from "react";
import { useStyleConfig } from "../context/StyleConfigContext";
import { StyleConfig, FontConfig } from "../types/styles";
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

const defaultFont: FontConfig = {
  family: "Inter, sans-serif",
  size: 12,
  weight: "normal",
  style: "normal",
  color: "#000000",
  letterSpacing: 0,
  lineHeight: 1.6,
};

// Section-Felder
const sectionFields: Record<string, string[]> = {
  profil: ["header", "name", "adresse", "mail", "telefon"],
  erfahrung: ["header", "position", "firma", "zeitraum", "taetigkeiten"],
  ausbildung: ["header", "abschluss", "institution", "zeitraum"],
  skills: ["header", "skillname", "level"],
};

// ✅ Erweiterte Font-Liste (Google + System Fonts mit Fallbacks)
const FONT_FAMILIES = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Roboto, sans-serif", label: "Roboto" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "Lato, sans-serif", label: "Lato" },
  { value: "Montserrat, sans-serif", label: "Montserrat" },
  { value: "'Source Sans Pro', sans-serif", label: "Source Sans Pro" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Tahoma, sans-serif", label: "Tahoma" },
  { value: "'Trebuchet MS', sans-serif", label: "Trebuchet MS" },
  { value: "'Segoe UI', sans-serif", label: "Segoe UI" },
  { value: "system-ui, sans-serif", label: "System UI" },
  { value: "'Courier Prime', monospace", label: "Courier Prime" },
];

export const StyleTypographyPanel: React.FC = () => {
  const { styleConfig, updateStyleConfig } = useStyleConfig();

  const updateFont = (
    sectionId: string,
    type: "header" | "content" | "field",
    key: string | null,
    updates: Partial<FontConfig>
  ) => {
    const newConfig: StyleConfig = { ...styleConfig };
    if (!newConfig.sections) newConfig.sections = {};
    if (!newConfig.sections[sectionId]) newConfig.sections[sectionId] = { sectionId };

    const currentSection = newConfig.sections[sectionId];

    if (type === "header") {
      if (!currentSection.header) currentSection.header = {};
      currentSection.header.font = {
        ...(currentSection.header.font || defaultFont),
        ...updates,
      };
    } else if (type === "content") {
      currentSection.font = { ...(currentSection.font || defaultFont), ...updates };
    } else if (type === "field" && key) {
      if (!currentSection.fields) currentSection.fields = {};
      if (!currentSection.fields[key]) currentSection.fields[key] = {};
      currentSection.fields[key]!.font = {
        ...(currentSection.fields[key]?.font || defaultFont),
        ...updates,
      };
    }

    updateStyleConfig(newConfig);
  };

  const renderFontEditor = (
    sectionId: string,
    type: "header" | "content" | "field",
    key: string | null,
    font: FontConfig = defaultFont
  ) => {
    const safeFont = { ...defaultFont, ...font };
    const editorTitle =
      type === "header" ? "Überschrift" : type === "content" ? "Allgemeiner Inhalt" : key;

    return (
      <div key={`${sectionId}-${type}-${key}`} className="space-y-2 border p-3 rounded-md mb-3">
        <h4 className="text-sm font-semibold text-gray-700">{editorTitle}</h4>

        {/* Schriftart */}
        <div>
          <Label>Schriftart</Label>
          <select
            value={safeFont.family}
            onChange={(e) => updateFont(sectionId, type, key, { family: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {FONT_FAMILIES.map((fontFamily) => (
              <option key={fontFamily.value} value={fontFamily.value}>
                {fontFamily.label}
              </option>
            ))}
          </select>
        </div>

        {/* Schriftgröße */}
        <div className="flex items-center gap-2">
          <Label>Größe</Label>
          <Input
            type="number"
            value={safeFont.size}
            onChange={(e) =>
              updateFont(sectionId, type, key, {
                size: parseInt(e.target.value, 10) || defaultFont.size,
              })
            }
            className="w-20"
          />
          <span className="text-xs text-gray-500">px</span>
        </div>

        {/* Schriftfarbe */}
        <div className="flex items-center gap-2">
          <Label>Farbe</Label>
          <Input
            type="color"
            value={safeFont.color || defaultFont.color}
            onChange={(e) => updateFont(sectionId, type, key, { color: e.target.value })}
            className="w-12 h-8 p-0 border-none"
          />
        </div>

        {/* Bold / Italic / Reset */}
        <div className="flex gap-2">
          {/* Bold */}
          <Button
            variant={safeFont.weight?.toString().includes("bold") ? "default" : "outline"}
            onClick={() =>
              updateFont(sectionId, type, key, {
                weight: safeFont.weight?.toString().includes("bold") ? "normal" : "bold",
              })
            }
          >
            B
          </Button>

          {/* Italic */}
          <Button
            variant={safeFont.style === "italic" ? "default" : "outline"}
            onClick={() =>
              updateFont(sectionId, type, key, {
                style: safeFont.style === "italic" ? "normal" : "italic",
              })
            }
          >
            I
          </Button>

          {/* Reset Regular */}
          <Button
            variant={
              safeFont.weight === "normal" && safeFont.style === "normal"
                ? "default"
                : "outline"
            }
            onClick={() =>
              updateFont(sectionId, type, key, { weight: "normal", style: "normal" })
            }
          >
            R
          </Button>
        </div>

        {/* Letter Spacing */}
        <div>
          <Label>Buchstabenabstand: {safeFont.letterSpacing ?? 0}px</Label>
          <Slider
            min={-1}
            max={5}
            step={0.1}
            value={[safeFont.letterSpacing ?? 0]}
            onValueChange={(v) => updateFont(sectionId, type, key, { letterSpacing: v[0] })}
          />
        </div>

        {/* Line Height */}
        <div>
          <Label>Zeilenabstand: {safeFont.lineHeight ?? 1.6}</Label>
          <Slider
            min={1}
            max={2.5}
            step={0.1}
            value={[safeFont.lineHeight ?? 1.6]}
            onValueChange={(v) => updateFont(sectionId, type, key, { lineHeight: v[0] })}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Typografie pro Bereich & Subfeld</h3>
      <Accordion type="multiple" className="space-y-2">
        {Object.entries(sectionFields).map(([sectionId, fields]) => (
          <AccordionItem key={sectionId} value={sectionId}>
            <AccordionTrigger className="capitalize">{sectionId}</AccordionTrigger>
            <AccordionContent>
              {renderFontEditor(
                sectionId,
                "header",
                null,
                styleConfig.sections?.[sectionId]?.header?.font || defaultFont
              )}
              {renderFontEditor(
                sectionId,
                "content",
                null,
                styleConfig.sections?.[sectionId]?.font || defaultFont
              )}
              {fields
                .filter((field) => field !== "header")
                .map((fieldKey) => {
                  const font =
                    styleConfig.sections?.[sectionId]?.fields?.[fieldKey]?.font ||
                    defaultFont;
                  return renderFontEditor(sectionId, "field", fieldKey, font);
                })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
