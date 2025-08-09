import React, { useCallback } from "react";
import { useDesignerStore } from "../store/designerStore";
import { useLebenslauf } from "@/components/LebenslaufContext";
import {
  buildSectionsFromLebenslauf,
  splitSectionByPage,
} from "../services/mapLebenslaufToSections";

const A4_H = 842;

export default function CanvasToolbar() {
  const addSection = useDesignerStore((s) => s.addSection);
  const addPhoto = useDesignerStore((s) => s.addPhoto);
  const undo = useDesignerStore((s) => s.undo);
  const redo = useDesignerStore((s) => s.redo);
  const zoom = useDesignerStore((s) => s.zoom);
  const setZoom = useDesignerStore((s) => s.setZoom);
  const snap = useDesignerStore((s) => s.snapSize);
  const setSnap = useDesignerStore((s) => s.setSnapSize);
  const deleteSelected = useDesignerStore((s) => s.deleteSelected);

  // Import-Parameter aus Store
  const margins = useDesignerStore((s) => s.margins);
  const fontSize = useDesignerStore((s) => s.tokens.fontSize);
  const lineHeight = useDesignerStore((s) => s.tokens.lineHeight);

  // Append-Funktion (ohne Overwrite)
  const appendSectionsAtEnd = useDesignerStore((s) => s.appendSectionsAtEnd);
  const elements = useDesignerStore((s) => s.elements);

  // Rohdaten aus dem Generator
  const ll = useLebenslauf();

  const handleImportNow = useCallback(() => {
    try {
      if (!ll) {
        alert("Keine Lebenslaufdaten im Context gefunden.");
        return;
      }
      const base = buildSectionsFromLebenslauf(ll);
      if (!base.length) {
        alert("Im Lebenslauf sind derzeit keine importierbaren Daten.");
        return;
      }
      const split = base.flatMap((sec) =>
        splitSectionByPage(
          sec,
          Number(fontSize) || 11,
          A4_H,
          { top: margins.top, bottom: margins.bottom },
          Number(lineHeight) || 1.4
        )
      );

      // Titel der bereits vorhandenen Sections (erste Zeile)
      const haveTitles = new Set(
        elements
          .filter((e) => e.kind === "section")
          .map((e) => (e as any).text?.split("\n")[0]?.trim().toLowerCase())
          .filter(Boolean)
      );
      const missing = split.filter((s) => !haveTitles.has((s.title || "").toLowerCase()));
      if (!missing.length) {
        alert("Alle Sektionen sind bereits vorhanden – nichts zu importieren.");
        return;
      }
      appendSectionsAtEnd(missing);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Re-Import fehlgeschlagen.");
    }
  }, [ll, appendSectionsAtEnd, elements, fontSize, lineHeight, margins.top, margins.bottom]);

  return (
    <div className="flex items-center gap-2 px-2 py-2 border-b bg-white">
      <button className="px-2 py-1.5 border rounded" onClick={() => addSection()}>
        + Section
      </button>
      <button className="px-2 py-1.5 border rounded" onClick={() => addPhoto()}>
        + Foto
      </button>

      <div className="mx-2 h-6 w-px bg-gray-200" />

      <button className="px-2 py-1.5 border rounded" onClick={undo} title="Undo ⌘/Ctrl+Z">
        Undo ⌘/Ctrl+Z
      </button>
      <button className="px-2 py-1.5 border rounded" onClick={redo} title="Redo ⇧⌘/Ctrl+Z">
        Redo ⇧⌘/Ctrl+Z
      </button>

      <div className="mx-2 h-6 w-px bg-gray-200" />

      <button className="px-2 py-1.5 border rounded" onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}>
        −
      </button>
      <span className="min-w-[48px] text-center">{Math.round(zoom * 100)}%</span>
      <button className="px-2 py-1.5 border rounded" onClick={() => setZoom(Math.min(3, zoom + 0.1))}>
        +
      </button>
      <button className="px-2 py-1.5 border rounded" onClick={() => setZoom(1)}>
        Reset
      </button>

      <div className="mx-2 h-6 w-px bg-gray-200" />

      <label className="text-sm flex items-center gap-2">
        Snap:
        <input
          type="number"
          className="w-16 border rounded px-1 py-0.5"
          value={snap}
          min={1}
          onChange={(e) => setSnap(Number(e.target.value || 1))}
        />
        px
      </label>

      <div className="mx-2 h-6 w-px bg-gray-200" />

      <button className="px-2 py-1.5 border rounded text-red-600" onClick={deleteSelected} title="Entf/Backspace">
        Delete
      </button>

      <div className="mx-2 h-6 w-px bg-gray-200" />

      <button className="px-2 py-1.5 border rounded" onClick={handleImportNow} title="Rohdaten importieren (append)">
        Re-Import aus Generator
      </button>
    </div>
  );
}
