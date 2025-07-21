import React from 'react';
import DocumentTypeSelector from './DocumentTypeSelector';

interface SidebarProps {
  documentTypes: {
    [key: string]: {
      label: string;
      prompt: string;
    };
  };
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export default function Sidebar({
  className = '',
  documentTypes,
  selectedType,
  onTypeChange,
}: SidebarProps) {
  return (
    <div className={`${className} overflow-y-auto`}>
      <DocumentTypeSelector
        documentTypes={documentTypes}
        selectedType={selectedType}
        onTypeChange={onTypeChange}
      />
    </div>
  );
}
