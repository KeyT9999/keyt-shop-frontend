import { GoogleGenAI } from '@google/genai';
import { SummaryStyle } from '../types';
import type { SummaryResult } from '../types';

let aiClientCache: { [key: string]: GoogleGenAI } = {};

// Custom error class for Gemini API errors
export class GeminiApiError extends Error {
  code: number;
  isApiKeyError: boolean;
  isLeakedKey: boolean;

  constructor(code: number, message: string, isApiKeyError: boolean, isLeakedKey: boolean) {
    super(message);
    this.name = 'GeminiApiError';
    this.code = code;
    this.isApiKeyError = isApiKeyError;
    this.isLeakedKey = isLeakedKey;
  }
}

// Parse Google API error response
// Format: { error: { code: 400, message: "...", status: "...", details: [...] } }
function parseGoogleApiError(error: any): {
  code: number;
  message: string;
  isApiKeyError: boolean;
  isLeakedKey: boolean;
} {
  // Default values
  let code = 500;
  let message = 'Đã xảy ra lỗi khi kết nối với Gemini API. Vui lòng thử lại sau.';
  let isApiKeyError = false;
  let isLeakedKey = false;

  // Debug: Log error structure to help diagnose issues
  if (process.env.NODE_ENV === 'development') {
    console.log('[Gemini API Error]', JSON.stringify(error, null, 2));
  }

  // Try to extract error from various possible structures
  let errorObj: any = null;
  let errorMessage = '';
  
  // Check multiple possible error structures
  if (error?.error) {
    // Nested error structure: { error: { code, message, ... } }
    errorObj = error.error;
  } else if (error?.response?.data?.error) {
    // Axios-like response structure
    errorObj = error.response.data.error;
  } else if (error?.cause) {
    // Error with cause property
    errorObj = error.cause;
  } else if (error?.status || error?.code) {
    // Direct error object
    errorObj = error;
  }

  // Extract code and message
  if (errorObj) {
    code = errorObj.code || errorObj.status?.code || errorObj.statusCode || code;
    errorMessage = errorObj.message || errorObj.error?.message || '';
    message = errorMessage || message;
  }

  const messageLower = (errorMessage || message || '').toLowerCase();

  // Check for API key related errors
  if (errorObj || error?.error) {
    const details = errorObj?.details || error?.error?.details || [];
    const status = errorObj?.status || error?.error?.status || '';
    
    // Check if it's specifically about API key
    const hasApiKeyError = details.some(
      (detail: any) => 
        detail.reason === 'API_KEY_INVALID' || 
        detail.reason === 'API_KEY_EXPIRED' ||
        (detail['@type']?.includes('ErrorInfo') && detail.reason?.includes('API_KEY'))
    );
    
    // Check message for API key keywords
    const messageHasApiKey = messageLower.includes('api key') || messageLower.includes('api_key');
    
    // Check status for API key related statuses
    const statusHasApiKey = status.toLowerCase().includes('invalid_argument') || 
                           status.toLowerCase().includes('permission_denied');
    
    // Only mark as API key error if we have strong evidence
    if ((code === 400 || code === 403) && (hasApiKeyError || (messageHasApiKey && statusHasApiKey))) {
      isApiKeyError = true;
      
      // Check if it's a leaked key - must have "leaked" or "reported" in message
      // Only mark as leaked if explicitly mentioned in the error message
      const hasLeakedKeyword = messageLower.includes('leaked') || messageLower.includes('reported');
      
      if (code === 403 && hasLeakedKeyword) {
        isLeakedKey = true;
        message = 'API Key của bạn đã bị báo cáo là đã bị lộ. Vui lòng tạo API Key mới tại Google AI Studio và cập nhật lại.';
      } else if (code === 400 || (code === 403 && messageHasApiKey)) {
        // Invalid API key (but not leaked) - for both 400 and 403 with API key in message
        message = 'API Key không hợp lệ. Vui lòng kiểm tra lại hoặc tạo API Key mới tại Google AI Studio.';
      }
    }
  }
  
  // Fallback: Check error.message if we haven't identified it yet
  if (!isApiKeyError && error?.message) {
    // Handle string errors or Error objects
    const errorMsg = error.message.toLowerCase();
    const hasApiKeyKeyword = errorMsg.includes('api key') || errorMsg.includes('api_key');
    
    if (hasApiKeyKeyword) {
      isApiKeyError = true;
      // Only mark as leaked if explicitly mentioned
      if (errorMsg.includes('leaked') || errorMsg.includes('reported')) {
        isLeakedKey = true;
        message = 'API Key của bạn đã bị báo cáo là đã bị lộ. Vui lòng tạo API Key mới tại Google AI Studio và cập nhật lại.';
      } else {
        message = 'API Key không hợp lệ. Vui lòng kiểm tra lại hoặc tạo API Key mới tại Google AI Studio.';
      }
    } else if (!message || message === 'Đã xảy ra lỗi khi kết nối với Gemini API. Vui lòng thử lại sau.') {
      message = error.message;
    }
  } else if (typeof error === 'string') {
    const errorMessage = error.toLowerCase();
    if (errorMessage.includes('api key') || errorMessage.includes('api_key')) {
      isApiKeyError = true;
      // Only mark as leaked if explicitly mentioned
      if (errorMessage.includes('leaked') || errorMessage.includes('reported')) {
        isLeakedKey = true;
        message = 'API Key của bạn đã bị báo cáo là đã bị lộ. Vui lòng tạo API Key mới tại Google AI Studio và cập nhật lại.';
      } else {
        message = 'API Key không hợp lệ. Vui lòng kiểm tra lại hoặc tạo API Key mới tại Google AI Studio.';
      }
    } else {
      message = error;
    }
  }

  return { code, message, isApiKeyError, isLeakedKey };
}

