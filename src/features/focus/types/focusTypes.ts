export type FocusTimerMode = 'pomodoro' | 'stopwatch';

export type FocusSceneId =
  | 'cozy-window'
  | 'loft-room'
  | 'city-rain-girl'
  | 'pixel-midnight'
  | 'forest-camp'
  | 'tokyo-sunset-train';

export type LoftWeatherVariant =
  | 'night-rainy'
  | 'day-sunny'
  | 'day-rainy'
  | 'night-clear';

export type FocusAmbientId =
  | 'rain'
  | 'cafe'
  | 'campfire'
  | 'keyboard'
  | 'forest'
  | 'waves';

export type FocusTrackMood = 'chill' | 'jazzy' | 'midnight';

export interface FocusSceneItem {
  id: FocusSceneId;
  title: string;
  subtitle: string;
  badge: string;
  videoUrl: string;
  posterUrl: string;
  supportsWeatherVariants?: boolean;
  recommendedAmbient?: Partial<Record<FocusAmbientId, number>>;
}

export interface FocusTrackItem {
  id: string;
  title: string;
  artist: string;
  mood: FocusTrackMood;
  moodLabel: string;
  audioUrl: string;
}

export interface FocusAmbientItem {
  id: FocusAmbientId;
  label: string;
  audioUrl: string;
}

export interface FocusTaskItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface FocusPersistedState {
  selectedSceneId: FocusSceneId;
  loftVariant: LoftWeatherVariant;
  timerMode: FocusTimerMode;
  pomodoroMinutes: number;
  musicVolume: number;
  ambientVolumes: Record<FocusAmbientId, number>;
  tasks: FocusTaskItem[];
  streakCount: number;
  lastStudyDate: string;
  todayFocusedSeconds: number;
  todayDateKey: string;
}
