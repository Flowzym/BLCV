import { describe, it, expectTypeOf } from 'vitest';
import TagButton from '@/components/TagButton';
import type { ComponentProps } from 'react';

describe('UI Contract: TagButton', () => {
  it('keeps the TagButton props stable', () => {
    type Props = ComponentProps<typeof TagButton>;
    // Expected minimal public surface
    expectTypeOf<Props>().toMatchTypeOf<{
      label: string;
      isFavorite?: boolean;
      variant?: 'selected' | 'suggestion' | 'favorite';
      editable?: boolean;
      type?: string;
      onToggleFavorite?: (label: string, type?: string) => void;
      onRemove?: () => void;
      onEdit?: (newLabel: string) => void;
      onClick?: () => void;
    }>();
  });
});
