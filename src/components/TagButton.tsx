import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import IconStar from "./IconStar";
import TagContext from "../types/TagContext";

interface TagButtonProps {
  label: string;
  isFavorite?: boolean;
  variant?: "selected" | "suggestion" | "favorite";
  editable?: boolean;
  type?: string;
  onToggleFavorite?: (label: string, type?: string) => void;
  onRemove?: () => void;
  onEdit?: (newLabel: string) => void;
  onClick?: () => void;
}

export default function TagButton({
  label,
  isFavorite = false,
  variant = TagContext.Suggestion,
  editable = false,
  type,
  onToggleFavorite,
  onRemove,
  onEdit,
  onClick,
}: TagButtonProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const [originalLabel, setOriginalLabel] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  // Nur setzen wenn sich das Label ändert UND wir nicht gerade bearbeiten
  useEffect(() => {
    if (!editing && label !== originalLabel) {
      setEditValue(label || '');
      setOriginalLabel(label || '');
    }
  }, [label, editing, originalLabel]);

  const startEditing = (e: React.MouseEvent) => {
    if (!editable) return;
    e.stopPropagation();
    setEditValue(label || '');
    setOriginalLabel(label || '');
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const finishEditing = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== originalLabel && onEdit) {
      onEdit?.(trimmed);
    }
    setEditing(false);
  };

  const cancelEditing = () => {
    setEditValue(originalLabel);
    setEditing(false);
  };

  const handleEditKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      finishEditing();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(label, type);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  // Basis-Klassen für alle Buttons
  const baseClasses = "inline-flex items-center rounded-full border transition-colors duration-200";
  
  // Varianten-spezifische Klassen
  let variantClasses = "";
  let textClasses = "";
  let containerClasses = "";
  let starSize = 12;
  let xSize = "w-3 h-3";
  let starStroke = "#4B5563";
  let starFill = "none";
  let starStrokeWidth = 1;
  
  if (variant === TagContext.Selected) {
    // Ausgewählter Button: Orange, größer, fett
    variantClasses = "bg-[#F29400] text-white border-transparent";
    textClasses = "text-sm font-bold tracking-wide";
    containerClasses = "flex items-center space-x-1";
    starSize = 19;
    xSize = "w-3.5 h-3.5";
    starStroke = "#FFFFFF";
    starFill = isFavorite ? "#FDE047" : "none"; 
    starStrokeWidth = isFavorite ? 1 : 1;
  } else if (variant === TagContext.Favorite) {
    // Favoriten-Button: Grau mit dicker gelber Umrandung
    variantClasses = "bg-[#F8F8F8] text-gray-600 border-2 border-[#fff6c5]";
    textClasses = "text-sm font-normal tracking-wide";
    containerClasses = "flex items-center space-x-1";
    starSize = 16; // Größerer Stern für Favoriten
    xSize = "w-3 h-3";
    starStroke = "#FDE047";
    starFill = "#FDE047";
    starStrokeWidth = isFavorite ? 1 : 1;
  } else {
    // Suggestion/Standard Button
    variantClasses = "bg-[#F8F8F8] text-gray-700 border-gray-300";
    textClasses = "text-sm font-normal tracking-wide";
    containerClasses = "flex items-center space-x-1";
    starSize = 12;
    xSize = "w-3 h-3";
    starStroke = isFavorite ? "#FDE047" : "#4B5563";
    starFill = isFavorite ? "#FDE047" : "none";
    starStrokeWidth = isFavorite ? 1 : 1;
  }

  // Inline-Styles für garantierte Anwendung
  let buttonStyle: React.CSSProperties = {};
  if (variant === TagContext.Selected) {
    buttonStyle = { padding: '0.2rem 0.6rem' };
  } else if (variant === TagContext.Favorite) {
    buttonStyle = {
      padding: '0.125rem 0.375rem 0.125rem 0.625rem',
      borderColor: '#fff6c5'
    };
  } else {
    buttonStyle = { padding: '0.25rem 0.5rem' };
  }

  return (
    <button 
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
      style={buttonStyle}
    >
      <div className={containerClasses}>
        {/* Text-Bereich */}
        <div className="text-left">
          {editing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={handleEditChange}
              onBlur={finishEditing}
              onKeyDown={handleEditKey}
              className="bg-transparent outline-none text-current"
              style={{ 
                width: `${Math.max(editValue.length + 1, 6)}ch`,
                minWidth: `${Math.max(editValue.length + 1, 6)}ch`
              }}
            />
          ) : (
            <span 
              onClick={startEditing}
              className={`${textClasses} ${editable ? "cursor-text" : ""} leading-none`}
            >
              {label}
            </span>
          )}
        </div>
        
        {/* Icon-Bereich */}
        <div className="flex items-center space-x-1">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label="Favorit"
              className="flex items-center justify-center flex-shrink-0"
            >
              <IconStar
                size={starSize}
                stroke={starStroke}
                fill={starFill} 
                strokeWidth={starStrokeWidth}
              />
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Entfernen"
              className="flex items-center justify-center flex-shrink-0"
            >
              <X className={`${xSize} text-current`} />
            </button>
          )}
        </div>
      </div>
    </button>
  );
}