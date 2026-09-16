import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { LANGUAGE_LABELS, TONE_LABELS } from '../prompts';
import { generateCaption, rewriteCaption } from '../services/captionService';
import { getCapabilities } from '../services/providerRegistry';
import type { AiProvider, CaptionLanguage, CaptionOutput, CaptionTone, PreparedImage } from '../types';
import CaptionResult from './CaptionResult';
import ErrorNotice from './ErrorNotice';

const TONES = Object.keys(TONE_LABELS) as CaptionTone[];
const LANGUAGES = Object.keys(LANGUAGE_LABELS) as CaptionLanguage[];

interface Props {
  provider: AiProvider;
  apiKey: string | null;
  image: PreparedImage | null;
  onRequestKey: () => void;
}

export default function CaptionTab({ provider, apiKey, image, onRequestKey }: Props) {
  const [tone, setTone] = useState<CaptionTone>('natural');
  const [language, setLanguage] = useState<CaptionLanguage>('vi');
  const [rewriteInput, setRewriteInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<CaptionOutput | null>(null);

  const hasVision = getCapabilities(provider).vision;
  // DeepSeek (không vision): chuyển sang chế độ viết lại caption từ text
  const rewriteMode = !hasVision;

  const canRun = !!apiKey && !loading && (rewriteMode ? rewriteInput.trim().length > 0 : !!image);

  const run = async () => {
    if (!apiKey) {
      onRequestKey();
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const output = rewriteMode
        ? await rewriteCaption({ provider, apiKey, originalCaption: rewriteInput.trim(), tone, language })
        : await generateCaption({ provider, apiKey, image: image!, tone, language });
      setResult(output);
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {rewriteMode && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          DeepSeek chưa hỗ trợ nhận ảnh, nên ở chế độ này AI sẽ <b>viết lại caption có sẵn</b> (đổi tone, dịch, thêm
          hashtag). Muốn AI tự nhìn ảnh viết caption, hãy chuyển sang Gemini hoặc OpenAI.
        </div>
      )}

      {rewriteMode && (
        <textarea
          value={rewriteInput}
          onChange={(e) => setRewriteInput(e.target.value)}
          placeholder="Dán caption gốc của bạn vào đây để AI viết lại..."
          rows={3}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-orange-500 focus:outline-none"
        />
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Phong cách</p>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  tone === t ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300 text-slate-600 hover:border-orange-400'
                }`}
              >
                {TONE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Ngôn ngữ</p>
          <div className="flex gap-1.5">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  language === l ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300 text-slate-600 hover:border-orange-400'
                }`}
              >
                {LANGUAGE_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={run}
        disabled={!canRun}
        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {loading ? 'AI đang viết...' : rewriteMode ? 'Viết lại caption' : 'Tạo caption từ ảnh'}
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
      {!rewriteMode && !image && <p className="text-xs text-slate-500">Hãy chọn một ảnh ở khung bên trái trước.</p>}

      <ErrorNotice error={error} onOpenKeys={onRequestKey} onRetry={run} />
      {result && <CaptionResult result={result} />}
    </div>
  );
}
