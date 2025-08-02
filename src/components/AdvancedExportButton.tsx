/**
 * Advanced Export Button Component
 * Enhanced export button with dialog integration and batch support
 */

import React, { useState } from 'react';
import { CVData, DesignConfig, ExportFormat } from '@/types/cv-designer';
import { BatchExportItem } from '@/hooks/useAdvancedExport';
import { Button } from '@/components/ui/button';
import { ExportDialog } from './ExportDialog';
import { Download, FileStack } from 'lucide-react';

interface AdvancedExportButtonProps {
  cvData?: CVData;
  designConfig?: DesignConfig;
  batchItems?: BatchExportItem[];
  defaultFormat?: ExportFormat;
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
    setIsDialogOpen(true);
  };

  return (
    <>
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

      <ExportDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        cvData={cvData}
        designConfig={designConfig}
        batchItems={batchItems}
        defaultFormat={defaultFormat}
      />
    </>
  );
};

export default AdvancedExportButton;