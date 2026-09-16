/**
 * Engine xóa nền chạy hoàn toàn trong trình duyệt (WASM/ONNX qua @imgly/background-removal).
 * Dynamic import để model + wasm không nằm trong bundle chính; model tải lần đầu (~vài chục MB)
 * rồi được trình duyệt cache.
 */

export interface LocalRemovalProgress {
  /** 0-100, ước lượng tiến trình tải model/xử lý */
  percent: number;
  stage: 'download' | 'process';
}

export async function removeBackgroundLocal(
  input: File | Blob,
  onProgress?: (p: LocalRemovalProgress) => void
): Promise<Blob> {
  const { removeBackground } = await import('@imgly/background-removal');

  const blob = await removeBackground(input, {
    output: { format: 'image/png' },
    progress: (key: string, current: number, total: number) => {
      if (!onProgress || !total) return;
      const percent = Math.round((current / total) * 100);
      onProgress({ percent, stage: key.startsWith('fetch') ? 'download' : 'process' });
    },
  });
  return blob;
}
