import { GoogleGenAI } from '@google/genai';
import { SummaryStyle } from '../types';
import type { SummaryResult } from '../types';

let aiClientCache: { [key: string]: GoogleGenAI } = {};

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
};

export const chatWithVideoContext = async (
  history: { role: 'user' | 'model'; text: string }[],
  newMessage: string,
  videoContext: string,
  apiKey: string
): Promise<string> => {
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
};

