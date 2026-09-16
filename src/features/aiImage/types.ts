// ==== AI Image Studio — shared types ====

export type AiProvider = 'gemini' | 'openai' | 'deepseek';

export type AiErrorKind =
  | 'invalid_key'
  | 'quota'
  | 'network'
  | 'content_policy'
  | 'bad_response'
  | 'capability'
  | 'unknown';

export class AiProviderError extends Error {
  provider: AiProvider;
  kind: AiErrorKind;

  constructor(provider: AiProvider, kind: AiErrorKind, message: string) {
    super(message);
    this.name = 'AiProviderError';
    this.provider = provider;
    this.kind = kind;
  }
}

export interface ProviderCapabilities {
  /** Caption ảnh + gợi ý khung (cần model nhận ảnh) */
  vision: boolean;
  /** Xóa nền bằng AI (model sửa/sinh ảnh) */
  imageEdit: boolean;
  /** Viết lại / dịch caption (text thuần) */
  text: boolean;
}

export interface DescribeImageOptions {
  apiKey: string;
  /** base64 KHÔNG kèm prefix data: */
  imageBase64: string;
  mimeType: string;
  prompt: string;
  /** Yêu cầu model trả về JSON thuần (schema mô tả trong prompt) */
  json?: boolean;
}

export interface CompleteTextOptions {
  apiKey: string;
  prompt: string;
  json?: boolean;
}

export interface EditImageOptions {
  apiKey: string;
  imageBase64: string;
  mimeType: string;
  instruction: string;
}

export interface EditImageResult {
  /** base64 không kèm prefix */
  imageBase64: string;
  mimeType: string;
  /** true nếu chắc chắn có kênh alpha (PNG trong suốt) */
  hasAlpha: boolean;
  note?: string;
}

export interface ProviderAdapter {
  describeImage(opts: DescribeImageOptions): Promise<string>;
  completeText(opts: CompleteTextOptions): Promise<string>;
  editImage?(opts: EditImageOptions): Promise<EditImageResult>;
}

// ==== Caption ====

export type CaptionTone = 'natural' | 'funny' | 'poetic' | 'sales' | 'professional';
export type CaptionLanguage = 'vi' | 'en' | 'both';

export interface CaptionOutput {
  description: string;
  captions: string[];
  hashtags: string[];
  altText: string;
}

// ==== Frame Suggestion ====

export type FrameTemplateName =
  | 'iphone_style'
  | 'blur_style'
  | 'live_view_style'
  | 'film_style'
  | 'glass_style';

export interface FrameSuggestion {
  template: FrameTemplateName;
  framePadding: number;
  blurRadius?: number;
  blurBrightness?: number;
  shadowOpacity?: number;
  focusX?: number;
  focusY?: number;
  reason: string;
  /** true nếu đây là đề xuất fallback do model trả sai schema */
  fallback?: boolean;
}

/** Object ghi vào sessionStorage để PhotoFramePage tự áp dụng (one-shot) */
export interface FramePreset {
  template: FrameTemplateName;
  params: {
    framePadding?: number;
    blurRadius?: number;
    blurBrightness?: number;
    shadowOpacity?: number;
    focusX?: number;
    focusY?: number;
  };
  /** dataURL ảnh gốc — chỉ đính kèm khi đủ nhỏ (tránh vượt quota sessionStorage) */
  imageDataUrl?: string;
}

// ==== Image prep ====

export interface PreparedImage {
  /** base64 không kèm prefix, đã downscale */
  base64: string;
  mimeType: string;
  width: number;
  height: number;
  /** dataURL đầy đủ để preview */
  dataUrl: string;
}

// ==== Metadata check (phase 2) ====

export interface AiMetadataFinding {
  /** loại metadata: 'c2pa' | 'exif-marker' | 'xmp-marker' | 'png-text' */
  kind: string;
  /** mô tả tiếng Việt hiển thị cho người dùng */
  label: string;
  /** chuỗi/marker khớp được */
  detail?: string;
}
