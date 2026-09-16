import { AlertTriangle, KeyRound, RotateCcw } from 'lucide-react';
import { AiProviderError } from '../types';

interface Props {
  error: Error | null;
  onOpenKeys?: () => void;
  onRetry?: () => void;
}

/** Banner lỗi chung: map AiProviderError.kind sang hành động phù hợp */
export default function ErrorNotice({ error, onOpenKeys, onRetry }: Props) {
  if (!error) return null;

  const kind = error instanceof AiProviderError ? error.kind : 'unknown';
  const showKeyButton = kind === 'invalid_key' && onOpenKeys;
  const showRetry = (kind === 'network' || kind === 'bad_response' || kind === 'unknown' || kind === 'quota') && onRetry;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <div className="flex items-start gap-2">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <span>{error.message}</span>
      </div>
      {(showKeyButton || showRetry) && (
        <div className="flex gap-2 pl-6">
          {showKeyButton && (
            <button
              onClick={onOpenKeys}
              className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              <KeyRound size={14} /> Nhập lại API Key
            </button>
          )}
          {showRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              <RotateCcw size={14} /> Thử lại
            </button>
          )}
        </div>
      )}
    </div>
  );
}
