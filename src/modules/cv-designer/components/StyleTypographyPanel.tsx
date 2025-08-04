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

const defaultFont: FontConfig = {
  family: "Inter",
  size: 12,
  weight: "normal",
  style: "normal",
  color: "#000000",
  letterSpacing: 0,
  lineHeight: 1.6,
};

const sectionFields: Record<string, string[]> = {
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
  const { styleConfig, updateStyleConfig, selectedElement } = useStyleConfig();

  const updateFont = (
    sectionId: string,
    type: "header" | "content" | "field",
    key: string | null,
    updates: Partial<FontConfig>
  ) => {
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
      color: updates.color ?? prev?.color ?? defaultFont.color,
      letterSpacing:
        updates.letterSpacing ?? prev?.letterSpacing ?? defaultFont.letterSpacing,
      lineHeight: updates.lineHeight ?? prev?.lineHeight ?? defaultFont.lineHeight,
      family: updates.family ?? prev?.family ?? defaultFont.family,
    };

    if (sectionId === "globalHeaders") {
      updateStyleConfig({
        globalHeaders: { font: merged },
      });
      return;
    }

    if (type === "header") {
      updateStyleConfig({
        sections: {
          ...styleConfig.sections,
          [sectionId]: {
            ...styleConfig.sections?.[sectionId],
            header: { font: merged },
          },
        },
      });
    } else if (type === "content") {
      updateStyleConfig({
        sections: {
          ...styleConfig.sections,
          [sectionId]: {
            ...styleConfig.sections?.[sectionId],
            font: merged,
          },
        },
      });
    } else if (type === "field" && key) {
      updateStyleConfig({
        sections: {
          ...styleConfig.sections,
          [sectionId]: {
            ...styleConfig.sections?.[sectionId],
            fields: {
              ...(styleConfig.sections?.[sectionId]?.fields || {}),
              [key]: { font: merged },
            },
          },
        },
      });
    }
  };

  const renderFontEditor = (
    sectionId: string,
    type: "header" | "content" | "field",
    key: string | null,
    font: FontConfig = defaultFont
  ) => {
    const safeFont: FontConfig = {
      ...defaultFont,
      ...font,
    };

    const editorTitle =
      sectionId === "globalHeaders"
        ? "Alle Überschriften"
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
            value={safeFont.size
