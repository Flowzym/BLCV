import React from 'react';
import TagButton from '../TagButton';

interface TagButtonSelectedProps {
  label: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onRemove?: () => void;
  onEdit?: (newLabel: string) => void;
}

export default function TagButtonSelected({
  label,
  isFavorite = false,
  onToggleFavorite,
  onRemove,
  onEdit,
}: TagButtonSelectedProps) {
  return (
    <TagButton
      label={label}
      variant="selected"
      editable
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      onRemove={onRemove}
      onEdit={onEdit}
    />
  );
}
