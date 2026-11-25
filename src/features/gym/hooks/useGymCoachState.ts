import { useCallback, useEffect, useRef, useState } from 'react';
import { gymSyncService } from '../services/gymSyncService';
import type {
  GymAiChatMessage,
  GymBodyMetricEntry,
  GymClientPersistedState,
  GymCycleTrackingState,
  GymExerciseUserLog,
  GymFemaleBodyProfile,
  GymGenderMode,
  GymRestrictionKind,
  GymSetDetailItem,
  GymSplitDayConfig,
  GymWorkoutHistoryEntry,
  GymWorkoutSummary,
} from '../types/gym';
import { GYM_EXERCISE_MAP } from '../data/defaultGymCatalog';
import { sharesGymStation } from '../utils/gymExerciseSubstitutionUtils';
import { mergeWorkoutSetDrafts, selectWorkoutSetDrafts } from '../utils/gymWorkoutProgress';
import { computeEstimated1RM } from '../utils/gymCycleAndProgressionUtils';
import {
  advanceToNextGymSplitDay,
  cloneDefaultSplitDays,
  computeSmartWorkoutStreak,
  createInitialGymState,
  getTodayLocalDateKey,
  mergeGymClientAndServerState,
  normalizeDailySessionRollover,
  serializeGymStateForServer,
} from '../utils/gymStateUtils';

const STORAGE_KEY = 'keyt_gym_coach_state_v1';

export type GymCloudSyncStatus = 'local-only' | 'syncing' | 'synced' | 'offline-saved';

function readPersistedLocalState(): GymClientPersistedState {
  const todayKey = getTodayLocalDateKey();
  if (typeof window === 'undefined') {
    return createInitialGymState(todayKey);
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialGymState(todayKey);
    const parsed = JSON.parse(raw) as GymClientPersistedState;
    return normalizeDailySessionRollover(parsed, todayKey);
  } catch {
    return createInitialGymState(todayKey);
  }
}

function writePersistedLocalState(next: GymClientPersistedState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn('⚠️ [GymCoach] Failed to write localStorage:', err);
  }
}

