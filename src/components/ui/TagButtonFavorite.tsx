import React from 'react';
import TagButton from '../TagButton';
import { TagContext } from '../../types/TagContext';

interface TagButtonFavoriteProps {
  label: string;
  onClick?: () => void;
  onRemove?: () => void;
}

export default function TagButtonFavorite({ label, onClick, onRemove }: TagButtonFavoriteProps) {
  return (
    <TagButton
      label={label}
      variant={TagContext.Favorite}
      isFavorite
      onClick={onClick}
      onRemove={onRemove}
    />
  );
}
