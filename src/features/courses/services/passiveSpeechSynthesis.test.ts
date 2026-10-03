import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createBrowserPassiveSpeechAdapter } from './passiveSpeechSynthesis';

class MockUtterance {
  text: string;
  lang = '';
  rate = 0;
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

function makeVoice(lang: string, name: string): SpeechSynthesisVoice {
  return { lang, name } as SpeechSynthesisVoice;
}

describe('createBrowserPassiveSpeechAdapter', () => {
  let utterances: MockUtterance[];
  let voices: SpeechSynthesisVoice[];
  let voicesChanged: EventListener | null;
  let removeVoicesChanged: ReturnType<typeof vi.fn>;
  let synthesis: SpeechSynthesis;

  beforeEach(() => {
    utterances = [];
    voices = [];
    voicesChanged = null;
    removeVoicesChanged = vi.fn();
    synthesis = {
      getVoices: () => voices,
      speak: (utterance: SpeechSynthesisUtterance) => utterances.push(utterance as unknown as MockUtterance),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        voicesChanged = listener as EventListener;
      },
      removeEventListener: removeVoicesChanged
    } as unknown as SpeechSynthesis;

    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance);
    vi.stubGlobal('speechSynthesis', synthesis);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('speaks with the exact locale voice when available', () => {
    voices = [makeVoice('ja-JP', 'Japanese'), makeVoice('vi-VN', 'Vietnamese')];
    const adapter = createBrowserPassiveSpeechAdapter();
    const onEnd = vi.fn();
    const onError = vi.fn();

    adapter.speak('きた', 'ja-JP', { onEnd, onError });
    const utterance = utterances[0];

    expect(utterance.text).toBe('きた');
    expect(utterance.lang).toBe('ja-JP');
    expect(utterance.voice).toBe(voices[0]);
    expect(utterance.rate).toBeGreaterThan(0);
    utterance.onend?.();
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it('uses a language-prefix voice and reports voice availability', () => {
    voices = [makeVoice('vi', 'Vietnamese default')];
    const adapter = createBrowserPassiveSpeechAdapter();

    expect(adapter.getVoiceAvailability()).toEqual({ japanese: false, vietnamese: true });
    adapter.speak('Phía bắc', 'vi-VN', { onEnd: vi.fn(), onError: vi.fn() });

    expect(utterances[0].voice).toBe(voices[0]);
    expect(utterances[0].lang).toBe('vi-VN');
  });

  it('keeps the locale hint and uses browser fallback when no matching voice exists', () => {
    voices = [makeVoice('en-US', 'English')];
    const adapter = createBrowserPassiveSpeechAdapter();

    adapter.speak('Phía bắc', 'vi-VN', { onEnd: vi.fn(), onError: vi.fn() });

    expect(utterances[0].voice).toBeNull();
    expect(utterances[0].lang).toBe('vi-VN');
  });

  it('forwards speech errors to the player', () => {
    const adapter = createBrowserPassiveSpeechAdapter();
    const onError = vi.fn();

    adapter.speak('きた', 'ja-JP', { onEnd: vi.fn(), onError });
    utterances[0].onerror?.({ error: 'network' });

    expect(onError).toHaveBeenCalledWith('network');
  });

  it('subscribes and removes the asynchronous voices-changed listener', () => {
    const adapter = createBrowserPassiveSpeechAdapter();
    const onChange = vi.fn();
    const unsubscribe = adapter.subscribeVoicesChanged(onChange);

    voicesChanged?.(new Event('voiceschanged'));
    expect(onChange).toHaveBeenCalledOnce();

    unsubscribe();
    expect(removeVoicesChanged).toHaveBeenCalledWith('voiceschanged', voicesChanged);
  });

  it('exposes controls for the shared browser speech queue', () => {
    const adapter = createBrowserPassiveSpeechAdapter();

    adapter.pause();
    adapter.resume();
    adapter.cancel();

    expect(synthesis.pause).toHaveBeenCalledOnce();
    expect(synthesis.resume).toHaveBeenCalledOnce();
    expect(synthesis.cancel).toHaveBeenCalledOnce();
  });
});
