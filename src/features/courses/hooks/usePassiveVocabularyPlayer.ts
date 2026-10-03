import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { VocabularyItem } from '../types';
import { preparePassiveListeningSequence } from '../utils/passiveListeningSequence';
import { PassiveVocabularyPlayer } from '../services/passiveVocabularyPlayer';
import {
  createBrowserPassiveSpeechAdapter,
  type PassiveSpeechAdapter
} from '../services/passiveSpeechSynthesis';

const browserPassiveSpeechAdapter = createBrowserPassiveSpeechAdapter();

export function usePassiveVocabularyPlayer(
  items: VocabularyItem[],
  speechAdapter: PassiveSpeechAdapter = browserPassiveSpeechAdapter
) {
  const sequence = useMemo(() => preparePassiveListeningSequence(items), [items]);
  const player = useMemo(
    () => new PassiveVocabularyPlayer(sequence.entries, speechAdapter),
    [sequence.entries, speechAdapter]
  );
  const snapshot = useSyncExternalStore(player.subscribe, player.getSnapshot, player.getSnapshot);

  useEffect(() => {
    player.refreshVoiceAvailability();
    const unsubscribeVoices = speechAdapter.subscribeVoicesChanged(() => {
      player.refreshVoiceAvailability();
    });
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
    isSupported: speechAdapter.isSupported,
    start: (durationMinutes: number) => player.start(durationMinutes),
    pause: () => player.pause(),
    resume: () => player.resume(),
    stop: () => player.stop()
  };
}
