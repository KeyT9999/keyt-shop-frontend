import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Frame, Loader2 } from 'lucide-react';
// @ts-ignore — module JS không có type
import { extractExif } from '../../../utils/photoframe/extractExif';
import { PRESET_IMAGE_MAX_BYTES, PRESET_STORAGE_KEY } from '../constants';
import { suggestFrame } from '../services/frameSuggestService';
import { getCapabilities } from '../services/providerRegistry';
import type { AiProvider, FramePreset, FrameSuggestion, PreparedImage } from '../types';
import ErrorNotice from './ErrorNotice';
import FrameSuggestCard from './FrameSuggestCard';

interface Props {
  provider: AiProvider;
  apiKey: string | null;
  image: PreparedImage | null;
  file: File | null;
  onRequestKey: () => void;
}

function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function FrameSuggestTab({ provider, apiKey, image, file, onRequestKey }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [suggestion, setSuggestion] = useState<FrameSuggestion | null>(null);

  const hasVision = getCapabilities(provider).vision;

  const run = async () => {
    if (!apiKey) {
      onRequestKey();
      return;
    }
    if (!image || !file) return;
    setLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const exif = await extractExif(file).catch(() => null);
      const result = await suggestFrame({ provider, apiKey, image, exif });
      setSuggestion(result);
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  };

  const apply = async () => {
    if (!suggestion || !file) return;
    setApplying(true);
    try {
      const preset: FramePreset = {
        template: suggestion.template,
        params: {
          framePadding: suggestion.framePadding,
          blurRadius: suggestion.blurRadius,
          blurBrightness: suggestion.blurBrightness,
          shadowOpacity: suggestion.shadowOpacity,
          focusX: suggestion.focusX,
          focusY: suggestion.focusY,
        },
      };

      // Đính ảnh gốc nếu đủ nhỏ (quota sessionStorage ~5MB); ảnh lớn: chỉ chuyển preset
      try {
        const dataUrl = await fileToDataUrl(file);
        if (dataUrl.length <= PRESET_IMAGE_MAX_BYTES) preset.imageDataUrl = dataUrl;
      } catch {
        /* không đính được ảnh — vẫn chuyển preset */
      }

      try {
        sessionStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(preset));
      } catch {
        // Quota — thử lại không kèm ảnh
        delete preset.imageDataUrl;
        sessionStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(preset));
      }

      navigate('/photo-frame');
    } finally {
      setApplying(false);
    }
  };

  if (!hasVision) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        DeepSeek chưa hỗ trợ nhận ảnh nên không dùng được tính năng gợi ý khung. Hãy chuyển sang <b>Gemini</b> hoặc{' '}
        <b>OpenAI</b> ở phần chọn provider phía trên.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        AI sẽ nhìn ảnh (kèm EXIF nếu có) và chọn 1 trong 5 kiểu khung của công cụ Photo Frame, kèm thông số phù hợp.
        Bấm áp dụng là chuyển thẳng sang trang Photo Frame với thiết lập sẵn.
      </p>

      <button
        onClick={run}
        disabled={!apiKey || !image || loading}
        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Frame size={16} />}
        {loading ? 'AI đang phân tích ảnh...' : 'Gợi ý khung cho ảnh này'}
      </button>

      {!apiKey && (
        <p className="text-xs text-slate-500">
          Cần API key để dùng tính năng này —{' '}
          <button onClick={onRequestKey} className="font-semibold text-orange-600 hover:underline">
            nhập key tại đây
          </button>
          .
        </p>
      )}
      {!image && <p className="text-xs text-slate-500">Hãy chọn một ảnh ở khung bên trái trước.</p>}

      <ErrorNotice error={error} onOpenKeys={onRequestKey} onRetry={run} />
      {suggestion && <FrameSuggestCard suggestion={suggestion} applying={applying} onApply={apply} />}
    </div>
  );
}
