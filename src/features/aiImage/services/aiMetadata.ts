/**
 * Kiểm tra & xóa metadata AI trong ảnh — chạy 100% client-side.
 * Port concept từ remove-ai-watermarks (noai/c2pa.py, noai/constants.py):
 * - PNG: duyệt chunk, tìm chunk C2PA "caBX" + text chunk (tEXt/iTXt/zTXt) chứa key/keyword AI
 * - JPEG: quét APP1 (EXIF/XMP) tìm keyword AI + chữ ký C2PA/JUMBF
 * Giới hạn (ghi rõ trong UI): chỉ xử lý metadata hiển nhiên, KHÔNG xóa được watermark
 * vô hình (SynthID) — phần đó thuộc CLI remove-ai-watermarks chạy local.
 */
import type { AiMetadataFinding } from '../types';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

// Từ noai/constants.py
const AI_METADATA_KEYS = [
  'parameters', 'postprocessing', 'extras', 'workflow', 'prompt', 'dream',
  'sd:mode', 'stablediffusionversion', 'generation_time', 'model', 'model hash', 'seed',
];

const AI_KEYWORDS = [
  'prompt', 'negative_prompt', 'sampler', 'cfg_scale', 'lora', 'diffusion', 'comfy',
  'midjourney', 'dall-e', 'dalle', 'imagen', 'firefly', 'c2pa', 'chatgpt', 'gpt-4',
  'sora', 'openai', 'truepic', 'stable_diffusion', 'invokeai', 'made with google ai',
];

const C2PA_TEXT_SIGNATURES = ['c2pa', 'jumb', 'jumd', 'jumbf', 'contentcreds'];

function bytesToLatin1(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
  return out;
}

function isPng(bytes: Uint8Array): boolean {
  return PNG_SIGNATURE.every((b, i) => bytes[i] === b);
}

function isJpeg(bytes: Uint8Array): boolean {
  return bytes[0] === 0xff && bytes[1] === 0xd8;
}

/** Duyệt chunk PNG: length(4) type(4) data(length) crc(4) — như noai/c2pa.py */
function scanPngChunks(bytes: Uint8Array): AiMetadataFinding[] {
  const findings: AiMetadataFinding[] = [];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8;

  while (offset + 8 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = bytesToLatin1(bytes.slice(offset + 4, offset + 8));
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > bytes.length) break;

    if (type === 'caBX') {
      findings.push({
        kind: 'c2pa',
        label: 'Chunk C2PA (caBX) — chứng chỉ nguồn gốc nội dung, thường do Google Imagen / Adobe Firefly / OpenAI nhúng',
        detail: `chunk caBX, ${length} bytes`,
      });
    }

    if (type === 'tEXt' || type === 'iTXt' || type === 'zTXt') {
      const data = bytes.slice(dataStart, Math.min(dataEnd, dataStart + 2048));
      const text = bytesToLatin1(data).toLowerCase();
      const keyEnd = text.indexOf('\0');
      const key = keyEnd > 0 ? text.slice(0, keyEnd) : '';

      if (AI_METADATA_KEYS.includes(key)) {
        findings.push({
          kind: 'png-text',
          label: `Text chunk "${key}" — metadata đặc trưng của công cụ AI (Stable Diffusion / ComfyUI...)`,
          detail: `${type}:${key}`,
        });
      } else {
        const matched = AI_KEYWORDS.find((kw) => text.includes(kw));
        if (matched) {
          findings.push({
            kind: 'png-text',
            label: `Text chunk chứa từ khóa AI "${matched}"`,
            detail: `${type}:${key || '(không key)'}`,
          });
        }
      }
    }

    offset = dataEnd + 4; // bỏ qua CRC
    if (type === 'IEND') break;
  }
  return findings;
}

/** Quét các segment APPn của JPEG tìm EXIF/XMP chứa dấu hiệu AI */
function scanJpegSegments(bytes: Uint8Array): AiMetadataFinding[] {
  const findings: AiMetadataFinding[] = [];
  let offset = 2;

  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    if (marker === 0xda) break; // SOS — bắt đầu dữ liệu ảnh
    const size = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const segStart = offset + 4;
    const segEnd = offset + 2 + size;

    // APP1 (EXIF/XMP), APP11 (JUMBF/C2PA), APP13 (IPTC)
    if (marker >= 0xe1 && marker <= 0xef) {
      const seg = bytes.slice(segStart, Math.min(segEnd, segStart + 65536));
      const text = bytesToLatin1(seg).toLowerCase();

      const c2paSig = C2PA_TEXT_SIGNATURES.find((sig) => text.includes(sig));
      if (c2paSig) {
        findings.push({
          kind: 'c2pa',
          label: 'Segment chứa chữ ký C2PA/JUMBF — chứng chỉ nguồn gốc nội dung AI',
          detail: `APP${marker - 0xe0}, khớp "${c2paSig}"`,
        });
      } else {
        const matched = AI_KEYWORDS.find((kw) => text.includes(kw));
        if (matched) {
          findings.push({
            kind: text.includes('xmp') || text.includes('x:xmpmeta') ? 'xmp-marker' : 'exif-marker',
            label: `Metadata chứa từ khóa AI "${matched}"`,
            detail: `APP${marker - 0xe0}`,
          });
        }
      }
    }

    offset = segEnd;
  }
  return findings;
}

/** Phát hiện metadata AI trong file ảnh (PNG/JPEG; format khác trả mảng rỗng) */
export async function detectAiMetadata(file: File | Blob): Promise<AiMetadataFinding[]> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  if (bytes.length < 12) return [];

  if (isPng(bytes)) return scanPngChunks(bytes);
  if (isJpeg(bytes)) return scanJpegSegments(bytes);
  return [];
}

/**
 * Xóa toàn bộ metadata bằng cách re-encode qua canvas (mất mọi chunk phụ/EXIF/XMP).
 * Pixel giữ nguyên kích thước; PNG giữ nguyên lossless, JPEG re-encode q92.
 */
export async function stripMetadata(file: File | Blob): Promise<{ blob: Blob; format: 'png' | 'jpeg' }> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const outputFormat: 'png' | 'jpeg' = isPng(bytes) ? 'png' : 'jpeg';

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Không đọc được ảnh để xóa metadata.'));
      el.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Trình duyệt không hỗ trợ canvas.');
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Không tạo được ảnh sạch metadata.'))),
        outputFormat === 'png' ? 'image/png' : 'image/jpeg',
        outputFormat === 'png' ? undefined : 0.92
      );
    });
    canvas.width = 0;
    canvas.height = 0;
    return { blob, format: outputFormat };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
