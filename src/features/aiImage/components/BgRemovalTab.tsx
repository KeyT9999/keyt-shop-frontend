import { useEffect, useRef, useState } from 'react';
import { Download, Loader2, Scissors, Sparkles } from 'lucide-react';
import { removeBackgroundAi } from '../services/bgRemovalAi';
import { removeBackgroundLocal } from '../services/bgRemovalLocal';
import { getCapabilities } from '../services/providerRegistry';
import { PROVIDER_LABELS } from '../constants';
import type { AiProvider, PreparedImage } from '../types';
import ErrorNotice from './ErrorNotice';

type Engine = 'local' | 'ai';

// Nền caro để thấy vùng trong suốt
const CHECKERBOARD: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg,#d5d5d5 25%,transparent 25%),linear-gradient(-45deg,#d5d5d5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d5d5d5 75%),linear-gradient(-45deg,transparent 75%,#d5d5d5 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
  backgroundColor: '#f8f8f8',
};

interface Props {
  provider: AiProvider;
  apiKey: string | null;
  image: PreparedImage | null;
  file: File | null;
  onRequestKey: () => void;
}

export default function BgRemovalTab({ provider, apiKey, image, file, onRequestKey }: Props) {
  const [engine, setEngine] = useState<Engine>('local');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const aiSupported = getCapabilities(provider).imageEdit;

  // Thu hồi objectURL khi thay kết quả / unmount
  useEffect(() => {
    resultUrlRef.current = resultUrl;
    return () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, [resultUrl]);

  const run = async () => {
    if (!file || !image) return;
    if (engine === 'ai' && !apiKey) {
      onRequestKey();
      return;
    }
    setLoading(true);
    setError(null);
    setNote(null);
    setProgress(null);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }

    try {
      let blob: Blob;
      if (engine === 'local') {
        blob = await removeBackgroundLocal(file, (p) => {
          setProgress(p.stage === 'download' ? `Đang tải model AI về trình duyệt... ${p.percent}%` : `Đang xử lý... ${p.percent}%`);
        });
      } else {
        const result = await removeBackgroundAi({ provider, apiKey: apiKey!, image });
        blob = result.blob;
        if (result.note) setNote(result.note);
      }
      setResultUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      const err = e instanceof Error ? e : new Error(String(e));
      if (engine === 'ai') {
        setNote('Mẹo: engine "Local" chạy miễn phí ngay trên trình duyệt, không cần API key.');
      }
      setError(err);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    const base = file?.name ? file.name.replace(/\.[^/.]+$/, '') : 'photo';
    a.download = `${base}-no-bg.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Engine xử lý</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEngine('local')}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
              engine === 'local' ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <Scissors size={14} /> Local (miễn phí)
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-400">Chạy trên trình duyệt, không cần key, riêng tư 100%</span>
          </button>
          <button
            onClick={() => aiSupported && setEngine('ai')}
            disabled={!aiSupported}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
              engine === 'ai' ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600'
            }`}
            title={aiSupported ? undefined : `${PROVIDER_LABELS[provider]} không hỗ trợ sửa ảnh`}
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <Sparkles size={14} /> AI ({PROVIDER_LABELS[provider]})
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-400">
              {aiSupported ? 'Dùng API key, xử lý case khó (tóc, viền phức tạp)' : 'Provider này không hỗ trợ — dùng Local'}
            </span>
          </button>
        </div>
      </div>

      <button
        onClick={run}
        disabled={!file || loading}
        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Scissors size={16} />}
        {loading ? progress || 'Đang xử lý...' : 'Xóa nền'}
      </button>

      {!file && <p className="text-xs text-slate-500">Hãy chọn một ảnh ở khung bên trái trước.</p>}
      {engine === 'local' && !resultUrl && !loading && (
        <p className="text-xs text-slate-400">Lần đầu chạy sẽ tải model AI (~vài chục MB) về trình duyệt — các lần sau chạy ngay.</p>
      )}

      <ErrorNotice error={error} onOpenKeys={onRequestKey} onRetry={run} />
      {note && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{note}</div>}

      {resultUrl && image && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Trước</p>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <img src={image.dataUrl} alt="Ảnh gốc" className="mx-auto max-h-72 w-auto object-contain" />
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Sau</p>
              <div className="overflow-hidden rounded-lg border border-slate-200" style={CHECKERBOARD}>
                <img src={resultUrl} alt="Ảnh đã xóa nền" className="mx-auto max-h-72 w-auto object-contain" />
              </div>
            </div>
          </div>
          <button
            onClick={download}
            className="inline-flex items-center gap-2 rounded-lg border border-orange-600 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            <Download size={16} /> Tải PNG
          </button>
        </div>
      )}
    </div>
  );
}
