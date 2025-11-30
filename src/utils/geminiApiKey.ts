const GEMINI_API_KEY_STORAGE = 'examflow_gemini_api_key';

export const getGeminiApiKey = (): string | null => {
  try {
    const storedKey = localStorage.getItem(GEMINI_API_KEY_STORAGE);
    return storedKey;
  } catch (e) {
    console.error("Failed to get Gemini API key", e);
    return null;
  }
};

export const saveGeminiApiKey = (apiKey: string): void => {
  try {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, apiKey);
  } catch (e) {
    console.error("Failed to save Gemini API key", e);
  }
};

export const clearGeminiApiKey = (): void => {
  try {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE);
  } catch (e) {
    console.error("Failed to clear Gemini API key", e);
  }
};

