import type { AiProvider } from '../features/aiImage/types';

const STORAGE_KEY = 'ai-provider-keys';
// Key Gemini cũ của YouTube Summarizer — tự migrate sang slot gemini
const LEGACY_GEMINI_KEY = 'examflow_gemini_api_key';

type KeyMap = Partial<Record<AiProvider, string>>;

function readMap(): KeyMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map: KeyMap = raw ? JSON.parse(raw) : {};

    // Migration một chiều từ key Gemini cũ
    if (!map.gemini) {
      const legacy = localStorage.getItem(LEGACY_GEMINI_KEY);
      if (legacy && legacy.trim()) {
        map.gemini = legacy.trim();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      }
    }
    return map;
  } catch (e) {
    console.error('Failed to read AI provider keys', e);
    return {};
  }
}

function writeMap(map: KeyMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save AI provider keys', e);
  }
}

export function getProviderKey(provider: AiProvider): string | null {
  const key = readMap()[provider];
  return key && key.trim() ? key.trim() : null;
}

export function getAllProviderKeys(): KeyMap {
  return readMap();
}

export function saveProviderKey(provider: AiProvider, apiKey: string): void {
  const map = readMap();
  map[provider] = apiKey.trim();
  writeMap(map);
}

export function clearProviderKey(provider: AiProvider): void {
  const map = readMap();
  delete map[provider];
  writeMap(map);
}
