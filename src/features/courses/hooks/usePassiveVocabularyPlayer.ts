import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { VocabularyItem } from '../types';
import { preparePassiveListeningSequence } from '../utils/passiveListeningSequence';
import { PassiveVocabularyPlayer } from '../services/passiveVocabularyPlayer';
import {
  createBrowserPassiveSpeechAdapter,
  type PassiveSpeechAdapter
} from '../services/passiveSpeechSynthesis';
import { getCourseLanguage } from '../utils/courseLanguage';

const browserPassiveSpeechAdapter = createBrowserPassiveSpeechAdapter();

export function usePassiveVocabularyPlayer(
  items: VocabularyItem[],
  speechAdapter: PassiveSpeechAdapter = browserPassiveSpeechAdapter,
  courseCode = 'jpd123'
) {
  const language = getCourseLanguage(courseCode);
  const sequence = useMemo(
    () => preparePassiveListeningSequence(items, language.kind === 'chinese'),
    [items, language.kind]
  );
  const player = useMemo(
    () => new PassiveVocabularyPlayer(sequence.entries, speechAdapter, undefined, language.speechLocale),
    [sequence.entries, speechAdapter, language.speechLocale]
  );
  const snapshot = useSyncExternalStore(player.subscribe, player.getSnapshot, player.getSnapshot);
  const usesSavedChineseAudio =
    language.kind === 'chinese' &&
    sequence.entries.length > 0 &&
    sequence.entries.every((entry) => Boolean(entry.audioUrl));

  useEffect(() => {
    const unsubscribeVoices = speechAdapter.subscribeVoicesChanged(() => {
      player.refreshVoiceAvailability();
    });
    player.refreshVoiceAvailability();
    const syncTimeWhenVisible = () => {
      if (document.visibilityState === 'visible') player.syncTime();
    };

    document.addEventListener('visibilitychange', syncTimeWhenVisible);
    return () => {
      unsubscribeVoices();
      document.removeEventListener('visibilitychange', syncTimeWhenVisible);
      player.release();
    };
  }, [player, speechAdapter]);

  return {
    ...snapshot,
    currentEntry: sequence.entries[snapshot.currentIndex] ?? null,
    totalCount: sequence.entries.length,
    skippedCount: sequence.skippedCount,
    usesSavedChineseAudio,
    isSupported: speechAdapter.isSupported,
    start: (durationMinutes: number) => player.start(durationMinutes),
    pause: () => player.pause(),
    resume: () => player.resume(),
    stop: () => player.stop()
  };
}
