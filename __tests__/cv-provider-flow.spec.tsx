import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LebenslaufProvider, useLebenslauf } from '@/components/LebenslaufContext';

const Harness: React.FC = () => {
  const c = useLebenslauf() as any;
  return (
    <div>
      <div data-testid="count">{c.berufserfahrung?.length ?? 0}</div>
      <div data-testid="selected">{c.selectedExperienceId || ''}</div>
      <button onClick={() => {
        const id = c.addExperience?.({
          companies: [], position: [], startMonth: null, startYear: '2024',
          endMonth: null, endYear: null, isCurrent: true, aufgabenbereiche: []
        }) || '';
        c.selectExperience?.(id);
      }}>add</button>
      <button onClick={() => {
        const id = c.selectedExperienceId;
        if (id) c.updateExperienceTasksOrder?.(id, ['A', 'B', 'C']);
      }}>tasks</button>
    </div>
  );
};

describe('LebenslaufProvider flow (add/select/set tasks)', () => {
  it('adds an experience and selects it', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<LebenslaufProvider><Harness /></LebenslaufProvider>);
    expect(screen.getByTestId('count').textContent).toBe('0');
    await user.click(screen.getByText('add'));
    expect(Number(screen.getByTestId('count').textContent)).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('selected').textContent).not.toBe('');
    await user.click(screen.getByText('tasks')); // smoke: no crash
    unmount();
  });
});
