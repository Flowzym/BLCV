import React from 'react';
import Sidebar from '../Sidebar';

interface DocumentTypeBlockProps {
  documentTypes: {
    [key: string]: { label: string; prompt: string };
  };
  selected: string;
  onChange: (type: string) => void;
}

export default function DocumentTypeBlock({ documentTypes, selected, onChange }: DocumentTypeBlockProps) {
  return (
    <div className="my-6">
      <Sidebar documentTypes={documentTypes} selectedType={selected} onTypeChange={onChange} />
    </div>
  );
}
