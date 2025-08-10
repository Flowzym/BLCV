import React, { useEffect, useRef, useState } from "react";
import type { fabric } from "fabric";
import { fabricToDomRect } from "../utils/fabricToDomRect";
import { useDesignerStore } from "../store/designerStore";

type OverlayProps = {
  canvas: fabric.Canvas;
  containerEl: HTMLElement;
  onClose: () => void;
};

type LocalStyle = {
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  letterSpacing?: number; // UI in em, Fabric expects charSpacing in 1/1000 em
  bold?: boolean;
  italic?: boolean;
  indentPx?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Helper: resolve current textbox & its group from fabric active object (supports subtargets)
function getActiveTextbox(canvas: fabric.Canvas) {
  const active = canvas.getActiveObject() as any;
  if (!active) return null;
  // If a group is active and a subtarget is stored
  const sub = (canvas as any)._hoveredTarget || (active._objects && active._objects.find((o: any) => o.type === "textbox"));
  if (active.type === "textbox") {
    return { textbox: active as fabric.Textbox, group: active.group as fabric.Group | undefined };
  }
  if (sub && sub.type === "textbox") {
    return { textbox: sub as fabric.Textbox, group: sub.group as fabric.Group | undefined };
  }
  // Fallback: first textbox inside group
  if (active.type === "group" && (active as fabric.Group)._objects?.length) {
    const t = (active as any)._objects.find((o: any) => o.type === "textbox");
    if (t) return { textbox: t as fabric.Textbox, group: active as fabric.Group };
  }
  return null;
}

export default function TextEditorOverlay({ canvas, containerEl, onClose }: OverlayProps) {
  const setGlobalFieldStyle = useDesignerStore((s) => s.setGlobalFieldStyle);
  const bump = useDesignerStore((s) => s.bump);

  const [style, setStyle] = useState<LocalStyle>({
    fontFamily: undefined,
    fontSize: 12,
    lineHeight: 1.2,
    color: "#000000",
    letterSpacing: 0,
    bold: false,
    italic: false,
    indentPx: 0,
  });

  const [sectionType, setSectionType] = useState<string>("");
  const [fieldType, setFieldType] = useState<string>("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<{ textbox: fabric.Textbox; group?: fabric.Group } | null>(null);

  // Keep overlay bound to the currently selected textbox (live)
  useEffect(() => {
    const updateFromSelection = () => {
      const ref = getActiveTextbox(canvas);
      if (!ref) return;
      currentRef.current = ref;

      const tb: any = ref.textbox;
      setSectionType(tb.data?.sectionType || "");
      setFieldType(tb.data?.fieldType || "");

      setStyle({
        fontFamily: tb.fontFamily ?? undefined,
        fontSize: Number(tb.fontSize ?? 12),
        lineHeight: Number(tb.lineHeight ?? 1.2),
        color: tb.fill ?? "#000000",
        letterSpacing: Number(tb.charSpacing ?? 0) / 1000,
        bold: (tb.fontWeight as any) === "bold",
        italic: (tb.fontStyle as any) === "italic",
        indentPx: Number(tb.data?.indentPx ?? 0),
      });
    };

    updateFromSelection();
    canvas.on("selection:created", updateFromSelection);
    canvas.on("selection:updated", updateFromSelection);
    canvas.on("selection:cleared", onClose);

    return () => {
      canvas.off("selection:created", updateFromSelection);
      canvas.off("selection:updated", updateFromSelection);
      canvas.off("selection:cleared", onClose);
    };
  }, [canvas, onClose]);

  // Reposition overlay on render/resize
  useEffect(() => {
    const reposition = () => {
      if (!overlayRef.current || !currentRef.current) return;
      const { textbox } = currentRef.current;
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
  }, [canvas, containerEl]);

  const applyLocal = () => {
    const ref = currentRef.current;
    if (!ref) return;
    const { textbox, group } = ref;
    const next: Partial<fabric.Textbox> = {};
    if (style.fontFamily) next.fontFamily = style.fontFamily as any;
    if (Number.isFinite(style.fontSize)) next.fontSize = clamp(style.fontSize!, 6, 72) as any;
    if (Number.isFinite(style.lineHeight)) next.lineHeight = clamp(style.lineHeight!, 0.8, 2) as any;
    if (style.color) next.fill = style.color as any;
    if (Number.isFinite(style.letterSpacing)) next.charSpacing = Math.round((style.letterSpacing || 0) * 1000) as any;
    next.fontWeight = style.bold ? ("bold" as any) : ("normal" as any);
    next.fontStyle = style.italic ? ("italic" as any) : ("" as any);

    const padL = Number((textbox as any).data?.padL ?? 0);
    const padR = Number((textbox as any).data?.padR ?? 0);
    const indentPx = clamp(Number(style.indentPx ?? 0), 0, 200);
    (textbox as any).data = { ...(textbox as any).data, indentPx };

    const g = group || textbox.group;
    const groupWidth = (g?.width ?? 0) * (g?.scaleX ?? 1);
    const contentWidth = Math.max(1, groupWidth - padL - padR - indentPx);
    const halfW = groupWidth / 2;
    const tlX = -halfW + padL + indentPx;

    (textbox as any).set({ ...next, left: tlX, width: contentWidth, scaleX: 1, scaleY: 1 });
    (textbox as any)._clearCache?.();
    (textbox as any).initDimensions?.();
    (textbox as any).setCoords();
    g?.setCoords();
    canvas.requestRenderAll();
  };

  const applyGlobal = () => {
    if (!sectionType || !fieldType) return;
    setGlobalFieldStyle(sectionType as any, fieldType as any, {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      color: style.color,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      bold: !!style.bold,
      italic: !!style.italic,
    } as any);
    bump();
    onClose();
  };

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
