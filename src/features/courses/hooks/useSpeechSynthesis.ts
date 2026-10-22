import { useState, useCallback, useEffect } from 'react';
import { speakNeural, stopNeuralSpeech } from '../../../utils/ttsAudio';

export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isPlaying: boolean;
  isSpeaking: boolean;
  speak: (text: string, rateOrOnEnd?: number | (() => void), onEnd?: () => void) => void;
  stop: () => void;
}

export function useSpeechSynthesis(lang = 'ja-JP'): UseSpeechSynthesisReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const isSupported = typeof window !== 'undefined';

  const stop = useCallback(() => {
    stopNeuralSpeech();
    setIsPlaying(false);
  }, []);

  const speak = useCallback(
    (text: string, rateOrOnEnd?: number | (() => void), onEnd?: () => void) => {
      if (!text) return;
      let rate = 1.0;
      let callback: (() => void) | undefined;

      if (typeof rateOrOnEnd === 'function') {
        callback = rateOrOnEnd;
      } else if (typeof rateOrOnEnd === 'number') {
        rate = rateOrOnEnd;
        callback = onEnd;
      }

      setIsPlaying(true);
      void speakNeural(text, lang, rate, () => {
        setIsPlaying(false);
        callback?.();
      });
    },
    [lang]
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isSupported,
    isPlaying,
    isSpeaking: isPlaying,
    speak,
    stop,
  };
}
