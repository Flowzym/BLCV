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
} from "@/components/Accordion";

const defaultFont: FontConfig = {
  family: "Inter",
  size: 12,
  weight: "normal",
  color: "#000000",
  letterSpacing: 0,
  lineHeight: 1.6,
};

// Beispiel-Struktur → später aus Mapping ableitbar
const sectionFields: Record<string, string[]> = {
  profil: ["name", "adresse", "mail", "telefon"],
  erfahrung: ["position", "firma", "zeitraum", "taetigkeiten"],
  ausbildung: ["abschluss", "institution", "zeitraum"],
  skills: ["skillname", "level"],
};

export const StyleTypographyPanel: React.FC = () => {
  const { styleConfig, updateStyleConfig } = useStyleConfig();

  const updateFont = (
    section: string,
    field: string,
    updates: Partial<FontConfig>
  ) => {
    const newConfig: StyleConfig = {
      ...styleConfig,
      sections: {
        ...styleConfig.sections,
        [section]: {
          sectionId: section,
          ...(styleConfig.sections?.[section] || {}),
          fields: {
            ...(styleConfig.sections?.[section]?.fields || {}),
            [field]: {
              ...(styleConfig.sections?.[section]?.fields?.[field] || {}),
              font: {
                ...(styleConfig.sections?.[section]?.fields?.[field]?.font ||
                  defaultFont),
                ...updates,
              },
            },
          },
        },
      },
    };

    updateStyleConfig(newConfig);
  };

  const renderFieldEditor = (
    section: string,
    field: string,
    font: FontConfig
  ) => (
    <div key={field} className="space-y-2 border p-3 rounded-md mb-3">
      <h4 className="text-sm font-semibold text-gray-700">{field}</h4>

      {/* Schriftgröße */}
      <div className="flex items-center gap-2">
        <Label>Größe</Label>
        <Input
          type="number"
          value={font.size}
          onChange={(e) =>
            updateFont(section, field, { size: parseInt(e.target.value, 10) })
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
          value={font.color}
          onChange={(e) => updateFont(section, field, { color: e.target.value })}
          className="w-12 h-8 p-0 border-none"
        />
      </div>

      {/* Bold/Italic/Normal */}
      <div className="flex gap-2">
        <Button
          variant={font.weight === "bold" ? "default" : "outline"}
          onClick={() => updateFont(section, field, { weight: "bold" })}
        >
          B
        </Button>
        <Button
          variant={font.weight === "italic" ? "default" : "outline"}
          onClick={() => updateFont(section, field, { weight: "italic" })}
        >
          I
        </Button>
        <Button
          variant={font.weight === "normal" ? "default" : "outline"}
          onClick={() => updateFont(section, field, { weight: "normal" })}
        >
          R
        </Button>
      </div>

      {/* Letter Spacing */}
      <div>
        <Label>Buchstabenabstand: {font.letterSpacing || 0}px</Label>
        <Slider
          min={-1}
          max={5}
          step={0.1}
          value={[font.letterSpacing || 0]}
          onValueChange={(v) => updateFont(section, field, { letterSpacing: v[0] })}
        />
      </div>

      {/* Line Height */}
      <div>
        <Label>Zeilenabstand: {font.lineHeight || 1.6}</Label>
        <Slider
          min={1}
          max={2.5}
          step={0.1}
          value={[font.lineHeight || 1.6]}
          onValueChange={(v) => updateFont(section, field, { lineHeight: v[0] })}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">
        Typografie pro Bereich & Subfeld
      </h3>
      <Accordion type="multiple" className="space-y-2">
        {Object.entries(sectionFields).map(([section, fields]) => (
          <AccordionItem key={section} value={section}>
            <AccordionTrigger className="capitalize">{section}</AccordionTrigger>
            <AccordionContent>
              {fields.map((field) => {
                const font =
                  styleConfig.sections?.[section]?.fields?.[field]?.font ||
                  defaultFont;
                return renderFieldEditor(section, field, font);
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
