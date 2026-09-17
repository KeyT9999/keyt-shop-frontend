import { useState, useCallback, useEffect } from 'react';

export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isPlaying: boolean;
  isSpeaking: boolean;
  speak: (text: string, rateOrOnEnd?: number | (() => void), onEnd?: () => void) => void;
  stop: () => void;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } catch {
      // ignore
    }
  }, [isSupported]);

  const speak = useCallback(
    (text: string, rateOrOnEnd?: number | (() => void), onEnd?: () => void) => {
      if (!isSupported || !text) return;
      try {
        window.speechSynthesis.cancel();
        let rate = 0.9;
        let callback: (() => void) | undefined;

        if (typeof rateOrOnEnd === 'function') {
          callback = rateOrOnEnd;
        } else if (typeof rateOrOnEnd === 'number') {
          rate = rateOrOnEnd;
          callback = onEnd;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = rate;

        // Try selecting Japanese voice if available
        const voices = window.speechSynthesis.getVoices();
        const jaVoice = voices.find((v) => v.lang.startsWith('ja'));
        if (jaVoice) {
          utterance.voice = jaVoice;
        }

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => {
          setIsPlaying(false);
          callback?.();
        };
        utterance.onerror = () => {
          setIsPlaying(false);
          callback?.();
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
        setIsPlaying(false);
      }
    },
    [isSupported]
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
    stop
  };
}
