// src/modules/cv-designer/ui/TextEditorOverlay.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { fabric } from "fabric";
import { fabricToDomRect } from "../utils/fabricToDomRect";
import { useDesignerStore } from "../store/designerStore";

type SectionKind = "experience" | "education" | "profile" | "skills" | "softskills" | "contact";

type OverlayProps = {
  canvas: fabric.Canvas;
  containerEl: HTMLElement;
  group: fabric.Group;
  textbox: (fabric.Textbox & { data?: Record<string, any>; fieldType?: string; sectionId?: string });
  sectionId: string;
  sectionType: SectionKind;
  fieldType: string;
  onClose: () => void;
};

type LocalStyle = {
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  letterSpacing?: number; // UI in em; Fabric erwartet 1/1000 em
  bold?: boolean;
  italic?: boolean;
  indentPx?: number; // zusätzlicher Einzug links (px)
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function TextEditorOverlay(props: OverlayProps) {
  const { canvas, containerEl, group, textbox, sectionId, sectionType, fieldType, onClose } = props;

  const updatePartStyleLocal = useDesignerStore((s) => s.updatePartStyleLocal);
  const setGlobalFieldStyle = useDesignerStore((s) => s.setGlobalFieldStyle);
  const bump = useDesignerStore((s) => s.bump);

  const [style, setStyle] = useState<LocalStyle>(() => {
    const tb: any = textbox || {};
    return {
      fontFamily: tb.fontFamily ?? undefined,
      fontSize: Number(tb.fontSize ?? 12),
      lineHeight: Number(tb.lineHeight ?? 1.2),
      color: tb.fill ?? "#000000",
      letterSpacing: Number(tb.charSpacing ?? 0) / 1000,
      bold: (tb.fontWeight as any) === "bold",
      italic: (tb.fontStyle as any) === "italic",
      indentPx: Number(tb.data?.indentPx ?? 0),
    };
  });

  const overlayRef = useRef<HTMLDivElement>(null);

  // Overlay positioniert sich an der Textbox (Canvas → DOM)
  useEffect(() => {
    const reposition = () => {
      if (!overlayRef.current) return;
      const rect = fabricToDomRect(canvas, textbox, containerEl);
      overlayRef.current.style.left = `${rect.left}px`;
      overlayRef.current.style.top = `${Math.max(0, rect.top - 48)}px`;
      overlayRef.current.style.width = `${rect.width}px`;
    };
    reposition();
    const handler = () => reposition();
    canvas.on("after:render", handler);
    window.addEventListener("resize", handler);
    return () => {
      canvas.off("after:render", handler);
      window.removeEventListener("resize", handler);
    };
  }, [canvas, textbox, containerEl]);

  // Sofortiger, lokaler Reflow (Canvas) + Persistenz im Store (Sektion, Feldtyp)
  const applyLocal = () => {
    // 1) Store aktualisieren → persistenter Stil innerhalb dieser Sektion
    updatePartStyleLocal(sectionId, fieldType as any, {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      color: style.color,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      fontWeight: style.bold ? "bold" : "normal",
      italic: !!style.italic,
    } as any);

    // 2) Sofortiger visueller Reflow der aktuell editierten Textbox (ohne Skalierung!)
    const tb: any = textbox;
    const grp: any = group;

    const padL = Number(tb?.data?.padL ?? 0);
    const padR = Number(tb?.data?.padR ?? 0);
    const indentPx = clamp(Number(style.indentPx ?? tb?.data?.indentPx ?? 0), 0, 200);

    tb.data = { ...(tb.data || {}), indentPx };

    const groupWidth = (grp?.width ?? 0) * (grp?.scaleX ?? 1);
    const contentWidth = Math.max(1, groupWidth - padL - padR - indentPx);
    const halfW = groupWidth / 2;
    const tlX = -halfW + padL + indentPx;

    const patch: Partial<fabric.Textbox> = {
      fontFamily: style.fontFamily as any,
      fontSize: clamp(Number(style.fontSize ?? 12), 6, 72) as any,
      lineHeight: clamp(Number(style.lineHeight ?? 1.2), 0.8, 2) as any,
      fill: style.color as any,
      charSpacing: Math.round(Number(style.letterSpacing ?? 0) * 1000) as any,
      fontWeight: (style.bold ? "bold" : "normal") as any,
      fontStyle: (style.italic ? "italic" : "") as any,
      left: tlX,
      width: contentWidth,
      scaleX: 1,
      scaleY: 1,
    };

    tb.set(patch);
    tb._clearCache?.();
    tb.initDimensions?.();
    tb.setCoords();
    grp?.setCoords();
    canvas.requestRenderAll();
  };

  // Global anwenden für alle Felder dieses Typs in allen Sektionen gleichen Typs
  const applyGlobal = () => {
    setGlobalFieldStyle(sectionType as any, fieldType, {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      color: style.color,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      bold: !!style.bold,
      italic: !!style.italic,
    } as any);
    bump();        // Signalisiert Render-Neuaufbau
    onClose();     // Overlay schließen
  };

  // Shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "enter") {
        e.preventDefault();
        applyGlobal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyGlobal, onClose]);

  return (
    <div
      ref={overlayRef}
      className="absolute z-50 pointer-events-auto flex items-center gap-2 p-2 bg-white/95 shadow-xl rounded-2xl"
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-xs text-gray-500 px-2">{sectionType}:{fieldType}</span>

      <select
        className="border rounded-md px-2 py-1"
        value={style.fontFamily || ""}
        onChange={(e) => setStyle((s) => ({ ...s, fontFamily: e.target.value }))}
      >
        <option value="">(inherit)</option>
        <option>Arial</option>
        <option>Helvetica</option>
        <option>Times New Roman</option>
        <option>Georgia</option>
        <option>Verdana</option>
        <option>Tahoma</option>
        <option>Segoe UI</option>
        <option>Roboto</option>
        <option>Open Sans</option>
      </select>

      <label className="flex items-center gap-1 text-sm">
        Sz
        <input
          className="w-16 border rounded-md px-2 py-1"
          type="number" min={6} max={72} step={1}
          value={style.fontSize ?? 12}
          onChange={(e) => setStyle((s) => ({ ...s, fontSize: Number(e.target.value) }))}
        />
      </label>

      <label className="flex items-center gap-1 text-sm">
        LH
        <input
          className="w-16 border rounded-md px-2 py-1"
          type="number" min={0.8} max={2} step={0.05}
          value={style.lineHeight ?? 1.2}
          onChange={(e) => setStyle((s) => ({ ...s, lineHeight: Number(e.target.value) }))}
        />
      </label>

      <label className="flex items-center gap-1 text-sm">
        Letter
        <input
          className="w-16 border rounded-md px-2 py-1"
          type="number" min={-0.2} max={0.5} step={0.01}
          value={style.letterSpacing ?? 0}
          onChange={(e) => setStyle((s) => ({ ...s, letterSpacing: Number(e.target.value) }))}
        />
      </label>

      <label className="flex items-center gap-1 text-sm">
        Indent
        <input
          className="w-20 border rounded-md px-2 py-1"
          type="number" min={0} max={200} step={1}
          value={style.indentPx ?? 0}
          onChange={(e) => setStyle((s) => ({ ...s, indentPx: Number(e.target.value) }))}
        />
      </label>

      <label className="flex items-center gap-1 text-sm">
        <input
          className="border rounded"
          type="checkbox"
          checked={!!style.bold}
          onChange={(e) => setStyle((s) => ({ ...s, bold: e.target.checked }))}
        />
        <span className="font-semibold">B</span>
      </label>

      <label className="flex items-center gap-1 text-sm">
        <input
          className="border rounded"
          type="checkbox"
          checked={!!style.italic}
          onChange={(e) => setStyle((s) => ({ ...s, italic: e.target.checked }))}
        />
        <span className="italic">I</span>
      </label>

      <input
        className="w-10 h-10 p-0 border rounded-md"
        type="color"
        value={typeof style.color === "string" ? style.color : "#000000"}
        onChange={(e) => setStyle((s) => ({ ...s, color: e.target.value }))}
      />

      <button onClick={applyLocal} className="px-3 py-1 rounded-lg border bg-gray-50 hover:bg-gray-100">
        Anwenden (lokal)
      </button>
      <button
        onClick={applyGlobal}
        className="px-3 py-1 rounded-lg border bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold"
        title={`Auf alle ${sectionType}:${fieldType} anwenden`}
      >
        Global anwenden
      </button>
      <button onClick={onClose} className="px-3 py-1 rounded-lg border bg-gray-50 hover:bg-gray-100">
        Schließen
      </button>
    </div>
  );
}