// Clear cached client when invalid key detected
export function clearApiClientCache(apiKey?: string): void {
  if (apiKey) {
    delete aiClientCache[apiKey];
  } else {
    aiClientCache = {};
  }
}

const getAiClient = (apiKey: string): GoogleGenAI => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API Key không được để trống. Vui lòng nhập API Key để sử dụng tính năng AI.');
  }

  // Cache client per API key
  if (aiClientCache[apiKey]) {
    return aiClientCache[apiKey];
  }

  aiClientCache[apiKey] = new GoogleGenAI({ apiKey: apiKey.trim() });
  return aiClientCache[apiKey];
};

const buildPromptDirective = (style: SummaryStyle): string => {
  switch (style) {
    case SummaryStyle.BRIEF:
      return 'Hãy tóm tắt nội dung video này thật ngắn gọn trong 3-5 câu (TL;DR).';
    case SummaryStyle.DETAILED:
      return 'Tóm tắt chi tiết: một đoạn tổng quan ngắn, tiếp theo liệt kê 5-10 ý chính quan trọng nhất dưới dạng bullet point.';
    case SummaryStyle.LEARNING:
      return 'Giải thích giống như một bài giảng: nêu rõ khái niệm, định nghĩa, ví dụ và cách áp dụng.';
    default:
      return 'Hãy tóm tắt video này ở mức độ cơ bản.';
  }
};

export const generateVideoSummary = async (
  videoTitle: string,
  videoUrl: string,
  style: SummaryStyle,
  apiKey: string
): Promise<SummaryResult> => {
  try {
    const ai = getAiClient(apiKey);
    const promptDirective = buildPromptDirective(style);

    const prompt = `
    Bạn là trợ lý KeyT YouTube Summarizer.
    Nhiệm vụ: Tóm tắt video sau.

    Thông tin:
    - Tiêu đề: "${videoTitle}"
    - URL: ${videoUrl}

    ${promptDirective}

    Trả về ở định dạng JSON:
    {
      "shortSummary": "...",
      "keyPoints": ["...", "..."]
    }
  `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Không nhận được phản hồi từ Gemini.');
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      throw new Error('Định dạng phản hồi từ Gemini không hợp lệ.');
    }

    return {
      shortSummary: parsed.shortSummary || 'Không thể tạo tóm tắt.',
      keyPoints: parsed.keyPoints || [],
      fullText: text,
    };
  } catch (error: any) {
    // Parse Google API error
    const parsedError = parseGoogleApiError(error);
    
    // Clear cache if API key is invalid
    if (parsedError.isApiKeyError) {
      clearApiClientCache(apiKey);
    }
    
    // Throw custom error with parsed information
    throw new GeminiApiError(
      parsedError.code,
      parsedError.message,
      parsedError.isApiKeyError,
      parsedError.isLeakedKey
    );
  }
};

export const chatWithVideoContext = async (
  history: { role: 'user' | 'model'; text: string }[],
  newMessage: string,
  videoContext: string,
  apiKey: string
): Promise<string> => {
  try {
    const ai = getAiClient(apiKey);
    const systemInstruction = `
    Bạn là trợ lý KeyT. Bạn đang thảo luận về video sau:
    ---
    ${videoContext}
    ---
    Trả lời thật hữu ích, thân thiện, nếu câu hỏi nằm ngoài phạm vi hãy ghi rõ.
  `;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
      history: history.map((entry) => ({
        role: entry.role,
        parts: [{ text: entry.text }],
      })),
    });

    const result = await chat.sendMessage({
      message: newMessage,
    });

    return result.text || 'Xin lỗi, tôi không thể trả lời câu hỏi đó lúc này.';
  } catch (error: any) {
    // Parse Google API error
    const parsedError = parseGoogleApiError(error);
    
    // Clear cache if API key is invalid
    if (parsedError.isApiKeyError) {
      clearApiClientCache(apiKey);
    }
    
    // Throw custom error with parsed information
    throw new GeminiApiError(
      parsedError.code,
      parsedError.message,
      parsedError.isApiKeyError,
      parsedError.isLeakedKey
    );
  }
};

