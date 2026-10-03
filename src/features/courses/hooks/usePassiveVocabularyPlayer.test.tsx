import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { VocabularyItem } from '../types';
import { usePassiveVocabularyPlayer } from './usePassiveVocabularyPlayer';
import type { PassiveSpeechAdapter } from '../services/passiveSpeechSynthesis';

function makeVocabularyItem(): VocabularyItem {
  return {
    _id: 'north',
    order: 1,
    term: '北',
    reading: 'きた',
    partOfSpeech: 'Danh từ',
    meaning: 'Phía bắc'
  };
}

function makeSpeechAdapter() {
  let voicesChanged: (() => void) | null = null;
  let availability = { japanese: false, vietnamese: false };
  const unsubscribe = vi.fn();
  const adapter: PassiveSpeechAdapter = {
    isSupported: true,
    getVoiceAvailability: () => availability,
    speak: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    cancel: vi.fn(),
    subscribeVoicesChanged: vi.fn((listener) => {
      voicesChanged = listener;
      return unsubscribe;
    })
  };

  return {
    adapter,
    unsubscribe,
    setAvailability(next: { japanese: boolean; vietnamese: boolean }) {
      availability = next;
    },
    notifyVoicesChanged() {
      voicesChanged?.();
    }
  };
}

describe('usePassiveVocabularyPlayer', () => {
  it('exposes prepared lesson entries and refreshes voice availability asynchronously', () => {
    const speech = makeSpeechAdapter();
    const items = [makeVocabularyItem()];
    const { result } = renderHook(() => usePassiveVocabularyPlayer(items, speech.adapter));

    expect(result.current.currentEntry).toMatchObject({
      id: 'north',
      term: '北',
      japaneseText: 'きた',
      vietnameseText: 'Phía bắc'
    });
    expect(result.current.voiceAvailability).toEqual({ japanese: false, vietnamese: false });

    speech.setAvailability({ japanese: true, vietnamese: true });
    act(() => speech.notifyVoicesChanged());

    expect(result.current.voiceAvailability).toEqual({ japanese: true, vietnamese: true });
  });

  it('starts playback and releases audio and voice listeners when unmounted', () => {
    const speech = makeSpeechAdapter();
    const items = [makeVocabularyItem()];
    const { result, unmount } = renderHook(() => usePassiveVocabularyPlayer(items, speech.adapter));

    act(() => result.current.start(5));
    expect(result.current.status).toBe('playing');
    expect(speech.adapter.speak).toHaveBeenCalledWith(
      'きた',
      'ja-JP',
      expect.objectContaining({ onEnd: expect.any(Function), onError: expect.any(Function) })
    );

    vi.mocked(speech.adapter.cancel).mockClear();
    unmount();

    expect(speech.adapter.cancel).toHaveBeenCalledOnce();
    expect(speech.unsubscribe).toHaveBeenCalledOnce();
  });
});
