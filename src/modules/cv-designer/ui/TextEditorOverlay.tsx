import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { fabricToDomRect } from "../utils/fabricToDomRect";
import { useDesignerStore, type SectionType } from "../store/designerStore";

type OverlayProps = {
  canvas: any;                // fabric.Canvas
  containerEl: HTMLElement;   // der Wrapper um das <canvas>
  group: any;                 // fabric.Group (Section)
  textbox: any;               // fabric.Textbox (Part)
  // Metadaten:
  sectionId: string;
  sectionType: SectionType;
  fieldType: string;          // z.B. "title" | "company" | "period" | "bullet"
  onClose: (committed: boolean) => void;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function TextEditorOverlay(props: OverlayProps) {
  const { canvas, containerEl, textbox, group, sectionId, sectionType, fieldType, onClose } = props;

  const ref = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState({ left: 0, top: 0, width: 80, height: 24 });
  const [value, setValue] = useState<string>(textbox?.text ?? "");
  const [applyGlobal, setApplyGlobal] = useState<boolean>(false);

  // Store actions
  const updatePartText = useDesignerStore(s => s.updatePartText);
  const updatePartStyleLocal = useDesignerStore(s => s.updatePartStyleLocal);
  const setGlobalFieldStyle = useDesignerStore(s => s.setGlobalFieldStyle);
  const tokens = useDesignerStore(s => s.tokens);

  // Paddings/Indent aus textbox.data spiegeln
  const pads = useMemo(() => {
    const d = textbox?.data || {};
    return {
      padL: Number(d.padL ?? 16),
      padT: Number(d.padT ?? 12),
      padR: Number(d.padR ?? 16),
      padB: Number(d.padB ?? 12),
      indentPx: Number(d.indentPx ?? 0),
      lineHeight: Number(d.lineHeight ?? textbox?.lineHeight ?? tokens?.lineHeight ?? 1.4),
    };
  }, [textbox, tokens]);

  // Style-Parität (CSS) zum Fabric-Textbox-Stil
  const css = useMemo<React.CSSProperties>(() => {
    const fontSize = Number(textbox?.fontSize ?? 12);
    const lineHeight = Number(textbox?.lineHeight ?? pads.lineHeight ?? 1.4);

    // Fabric charSpacing ist in 1/1000 Em. CSS letter-spacing in px.
    const charSpacing = Number(textbox?.charSpacing ?? 0);
    const letterSpacingPx = (charSpacing / 1000) * fontSize;

    return {
      position: "absolute",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      minHeight: `${Math.max(20, rect.height)}px`,
      paddingLeft: `${pads.padL + pads.indentPx}px`,
      paddingRight: `${pads.padR}px`,
      paddingTop: `${pads.padT}px`,
      paddingBottom: `${pads.padB}px`,
      outline: "2px solid rgba(59,130,246,0.5)",
      background: "rgba(255,255,255,0.95)",
      borderRadius: 4,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      color: textbox?.fill || "#000",
      fontFamily: textbox?.fontFamily || tokens?.fontFamily || "Arial, sans-serif",
      fontSize: `${fontSize}px`,
      fontWeight: (textbox?.fontWeight as any) || "normal",
      fontStyle: (textbox?.fontStyle as any) || "normal",
      lineHeight: String(lineHeight),
      letterSpacing: `${letterSpacingPx}px`,
      textAlign: (textbox?.textAlign as any) || "left",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      overflowWrap: "anywhere",
    };
  }, [rect, pads, textbox, tokens]);

  // Overlay positionieren (und bei Zoom/Scroll aktualisieren)
  const updateRect = () => {
    if (!canvas || !textbox || !containerEl) return;
    const r = fabricToDomRect(canvas, textbox, containerEl);
    // Wir geben dem Editor ein bisschen mehr Breite, damit Padding reinpasst
    setRect({
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
    });
  };

  useLayoutEffect(() => {
    updateRect();
    const handler = () => updateRect();
    const win = window;
    canvas.on("after:render", handler);
    win.addEventListener("resize", handler);
    win.addEventListener("scroll", handler, true);
    return () => {
      canvas.off("after:render", handler);
      win.removeEventListener("resize", handler);
      win.removeEventListener("scroll", handler, true);
    };
  }, [canvas, textbox, containerEl]);

  // Canvas-Locking: Interaktionen ausschalten
  useEffect(() => {
    const prevSkip = canvas.skipTargetFind;
    const prevSel = canvas.selection;
    canvas.skipTargetFind = true;
    canvas.selection = false;

    // Textbox leicht transparent, damit kein Doppelbild
    const prevOpacity = textbox.opacity;
    textbox.set({ opacity: 0.05 });
    canvas.requestRenderAll();

    return () => {
      canvas.skipTargetFind = prevSkip;
      canvas.selection = prevSel;
      textbox.set({ opacity: prevOpacity ?? 1 });
      canvas.requestRenderAll();
    };
  }, [canvas, textbox]);

  // Live-Preview (debounced)
  useEffect(() => {
    const h = setTimeout(() => {
      try {
        // Text live in Store & Fabric schreiben (Achtung: Store-API ist pro fieldType – wirkt auf alle Parts gleichen Typs in der Sektion)
        updatePartText(sectionId, fieldType as any, value);
      } catch {}
    }, 140);
    return () => clearTimeout(h);
  }, [value, sectionId, fieldType, updatePartText]);

  // Keyboard steuern
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Enter" && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        onCommit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose(false);
      } else if (e.key === "Tab") {
        // Indent per Tab
        e.preventDefault();
        const delta = e.shiftKey ? -12 : +12;
        applyStyle({ indentPx: clamp((textbox?.data?.indentPx ?? 0) + delta, 0, 200) });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [textbox]);

  const onCommit = () => {
    // commit ist bereits über debounced Text-Update im Store; wir schließen nur
    onClose(true);
  };

  // Toolbar-Style-Update (lokal oder global)
  const applyStyle = (patch: Partial<{
    fontWeight: "normal" | "bold";
    fontStyle: "normal" | "italic";
    fontSize: number;
    lineHeight: number;
    color: string;
    letterSpacing: number; // in px
    indentPx: number;
  }>) => {
    // letterSpacing in px -> em für unseren Store (PartStyle.letterSpacing ist em)
    const pxFont = Number(textbox?.fontSize ?? 12);
    const normalized: any = { ...patch };
    if (patch.letterSpacing != null) {
      normalized.letterSpacing = Number(patch.letterSpacing) / Math.max(1, pxFont);
    }
    if (applyGlobal) {
      // globale Vorlage pro sectionType + fieldType
      const tPatch: any = {};
      if (normalized.fontFamily != null) tPatch.fontFamily = normalized.fontFamily;
      if (normalized.fontSize != null) tPatch.fontSize = normalized.fontSize;
      if (normalized.lineHeight != null) tPatch.lineHeight = normalized.lineHeight;
      if (normalized.color != null) tPatch.color = normalized.color;
      if (normalized.fontWeight != null) tPatch.fontWeight = normalized.fontWeight as any;
      if (normalized.fontStyle != null) tPatch.fontStyle = normalized.fontStyle as any;
      if (normalized.letterSpacing != null) tPatch.letterSpacing = normalized.letterSpacing;
      // indentPx ist Layout-Attribut, nicht typografisch – global erlauben wir's bewusst NICHT
      setGlobalFieldStyle(sectionType, fieldType, tPatch);
    } else {
      // lokal nur diesen Part-Typ in dieser Sektion (Store-API granular per fieldType)
      const localPatch: any = {};
      if (normalized.fontSize != null) localPatch.fontSize = normalized.fontSize;
      if (normalized.color != null) localPatch.color = normalized.color;
      if (normalized.fontWeight != null) localPatch.fontWeight = normalized.fontWeight as any;
      if (normalized.fontStyle != null) {
        if (normalized.fontStyle === "italic") localPatch.italic = true;
        else localPatch.italic = false;
      }
      if (normalized.lineHeight != null) localPatch.lineHeight = normalized.lineHeight;
      if (normalized.letterSpacing != null) localPatch.letterSpacing = normalized.letterSpacing;
      updatePartStyleLocal(sectionId, fieldType as any, localPatch);

      // indentPx ist in textbox.data; wir patchen direkt das textbox.data und reflow passiert durch Text-Update/Nach-Render
      if (normalized.indentPx != null) {
        const nextIndent = clamp(Number(normalized.indentPx), 0, 200);
        textbox.data = { ...(textbox.data || {}), indentPx: nextIndent };
        canvas.requestRenderAll();
      }
    }
  };

  // Fokus ins Editorfeld
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      placeCaretAtEnd(ref.current);
    }
  }, []);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: css.left as number,
          top: (css.top as number) - 36, // Toolbar über dem Feld
          height: 32,
          display: "flex",
          gap: 8,
          alignItems: "center",
          padding: "4px 8px",
          background: "rgba(28,28,30,0.95)",
          color: "#fff",
          borderRadius: 6,
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
      >
        <button onClick={() => applyStyle({ fontWeight: (textbox?.fontWeight === "bold" ? "normal" : "bold") as any })} title="Fett (Ctrl+B)">
          <b>B</b>
        </button>
        <button onClick={() => applyStyle({ fontStyle: (textbox?.fontStyle === "italic" ? "normal" : "italic") as any })} title="Kursiv (Ctrl+I)">
          <i>I</i>
        </button>
        <button onClick={() => applyStyle({ fontSize: clamp((textbox?.fontSize ?? 12) + 1, 8, 72) })} title="Größer">
          A+
        </button>
        <button onClick={() => applyStyle({ fontSize: clamp((textbox?.fontSize ?? 12) - 1, 8, 72) })} title="Kleiner">
          A-
        </button>
        <button onClick={() => applyStyle({ lineHeight: clamp(Number(textbox?.lineHeight ?? 1.4) + 0.1, 1, 3) })} title="Zeilenhöhe +">
          LH+
        </button>
        <button onClick={() => applyStyle({ lineHeight: clamp(Number(textbox?.lineHeight ?? 1.4) - 0.1, 1, 3) })} title="Zeilenhöhe -">
          LH-
        </button>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span>Farbe</span>
          <input
            type="color"
            defaultValue={toColorHex(textbox?.fill || "#000000")}
            onChange={(e) => applyStyle({ color: e.target.value })}
          />
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span>Einzug</span>
          <button onClick={() => applyStyle({ indentPx: (textbox?.data?.indentPx ?? 0) - 12 })}>-</button>
          <button onClick={() => applyStyle({ indentPx: (textbox?.data?.indentPx ?? 0) + 12 })}>+</button>
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={applyGlobal}
            onChange={(e) => setApplyGlobal(e.target.checked)}
          />
          <span>Auf alle anwenden</span>
        </label>
        <div style={{ marginLeft: 8, opacity: 0.8 }}>ESC: Abbrechen · Ctrl+Enter: Speichern</div>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        style={css}
        onInput={(e) => setValue((e.target as HTMLDivElement).innerText)}
        onBlur={() => onCommit()}
        onPaste={(e) => {
          // Plain-Text only
          e.preventDefault();
          const text = (e.clipboardData || (window as any).clipboardData).getData("text/plain");
          document.execCommand("insertText", false, text);
        }}
      >
        {value}
      </div>
    </>
  );
}

// Hilfsfunktionen
function placeCaretAtEnd(el: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

function toColorHex(input: string): string {
  // akzeptiert bereits hex oder rgb(a)
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(input)) return input;
  const m = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return "#000000";
  const r = Number(m[1]).toString(16).padStart(2, "0");
  const g = Number(m[2]).toString(16).padStart(2, "0");
  const b = Number(m[3]).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}
