import { AI_IMAGE_MODELS, OPENAI_API_URL } from '../../constants';
import { AiProviderError } from '../../types';
import type {
  CompleteTextOptions,
  DescribeImageOptions,
  EditImageOptions,
  EditImageResult,
  ProviderAdapter,
} from '../../types';
import { base64ToBlob } from '../imagePrep';

async function normalizeHttpError(res: Response): Promise<AiProviderError> {
  let message = '';
  let type = '';
  try {
    const body = await res.json();
    message = body?.error?.message || '';
    type = body?.error?.type || body?.error?.code || '';
  } catch {
    /* body không phải JSON */
  }

  if (res.status === 401) {
    return new AiProviderError('openai', 'invalid_key', 'OpenAI API Key không hợp lệ. Vui lòng kiểm tra lại tại platform.openai.com.');
  }
  if (res.status === 429 || type.includes('insufficient_quota')) {
    return new AiProviderError('openai', 'quota', 'OpenAI API Key đã hết hạn mức hoặc bị giới hạn tốc độ. Vui lòng thử lại sau hoặc đổi provider.');
  }
  if (type.includes('content_policy') || message.toLowerCase().includes('content policy') || message.toLowerCase().includes('safety')) {
    return new AiProviderError('openai', 'content_policy', 'Ảnh/yêu cầu bị OpenAI từ chối vì chính sách nội dung.');
  }
  return new AiProviderError('openai', 'unknown', message || `Lỗi OpenAI API (HTTP ${res.status}).`);
}

function wrapNetworkError(error: any): AiProviderError {
  if (error instanceof AiProviderError) return error;
  return new AiProviderError('openai', 'network', 'Không kết nối được tới OpenAI. Kiểm tra mạng và thử lại.');
}

async function chatCompletion(apiKey: string, messages: any[], json?: boolean): Promise<string> {
  const key = apiKey.trim();
  if (!key) throw new AiProviderError('openai', 'invalid_key', 'Vui lòng nhập OpenAI API Key trước khi sử dụng.');

  let res: Response;
  try {
    res = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: AI_IMAGE_MODELS.openai.vision,
        messages,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
  } catch (error) {
    throw wrapNetworkError(error);
  }

  if (!res.ok) throw await normalizeHttpError(res);

  const body = await res.json();
  const text: string | undefined = body?.choices?.[0]?.message?.content;
  if (!text) throw new AiProviderError('openai', 'bad_response', 'OpenAI không trả về nội dung.');
  return text;
}

export const openaiProvider: ProviderAdapter = {
  async describeImage({ apiKey, imageBase64, mimeType, prompt, json }: DescribeImageOptions): Promise<string> {
    return chatCompletion(
      apiKey,
      [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
            { type: 'text', text: prompt },
          ],
        },
      ],
      json
    );
  },

  async completeText({ apiKey, prompt, json }: CompleteTextOptions): Promise<string> {
    return chatCompletion(apiKey, [{ role: 'user', content: prompt }], json);
  },

  async editImage({ apiKey, imageBase64, mimeType, instruction }: EditImageOptions): Promise<EditImageResult> {
    const key = apiKey.trim();
    if (!key) throw new AiProviderError('openai', 'invalid_key', 'Vui lòng nhập OpenAI API Key trước khi sử dụng.');

    const form = new FormData();
    form.append('model', AI_IMAGE_MODELS.openai.image);
    form.append('image', base64ToBlob(imageBase64, mimeType), 'input.jpg');
    form.append('prompt', instruction);
    form.append('background', 'transparent');
    form.append('output_format', 'png');

    let res: Response;
    try {
      res = await fetch(`${OPENAI_API_URL}/images/edits`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: form,
      });
    } catch (error) {
      throw wrapNetworkError(error);
    }

    if (!res.ok) throw await normalizeHttpError(res);

    const body = await res.json();
    const b64: string | undefined = body?.data?.[0]?.b64_json;
    if (!b64) throw new AiProviderError('openai', 'bad_response', 'OpenAI không trả về ảnh kết quả.');
    return { imageBase64: b64, mimeType: 'image/png', hasAlpha: true };
  },
};
