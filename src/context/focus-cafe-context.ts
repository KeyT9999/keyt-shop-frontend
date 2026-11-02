import { createContext } from 'react';
import type {
  FocusAmbientId,
  FocusSceneId,
  FocusSceneItem,
  FocusTaskItem,
  FocusTimerMode,
  FocusTrackItem,
  LoftWeatherVariant,
} from '../features/focus/types/focusTypes';

export interface FocusCafeContextType {
  // Scene state
  selectedSceneId: FocusSceneId;
  activeScene: FocusSceneItem;
  loftVariant: LoftWeatherVariant;
  activeVideoUrl: string;
  activePosterUrl: string;
  selectScene: (sceneId: FocusSceneId) => void;
  setLoftVariant: (variant: LoftWeatherVariant) => void;

  // Audio state
  currentTrack: FocusTrackItem;
  isMusicPlaying: boolean;
  musicVolume: number;
  ambientVolumes: Record<FocusAmbientId, number>;
  toggleMusic: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  selectTrack: (trackId: string) => void;
  setMusicVolume: (volume: number) => void;
  setAmbientVolume: (ambientId: FocusAmbientId, volume: number) => void;
  resetAmbients: () => void;

  // Timer & Study Streak state
  timerMode: FocusTimerMode;
  pomodoroMinutes: number;
  remainingSeconds: number;
  stopwatchSeconds: number;
  isTimerRunning: boolean;
  streakCount: number;
  todayFocusedSeconds: number;
  setTimerMode: (mode: FocusTimerMode) => void;
  setPomodoroMinutes: (minutes: number) => void;
  toggleTimer: () => void;
  resetTimer: () => void;

  // Daily Checklist state
  tasks: FocusTaskItem[];
  addTask: (text: string) => void;
  toggleTask: (taskId: string) => void;
  removeTask: (taskId: string) => void;
  clearCompletedTasks: () => void;

  // Fullscreen & Launch action
  isFullscreen: boolean;
  toggleFullscreen: () => Promise<void>;
  enterFocusSession: (options?: { autoStartMusic?: boolean; autoFullscreen?: boolean }) => void;
  stopAllFocusSession: () => void;
}

export const FocusCafeContext = createContext<FocusCafeContextType | undefined>(
  undefined
);