export function useGymCoachState(token: string | null) {
  const [state, setState] = useState<GymClientPersistedState>(readPersistedLocalState);
  const [cloudStatus, setCloudStatus] = useState<Exclude<GymCloudSyncStatus, 'local-only'>>(
    'syncing'
  );

  const debounceRef = useRef<number | null>(null);
  const hydratedTokenRef = useRef<string | null>(null);
  const latestStateRef = useRef<GymClientPersistedState>(state);

  const scheduleCloudSave = useCallback(
    (nextState: GymClientPersistedState) => {
      if (!token) return;
      setCloudStatus('syncing');
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(async () => {
        try {
          await gymSyncService.saveProfile(token, serializeGymStateForServer(nextState));
          setCloudStatus('synced');
        } catch (err) {
          console.warn('⚠️ [GymCoach] Cloud sync deferred (kept in localStorage):', err);
          setCloudStatus('offline-saved');
        }
      }, 1000);
    },
    [token]
  );

  // Initial pull & merge when user logs in
  useEffect(() => {
    if (!token) {
      hydratedTokenRef.current = null;
      return;
    }
    if (hydratedTokenRef.current === token) return;
    hydratedTokenRef.current = token;

    let cancelled = false;

    gymSyncService
      .fetchProfile(token)
      .then(async (remote) => {
        if (cancelled) return;
        const merged = mergeGymClientAndServerState(
          latestStateRef.current,
          remote,
          getTodayLocalDateKey()
        );
        latestStateRef.current = merged;
        writePersistedLocalState(merged);
        setState(merged);

        if (!remote || (merged.clientUpdatedAt || 0) > (remote.clientUpdatedAt || 0)) {
          await gymSyncService.saveProfile(token, serializeGymStateForServer(merged));
        }
        if (!cancelled) setCloudStatus('synced');
      })
      .catch((err) => {
        console.warn('⚠️ [GymCoach] Initial cloud fetch failed, using offline state:', err);
        if (!cancelled) setCloudStatus('offline-saved');
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const commitUpdate = useCallback(
    (updater: (prev: GymClientPersistedState) => GymClientPersistedState) => {
      const prev = latestStateRef.current;
      const updated = updater(prev);
      if (updated === prev) return false;
      const next = { ...updated, clientUpdatedAt: Math.max(updated.clientUpdatedAt || 0, (prev.clientUpdatedAt || 0) + 1) };
      latestStateRef.current = next;
      writePersistedLocalState(next);
      setState(next);
      scheduleCloudSave(next);
      return true;
    },
    [scheduleCloudSave]
  );

  const selectDay = useCallback(
    (dayId: string, gender?: GymGenderMode) => {
      commitUpdate((prev) => ({
        ...prev,
        activeDayId: dayId,
        activeMaleDayId: gender === 'male' ? dayId : prev.activeMaleDayId,
        activeFemaleDayId: gender === 'female' ? dayId : prev.activeFemaleDayId,
        clientUpdatedAt: Date.now(),
      }));
    },
    [commitUpdate]
  );

  const toggleExerciseDone = useCallback(
    (exerciseId: string) => {
      commitUpdate((prev) => {
        const exists = prev.completedExerciseIdsToday.includes(exerciseId);
        const nextCompleted = exists
          ? prev.completedExerciseIdsToday.filter((id) => id !== exerciseId)
          : [...prev.completedExerciseIdsToday, exerciseId];
        return {
          ...prev,
          completedExerciseIdsToday: nextCompleted,
          sessionDateKey: getTodayLocalDateKey(),
          clientUpdatedAt: Date.now(),
        };
      });
    },
    [commitUpdate]
  );

  const completeDayAndAdvance = useCallback(() => {
    commitUpdate((prev) => advanceToNextGymSplitDay(prev, Date.now(), getTodayLocalDateKey()));
  }, [commitUpdate]);

  const saveExerciseLog = useCallback(
    (
      exerciseId: string,
      weightKg: number,
      repsNote: string,
      personalTip: string,
      extra?: {
        seatPinNote?: string;
        setsDetail?: GymSetDetailItem[];
        setsCompletedToday?: number[];
        autoMarkCompleted?: boolean;
        workout?: { gender: GymGenderMode; dayId: string; goalLabel: string };
      }
    ) => {
      const now = Date.now();
      const todayKey = getTodayLocalDateKey();
      commitUpdate((prev) => {
        const prevLog: GymExerciseUserLog | undefined = prev.exerciseLogs[exerciseId];
        const cleanWeight = Math.max(0, Number(weightKg) || 0);
        const workout = extra?.workout;
        const nextSetsDetail = extra?.setsDetail ?? prevLog?.setsDetail;
        const updatedAtMs = Math.max(now, (prev.clientUpdatedAt || 0) + 1);
        const workoutSetDrafts = workout && extra.setsDetail
          ? mergeWorkoutSetDrafts(prev.workoutSetDrafts, [{
              dateKey: todayKey,
              gender: workout.gender,
              dayId: workout.dayId,
              exerciseId,
              goalLabel: workout.goalLabel,
              sets: extra.setsDetail,
              startingPrKg: selectWorkoutSetDrafts(prev.workoutSetDrafts, todayKey, workout.gender, workout.dayId)
                .find((draft) => draft.exerciseId === exerciseId)?.startingPrKg ?? prevLog?.personalRecordKg ?? 0,
              updatedAtMs,
            }], prev.workoutHistory ?? [], todayKey)
          : prev.workoutSetDrafts;
        const nextCompletedSets =
          extra?.setsCompletedToday ??
          (nextSetsDetail
            ? nextSetsDetail.filter((s) => s.completed && !s.isWarmup).map((s) => s.setNumber)
            : prevLog?.setsCompletedToday || []);

        let maxSetW = 0;
        let maxSet1RM = 0;
        if (nextSetsDetail) {
          for (const s of nextSetsDetail) {
            if (s.completed && !s.isWarmup && s.weightKg > 0) {
              if (s.weightKg > maxSetW) maxSetW = s.weightKg;
              const e1 = computeEstimated1RM(s.weightKg, s.reps || 10);
              if (e1 > maxSet1RM) maxSet1RM = e1;
            }
          }
        }

        const personalRecordKg = Math.max(
          prevLog?.personalRecordKg || 0,
          workout ? 0 : Math.max(prevLog?.weightKg || 0, cleanWeight),
          maxSetW
        );
        const estimated1RM = Math.max(
          prevLog?.estimated1RM || 0,
          workout ? 0 : computeEstimated1RM(cleanWeight, 10),
          maxSet1RM
        );

        const nextCompletedExIds =
          !workout && extra?.autoMarkCompleted && !prev.completedExerciseIdsToday.includes(exerciseId)
            ? [...prev.completedExerciseIdsToday, exerciseId]
            : prev.completedExerciseIdsToday;

        return {
          ...prev,
          completedExerciseIdsToday: nextCompletedExIds,
          sessionDateKey: todayKey,
          clientUpdatedAt: updatedAtMs,
          workoutSetDrafts,
          exerciseLogs: {
            ...prev.exerciseLogs,
            [exerciseId]: {
              exerciseId,
              weightKg: cleanWeight,
              repsNote: repsNote.trim().slice(0, 60),
              personalTip: personalTip.trim().slice(0, 200),
              seatPinNote: (extra?.seatPinNote ?? prevLog?.seatPinNote ?? '').trim().slice(0, 120),
              personalRecordKg,
              usesWorkoutSets: workout ? true : prevLog?.usesWorkoutSets,
              estimated1RM,
              setsCompletedToday: workout ? [] : nextCompletedSets,
              setsCompletedDateKey: todayKey,
              setsDetail: workout ? [] : nextSetsDetail,
              updatedAtMs,
            },
          },
        };
      });
    },
    [commitUpdate]
  );

  const saveCustomSplitDays = useCallback(
    (nextDays: GymSplitDayConfig[], gender?: GymGenderMode) => {
      const safeDays = nextDays.length > 0 ? nextDays : cloneDefaultSplitDays();
      commitUpdate((prev) => {
        if (gender === 'male') {
          const validMale = safeDays.some((d) => d.id === prev.activeMaleDayId);
          return {
            ...prev,
            activeMaleDayId: validMale ? prev.activeMaleDayId : safeDays[0].id,
            maleCustomDays: safeDays,
            clientUpdatedAt: Date.now(),
          };
        }
        if (gender === 'female') {
          const validFemale = safeDays.some((d) => d.id === prev.activeFemaleDayId);
          return {
            ...prev,
            activeFemaleDayId: validFemale ? prev.activeFemaleDayId : safeDays[0].id,
            femaleCustomDays: safeDays,
            clientUpdatedAt: Date.now(),
          };
        }
        const stillValidActive = safeDays.some((d) => d.id === prev.activeDayId);
        return {
          ...prev,
          activeDayId: stillValidActive ? prev.activeDayId : safeDays[0].id,
          customDays: safeDays,
          clientUpdatedAt: Date.now(),
        };
      });
    },
    [commitUpdate]
  );

  const saveUserProfile = useCallback(
    (patch: Partial<GymFemaleBodyProfile>, alsoRecordBodyMetrics = false) => {
      const now = Date.now();
      const todayKey = getTodayLocalDateKey();
      commitUpdate((prev) => {
        const mergedProfile: GymFemaleBodyProfile = {
          ...prev.userProfile,
          ...patch,
          updatedAtMs: now,
        };

        let nextMetrics = prev.bodyMetricsHistory || [];
        if (alsoRecordBodyMetrics) {
          const gender: GymGenderMode =
            mergedProfile.gender === 'male' ? 'male' : 'female';
          const entry: GymBodyMetricEntry = {
            dateKey: todayKey,
            gender,
            weightKg: mergedProfile.weightKg || 50,
            waistCm: mergedProfile.waistCm || 63,
            hipCm: mergedProfile.hipCm || 92,
            chestCm: mergedProfile.chestCm || 96,
            armCm: mergedProfile.armCm || 34,
            createdAtMs: now,
          };
          const filtered = nextMetrics.filter(
            (m) => !(m.dateKey === todayKey && m.gender === gender)
          );
          nextMetrics = [...filtered, entry]
            .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
            .slice(-24);
        }

        return {
          ...prev,
          clientUpdatedAt: now,
          userProfile: mergedProfile,
          bodyMetricsHistory: nextMetrics,
        };
      });
    },
    [commitUpdate]
  );

  const addWaterIntakeMl = useCallback(
    (deltaMl: number) => {
      const now = Date.now();
      const todayKey = getTodayLocalDateKey();
      commitUpdate((prev) => {
        const baseMl =
          prev.userProfile.waterDateKey === todayKey
            ? prev.userProfile.waterIntakeMlToday || 0
            : 0;
        const nextMl = Math.max(0, Math.min(8000, baseMl + deltaMl));
        return {
          ...prev,
          clientUpdatedAt: now,
          userProfile: {
            ...prev.userProfile,
            waterIntakeMlToday: nextMl,
            waterDateKey: todayKey,
            updatedAtMs: now,
          },
        };
      });
    },
    [commitUpdate]
  );

  const saveCycleTracking = useCallback(
    (patch: Partial<GymCycleTrackingState>) => {
      const now = Date.now();
      commitUpdate((prev) => ({
        ...prev,
        clientUpdatedAt: now,
        cycleTracking: {
          ...prev.cycleTracking,
          ...patch,
          updatedAtMs: now,
        },
      }));
    },
    [commitUpdate]
  );

  const replaceExerciseInActiveDay = useCallback(
    (
      oldExerciseId: string,
      newExerciseId: string,
      options?: {
        gender?: GymGenderMode;
        dayId?: string;
        fallbackDays?: GymSplitDayConfig[];
      }
    ) => {
      return commitUpdate((prev) => {
        const source = GYM_EXERCISE_MAP[oldExerciseId];
        const replacement = GYM_EXERCISE_MAP[newExerciseId];
        if (!source || !replacement || oldExerciseId === newExerciseId) return prev;
        if (prev.exerciseRestrictions.some(({ exerciseId, kind }) =>
          (kind === 'busy' && (exerciseId === newExerciseId ||
            (GYM_EXERCISE_MAP[exerciseId] && sharesGymStation(GYM_EXERCISE_MAP[exerciseId], replacement)))) ||
          (kind === 'injury' && exerciseId === newExerciseId))) return prev;

        const gender = options?.gender;
        const key = gender === 'male' ? 'maleCustomDays' : gender === 'female' ? 'femaleCustomDays' : 'customDays';
        const dayId = options?.dayId ||
          (gender === 'male' ? prev.activeMaleDayId : gender === 'female' ? prev.activeFemaleDayId : prev.activeDayId);
        const days = prev[key]?.length ? prev[key] : options?.fallbackDays;
        const target = days?.find((day) => day.id === dayId);
        if (!target || !target.exerciseIds.includes(oldExerciseId) || target.exerciseIds.includes(newExerciseId)) return prev;
        if (prev.workoutSetDrafts?.some((draft) =>
          draft.dateKey === getTodayLocalDateKey() && draft.gender === gender && draft.dayId === dayId &&
          draft.exerciseId === oldExerciseId && draft.sets.some((set) => set.completed))) return prev;

        const exerciseIds = target.exerciseIds.map((id) => id === oldExerciseId ? newExerciseId : id);
        return {
          ...prev,
          clientUpdatedAt: Math.max(Date.now(), (prev.clientUpdatedAt || 0) + 1),
          [key]: days?.map((day) => day === target ? { ...day, exerciseIds } : day),
        };
      });
    },
    [commitUpdate]
  );

  const completeGenderWorkoutSession = useCallback(
    (params: GymWorkoutSummary & { gender: GymGenderMode }): GymWorkoutHistoryEntry | null => {
      const prev = latestStateRef.current;
      const todayKey = getTodayLocalDateKey();
      const drafts = selectWorkoutSetDrafts(prev.workoutSetDrafts, todayKey, params.gender, params.dayId);
      if (!drafts.some((draft) => draft.sets.some((set) => set.completed && !set.isWarmup))) return null;
      const now = Math.max(Date.now(), (prev.clientUpdatedAt || 0) + 1);
      const isComplete = params.status === 'completed';
      const nextDayId = isComplete ? params.nextDayId : params.dayId;
      const entry: GymWorkoutHistoryEntry = {
        id: 'wh_' + todayKey + '_' + params.gender + '_' + now,
        dateKey: todayKey,
        gender: params.gender,
        dayId: params.dayId,
        dayTitle: params.dayTitle,
        status: params.status,
        plannedExercisesCount: params.plannedExercisesCount,
        durationMinutes: isComplete ? Math.round(params.durationMinutes) : 0,
        totalVolumeKg: params.totalVolumeKg,
        completedExercisesCount: params.completedExercisesCount,
        caloriesBurned: isComplete ? Math.round(params.caloriesBurned) : 0,
        prCount: params.prHighlights.length,
        prHighlights: params.prHighlights.slice(0, 10),
        createdAtMs: now,
      };

      const workoutHistory = [entry, ...(prev.workoutHistory || [])].slice(0, 60);
      const nextState: GymClientPersistedState = {
        ...prev,
        activeDayId: nextDayId,
        activeMaleDayId: params.gender === 'male' ? nextDayId : prev.activeMaleDayId,
        activeFemaleDayId: params.gender === 'female' ? nextDayId : prev.activeFemaleDayId,
        completedExerciseIdsToday: [],
        sessionDateKey: todayKey,
        workoutStreak: isComplete
          ? computeSmartWorkoutStreak(prev.workoutStreak, prev.lastCompletedSessionDate, todayKey)
          : prev.workoutStreak,
        lastCompletedSessionDate: isComplete ? todayKey : prev.lastCompletedSessionDate,
        workoutHistory,
        workoutSetDrafts: mergeWorkoutSetDrafts(prev.workoutSetDrafts, [], workoutHistory, todayKey),
        clientUpdatedAt: now,
      };
      latestStateRef.current = nextState;
      writePersistedLocalState(nextState);
      setState(nextState);

      if (token) {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        setCloudStatus('syncing');
        const exerciseLogs = drafts.flatMap(({ exerciseId }) =>
          nextState.exerciseLogs[exerciseId] ? [nextState.exerciseLogs[exerciseId]] : []
        );
        const syncProfileAfterSession = () => scheduleCloudSave(latestStateRef.current);
        void gymSyncService.completeSession(token, { ...entry, nextDayId, exerciseLogs })
          .catch(() => undefined)
          .then(syncProfileAfterSession);
      }
      return entry;
    },
    [token, scheduleCloudSave]
  );

  const setExerciseRestriction = useCallback(
    (exerciseId: string, kind: GymRestrictionKind | null) => {
      const now = Date.now();
      commitUpdate((prev) => {
        const filtered = prev.exerciseRestrictions.filter(
          (r) => r.exerciseId !== exerciseId
        );
        return {
          ...prev,
          clientUpdatedAt: now,
          exerciseRestrictions: kind
            ? [...filtered, { exerciseId, kind, updatedAtMs: now }]
            : filtered,
        };
      });
    },
    [commitUpdate]
  );

  const appendAiChatMessages = useCallback(
    (messages: GymAiChatMessage[]) => {
      const now = Date.now();
      commitUpdate((prev) => ({
        ...prev,
        clientUpdatedAt: now,
        aiChatHistory: [...prev.aiChatHistory, ...messages].slice(-20),
      }));
    },
    [commitUpdate]
  );

  const clearAiChatHistory = useCallback(() => {
    commitUpdate((prev) => ({
      ...prev,
      clientUpdatedAt: Date.now(),
      aiChatHistory: [],
    }));
  }, [commitUpdate]);

  const syncStatus: GymCloudSyncStatus = token ? cloudStatus : 'local-only';

  return {
    state,
    syncStatus,
    selectDay,
    toggleExerciseDone,
    completeDayAndAdvance,
    completeGenderWorkoutSession,
    saveExerciseLog,
    saveCustomSplitDays,
    saveUserProfile,
    addWaterIntakeMl,
    saveCycleTracking,
    replaceExerciseInActiveDay,
    setExerciseRestriction,
    appendAiChatMessages,
    clearAiChatHistory,
  };
}
