import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LearningModeSelector from './LearningModeSelector';

describe('LearningModeSelector passive listening mode', () => {
  afterEach(cleanup);

  it('shows the mode only when the feature flag is enabled and selects it', () => {
    const onSelectMode = vi.fn();
    const { rerender } = render(
      <LearningModeSelector activeMode="flashcard" onSelectMode={onSelectMode} passiveListeningEnabled={false} />
    );

    expect(screen.queryByRole('button', { name: 'Nghe thụ động' })).toBeNull();

    rerender(
      <LearningModeSelector activeMode="flashcard" onSelectMode={onSelectMode} passiveListeningEnabled />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Nghe thụ động' }));

    expect(onSelectMode).toHaveBeenCalledWith('passive-listening');
  });
});
