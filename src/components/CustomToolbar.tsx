import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type ReactQuill from 'react-quill';

// … (Icon-Komponenten bleiben unverändert; gekürzt hier im Kommentar)
// Bitte deine bisherigen Icon-Komponenten einfach beibehalten.

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

// ---- Icon Components (deine vorhandenen) ----
// (Belasse hier deinen kompletten Icon-Block unverändert)

interface ToolbarButton {
  id: string;
  element: React.ReactNode;
  priority: number;
  group: string;
  handler: () => void;
}

export default function CustomToolbar(props: CustomToolbarProps) {
  const {
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
  } = props;

  // --- SAFE fallbacks für Zoom-Werte (verhindert NaN-Warnungen) ---
  const safeMin = Number.isFinite(minZoom) ? minZoom : 50;
  const safeMax = Number.isFinite(maxZoom) ? maxZoom : 200;
  const safeZoom = Number.isFinite(zoom) ? zoom : 100;
  const displayZoom = Math.round(safeZoom);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const [visibleButtons, setVisibleButtons] = useState<string[]>([]);
  const [overflowButtons, setOverflowButtons] = useState<string[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [buttonStates, setButtonStates] = useState<{ [key: string]: boolean }>({});
  const [currentTextColor, setCurrentTextColor] = useState('#000000');
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState('#ffffff');

  const getQuill = useCallback(() => quillRef.current?.getEditor(), [quillRef]);

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
        link: !!format.link,
      });
      if (format.color) setCurrentTextColor(format.color);
      if (format.background) setCurrentBackgroundColor(format.background);
    } catch {
      // still und ruhig bleiben :)
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

  const preserveScrollPosition = useCallback(
    (action: () => void) => {
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
    },
    [getQuill, updateButtonStates]
  );

  // --- deine Handler (bold/italic/…); unverändert, daher hier nicht nochmal eingefügt
  // Bitte übernimm deine bisherigen Handler exakt – sie waren ok.
  // Einzige Stelle, die ich angepasst habe: handleZoomSliderChange + range props unten.

  const handleZoomSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseInt(e.target.value, 10);
      onZoomChange(Number.isFinite(parsed) ? parsed : 100);
    },
    [onZoomChange]
  );

  // --- colorSuggestions + allButtons: belasse deinen bisherigen Code ---
