import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shuffle,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Volume2,
  Sparkles,
  Eye,
  EyeOff,
  Play,
  Pause,
  Filter,
  RotateCcw,
  BookOpen,
  Volume1,
  Award
} from 'lucide-react';
import type { VocabularyItem } from '../../../types';
import { weakWordsStorage } from '../../../utils/weakWordsStorage';

interface FlashcardModeProps {
  items: VocabularyItem[];
  courseCode?: string;
  lessonSlug?: string;
  onRecordResult: (id: string, isCorrect: boolean) => void;
}

export default function FlashcardMode({
  items,
  courseCode = 'jpd123',
  lessonSlug = '',
  onRecordResult
}: FlashcardModeProps) {
  const [cardList, setCardList] = useState<VocabularyItem[]>(items);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFuriganaOnFront, setShowFuriganaOnFront] = useState(true);
  const [isShuffled, setIsShuffled] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoSpeak] = useState(true);
  const [onlyWeakWords, setOnlyWeakWords] = useState(false);
  const [playingSpeed, setPlayingSpeed] = useState<number | null>(null);

  // Tracking memorized stats in this session
  const [rememberedIds, setRememberedIds] = useState<Set<string>>(new Set());
  const [forgottenIds, setForgottenIds] = useState<Set<string>>(new Set());
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with prop items
  useEffect(() => {
    setCardList(items);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsSessionComplete(false);
  }, [items]);

  const currentCard = cardList[currentIndex];

  // SpeechSynthesis helper
  const speak = useCallback((text: string, rate = 1.0) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = rate;
      setPlayingSpeed(rate);
      u.onend = () => setPlayingSpeed(null);
      u.onerror = () => setPlayingSpeed(null);
      window.speechSynthesis.speak(u);
    }
  }, []);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      const nextState = !prev;
      if (nextState && autoSpeak && currentCard) {
        speak(currentCard.term, 0.95);
      }
      return nextState;
    });
  }, [autoSpeak, currentCard, speak]);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex < cardList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSessionComplete(true);
    }
  }, [cardList.length, currentIndex]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setIsSessionComplete(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cardList.length - 1));
  }, [cardList.length]);

  // 4-Level Anki SRS Spaced Repetition
  const handleRate = (level: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;

    const id = currentCard._id;

    if (level === 'again') {
      // 1. Quên: Lặp lại sau 1 thẻ, tự động add vào Weak Words
      setForgottenIds((prev) => new Set(prev).add(id));
      setRememberedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      weakWordsStorage.addWeakWord(courseCode, lessonSlug, id);
      onRecordResult(id, false);

      // Re-insert 1 card away into current cardList
      const updatedList = [...cardList];
      const insertIndex = Math.min(currentIndex + 2, updatedList.length);
      updatedList.splice(insertIndex, 0, currentCard);
      setCardList(updatedList);
    } else if (level === 'hard') {
      // 2. Khó: Lặp lại sau 3 thẻ
      weakWordsStorage.recordAttempt(courseCode, lessonSlug, id, false);
      onRecordResult(id, true);

      // Re-insert 3 cards away
      const updatedList = [...cardList];
      const insertIndex = Math.min(currentIndex + 4, updatedList.length);
      updatedList.splice(insertIndex, 0, currentCard);
      setCardList(updatedList);
    } else if (level === 'good') {
      // 3. Tốt: Nhớ bình thường
      weakWordsStorage.recordAttempt(courseCode, lessonSlug, id, true);
      onRecordResult(id, true);
    } else {
      // 4. Dễ: Thuộc làu làu
      setRememberedIds((prev) => new Set(prev).add(id));
      setForgottenIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      weakWordsStorage.recordAttempt(courseCode, lessonSlug, id, true);
      onRecordResult(id, true);
    }

    handleNext();
  };

  // Toggle weak words filter
  const toggleOnlyWeakWords = () => {
    setIsFlipped(false);
    if (!onlyWeakWords) {
      const weakList = items.filter((item) => forgottenIds.has(item._id));
      if (weakList.length > 0) {
        setCardList(weakList);
        setCurrentIndex(0);
        setOnlyWeakWords(true);
      }
    } else {
      setCardList(items);
      setCurrentIndex(0);
      setOnlyWeakWords(false);
    }
  };

  // Shuffle toggle
  const handleShuffleToggle = () => {
    setIsFlipped(false);
    if (!isShuffled) {
      const shuffled = [...cardList].sort(() => Math.random() - 0.5);
      setCardList(shuffled);
      setCurrentIndex(0);
      setIsShuffled(true);
    } else {
      setCardList(onlyWeakWords ? items.filter((item) => forgottenIds.has(item._id)) : items);
      setCurrentIndex(0);
      setIsShuffled(false);
    }
  };

  // Auto-play timer loop
  useEffect(() => {
    if (autoPlay && !isSessionComplete && currentCard) {
      autoPlayTimerRef.current = setTimeout(() => {
        if (!isFlipped) {
          handleFlip();
        } else {
          handleNext();
        }
      }, 3500);
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [autoPlay, isFlipped, isSessionComplete, currentCard, handleFlip, handleNext]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1' || e.key.toLowerCase() === 'a') {
        handleRate('again');
      } else if (e.key === '2' || e.key.toLowerCase() === 's') {
        handleRate('hard');
      } else if (e.key === '3' || e.key.toLowerCase() === 'd') {
        handleRate('good');
      } else if (e.key === '4' || e.key.toLowerCase() === 'f') {
        handleRate('easy');
      } else if (e.key.toLowerCase() === 'p') {
        if (currentCard) speak(currentCard.term);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentCard, speak, handleRate]);

  if (!currentCard || cardList.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto shadow-xs">
        <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
        <h4 className="text-base font-bold text-slate-800 mb-1">Không có thẻ từ vựng nào</h4>
        <p className="text-xs text-slate-500 mb-4">
          {onlyWeakWords ? 'Bạn đã thuộc hết tất cả các từ cần ôn tập!' : 'Chưa có dữ liệu từ vựng trong bài học này.'}
        </p>
        {onlyWeakWords && (
          <button
            type="button"
            onClick={toggleOnlyWeakWords}
            className="px-4 py-2 rounded-xl bg-[#F05A28] text-white text-xs font-bold hover:bg-[#d94817] transition-colors cursor-pointer"
          >
            Quay lại toàn bộ danh sách
          </button>
        )}
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cardList.length) * 100);

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* ── Top Multi-metric Progress & Controls ── */}
      <div className="w-full mb-4 space-y-3">
        {/* Metric Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-mono font-bold text-xs shadow-xs">
              {currentIndex + 1} / {cardList.length}
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/80 text-[11px]">
              <CheckCircle2 size={12} className="text-emerald-500" />
              Đã thuộc: {rememberedIds.size}
            </span>

            {forgottenIds.size > 0 && (
              <button
                type="button"
                onClick={toggleOnlyWeakWords}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold border text-[11px] transition-all cursor-pointer ${
                  onlyWeakWords
                    ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                    : 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100'
                }`}
                title="Lọc các từ bạn vừa đánh dấu Chưa nhớ"
              >
                <XCircle size={12} className={onlyWeakWords ? 'text-white' : 'text-rose-500'} />
                <span>Cần ôn: {forgottenIds.size} {onlyWeakWords ? '(Đang bật)' : ''}</span>
              </button>
            )}
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5">
            {/* Auto Play Toggle */}
            <button
              type="button"
              onClick={() => setAutoPlay((prev) => !prev)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                autoPlay
                  ? 'bg-orange-50 text-[#F05A28] border-orange-200 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Tự động lật thẻ (Hands-free)"
            >
              {autoPlay ? <Pause size={13} /> : <Play size={13} />}
              <span className="hidden sm:inline">{autoPlay ? 'Dừng tự động' : 'Tự động'}</span>
            </button>

            {/* Shuffle */}
            <button
              type="button"
              onClick={handleShuffleToggle}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isShuffled
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Xáo trộn ngẫu nhiên thứ tự thẻ"
            >
              <Shuffle size={13} />
              <span className="hidden sm:inline">Xáo thẻ</span>
            </button>

            {/* Furigana Toggle */}
            <button
              type="button"
              onClick={() => setShowFuriganaOnFront((prev) => !prev)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
              title="Bật/Tắt Furigana trên mặt trước"
            >
              {showFuriganaOnFront ? <Eye size={13} /> : <EyeOff size={13} />}
              <span className="hidden sm:inline">Furigana</span>
            </button>
          </div>
        </div>

        {/* Visual Dual Progress Line */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/60">
          <div
            className="h-full bg-linear-to-r from-[#F05A28] to-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── 3D Flashcard Presentation Card ── */}
      <div
        className="w-full h-[360px] sm:h-[420px] [perspective:1200px] cursor-pointer select-none mb-6 relative group"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform rounded-3xl ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* ══════════════════════════════════════════
              MẶT TRƯỚC (FRONT FACE) - PURE CLEAN LIGHT
             ══════════════════════════════════════════ */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-3xl bg-white border-2 border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-lg hover:border-orange-300 hover:shadow-2xl transition-all duration-300">
            {/* Front Header */}
            <div className="w-full flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <BookOpen size={14} className="text-[#F05A28]" />
                <span>Mặt Trước • Tiếng Nhật</span>
              </div>

              {/* Audio Pronunciation Button */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentCard.term, 0.75);
                  }}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    playingSpeed === 0.75
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Phát âm tốc độ chậm (0.8x)"
                >
                  <Volume1 size={13} />
                  <span>0.8x</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentCard.term, 1.0);
                  }}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    playingSpeed === 1.0
                      ? 'bg-[#F05A28] text-white border-[#F05A28] shadow-md shadow-orange-500/25 scale-105'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-orange-50 hover:text-[#F05A28] hover:border-orange-200'
                  }`}
                  title="Phát âm chuẩn (1x)"
                >
                  <Volume2 size={17} />
                </button>
              </div>
            </div>

            {/* Front Main Body */}
            <div className="my-auto py-2 flex flex-col items-center">
              {/* Furigana Reading Pill */}
              {showFuriganaOnFront && currentCard.reading && currentCard.reading !== currentCard.term && (
                <div className="inline-flex items-center gap-1 text-sm sm:text-base font-bold text-[#F05A28] bg-orange-50/80 px-3 py-0.5 rounded-full border border-orange-200/60 mb-2 font-japanese">
                  <span>{currentCard.reading}</span>
                </div>
              )}

              {/* Main Japanese Term */}
              <h3 className="text-4xl sm:text-6xl font-black text-slate-900 font-japanese tracking-wide leading-tight">
                {currentCard.term}
              </h3>

              {/* Part of speech badge */}
              {currentCard.partOfSpeech && (
                <span className="mt-3 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
                  {currentCard.partOfSpeech}
                </span>
              )}
            </div>

            {/* Front Footer Hint */}
            <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="hidden sm:inline">Phím [Space] để lật</span>
              <div className="inline-flex items-center gap-1 text-slate-500 font-semibold group-hover:text-[#F05A28] transition-colors mx-auto sm:mx-0">
                <RotateCw size={13} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>Nhấn để xem ý nghĩa &amp; ví dụ</span>
              </div>
              <span className="hidden sm:inline font-mono">[{currentIndex + 1}/{cardList.length}]</span>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════════
              MẶT SAU (BACK FACE) - MODERN WARM LIGHT (HOÀN TOÀN LOẠI BỎ NỀN ĐEN U ÁM)
             ═════════════════════════════════════════════════════════════════════════ */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl bg-gradient-to-b from-white via-orange-50/20 to-slate-50/90 border-2 border-orange-200/90 p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-xl">
            {/* Back Header */}
            <div className="w-full flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#F05A28]">
                <Sparkles size={14} />
                <span>Mặt Sau • Ý Nghĩa &amp; Ngữ Cảnh</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentCard.term, 0.75);
                  }}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-bold text-slate-600 transition-all cursor-pointer flex items-center gap-1"
                  title="Phát âm chậm 0.8x"
                >
                  <Volume1 size={13} />
                  <span>0.8x</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentCard.term, 1.0);
                  }}
                  className="w-9 h-9 rounded-xl border border-orange-200 bg-orange-50 hover:bg-[#F05A28] text-[#F05A28] hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                  title="Phát âm từ vựng"
                >
                  <Volume2 size={17} />
                </button>
              </div>
            </div>

            {/* Back Main Content */}
            <div className="my-auto py-1 w-full max-w-md flex flex-col items-center">
              {/* Hiragana reading display */}
              <div className="text-xl sm:text-2xl font-black text-[#F05A28] font-japanese tracking-wide mb-1">
                {currentCard.reading}
              </div>

              {/* Primary Vietnamese Meaning */}
              <h4 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 leading-tight tracking-tight">
                {currentCard.meaning}
              </h4>

              {/* Part of speech & Kanji Info */}
              <div className="flex items-center gap-2 mb-3">
                {currentCard.partOfSpeech && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                    {currentCard.partOfSpeech}
                  </span>
                )}
                {currentCard.term !== currentCard.reading && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-50 text-[#F05A28] border border-orange-200/60">
                    Kanji: {currentCard.term}
                  </span>
                )}
              </div>

              {/* Example Context Box */}
              {currentCard.examples && currentCard.examples.length > 0 && (
                <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-white border border-orange-200/70 shadow-2xs text-left">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                      Ví dụ ngữ cảnh
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(currentCard.examples![0].japanese, 0.9);
                      }}
                      className="text-slate-400 hover:text-[#F05A28] transition-colors p-0.5 cursor-pointer"
                      title="Phát âm câu ví dụ"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>

                  <p className="font-japanese font-bold text-xs sm:text-sm text-slate-900 leading-relaxed mt-1">
                    {currentCard.examples[0].japanese}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-normal font-medium">
                    {currentCard.examples[0].vietnamese}
                  </p>
                </div>
              )}
            </div>

            {/* Back Footer Instruction */}
            <div className="w-full pt-3 border-t border-orange-100 flex items-center justify-between text-xs text-slate-400">
              <span className="hidden sm:inline">Phím [1, 2, 3] đánh giá</span>
              <div className="inline-flex items-center gap-1 text-slate-600 font-semibold mx-auto sm:mx-0">
                <Sparkles size={13} className="text-amber-500" />
                <span>Đánh giá mức độ nhớ của bạn bên dưới</span>
              </div>
              <span className="hidden sm:inline font-mono">[{currentIndex + 1}/{cardList.length}]</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Assessment Controls (3-Level SRS Buttons) ── */}
      <div className="w-full flex items-center justify-between gap-2.5 sm:gap-3">
        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs shrink-0"
          title="Thẻ trước [←]"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Level 1: Again / Quên */}
        <button
          type="button"
          onClick={() => handleRate('again')}
          className="flex-1 py-3 px-1.5 sm:px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs sm:text-sm border border-rose-200 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
          title="Lặp lại sau 1 thẻ [1/A]"
        >
          <XCircle size={16} className="text-rose-600 shrink-0" />
          <span>Quên</span>
          <span className="hidden lg:inline text-[11px] font-normal text-rose-500 font-mono">(1)</span>
        </button>

        {/* Level 2: Hard / Khó */}
        <button
          type="button"
          onClick={() => handleRate('hard')}
          className="flex-1 py-3 px-1.5 sm:px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-black text-xs sm:text-sm border border-amber-200 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
          title="Lặp lại sau 3 thẻ [2/S]"
        >
          <HelpCircle size={16} className="text-amber-600 shrink-0" />
          <span>Khó</span>
          <span className="hidden lg:inline text-[11px] font-normal text-amber-600 font-mono">(2)</span>
        </button>

        {/* Level 3: Good / Tốt */}
        <button
          type="button"
          onClick={() => handleRate('good')}
          className="flex-1 py-3 px-1.5 sm:px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-xs sm:text-sm border border-emerald-200 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
          title="Đã nhớ bình thường [3/D]"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Tốt</span>
          <span className="hidden lg:inline text-[11px] font-normal text-emerald-600 font-mono">(3)</span>
        </button>

        {/* Level 4: Easy / Dễ */}
        <button
          type="button"
          onClick={() => handleRate('easy')}
          className="flex-1 py-3 px-1.5 sm:px-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-black text-xs sm:text-sm border border-sky-200 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
          title="Đã thuộc làu làu [4/F]"
        >
          <Sparkles size={16} className="text-sky-600 shrink-0" />
          <span>Dễ</span>
          <span className="hidden lg:inline text-[11px] font-normal text-sky-600 font-mono">(4)</span>
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs shrink-0"
          title="Thẻ sau [→]"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Shortcuts Helper Text */}
      <div className="w-full mt-4 flex items-center justify-center gap-2 sm:gap-3 text-[11px] text-slate-400 font-medium flex-wrap">
        <span>[Space] Lật thẻ</span>
        <span>•</span>
        <span>[← / →] Đổi thẻ</span>
        <span>•</span>
        <span>[1] Quên</span>
        <span>•</span>
        <span>[2] Khó</span>
        <span>•</span>
        <span>[3] Tốt</span>
        <span>•</span>
        <span>[4] Dễ</span>
        <span>•</span>
        <span>[P] Nghe đọc</span>
      </div>

      {/* ── Completion Session Modal / Summary ── */}
      {isSessionComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Award size={32} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-2">
              Hoàn Thành Vòng Flashcard!
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              Bạn đã lướt qua toàn bộ {cardList.length} thẻ từ vựng trong phiên học này.
            </p>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-center">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                <div className="text-2xl font-black text-emerald-700 font-mono">
                  {rememberedIds.size}
                </div>
                <div className="text-xs font-bold text-emerald-600 mt-1">Từ đã thuộc làu</div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80">
                <div className="text-2xl font-black text-rose-700 font-mono">
                  {forgottenIds.size}
                </div>
                <div className="text-xs font-bold text-rose-600 mt-1">Từ cần củng cố</div>
              </div>
            </div>

            {/* Action buttons in modal */}
            <div className="space-y-2.5">
              {forgottenIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const weak = items.filter((it) => forgottenIds.has(it._id));
                    setCardList(weak);
                    setCurrentIndex(0);
                    setIsFlipped(false);
                    setOnlyWeakWords(true);
                    setIsSessionComplete(false);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Filter size={16} />
                  <span>Ôn tập lại {forgottenIds.size} từ chưa nhớ</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setCardList(items);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setOnlyWeakWords(false);
                  setIsSessionComplete(false);
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Học lại toàn bộ danh sách</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSessionComplete(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 py-1 transition-colors cursor-pointer"
              >
                Đóng thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
