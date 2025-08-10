import React, { useMemo, useState, useEffect } from "react";
import {
  useDesignerStore,
  GroupKey,
  PartKey,
  PartStyle,
  SectionType,
} from "../store/designerStore";

const PARTS_BY_GROUP: Record<GroupKey, PartKey[]> = {
  profil: ["titel"],
  kontakt: ["titel", "kontakt"],
  erfahrung: ["titel", "zeitraum", "unternehmen", "position", "taetigkeiten"],
  ausbildung: ["titel", "zeitraum", "unternehmen", "abschluss"],
  kenntnisse: ["titel", "skills"],
  softskills: ["titel", "skills"],
};

function useGroupsInCanvas(): GroupKey[] {
  return useDesignerStore(
    React.useCallback((s) => {
      const set = new Set<GroupKey>();
      for (const section of s.sections) set.add(section.sectionType as GroupKey);
      // fallback: sinnvolle Reihenfolge
      const present = Array.from(set);
      const ordered: GroupKey[] = ["kontakt", "erfahrung", "ausbildung", "kenntnisse", "softskills", "profil"];
      return ordered.filter((g) => present.includes(g)).concat(ordered.filter((g) => !present.includes(g)));
    }, [])
  );
}

export default function PartTypographyPanel() {
  const groups = useGroupsInCanvas();

  const globalFieldStyles = useDesignerStore((s) => s.globalFieldStyles);
  const tokens = useDesignerStore((s) => s.tokens);
  const sections = useDesignerStore((s) => s.sections);
  const selectedTypographyField = useDesignerStore((s) => s.selectedTypographyField);

  const setGlobalFieldStyle = useDesignerStore((s) => s.setGlobalFieldStyle);
  const clearGlobalFieldStyle = useDesignerStore((s) => s.clearGlobalFieldStyle);
  const setSelectedField = useDesignerStore((s) => s.setSelectedTypographyField);

  // Use selected field from store, with fallback to first available
  const group = (selectedTypographyField?.sectionType as GroupKey) ?? groups[0] ?? "erfahrung";
  const part = (selectedTypographyField?.fieldType as PartKey) ?? PARTS_BY_GROUP[group]?.[0] ?? "titel";

  // Update selection when dropdowns change
  const handleGroupChange = (newGroup: GroupKey) => {
    const newPart = PARTS_BY_GROUP[newGroup]?.[0] ?? "titel";
    setSelectedField({ sectionType: newGroup, fieldType: newPart });
  };

  const handlePartChange = (newPart: PartKey) => {
    setSelectedField({ sectionType: group, fieldType: newPart });
  };

  const current: Typography | undefined = globalFieldStyles[group]?.[part];

  // Fallbacks aus tokens, nur für Preview/Initialwerte
  const base: Required<Pick<Typography, "fontFamily" | "fontSize" | "lineHeight" | "color">> = {
    fontFamily: tokens.fontFamily ?? "Inter, Arial, sans-serif",
    fontSize: (tokens.fontSize as number) ?? 12,
    lineHeight: (tokens.lineHeight as number) ?? 1.4,
    color: tokens.colorPrimary ?? "#111111", // Note: base uses 'color' for simplicity
  };

  // Wieviele Felder werden betroffen?
  const affectedCount = useMemo(() => {
    let n = 0;
    for (const section of sections) {
      if (section.sectionType !== group) continue;
      n += section.parts.filter((p) => p.key === part).length;
    }
    return n;
  }, [sections, group, part]);

  // Lokaler UI-State gespiegelt aus current/base
  const [fontFamily, setFontFamily] = useState<string>(current?.fontFamily ?? base.fontFamily);
  const [fontSize, setFontSize] = useState<number>(current?.fontSize ?? base.fontSize);
  const [lineHeight, setLineHeight] = useState<number>(current?.lineHeight ?? base.lineHeight);
  const [color, setColor] = useState<string>(current?.textColor ?? base.color);
  const [letterSpacing, setLetterSpacing] = useState<number>(current?.letterSpacing ?? 0);
  const [bold, setBold] = useState<boolean>(current?.fontWeight === "bold");
  const [italic, setItalic] = useState<boolean>(current?.fontStyle === "italic");

  // Wenn current sich extern ändert, UI nachziehen
  useEffect(() => {
    setFontFamily(current?.fontFamily ?? base.fontFamily);
    setFontSize(current?.fontSize ?? base.fontSize);
    setLineHeight(current?.lineHeight ?? base.lineHeight);
    setColor(current?.textColor ?? base.color);
    setLetterSpacing(current?.letterSpacing ?? 0);
    setBold((current?.fontWeight ?? "normal") === "bold");
    setItalic(current?.fontStyle === "italic");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, part, current?.fontFamily, current?.fontSize, current?.lineHeight, current?.textColor, current?.letterSpacing, current?.fontWeight, current?.fontStyle]);

  // Sofort anwenden, wenn ein Control verändert wird
  const apply = (patch: any) => {
    // Convert UI properties to Typography properties for store
    const typographyPatch: any = {};
    
    if (patch.fontFamily !== undefined) typographyPatch.fontFamily = patch.fontFamily;
    if (patch.fontSize !== undefined) typographyPatch.fontSize = patch.fontSize;
    if (patch.fontWeight !== undefined) typographyPatch.fontWeight = patch.fontWeight;
    if (patch.fontStyle !== undefined) typographyPatch.fontStyle = patch.fontStyle;
    if (patch.textColor !== undefined) typographyPatch.textColor = patch.textColor;
    if (patch.lineHeight !== undefined) typographyPatch.lineHeight = patch.lineHeight;
    if (patch.letterSpacing !== undefined) typographyPatch.letterSpacing = patch.letterSpacing;
    
    setGlobalFieldStyle(group as SectionType, part, typographyPatch);
  };

  const handleReset = () => {
    clearGlobalFieldStyle(group as SectionType, part);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Globale Feld-Typografie</h3>
        <span className="text-xs text-gray-500">wirkt auf: <b>{group}:{part}</b> ({affectedCount})</span>
      </div>

      {/* Auswahl Gruppe/Feld */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Gruppe</label>
          <select
            value={group}
            onChange={(e) => handleGroupChange(e.target.value as GroupKey)}
            className="w-full border rounded px-2 py-1 text-sm"
          >
            {groups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Feld</label>
          <select
            value={part}
            onChange={(e) => handlePartChange(e.target.value as PartKey)}
            className="w-full border rounded px-2 py-1 text-sm"
          >
            {PARTS_BY_GROUP[group].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Schriftfamilie</label>
          <input
            value={fontFamily}
            onChange={(e) => { 
              const value = e.target.value;
              setFontFamily(value); 
              apply({ fontFamily: value }); 
            }}
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder="Inter, Arial, sans-serif"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Größe (px)</label>
          <input
            type="number"
            min={8}
            max={48}
            value={fontSize}
            onChange={(e) => { 
              const v = Number(e.target.value || 0); 
              setFontSize(v); 
              apply({ fontSize: v }); 
            }}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Zeilenhöhe</label>
          <input
            type="number"
            step="0.1"
            min={1}
            max={3}
            value={lineHeight}
            onChange={(e) => { 
              const v = Number(e.target.value || 0); 
              setLineHeight(v); 
              apply({ lineHeight: v }); 
            }}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Buchstabenabstand (em)</label>
          <input
            type="number"
            step="0.01"
            min={-0.1}
            max={1}
            value={letterSpacing}
            onChange={(e) => { 
              const v = Number(e.target.value || 0); 
              setLetterSpacing(v); 
              apply({ letterSpacing: v }); 
            }}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Farbe</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={/^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(color) ? color : "#111111"}
              onChange={(e) => { 
                const value = e.target.value;
                setColor(value); 
                apply({ textColor: value }); 
              }}
              className="h-8 w-10 border rounded"
            />
            <input
              value={color}
              onChange={(e) => { 
                const value = e.target.value;
                setColor(value); 
                apply({ textColor: value }); 
              }}
              className="flex-1 border rounded px-2 py-1 text-sm"
              placeholder="#111111"
            />
          </div>
        </div>

        <div className="col-span-2 flex gap-2">
          <button
            onClick={() => { 
              const v = !bold; 
              setBold(v); 
              apply({ fontWeight: v ? "bold" : "normal" }); 
            }}
            className={"px-2 py-1 border rounded text-sm " + (bold ? "bg-gray-900 text-white" : "")}
            title="Fett"
          >
            B
          </button>
          <button
            onClick={() => { 
              const v = !italic; 
              setItalic(v); 
              apply({ fontStyle: v ? "italic" : "normal" }); 
            }}
            className={"px-2 py-1 border rounded text-sm " + (italic ? "bg-gray-900 text-white" : "")}
            title="Kursiv"
          >
            i
          </button>

          <div className="flex-1" />

          <button
            onClick={handleReset}
            className="px-3 py-1.5 border rounded text-sm text-red-600"
            title="Globale Styles für dieses Feld zurücksetzen"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Vorschau */}
      <div className="mt-2 p-3 border rounded bg-white">
        <div className="text-xs text-gray-500 mb-1">Live-Vorschau</div>
        <div
          style={{
            fontFamily,
            fontSize,
            lineHeight,
            color,
            fontWeight: bold ? "bold" : "normal",
            fontStyle: italic ? "italic" : "normal",
            letterSpacing: `${letterSpacing}em`,
          }}
          className="border rounded p-2"
        >
          {group}:{part} – Beispieltext „Position / Zeitraum / …“
        </div>
      </div>
    </div>
  );
}
