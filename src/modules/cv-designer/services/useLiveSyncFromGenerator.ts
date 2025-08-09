import { useEffect, useMemo, useRef } from "react";
import { useLebenslauf } from "@/components/LebenslaufContext";
import { useDesignerStore } from "../store/designerStore";
import { buildSectionsFromLebenslauf, splitSectionByPage } from "./mapLebenslaufToSections";

// einfache Vorlagen-Frames (P0). Kannst du später aus Template-Registry speisen.
const PAGE_W = 595;
const MARGIN = { top: 36, right: 36, bottom: 36, left: 36 };
const COL_W = (PAGE_W - MARGIN.left - MARGIN.right);
const LEFT_X = MARGIN.left;
const RIGHT_X = MARGIN.left + COL_W * 0.62;

function frameFor(title: string, idx: number) {
  const t = title.toLowerCase();
  // exemplarisches Layout: Kontakt rechts oben, Rest links untereinander
  if (t.startsWith("kontakt")) {
    return { x: RIGHT_X, y: MARGIN.top, width: Math.round(COL_W * 0.34), height: 140 };
  }
  const baseY = 120 + idx * 140;
  return { x: LEFT_X, y: MARGIN.top + baseY, width: Math.round(COL_W * 0.6), height: 120 };
}

function firstLine(s?: string) {
  return (s || "").split("\n")[0]?.trim() || "";
}

/**
 * Live-Sync:
 * - mappt Rohdaten → Sections
 * - chunkt in Seiten (fontSize/lineHeight/margins)
 * - updated bestehende Boxen (per Titel-Match) oder fügt neue hinzu
 * - kein Button nötig
 */
export function useLiveSyncFromGenerator(debounceMs = 200) {
  const ll = useLebenslauf();
  const elements = useDesignerStore((s) => s.elements);
  const margins = useDesignerStore((s) => s.margins);
  const tokens = useDesignerStore((s) => s.tokens);

  const addSection = useDesignerStore((s) => s.addSection);
  const updateText = useDesignerStore((s) => s.updateText);
  const setInitial = useDesignerStore((s) => s.setInitialElementsFromSections);

  // debounce
  const timer = useRef<number | null>(null);
  const depsHash = useMemo(() => JSON.stringify({ ll, margins, tokens }), [ll, margins, tokens]);

  useEffect(() => {
    if (!ll) return;

    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const base = buildSectionsFromLebenslauf(ll);
      const fontSize = Number(tokens?.fontSize) || 11;
      const lineHeight = Number(tokens?.lineHeight) || 1.4;
      const pageH = 842;

      const split = base.flatMap((sec) =>
        splitSectionByPage(
          sec,
          fontSize,
          pageH,
          { top: margins.top, bottom: margins.bottom },
          lineHeight
        )
      );

      // Map vorhandener Titel → Element-ID (wir trennen Titel & Inhalt in zwei Boxen: Header + Body)
      const byTitleHeader = new Map<string, string>();
      const byTitleBody = new Map<string, string>();
      for (const el of elements) {
        if (el.kind !== "section") continue;
        const tl = firstLine((el as any).text).toLowerCase();
        // Heuristik: Header-Zeilen sind sehr kurz (<= 35) und stehen alleine
        if (tl && (el as any).text.split("\n").length === 1 && (el as any).text.length <= 35) {
          byTitleHeader.set(tl, el.id);
        } else if (tl) {
          byTitleBody.set(tl, el.id);
        }
      }

      const toAdd: Array<{ title?: string; content?: string; frame?: any }> = [];

      split.forEach((s, idx) => {
        const title = (s.title || "").trim();
        const headerId = byTitleHeader.get(title.toLowerCase());
        const bodyId = byTitleBody.get(title.toLowerCase());
        const headerText = title;
        const bodyText = s.content || "";

        // Header (einzeilig, eigenständige Box)
        if (headerId) {
          useDesignerStore.getState().updateText(headerId, headerText);
        } else {
          toAdd.push({
            title,
            content: headerText,
            frame: { ...frameFor(title, idx), height: 22 }, // kompakter Header
          });
        }

        // Body (eigene Box)
        if (bodyId) {
          updateText(bodyId, bodyText ? `${title}\n${bodyText}` : title);
        } else {
          toAdd.push({
            title,
            content: bodyText ? `${title}\n${bodyText}` : title,
            frame: { ...frameFor(title, idx + 1) },
          });
        }
      });

      if (!elements.length && toAdd.length) {
        // Erstinitialisierung → sauber setzen (kein n+1 jitter)
        setInitial(toAdd);
      } else {
        // sonst anhängen
        for (const item of toAdd) {
          addSection({ text: item.content, frame: item.frame });
        }
      }
    }, debounceMs) as unknown as number;

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsHash, elements.length]);
}
