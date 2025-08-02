/**
 * Export Button Component
 * Simple export button for CV data
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  cvData?: any;
  designConfig?: any;
  format?: 'pdf' | 'docx' | 'json';
  showDropdown?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  cvData,
  designConfig,
  format = 'pdf',
  showDropdown = false,
  className = '',
  children,
  onClick
}) => {
  const handleExport = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (!cvData) {
      alert('No CV data available for export');
      return;
    }

    // Simple export logic - in a real app this would be more sophisticated
    const exportData = {
      cvData,
      designConfig,
      format,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-export-${format}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={handleExport}
      className={className}
      disabled={!cvData}
    >
      <Download className="w-4 h-4 mr-2" />
      {children || `Export ${format.toUpperCase()}`}
    </Button>
  );
};

export default ExportButton;