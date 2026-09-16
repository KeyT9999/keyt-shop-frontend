import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { CaptionOutput } from '../types';

function CopyButton({ text, id, copiedId, onCopy }: { text: string; id: string; copiedId: string | null; onCopy: (id: string, text: string) => void }) {
  const copied = copiedId === id;
  return (
    <button
      onClick={() => onCopy(id, text)}
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs transition ${
        copied ? 'border-green-300 bg-green-50 text-green-700' : 'border-slate-300 text-slate-500 hover:bg-slate-50'
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Đã copy' : 'Copy'}
    </button>
  );
}

export default function CaptionResult({ result }: { result: CaptionOutput }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const hashtagText = result.hashtags.join(' ');

  return (
    <div className="space-y-3">
      {result.description && (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Mô tả ảnh</p>
          <p className="text-sm text-slate-700">{result.description}</p>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Caption gợi ý</p>
        {result.captions.map((caption, i) => (
          <div key={i} className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3">
            <p className="whitespace-pre-line text-sm text-slate-700">{caption}</p>
            <CopyButton text={caption} id={`caption-${i}`} copiedId={copiedId} onCopy={handleCopy} />
          </div>
        ))}
      </div>

      {result.hashtags.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hashtags</p>
            <CopyButton text={hashtagText} id="hashtags" copiedId={copiedId} onCopy={handleCopy} />
          </div>
          <p className="text-sm text-blue-600">{hashtagText}</p>
        </div>
      )}

      {result.altText && (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alt text (SEO)</p>
            <CopyButton text={result.altText} id="alt" copiedId={copiedId} onCopy={handleCopy} />
          </div>
          <p className="text-sm text-slate-700">{result.altText}</p>
        </div>
      )}
    </div>
  );
}
