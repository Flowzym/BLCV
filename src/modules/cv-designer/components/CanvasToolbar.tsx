import React, { useCallback, useEffect } from "react";
import { useDesignerStore } from "../store/designerStore";
import { useLebenslauf } from "@/components/LebenslaufContext";
import { buildSectionsFromLebenslauf, splitSectionByPage } from "../services/mapLebenslaufToSections";

const A4_H = 842;

function firstLineOf(text?: string) {
  return (text || "").split("\n")[0]?.trim() || "";
}

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

  const margins = useDesignerStore((s) => s.margins);
  const fontSize = useDesignerStore((s) => s.tokens.fontSize);
  const lineHeight = useDesignerStore((s) => s.tokens.lineHeight);

  const appendSectionsAtEnd = useDesignerStore((s) => s.appendSectionsAtEnd);
  const updateText = useDesignerStore((s) => s.updateText);
  const elements = useDesignerStore((s) => s.elements);

  const ll = useLebenslauf();

  const handleImportNow = useCallback(() => {
    if (!ll) { alert("Keine Lebenslaufdaten im Context gefunden."); return; }

    const base = buildSectionsFromLebenslauf(ll);
    if (!base.length) { alert("Im Lebenslauf sind derzeit keine importierbaren Daten."); return; }

    const split = base.flatMap((sec) =>
      splitSectionByPage(
        sec,
        Number(fontSize) || 11,
        A4_H,
        { top: margins.top, bottom: margins.bottom },
        Number(lineHeight) || 1.4
      )
    );

    // Map bestehende Sections: title -> elementId
    const byTitle = new Map<string, string>();
    for (const el of elements) {
      if (el.kind !== "section") continue;
      const title = firstLineOf((el as any).text).toLowerCase();
      if (title) byTitle.set(title, el.id);
    }

    const toAppend: Array<{ title?: string; content?: string }> = [];

    for (const s of split) {
      const title = (s.title || "").trim();
      const id = byTitle.get(title.toLowerCase());
      if (id) {
        // UPDATE bestehende Section (nur Textinhalt)
        const nextText = (title ? `${title}\n` : "") + (s.content || "");
        updateText(id, nextText);
      } else {
        // APPEND neue Section
        toAppend.push({ title, content: s.content || "" });
      }
    }

    if (toAppend.length) appendSectionsAtEnd(toAppend);
  }, [ll, elements, fontSize, lineHeight, margins.top, margins.bottom, updateText, appendSectionsAtEnd]);

  const handleDelete = useCallback(() => {
    // 1) Immer erst Canvas-Fallback auslösen (löscht aktive Fabric-Objekte direkt)
    window.dispatchEvent(new Event("bl:delete-active"));
    // 2) Dann Store-basierte Löschung (falls selectedIds noch gesetzt)
    deleteSelected();
  }, [deleteSelected]);

  // Globaler Hotkey: Entf/Backspace → Canvas-Löschung
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        window.dispatchEvent(new Event("bl:delete-active"));
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.shiftKey ? redo() : undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  return (
    <div className="flex items-center gap-2 px-2 py-2 border-b bg-white">
      <button className="px-2 py-1.5 border rounded" onClick={() => addSection()}>+ Section</button>
      <button className="px-2 py-1.5 border rounded" onClick={() => addPhoto()}>+ Foto</button>

      <div className="mx-2 h-6 w-px bg-gray-200" />

      <button className="px-2 py-1.5 border rounded" onClick={undo} title="Undo ⌘/Ctrl+Z">Undo ⌘/Ctrl+Z</button>
      <button className="px-2 py-1.5 border rounded" onClick={redo} title="Redo ⇧⌘/Ctrl+Z">Redo ⇧⌘/Ctrl+Z</button>

      <div className="mx-2 h-6 w-px bg-gray-200" />

      <button className="px-2 py-1.5 border rounded" onClick={() => setZoom(zoom - 0.1)}>-</button>
      <span className="w-14 text-center">{Math.round((zoom || 1) * 100)}%</span>
      <button className="px-2 py-1.5 border rounded" onClick={() => setZoom(zoom + 0.1)}>+</button>
      <button className="px-2 py-1.5 border rounded" onClick={() => setZoom(1)}>Reset</button>

      <label className="ml-2 text-sm text-gray-600">
        Snap:
        <input
          type="number"
          className="w-16 border rounded px-1 py-0.5 ml-1"
          value={snap}
          min={1}
          onChange={(e) => setSnap(Number(e.target.value || 1))}
        />
        px
      </label>

      <div className="mx-2 h-6 w-px bg-gray-200" />

      <button className="px-2 py-1.5 border rounded text-red-600" onClick={handleDelete} title="Entf/Backspace">
        Delete
      </button>

      <div className="mx-2 h-6 w-px bg-gray-200" />

      <button className="px-2 py-1.5 border rounded" onClick={handleImportNow} title="Rohdaten importieren (update/append)">
        Re-Import aus Generator
      </button>
    </div>
  );
}
