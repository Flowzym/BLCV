import React from 'react';
import { useLebenslauf } from './LebenslaufContext';
import TagButtonSelected from './ui/TagButtonSelected';

interface TaskTagProps {
  label: string;
  onRemove: () => void;
  onEdit?: (newLabel: string) => void;
}

export default function TaskTag({ label, onRemove, onEdit }: TaskTagProps) {
  const { favoriteTasks, toggleFavoriteTask } = useLebenslauf();
  const isFavorite = favoriteTasks.includes(label);

  return (
    <TagButtonSelected
      label={label}
      isFavorite={isFavorite}
      onToggleFavorite={() => toggleFavoriteTask(label)}
      onEdit={(newLabel) => onEdit?.(newLabel)}
      onRemove={onRemove}
    />
  );
}
