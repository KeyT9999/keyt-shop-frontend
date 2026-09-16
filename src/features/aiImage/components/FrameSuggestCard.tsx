import { ArrowRight, Info } from 'lucide-react';
import type { FrameSuggestion, FrameTemplateName } from '../types';

// Label khớp với templates trong components/PhotoFrame/templates/*
const TEMPLATE_LABELS: Record<FrameTemplateName, string> = {
  iphone_style: 'Apple Minimal',
  blur_style: 'Cinematic Blur',
  live_view_style: 'Live View',
  film_style: 'Film Strip',
  glass_style: 'Glass',
};

interface Props {
  suggestion: FrameSuggestion;
  applying: boolean;
  onApply: () => void;
}

export default function FrameSuggestCard({ suggestion, applying, onApply }: Props) {
  const params: { label: string; value: string }[] = [
    { label: 'Lề khung', value: `${suggestion.framePadding}%` },
  ];
  if (suggestion.blurRadius !== undefined) params.push({ label: 'Độ mờ nền', value: `${suggestion.blurRadius}px` });
  if (suggestion.blurBrightness !== undefined) params.push({ label: 'Độ sáng nền', value: `${suggestion.blurBrightness}%` });
  if (suggestion.shadowOpacity !== undefined) params.push({ label: 'Đổ bóng', value: `${suggestion.shadowOpacity}%` });
  if (suggestion.focusX !== undefined) params.push({ label: 'Điểm nét X', value: `${suggestion.focusX}%` });
  if (suggestion.focusY !== undefined) params.push({ label: 'Điểm nét Y', value: `${suggestion.focusY}%` });

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">Template khuyến nghị</p>
          <p className="text-lg font-bold text-slate-800">{TEMPLATE_LABELS[suggestion.template]}</p>
        </div>
        <button
          onClick={onApply}
          disabled={applying}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
        >
          {applying ? 'Đang chuyển...' : 'Áp dụng vào Photo Frame'} <ArrowRight size={15} />
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {params.map((p) => (
          <span key={p.label} className="rounded-md border border-orange-200 bg-white px-2 py-1 text-xs text-slate-600">
            {p.label}: <b>{p.value}</b>
          </span>
        ))}
      </div>

      <div className="flex items-start gap-2 text-sm text-slate-600">
        <Info size={15} className="mt-0.5 shrink-0 text-orange-400" />
        <p>
          {suggestion.reason}
          {suggestion.fallback && <span className="ml-1 text-xs text-amber-600">(đề xuất mặc định do AI trả kết quả không hợp lệ)</span>}
        </p>
      </div>
    </div>
  );
}
