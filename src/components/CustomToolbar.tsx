import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type ReactQuill from 'react-quill';

/**
 * CustomToolbar (vollständig, nicht-kompakt)
 * - Keine Overflow/„Mehr“-Logik: alle Buttons sind immer sichtbar (mit Wrap bei kleiner Breite).
 * - Behebt NaN-Warnungen beim Zoom (sichere Defaults).
 * - Definiert alle Handler lokal (keine undefinierten Referenzen).
 * - Nutzt Quill API defensiv (try/catch & optionale Ketten).
 */

interface CustomToolbarProps {
  quillRef: React.RefObject<ReactQuill>;
  onUndo: () => void;
  onRedo: () => void;
  onSelectAll: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onPrint: () => void;
  onTemplates: () => void;
  onSettings: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  minZoom: number;
  maxZoom: number;
  clipboardError?: string;
}

/* -------------------- Icon Components -------------------- */
const UndoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6" />
    <path d="M1 10l3.586-3.586a2 2 0 0 1 2.828 0L10 9" />
    <path d="M7 7a8 8 0 1 1 8 8" />
  </svg>
);

const RedoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6" />
    <path d="M23 10l-3.586-3.586a2 2 0 0 0-2.828 0L14 9" />
    <path d="M17 7a8 8 0 1 0-8 8" />
  </svg>
);

const BoldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);

const ItalicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

const UnderlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
    <line x1="4" y1="21" x2="20" y2="21" />
  </svg>
);

const StrikeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4H9a3 3 0 0 0-2.83 4" />
    <path d="M14 12a4 4 0 0 1 0 8H6" />
    <line x1="4" y1="12" x2="20" y2="12" />
  </svg>
);

const ListOrderedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6" />
    <line x1="10" y1="12" x2="21" y2="12" />
    <line x1="10" y1="18" x2="21" y2="18" />
    <path d="M4 6h1v4" />
    <path d="M4 10h2" />
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
  </svg>
);

const ListBulletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const IndentDecreaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="7,8 3,12 7,16" />
    <line x1="21" y1="12" x2="11" y2="12" />
    <line x1="21" y1="6" x2="11" y2="6" />
    <line x1="21" y1="18" x2="11" y2="18" />
  </svg>
);

const IndentIncreaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,8 7,12 3,16" />
    <line x1="21" y1="12" x2="11" y2="12" />
    <line x1="21" y1="6" x2="11" y2="6" />
    <line x1="21" y1="18" x2="11" y2="18" />
  </svg>
);

const AlignLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="17" y1="18" x2="3" y2="18" />
  </svg>
);

const AlignCenterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="10" x2="6" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="18" y1="18" x2="6" y2="18" />
  </svg>
);

const AlignRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" y1="10" x2="7" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="21" y1="18" x2="7" y2="18" />
  </svg>
);

const AlignJustifyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="21" y1="18" x2="3" y2="18" />
  </svg>
);

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />
  </svg>
);

const QuoteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </svg>
);

const CleanIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 21h10" />
    <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
    <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.4 2.4 0 0 1 .6 3.2" />
  </svg>
);

const SelectAllIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-4" />
    <path d="M19 3H9a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
  </svg>
);

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const PasteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const PrintIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 6,2 18,2 18,9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const TemplatesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 0 1-8 0 4 4 0 0 1 8 0zM7 21a4 4 0 0 1 0-8 4 4 0 0 1 0 8z" />
  </svg>
);

const ZoomInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const LineHeightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M3 12h18" />
    <path d="M3 18h18" />
    <path d="M21 4v2" />
    <path d="M21 10v2" />
    <path d="M21 16v2" />
  </svg>
);

const ExportIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
/* -------------------- End Icons -------------------- */

