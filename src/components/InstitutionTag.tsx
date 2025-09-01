import React from 'react';
import { useLebenslauf } from './LebenslaufContext';
import TagButtonSelected from './ui/TagButtonSelected';

interface InstitutionTagProps {
  label: string;
  onRemove: () => void;
  onEdit?: (newLabel: string) => void;
}

export default function InstitutionTag({ label, onRemove, onEdit }: InstitutionTagProps) {
  const { favoriteInstitutions, toggleFavoriteInstitution } = useLebenslauf();
  const isFavorite = favoriteInstitutions.includes(label);

  return (
    <TagButtonSelected
      label={label}
      isFavorite={isFavorite}
      onToggleFavorite={() => toggleFavoriteInstitution(label)}
      onRemove={onRemove}
      onEdit={(newLabel) => onEdit?.(newLabel)}
    />
  );
}