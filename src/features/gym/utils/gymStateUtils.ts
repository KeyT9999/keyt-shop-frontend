import {
  DEFAULT_USER_5DAY_SPLIT,
  GYM_EXERCISE_MAP,
  LEGACY_V1_DEFAULT_SPLIT_IDS,
  LEGACY_V2_INTERIM_SPLIT_IDS,
} from '../data/defaultGymCatalog';
import type {
  GymClientPersistedState,
  GymExerciseDefinition,
  GymExerciseUserLog,
  GymServerProfilePayload,
  GymSplitDayConfig,
} from '../types/gym';

export function getTodayLocalDateKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function cloneDefaultSplitDays(): GymSplitDayConfig[] {
  return DEFAULT_USER_5DAY_SPLIT.map((day) => ({
    ...day,
    exerciseIds: [...day.exerciseIds],
  }));
}

export function createInitialGymState(todayKey = getTodayLocalDateKey()): GymClientPersistedState {
  return {
    activeDayId: DEFAULT_USER_5DAY_SPLIT[0].id,
    completedExerciseIdsToday: [],
    sessionDateKey: todayKey,
    workoutStreak: 0,
    lastCompletedSessionDate: '',
    customDays: cloneDefaultSplitDays(),
    exerciseLogs: {},
    clientUpdatedAt: 0,
  };
}

export function resolveExercisesForDay(day: GymSplitDayConfig): GymExerciseDefinition[] {
  return day.exerciseIds
    .map((id) => GYM_EXERCISE_MAP[id])
    .filter((item): item is GymExerciseDefinition => Boolean(item));
}

function isSameIdList(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((val, idx) => val === b[idx]);
}

/**
 * Seamlessly upgrades untouched v1 4-exercise default days to the full BRTW/Impulse
 * real-gym machine split while preserving any user-customized days and weight logs.
 */
export function upgradeLegacyDefaultSplitDays(days: GymSplitDayConfig[]): {
  days: GymSplitDayConfig[];
  upgraded: boolean;
} {
  if (!Array.isArray(days) || days.length === 0) {
    return { days: cloneDefaultSplitDays(), upgraded: true };
  }

  let upgraded = false;
  const nextDays = days.map((day) => {
    const legacyV1 = LEGACY_V1_DEFAULT_SPLIT_IDS[day.id];
    const legacyV2 = LEGACY_V2_INTERIM_SPLIT_IDS[day.id];
    const v2Default = DEFAULT_USER_5DAY_SPLIT.find((d) => d.id === day.id);
    const cur = day.exerciseIds || [];
    const matchesOldDefault =
      (legacyV1 && isSameIdList(cur, legacyV1)) ||
      (legacyV2 && isSameIdList(cur, legacyV2));

    if (v2Default && matchesOldDefault) {
      upgraded = true;
      return {
        ...day,
        subtitle: v2Default.subtitle,
        exerciseIds: [...v2Default.exerciseIds],
      };
    }
    return day;
  });

  return { days: nextDays, upgraded };
}

export function normalizeDailySessionRollover(
  state: GymClientPersistedState,
  todayKey = getTodayLocalDateKey()
): GymClientPersistedState {
  const { days, upgraded } = upgradeLegacyDefaultSplitDays(state.customDays);
  const nextClientTs = upgraded
    ? Math.max((state.clientUpdatedAt || 0) + 1, Date.now())
    : state.clientUpdatedAt;

  if (!state.sessionDateKey || state.sessionDateKey === todayKey) {
    return {
      ...state,
      sessionDateKey: todayKey,
      customDays: days,
      clientUpdatedAt: nextClientTs,
    };
  }

  // If user already checked off at least 1 exercise on a previous calendar day, auto-advance to next day!
  const hadProgressYesterday = state.completedExerciseIdsToday.length > 0;

  const currentIdx = Math.max(
    0,
    days.findIndex((d) => d.id === state.activeDayId)
  );
  const nextIdx = hadProgressYesterday ? (currentIdx + 1) % days.length : currentIdx;

  return {
    ...state,
    activeDayId: days[nextIdx]?.id || days[0].id,
    completedExerciseIdsToday: [],
    sessionDateKey: todayKey,
    customDays: days,
    clientUpdatedAt: nextClientTs,
  };
}