export default function CustomToolbar({
  quillRef,
  onUndo,
  onRedo,
  onSelectAll,
  onCopy,
  onPaste,
  onPrint,
  onTemplates,
  onSettings,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoom,
  onZoomChange,
  minZoom,
  maxZoom,
  clipboardError
}: CustomToolbarProps) {
  // Safe Zoom values to avoid NaN warnings
  const safeMin = Number.isFinite(minZoom) ? minZoom : 50;
  const safeMax = Number.isFinite(maxZoom) ? maxZoom : 200;
  const safeZoom = Number.isFinite(zoom) ? zoom : 100;
  const displayZoom = Math.round(safeZoom);

  const [buttonStates, setButtonStates] = useState<{ [key: string]: boolean }>({});
  const [currentTextColor, setCurrentTextColor] = useState('#000000');
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState('#ffffff');

  // Quill instance getter
  const getQuill = useCallback(() => quillRef.current?.getEditor(), [quillRef]);

  // Reflect current selection formatting
  const updateButtonStates = useCallback(() => {
    const quill = getQuill();
    if (!quill) return;
    try {
      const format: any = quill.getFormat ? quill.getFormat() : {};
      setButtonStates({
        bold: !!format.bold,
        italic: !!format.italic,
        underline: !!format.underline,
        strike: !!format.strike,
        blockquote: !!format.blockquote,
        'list-ordered': format.list === 'ordered',
        'list-bullet': format.list === 'bullet',
        'align-left': !format.align || format.align === '',
        'align-center': format.align === 'center',
        'align-right': format.align === 'right',
        'align-justify': format.align === 'justify',
        link: !!format.link
      });
      if (format.color) setCurrentTextColor(format.color);
      if (format.background) setCurrentBackgroundColor(format.background);
    } catch {
      // silently ignore
    }
  }, [getQuill]);

  useEffect(() => {
    const quill = getQuill();
    if (!quill) return;
    const handleSelectionChange = () => updateButtonStates();

    quill.on?.('selection-change', handleSelectionChange);
    quill.on?.('text-change', handleSelectionChange);

    updateButtonStates();

    return () => {
      quill.off?.('selection-change', handleSelectionChange);
      quill.off?.('text-change', handleSelectionChange);
    };
  }, [getQuill, updateButtonStates]);

  // Keep scroll position during actions
  const preserveScrollPosition = useCallback((action: () => void) => {
    const quill = getQuill();
    if (!quill || !quill.root) return action();
    const scroll = quill.root.scrollTop;
    action();
    setTimeout(() => {
      if (quill && quill.root) {
        quill.root.scrollTop = scroll;
        updateButtonStates();
      }
    }, 0);
  }, [getQuill, updateButtonStates]);

  // Helpers for active button styling
  const getButtonClassName = useCallback((buttonId: string, base: string) => {
    // Intentionally keep base; active style is icon color below
    return base;
  }, []);
  const getButtonIconStyle = useCallback((buttonId: string) => {
    const isActive = buttonStates[buttonId];
    return isActive ? { color: '#F29400' } : {};
  }, [buttonStates]);

  // Handlers (formatting)
  const handleBold = useCallback(() => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.format || !q.getFormat) return;
      try {
        const cur = q.getFormat();
        q.format('bold', !cur.bold);
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleItalic = useCallback(() => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.format || !q.getFormat) return;
      try {
        const cur = q.getFormat();
        q.format('italic', !cur.italic);
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleUnderline = useCallback(() => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.format || !q.getFormat) return;
      try {
        const cur = q.getFormat();
        q.format('underline', !cur.underline);
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleStrike = useCallback(() => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.format || !q.getFormat) return;
      try {
        const cur = q.getFormat();
        q.format('strike', !cur.strike);
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleHeader = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.format) return;
      try {
        q.format('header', value || false);
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleFont = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.format) return;
      try {
        q.format('font', value || false);
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleSize = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.format) return;
      try {
        q.format('size', value || false);
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleColor = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.format) return;
      try {
        q.format('color', value || false);
        setCurrentTextColor(value);
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleBackground = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.format) return;
      try {
        q.format('background', value || false);
        setCurrentBackgroundColor(value);
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleList = useCallback((value: 'ordered' | 'bullet') => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.format || !q.getFormat) return;
      try {
        const cur = q.getFormat();
        q.format('list', cur.list === value ? false : value);
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleIndent = useCallback((value: '-1' | '+1') => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.format) return;
      try {
        q.format('indent', value);
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleAlign = useCallback((value: '' | 'center' | 'right' | 'justify') => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.format) return;
      try {
        q.format('align', value || false);
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleLink = useCallback(() => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.getSelection || !q.format || !q.getFormat) return;
      try {
        const sel = q.getSelection();
        if (sel && typeof sel.index === 'number') {
          const cur = q.getFormat();
          if (cur.link) {
            q.format('link', false);
          } else {
            const url = window.prompt('Link-URL eingeben:');
            if (url) q.format('link', url);
          }
        }
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleBlockquote = useCallback(() => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.format || !q.getFormat) return;
      try {
        const cur = q.getFormat();
        q.format('blockquote', !cur.blockquote);
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleClean = useCallback(() => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.getSelection || !q.removeFormat) return;
      try {
        const sel = q.getSelection();
        if (sel && typeof sel.index === 'number' && typeof sel.length === 'number') {
          q.removeFormat(sel.index, sel.length);
        }
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  const handleLineHeight = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const q = getQuill();
      if (!q?.format) return;
      try {
        // Hinweis: 'line-height' erfordert ein passendes Quill-Module/Attributor
        q.format('line-height', value || false);
      } catch {}
    });
  }, [getQuill, preserveScrollPosition]);

  // Zoom slider
  const handleZoomSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    onZoomChange(Number.isFinite(parsed) ? parsed : 100);
  }, [onZoomChange]);

  // Color palette
  const colorSuggestions = useMemo(
    () => [
      '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
      '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
      '#F29400', '#E8850C', '#D4761A', '#C06828', '#AC5936', '#984A44'
    ],
    []
  );

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      {/* Clipboard Error */}
      {clipboardError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <div className="flex items-center space-x-2 text-red-700 text-sm">
            <span>⚠️</span>
            <span>{clipboardError}</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="w-full px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* History */}
          <button onClick={onUndo} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Rückgängig (Strg+Z)">
            <UndoIcon />
          </button>
          <button onClick={onRedo} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Wiederholen (Strg+Y)">
            <RedoIcon />
          </button>

          <span className="w-px h-5 bg-gray-200 mx-1" />

          {/* Basic formatting */}
          <button onClick={handleBold} className={getButtonClassName('bold', 'p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200')} style={getButtonIconStyle('bold')} title="Fett (Strg+B)">
            <BoldIcon />
          </button>
          <button onClick={handleItalic} className={getButtonClassName('italic', 'p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200')} style={getButtonIconStyle('italic')} title="Kursiv (Strg+I)">
            <ItalicIcon />
          </button>
          <button onClick={handleUnderline} className={getButtonClassName('underline', 'p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200')} style={getButtonIconStyle('underline')} title="Unterstrichen (Strg+U)">
            <UnderlineIcon />
          </button>
          <button onClick={handleStrike} className={getButtonClassName('strike', 'p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200')} style={getButtonIconStyle('strike')} title="Durchgestrichen">
            <StrikeIcon />
          </button>

          <span className="w-px h-5 bg-gray-200 mx-1" />

          {/* Header / Font / Size */}
          <select onChange={(e) => handleHeader(e.target.value)} className="px-2 py-1 border-0 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white" title="Überschrift" defaultValue="">
            <option value="">Normal</option>
            <option value="1">H1</option>
            <option value="2">H2</option>
            <option value="3">H3</option>
          </select>

          <select onChange={(e) => handleFont(e.target.value)} className="px-2 py-1 border-0 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white" title="Schriftart" defaultValue="">
            <option value="">Roboto</option>
            <option value="serif">Times New Roman</option>
            <option value="monospace">Courier New</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Tahoma">Tahoma</option>
          </select>

          <select onChange={(e) => handleSize(e.target.value)} className="px-2 py-1 border-0 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white" title="Schriftgröße" defaultValue="">
            <option value="9px">9 pt</option>
            <option value="10px">10 pt</option>
            <option value="11px">11 pt</option>
            <option value="12px">12 pt</option>
            <option value="">14 pt</option>
            <option value="16px">16 pt</option>
            <option value="18px">18 pt</option>
            <option value="20px">20 pt</option>
            <option value="22px">22 pt</option>
            <option value="24px">24 pt</option>
          </select>

          <span className="w-px h-5 bg-gray-200 mx-1" />

          {/* Color pickers */}
          <div className="relative group">
            <div className="w-7 h-7 border border-gray-300 rounded cursor-pointer flex items-center justify-center" title="Textfarbe" style={{ backgroundColor: currentTextColor }}>
              <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: currentTextColor }} />
            </div>
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg p-2 hidden group-hover:block z-50">
              <div className="grid grid-cols-6 gap-1 mb-2">
                {colorSuggestions.map((c) => (
                  <button key={c} onClick={() => handleColor(c)} className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
              <input type="color" onChange={(e) => handleColor(e.target.value)} className="w-full h-8 border border-gray-300 rounded cursor-pointer" title="Benutzerdefinierte Farbe" value={currentTextColor} />
            </div>
          </div>

          <div className="relative group">
            <div className="w-7 h-7 border border-gray-300 rounded cursor-pointer flex items-center justify-center" title="Hintergrundfarbe">
              <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: currentBackgroundColor }} />
            </div>
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg p-2 hidden group-hover:block z-50">
              <div className="grid grid-cols-6 gap-1 mb-2">
                {colorSuggestions.map((c) => (
                  <button key={c} onClick={() => handleBackground(c)} className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
              <input type="color" onChange={(e) => handleBackground(e.target.value)} className="w-full h-8 border border-gray-300 rounded cursor-pointer" title="Benutzerdefinierte Hintergrundfarbe" value={currentBackgroundColor} />
            </div>
          </div>

          <span className="w-px h-5 bg-gray-200 mx-1" />

          {/* Lists & Indent */}
          <button onClick={() => handleList('ordered')} className={getButtonClassName('list-ordered', 'p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200')} style={getButtonIconStyle('list-ordered')} title="Nummerierte Liste">
            <ListOrderedIcon />
          </button>
          <button onClick={() => handleList('bullet')} className={getButtonClassName('list-bullet', 'p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200')} style={getButtonIconStyle('list-bullet')} title="Aufzählungsliste">
            <ListBulletIcon />
          </button>
          <button onClick={() => handleIndent('-1')} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Einzug verringern">
            <IndentDecreaseIcon />
          </button>
          <button onClick={() => handleIndent('+1')} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Einzug erhöhen">
            <IndentIncreaseIcon />
          </button>

          <span className="w-px h-5 bg-gray-200 mx-1" />

          {/* Align */}
          <button onClick={() => handleAlign('')} className={getButtonClassName('align-left', 'p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200')} style={getButtonIconStyle('align-left')} title="Linksbündig">
            <AlignLeftIcon />
          </button>
          <button onClick={() => handleAlign('center')} className={getButtonClassName('align-center', 'p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200')} style={getButtonIconStyle('align-center')} title="Zentriert">
            <AlignCenterIcon />
          </button>
          <button onClick={() => handleAlign('right')} className={getButtonClassName('align-right', 'p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200')} style={getButtonIconStyle('align-right')} title="Rechtsbündig">
            <AlignRightIcon />
          </button>
          <button onClick={() => handleAlign('justify')} className={getButtonClassName('align-justify', 'p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200')} style={getButtonIconStyle('align-justify')} title="Blocksatz">
            <AlignJustifyIcon />
          </button>

          <span className="w-px h-5 bg-gray-200 mx-1" />

          {/* Special */}
          <button onClick={handleLink} className={getButtonClassName('link', 'p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200')} style={getButtonIconStyle('link')} title="Link einfügen">
            <LinkIcon />
          </button>
          <button onClick={handleBlockquote} className={getButtonClassName('blockquote', 'p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200')} style={getButtonIconStyle('blockquote')} title="Zitat">
            <QuoteIcon />
          </button>
          <button onClick={handleClean} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Formatierung entfernen">
            <CleanIcon />
          </button>

          <span className="w-px h-5 bg-gray-200 mx-1" />

          {/* Export & Tools */}
          <div className="relative group">
            <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Exportieren">
              <ExportIcon />
            </button>
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg hidden group-hover:block z-50">
              <button onClick={onPrint} className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm">PDF drucken</button>
              <button onClick={() => { /* TODO: DOCX */ }} className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm">DOCX</button>
              <button onClick={() => { /* TODO: TXT */ }} className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm">TXT</button>
            </div>
          </div>

          <button onClick={onSelectAll} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Alles auswählen (Strg+A)">
            <SelectAllIcon />
          </button>
          <button onClick={onCopy} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Kopieren (Strg+C)">
            <CopyIcon />
          </button>
          <button onClick={onPaste} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Einfügen (Strg+V)">
            <PasteIcon />
          </button>
          <button onClick={onPrint} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Drucken (Strg+P)">
            <PrintIcon />
          </button>
          <button onClick={onTemplates} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Vorlagen verwalten">
            <TemplatesIcon />
          </button>
          <button onClick={onSettings} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Editor-Einstellungen">
            <SettingsIcon />
          </button>

          <span className="w-px h-5 bg-gray-200 mx-1" />

          {/* Line height */}
          <div className="relative group">
            <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Zeilenabstand">
              <LineHeightIcon />
            </button>
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg hidden group-hover:block z-50">
              <button onClick={() => handleLineHeight('1')} className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm">1.0</button>
              <button onClick={() => handleLineHeight('1.15')} className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm">1.15</button>
              <button onClick={() => handleLineHeight('1.5')} className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm">1.5</button>
              <button onClick={() => handleLineHeight('2')} className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm">2.0</button>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Zoom controls */}
          <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 flex-shrink-0">
            <button onClick={onZoomOut} disabled={displayZoom <= safeMin} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" title="Verkleinern">
              <ZoomOutIcon />
            </button>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min={safeMin}
                max={safeMax}
                step={10}
                value={displayZoom}
                onChange={handleZoomSliderChange}
                className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer zoom-slider"
                title={`Zoom: ${displayZoom}%`}
              />
            </div>
            <button onClick={onZoomIn} disabled={displayZoom >= safeMax} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" title="Vergrößern">
              <ZoomInIcon />
            </button>
            <button onClick={onZoomReset} className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200 min-w-[50px]" title="Zoom zurücksetzen (100%)">
              {displayZoom}%
            </button>
          </div>
        </div>
      </div>

      {/* Local styles */}
      <style>{`
        .zoom-slider {
          background: #e5e7eb;
        }
        .zoom-slider::-webkit-slider-thumb {
          appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #F29400;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .zoom-slider::-moz-range-thumb {
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #F29400;
          cursor: pointer;
          border: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
