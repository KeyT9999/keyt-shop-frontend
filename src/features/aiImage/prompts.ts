import type { CaptionLanguage, CaptionTone } from './types';

const TONE_DIRECTIVES: Record<CaptionTone, string> = {
  natural: 'Giọng văn tự nhiên, gần gũi, như người thật chia sẻ khoảnh khắc.',
  funny: 'Giọng văn hài hước, dí dỏm, có thể chơi chữ nhẹ nhàng, phù hợp mạng xã hội.',
  poetic: 'Giọng văn thơ mộng, sâu lắng (deep), giàu hình ảnh, có thể trích dẫn cảm hứng.',
  sales: 'Giọng văn bán hàng thu hút: nêu bật giá trị sản phẩm, tạo cảm giác muốn mua, kèm call-to-action ngắn.',
  professional: 'Giọng văn chuyên nghiệp, chỉn chu, phù hợp thương hiệu hoặc portfolio nhiếp ảnh.',
};

export const TONE_LABELS: Record<CaptionTone, string> = {
  natural: 'Tự nhiên',
  funny: 'Hài hước',
  poetic: 'Thơ / Deep',
  sales: 'Bán hàng',
  professional: 'Chuyên nghiệp',
};

export const LANGUAGE_LABELS: Record<CaptionLanguage, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  both: 'Việt + Anh',
};

function languageDirective(language: CaptionLanguage): string {
  switch (language) {
    case 'vi':
      return 'Viết toàn bộ bằng tiếng Việt.';
    case 'en':
      return 'Write everything in English.';
    case 'both':
      return 'Mỗi caption gồm 2 dòng: dòng 1 tiếng Việt, dòng 2 bản tiếng Anh tương ứng.';
  }
}

const CAPTION_JSON_SPEC = `Trả về DUY NHẤT một JSON object hợp lệ (không markdown, không giải thích thêm) theo đúng cấu trúc:
{
  "description": "mô tả ảnh 1-2 câu",
  "captions": ["caption 1", "caption 2", "caption 3"],
  "hashtags": ["#tag1", "#tag2", "... 5 đến 10 hashtag"],
  "altText": "alt text SEO, tối đa 125 ký tự"
}`;

export function buildCaptionPrompt(tone: CaptionTone, language: CaptionLanguage): string {
  return `Bạn là chuyên gia content mạng xã hội của Tiệm Tạp Hóa KeyT.
Hãy nhìn kỹ bức ảnh và tạo nội dung đăng bài.

Yêu cầu:
- ${TONE_DIRECTIVES[tone]}
- ${languageDirective(language)}
- Hashtag ngắn gọn, liên quan trực tiếp tới nội dung ảnh, không dấu cách.
- altText mô tả khách quan nội dung ảnh cho người khiếm thị / SEO, tối đa 125 ký tự.

${CAPTION_JSON_SPEC}`;
}

/** Dùng cho DeepSeek (text-only): viết lại caption có sẵn thay vì nhìn ảnh */
export function buildRewritePrompt(originalCaption: string, tone: CaptionTone, language: CaptionLanguage): string {
  return `Bạn là chuyên gia content mạng xã hội của Tiệm Tạp Hóa KeyT.
Người dùng đưa cho bạn caption gốc sau:
---
${originalCaption}
---

Nhiệm vụ: viết lại caption này hay hơn và tạo bộ nội dung đăng bài.

Yêu cầu:
- ${TONE_DIRECTIVES[tone]}
- ${languageDirective(language)}
- "description": tóm tắt lại ý chính caption gốc trong 1-2 câu.
- Hashtag suy ra từ nội dung caption.

${CAPTION_JSON_SPEC}`;
}

/** Mô tả 5 template thật của PhotoFrame cho model chọn */
export function buildFrameSuggestPrompt(exifSummary: string | null): string {
  return `Bạn là trợ lý nhiếp ảnh của công cụ Photo Frame (Tiệm Tạp Hóa KeyT).
Nhiệm vụ: nhìn bức ảnh và chọn MỘT template khung phù hợp nhất trong danh sách dưới đây, kèm thông số.

Danh sách template (chỉ được chọn đúng các giá trị này):
1. "iphone_style" — khung trắng tối giản kiểu Apple, hợp ảnh chụp điện thoại, đời thường, tối giản.
2. "blur_style" — nền là chính bức ảnh được phóng to + làm mờ (cinematic), hợp ảnh chân dung, ảnh có màu sắc đẹp, ảnh nghệ thuật.
3. "live_view_style" — mô phỏng màn hình live view máy ảnh với khung lấy nét, hợp ảnh street/đời sống, ảnh có chủ thể rõ.
4. "film_style" — khung phim analog (film strip), hợp ảnh vintage, ảnh màu film, ảnh hoài niệm.
5. "glass_style" — hiệu ứng kính mờ hiện đại, hợp ảnh phong cảnh, kiến trúc, ảnh tối giản sang trọng.

${exifSummary ? `Thông tin EXIF của ảnh: ${exifSummary}` : 'Ảnh không có EXIF.'}

Trả về DUY NHẤT một JSON object hợp lệ theo cấu trúc (bỏ qua field không áp dụng):
{
  "template": "iphone_style | blur_style | live_view_style | film_style | glass_style",
  "framePadding": <số 0-20, % lề khung>,
  "blurRadius": <số 0-100, chỉ khi chọn blur_style>,
  "blurBrightness": <số 10-150, chỉ khi chọn blur_style>,
  "shadowOpacity": <số 0-100, chỉ khi chọn blur_style>,
  "focusX": <số 10-90, chỉ khi chọn live_view_style — vị trí X (%) của chủ thể chính>,
  "focusY": <số 10-90, chỉ khi chọn live_view_style — vị trí Y (%) của chủ thể chính>,
  "reason": "1-2 câu tiếng Việt giải thích vì sao chọn template và thông số này"
}`;
}

export const BG_REMOVAL_INSTRUCTION =
  'Remove the background from this photo completely. Keep only the main subject, perfectly cut out with clean edges. Output the subject on a fully transparent background (alpha channel). Do not add any new elements, text, or shadows.';
