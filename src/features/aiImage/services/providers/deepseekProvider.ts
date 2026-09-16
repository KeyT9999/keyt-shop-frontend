import { AI_IMAGE_MODELS, DEEPSEEK_API_URL } from '../../constants';
import { AiProviderError } from '../../types';
import type { CompleteTextOptions, DescribeImageOptions, ProviderAdapter } from '../../types';

const NO_VISION_MSG =
  'DeepSeek API hiện chưa hỗ trợ nhận ảnh (vision). Hãy chuyển sang Gemini hoặc OpenAI cho tác vụ này.';

export const deepseekProvider: ProviderAdapter = {
  async describeImage(_opts: DescribeImageOptions): Promise<string> {
    throw new AiProviderError('deepseek', 'capability', NO_VISION_MSG);
  },

  async completeText({ apiKey, prompt, json }: CompleteTextOptions): Promise<string> {
    const key = apiKey.trim();
    if (!key) throw new AiProviderError('deepseek', 'invalid_key', 'Vui lòng nhập DeepSeek API Key trước khi sử dụng.');

    let res: Response;
    try {
      res = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: AI_IMAGE_MODELS.deepseek.text,
          messages: [{ role: 'user', content: prompt }],
          ...(json ? { response_format: { type: 'json_object' } } : {}),
        }),
      });
    } catch {
      // fetch fail: có thể do mạng HOẶC DeepSeek chặn CORS từ trình duyệt
      throw new AiProviderError(
        'deepseek',
        'network',
        'Không kết nối được tới DeepSeek từ trình duyệt (mạng hoặc CORS). Vui lòng thử lại hoặc dùng provider khác.'
      );
    }

    if (!res.ok) {
      let message = '';
      try {
        const body = await res.json();
        message = body?.error?.message || '';
      } catch {
        /* ignore */
      }
      if (res.status === 401) {
        throw new AiProviderError('deepseek', 'invalid_key', 'DeepSeek API Key không hợp lệ. Vui lòng kiểm tra lại tại platform.deepseek.com.');
      }
      if (res.status === 402 || res.status === 429) {
        throw new AiProviderError('deepseek', 'quota', 'DeepSeek API Key hết số dư hoặc bị giới hạn tốc độ. Vui lòng nạp thêm hoặc thử lại sau.');
      }
      throw new AiProviderError('deepseek', 'unknown', message || `Lỗi DeepSeek API (HTTP ${res.status}).`);
    }

    const body = await res.json();
    const text: string | undefined = body?.choices?.[0]?.message?.content;
    if (!text) throw new AiProviderError('deepseek', 'bad_response', 'DeepSeek không trả về nội dung.');
    return text;
  },

  // editImage: không hỗ trợ — cố tình không implement (capability matrix chặn từ UI)
};
