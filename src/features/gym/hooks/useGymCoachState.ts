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
} from '../types/gym';
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

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

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
      setState((prev) => {
        const next = updater(prev);
        writePersistedLocalState(next);
        scheduleCloudSave(next);
        return next;
      });
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
      }
    ) => {
      const now = Date.now();
      const todayKey = getTodayLocalDateKey();
      commitUpdate((prev) => {
        const prevLog: GymExerciseUserLog | undefined = prev.exerciseLogs[exerciseId];
        const cleanWeight = Math.max(0, Number(weightKg) || 0);
        const nextSetsDetail = extra?.setsDetail ?? prevLog?.setsDetail;
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
          prevLog?.weightKg || 0,
          cleanWeight,
          maxSetW
        );
        const estimated1RM = Math.max(
          prevLog?.estimated1RM || 0,
          computeEstimated1RM(cleanWeight, 10),
          maxSet1RM
        );

        const nextCompletedExIds =
          extra?.autoMarkCompleted && !prev.completedExerciseIdsToday.includes(exerciseId)
            ? [...prev.completedExerciseIdsToday, exerciseId]
            : prev.completedExerciseIdsToday;

        return {
          ...prev,
          completedExerciseIdsToday: nextCompletedExIds,
          sessionDateKey: todayKey,
          clientUpdatedAt: now,
          exerciseLogs: {
            ...prev.exerciseLogs,
            [exerciseId]: {
              exerciseId,
              weightKg: cleanWeight,
              repsNote: repsNote.trim().slice(0, 60),
              personalTip: personalTip.trim().slice(0, 200),
              seatPinNote: (extra?.seatPinNote ?? prevLog?.seatPinNote ?? '').trim().slice(0, 120),
              personalRecordKg,
              estimated1RM,
              setsCompletedToday: nextCompletedSets,
              setsCompletedDateKey: todayKey,
              setsDetail: nextSetsDetail,
              updatedAtMs: now,
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
      const now = Date.now();
      commitUpdate((prev) => {
        const swapInList = (days: GymSplitDayConfig[], targetDayId: string) =>
          days.map((day) => {
            if (day.id !== targetDayId) return day;
            const nextIds = day.exerciseIds.map((id) =>
              id === oldExerciseId ? newExerciseId : id
            );
            return {
              ...day,
              exerciseIds: Array.from(new Set(nextIds)),
            };
          });

        if (options?.gender === 'male') {
          const baseMaleDays =
            prev.maleCustomDays && prev.maleCustomDays.length > 0
              ? prev.maleCustomDays
              : options.fallbackDays || [];
          const targetId =
            options.dayId || prev.activeMaleDayId || baseMaleDays[0]?.id || 'm_session_1';
          return {
            ...prev,
            clientUpdatedAt: now,
            maleCustomDays: swapInList(baseMaleDays, targetId),
          };
        }

        if (options?.gender === 'female') {
          const baseFemaleDays =
            prev.femaleCustomDays && prev.femaleCustomDays.length > 0
              ? prev.femaleCustomDays
              : options.fallbackDays || [];
          const targetId =
            options.dayId || prev.activeFemaleDayId || baseFemaleDays[0]?.id || 'f_session_1';
          return {
            ...prev,
            clientUpdatedAt: now,
            femaleCustomDays: swapInList(baseFemaleDays, targetId),
          };
        }

        return {
          ...prev,
          clientUpdatedAt: now,
          customDays: swapInList(prev.customDays, options?.dayId || prev.activeDayId),
        };
      });
    },
    [commitUpdate]
  );

  const completeGenderWorkoutSession = useCallback(
    (params: {
      gender: GymGenderMode;
      dayId: string;
      dayTitle: string;
      nextDayId: string;
      durationMinutes: number;
      totalVolumeKg: number;
      completedExercisesCount: number;
      caloriesBurned: number;
      prHighlights: string[];
    }): GymWorkoutHistoryEntry => {
      const now = Date.now();
      const todayKey = getTodayLocalDateKey();
      const entry: GymWorkoutHistoryEntry = {
        id: `wh_${todayKey}_${params.gender}_${now}`,
        dateKey: todayKey,
        gender: params.gender,
        dayId: params.dayId,
        dayTitle: params.dayTitle,
        durationMinutes: Math.max(5, Math.round(params.durationMinutes)),
        totalVolumeKg: Math.max(0, Math.round(params.totalVolumeKg)),
        completedExercisesCount: Math.max(0, params.completedExercisesCount),
        caloriesBurned: Math.max(50, Math.round(params.caloriesBurned)),
        prCount: params.prHighlights.length,
        prHighlights: params.prHighlights.slice(0, 10),
        createdAtMs: now,
      };

      setState((prev) => {
        const nextStreak = computeSmartWorkoutStreak(
          prev.workoutStreak,
          prev.lastCompletedSessionDate,
          todayKey
        );
        const nextHistory = [entry, ...(prev.workoutHistory || [])].slice(0, 60);
        const nextState: GymClientPersistedState = {
          ...prev,
          activeDayId: params.nextDayId,
          activeMaleDayId:
            params.gender === 'male' ? params.nextDayId : prev.activeMaleDayId,
          activeFemaleDayId:
            params.gender === 'female' ? params.nextDayId : prev.activeFemaleDayId,
          completedExerciseIdsToday: [],
          sessionDateKey: todayKey,
          workoutStreak: nextStreak,
          lastCompletedSessionDate: todayKey,
          workoutHistory: nextHistory,
          clientUpdatedAt: now,
        };
        writePersistedLocalState(nextState);

        if (token) {
          setCloudStatus('syncing');
          gymSyncService
            .completeSession(token, {
              id: entry.id,
              dateKey: todayKey,
              gender: params.gender,
              dayId: params.dayId,
              dayTitle: params.dayTitle,
              nextDayId: params.nextDayId,
              durationMinutes: entry.durationMinutes,
              totalVolumeKg: entry.totalVolumeKg,
              completedExercisesCount: entry.completedExercisesCount,
              caloriesBurned: entry.caloriesBurned,
              prCount: entry.prCount,
              prHighlights: entry.prHighlights,
              exerciseLogs: Object.values(nextState.exerciseLogs),
            })
            .then(() => setCloudStatus('synced'))
            .catch(() => {
              // Fallback to regular debounced profile save
              scheduleCloudSave(nextState);
            });
        }

        return nextState;
      });

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
