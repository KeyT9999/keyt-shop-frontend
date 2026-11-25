import { describe, expect, it } from 'vitest';
import type { GymWorkoutHistoryEntry, GymWorkoutSetDraft } from '../types/gym';
import { getWorkoutUiHelp } from './gymCoachUiHelp';
import { getExerciseDraftProgress, getWorkoutGoal, mergeWorkoutSetDrafts, selectWorkoutSetDrafts } from './gymWorkoutProgress';

const draft: GymWorkoutSetDraft = {
  dateKey: '2026-11-25',
  gender: 'female',
  dayId: 'f_session_1',
  exerciseId: 'machine_hip_thrust',
  goalLabel: '4 hiệp × 12–15 lần',
  sets: [
    { setNumber: 0, isWarmup: true, completed: true, weightKg: 10, reps: 12 },
    { setNumber: 1, completed: true, weightKg: 15, reps: 13 },
    { setNumber: 2, completed: true, weightKg: 0, reps: 12 },
    { setNumber: 3, completed: false, weightKg: 30, reps: 15 },
  ],
  updatedAtMs: 20,
};

describe('workout progress by session', () => {
  it('counts only working sets, accepting a recorded weight of zero', () => {
    expect(getExerciseDraftProgress(draft)).toMatchObject({ completed: false, volume: 195 });
    expect(getExerciseDraftProgress({ ...draft, goalLabel: '2 × 45–60 giây' })).toMatchObject({
      completed: true, volume: 0,
    });
    expect(getWorkoutGoal('3 hiệp × 12–15 lần (Deload êm khớp)')).toMatchObject({
      workingSets: 3, label: '12–15 lần',
    });
  });

  it('keeps overlapping exercises separate and discards previously saved sets', () => {
    const otherDraft = { ...draft, dayId: 'f_session_2' };
    const nextAttempt = { ...draft, updatedAtMs: 35 };
    const history: GymWorkoutHistoryEntry = {
      id: 'saved', dateKey: draft.dateKey, gender: draft.gender, dayId: draft.dayId, createdAtMs: 25,
      status: 'partial', dayTitle: 'Buổi 1', durationMinutes: 0, completedExercisesCount: 0,
      totalVolumeKg: 195, caloriesBurned: 0, prCount: 0, prHighlights: [],
    };
    const merged = mergeWorkoutSetDrafts([otherDraft, nextAttempt], [draft], [history], draft.dateKey);
    expect(selectWorkoutSetDrafts(merged, draft.dateKey, 'female', draft.dayId)).toEqual([nextAttempt]);
    expect(selectWorkoutSetDrafts(merged, draft.dateKey, 'female', 'f_session_2')).toEqual([otherDraft]);
  });
});

describe('in-app Coach help', () => {
  it.each([75, 90])('names the real controls and the current %i-second rest setting', (seconds) => {
    const help = getWorkoutUiHelp('Làm sao dùng nút ghi hiệp và đồng hồ nghỉ?', seconds);
    expect(help).toContain('**Xong**');
    expect(help).toContain('**Nghỉ ' + seconds + 's**');
    expect(help).not.toContain('Start');
  });

  it('leaves training advice to the existing Coach', () => {
    expect(getWorkoutUiHelp('Đẩy ngực trên nên chọn mức tạ nào?', 90)).toBeNull();
  });
});