// ⬇️ Direkt UNTER colorSuggestions einfügen
const allButtons: ToolbarButton[] = useMemo(() => [
  // 1–10: History & Basics
  {
    id: 'undo',
    priority: 1,
    group: 'history',
    handler: onUndo,
    element: (
      <button key="undo" onClick={onUndo}
        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
        title="Rückgängig (Strg+Z)">
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
      <button key="redo" onClick={onRedo}
        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
        title="Wiederholen (Strg+Y)">
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
      <button key="bold" onClick={handleBold}
        className={getButtonClassName('bold', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
        title="Fett (Strg+B)" style={getButtonIconStyle('bold')}>
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
      <button key="italic" onClick={handleItalic}
        className={getButtonClassName('italic', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
        title="Kursiv (Strg+I)" style={getButtonIconStyle('italic')}>
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
      <button key="underline" onClick={handleUnderline}
        className={getButtonClassName('underline', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
        title="Unterstrichen (Strg+U)" style={getButtonIconStyle('underline')}>
        <UnderlineIcon />
      </button>
    )
  },
  // 11–20: Styles & Colors
  {
    id: 'header',
    priority: 11,
    group: 'style',
    handler: () => {},
    element: (
      <select key="header" onChange={(e) => handleHeader(e.target.value)}
        className="px-2 py-1 border-0 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
        title="Überschrift" defaultValue="">
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
    handler: () => {},
    element: (
      <select key="font" onChange={(e) => handleFont(e.target.value)}
        className="px-2 py-1 border-0 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
        title="Schriftart" defaultValue="">
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
    handler: () => {},
    element: (
      <select key="size" onChange={(e) => handleSize(e.target.value)}
        className="px-2 py-1 border-0 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
        title="Schriftgröße" defaultValue="">
        <option value="9px">9 pt</option><option value="10px">10 pt</option>
        <option value="11px">11 pt</option><option value="12px">12 pt</option>
        <option value="">14 pt</option><option value="16px">16 pt</option>
        <option value="18px">18 pt</option><option value="20px">20 pt</option>
        <option value="22px">22 pt</option><option value="24px">24 pt</option>
      </select>
    )
  },
  {
    id: 'color',
    priority: 14,
    group: 'color',
    handler: () => {},
    element: (
      <div key="color" className="relative group">
        <div className="w-7 h-7 border border-gray-300 rounded cursor-pointer flex items-center justify-center"
             title="Textfarbe" style={{ backgroundColor: currentTextColor }}>
          <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: currentTextColor }}/>
        </div>
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg p-2 hidden group-hover:block z-50">
          <div className="grid grid-cols-6 gap-1 mb-2">
            {colorSuggestions.map(c => (
              <button key={c} onClick={() => handleColor(c)}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }} title={c}/>
            ))}
          </div>
          <input type="color" value={currentTextColor} onChange={(e)=>handleColor(e.target.value)}
                 className="w-full h-8 border border-gray-300 rounded cursor-pointer" title="Benutzerdefinierte Farbe"/>
        </div>
      </div>
    )
  },
  {
    id: 'background',
    priority: 15,
    group: 'color',
    handler: () => {},
    element: (
      <div key="background" className="relative group">
        <div className="w-7 h-7 border border-gray-300 rounded cursor-pointer flex items-center justify-center" title="Hintergrundfarbe">
          <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: currentBackgroundColor }}/>
        </div>
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg p-2 hidden group-hover:block z-50">
          <div className="grid grid-cols-6 gap-1 mb-2">
            {colorSuggestions.map(c => (
              <button key={c} onClick={() => handleBackground(c)}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }} title={c}/>
            ))}
          </div>
          <input type="color" value={currentBackgroundColor} onChange={(e)=>handleBackground(e.target.value)}
                 className="w-full h-8 border border-gray-300 rounded cursor-pointer" title="Benutzerdefinierte Hintergrundfarbe"/>
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
      <button key="strike" onClick={handleStrike}
        className={getButtonClassName('strike', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
        title="Durchgestrichen" style={getButtonIconStyle('strike')}>
        <StrikeIcon />
      </button>
    )
  },
  {
    id: 'line-height',
    priority: 17,
    group: 'style',
    handler: () => {},
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

  // 21–30: Listen & Ausrichtung
  {
    id: 'list-ordered',
    priority: 21,
    group: 'list',
    handler: () => handleList('ordered'),
    element: (
      <button key="list-ordered" onClick={() => handleList('ordered')}
        className={getButtonClassName('list-ordered', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
        title="Nummerierte Liste" style={getButtonIconStyle('list-ordered')}>
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
      <button key="list-bullet" onClick={() => handleList('bullet')}
        className={getButtonClassName('list-bullet', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
        title="Aufzählungsliste" style={getButtonIconStyle('list-bullet')}>
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
      <button key="indent-decrease" onClick={() => handleIndent('-1')}
        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
        title="Einzug verringern">
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
      <button key="indent-increase" onClick={() => handleIndent('+1')}
        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
        title="Einzug erhöhen">
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
      <button key="align-left" onClick={() => handleAlign('')}
        className={getButtonClassName('align-left', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
        title="Linksbündig" style={getButtonIconStyle('align-left')}>
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
      <button key="align-center" onClick={() => handleAlign('center')}
        className={getButtonClassName('align-center', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
        title="Zentriert" style={getButtonIconStyle('align-center')}>
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
      <button key="align-right" onClick={() => handleAlign('right')}
        className={getButtonClassName('align-right', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
        title="Rechtsbündig" style={getButtonIconStyle('align-right')}>
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
      <button key="align-justify" onClick={() => handleAlign('justify')}
        className={getButtonClassName('align-justify', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
        title="Blocksatz" style={getButtonIconStyle('align-justify')}>
        <AlignJustifyIcon />
      </button>
    )
  },

  // 31–40: Specials & Tools
  {
    id: 'link',
    priority: 31,
    group: 'special',
    handler: handleLink,
    element: (
      <button key="link" onClick={handleLink}
        className={getButtonClassName('link', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
        title="Link einfügen" style={getButtonIconStyle('link')}>
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
      <button key="blockquote" onClick={handleBlockquote}
        className={getButtonClassName('blockquote', "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200")}
        title="Zitat" style={getButtonIconStyle('blockquote')}>
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
      <button key="clean" onClick={handleClean}
        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
        title="Formatierung entfernen">
        <CleanIcon />
      </button>
    )
  },
  {
    id: 'export',
    priority: 34,
    group: 'tools',
    handler: () => {},
    element: (
      <div key="export" className="relative group">
        <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200" title="Exportieren">
          <ExportIcon />
        </button>
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg hidden group-hover:block z-50">
          <button onClick={onPrint} className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm">PDF drucken</button>
          <button onClick={() => {}} className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm">DOCX</button>
          <button onClick={() => {}} className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm">TXT</button>
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
      <button key="select-all" onClick={onSelectAll}
        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
        title="Alles auswählen (Strg+A)">
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
      <button key="copy" onClick={onCopy}
        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
        title="Kopieren (Strg+C)">
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
      <button key="paste" onClick={onPaste}
        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
        title="Einfügen (Strg+V)">
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
      <button key="print" onClick={onPrint}
        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
        title="Drucken (Strg+P)">
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
      <button key="templates" onClick={onTemplates}
        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
        title="Vorlagen verwalten">
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
      <button key="settings" onClick={onSettings}
        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
        title="Editor-Einstellungen">
        <SettingsIcon />
      </button>
    )
  },
], [
  onUndo, onRedo, handleBold, handleItalic, handleUnderline, handleStrike,
  handleHeader, handleFont, handleSize, handleColor, handleBackground,
  handleList, handleIndent, handleAlign, handleLink, handleBlockquote,
  handleClean, onSelectAll, onCopy, onPaste, onPrint, onTemplates, onSettings,
  getButtonClassName, getButtonIconStyle, currentTextColor, currentBackgroundColor,
  handleLineHeight, colorSuggestions
]);

  // … deinen kompletten allButtons-Block hier einfügen (unverändert) …

  // Sichtbarkeitsberechnung (unverändert)
  const calculateVisibleButtons = useCallback(() => {
    if (!toolbarRef.current) return;
    const toolbar = toolbarRef.current;
    const toolbarWidth = toolbar.clientWidth;
    const zoomControlsWidth = 180;
    const moreButtonWidth = 40;
    const availableWidth = toolbarWidth - zoomControlsWidth - moreButtonWidth - 24;

    const sortedButtons = [...allButtons].sort((a, b) => a.priority - b.priority);

    const visible: string[] = [];
    const overflow: string[] = [];
    let currentWidth = 0;

    const getButtonWidth = (button: ToolbarButton) => {
      if (button.id.includes('select') || button.id.includes('color') || button.id.includes('background')) {
        return 36;
      }
      if (button.id.includes('header') || button.id.includes('font') || button.id.includes('size')) {
        return 70;
      }
      return 40;
    };

    for (const button of sortedButtons) {
      const buttonWidth = getButtonWidth(button);
      if (currentWidth + buttonWidth <= availableWidth) {
        visible.push(button.id);
        currentWidth += buttonWidth + 2;
      } else {
        overflow.push(button.id);
      }
    }

    setVisibleButtons(visible);
    setOverflowButtons(overflow);
  }, [allButtons]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => calculateVisibleButtons());
    if (toolbarRef.current) resizeObserver.observe(toolbarRef.current);
    calculateVisibleButtons();
    return () => resizeObserver.disconnect();
  }, [calculateVisibleButtons]);

  useEffect(() => {
    const handleResize = () => setTimeout(calculateVisibleButtons, 100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateVisibleButtons]);

  const handleOverflowClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setPopupPosition({ x: e.clientX - 110, y: e.clientY - 60 });
    setPopupOpen(true);
  }, []);

  useEffect(() => {
    if (!popupOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const popupElement = document.getElementById('overflow-popup');
      const moreButton = moreButtonRef.current;
      if (popupElement && !popupElement.contains(target) && moreButton && !moreButton.contains(target)) {
        setPopupOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPopupOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [popupOpen]);

  const handleOverflowButtonClick = useCallback(
    (buttonId: string) => {
      const button = allButtons.find(b => b.id === buttonId);
      button?.handler?.();
      setPopupOpen(false);
    },
    [allButtons]
  );

  const renderVisibleButtons = useCallback(
    () =>
      allButtons
        .filter(button => visibleButtons.includes(button.id))
        .sort((a, b) => a.priority - b.priority)
        .map(button => button.element),
    [allButtons, visibleButtons]
  );

  const renderOverflowButtons = useCallback(() => {
    const overflowButtonsData = allButtons
      .filter(button => overflowButtons.includes(button.id))
      .sort((a, b) => a.priority - b.priority);

    const groups: { [key: string]: ToolbarButton[] } = {};
    overflowButtonsData.forEach(button => {
      if (!groups[button.group]) groups[button.group] = [];
      groups[button.group].push(button);
    });

    return Object.entries(groups).map(([groupName, buttons]) => (
      <div key={groupName} className="overflow-popup-group">
        {buttons.map(button => {
          const el = button.element as React.ReactElement;
          if (button.id.includes('header') || button.id.includes('font') || button.id.includes('size')) {
            return React.cloneElement(el, { key: `overflow-${button.id}` });
          }
          if (button.id.includes('color') || button.id.includes('background')) {
            return React.cloneElement(el, { key: `overflow-${button.id}` });
          }
          const { onClick, className, ...rest } = el.props;
          void onClick;
          return React.cloneElement(el, {
            key: `overflow-${button.id}`,
            onClick: () => handleOverflowButtonClick(button.id),
            className: className?.replace('hover:bg-orange-50', ''),
            ...rest,
          });
        })}
      </div>
    ));
  }, [allButtons, overflowButtons, handleOverflowButtonClick]);

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      {clipboardError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <div className="flex items-center space-x-2 text-red-700 text-sm">
            <span>⚠️</span>
            <span>{clipboardError}</span>
          </div>
        </div>
      )}

      <div ref={toolbarRef} id="custom-toolbar" className="flex items-center justify-between w-full px-3 py-2 gap-1">
        <div className="flex items-center space-x-1 flex-1 overflow-hidden">
          {renderVisibleButtons()}
          {overflowButtons.length > 0 && (
            <button
              ref={moreButtonRef}
              onClick={handleOverflowClick}
              className={`p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-all duration-200 border border-transparent hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 ${
                popupOpen ? 'bg-orange-50 text-orange-600 border-gray-300' : ''
              }`}
              title={`Weitere Funktionen (${overflowButtons.length})`}
            >
              {/* Dein MoreIcon hier */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          )}
        </div>

        {/* Zoom Controls – mit sicheren Werten */}
        <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 flex-shrink-0">
          <button
            onClick={onZoomOut}
            disabled={displayZoom <= safeMin}
            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Verkleinern"
          >
            {/* ZoomOutIcon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>

          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={safeMin}
              max={safeMax}
              step="10"
              value={displayZoom}
              onChange={handleZoomSliderChange}
              className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer zoom-slider"
              title={`Zoom: ${displayZoom}%`}
            />
          </div>

          <button
            onClick={onZoomIn}
            disabled={displayZoom >= safeMax}
            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Vergrößern"
          >
            {/* ZoomInIcon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
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

      {popupOpen &&
        createPortal(
          <div
            id="overflow-popup"
            style={{
              position: 'fixed',
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              background: '#fff',
              border: '2px solid #f29400',
              borderRadius: '8px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
              zIndex: 9999,
              minWidth: '220px',
              maxWidth: '300px',
              padding: '8px',
            }}
          >
            <div className="overflow-popup-content">{renderOverflowButtons()}</div>
          </div>,
          document.body
        )}

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
