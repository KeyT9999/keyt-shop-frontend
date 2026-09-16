import { ACCEPTED_IMAGE_TYPES, LLM_IMAGE_MAX_DIM, MAX_FILE_SIZE_MB } from '../constants';
import type { PreparedImage } from '../types';

/** Kiểm tra file đầu vào, throw Error với thông báo tiếng Việt nếu không hợp lệ */
export function assertValidImageFile(file: File): void {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`Ảnh vượt quá giới hạn ${MAX_FILE_SIZE_MB}MB. Vui lòng chọn ảnh nhỏ hơn.`);
  }
  // Một số trình duyệt trả type rỗng cho HEIC — cho qua, canvas sẽ báo lỗi sau nếu không decode được
  if (file.type && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Định dạng ảnh không được hỗ trợ. Vui lòng dùng JPEG, PNG, WebP hoặc HEIC.');
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('Không đọc được ảnh này trên trình duyệt của bạn (HEIC chỉ hỗ trợ trên Safari). Hãy thử JPEG/PNG.'));
    img.src = src;
  });
}

/**
 * Chuẩn bị ảnh gửi lên LLM: downscale cạnh dài <= maxDim, encode JPEG q80, trả base64.
 * Cùng cách canvas-downscale như utils/photoframe/imageOptimization.js nhưng trả base64 thay vì objectURL.
 */
export async function prepareImageForAi(file: File | Blob, maxDim: number = LLM_IMAGE_MAX_DIM): Promise<PreparedImage> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);

    let { width, height } = img;
    const longEdge = Math.max(width, height);
    if (longEdge > maxDim) {
      const ratio = maxDim / longEdge;
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Trình duyệt không hỗ trợ canvas.');
    ctx.drawImage(img, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    canvas.width = 0;
    canvas.height = 0;

    const base64 = dataUrl.split(',')[1];
    if (!base64) throw new Error('Không chuyển đổi được ảnh.');

    return { base64, mimeType: 'image/jpeg', width, height, dataUrl };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** dataURL -> Blob (dùng cho download / images/edits multipart) */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(',');
  const mime = head.match(/data:(.*?);/)?.[1] || 'image/png';
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  return dataUrlToBlob(`data:${mimeType};base64,${base64}`);
}

/** Kiểm tra ảnh (blob) có pixel trong suốt không — dùng để gắn cờ kết quả xóa nền */
export async function blobHasAlpha(blob: Blob): Promise<boolean> {
  if (blob.type !== 'image/png' && blob.type !== 'image/webp') return false;
  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = await loadImage(objectUrl);
    const size = 64; // sample nhỏ là đủ để phát hiện alpha
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) return true;
    }
    return false;
  } catch {
    return false;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
