// 📄 src/modules/cv-designer/components/StyleTypographyPanel.tsx

import React from "react";
import { useTypography, useHasCustomTypography, useResetTypography } from "../context/TypographyContext";
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
import { Lock, RotateCcw, Eye } from "lucide-react";

// Content Sections mit ihren Feldern
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
  const { resetField } = useResetTypography();

  const renderFontEditor = (
    sectionId: string,
    fieldKey: string,
    title: string
  ) => {
    const [typography, updateTypography] = useTypography(sectionId, fieldKey);
    const hasCustomTypography = useHasCustomTypography(sectionId, fieldKey);

    return (
      <div key={`${sectionId}-${fieldKey}`} className="space-y-4 border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <div className="flex items-center space-x-2">
            {!hasCustomTypography && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                Standard
              </span>
            )}
            {hasCustomTypography && (
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                Angepasst
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetField(sectionId, fieldKey)}
              disabled={!hasCustomTypography}
              className="h-6 px-2"
              title="Auf Standard zurücksetzen"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Schriftart</Label>
          <select
            value={typography.fontFamily || 'Inter'}
            onChange={(e) => {
              console.log('🔧 Font family changed to:', e.target.value);
              updateTypography({ fontFamily: e.target.value });
            }}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              typography.fontFamily ? "bg-orange-50 border-orange-300" : "bg-white border-gray-300"
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
              value={typography.fontSize || 12}
              onChange={(e) => {
                const newSize = parseInt(e.target.value, 10) || 12;
                console.log("🔧 Font size changed to:", newSize);
                updateTypography({ fontSize: newSize });
              }}
              className={`w-20 ${
                typography.fontSize ? "bg-orange-50 border-orange-300" : "bg-white border-gray-300"
              }`}
              min={8}
              max={72}
            />
            <div className="flex-1">
              <Slider
                min={8}
                max={72}
                step={1}
                value={[typography.fontSize || 12]}
                onValueChange={(value) => {
                  console.log("🔧 Font size slider changed to:", value[0]);
                  updateTypography({ fontSize: value[0] });
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
              variant={typography.fontWeight === "bold" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newWeight = typography.fontWeight === "bold" ? "normal" : "bold";
                console.log("🔧 Font weight changed to:", newWeight);
                updateTypography({ fontWeight: newWeight });
              }}
              className={`${typography.fontWeight ? "ring-2 ring-orange-300" : ""}`}
            >
              <strong>B</strong>
            </Button>

            <Button
              variant={typography.italic ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newItalic = !typography.italic;
                console.log("🔧 Font italic changed to:", newItalic);
                updateTypography({ italic: newItalic });
              }}
              className={`${typography.italic ? "ring-2 ring-orange-300" : ""}`}
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
              value={typography.textColor || '#333333'}
              onChange={(e) => {
                console.log("🔧 Font color changed to:", e.target.value);
                updateTypography({ textColor: e.target.value });
              }}
              className={`w-12 h-8 rounded border cursor-pointer ${
                typography.textColor ? "ring-2 ring-orange-300" : ""
              }`}
            />
            <Input
              type="text"
              value={typography.textColor || '#333333'}
              onChange={(e) => {
                console.log("🔧 Font color text changed to:", e.target.value);
                updateTypography({ textColor: e.target.value });
              }}
              className={`flex-1 font-mono text-sm ${
                typography.textColor ? "bg-orange-50 border-orange-300" : "bg-white border-gray-300"
              }`}
              placeholder="#333333"
            />
          </div>
        </div>

        {/* Letter Spacing */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Buchstabenabstand: {(typography.letterSpacing ?? 0).toFixed(1)}px
          </Label>
          <Slider
            min={-2}
            max={5}
            step={0.1}
            value={[typography.letterSpacing ?? 0]}
            onValueChange={(v) => {
              console.log("🔧 Letter spacing changed to:", v[0]);
              updateTypography({ letterSpacing: v[0] });
            }}
          />
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Zeilenabstand: {(typography.lineHeight ?? 1.6).toFixed(1)}
          </Label>
          <Slider
            min={1}
            max={2.5}
            step={0.1}
            value={[typography.lineHeight ?? 1.6]}
            onValueChange={(v) => {
              console.log("🔧 Line height changed to:", v[0]);
              updateTypography({ lineHeight: v[0] });
            }}
          />
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-3 border">
          <Label className="text-xs text-gray-600 mb-2 block">Vorschau:</Label>
          <div
            style={{
              fontFamily: typography.fontFamily || 'Inter',
              fontSize: `${typography.fontSize || 12}px`,
              fontWeight: typography.fontWeight || 'normal',
              fontStyle: typography.italic ? 'italic' : 'normal',
              color: typography.textColor || '#333333',
              letterSpacing: `${typography.letterSpacing ?? 0}px`,
              lineHeight: typography.lineHeight ?? 1.6,
            }}
          >
            {fieldKey === "header"
              ? "Überschrift Beispiel"
              : fieldKey === "name"
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

      {/* Section-basierte Einstellungen */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center">📝 Sektions-Einstellungen</h4>

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
                    {renderFontEditor(sectionId, "header", `${sectionId} - Überschrift`)}
                  </div>
                  <div>
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Allgemeiner Inhalt</h6>
                    {renderFontEditor(sectionId, "content", `${sectionId} - Inhalt`)}
                  </div>
                  {fields
                    .filter((field) => field !== "header")
                    .map((fieldKey) => (
                      <div key={fieldKey}>
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Feld: {fieldKey}</h6>
                        {renderFontEditor(sectionId, fieldKey, `${sectionId} - ${fieldKey}`)}
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