import {
  DEFAULT_USER_5DAY_SPLIT,
  GYM_EXERCISE_MAP,
  LEGACY_V1_DEFAULT_SPLIT_IDS,
  LEGACY_V2_INTERIM_SPLIT_IDS,
} from '../data/defaultGymCatalog';
import type {
  GymBodyMetricEntry,
  GymClientPersistedState,
  GymCycleTrackingState,
  GymExerciseDefinition,
  GymExerciseUserLog,
  GymFemaleBodyProfile,
  GymGenderMode,
  GymServerProfilePayload,
  GymSplitDayConfig,
  GymWorkoutHistoryEntry,
} from '../types/gym';
import { computeEstimated1RM } from './gymCycleAndProgressionUtils';

export function getTodayLocalDateKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createDefaultFemaleBodyProfile(): GymFemaleBodyProfile {
  return {
    gender: 'female',
    nickname: 'Challenger',
    age: 23,
    heightCm: 160,
    weightKg: 50,
    waistCm: 63,
    hipCm: 92,
    chestCm: 96,
    armCm: 34,
    workoutsPerWeek: 4,
    primaryGoal: 'glute_sculpt',
    maleGoal: 'chest_shoulder_3d',
    experienceLevel: 'beginner',
    avoidHeavyQuads: true,
    protectLowerBackKnee: false,
    shoulderSafe: false,
    maleEnergyLevel: 4,
    waterIntakeMlToday: 0,
    waterDateKey: '',
    personalNotes: '',
    updatedAtMs: 0,
  };
}

