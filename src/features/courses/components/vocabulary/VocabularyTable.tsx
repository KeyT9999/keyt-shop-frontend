import { useState, useMemo, Fragment } from 'react';
import { Star, Volume2, CheckCircle2, CircleDashed, Clock, Sparkles, Search } from 'lucide-react';
import type { VocabularyItem, MemoryStatus } from '../../types';
import JapaneseRuby from '../common/JapaneseRuby';
import { getCourseLanguage } from '../../utils/courseLanguage';
import { speakNeural } from '../../../../utils/ttsAudio';

interface VocabularyTableProps {
  items: VocabularyItem[];
  courseCode?: string;
  onToggleBookmark?: (id: string) => void;
  showReading?: boolean;
}

export default function VocabularyTable({
  items,
  courseCode = 'jpd123',
  onToggleBookmark,
  showReading = true
}: VocabularyTableProps) {
  const language = getCourseLanguage(courseCode);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const displayedItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((it) => {
      const termMatch = it.term.toLowerCase().includes(q);
      const meaningMatch = it.meaning.toLowerCase().includes(q);
      const readingMatch = it.reading ? it.reading.toLowerCase().includes(q) : false;
      const topicMatch = it.examples?.[0]?.vietnamese ? it.examples[0].vietnamese.toLowerCase().includes(q) : false;
      const exampleMatch = it.examples?.[0]?.japanese ? it.examples[0].japanese.toLowerCase().includes(q) : false;
      return termMatch || meaningMatch || readingMatch || topicMatch || exampleMatch;
    });
  }, [items, searchQuery]);

  const hasMultipleTopics = useMemo(() => {
    const topics = new Set(
      items
        .map((it) => {
          const vn = it.examples?.[0]?.vietnamese || '';
          return vn.startsWith('Chủ đề:') ? vn.replace('Chủ đề:', '').trim() : '';
        })
        .filter(Boolean)
    );
    return topics.size > 1;
  }, [items]);

  const speakWord = (text: string, id: string) => {
    setPlayingId(id);
    speakNeural(text, language.speechLocale, 0.95, () => setPlayingId(null));
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
      {/* Search & Topic Quick Filter Header */}
      {items.length > 10 && (
        <div className="p-3 sm:p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm từ tiếng Anh, nghĩa tiếng Việt, chủ đề..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-white border border-slate-200 focus:outline-none focus:border-[#F05A28] focus:ring-2 focus:ring-orange-100 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Hiển thị: <strong className="text-slate-800">{displayedItems.length}</strong> / {items.length} từ</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#F05A28] hover:underline cursor-pointer ml-1"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        </div>
      )}

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
            {displayedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                  Không tìm thấy từ vựng nào khớp với từ khóa "{searchQuery}".
                </td>
              </tr>
            ) : (
              displayedItems.map((item, idx) => {
                const isBookmarked = item.userProgress?.isBookmarked;
                const isPlaying = playingId === item._id;
                const vn = item.examples?.[0]?.vietnamese || '';
                const currentTopic = vn.startsWith('Chủ đề:') ? vn.replace('Chủ đề:', '').trim() : '';
                const prevItem = idx > 0 ? displayedItems[idx - 1] : null;
                const prevVn = prevItem?.examples?.[0]?.vietnamese || '';
                const prevTopic = prevVn.startsWith('Chủ đề:') ? prevVn.replace('Chủ đề:', '').trim() : '';
                const isNewTopic = hasMultipleTopics && !searchQuery.trim() && currentTopic && (idx === 0 || currentTopic !== prevTopic);

                return (
                  <Fragment key={item._id || idx}>
                    {isNewTopic && (
                      <tr className="bg-gradient-to-r from-orange-50/90 via-amber-50/40 to-transparent border-y border-orange-200/90">
                        <td colSpan={6} className="py-2.5 px-4">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs sm:text-sm text-[#F05A28] uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles size={14} className="text-[#F05A28]" />
                              Chủ đề: {currentTopic}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 bg-white/90 px-2.5 py-0.5 rounded-full border border-orange-200/60 shadow-2xs">
                              {items.filter((it) => (it.examples?.[0]?.vietnamese || '').includes(currentTopic)).length} mục từ
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr className="hover:bg-orange-50/30 transition-colors group">
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
                            {language.kind === 'english' ? (
                              <div className="text-left">
                                <div className="text-base font-bold text-slate-900">{item.term}</div>
                                {showReading && item.reading && <div className="mt-0.5 text-xs font-medium text-[#F05A28]">/{item.reading}/</div>}
                              </div>
                            ) : (
                              <JapaneseRuby
                                term={item.term}
                                reading={item.reading}
                                showReading={showReading}
                                size="md"
                              />
                            )}
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
                          <div className="text-xs text-slate-500 font-normal mt-1.5 space-y-0.5">
                            {item.examples[0].vietnamese && item.examples[0].vietnamese.startsWith('Chủ đề:') ? (
                              <>
                                <div className="text-[11px] font-semibold text-blue-600 not-italic">
                                  {item.examples[0].vietnamese}
                                </div>
                                <div className="italic text-slate-500 leading-relaxed">
                                  {item.examples[0].japanese}
                                </div>
                              </>
                            ) : (
                              <div className="italic">
                                VD: {item.examples[0].japanese} {item.examples[0].vietnamese ? `(${item.examples[0].vietnamese})` : ''}
                              </div>
                            )}
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
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
