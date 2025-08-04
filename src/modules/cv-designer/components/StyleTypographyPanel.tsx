// 📄 src/modules/cv-designer/components/StyleTypographyPanel.tsx

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
  family: "Inter",
  size: 12,
  weight: "normal",
  style: "normal",
  color: "#000000",
  letterSpacing: 0,
  lineHeight: 1.6,
};

// Section-Felder + globale Bereiche
const sectionFields: Record<string, string[]> = {
  allHeaders: ["header"], // NEU: Alle Überschriften global
  name: ["field"],        // NEU: Name-Feld global
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
   * Update-Funktion: behandelt jetzt auch Sonderfälle "allHeaders" & "name"
   */
  const updateFont = (
    sectionId: string,
    type: "header" | "content" | "field",
    key: string | null,
    updates: Partial<FontConfig>
  ) => {
    // 🔹 Sonderfall: Alle Überschriften
    if (sectionId === "allHeaders") {
      const newSections: any = {};
      Object.keys(styleConfig.sections || {}).forEach((secId) => {
        newSections[secId] = {
          ...styleConfig.sections?.[secId],
          header: {
            font: {
              ...defaultFont,
              ...(styleConfig.sections?.[secId]?.header?.font || {}),
              ...updates,
            },
          },
        };
      });

      updateStyleConfig({
        sections: {
          ...styleConfig.sections,
          ...newSections,
        },
      });
      return;
    }

    // 🔹 Sonderfall: Name (Profil → fields.name)
    if (sectionId === "name") {
      const prev = styleConfig.sections?.profil?.fields?.name?.font;
      const merged: FontConfig = {
        ...defaultFont,
        ...(prev || {}),
        ...updates,
      };

      updateStyleConfig({
        sections: {
          ...styleConfig.sections,
          profil: {
            ...styleConfig.sections?.profil,
            fields: {
              ...(styleConfig.sections?.profil?.fields || {}),
              name: { font: merged },
            },
          },
        },
      });
      return;
    }

    // 🔹 Normale Sections
    const prev =
      type === "header"
        ? styleConfig.sections?.[sectionId]?.header?.font
        : type === "content"
        ? styleConfig.sections?.[sectionId]?.font
        : key
        ? styleConfig.sections?.[sectionId]?.fields?.[key]?.font
        : undefined;

    const merged: FontConfig = {
      size: updates.size ?? prev?.size ?? defaultFont.size,
      weight: updates.weight ?? prev?.weight ?? defaultFont.weight,
      style: updates.style ?? prev?.style ?? defaultFont.style,
      color:
        updates.color ??
        prev?.color ??
        (type === "header"
          ? styleConfig.colors?.primary ||
            styleConfig.primaryColor ||
            defaultFont.color
          : styleConfig.colors?.text ||
            styleConfig.textColor ||
            defaultFont.color),
      letterSpacing:
        updates.letterSpacing ?? prev?.letterSpacing ?? defaultFont.letterSpacing,
      lineHeight: updates.lineHeight ?? prev?.lineHeight ?? defaultFont.lineHeight,
      family: updates.family ?? prev?.family ?? defaultFont.family,
    };

    updateStyleConfig({
      sections: {
        ...styleConfig.sections,
        [sectionId]: {
          ...styleConfig.sections?.[sectionId],
          ...(type === "header"
            ? { header: { font: merged } }
            : type === "content"
            ? { font: merged }
            : key
            ? {
                fields: {
                  ...(styleConfig.sections?.[sectionId]?.fields || {}),
                  [key]: { font: merged },
                },
              }
            : {}),
        },
      },
    });
  };

  /**
   * Editor für eine FontConfig
   */
  const renderFontEditor = (
    sectionId: string,
    type: "header" | "content" | "field",
    key: string | null,
    font: FontConfig = defaultFont
  ) => {
    const safeFont: FontConfig = {
      ...defaultFont,
      ...font,
      color:
        font.color ||
        (type === "header"
          ? styleConfig.colors?.primary ||
            styleConfig.primaryColor ||
            defaultFont.color
          : styleConfig.colors?.text ||
            styleConfig.textColor ||
            defaultFont.color),
    };

    const editorTitle =
      sectionId === "allHeaders"
        ? "Alle Überschriften"
        : sectionId === "name"
        ? "Name"
        : type === "header"
        ? "Überschrift"
        : type === "content"
        ? "Allgemeiner Inhalt"
        : key;

    return (
      <div
        key={`${sectionId}-${type}-${key}`}
        className="space-y-2 border p-3 rounded-md mb-3"
      >
        <h4 className="text-sm font-semibold text-gray-700">{editorTitle}</h4>

        {/* Schriftart */}
        <div>
          <Label>Schriftart</Label>
          <select
            value={safeFont.family}
            onChange={(e) =>
              updateFont(sectionId, type, key, { family: e.target.value })
            }
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
            value={safeFont.color}
            onChange={(e) =>
              updateFont(sectionId, type, key, { color: e.target.value })
            }
            className="w-12 h-8 p-0 border-none"
          />
        </div>

        {/* Bold / Italic / Reset */}
        <div className="flex gap-2">
          <Button
            variant={safeFont.weight === "bold" ? "default" : "outline"}
            onClick={() =>
              updateFont(sectionId, type, key, {
                weight:
                  safeFont.weight === "bold" ? "normal" : "bold",
                style: safeFont.style,
              })
            }
          >
            B
          </Button>

          <Button
            variant={safeFont.style === "italic" ? "default" : "outline"}
            onClick={() =>
              updateFont(sectionId, type, key, {
                style:
                  safeFont.style === "italic" ? "normal" : "italic",
                weight: safeFont.weight,
              })
            }
          >
            I
          </Button>

          <Button
            variant={
              safeFont.weight === "normal" && safeFont.style === "normal"
                ? "default"
                : "outline"
            }
            onClick={() =>
              updateFont(sectionId, type, key, {
                weight: "normal",
                style: "normal",
              })
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
            onValueChange={(v) =>
              updateFont(sectionId, type, key, { letterSpacing: v[0] })
            }
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
            onValueChange={(v) =>
              updateFont(sectionId, type, key, { lineHeight: v[0] })
            }
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">
        Typografie pro Bereich & Subfeld
      </h3>
      <Accordion type="multiple" className="space-y-2">
        {Object.entries(sectionFields).map(([sectionId, fields]) => (
          <AccordionItem key={sectionId} value={sectionId}>
            <AccordionTrigger className="capitalize">
              {sectionId}
            </AccordionTrigger>
            <AccordionContent>
              {renderFontEditor(
                sectionId,
                "header",
                null,
                styleConfig.sections?.[sectionId]?.header?.font ||
                  defaultFont
              )}
              {renderFontEditor(
                sectionId,
                "content",
                null,
                styleConfig.sections?.[sectionId]?.font ||
                  defaultFont
              )}
              {fields
                .filter((field) => field !== "header")
                .map((fieldKey) => {
                  const font =
                    styleConfig.sections?.[sectionId]?.fields?.[fieldKey]
                      ?.font || defaultFont;
                  return renderFontEditor(
                    sectionId,
                    "field",
                    fieldKey,
                    font
                  );
                })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
