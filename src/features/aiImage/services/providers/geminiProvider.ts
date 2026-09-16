import { GoogleGenAI } from '@google/genai';
import { AI_IMAGE_MODELS } from '../../constants';
import { AiProviderError } from '../../types';
import type {
  CompleteTextOptions,
  DescribeImageOptions,
  EditImageOptions,
  EditImageResult,
  ProviderAdapter,
} from '../../types';

let clientCache: Record<string, GoogleGenAI> = {};

function getClient(apiKey: string): GoogleGenAI {
  const key = apiKey.trim();
  if (!key) {
    throw new AiProviderError('gemini', 'invalid_key', 'Vui lòng nhập Gemini API Key trước khi sử dụng.');
  }
  if (!clientCache[key]) {
    clientCache[key] = new GoogleGenAI({ apiKey: key });
  }
  return clientCache[key];
}

/**
 * Chuẩn hóa lỗi Google API về AiProviderError.
 * Rút gọn từ parseGoogleApiError của features/youtubeSummarizer/services/geminiService.ts
 */
function normalizeError(error: any, apiKey: string): AiProviderError {
  const errorObj = error?.error || error?.response?.data?.error || error?.cause || error || {};
  const code: number = errorObj.code || errorObj.statusCode || error?.status || 0;
  const rawMessage: string = errorObj.message || error?.message || '';
  const msgLower = rawMessage.toLowerCase();
  const status: string = String(errorObj.status || '');

  const details: any[] = errorObj.details || [];
  const hasApiKeyReason = details.some(
    (d: any) => d?.reason === 'API_KEY_INVALID' || d?.reason === 'API_KEY_EXPIRED' || d?.reason?.includes?.('API_KEY')
  );
  const mentionsApiKey = msgLower.includes('api key') || msgLower.includes('api_key');

  if (hasApiKeyReason || ((code === 400 || code === 403) && mentionsApiKey)) {
    delete clientCache[apiKey.trim()];
    const leaked = msgLower.includes('leaked') || msgLower.includes('reported');
    return new AiProviderError(
      'gemini',
      'invalid_key',
      leaked
        ? 'Gemini API Key của bạn đã bị báo cáo lộ. Vui lòng tạo key mới tại Google AI Studio.'
        : 'Gemini API Key không hợp lệ. Vui lòng kiểm tra lại hoặc tạo key mới tại Google AI Studio.'
    );
  }
  if (code === 429 || status.includes('RESOURCE_EXHAUSTED') || msgLower.includes('quota')) {
    return new AiProviderError('gemini', 'quota', 'Gemini API Key đã hết hạn mức (quota). Vui lòng chờ hoặc đổi provider khác.');
  }
  if (status.includes('SAFETY') || msgLower.includes('safety') || msgLower.includes('blocked')) {
    return new AiProviderError('gemini', 'content_policy', 'Ảnh/yêu cầu bị Gemini từ chối vì chính sách nội dung.');
  }
  if (error instanceof TypeError || msgLower.includes('fetch') || msgLower.includes('network')) {
    return new AiProviderError('gemini', 'network', 'Không kết nối được tới Gemini. Kiểm tra mạng và thử lại.');
  }
  return new AiProviderError('gemini', 'unknown', rawMessage || 'Lỗi không xác định từ Gemini API.');
}

export function clearGeminiClientCache(): void {
  clientCache = {};
}

export const geminiProvider: ProviderAdapter = {
  async describeImage({ apiKey, imageBase64, mimeType, prompt, json }: DescribeImageOptions): Promise<string> {
    try {
      const ai = getClient(apiKey);
      const response = await ai.models.generateContent({
        model: AI_IMAGE_MODELS.gemini.vision,
        contents: [
          {
            role: 'user',
            parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: prompt }],
          },
        ],
        config: json ? { responseMimeType: 'application/json' } : undefined,
      });
      const text = response.text;
      if (!text) throw new AiProviderError('gemini', 'bad_response', 'Gemini không trả về nội dung.');
      return text;
    } catch (error: any) {
      if (error instanceof AiProviderError) throw error;
      throw normalizeError(error, apiKey);
    }
  },

  async completeText({ apiKey, prompt, json }: CompleteTextOptions): Promise<string> {
    try {
      const ai = getClient(apiKey);
      const response = await ai.models.generateContent({
        model: AI_IMAGE_MODELS.gemini.vision,
        contents: prompt,
        config: json ? { responseMimeType: 'application/json' } : undefined,
      });
      const text = response.text;
      if (!text) throw new AiProviderError('gemini', 'bad_response', 'Gemini không trả về nội dung.');
      return text;
    } catch (error: any) {
      if (error instanceof AiProviderError) throw error;
      throw normalizeError(error, apiKey);
    }
  },

  async editImage({ apiKey, imageBase64, mimeType, instruction }: EditImageOptions): Promise<EditImageResult> {
    try {
      const ai = getClient(apiKey);
      const response = await ai.models.generateContent({
        model: AI_IMAGE_MODELS.gemini.image,
        contents: [
          {
            role: 'user',
            parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: instruction }],
          },
        ],
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        const inline = (part as any).inlineData;
        if (inline?.data) {
          return {
            imageBase64: inline.data,
            mimeType: inline.mimeType || 'image/png',
            // Gemini image thường trả nền trắng thay vì alpha — caller sẽ kiểm tra lại bằng blobHasAlpha
            hasAlpha: false,
            note: 'Kết quả từ Gemini có thể là nền trắng thay vì nền trong suốt.',
          };
        }
      }
      throw new AiProviderError('gemini', 'bad_response', 'Gemini không trả về ảnh kết quả. Hãy thử lại hoặc dùng engine Local.');
    } catch (error: any) {
      if (error instanceof AiProviderError) throw error;
      throw normalizeError(error, apiKey);
    }
  },
};
