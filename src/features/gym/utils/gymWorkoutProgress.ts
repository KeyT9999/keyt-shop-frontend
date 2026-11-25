import type { GymGenderMode, GymWorkoutHistoryEntry, GymWorkoutSetDraft } from '../types/gym';

export function getWorkoutGoal(goalLabel: string) {
  const [setLabel = '', target = ''] = goalLabel.split('×');
  const setRange = setLabel.match(/\d+/g);
  const workingSets = Math.min(12, Number(setRange?.at(-1)) || 3);
  const minWorkingSets = Math.min(workingSets, Number(setRange?.[0]) || workingSets);
  const valueRange = target.match(/\d+(?:\s*[–-]\s*\d+)?/)?.[0] || '12';
  const unit = target.includes('giây') ? 'giây' : target.includes('phút') ? 'phút' : 'lần';
  const defaultAmount = Number(valueRange.match(/\d+/g)?.at(-1)) || 12;
  return { workingSets, minWorkingSets, label: `${valueRange} ${unit}`, unit, defaultAmount };
}

export function workoutDraftKey(
  draft: Pick<GymWorkoutSetDraft, 'dateKey' | 'gender' | 'dayId' | 'exerciseId'>,
) {
  return JSON.stringify([draft.dateKey, draft.gender, draft.dayId, draft.exerciseId]);
}

export function mergeWorkoutSetDrafts(
  first: GymWorkoutSetDraft[] | undefined,
  second: GymWorkoutSetDraft[] | undefined,
  history: GymWorkoutHistoryEntry[],
  dateKey: string,
) {
  const byKey = new Map<string, GymWorkoutSetDraft>();
  for (const draft of [...(first ?? []), ...(second ?? [])]) {
    if (draft.dateKey !== dateKey) continue;
    if (history.some((entry) => entry.dateKey === draft.dateKey && entry.gender === draft.gender &&
      entry.dayId === draft.dayId && entry.createdAtMs >= draft.updatedAtMs)) continue;
    const key = workoutDraftKey(draft);
    if ((byKey.get(key)?.updatedAtMs ?? -1) <= draft.updatedAtMs) byKey.set(key, draft);
  }
  return [...byKey.values()].sort((a, b) => b.updatedAtMs - a.updatedAtMs).slice(0, 150);
}

export function selectWorkoutSetDrafts(
  drafts: GymWorkoutSetDraft[] = [],
  dateKey: string,
  gender: GymGenderMode,
  dayId?: string,
) {
  return drafts.filter((draft) => draft.dateKey === dateKey && draft.gender === gender && draft.dayId === dayId);
}

export function getExerciseDraftProgress(draft?: GymWorkoutSetDraft) {
  const completedSets = draft?.sets.filter((set) => set.completed && !set.isWarmup) ?? [];
  const completed = Boolean(draft && completedSets.length >= getWorkoutGoal(draft.goalLabel).minWorkingSets);
  const volume = draft && getWorkoutGoal(draft.goalLabel).unit === 'lần'
    ? completedSets.reduce((sum, set) => sum + set.weightKg * set.reps, 0)
    : 0;
  const liftedPrKg = completedSets.reduce((max, set) => Math.max(max, set.weightKg), 0);
  const newPrKg = liftedPrKg > (draft?.startingPrKg ?? 0) ? liftedPrKg : 0;
  return { completed, completedSets, volume, newPrKg };
}
