import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_USER_5DAY_SPLIT,
  GYM_EXERCISE_CATALOG,
} from '../data/defaultGymCatalog';
import { resolveExercisesForDay } from '../utils/gymStateUtils';
import GymSelectorCockpit from './GymSelectorCockpit';

describe('GymSelectorCockpit (Dual Dropdown Mobile Navigation)', () => {
  const activeDay = DEFAULT_USER_5DAY_SPLIT[0];
  const dayExercises = resolveExercisesForDay(activeDay);

  it('opens Day dropdown to switch workout days and Exercise dropdown to switch exercises', () => {
    const onSelectDay = vi.fn();
    const onSelectExercise = vi.fn();
    const onToggleDone = vi.fn();

    render(
      <GymSelectorCockpit
        days={DEFAULT_USER_5DAY_SPLIT}
        activeDay={activeDay}
        dayExercises={dayExercises}
        currentExercise={dayExercises[0] || GYM_EXERCISE_CATALOG[0]}
        currentOrderIndex={0}
        completedIdsToday={[]}
        exerciseLogs={{}}
        workoutStreak={2}
        syncStatus="local-only"
        onSelectDay={onSelectDay}
        onSelectExercise={onSelectExercise}
        onToggleExerciseDone={onToggleDone}
        onCompleteDayAndAdvance={vi.fn()}
        onOpenCustomizer={vi.fn()}
      />
    );

    // 1. Open Day dropdown and select Day 2
    fireEvent.click(screen.getByRole('button', { name: /Ngày 1/i }));
    const day2Option = screen.getByRole('button', { name: /Tay Sau – Lưng/i });
    fireEvent.click(day2Option);
    expect(onSelectDay).toHaveBeenCalledWith('day2');

    // 2. Open Exercise dropdown and select Exercise 2
    fireEvent.click(screen.getByRole('button', { name: /Bài 1\//i }));
    const ex2Item = screen.getByText(dayExercises[1].vietnameseName);
    fireEvent.click(ex2Item);
    expect(onSelectExercise).toHaveBeenCalledWith(dayExercises[1].id);

    // 3. Quick Next button advances to Exercise 2
    fireEvent.click(screen.getByRole('button', { name: 'Bài tập tiếp theo' }));
    expect(onSelectExercise).toHaveBeenCalledWith(dayExercises[1].id);
  });
});
