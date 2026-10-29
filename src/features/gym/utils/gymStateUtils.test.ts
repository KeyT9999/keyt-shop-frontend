import { describe, expect, it } from 'vitest';
import {
  advanceToNextGymSplitDay,
  createInitialGymState,
  mergeGymClientAndServerState,
  normalizeDailySessionRollover,
  resolveExercisesForDay,
} from './gymStateUtils';

describe('gymStateUtils', () => {
  it('creates 5 default days matching user routine and resolves exercises cleanly', () => {
    const state = createInitialGymState('2026-10-29');
    expect(state.customDays).toHaveLength(5);
    expect(state.customDays[0].title).toBe('Ngực');
    expect(state.customDays[1].title).toBe('Tay Sau – Lưng');
    expect(state.customDays[2].title).toBe('Tay Trước – Vai');
    expect(state.customDays[3].title).toBe('Chân');

    const day3Exercises = resolveExercisesForDay(state.customDays[2]);
    expect(day3Exercises.some((e) => e.id === 'hammer_curl')).toBe(true);
  });

  it('auto-advances to next split day on calendar rollover only when previous day had completed exercises', () => {
    const initial = createInitialGymState('2026-10-28');
    // No exercise completed yesterday -> stay on Day 1
    const stayed = normalizeDailySessionRollover(initial, '2026-10-29');
    expect(stayed.activeDayId).toBe('day1');

    // Completed at least 1 exercise yesterday -> move to Day 2 and clear today's checkmarks
    const withProgress = {
      ...initial,
      completedExerciseIdsToday: ['incline_dumbbell_press'],
    };
    const advanced = normalizeDailySessionRollover(withProgress, '2026-10-29');
    expect(advanced.activeDayId).toBe('day2');
    expect(advanced.completedExerciseIdsToday).toEqual([]);
    expect(advanced.sessionDateKey).toBe('2026-10-29');
  });

  it('wraps around from Day 5 back to Day 1 when finishing cycle', () => {
    const state = {
      ...createInitialGymState('2026-10-29'),
      activeDayId: 'day5',
    };
    const wrapped = advanceToNextGymSplitDay(state, 1700000000000, '2026-10-29');
    expect(wrapped.activeDayId).toBe('day1');
    expect(wrapped.workoutStreak).toBe(1);
  });

  it('merges LocalStorage and Server logs keeping newest weight per exercise', () => {
    const local = {
      ...createInitialGymState('2026-10-29'),
      activeDayId: 'day3',
      clientUpdatedAt: 2000,
      exerciseLogs: {
        hammer_curl: {
          exerciseId: 'hammer_curl',
          weightKg: 12,
          repsNote: '3x12',
          personalTip: '',
          updatedAtMs: 2500,
        },
        barbell_squat: {
          exerciseId: 'barbell_squat',
          weightKg: 30,
          repsNote: '',
          personalTip: '',
          updatedAtMs: 1000,
        },
      },
    };

    const remote = {
      activeDayId: 'day1',
      completedExerciseIdsToday: [],
      sessionDateKey: '2026-10-29',
      workoutStreak: 4,
      lastCompletedSessionDate: '2026-10-28',
      customDays: local.customDays,
      clientUpdatedAt: 1500,
      exerciseLogs: [
        {
          exerciseId: 'hammer_curl',
          weightKg: 10,
          repsNote: '3x10',
          personalTip: '',
          updatedAtMs: 1200,
        },
        {
          exerciseId: 'barbell_squat',
          weightKg: 35,
          repsNote: '4x8',
          personalTip: 'Đeo đai lưng',
          updatedAtMs: 3000,
        },
      ],
    };

    const merged = mergeGymClientAndServerState(local, remote, '2026-10-29');
    expect(merged.activeDayId).toBe('day3');
    expect(merged.workoutStreak).toBe(4);
    expect(merged.exerciseLogs.hammer_curl.weightKg).toBe(12);
    expect(merged.exerciseLogs.barbell_squat.weightKg).toBe(35);
    expect(merged.exerciseLogs.barbell_squat.personalTip).toBe('Đeo đai lưng');
  });
});
