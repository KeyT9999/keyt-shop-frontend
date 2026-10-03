export type PassiveSpeechLocale = 'ja-JP' | 'vi-VN';

export interface PassiveSpeechCallbacks {
  onEnd: () => void;
  onError: (reason: string) => void;
}

export interface PassiveSpeechAdapter {
  readonly isSupported: boolean;
  getVoiceAvailability: () => { japanese: boolean; vietnamese: boolean };
  speak: (text: string, locale: PassiveSpeechLocale, callbacks: PassiveSpeechCallbacks) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  subscribeVoicesChanged: (listener: () => void) => () => void;
}

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  return window.speechSynthesis;
}

function getUtteranceConstructor(): typeof SpeechSynthesisUtterance | null {
  if (typeof SpeechSynthesisUtterance === 'undefined') return null;
  return SpeechSynthesisUtterance;
}

function findVoice(voices: SpeechSynthesisVoice[], locale: PassiveSpeechLocale) {
  const normalizedLocale = locale.toLowerCase();
  const language = normalizedLocale.split('-')[0];

  return (
    voices.find((voice) => voice.lang.toLowerCase().replace('_', '-') === normalizedLocale) ??
    voices.find((voice) => voice.lang.toLowerCase().replace('_', '-').startsWith(`${language}-`)) ??
    voices.find((voice) => voice.lang.toLowerCase() === language)
  );
}

export function createBrowserPassiveSpeechAdapter(): PassiveSpeechAdapter {
  return {
    get isSupported() {
      return getSpeechSynthesis() !== null && getUtteranceConstructor() !== null;
    },

    getVoiceAvailability() {
      const voices = getSpeechSynthesis()?.getVoices() ?? [];
      return {
        japanese: !!findVoice(voices, 'ja-JP'),
        vietnamese: !!findVoice(voices, 'vi-VN')
      };
    },

    speak(text, locale, callbacks) {
      const synthesis = getSpeechSynthesis();
      const Utterance = getUtteranceConstructor();
      if (!synthesis || !Utterance) {
        callbacks.onError('unsupported');
        return;
      }

      try {
        const utterance = new Utterance(text);
        utterance.lang = locale;
        utterance.rate = locale === 'ja-JP' ? 0.9 : 0.95;

        const voice = findVoice(synthesis.getVoices(), locale);
        if (voice) utterance.voice = voice;

        utterance.onend = callbacks.onEnd;
        utterance.onerror = (event) => callbacks.onError(event.error || 'speech-error');
        synthesis.speak(utterance);
      } catch {
        callbacks.onError('speech-error');
      }
    },

    pause() {
      getSpeechSynthesis()?.pause();
    },

    resume() {
      getSpeechSynthesis()?.resume();
    },

    cancel() {
      getSpeechSynthesis()?.cancel();
    },

    subscribeVoicesChanged(listener) {
      const synthesis = getSpeechSynthesis();
      if (!synthesis) return () => undefined;

      const handleVoicesChanged = () => listener();
      synthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => synthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    }
  };
}