export function createDefaultCycleTracking(): GymCycleTrackingState {
  return {
    enabled: true,
    lastPeriodStartDate: '',
    cycleLengthDays: 28,
    periodDurationDays: 5,
    manualPhaseOverride: 'auto',
    todayEnergyLevel: 4,
    todaySymptoms: [],
    updatedAtMs: 0,
  };
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
    activeMaleDayId: 'm_session_1',
    activeFemaleDayId: 'f_session_1',
    completedExerciseIdsToday: [],
    sessionDateKey: todayKey,
    workoutStreak: 0,
    lastCompletedSessionDate: '',
    customDays: cloneDefaultSplitDays(),
    maleCustomDays: [],
    femaleCustomDays: [],
    exerciseLogs: {},
    workoutHistory: [],
    bodyMetricsHistory: [],
    userProfile: {
      ...createDefaultFemaleBodyProfile(),
      waterDateKey: todayKey,
    },
    cycleTracking: createDefaultCycleTracking(),
    exerciseRestrictions: [],
    aiChatHistory: [],
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
 * Smart streak updater:
 * - Same dateKey: preserves current streak (at least 1) without double incrementing
 * - Gap 1..3 days: increments streak + 1 (respects recovery rest days)
 * - Gap > 3 days: starts fresh at 1
 */
export function computeSmartWorkoutStreak(
  prevStreak: number,
  prevDateKey: string,
  nextDateKey: string
): number {
  const current = Math.max(0, Number(prevStreak) || 0);
  if (!nextDateKey) return Math.max(1, current);
  if (!prevDateKey) return Math.max(1, current + 1);
  if (prevDateKey === nextDateKey) return Math.max(1, current);

  const prevMs = Date.parse(`${prevDateKey}T00:00:00Z`);
  const nextMs = Date.parse(`${nextDateKey}T00:00:00Z`);
  if (!Number.isFinite(prevMs) || !Number.isFinite(nextMs)) {
    return current + 1;
  }
  const diffDays = Math.round((nextMs - prevMs) / (24 * 60 * 60 * 1000));
  if (diffDays < 0) return Math.max(1, current);
  if (diffDays <= 3) return current + 1;
  return 1;
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

  const rawProfile = {
    ...createDefaultFemaleBodyProfile(),
    ...(state.userProfile || {}),
  };

  // Reset daily water counter cleanly on calendar rollover
  const safeUserProfile: GymFemaleBodyProfile =
    rawProfile.waterDateKey && rawProfile.waterDateKey !== todayKey
      ? { ...rawProfile, waterIntakeMlToday: 0, waterDateKey: todayKey }
      : { ...rawProfile, waterDateKey: rawProfile.waterDateKey || todayKey };

  const safeCycleTracking: GymCycleTrackingState = {
    ...createDefaultCycleTracking(),
    ...(state.cycleTracking || {}),
  };
  const safeRestrictions = Array.isArray(state.exerciseRestrictions)
    ? state.exerciseRestrictions
    : [];
  const safeChatHistory = Array.isArray(state.aiChatHistory)
    ? state.aiChatHistory
    : [];
  const safeMaleDays = Array.isArray(state.maleCustomDays) ? state.maleCustomDays : [];
  const safeFemaleDays = Array.isArray(state.femaleCustomDays) ? state.femaleCustomDays : [];
  const safeWorkoutHistory = Array.isArray(state.workoutHistory) ? state.workoutHistory : [];
  const safeBodyMetrics = Array.isArray(state.bodyMetricsHistory) ? state.bodyMetricsHistory : [];

  if (!state.sessionDateKey || state.sessionDateKey === todayKey) {
    return {
      ...state,
      activeMaleDayId: state.activeMaleDayId || 'm_session_1',
      activeFemaleDayId: state.activeFemaleDayId || 'f_session_1',
      sessionDateKey: todayKey,
      customDays: days,
      maleCustomDays: safeMaleDays,
      femaleCustomDays: safeFemaleDays,
      workoutHistory: safeWorkoutHistory,
      bodyMetricsHistory: safeBodyMetrics,
      userProfile: safeUserProfile,
      cycleTracking: safeCycleTracking,
      exerciseRestrictions: safeRestrictions,
      aiChatHistory: safeChatHistory,
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

  // Reset per-exercise `setsCompletedToday` on calendar rollover while preserving weights & PRs
  const rolledLogs: Record<string, GymExerciseUserLog> = {};
  for (const [exId, log] of Object.entries(state.exerciseLogs || {})) {
    rolledLogs[exId] = {
      ...log,
      setsCompletedToday: [],
      setsDetail: Array.isArray(log.setsDetail)
        ? log.setsDetail.map((s) => ({ ...s, completed: false }))
        : undefined,
    };
  }

  return {
    ...state,
    activeDayId: days[nextIdx]?.id || days[0].id,
    activeMaleDayId: state.activeMaleDayId || 'm_session_1',
    activeFemaleDayId: state.activeFemaleDayId || 'f_session_1',
    completedExerciseIdsToday: [],
    sessionDateKey: todayKey,
    customDays: days,
    maleCustomDays: safeMaleDays,
    femaleCustomDays: safeFemaleDays,
    exerciseLogs: rolledLogs,
    workoutHistory: safeWorkoutHistory,
    bodyMetricsHistory: safeBodyMetrics,
    userProfile: safeUserProfile,
    cycleTracking: safeCycleTracking,
    exerciseRestrictions: safeRestrictions,
    aiChatHistory: safeChatHistory,
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
  const nextStreak = computeSmartWorkoutStreak(
    state.workoutStreak,
    state.lastCompletedSessionDate,
    todayKey
  );

  return {
    ...state,
    activeDayId: nextDay.id,
    completedExerciseIdsToday: [],
    sessionDateKey: todayKey,
    workoutStreak: nextStreak,
    lastCompletedSessionDate: todayKey,
    clientUpdatedAt: nowMs,
  };
}

export function serializeGymStateForServer(
  state: GymClientPersistedState
): Omit<GymServerProfilePayload, 'updatedAt'> {
  return {
    activeDayId: state.activeDayId,
    activeMaleDayId: state.activeMaleDayId || 'm_session_1',
    activeFemaleDayId: state.activeFemaleDayId || 'f_session_1',
    completedExerciseIdsToday: state.completedExerciseIdsToday,
    sessionDateKey: state.sessionDateKey,
    workoutStreak: state.workoutStreak,
    lastCompletedSessionDate: state.lastCompletedSessionDate,
    customDays: state.customDays,
    maleCustomDays: state.maleCustomDays || [],
    femaleCustomDays: state.femaleCustomDays || [],
    exerciseLogs: Object.values(state.exerciseLogs),
    workoutHistory: state.workoutHistory || [],
    bodyMetricsHistory: state.bodyMetricsHistory || [],
    userProfile: state.userProfile,
    cycleTracking: state.cycleTracking,
    exerciseRestrictions: state.exerciseRestrictions,
    aiChatHistory: state.aiChatHistory,
    clientUpdatedAt: state.clientUpdatedAt || Date.now(),
  };
}

function mergeWorkoutHistoryLists(
  a: GymWorkoutHistoryEntry[] = [],
  b: GymWorkoutHistoryEntry[] = []
): GymWorkoutHistoryEntry[] {
  const map = new Map<string, GymWorkoutHistoryEntry>();
  for (const item of [...a, ...b]) {
    if (!item?.id) continue;
    const prev = map.get(item.id);
    if (!prev || (item.createdAtMs || 0) >= (prev.createdAtMs || 0)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values())
    .sort((x, y) => (y.createdAtMs || 0) - (x.createdAtMs || 0))
    .slice(0, 60);
}

function mergeBodyMetricLists(
  a: GymBodyMetricEntry[] = [],
  b: GymBodyMetricEntry[] = []
): GymBodyMetricEntry[] {
  const map = new Map<string, GymBodyMetricEntry>();
  for (const item of [...a, ...b]) {
    if (!item?.dateKey) continue;
    const gender: GymGenderMode = item.gender === 'male' ? 'male' : 'female';
    const key = `${item.dateKey}_${gender}`;
    const prev = map.get(key);
    if (!prev || (item.createdAtMs || 0) >= (prev.createdAtMs || 0)) {
      map.set(key, { ...item, gender });
    }
  }
  return Array.from(map.values())
    .sort((x, y) => x.dateKey.localeCompare(y.dateKey))
    .slice(-24);
}

/**
 * Merges LocalStorage state with MongoDB profile using per-exercise `updatedAtMs`,
 * preserving lifetime PRs, workoutHistory, bodyMetricsHistory, and gender splits.
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
    const bestPr = Math.max(
      localLog?.personalRecordKg || 0,
      localLog?.weightKg || 0,
      item.personalRecordKg || 0,
      item.weightKg || 0
    );
    const best1RM = Math.max(
      localLog?.estimated1RM || 0,
      item.estimated1RM || 0,
      computeEstimated1RM(bestPr, 10)
    );

    if (!localLog || (item.updatedAtMs || 0) > (localLog.updatedAtMs || 0)) {
      mergedLogs[item.exerciseId] = {
        exerciseId: item.exerciseId,
        weightKg: item.weightKg ?? 0,
        repsNote: item.repsNote ?? '',
        personalTip: item.personalTip ?? '',
        seatPinNote: item.seatPinNote || localLog?.seatPinNote || '',
        personalRecordKg: bestPr,
        estimated1RM: best1RM,
        setsCompletedToday: item.setsCompletedToday || [],
        setsCompletedDateKey: item.setsCompletedDateKey || '',
        setsDetail: item.setsDetail || localLog?.setsDetail,
        updatedAtMs: item.updatedAtMs ?? 0,
      };
    } else if (localLog) {
      mergedLogs[item.exerciseId] = {
        ...localLog,
        personalRecordKg: bestPr,
        estimated1RM: best1RM,
      };
    }
  }

  const mergedHistory = mergeWorkoutHistoryLists(
    local.workoutHistory || [],
    remote.workoutHistory || []
  );
  const mergedMetrics = mergeBodyMetricLists(
    local.bodyMetricsHistory || [],
    remote.bodyMetricsHistory || []
  );

  const remoteIsNewer = (remote.clientUpdatedAt || 0) > (local.clientUpdatedAt || 0);
  const winnerBase: GymClientPersistedState = remoteIsNewer
    ? {
        activeDayId: remote.activeDayId || local.activeDayId,
        activeMaleDayId: remote.activeMaleDayId || local.activeMaleDayId || 'm_session_1',
        activeFemaleDayId:
          remote.activeFemaleDayId || local.activeFemaleDayId || 'f_session_1',
        completedExerciseIdsToday: remote.completedExerciseIdsToday || [],
        sessionDateKey: remote.sessionDateKey || todayKey,
        workoutStreak: Math.max(local.workoutStreak, remote.workoutStreak || 0),
        lastCompletedSessionDate:
          remote.lastCompletedSessionDate || local.lastCompletedSessionDate,
        customDays:
          Array.isArray(remote.customDays) && remote.customDays.length > 0
            ? remote.customDays
            : local.customDays,
        maleCustomDays:
          Array.isArray(remote.maleCustomDays) && remote.maleCustomDays.length > 0
            ? remote.maleCustomDays
            : local.maleCustomDays || [],
        femaleCustomDays:
          Array.isArray(remote.femaleCustomDays) && remote.femaleCustomDays.length > 0
            ? remote.femaleCustomDays
            : local.femaleCustomDays || [],
        exerciseLogs: mergedLogs,
        workoutHistory: mergedHistory,
        bodyMetricsHistory: mergedMetrics,
        userProfile: remote.userProfile
          ? { ...createDefaultFemaleBodyProfile(), ...remote.userProfile }
          : local.userProfile,
        cycleTracking: remote.cycleTracking
          ? { ...createDefaultCycleTracking(), ...remote.cycleTracking }
          : local.cycleTracking,
        exerciseRestrictions:
          Array.isArray(remote.exerciseRestrictions) &&
          remote.exerciseRestrictions.length > 0
            ? remote.exerciseRestrictions
            : local.exerciseRestrictions,
        aiChatHistory:
          Array.isArray(remote.aiChatHistory) && remote.aiChatHistory.length > 0
            ? remote.aiChatHistory
            : local.aiChatHistory,
        clientUpdatedAt: remote.clientUpdatedAt || local.clientUpdatedAt,
      }
    : {
        ...local,
        workoutStreak: Math.max(local.workoutStreak, remote.workoutStreak || 0),
        maleCustomDays:
          local.maleCustomDays && local.maleCustomDays.length > 0
            ? local.maleCustomDays
            : remote.maleCustomDays || [],
        femaleCustomDays:
          local.femaleCustomDays && local.femaleCustomDays.length > 0
            ? local.femaleCustomDays
            : remote.femaleCustomDays || [],
        exerciseLogs: mergedLogs,
        workoutHistory: mergedHistory,
        bodyMetricsHistory: mergedMetrics,
      };

  return normalizeDailySessionRollover(winnerBase, todayKey);
}
