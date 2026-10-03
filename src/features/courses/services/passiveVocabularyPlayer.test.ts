import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PassiveListeningEntry } from '../utils/passiveListeningSequence';
import {
  PassiveVocabularyPlayer,
  type PassiveListeningClock
} from './passiveVocabularyPlayer';
import type {
  PassiveSpeechAdapter,
  PassiveSpeechCallbacks,
  PassiveSpeechLocale
} from './passiveSpeechSynthesis';

interface SpeechCall {
  text: string;
  locale: PassiveSpeechLocale;
  callbacks: PassiveSpeechCallbacks;
}

const clock: PassiveListeningClock = {
  now: () => performance.now(),
  setTimeout: (callback, delayMs) => window.setTimeout(callback, delayMs),
  clearTimeout: (handle) => window.clearTimeout(handle),
  setInterval: (callback, delayMs) => window.setInterval(callback, delayMs),
  clearInterval: (handle) => window.clearInterval(handle)
};

const entries: PassiveListeningEntry[] = [
  {
    id: 'north', order: 1, term: '北', reading: 'きた', romaji: 'kita', japaneseText: 'きた', vietnameseText: 'Phía bắc'
  },
  {
    id: 'south', order: 2, term: '南', reading: 'みなみ', romaji: 'minami', japaneseText: 'みなみ', vietnameseText: 'Phía nam'
  }
];

describe('PassiveVocabularyPlayer', () => {
  let calls: SpeechCall[];
  let speech: PassiveSpeechAdapter;
  let player: PassiveVocabularyPlayer;

  beforeEach(() => {
    vi.useFakeTimers();
    calls = [];
    speech = {
      isSupported: true,
      getVoiceAvailability: () => ({ japanese: true, vietnamese: true }),
      speak: vi.fn((text, locale, callbacks) => calls.push({ text, locale, callbacks })),
      pause: vi.fn(),
      resume: vi.fn(),
      cancel: vi.fn(),
      subscribeVoicesChanged: vi.fn(() => () => undefined)
    };
    player = new PassiveVocabularyPlayer(entries, speech, clock);
  });

  afterEach(() => {
    player.dispose();
    vi.useRealTimers();
  });

  it('reads Japanese then Vietnamese, rests between words, and wraps the full list', () => {
    expect(player.start(1)).toBe(true);
    expect(calls.map(({ text, locale }) => [text, locale])).toEqual([['きた', 'ja-JP']]);

    calls[0].callbacks.onEnd();
    vi.advanceTimersByTime(300);
    expect(calls[1].text).toBe('Phía bắc');
    expect(calls[1].locale).toBe('vi-VN');

    calls[1].callbacks.onEnd();
    vi.advanceTimersByTime(999);
    expect(calls).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(calls[2]).toMatchObject({ text: 'みなみ', locale: 'ja-JP' });

    calls[2].callbacks.onEnd();
    vi.advanceTimersByTime(300);
    calls[3].callbacks.onEnd();
    vi.advanceTimersByTime(1_000);

    expect(calls[4]).toMatchObject({ text: 'きた', locale: 'ja-JP' });
    expect(player.getSnapshot()).toMatchObject({
      status: 'playing',
      currentIndex: 0,
      cycleNumber: 2,
      phase: 'japanese'
    });
  });

  it('freezes the countdown and a pending inter-utterance delay while paused', () => {
    player.start(5);
    calls[0].callbacks.onEnd();
    vi.advanceTimersByTime(100);
    player.pause();
    const pausedRemaining = player.getSnapshot().remainingMs;

    vi.advanceTimersByTime(5_000);
    expect(player.getSnapshot()).toMatchObject({ status: 'paused', remainingMs: pausedRemaining });
    expect(calls).toHaveLength(1);

    player.resume();
    vi.advanceTimersByTime(199);
    expect(calls).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(calls[1]).toMatchObject({ text: 'Phía bắc', locale: 'vi-VN' });
  });

  it('pauses and resumes the active browser utterance without starting another one', () => {
    player.start(5);

    player.pause();
    expect(speech.pause).toHaveBeenCalledOnce();
    expect(player.getSnapshot().status).toBe('paused');

    player.resume();
    expect(speech.resume).toHaveBeenCalledOnce();
    expect(calls).toHaveLength(1);
    expect(player.getSnapshot().status).toBe('playing');
  });

  it('cancels speech and ignores callbacks from a stopped session', () => {
    player.start(5);
    vi.mocked(speech.cancel).mockClear();
    const oldCallback = calls[0].callbacks.onEnd;

    player.stop();
    oldCallback();
    vi.advanceTimersByTime(5_000);

    expect(player.getSnapshot().status).toBe('stopped');
    expect(calls).toHaveLength(1);
    expect(speech.cancel).toHaveBeenCalledOnce();
  });

  it('stops automatically at the selected deadline', () => {
    player.start(1);
    vi.mocked(speech.cancel).mockClear();

    vi.advanceTimersByTime(60_000);

    expect(player.getSnapshot()).toMatchObject({ status: 'completed', remainingMs: 0 });
    expect(speech.cancel).toHaveBeenCalledOnce();
  });

  it('stops safely and exposes a Vietnamese message when speech errors', () => {
    player.start(5);
    vi.mocked(speech.cancel).mockClear();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    calls[0].callbacks.onError('network');

    expect(player.getSnapshot()).toMatchObject({
      status: 'error',
      errorMessage: expect.stringContaining('Giọng đọc')
    });
    expect(speech.cancel).toHaveBeenCalledOnce();
  });

  it('rejects an invalid duration and an empty lesson without speaking', () => {
    expect(player.start(0)).toBe(false);
    expect(player.getSnapshot().status).toBe('error');
    expect(calls).toHaveLength(0);

    const emptyPlayer = new PassiveVocabularyPlayer([], speech, clock);
    expect(emptyPlayer.start(5)).toBe(false);
    expect(emptyPlayer.getSnapshot().errorMessage).toContain('Bài học');
    expect(calls).toHaveLength(0);
    emptyPlayer.dispose();
  });

  it('does not break a running session if an invalid restart is requested', () => {
    player.start(5);
    vi.mocked(speech.cancel).mockClear();

    expect(player.start(61)).toBe(false);
    expect(player.getSnapshot().status).toBe('playing');
    expect(speech.cancel).not.toHaveBeenCalled();
    player.stop();
  });

  it('stops and clears timers when disposed', () => {
    player.start(5);
    vi.mocked(speech.cancel).mockClear();
    player.dispose();
    vi.advanceTimersByTime(5_000);

    expect(speech.cancel).toHaveBeenCalledOnce();
    expect(calls).toHaveLength(1);
  });
});
