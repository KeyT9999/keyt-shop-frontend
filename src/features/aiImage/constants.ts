import type { AiProvider } from './types';

// Model ID tập trung một chỗ — provider đổi tên model thì chỉ sửa file này
export const AI_IMAGE_MODELS = {
  gemini: {
    vision: 'gemini-2.5-flash',
    image: 'gemini-2.5-flash-image',
  },
  openai: {
    vision: 'gpt-4o-mini',
    image: 'gpt-image-1',
  },
  deepseek: {
    text: 'deepseek-chat',
  },
} as const;

export const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
export const OPENAI_API_URL = 'https://api.openai.com/v1';

/** Giới hạn file đầu vào */
export const MAX_FILE_SIZE_MB = 20;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
export const ACCEPT_ATTR = 'image/jpeg, image/png, image/webp, image/heic';

/** Cạnh dài tối đa khi gửi ảnh lên LLM (tiết kiệm token) */
export const LLM_IMAGE_MAX_DIM = 1024;

/** sessionStorage key cho preset chuyển sang PhotoFrame */
export const PRESET_STORAGE_KEY = 'photoframe-ai-preset';
/** Ảnh dataURL chỉ đính kèm preset khi nhỏ hơn ngưỡng này (quota sessionStorage ~5MB) */
export const PRESET_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  gemini: 'Google Gemini',
  openai: 'OpenAI (GPT)',
  deepseek: 'DeepSeek',
};

export const PROVIDER_KEY_HELP: Record<AiProvider, { label: string; url: string }> = {
  gemini: { label: 'Lấy key miễn phí tại Google AI Studio', url: 'https://aistudio.google.com/apikey' },
  openai: { label: 'Lấy key tại OpenAI Platform', url: 'https://platform.openai.com/api-keys' },
  deepseek: { label: 'Lấy key tại DeepSeek Platform', url: 'https://platform.deepseek.com/api_keys' },
};