export function advanceToNextGymSplitDay(
  state: GymClientPersistedState,
  nowMs = Date.now(),
  todayKey = getTodayLocalDateKey()
): GymClientPersistedState {
  const days = state.customDays.length > 0 ? state.customDays : cloneDefaultSplitDays();
  const idx = Math.max(
    0,
    days.findIndex((d) => d.id === state.activeDayId)
  );
  const nextDay = days[(idx + 1) % days.length] || days[0];
  const bumpStreak = state.lastCompletedSessionDate !== todayKey;

  return {
    ...state,
    activeDayId: nextDay.id,
    completedExerciseIdsToday: [],
    sessionDateKey: todayKey,
    workoutStreak: bumpStreak ? state.workoutStreak + 1 : state.workoutStreak,
    lastCompletedSessionDate: todayKey,
    clientUpdatedAt: nowMs,
  };
}

export function serializeGymStateForServer(
  state: GymClientPersistedState
): Omit<GymServerProfilePayload, 'updatedAt'> {
  return {
    activeDayId: state.activeDayId,
    completedExerciseIdsToday: state.completedExerciseIdsToday,
    sessionDateKey: state.sessionDateKey,
    workoutStreak: state.workoutStreak,
    lastCompletedSessionDate: state.lastCompletedSessionDate,
    customDays: state.customDays,
    exerciseLogs: Object.values(state.exerciseLogs),
    clientUpdatedAt: state.clientUpdatedAt || Date.now(),
  };
}

/**
 * Merges LocalStorage state with MongoDB profile using per-exercise `updatedAtMs`
 * and overall `clientUpdatedAt` so offline gym edits are never lost.
 */
export function mergeGymClientAndServerState(
  local: GymClientPersistedState,
  remote: GymServerProfilePayload | null,
  todayKey = getTodayLocalDateKey()
): GymClientPersistedState {
  if (!remote) return normalizeDailySessionRollover(local, todayKey);

  const mergedLogs: Record<string, GymExerciseUserLog> = { ...local.exerciseLogs };

  for (const item of remote.exerciseLogs || []) {
    if (!item?.exerciseId) continue;
    const localLog = mergedLogs[item.exerciseId];
    if (!localLog || (item.updatedAtMs || 0) > (localLog.updatedAtMs || 0)) {
      mergedLogs[item.exerciseId] = {
        exerciseId: item.exerciseId,
        weightKg: item.weightKg ?? 0,
        repsNote: item.repsNote ?? '',
        personalTip: item.personalTip ?? '',
        updatedAtMs: item.updatedAtMs ?? 0,
      };
    }
  }

  const remoteIsNewer = (remote.clientUpdatedAt || 0) > (local.clientUpdatedAt || 0);
  const winnerBase = remoteIsNewer
    ? {
        activeDayId: remote.activeDayId || local.activeDayId,
        completedExerciseIdsToday: remote.completedExerciseIdsToday || [],
        sessionDateKey: remote.sessionDateKey || todayKey,
        workoutStreak: Math.max(local.workoutStreak, remote.workoutStreak || 0),
        lastCompletedSessionDate:
          remote.lastCompletedSessionDate || local.lastCompletedSessionDate,
        customDays:
          Array.isArray(remote.customDays) && remote.customDays.length > 0
            ? remote.customDays
            : local.customDays,
        exerciseLogs: mergedLogs,
        clientUpdatedAt: remote.clientUpdatedAt || local.clientUpdatedAt,
      }
    : {
        ...local,
        workoutStreak: Math.max(local.workoutStreak, remote.workoutStreak || 0),
        exerciseLogs: mergedLogs,
      };

  return normalizeDailySessionRollover(winnerBase, todayKey);
}
