import { DEFAULT_AMBIENT_VOLUMES } from '../data/focusCatalog';
import type { FocusPersistedState } from '../types/focusTypes';

const FOCUS_STORAGE_KEY = 'keyt_focus_cafe_state_v1';

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateKey(date: Date = new Date()): string {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - 1);
  return getLocalDateKey(copy);
}

export function formatSecondsToClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function computeUpdatedStreak(
  currentStreak: number,
  lastStudyDate: string,
  todayKey: string,
  yesterdayKey: string
): { streakCount: number; lastStudyDate: string } {
  if (lastStudyDate === todayKey) {
    return { streakCount: Math.max(1, currentStreak), lastStudyDate: todayKey };
  }
  if (lastStudyDate === yesterdayKey) {
    return { streakCount: currentStreak + 1, lastStudyDate: todayKey };
  }
  return { streakCount: 1, lastStudyDate: todayKey };
}

export function createDefaultFocusState(): FocusPersistedState {
  return {
    selectedSceneId: 'cozy-window',
    loftVariant: 'night-rainy',
    timerMode: 'pomodoro',
    pomodoroMinutes: 25,
    musicVolume: 0.65,
    ambientVolumes: { ...DEFAULT_AMBIENT_VOLUMES },
    tasks: [],
    streakCount: 0,
    lastStudyDate: '',
    todayFocusedSeconds: 0,
    todayDateKey: getLocalDateKey(),
  };
}

export function loadFocusPersistedState(): FocusPersistedState {
  const fallback = createDefaultFocusState();
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(FOCUS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<FocusPersistedState>;
    const todayKey = getLocalDateKey();
    const isSameDay = parsed.todayDateKey === todayKey;

    return {
      ...fallback,
      ...parsed,
      ambientVolumes: {
        ...DEFAULT_AMBIENT_VOLUMES,
        ...(parsed.ambientVolumes || {}),
      },
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      todayDateKey: todayKey,
      todayFocusedSeconds: isSameDay ? Number(parsed.todayFocusedSeconds || 0) : 0,
    };
  } catch (err) {
    console.warn('⚠️ Failed to parse Focus Café state, falling back to default:', err);
    return fallback;
  }
}

export function shouldPlayFocusAmbients(params: {
  isOnFocusRoute: boolean;
  isMiniPlayerPinned: boolean;
  isMusicPlaying: boolean;
  isTimerRunning: boolean;
  isFocusAmbientEnabled: boolean;
}): boolean {
  if (params.isOnFocusRoute) {
    return (
      params.isMusicPlaying ||
      params.isTimerRunning ||
      params.isFocusAmbientEnabled
    );
  }
  return params.isMiniPlayerPinned && params.isMusicPlaying;
}

export function saveFocusPersistedState(state: FocusPersistedState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('⚠️ Failed to persist Focus Café state:', err);
  }
}
