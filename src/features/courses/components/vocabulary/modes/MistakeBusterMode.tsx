import { useState, useEffect, useCallback } from 'react';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  RotateCw,
  Flame,
  ShieldCheck
} from 'lucide-react';
import type { VocabularyItem } from '../../../types';
import { weakWordsStorage } from '../../../utils/weakWordsStorage';

interface MistakeBusterModeProps {
  items: VocabularyItem[];
  courseCode: string;
  lessonSlug: string;
  onRecordResult: (id: string, isCorrect: boolean) => void;
  onSwitchMode?: (mode: string) => void;
}

export default function MistakeBusterMode({
  items,
  courseCode,
  lessonSlug,
  onRecordResult,
  onSwitchMode
}: MistakeBusterModeProps) {
  const [weakList, setWeakList] = useState<VocabularyItem[]>([]);
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [graduatedCount, setGraduatedCount] = useState(0);
  const [justGraduated, setJustGraduated] = useState<string | null>(null);

  // Load weak words from persistent storage
  const loadWeakWords = useCallback(() => {
    const weakIds = weakWordsStorage.getWeakWordIds(courseCode, lessonSlug);
    const weakStreaks = weakWordsStorage.getWeakWordStreaks(courseCode, lessonSlug);

    const filtered = items.filter((it) => weakIds.includes(it._id));
    setWeakList(filtered);
    setStreaks(weakStreaks);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [courseCode, lessonSlug, items]);

  useEffect(() => {
    loadWeakWords();
  }, [loadWeakWords]);

  const currentItem = weakList[currentIndex];

  // Speech Helper
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  }, []);

  // Handle Response
  const handleAnswer = (isCorrect: boolean) => {
    if (!currentItem) return;

    const id = currentItem._id;
    const res = weakWordsStorage.recordAttempt(courseCode, lessonSlug, id, isCorrect);
    onRecordResult(id, isCorrect);

    if (res.graduated) {
      setJustGraduated(currentItem.term);
      setGraduatedCount((prev) => prev + 1);
      speak(currentItem.term);

      setTimeout(() => {
        setJustGraduated(null);
        // Reload list without this graduated word
        loadWeakWords();
      }, 1200);
    } else {
      // Update local streak
      setStreaks((prev) => ({ ...prev, [id]: res.streak }));
      setIsFlipped(false);

      if (isCorrect) {
        speak(currentItem.term);
      }

      // Next word in weak list
      if (currentIndex < weakList.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCurrentIndex(0);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === '1' || e.key.toLowerCase() === 'a') {
        handleAnswer(false);
      } else if (e.key === '2' || e.key.toLowerCase() === 'd') {
        handleAnswer(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentItem, handleAnswer]);

  // Zero-state: No weak words!
  if (weakList.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-8 sm:p-12 bg-white rounded-3xl border border-slate-200 shadow-xl text-center animate-scaleUp">
        <div className="w-18 h-18 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <ShieldCheck size={40} />
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          Không Có Từ Nào Bị Yếu!
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed max-w-md mx-auto">
          Tuyệt vời! Bạn đã thuộc hết hoặc chưa có từ nào bị đánh dấu sai trong bài học này. Bất cứ khi nào bạn trả lời sai trong Flashcard hay Quiz, từ đó sẽ tự động xuất hiện ở đây để bạn giải cứu.
        </p>

        {graduatedCount > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center justify-center gap-2">
            <Sparkles size={16} />
            <span>Bạn vừa giải cứu thành công {graduatedCount} từ trong phiên học này!</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onSwitchMode && (
            <>
              <button
                type="button"
                onClick={() => onSwitchMode('speed-match')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#F05A28] text-white font-bold text-xs sm:text-sm hover:bg-[#d94817] transition-all shadow-md cursor-pointer"
              >
                Chơi Ghép Cặp Thần Tốc
              </button>
              <button
                type="button"
                onClick={() => onSwitchMode('smart-quiz')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-200 transition-all cursor-pointer"
              >
                Làm Smart Quiz
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const currentStreak = streaks[currentItem._id] || 0;

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* ── Top Rescue Mission Banner ── */}
      <div className="w-full mb-4 p-4 rounded-3xl bg-linear-to-r from-rose-500 via-[#F05A28] to-amber-500 text-white shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-bold shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-white/90 uppercase tracking-wider">
              Chiến Dịch Cứu Cánh Từ Hay Sai
            </div>
            <div className="text-xs sm:text-sm font-medium text-white/80">
              Cần cứu: <strong>{weakList.length}</strong> từ • Đúng <strong>2 lần liên tiếp</strong> để tốt nghiệp!
            </div>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-xs font-mono font-bold text-xs shrink-0">
          {currentIndex + 1} / {weakList.length}
        </div>
      </div>

      {/* ── Graduation Toast ── */}
      {justGraduated && (
        <div className="w-full mb-4 p-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg animate-bounce">
          <Award size={18} />
          <span>Chúc mừng! Từ 【{justGraduated}】 đã tốt nghiệp và rời khỏi danh sách yếu!</span>
        </div>
      )}

      {/* ── Word Card ── */}
      <div
        onClick={() => setIsFlipped((prev) => !prev)}
        className="w-full min-h-[320px] sm:min-h-[360px] p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-xl hover:border-orange-300 transition-all flex flex-col justify-between items-center text-center cursor-pointer mb-6 relative group"
      >
        {/* Card Header */}
        <div className="w-full flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
            <Flame size={13} className="text-rose-600" />
            <span>Chuỗi đúng: {currentStreak} / 2</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              speak(currentItem.term);
            }}
            className="w-9 h-9 rounded-xl bg-orange-50 text-[#F05A28] hover:bg-[#F05A28] hover:text-white border border-orange-200 transition-all flex items-center justify-center cursor-pointer"
            title="Phát âm"
          >
            <Volume2 size={16} />
          </button>
        </div>

        {/* Main Body */}
        <div className="my-auto py-2">
          {!isFlipped ? (
            /* Front: Japanese Term */
            <div className="space-y-3">
              {currentItem.reading && currentItem.reading !== currentItem.term && (
                <div className="inline-flex px-3 py-0.5 rounded-full bg-orange-50 text-[#F05A28] font-bold text-sm font-japanese border border-orange-200/60">
                  {currentItem.reading}
                </div>
              )}
              <h3 className="text-4xl sm:text-6xl font-black text-slate-900 font-japanese">
                {currentItem.term}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Nhấn thẻ để xem ý nghĩa</p>
            </div>
          ) : (
            /* Back: Meaning & Example */
            <div className="space-y-3 animate-fadeIn max-w-md">
              <div className="text-xl sm:text-2xl font-black text-[#F05A28] font-japanese">
                {currentItem.reading}
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-slate-900">
                {currentItem.meaning}
              </h4>
              {currentItem.examples && currentItem.examples[0] && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-left text-xs text-slate-600 font-japanese">
                  <p className="font-bold text-slate-900">{currentItem.examples[0].japanese}</p>
                  <p className="text-slate-500 mt-0.5">{currentItem.examples[0].vietnamese}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Footer Hint */}
        <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Phím [Space] để lật thẻ</span>
          <div className="inline-flex items-center gap-1 text-slate-500 font-semibold group-hover:text-[#F05A28] transition-colors">
            <RotateCw size={13} className="group-hover:rotate-180 transition-transform duration-500" />
            <span>{isFlipped ? 'Chạm để xem lại mặt trước' : 'Chạm để xem ý nghĩa'}</span>
          </div>
          <span className="font-mono">[{currentIndex + 1}/{weakList.length}]</span>
        </div>
      </div>

      {/* ── Action Assessment Buttons ── */}
      <div className="w-full flex items-center justify-center gap-3">
        {/* Still Wrong */}
        <button
          type="button"
          onClick={() => handleAnswer(false)}
          className="flex-1 py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs sm:text-sm border border-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
        >
          <XCircle size={18} />
          <span>Vẫn chưa nhớ [1 / A]</span>
        </button>

        {/* Mastered / Remembered */}
        <button
          type="button"
          onClick={() => handleAnswer(true)}
          className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-xs sm:text-sm border border-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
        >
          <CheckCircle2 size={18} />
          <span>Đã nhớ rồi! [2 / D]</span>
        </button>
      </div>

      {/* Helper */}
      <div className="mt-4 text-center text-xs text-slate-400 font-medium">
        Đánh dấu đúng 2 lần liên tiếp để từ này rời khỏi danh sách yếu
      </div>
    </div>
  );
}
