import React from 'react';
import StyleSelector from '../StyleSelector';
import StyledButton from '../StyledButton';

interface GenerateControlsProps {
  selectedStyles: string[];
  onStylesChange: (styles: string[]) => void;
  stylePrompts: {
    [key: string]: { label: string; prompt: string };
  };
  onGenerate: () => void;
  disabled: boolean;
  generating: boolean;
}

export default function GenerateControls({
  selectedStyles,
  onStylesChange,
  stylePrompts,
  onGenerate,
  disabled,
  generating,
}: GenerateControlsProps) {
  return (
    <div className="space-y-6 my-6">
      <StyleSelector selectedStyles={selectedStyles} onStylesChange={onStylesChange} stylePrompts={stylePrompts} />
      <div className="flex justify-center">
        <StyledButton onClick={onGenerate} disabled={disabled} className="px-8 py-4 text-lg" >
          {generating ? 'Wird generiert...' : 'Bewerbungsschreiben generieren'}
        </StyledButton>
      </div>
    </div>
  );
}
