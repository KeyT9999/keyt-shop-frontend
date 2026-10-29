import { useCallback, useEffect, useRef, useState } from 'react';
import { gymSyncService } from '../services/gymSyncService';
import type { GymClientPersistedState, GymSplitDayConfig } from '../types/gym';
import {
  advanceToNextGymSplitDay,
  cloneDefaultSplitDays,
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

        // If user had local edits not yet on server, push merged snapshot back up
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
    (dayId: string) => {
      commitUpdate((prev) => ({
        ...prev,
        activeDayId: dayId,
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
    (exerciseId: string, weightKg: number, repsNote: string, personalTip: string) => {
      const now = Date.now();
      commitUpdate((prev) => ({
        ...prev,
        clientUpdatedAt: now,
        exerciseLogs: {
          ...prev.exerciseLogs,
          [exerciseId]: {
            exerciseId,
            weightKg: Math.max(0, Number(weightKg) || 0),
            repsNote: repsNote.trim().slice(0, 60),
            personalTip: personalTip.trim().slice(0, 200),
            updatedAtMs: now,
          },
        },
      }));
    },
    [commitUpdate]
  );

  const saveCustomSplitDays = useCallback(
    (nextDays: GymSplitDayConfig[]) => {
      const safeDays = nextDays.length > 0 ? nextDays : cloneDefaultSplitDays();
      commitUpdate((prev) => {
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

  const syncStatus: GymCloudSyncStatus = token ? cloudStatus : 'local-only';

  return {
    state,
    syncStatus,
    selectDay,
    toggleExerciseDone,
    completeDayAndAdvance,
    saveExerciseLog,
    saveCustomSplitDays,
  };
}
