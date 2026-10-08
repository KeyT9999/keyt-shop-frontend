export type PassiveSpeechLocale = 'ja-JP' | 'zh-CN' | 'vi-VN';

export interface PassiveSpeechCallbacks {
  onEnd: () => void;
  onError: (reason: string) => void;
}

export interface PassiveSpeechAdapter {
  readonly isSupported: boolean;
  getVoiceAvailability: (primaryLocale?: PassiveSpeechLocale) => { japanese: boolean; vietnamese: boolean };
  speak: (text: string, locale: PassiveSpeechLocale, callbacks: PassiveSpeechCallbacks) => void;
  playAudio?: (url: string, callbacks: PassiveSpeechCallbacks) => void;
  pauseAudio?: () => void;
  resumeAudio?: () => void;
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
  let currentAudio: HTMLAudioElement | null = null;
  let currentAudioCallbacks: PassiveSpeechCallbacks | null = null;

  const cancelCurrentAudio = () => {
    if (!currentAudio) {
      currentAudioCallbacks = null;
      return;
    }
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
    currentAudioCallbacks = null;
  };

  return {
    get isSupported() {
      return getSpeechSynthesis() !== null && getUtteranceConstructor() !== null;
    },

    getVoiceAvailability(primaryLocale = 'ja-JP') {
      const voices = getSpeechSynthesis()?.getVoices() ?? [];
      return {
        japanese: !!findVoice(voices, primaryLocale),
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
        const preferredVoice = findVoice(synthesis.getVoices(), locale) ?? null;
        const speakWithVoice = (voice: SpeechSynthesisVoice | null, canRetryWithDefault: boolean) => {
          const utterance = new Utterance(text);
          utterance.lang = locale;
          utterance.rate = locale === 'ja-JP' || locale === 'zh-CN' ? 0.9 : 0.95;
          utterance.voice = voice;
          utterance.onend = callbacks.onEnd;
          utterance.onerror = (event) => {
            const voiceSelectionFailed = event.error === 'voice-unavailable' || event.error === 'language-unavailable';
            if (voice && canRetryWithDefault && voiceSelectionFailed) {
              // A voice list can be stale. Retry once with voice=null so the browser selects its default for this lang.
              speakWithVoice(null, false);
              return;
            }
            callbacks.onError(event.error || 'speech-error');
          };
          synthesis.speak(utterance);
        };

        // With no matching device voice, voice=null asks the browser to choose its default using this lang hint.
        speakWithVoice(preferredVoice, true);
      } catch {
        callbacks.onError('speech-error');
      }
    },

    playAudio(url, callbacks) {
      if (typeof Audio === 'undefined') {
        callbacks.onError('audio-unavailable');
        return;
      }

      cancelCurrentAudio();
      const audio = new Audio(url);
      audio.preload = 'auto';
      currentAudio = audio;
      currentAudioCallbacks = callbacks;
      audio.onended = () => {
        if (currentAudio !== audio) return;
        currentAudio = null;
        currentAudioCallbacks = null;
        callbacks.onEnd();
      };
      audio.onerror = () => {
        if (currentAudio !== audio) return;
        currentAudio = null;
        currentAudioCallbacks = null;
        callbacks.onError('audio-playback-error');
      };

      void audio.play().catch(() => {
        if (currentAudio !== audio) return;
        currentAudio = null;
        currentAudioCallbacks = null;
        callbacks.onError('audio-playback-error');
      });
    },

    pauseAudio() {
      currentAudio?.pause();
    },

    resumeAudio() {
      if (!currentAudio) return;
      const audio = currentAudio;
      void audio.play().catch(() => {
        if (currentAudio !== audio) return;
        currentAudio = null;
        const callbacks = currentAudioCallbacks;
        currentAudioCallbacks = null;
        callbacks?.onError('audio-playback-error');
      });
    },

    pause() {
      getSpeechSynthesis()?.pause();
    },

    resume() {
      getSpeechSynthesis()?.resume();
    },

    cancel() {
      cancelCurrentAudio();
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
