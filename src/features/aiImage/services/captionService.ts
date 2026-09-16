import { buildCaptionPrompt, buildRewritePrompt } from '../prompts';
import { AiProviderError } from '../types';
import type { AiProvider, CaptionLanguage, CaptionOutput, CaptionTone, PreparedImage } from '../types';
import { getAdapter } from './providerRegistry';

/** Gỡ code fence nếu model bọc JSON trong ```json ... ``` rồi parse */
export function parseJsonResponse(provider: AiProvider, raw: string): any {
  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) text = fenceMatch[1].trim();
  // Model đôi khi thêm chữ trước/sau JSON — cắt từ { đầu tới } cuối
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) text = text.slice(start, end + 1);

  try {
    return JSON.parse(text);
  } catch {
    throw new AiProviderError(provider, 'bad_response', 'AI trả về định dạng không hợp lệ. Vui lòng thử lại.');
  }
}

function toCaptionOutput(provider: AiProvider, parsed: any): CaptionOutput {
  const captions = Array.isArray(parsed?.captions) ? parsed.captions.filter((c: any) => typeof c === 'string') : [];
  if (captions.length === 0) {
    throw new AiProviderError(provider, 'bad_response', 'AI không tạo được caption. Vui lòng thử lại.');
  }
  return {
    description: typeof parsed.description === 'string' ? parsed.description : '',
    captions,
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.filter((h: any) => typeof h === 'string') : [],
    altText: typeof parsed.altText === 'string' ? parsed.altText : '',
  };
}

/** Sinh caption từ ảnh (Gemini/OpenAI — provider có vision) */
export async function generateCaption(opts: {
  provider: AiProvider;
  apiKey: string;
  image: PreparedImage;
  tone: CaptionTone;
  language: CaptionLanguage;
}): Promise<CaptionOutput> {
  const adapter = getAdapter(opts.provider);
  const raw = await adapter.describeImage({
    apiKey: opts.apiKey,
    imageBase64: opts.image.base64,
    mimeType: opts.image.mimeType,
    prompt: buildCaptionPrompt(opts.tone, opts.language),
    json: true,
  });
  return toCaptionOutput(opts.provider, parseJsonResponse(opts.provider, raw));
}

/** Viết lại caption có sẵn (mọi provider, kể cả DeepSeek) */
export async function rewriteCaption(opts: {
  provider: AiProvider;
  apiKey: string;
  originalCaption: string;
  tone: CaptionTone;
  language: CaptionLanguage;
}): Promise<CaptionOutput> {
  const adapter = getAdapter(opts.provider);
  const raw = await adapter.completeText({
    apiKey: opts.apiKey,
    prompt: buildRewritePrompt(opts.originalCaption, opts.tone, opts.language),
    json: true,
  });
  return toCaptionOutput(opts.provider, parseJsonResponse(opts.provider, raw));
}
