import { useMemo } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
  Clock,
  Sparkles
} from 'lucide-react';
import type { KanaItem, KanaType } from '../../data/kanaData';

interface KanaResultModalProps {
  isOpen: boolean;
  kanaType: KanaType;
  fontFamily: string;
  allItems: KanaItem[];
  solvedIds: string[];
  missedIds: string[];
  startTime: number;
  endTime: number;
  attemptsMap: Record<string, number>;
  onRetryMissed: () => void;
  onRetryAll: () => void;
  onBackToSetup: () => void;
  onPlaySpeech: (text: string) => void;
}

export default function KanaResultModal({
  isOpen,
  kanaType,
  fontFamily,
  allItems,
  solvedIds,
  missedIds,
  startTime,
  endTime,
  attemptsMap,
  onRetryMissed,
  onRetryAll,
  onBackToSetup,
  onPlaySpeech
}: KanaResultModalProps) {
  if (!isOpen) return null;

  const total = allItems.length;
  const solvedCount = solvedIds.length;
  const missedCount = missedIds.length;
  const accuracy = total > 0 ? Math.round((solvedCount / total) * 100) : 0;

  // Time formatted mm:ss
  const elapsedSeconds = Math.max(1, Math.round((endTime - startTime) / 1000));
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;

  // Item lookups
  const solvedItems = useMemo(
    () => allItems.filter((it) => solvedIds.includes(it.id)),
    [allItems, solvedIds]
  );
  const missedItems = useMemo(
    () => allItems.filter((it) => missedIds.includes(it.id)),
    [allItems, missedIds]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Trophy size={32} className="text-amber-300" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black">
            Kết Quả Bài Luyện Kana
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            {accuracy === 100
              ? 'Xuất sắc! Bạn đã thuộc toàn bộ bảng chữ cái vừa chọn!'
              : accuracy >= 70
              ? 'Rất tốt! Hãy tiếp tục luyện tập những chữ còn sót nhé!'
              : 'Khởi đầu tốt! Càng gõ nhiều lần, bạn sẽ càng nhớ nhanh hơn!'}
          </p>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3 mt-6 text-center">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/15">
              <div className="text-[11px] text-blue-200 font-bold uppercase">Đã Thuộc</div>
              <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                {solvedCount} / {total}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/15">
              <div className="text-[11px] text-blue-200 font-bold uppercase">Độ Chính Xác</div>
              <div className="text-lg sm:text-xl font-black text-amber-300 mt-0.5">
                {accuracy}%
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/15">
              <div className="text-[11px] text-blue-200 font-bold uppercase flex items-center justify-center gap-1">
                <Clock size={12} />
                <span>Thời Gian</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                {timeFormatted}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Missed / Unfinished Section */}
          {missedCount > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <XCircle size={18} className="text-rose-500" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Chữ Cần Ôn Lại ({missedCount})
                </h3>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {missedItems.map((it) => {
                  const char = it.displayMode
                    ? (it.displayMode === 'katakana' ? it.katakana : it.hiragana)
                    : (kanaType === 'katakana' ? it.katakana : it.hiragana);
                  const tries = attemptsMap[it.id] || 0;

                  return (
                    <div
                      key={it.id}
                      className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col items-center justify-between text-center relative group"
                    >
                      <span
                        style={{ fontFamily }}
                        className="text-2xl font-black text-slate-900 mb-1"
                      >
                        {char}
                      </span>
                      <span className="text-xs font-bold text-[#F05A28] uppercase">
                        {it.romaji}
                      </span>
                      {tries > 0 && (
                        <span className="text-[10px] text-rose-500 mt-0.5">
                          {tries} lần thử
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onPlaySpeech(char)}
                        className="mt-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Solved Section */}
          {solvedCount > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Chữ Đã Trả Lời Đúng ({solvedCount})
                </h3>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {solvedItems.map((it) => {
                  const char = it.displayMode
                    ? (it.displayMode === 'katakana' ? it.katakana : it.hiragana)
                    : (kanaType === 'katakana' ? it.katakana : it.hiragana);

                  return (
                    <div
                      key={it.id}
                      className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col items-center justify-between text-center"
                    >
                      <span
                        style={{ fontFamily }}
                        className="text-xl font-bold text-slate-800"
                      >
                        {char}
                      </span>
                      <span className="text-xs font-bold text-emerald-700">
                        {it.romaji}
                      </span>
                      <button
                        type="button"
                        onClick={() => onPlaySpeech(char)}
                        className="mt-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToSetup}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 text-xs font-bold transition-colors cursor-pointer"
          >
            ← Chọn bảng chữ khác
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            {missedCount > 0 && (
              <button
                type="button"
                onClick={onRetryMissed}
                className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Luyện lại {missedCount} chữ chưa thuộc</span>
              </button>
            )}

            <button
              type="button"
              onClick={onRetryAll}
              className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-[#388bea] hover:bg-[#277ad7] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Luyện lại toàn bộ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
