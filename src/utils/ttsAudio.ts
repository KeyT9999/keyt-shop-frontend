import API_BASE_URL from '../config/api';

let currentAudio: HTMLAudioElement | null = null;
const blobUrlCache = new Map<string, string>();
const MAX_BLOB_CACHE = 300;

export function stopNeuralSpeech(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

function fallbackBrowserSpeak(text: string, lang: string, rate: number, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  } catch {
    onEnd?.();
  }
}

/**
 * Play natural Microsoft Azure Neural TTS from VPS (/api/courses/tts)
 * with client-side memory caching and automatic browser fallback.
 */
export async function speakNeural(
  rawText: string,
  lang = 'ja-JP',
  rate = 1.0,
  onEnd?: () => void
): Promise<void> {
  const text = String(rawText || '').trim();
  if (!text) {
    onEnd?.();
    return;
  }

  stopNeuralSpeech();

  const cacheKey = `${lang}|${text}`;
  const ttsEndpoint = `${API_BASE_URL}/courses/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`;

  try {
    let audioSrc = blobUrlCache.get(cacheKey);
    if (!audioSrc) {
      const res = await fetch(ttsEndpoint);
      if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
      const blob = await res.blob();
      if (blob.size < 100) throw new Error('Empty TTS audio');
      audioSrc = URL.createObjectURL(blob);
      if (blobUrlCache.size >= MAX_BLOB_CACHE) {
        const oldest = blobUrlCache.keys().next().value;
        if (oldest) {
          const oldUrl = blobUrlCache.get(oldest);
          if (oldUrl) URL.revokeObjectURL(oldUrl);
          blobUrlCache.delete(oldest);
        }
      }
      blobUrlCache.set(cacheKey, audioSrc);
    }

    const audio = new Audio(audioSrc);
    audio.playbackRate = Math.max(0.6, Math.min(1.5, rate || 1.0));
    currentAudio = audio;

    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      onEnd?.();
    };
    audio.onerror = () => {
      if (currentAudio === audio) currentAudio = null;
      fallbackBrowserSpeak(text, lang, rate, onEnd);
    };

    await audio.play();
  } catch {
    fallbackBrowserSpeak(text, lang, rate, onEnd);
  }
}
