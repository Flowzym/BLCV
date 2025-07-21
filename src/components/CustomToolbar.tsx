import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type ReactQuill from 'react-quill';

interface CustomToolbarProps {
  quillRef: React.RefObject<ReactQuill>; // ref to the ReactQuill component
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

// BOLT-UI-ANPASSUNG 2025-01-15: SVG Icon Components erweitert
const UndoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6"/>
    <path d="M1 10l3.586-3.586a2 2 0 0 1 2.828 0L10 9"/>
    <path d="M7 7a8 8 0 1 1 8 8"/>
  </svg>
);

const RedoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"/>
    <path d="M23 10l-3.586-3.586a2 2 0 0 0-2.828 0L14 9"/>
    <path d="M17 7a8 8 0 1 0-8 8"/>
  </svg>
);

const BoldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
  </svg>
);

const ItalicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4"/>
    <line x1="14" y1="20" x2="5" y2="20"/>
    <line x1="15" y1="4" x2="9" y2="20"/>
  </svg>
);

const UnderlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
    <line x1="4" y1="21" x2="20" y2="21"/>
  </svg>
);

const StrikeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4H9a3 3 0 0 0-2.83 4"/>
    <path d="M14 12a4 4 0 0 1 0 8H6"/>
    <line x1="4" y1="12" x2="20" y2="12"/>
  </svg>
);

const ListOrderedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6"/>
    <line x1="10" y1="12" x2="21" y2="12"/>
    <line x1="10" y1="18" x2="21" y2="18"/>
    <path d="M4 6h1v4"/>
    <path d="M4 10h2"/>
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
  </svg>
);

const ListBulletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const IndentDecreaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="7,8 3,12 7,16"/>
    <line x1="21" y1="12" x2="11" y2="12"/>
    <line x1="21" y1="6" x2="11" y2="6"/>
    <line x1="21" y1="18" x2="11" y2="18"/>
  </svg>
);

const IndentIncreaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,8 7,12 3,16"/>
    <line x1="21" y1="12" x2="11" y2="12"/>
    <line x1="21" y1="6" x2="11" y2="6"/>
    <line x1="21" y1="18" x2="11" y2="18"/>
  </svg>
);

const AlignLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="10" x2="3" y2="10"/>
    <line x1="21" y1="6" x2="3" y2="6"/>
    <line x1="21" y1="14" x2="3" y2="14"/>
    <line x1="17" y1="18" x2="3" y2="18"/>
  </svg>
);

const AlignCenterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="10" x2="6" y2="10"/>
    <line x1="21" y1="6" x2="3" y2="6"/>
    <line x1="21" y1="14" x2="3" y2="14"/>
    <line x1="18" y1="18" x2="6" y2="18"/>
  </svg>
);

const AlignRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" y1="10" x2="7" y2="10"/>
    <line x1="21" y1="6" x2="3" y2="6"/>
    <line x1="21" y1="14" x2="3" y2="14"/>
    <line x1="21" y1="18" x2="7" y2="18"/>
  </svg>
);

const AlignJustifyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" y1="10" x2="3" y2="10"/>
    <line x1="21" y1="6" x2="3" y2="6"/>
    <line x1="21" y1="14" x2="3" y2="14"/>
    <line x1="21" y1="18" x2="3" y2="18"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/>
  </svg>
);

const QuoteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
  </svg>
);

const CleanIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 21h10"/>
    <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/>
    <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.4 2.4 0 0 1 .6 3.2"/>
  </svg>
);

const SelectAllIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-4"/>
    <path d="M19 3H9a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const PasteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const PrintIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 6,2 18,2 18,9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);

const TemplatesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 0 1-8 0 4 4 0 0 1 8 0zM7 21a4 4 0 0 1 0-8 4 4 0 0 1 0 8z"/>
  </svg>
);

const ZoomInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
    <line x1="11" y1="8" x2="11" y2="14"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const ZoomOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="19" cy="12" r="1"/>
    <circle cx="5" cy="12" r="1"/>
  </svg>
);

