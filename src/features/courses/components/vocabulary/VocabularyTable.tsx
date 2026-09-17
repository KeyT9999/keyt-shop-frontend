import { useState } from 'react';
import { Star, Volume2, CheckCircle2, CircleDashed, Clock, Sparkles } from 'lucide-react';
import type { VocabularyItem, MemoryStatus } from '../../types';
import JapaneseRuby from '../common/JapaneseRuby';

interface VocabularyTableProps {
  items: VocabularyItem[];
  onToggleBookmark?: (id: string) => void;
  showReading?: boolean;
}

export default function VocabularyTable({
  items,
  onToggleBookmark,
  showReading = true
}: VocabularyTableProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const speakWord = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      setPlayingId(id);
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const getStatusBadge = (status?: MemoryStatus) => {
    switch (status) {
      case 'mastered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Đã thuộc
          </span>
        );
      case 'familiar':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles size={12} className="text-blue-600" />
            Quen thuộc
          </span>
        );
      case 'learning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} className="text-amber-600" />
            Đang học
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <CircleDashed size={12} className="text-slate-400" />
            Mới
          </span>
        );
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-4 w-12 text-center">STT</th>
              <th className="py-4 px-4 min-w-[160px]">Từ vựng</th>
              <th className="py-4 px-4 min-w-[110px]">Loại từ</th>
              <th className="py-4 px-4 min-w-[180px]">Nghĩa tiếng Việt</th>
              <th className="py-4 px-4 min-w-[120px] text-center">Trạng thái</th>
              <th className="py-4 px-4 w-16 text-center">Lưu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {items.map((item, idx) => {
              const isBookmarked = item.userProgress?.isBookmarked;
              const isPlaying = playingId === item._id;

              return (
                <tr
                  key={item._id || idx}
                  className="hover:bg-orange-50/30 transition-colors group"
                >
                  {/* No. */}
                  <td className="py-4 px-4 text-center font-mono text-xs font-semibold text-slate-400">
                    {item.order || idx + 1}
                  </td>

                  {/* Term + Reading (Properly Separated) */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => speakWord(item.term, item._id)}
                        aria-label={`Phát âm từ ${item.term}`}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-orange-500 text-white border-orange-500 scale-105'
                            : 'bg-slate-50 hover:bg-orange-100 text-slate-500 hover:text-[#F05A28] border-slate-200'
                        }`}
                      >
                        <Volume2 size={15} />
                      </button>

                      <div className="text-left">
                        <JapaneseRuby
                          term={item.term}
                          reading={item.reading}
                          showReading={showReading}
                          size="md"
                        />
                        {item.romaji && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {item.romaji}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Part of Speech */}
                  <td className="py-4 px-4">
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                      {item.partOfSpeech}
                    </span>
                  </td>

                  {/* Meaning */}
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    {item.meaning}
                    {item.examples && item.examples.length > 0 && (
                      <div className="text-xs text-slate-500 font-normal mt-1 italic">
                        VD: {item.examples[0].japanese} ({item.examples[0].vietnamese})
                      </div>
                    )}
                  </td>

                  {/* Memory Status */}
                  <td className="py-4 px-4 text-center">
                    {getStatusBadge(item.userProgress?.status)}
                  </td>

                  {/* Bookmark Button */}
                  <td className="py-4 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleBookmark && onToggleBookmark(item._id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                          : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                      }`}
                      title={isBookmarked ? 'Bỏ lưu' : 'Lưu từ này'}
                    >
                      <Star size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
