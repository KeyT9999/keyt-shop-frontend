import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_AMBIENT_VOLUMES,
  FOCUS_SCENES,
  FOCUS_TRACKS,
  LOFT_VARIANT_MEDIA,
} from '../features/focus/data/focusCatalog';
import type {
  FocusAmbientId,
  FocusPersistedState,
  FocusSceneId,
  FocusTaskItem,
  FocusTimerMode,
  LoftWeatherVariant,
} from '../features/focus/types/focusTypes';
import { focusAudioManager } from '../features/focus/utils/focusAudioManager';
import {
  isPageFullscreen,
  requestPageFullscreen,
  togglePageFullscreen,
} from '../features/focus/utils/focusFullscreen';
import {
  computeUpdatedStreak,
  getLocalDateKey,
  getYesterdayDateKey,
  loadFocusPersistedState,
  saveFocusPersistedState,
} from '../features/focus/utils/focusStorage';
import {
  FocusCafeContext,
  type FocusCafeContextType,
} from './focus-cafe-context';

export function FocusCafeProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<FocusPersistedState>(() =>
    loadFocusPersistedState()
  );
  const [trackIndex, setTrackIndex] = useState<number>(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    () => loadFocusPersistedState().pomodoroMinutes * 60
  );
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() =>
    isPageFullscreen()
  );

  const musicVolumeRef = useRef<number>(persisted.musicVolume);

  useEffect(() => {
    musicVolumeRef.current = persisted.musicVolume;
  }, [persisted.musicVolume]);

  // Persist user preferences & daily stats
  useEffect(() => {
    saveFocusPersistedState(persisted);
  }, [persisted]);

  // Sync fullscreen state with browser Esc / F11 events
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(isPageFullscreen());
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const currentTrack = useMemo(
    () => FOCUS_TRACKS[trackIndex] || FOCUS_TRACKS[0],
    [trackIndex]
  );

  const activeScene = useMemo(
    () =>
      FOCUS_SCENES.find((s) => s.id === persisted.selectedSceneId) ||
      FOCUS_SCENES[0],
    [persisted.selectedSceneId]
  );

  const { activeVideoUrl, activePosterUrl } = useMemo(() => {
    if (activeScene.id === 'loft-room') {
      const variantMedia = LOFT_VARIANT_MEDIA[persisted.loftVariant];
      return {
        activeVideoUrl: variantMedia.videoUrl,
        activePosterUrl: variantMedia.posterUrl,
      };
    }
    return {
      activeVideoUrl: activeScene.videoUrl,
      activePosterUrl: activeScene.posterUrl,
    };
  }, [activeScene, persisted.loftVariant]);

  // Auto-advance to next track when current MP3 ends
  useEffect(() => {
    focusAudioManager.setOnTrackEnded(() => {
      setTrackIndex((prev) => {
        const nextIdx = (prev + 1) % FOCUS_TRACKS.length;
        const nextItem = FOCUS_TRACKS[nextIdx];
        void focusAudioManager.playTrack(nextItem.audioUrl, musicVolumeRef.current);
        return nextIdx;
      });
    });
    return () => focusAudioManager.setOnTrackEnded(null);
  }, []);

  // Keep ambient audio synced whenever volumes or music playback state changes
  useEffect(() => {
    const anyAmbientActive = Object.values(persisted.ambientVolumes).some(
      (v) => v > 0.01
    );
    focusAudioManager.syncAmbients(
      persisted.ambientVolumes,
      isMusicPlaying || isTimerRunning || anyAmbientActive
    );
  }, [persisted.ambientVolumes, isMusicPlaying, isTimerRunning]);

  // Timer 1-second tick & daily streak recording
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = window.setInterval(() => {
      const todayKey = getLocalDateKey();
      const yesterdayKey = getYesterdayDateKey();

      setPersisted((prev) => {
        const baseFocused = prev.todayDateKey === todayKey ? prev.todayFocusedSeconds : 0;
        const nextFocused = baseFocused + 1;
        const streakUpdate =
          nextFocused >= 60
            ? computeUpdatedStreak(
                prev.streakCount,
                prev.lastStudyDate,
                todayKey,
                yesterdayKey
              )
            : { streakCount: prev.streakCount, lastStudyDate: prev.lastStudyDate };

        return {
          ...prev,
          todayDateKey: todayKey,
          todayFocusedSeconds: nextFocused,
          streakCount: streakUpdate.streakCount,
          lastStudyDate: streakUpdate.lastStudyDate,
        };
      });

      if (persisted.timerMode === 'stopwatch') {
        setStopwatchSeconds((s) => s + 1);
      } else {
        setRemainingSeconds((prevRem) => {
          if (prevRem <= 1) {
            focusAudioManager.playCompletionBell();
            setIsTimerRunning(false);
            return persisted.pomodoroMinutes * 60;
          }
          return prevRem - 1;
        });
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isTimerRunning, persisted.timerMode, persisted.pomodoroMinutes]);

  const selectScene = useCallback((sceneId: FocusSceneId) => {
    setPersisted((prev) => ({ ...prev, selectedSceneId: sceneId }));
  }, []);

  const setLoftVariant = useCallback((variant: LoftWeatherVariant) => {
    setPersisted((prev) => ({ ...prev, loftVariant: variant }));
  }, []);

  const toggleMusic = useCallback(() => {
    if (isMusicPlaying) {
      focusAudioManager.pauseTrack();
      setIsMusicPlaying(false);
    } else {
      void focusAudioManager
        .playTrack(currentTrack.audioUrl, persisted.musicVolume)
        .then((ok) => setIsMusicPlaying(ok));
    }
  }, [isMusicPlaying, currentTrack.audioUrl, persisted.musicVolume]);

  const nextTrack = useCallback(() => {
    const nextIdx = (trackIndex + 1) % FOCUS_TRACKS.length;
    setTrackIndex(nextIdx);
    void focusAudioManager
      .playTrack(FOCUS_TRACKS[nextIdx].audioUrl, persisted.musicVolume)
      .then((ok) => setIsMusicPlaying(ok));
  }, [trackIndex, persisted.musicVolume]);

  const prevTrack = useCallback(() => {
    const prevIdx = (trackIndex - 1 + FOCUS_TRACKS.length) % FOCUS_TRACKS.length;
    setTrackIndex(prevIdx);
    void focusAudioManager
      .playTrack(FOCUS_TRACKS[prevIdx].audioUrl, persisted.musicVolume)
      .then((ok) => setIsMusicPlaying(ok));
  }, [trackIndex, persisted.musicVolume]);

  const selectTrack = useCallback(
    (trackId: string) => {
      const idx = FOCUS_TRACKS.findIndex((t) => t.id === trackId);
      if (idx === -1) return;
      setTrackIndex(idx);
      void focusAudioManager
        .playTrack(FOCUS_TRACKS[idx].audioUrl, persisted.musicVolume)
        .then((ok) => setIsMusicPlaying(ok));
    },
    [persisted.musicVolume]
  );

  const setMusicVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    focusAudioManager.setTrackVolume(clamped);
    setPersisted((prev) => ({ ...prev, musicVolume: clamped }));
  }, []);

  const setAmbientVolume = useCallback(
    (ambientId: FocusAmbientId, volume: number) => {
      const clamped = Math.max(0, Math.min(1, volume));
      setPersisted((prev) => {
        const nextAmbients = { ...prev.ambientVolumes, [ambientId]: clamped };
        focusAudioManager.syncAmbients(nextAmbients, true);
        return { ...prev, ambientVolumes: nextAmbients };
      });
    },
    []
  );

  const resetAmbients = useCallback(() => {
    const zeroed: Record<FocusAmbientId, number> = {
      ...DEFAULT_AMBIENT_VOLUMES,
      rain: 0,
    };
    focusAudioManager.syncAmbients(zeroed, false);
    setPersisted((prev) => ({ ...prev, ambientVolumes: zeroed }));
  }, []);

  const setTimerMode = useCallback(
    (mode: FocusTimerMode) => {
      setIsTimerRunning(false);
      setPersisted((prev) => ({ ...prev, timerMode: mode }));
      if (mode === 'pomodoro') {
        setRemainingSeconds(persisted.pomodoroMinutes * 60);
      }
    },
    [persisted.pomodoroMinutes]
  );

  const setPomodoroMinutes = useCallback((minutes: number) => {
    setIsTimerRunning(false);
    setPersisted((prev) => ({
      ...prev,
      timerMode: 'pomodoro',
      pomodoroMinutes: minutes,
    }));
    setRemainingSeconds(minutes * 60);
  }, []);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    if (persisted.timerMode === 'stopwatch') {
      setStopwatchSeconds(0);
    } else {
      setRemainingSeconds(persisted.pomodoroMinutes * 60);
    }
  }, [persisted.timerMode, persisted.pomodoroMinutes]);

  const addTask = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const item: FocusTaskItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    setPersisted((prev) => ({ ...prev, tasks: [item, ...prev.tasks] }));
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setPersisted((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    }));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setPersisted((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  }, []);

  const clearCompletedTasks = useCallback(() => {
    setPersisted((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => !t.completed),
    }));
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const active = await togglePageFullscreen();
    setIsFullscreen(active);
  }, []);

  const enterFocusSession = useCallback(
    (options?: { autoStartMusic?: boolean; autoFullscreen?: boolean }) => {
      const shouldFullscreen = options?.autoFullscreen ?? true;
      const shouldPlayMusic = options?.autoStartMusic ?? true;

      if (shouldFullscreen) {
        void requestPageFullscreen().then((ok) => setIsFullscreen(ok));
      }
      if (shouldPlayMusic && !isMusicPlaying) {
        void focusAudioManager
          .playTrack(currentTrack.audioUrl, persisted.musicVolume)
          .then((ok) => {
            setIsMusicPlaying(ok);
            focusAudioManager.syncAmbients(persisted.ambientVolumes, ok);
          });
      }
      setIsTimerRunning(true);
    },
    [
      isMusicPlaying,
      currentTrack.audioUrl,
      persisted.musicVolume,
      persisted.ambientVolumes,
    ]
  );

  const stopAllFocusSession = useCallback(() => {
    setIsTimerRunning(false);
    setIsMusicPlaying(false);
    focusAudioManager.stopAll();
  }, []);

  const value = useMemo<FocusCafeContextType>(
    () => ({
      selectedSceneId: persisted.selectedSceneId,
      activeScene,
      loftVariant: persisted.loftVariant,
      activeVideoUrl,
      activePosterUrl,
      selectScene,
      setLoftVariant,

      currentTrack,
      isMusicPlaying,
      musicVolume: persisted.musicVolume,
      ambientVolumes: persisted.ambientVolumes,
      toggleMusic,
      nextTrack,
      prevTrack,
      selectTrack,
      setMusicVolume,
      setAmbientVolume,
      resetAmbients,

      timerMode: persisted.timerMode,
      pomodoroMinutes: persisted.pomodoroMinutes,
      remainingSeconds,
      stopwatchSeconds,
      isTimerRunning,
      streakCount: persisted.streakCount,
      todayFocusedSeconds: persisted.todayFocusedSeconds,
      setTimerMode,
      setPomodoroMinutes,
      toggleTimer,
      resetTimer,

      tasks: persisted.tasks,
      addTask,
      toggleTask,
      removeTask,
      clearCompletedTasks,

      isFullscreen,
      toggleFullscreen,
      enterFocusSession,
      stopAllFocusSession,
    }),
    [
      persisted,
      activeScene,
      activeVideoUrl,
      activePosterUrl,
      selectScene,
      setLoftVariant,
      currentTrack,
      isMusicPlaying,
      toggleMusic,
      nextTrack,
      prevTrack,
      selectTrack,
      setMusicVolume,
      setAmbientVolume,
      resetAmbients,
      remainingSeconds,
      stopwatchSeconds,
      isTimerRunning,
      setTimerMode,
      setPomodoroMinutes,
      toggleTimer,
      resetTimer,
      addTask,
      toggleTask,
      removeTask,
      clearCompletedTasks,
      isFullscreen,
      toggleFullscreen,
      enterFocusSession,
      stopAllFocusSession,
    ]
  );

  return (
    <FocusCafeContext.Provider value={value}>
      {children}
    </FocusCafeContext.Provider>
  );
}