// BOLT-UI-ANPASSUNG 2025-01-15: Zeilenabstand-Icon hinzugefügt
const LineHeightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M3 12h18"/>
    <path d="M3 18h18"/>
    <path d="M21 4v2"/>
    <path d="M21 10v2"/>
    <path d="M21 16v2"/>
  </svg>
);

// BOLT-UI-ANPASSUNG 2025-01-15: Export-Icon hinzugefügt
const ExportIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

interface ToolbarButton {
  id: string;
  element: React.ReactNode;
  priority: number;
  group: string;
  handler: () => void;
}

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
  const displayZoom = Math.round(zoom);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const [visibleButtons, setVisibleButtons] = useState<string[]>([]);
  const [overflowButtons, setOverflowButtons] = useState<string[]>([]);
  
  // BOLT-UI-ANPASSUNG 2025-01-15: Popup state für Mauszeiger-Position
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  
  const [buttonStates, setButtonStates] = useState<{[key: string]: boolean}>({});
  const [currentTextColor, setCurrentTextColor] = useState('#000000'); // BOLT-UI-ANPASSUNG 2025-01-15: Aktuelle Textfarbe
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState('#ffffff'); // BOLT-UI-ANPASSUNG 2025-01-15: Aktuelle Hintergrundfarbe

  // Get Quill instance
  const getQuill = useCallback(() => quillRef.current?.getEditor(), [quillRef]);

  // BOLT-UI-ANPASSUNG 2025-01-15: Update button states mit Farbtracking
  const updateButtonStates = useCallback(() => {
    const quill = getQuill();
    if (!quill) return;

    try {
      const format = quill.getFormat ? quill.getFormat() : {};
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
      
      // BOLT-UI-ANPASSUNG 2025-01-15: Aktuelle Farben tracken
      if (format.color) {
        setCurrentTextColor(format.color);
      }
      if (format.background) {
        setCurrentBackgroundColor(format.background);
      }
    } catch {
      // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung wenn Editor nicht bereit
    }
  }, [getQuill]);

  // BOLT-FIX 2025-01-15: Listen to Quill selection changes mit verbesserter Fehlerbehandlung
  useEffect(() => {
    const quill = getQuill();
    if (!quill) return;

    const handleSelectionChange = () => {
      updateButtonStates();
    };

    if (quill.on) {
      quill.on('selection-change', handleSelectionChange);
      quill.on('text-change', handleSelectionChange);
    }

    updateButtonStates();

    return () => {
      if (quill.off) {
        quill.off('selection-change', handleSelectionChange);
        quill.off('text-change', handleSelectionChange);
      }
    };
  }, [getQuill, updateButtonStates]);

  // Preserve scroll position during formatting
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

  // BOLT-UI-ANPASSUNG 2025-01-15: Alle Quill formatting handlers erweitert
  const handleBold = useCallback(() => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.format && quill.getFormat) {
        try {
          const currentFormat = quill.getFormat();
          quill.format('bold', !currentFormat.bold);
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleItalic = useCallback(() => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.format && quill.getFormat) {
        try {
          const currentFormat = quill.getFormat();
          quill.format('italic', !currentFormat.italic);
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleUnderline = useCallback(() => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.format && quill.getFormat) {
        try {
          const currentFormat = quill.getFormat();
          quill.format('underline', !currentFormat.underline);
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleStrike = useCallback(() => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.format && quill.getFormat) {
        try {
          const currentFormat = quill.getFormat();
          quill.format('strike', !currentFormat.strike);
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleHeader = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.format) {
        try {
          quill.format('header', value || false);
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleFont = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.format) {
        try {
          quill.format('font', value || false);
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleSize = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.format) {
        try {
          quill.format('size', value || false);
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleColor = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.format) {
        try {
          quill.format('color', value || false);
          setCurrentTextColor(value);
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleBackground = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.format) {
        try {
          quill.format('background', value || false);
          setCurrentBackgroundColor(value);
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleList = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.format && quill.getFormat) {
        try {
          const currentFormat = quill.getFormat();
          quill.format('list', currentFormat.list === value ? false : value);
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleIndent = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.format) {
        try {
          quill.format('indent', value);
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleAlign = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.format) {
        try {
          quill.format('align', value || false);
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleLink = useCallback(() => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.getSelection && quill.format && quill.getFormat) {
        try {
          const selection = quill.getSelection();
          if (selection && typeof selection.index === 'number') {
            const currentFormat = quill.getFormat();
            if (currentFormat.link) {
              quill.format('link', false);
            } else {
              const url = prompt('Link-URL eingeben:');
              if (url) {
                quill.format('link', url);
              }
            }
          }
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleBlockquote = useCallback(() => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.format && quill.getFormat) {
        try {
          const currentFormat = quill.getFormat();
          quill.format('blockquote', !currentFormat.blockquote);
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleClean = useCallback(() => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.getSelection && quill.removeFormat) {
        try {
          const selection = quill.getSelection();
          if (selection && typeof selection.index === 'number' && typeof selection.length === 'number') {
            quill.removeFormat(selection.index, selection.length);
          }
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  // BOLT-UI-ANPASSUNG 2025-01-15: Zeilenabstand-Handler hinzugefügt
  const handleLineHeight = useCallback((value: string) => {
    preserveScrollPosition(() => {
      const quill = getQuill();
      if (quill && quill.format) {
        try {
          quill.format('line-height', value || false);
        } catch {
          // BOLT-FIX 2025-01-15: Stille Fehlerbehandlung
        }
      }
    });
  }, [getQuill, preserveScrollPosition]);

  const handleZoomSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseInt(e.target.value);
    onZoomChange(newZoom);
  }, [onZoomChange]);

  // BOLT-UI-ANPASSUNG 2025-01-15: Helper function für aktive Button-Styling - NICHT orange hinterlegen, sondern Icon einfärben
  const getButtonClassName = useCallback((buttonId: string, baseClassName: string) => {
    const isActive = buttonStates[buttonId];
    return `${baseClassName} ${isActive ? '' : ''}`;
  }, [buttonStates]);

  // BOLT-UI-ANPASSUNG 2025-01-15: Helper function für aktive Button-Icon-Farbe
  const getButtonIconStyle = useCallback((buttonId: string) => {
    const isActive = buttonStates[buttonId];
    return isActive ? { color: '#F29400' } : {};
  }, [buttonStates]);

  // BOLT-UI-ANPASSUNG 2025-01-15: Farbvorschläge für Text und Hintergrund
  const colorSuggestions = useMemo(
    () => [
      '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
      '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
      '#F29400', '#E8850C', '#D4761A', '#C06828', '#AC5936', '#984A44'
    ],
    []
  );

  // BOLT-UI-ANPASSUNG 2025-01-15: Alle Toolbar-Buttons erweitert und angepasst
  const allButtons: ToolbarButton[] = useMemo(() => [
    // Höchste Priorität (1-10): Grundlegende Formatierung
    {
      id: 'undo',
      priority: 1,
      group: 'history',
      handler: onUndo,
      element: (
        <button
          key="undo"
          onClick={onUndo}
          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
          title="Rückgängig (Strg+Z)"
        >
          <UndoIcon />
        </button>
      )
    },
    {
      id: 'redo',
      priority: 2,
      group: 'history',
      handler: onRedo,
      element: (
        <button
          key="redo"
          onClick={onRedo}
          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
          title="Wiederholen (Strg+Y)"
        >
          <RedoIcon />
        </button>
      )
    },
    {
      id: 'bold',
      priority: 3,
      group: 'format',
      handler: handleBold,
      element: (
        <button
          key="bold"
          onClick={handleBold}
          className={getButtonClassName('bold', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
          title="Fett (Strg+B)"
          style={getButtonIconStyle('bold')}
        >
          <BoldIcon />
        </button>
      )
    },
    {
      id: 'italic',
      priority: 4,
      group: 'format',
      handler: handleItalic,
      element: (
        <button
          key="italic"
          onClick={handleItalic}
          className={getButtonClassName('italic', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
          title="Kursiv (Strg+I)"
          style={getButtonIconStyle('italic')}
        >
          <ItalicIcon />
        </button>
      )
    },
    {
      id: 'underline',
      priority: 5,
      group: 'format',
      handler: handleUnderline,
      element: (
        <button
          key="underline"
          onClick={handleUnderline}
          className={getButtonClassName('underline', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
          title="Unterstrichen (Strg+U)"
          style={getButtonIconStyle('underline')}
        >
          <UnderlineIcon />
        </button>
      )
    },

    // Mittlere Priorität (11-20): Erweiterte Formatierung
    {
      id: 'header',
      priority: 11,
      group: 'style',
      handler: () => {}, // Dropdown hat keinen direkten Handler
      element: (
        <select
          key="header"
          onChange={(e) => handleHeader(e.target.value)}
          className="px-2 py-1 border-0 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
          title="Überschrift"
          defaultValue=""
        >
          <option value="">Normal</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
        </select>
      )
    },
    {
      id: 'font',
      priority: 12,
      group: 'style',
      handler: () => {}, // Dropdown hat keinen direkten Handler
      element: (
        <select
          key="font"
          onChange={(e) => handleFont(e.target.value)}
          className="px-2 py-1 border-0 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
          title="Schriftart"
          defaultValue=""
        >
          <option value="">Roboto</option>
          <option value="serif">Times New Roman</option>
          <option value="monospace">Courier New</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Tahoma">Tahoma</option>
        </select>
      )
    },
    {
      id: 'size',
      priority: 13,
      group: 'style',
      handler: () => {}, // Dropdown hat keinen direkten Handler
      element: (
        <select
          key="size"
          onChange={(e) => handleSize(e.target.value)}
          className="px-2 py-1 border-0 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
          title="Schriftgröße"
          defaultValue=""
        >
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
      )
    },
    {
      id: 'color',
      priority: 14,
      group: 'color',
      handler: () => {}, // Color picker hat keinen direkten Handler
      element: (
        <div key="color" className="relative group">
          <div 
            className="w-7 h-7 border border-gray-300 rounded cursor-pointer flex items-center justify-center"
            title="Textfarbe"
            style={{ backgroundColor: currentTextColor }}
          >
            <div 
              className="w-4 h-4 rounded-full border border-white"
              style={{ backgroundColor: currentTextColor }}
            />
          </div>
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg p-2 hidden group-hover:block z-50">
            <div className="grid grid-cols-6 gap-1 mb-2">
              {colorSuggestions.map(color => (
                <button
                  key={color}
                  onClick={() => handleColor(color)}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <input
              type="color"
              onChange={(e) => handleColor(e.target.value)}
              className="w-full h-8 border border-gray-300 rounded cursor-pointer"
              title="Benutzerdefinierte Farbe"
              value={currentTextColor}
            />
          </div>
        </div>
      )
    },
    {
      id: 'background',
      priority: 15,
      group: 'color',
      handler: () => {}, // Color picker hat keinen direkten Handler
      element: (
        <div key="background" className="relative group">
          <div 
            className="w-7 h-7 border border-gray-300 rounded cursor-pointer flex items-center justify-center"
            title="Hintergrundfarbe"
          >
            <div 
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: currentBackgroundColor }}
            />
          </div>
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg p-2 hidden group-hover:block z-50">
            <div className="grid grid-cols-6 gap-1 mb-2">
              {colorSuggestions.map(color => (
                <button
                  key={color}
                  onClick={() => handleBackground(color)}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <input
              type="color"
              onChange={(e) => handleBackground(e.target.value)}
              className="w-full h-8 border border-gray-300 rounded cursor-pointer"
              title="Benutzerdefinierte Hintergrundfarbe"
              value={currentBackgroundColor}
            />
          </div>
        </div>
      )
    },
    {
      id: 'strike',
      priority: 16,
      group: 'format',
      handler: handleStrike,
      element: (
        <button
          key="strike"
          onClick={handleStrike}
          className={getButtonClassName('strike', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
          title="Durchgestrichen"
          style={getButtonIconStyle('strike')}
        >
          <StrikeIcon />
        </button>
      )
    },

    // BOLT-UI-ANPASSUNG 2025-01-15: Zeilenabstand hinzugefügt
    {
      id: 'line-height',
      priority: 17,
      group: 'style',
      handler: () => {}, // Dropdown hat keinen direkten Handler
      element: (
        <div key="line-height" className="relative group">
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
      )
    },

    // Niedrigere Priorität (21-30): Listen und Ausrichtung
    {
      id: 'list-ordered',
      priority: 21,
      group: 'list',
      handler: () => handleList('ordered'),
      element: (
        <button
          key="list-ordered"
          onClick={() => handleList('ordered')}
          className={getButtonClassName('list-ordered', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
          title="Nummerierte Liste"
          style={getButtonIconStyle('list-ordered')}
        >
          <ListOrderedIcon />
        </button>
      )
    },
    {
      id: 'list-bullet',
      priority: 22,
      group: 'list',
      handler: () => handleList('bullet'),
      element: (
        <button
          key="list-bullet"
          onClick={() => handleList('bullet')}
          className={getButtonClassName('list-bullet', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
          title="Aufzählungsliste"
          style={getButtonIconStyle('list-bullet')}
        >
          <ListBulletIcon />
        </button>
      )
    },
    {
      id: 'indent-decrease',
      priority: 23,
      group: 'indent',
      handler: () => handleIndent('-1'),
      element: (
        <button
          key="indent-decrease"
          onClick={() => handleIndent('-1')}
          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
          title="Einzug verringern"
        >
          <IndentDecreaseIcon />
        </button>
      )
    },
    {
      id: 'indent-increase',
      priority: 24,
      group: 'indent',
      handler: () => handleIndent('+1'),
      element: (
        <button
          key="indent-increase"
          onClick={() => handleIndent('+1')}
          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
          title="Einzug erhöhen"
        >
          <IndentIncreaseIcon />
        </button>
      )
    },
    {
      id: 'align-left',
      priority: 25,
      group: 'align',
      handler: () => handleAlign(''),
      element: (
        <button
          key="align-left"
          onClick={() => handleAlign('')}
          className={getButtonClassName('align-left', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
          title="Linksbündig"
          style={getButtonIconStyle('align-left')}
        >
          <AlignLeftIcon />
        </button>
      )
    },
    {
      id: 'align-center',
      priority: 26,
      group: 'align',
      handler: () => handleAlign('center'),
      element: (
        <button
          key="align-center"
          onClick={() => handleAlign('center')}
          className={getButtonClassName('align-center', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
          title="Zentriert"
          style={getButtonIconStyle('align-center')}
        >
          <AlignCenterIcon />
        </button>
      )
    },
    {
      id: 'align-right',
      priority: 27,
      group: 'align',
      handler: () => handleAlign('right'),
      element: (
        <button
          key="align-right"
          onClick={() => handleAlign('right')}
          className={getButtonClassName('align-right', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
          title="Rechtsbündig"
          style={getButtonIconStyle('align-right')}
        >
          <AlignRightIcon />
        </button>
      )
    },
    {
      id: 'align-justify',
      priority: 28,
      group: 'align',
      handler: () => handleAlign('justify'),
      element: (
        <button
          key="align-justify"
          onClick={() => handleAlign('justify')}
          className={getButtonClassName('align-justify', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
          title="Blocksatz"
          style={getButtonIconStyle('align-justify')}
        >
          <AlignJustifyIcon />
        </button>
      )
    },

    // Niedrigste Priorität (31-40): Spezielle Funktionen
    {
      id: 'link',
      priority: 31,
      group: 'special',
      handler: handleLink,
      element: (
        <button
          key="link"
          onClick={handleLink}
          className={getButtonClassName('link', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
          title="Link einfügen"
          style={getButtonIconStyle('link')}
        >
          <LinkIcon />
        </button>
      )
    },
    {
      id: 'blockquote',
      priority: 32,
      group: 'special',
      handler: handleBlockquote,
      element: (
        <button
          key="blockquote"
          onClick={handleBlockquote}
          className={getButtonClassName('blockquote', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
          title="Zitat"
          style={getButtonIconStyle('blockquote')}
        >
          <QuoteIcon />
        </button>
      )
    },
    {
      id: 'clean',
      priority: 33,
      group: 'special',
      handler: handleClean,
      element: (
        <button
          key="clean"
          onClick={handleClean}
          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
          title="Formatierung entfernen"
        >
          <CleanIcon />
        </button>
      )
    },

    // BOLT-UI-ANPASSUNG 2025-01-15: Export-Button hinzugefügt
    {
      id: 'export',
      priority: 34,
      group: 'tools',
      handler: () => {}, // Dropdown hat keinen direkten Handler
      element: (
        <div key="export" className="relative group">
          <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Exportieren">
            <ExportIcon />
          </button>
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg hidden group-hover:block z-50">
            <button onClick={onPrint} className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm">PDF drucken</button>
            <button onClick={() => {/* DOCX Export */}} className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm">DOCX</button>
            <button onClick={() => {/* TXT Export */}} className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm">TXT</button>
          </div>
        </div>
      )
    },

    {
      id: 'select-all',
      priority: 35,
      group: 'clipboard',
      handler: onSelectAll,
      element: (
        <button
          key="select-all"
          onClick={onSelectAll}
          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
          title="Alles auswählen (Strg+A)"
        >
          <SelectAllIcon />
        </button>
      )
    },
    {
      id: 'copy',
      priority: 36,
      group: 'clipboard',
      handler: onCopy,
      element: (
        <button
          key="copy"
          onClick={onCopy}
          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
          title="Kopieren (Strg+C)"
        >
          <CopyIcon />
        </button>
      )
    },
    {
      id: 'paste',
      priority: 37,
      group: 'clipboard',
      handler: onPaste,
      element: (
        <button
          key="paste"
          onClick={onPaste}
          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
          title="Einfügen (Strg+V)"
        >
          <PasteIcon />
        </button>
      )
    },
    {
      id: 'print',
      priority: 38,
      group: 'clipboard',
      handler: onPrint,
      element: (
        <button
          key="print"
          onClick={onPrint}
          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
          title="Drucken (Strg+P)"
        >
          <PrintIcon />
        </button>
      )
    },
    {
      id: 'templates',
      priority: 39,
      group: 'tools',
      handler: onTemplates,
      element: (
        <button
          key="templates"
          onClick={onTemplates}
          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
          title="Vorlagen verwalten"
        >
          <TemplatesIcon />
        </button>
      )
    },
    {
      id: 'settings',
      priority: 40,
      group: 'tools',
      handler: onSettings,
      element: (
        <button
          key="settings"
          onClick={onSettings}
          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
          title="Editor-Einstellungen"
        >
          <SettingsIcon />
        </button>
      )
    }
  ], [
    onUndo, onRedo, handleBold, handleItalic, handleUnderline, handleStrike,
    handleHeader, handleFont, handleSize, handleColor, handleBackground,
    handleList, handleIndent, handleAlign, handleLink, handleBlockquote,
    handleClean, onSelectAll, onCopy, onPaste, onPrint, onTemplates, onSettings,
    getButtonClassName, getButtonIconStyle, currentTextColor, currentBackgroundColor,
    handleLineHeight, colorSuggestions
  ]);

  // BOLT-FIX 2025-01-15: Overflow-Erkennung mit Resize Observer
  const calculateVisibleButtons = useCallback(() => {
    if (!toolbarRef.current) return;

    const toolbar = toolbarRef.current;
    const toolbarWidth = toolbar.clientWidth;
    
    // BOLT-UI-ANPASSUNG 2025-01-15: Mehr Platz für Symbole, kompaktere Toolbar
    const zoomControlsWidth = 180; // Reduziert für kompaktere Darstellung
    const moreButtonWidth = 40;
    const availableWidth = toolbarWidth - zoomControlsWidth - moreButtonWidth - 24; // Weniger Padding

    // Sortiere Buttons nach Priorität (niedrigere Zahl = höhere Priorität)
    const sortedButtons = [...allButtons].sort((a, b) => a.priority - b.priority);
    
    const visible: string[] = [];
    const overflow: string[] = [];
    let currentWidth = 0;
    
    // BOLT-UI-ANPASSUNG 2025-01-15: Kompaktere Button-Breiten
    const getButtonWidth = (button: ToolbarButton) => {
      if (button.id.includes('select') || button.id.includes('color') || button.id.includes('background')) {
        return 36; // Kompakter
      }
      if (button.id.includes('header') || button.id.includes('font') || button.id.includes('size')) {
        return 70; // Kompakter
      }
      return 40; // Kompakter
    };

    for (const button of sortedButtons) {
      const buttonWidth = getButtonWidth(button);
      
      if (currentWidth + buttonWidth <= availableWidth) {
        visible.push(button.id);
        currentWidth += buttonWidth + 2; // Weniger Gap
      } else {
        overflow.push(button.id);
      }
    }

    setVisibleButtons(visible);
    setOverflowButtons(overflow);
  }, [allButtons]);

  // BOLT-FIX 2025-01-15: Resize Observer für dynamische Anpassung
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleButtons();
    });

    if (toolbarRef.current) {
      resizeObserver.observe(toolbarRef.current);
    }

    // Initial calculation
    calculateVisibleButtons();

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateVisibleButtons]);

  // BOLT-FIX 2025-01-15: Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setTimeout(calculateVisibleButtons, 100); // Debounce
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateVisibleButtons]);

  // BOLT-UI-ANPASSUNG 2025-01-15: Popup-Handler für Mauszeiger-Position
  const handleOverflowClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Berechne Position relativ zum Mauszeiger
    const x = e.clientX;
    const y = e.clientY;
    
    // Popup oberhalb des Mauszeigers positionieren
    setPopupPosition({
      x: x - 110, // Zentriere das Popup horizontal (220px / 2 = 110px)
      y: y - 60   // Popup oberhalb des Mauszeigers (mit etwas Abstand)
    });
    setPopupOpen(true);
  }, []);

  // BOLT-FIX 2025-01-15: Popup schließen bei Außenklick und ESC
  useEffect(() => {
    if (!popupOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Prüfe ob Klick außerhalb des Popups und des Mehr-Buttons
      const target = event.target as Node;
      
      // Finde das Popup-Element
      const popupElement = document.getElementById('overflow-popup');
      const moreButton = moreButtonRef.current;
      
      if (popupElement && !popupElement.contains(target) && 
          moreButton && !moreButton.contains(target)) {
        setPopupOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [popupOpen]);

  // BOLT-FIX 2025-01-15: Button-Click Handler mit Popup-Schließung
  const handleOverflowButtonClick = useCallback((buttonId: string) => {
    // Finde den Button und führe seine Aktion aus
    const button = allButtons.find(b => b.id === buttonId);
    if (button && button.handler) {
      button.handler();
    }
    
    // Schließe das Popup sofort nach Button-Klick
    setPopupOpen(false);
  }, [allButtons]);

  // BOLT-FIX 2025-01-15: Render visible buttons
  const renderVisibleButtons = useCallback(() => {
    return allButtons
      .filter(button => visibleButtons.includes(button.id))
      .sort((a, b) => a.priority - b.priority)
      .map(button => button.element);
  }, [allButtons, visibleButtons]);

  // BOLT-UI-ANPASSUNG 2025-01-15: Render overflow buttons ohne helle Hintergrundfarbe
  const renderOverflowButtons = useCallback(() => {
    const overflowButtonsData = allButtons
      .filter(button => overflowButtons.includes(button.id))
      .sort((a, b) => a.priority - b.priority);

    // Gruppiere Buttons nach Gruppen
    const groups: { [key: string]: ToolbarButton[] } = {};
    overflowButtonsData.forEach(button => {
      if (!groups[button.group]) {
        groups[button.group] = [];
      }
      groups[button.group].push(button);
    });

    return Object.entries(groups).map(([groupName, buttons]) => (
      <div key={groupName} className="overflow-popup-group">
        {buttons.map(button => {
          if (button.id.includes('header') || button.id.includes('font') || button.id.includes('size')) {
            // Für Dropdowns: Clone das Element
            const buttonElement = button.element as React.ReactElement;
            return React.cloneElement(buttonElement, {
              key: `overflow-${button.id}`
            });
          } else if (button.id.includes('color') || button.id.includes('background')) {
            // Für Color-Picker: Clone das Element
            const buttonElement = button.element as React.ReactElement;
            return React.cloneElement(buttonElement, {
              key: `overflow-${button.id}`
            });
          } else {
            // Für normale Buttons: Erstelle neuen Button mit Overflow-Handler und ohne helle Hintergrundfarbe
            const buttonElement = button.element as React.ReactElement;
            const { onClick, className, ...otherProps } = buttonElement.props;
            void onClick; // discard original onClick
            
            return React.cloneElement(buttonElement, {
              key: `overflow-${button.id}`,
              onClick: () => handleOverflowButtonClick(button.id),
              className: className?.replace('hover:bg-orange-50', ''), // BOLT-UI-ANPASSUNG 2025-01-15: Entferne helle Hintergrundfarbe
              ...otherProps
            });
          }
        })}
      </div>
    ));
  }, [allButtons, overflowButtons, handleOverflowButtonClick]);

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      {/* Clipboard Error Display */}
      {clipboardError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <div className="flex items-center space-x-2 text-red-700 text-sm">
            <span>⚠️</span>
            <span>{clipboardError}</span>
          </div>
        </div>
      )}

      {/* BOLT-UI-ANPASSUNG 2025-01-15: Toolbar Content - kompakter und effizienter */}
      <div ref={toolbarRef} id="custom-toolbar" className="flex items-center justify-between w-full px-3 py-2 gap-1">
        {/* Left Side - Visible Tools */}
        <div className="flex items-center space-x-1 flex-1 overflow-hidden">
          {renderVisibleButtons()}
          
          {/* BOLT-UI-ANPASSUNG 2025-01-15: Mehr-Button - nur wenn Overflow Buttons vorhanden */}
          {overflowButtons.length > 0 && (
            <button
              ref={moreButtonRef}
              onClick={handleOverflowClick}
              className={`p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-all duration-200 border border-transparent hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 ${
                popupOpen ? 'bg-orange-50 text-orange-600 border-gray-300' : ''
              }`}
              title={`Weitere Funktionen (${overflowButtons.length})`}
            >
              <MoreIcon />
            </button>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 flex-shrink-0">
          <button
            onClick={onZoomOut}
            disabled={zoom <= minZoom}
            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Verkleinern"
          >
            <ZoomOutIcon />
          </button>
          
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step="10"
              value={displayZoom}
              onChange={handleZoomSliderChange}
              className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer zoom-slider"
              title={`Zoom: ${displayZoom}%`}
            />
          </div>
          
          <button
            onClick={onZoomIn}
            disabled={zoom >= maxZoom}
            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Vergrößern"
          >
            <ZoomInIcon />
          </button>
          
          <button
            onClick={onZoomReset}
            className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200 min-w-[50px]"
            title="Zoom zurücksetzen (100%)"
          >
            {displayZoom}%
          </button>
        </div>
      </div>

      {/* BOLT-UI-ANPASSUNG 2025-01-15: Portal Popup - nur gerendert wenn popupOpen === true */}
      {popupOpen && createPortal(
        <div 
          id="overflow-popup"
          style={{
            position: "fixed",
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            background: "#fff",
            border: "2px solid #f29400",
            borderRadius: "8px",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
            zIndex: 9999,
            minWidth: "220px",
            maxWidth: "300px",
            padding: "8px"
          }}
        >
          <div className="overflow-popup-content">
            {renderOverflowButtons()}
          </div>
        </div>,
        document.body
      )}

      {/* Zoom-slider styles */}
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

        .overflow-popup-group {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          border-radius: 4px;
          background: transparent;
          margin-bottom: 4px;
        }

        .overflow-popup-group:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
