/**
 * Advanced Export Button Component
 * Enhanced export button with dialog integration and batch support
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileStack } from 'lucide-react';

interface AdvancedExportButtonProps {
  cvData?: any;
  designConfig?: any;
  batchItems?: any[];
  defaultFormat?: 'pdf' | 'docx' | 'json';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const AdvancedExportButton: React.FC<AdvancedExportButtonProps> = ({
  cvData,
  designConfig,
  batchItems = [],
  defaultFormat = 'pdf',
  variant = 'default',
  size = 'default',
  className = '',
  children
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isBatchMode = batchItems.length > 1;
  const hasData = (cvData && designConfig) || batchItems.length > 0;

  const handleClick = () => {
    if (!hasData) {
      alert('No CV data available for export');
      return;
    }
    
    // Simple export logic - in a real app this would open a dialog
    const exportData = {
      cvData,
      designConfig,
      batchItems,
      format: defaultFormat,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `advanced-cv-export-${defaultFormat}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={!hasData}
    >
      {isBatchMode ? (
        <FileStack className="w-4 h-4 mr-2" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {children || (isBatchMode ? `Export ${batchItems.length} CVs` : 'Export CV')}
    </Button>
  );
};

export default AdvancedExportButton;