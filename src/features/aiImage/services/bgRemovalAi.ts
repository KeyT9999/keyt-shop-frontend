import { BG_REMOVAL_INSTRUCTION } from '../prompts';
import { AiProviderError } from '../types';
import type { AiProvider, PreparedImage } from '../types';
import { base64ToBlob, blobHasAlpha } from './imagePrep';
import { getAdapter, getCapabilities } from './providerRegistry';

export interface BgRemovalAiResult {
  blob: Blob;
  hasAlpha: boolean;
  note?: string;
}

/** Xóa nền qua API sửa ảnh của provider (Gemini image / OpenAI gpt-image-1) */
export async function removeBackgroundAi(opts: {
  provider: AiProvider;
  apiKey: string;
  image: PreparedImage;
}): Promise<BgRemovalAiResult> {
  const adapter = getAdapter(opts.provider);
  if (!getCapabilities(opts.provider).imageEdit || !adapter.editImage) {
    throw new AiProviderError(opts.provider, 'capability', 'Provider này không hỗ trợ xóa nền bằng AI. Hãy dùng engine Local.');
  }

  const result = await adapter.editImage({
    apiKey: opts.apiKey,
    imageBase64: opts.image.base64,
    mimeType: opts.image.mimeType,
    instruction: BG_REMOVAL_INSTRUCTION,
  });

  const blob = base64ToBlob(result.imageBase64, result.mimeType);
  // Kiểm tra thực tế kênh alpha thay vì tin lời provider
  const hasAlpha = result.hasAlpha || (await blobHasAlpha(blob));

  return {
    blob,
    hasAlpha,
    note: hasAlpha ? undefined : result.note || 'Kết quả có thể là nền trắng (không trong suốt). Dùng engine Local nếu bạn cần PNG alpha.',
  };
}
