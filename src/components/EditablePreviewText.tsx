import React, { useState, useRef, useEffect } from 'react';

interface EditablePreviewTextProps {
  value: string;
  onSave: (newValue: string) => void;
  isTextArea?: boolean;
  className?: string;
  placeholder?: string;
}

export default function EditablePreviewText({
  value,
  onSave,
  isTextArea = false,
  className = '',
  placeholder = 'Klicken zum Bearbeiten...'
}: EditablePreviewTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync with external value changes - but only when NOT editing
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value || '');
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setEditValue(value || '');
    setIsEditing(true);
  };

  const saveChanges = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue !== (value || '')) {
      onSave(trimmedValue);
    }
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTextArea) {
      e.preventDefault();
      saveChanges();
    } else if (e.key === 'Enter' && isTextArea && e.ctrlKey) {
      e.preventDefault();
      saveChanges();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  if (isEditing) {
    const InputComponent = isTextArea ? 'textarea' : 'input';
    const inputSize = isTextArea ? undefined : Math.max(editValue.length || 1, placeholder.length || 1, 8);
    
    return (
      <InputComponent
        ref={inputRef as any}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={saveChanges}
        onKeyDown={handleKeyDown}
        className={`${isTextArea ? 'w-full' : ''} bg-white border border-orange-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300 ${className}`}
        placeholder={placeholder}
        rows={isTextArea ? 3 : undefined}
        size={inputSize}
        style={isTextArea ? {} : { 
          width: `${inputSize}ch`,
          minWidth: `${inputSize}ch`
        }}
      />
    );
  }

  return (
    <span
      onClick={startEditing}
      className={`cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 transition-colors duration-200 ${className}`}
      title="Klicken zum Bearbeiten"
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
    </span>
  );
}