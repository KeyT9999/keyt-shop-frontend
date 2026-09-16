import { buildFrameSuggestPrompt } from '../prompts';
import type { AiProvider, FrameSuggestion, FrameTemplateName, PreparedImage } from '../types';
import { parseJsonResponse } from './captionService';
import { getAdapter } from './providerRegistry';

const VALID_TEMPLATES: FrameTemplateName[] = [
  'iphone_style',
  'blur_style',
  'live_view_style',
  'film_style',
  'glass_style',
];

// Range phải khớp với slider trong PhotoFramePage
const clamp = (v: any, min: number, max: number, fallback: number): number => {
  const n = Number(v);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

/** Đề xuất an toàn khi model trả sai schema sau khi retry */
const FALLBACK_SUGGESTION: FrameSuggestion = {
  template: 'blur_style',
  framePadding: 6,
  blurRadius: 17,
  blurBrightness: 100,
  shadowOpacity: 55,
  reason: 'AI không trả về đề xuất hợp lệ nên hệ thống chọn kiểu Cinematic Blur mặc định — kiểu an toàn cho đa số ảnh.',
  fallback: true,
};

function validateSuggestion(parsed: any): FrameSuggestion | null {
  if (!parsed || !VALID_TEMPLATES.includes(parsed.template)) return null;

  const suggestion: FrameSuggestion = {
    template: parsed.template,
    framePadding: clamp(parsed.framePadding, 0, 20, 6),
    reason: typeof parsed.reason === 'string' && parsed.reason.trim() ? parsed.reason.trim() : 'AI đề xuất template này cho ảnh của bạn.',
  };

  if (parsed.template === 'blur_style') {
    suggestion.blurRadius = clamp(parsed.blurRadius, 0, 100, 17);
    suggestion.blurBrightness = clamp(parsed.blurBrightness, 10, 150, 100);
    suggestion.shadowOpacity = clamp(parsed.shadowOpacity, 0, 100, 55);
  }
  if (parsed.template === 'live_view_style') {
    suggestion.focusX = clamp(parsed.focusX, 10, 90, 50);
    suggestion.focusY = clamp(parsed.focusY, 10, 90, 50);
  }
  return suggestion;
}

function summarizeExif(exif: Record<string, any> | null): string | null {
  if (!exif) return null;
  const parts: string[] = [];
  if (exif.make || exif.model) parts.push(`máy: ${[exif.make, exif.model].filter(Boolean).join(' ')}`);
  if (exif.focalLength) parts.push(`tiêu cự: ${exif.focalLength}mm`);
  if (exif.fNumber) parts.push(`khẩu: f/${exif.fNumber}`);
  if (exif.iso) parts.push(`ISO ${exif.iso}`);
  if (exif.exposureTime) parts.push(`tốc: ${exif.exposureTime}s`);
  return parts.length ? parts.join(', ') : null;
}

/**
 * Gợi ý khung: gửi ảnh + EXIF, validate JSON; sai schema → retry 1 lần → fallback.
 */
export async function suggestFrame(opts: {
  provider: AiProvider;
  apiKey: string;
  image: PreparedImage;
  exif: Record<string, any> | null;
}): Promise<FrameSuggestion> {
  const adapter = getAdapter(opts.provider);
  const prompt = buildFrameSuggestPrompt(summarizeExif(opts.exif));

  const attempt = async (): Promise<FrameSuggestion | null> => {
    const raw = await adapter.describeImage({
      apiKey: opts.apiKey,
      imageBase64: opts.image.base64,
      mimeType: opts.image.mimeType,
      prompt,
      json: true,
    });
    try {
      return validateSuggestion(parseJsonResponse(opts.provider, raw));
    } catch {
      return null; // JSON hỏng — để retry xử lý
    }
  };

  const first = await attempt();
  if (first) return first;

  const second = await attempt();
  if (second) return second;

  return FALLBACK_SUGGESTION;
}
