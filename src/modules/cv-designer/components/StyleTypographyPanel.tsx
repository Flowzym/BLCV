import React from "react";
import { useStyleConfig } from "../context/StyleConfigContext";
import { StyleConfig, TextStyle } from "../types/styles";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/Accordion";

const fontSizes = [
  { label: "Klein", value: "small" },
  { label: "Normal", value: "medium" },
  { label: "Groß", value: "large" },
];

const defaultTextStyle: TextStyle = {
  fontSize: "medium",
  fontWeight: "normal",
  fontColor: "#000000",
  lineHeight: 1.6,
  letterSpacing: 0,
};

export const StyleTypographyPanel: React.FC = () => {
  const { styleConfig, updateStyleConfig } = useStyleConfig();

  // Beispiel-Struktur: könnte später aus Mapping abgeleitet werden
  const sectionFields: Record<string, string[]> = {
    profil: ["name", "adresse", "mail", "telefon"],
    erfahrung: ["position", "firma", "zeitraum", "taetigkeiten"],
    ausbildung: ["abschluss", "institution", "zeitraum"],
    skills: ["skillname", "level"],
  };

  const updateStyle = (section: string, field: string, updates: Partial<TextStyle>) => {
    const currentSection = styleConfig.sections?.[section] || { default: defaultTextStyle, fields: {} };
    const currentFieldStyle = currentSection.fields?.[field] || defaultTextStyle;

    const newConfig: StyleConfig = {
      ...styleConfig,
      sections: {
        ...styleConfig.sections,
        [section]: {
          ...currentSection,
          fields: {
            ...currentSection.fields,
            [field]: { ...currentFieldStyle, ...updates },
          },
        },
      },
    };

    updateStyleConfig(newConfig);
  };

  const renderFieldEditor = (section: string, field: string, style: TextStyle) => (
    <div key={field} className="space-y-2 border p-3 rounded-md mb-3">
      <h4 className="text-sm font-semibold text-gray-700">{field}</h4>

      {/* Schriftgröße */}
      <div className="flex gap-2">
        {fontSizes.map((size) => (
          <Button
            key={size.value}
            variant={style.fontSize === size.value ? "default" : "outline"}
            onClick={() => updateStyle(section, field, { fontSize: size.value as any })}
          >
            {size.label}
          </Button>
        ))}
      </div>

      {/* Schriftfarbe */}
      <div className="flex items-center gap-2">
        <Label>Farbe</Label>
        <Input
          type="color"
          value={style.fontColor}
          onChange={(e) => updateStyle(section, field, { fontColor: e.target.value })}
          className="w-12 h-8 p-0 border-none"
        />
        <Input
          type="text"
          value={style.fontColor}
          onChange={(e) => updateStyle(section, field, { fontColor: e.target.value })}
          className="w-24 text-xs"
        />
      </div>

      {/* Stil: Bold / Italic / Normal */}
      <div className="flex gap-2">
        <Button
          variant={style.fontWeight === "bold" ? "default" : "outline"}
          onClick={() => updateStyle(section, field, { fontWeight: "bold" })}
        >
          B
        </Button>
        <Button
          variant={style.fontWeight === "italic" ? "default" : "outline"}
          onClick={() => updateStyle(section, field, { fontWeight: "italic" })}
        >
          I
        </Button>
        <Button
          variant={style.fontWeight === "normal" ? "default" : "outline"}
          onClick={() => updateStyle(section, field, { fontWeight: "normal" })}
        >
          R
        </Button>
      </div>

      {/* Letter Spacing */}
      <div>
        <Label>Buchstabenabstand: {style.letterSpacing}px</Label>
        <Slider
          min={-1}
          max={5}
          step={0.1}
          value={[style.letterSpacing]}
          onValueChange={(v) => updateStyle(section, field, { letterSpacing: v[0] })}
        />
      </div>

      {/* Line Height */}
      <div>
        <Label>Zeilenabstand: {style.lineHeight}</Label>
        <Slider
          min={1}
          max={2.5}
          step={0.1}
          value={[style.lineHeight]}
          onValueChange={(v) => updateStyle(section, field, { lineHeight: v[0] })}
        />
      </div>

      {/* Reset Button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={() => updateStyle(section, field, defaultTextStyle)}
      >
        Reset
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Typografie pro Bereich & Subfeld</h3>
      <Accordion type="multiple" className="space-y-2">
        {Object.entries(sectionFields).map(([section, fields]) => (
          <AccordionItem key={section} value={section}>
            <AccordionTrigger className="capitalize">{section}</AccordionTrigger>
            <AccordionContent>
              {fields.map((field) => {
                const style =
                  styleConfig.sections?.[section]?.fields?.[field] || defaultTextStyle;
                return renderFieldEditor(section, field, style);
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
