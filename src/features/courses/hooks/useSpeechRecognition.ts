import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  calculateMatchRate: (targetText: string) => {
    matchPercentage: number;
    matchedWords: string[];
    missingWords: string[];
  };
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check support
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = options.continuous !== false;
    recognition.interimResults = options.interimResults !== false;
    recognition.lang = options.lang || 'ja-JP';

    recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript((prev) => final || prev || interim);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setError(event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [isSupported, options.continuous, options.interimResults, options.lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (err: any) {
      console.warn('Failed to stop speech recognition:', err);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  const calculateMatchRate = useCallback(
    (targetText: string) => {
      if (!targetText || !transcript) {
        return { matchPercentage: 0, matchedWords: [], missingWords: [] };
      }

      // Simple character / word token comparison
      const cleanTarget = targetText.replace(/[\s\n\r。、,.!?！？]/g, '');
      const cleanInput = transcript.replace(/[\s\n\r。、,.!?！？]/g, '');

      if (!cleanTarget.length) {
        return { matchPercentage: 0, matchedWords: [], missingWords: [] };
      }

      // Count matched characters
      let matches = 0;
      const targetChars = cleanTarget.split('');
      const inputSet = new Set(cleanInput.split(''));

      targetChars.forEach((ch) => {
        if (inputSet.has(ch)) {
          matches++;
        }
      });

      const percentage = Math.min(100, Math.round((matches / targetChars.length) * 100));

      return {
        matchPercentage: percentage,
        matchedWords: [],
        missingWords: []
      };
    },
    [transcript]
  );

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    calculateMatchRate
  };
}
