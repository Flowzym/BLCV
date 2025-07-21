import React from 'react';
import CoverLetterDisplay from '../CoverLetterDisplay';

interface EditorBlockProps {
  content: string;
  isEditing: boolean;
  onEdit: (instruction: string) => void;
  onContentChange?: (c: string) => void;
  editPrompts: {
    [key: string]: { label: string; prompt: string };
  };
}

export default function EditorBlock({ content, isEditing, onEdit, onContentChange, editPrompts }: EditorBlockProps) {
  return (
    <div className="my-6">
      <CoverLetterDisplay
        content={content}
        isEditing={isEditing}
        onEdit={onEdit}
        onContentChange={onContentChange}
        editPrompts={editPrompts}
      />
    </div>
  );
}
