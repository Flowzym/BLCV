import { describe, it, expect } from 'vitest';
import { LebenslaufProvider, useLebenslauf } from '@/components/LebenslaufContext';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const Harness: React.FC = () => {
  const c = useLebenslauf() as any;
  return (
    <div>
      <div data-testid="favCompanies">{(c.getFavorites?.('company') || []).join(',')}</div>
      <button onClick={() => c.toggleFavorite?.('company', 'JavaScript')}>toggle JS</button>
      <button onClick={() => c.toggleFavorite?.('company', 'javascript')}>toggle js lower</button>
      <div data-testid="isFav">{String(c.isFavorite?.('company', 'JAVASCRIPT'))}</div>
      <div data-testid="sorted">{(c.sortByFavorite?.('company', ['Python','JavaScript','C#']) || []).join(',')}</div>
    </div>
  );
};

describe('Unified favorites API', () => {
  it('is case-insensitive and stable', async () => {
    const user = userEvent.setup();
    render(<LebenslaufProvider><Harness /></LebenslaufProvider>);
    await user.click(screen.getByText('toggle JS'));
    expect(screen.getByTestId('isFav').textContent).toBe('true');
    // toggling lower-case removes it (case-insensitive)
    await user.click(screen.getByText('toggle js lower'));
    expect(screen.getByTestId('isFav').textContent).toBe('false');
    // sorting should pin favorite to front when ON
    await user.click(screen.getByText('toggle JS')); // on
    const sorted = screen.getByTestId('sorted').textContent || '';
    expect(sorted.split(',')[0].toLowerCase()).toBe('javascript');
  });
});
