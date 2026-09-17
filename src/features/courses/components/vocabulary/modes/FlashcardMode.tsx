import { useState, useEffect, useCallback } from 'react';
import {
  Shuffle,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Volume2,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import type { VocabularyItem } from '../../../types';

interface FlashcardModeProps {
  items: VocabularyItem[];
  onRecordResult: (id: string, isCorrect: boolean) => void;
}

export default function FlashcardMode({ items, onRecordResult }: FlashcardModeProps) {
  const [cardList, setCardList] = useState<VocabularyItem[]>(items);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFuriganaOnFront, setShowFuriganaOnFront] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  useEffect(() => {
    setCardList(items);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [items]);

  const currentCard = cardList[currentIndex];

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < cardList.length - 1 ? prev + 1 : 0));
  }, [cardList.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cardList.length - 1));
  }, [cardList.length]);

  const handleKnow = () => {
    if (!currentCard) return;
    onRecordResult(currentCard._id, true);
    handleNext();
  };

  const handleDontKnow = () => {
    if (!currentCard) return;
    onRecordResult(currentCard._id, false);
    handleNext();
  };

  const handleShuffleToggle = () => {
    setIsFlipped(false);
    if (!isShuffled) {
      const shuffled = [...cardList].sort(() => Math.random() - 0.5);
      setCardList(shuffled);
      setCurrentIndex(0);
      setIsShuffled(true);
    } else {
      setCardList(items);
      setCurrentIndex(0);
      setIsShuffled(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  // Keyboard accessibility
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
      } else if (e.key.toLowerCase() === 'd') {
        handleKnow();
      } else if (e.key.toLowerCase() === 'a') {
        handleDontKnow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, currentCard]);

  if (!currentCard) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        Không có thẻ từ vựng nào để học.
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cardList.length) * 100);

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center">
      {/* Top Toolbar */}
      <div className="w-full flex items-center justify-between mb-2 px-2 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-800 font-mono font-bold px-3 py-1 rounded-full border border-slate-200">
            {currentIndex + 1} / {cardList.length} ({progressPercent}%)
          </span>
          <button
            type="button"
            onClick={handleShuffleToggle}
            className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-all cursor-pointer ${
              isShuffled
                ? 'bg-orange-50 text-[#F05A28] border-orange-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Shuffle size={12} />
            <span>Xáo thẻ</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowFuriganaOnFront((prev) => !prev)}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
        >
          {showFuriganaOnFront ? <EyeOff size={13} /> : <Eye size={13} />}
          <span>{showFuriganaOnFront ? 'Ẩn Furigana' : 'Hiện Furigana'}</span>
        </button>
      </div>

      {/* Mini Visual Progress Line */}
      <div className="w-full h-1 bg-slate-100 rounded-full mb-4 overflow-hidden border border-slate-200/50">
        <div
          className="h-full bg-gradient-to-r from-[#F05A28] to-amber-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="w-full h-80 sm:h-96 [perspective:1000px] cursor-pointer select-none mb-6"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform rounded-3xl shadow-xl ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* ── FRONT FACE ── */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-3xl bg-white border-2 border-slate-200 p-8 flex flex-col justify-between items-center text-center shadow-lg hover:border-orange-300 transition-colors">
            <div className="w-full flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Mặt trước (Tiếng Nhật)
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(currentCard.term);
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-[#F05A28] transition-all cursor-pointer"
                title="Phát âm"
              >
                <Volume2 size={18} />
              </button>
            </div>

            <div className="my-auto">
              {showFuriganaOnFront && currentCard.reading && currentCard.reading !== currentCard.term && (
                <div className="text-sm sm:text-base font-bold text-[#F05A28] mb-1 font-japanese">
                  {currentCard.reading}
                </div>
              )}
              <h3 className="text-5xl sm:text-6xl font-black text-slate-900 font-japanese tracking-wide">
                {currentCard.term}
              </h3>
              <span className="inline-block mt-3 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600">
                {currentCard.partOfSpeech}
              </span>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1">
              <RotateCw size={13} />
              <span>Nhấn vào thẻ hoặc bấm [Space] để xem nghĩa</span>
            </div>
          </div>

          {/* ── BACK FACE ── */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl bg-gradient-to-b from-slate-900 to-[#1E293B] text-white p-8 flex flex-col justify-between items-center text-center shadow-xl border-2 border-slate-800">
            <div className="w-full flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-orange-400">
                Mặt sau (Ý nghĩa)
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(currentCard.term);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Phát âm"
              >
                <Volume2 size={18} />
              </button>
            </div>

            <div className="my-auto">
              <div className="text-2xl sm:text-3xl font-extrabold text-orange-400 mb-2 font-japanese">
                {currentCard.reading}
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-white mb-2">
                {currentCard.meaning}
              </h4>
              <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 text-slate-300 border border-white/10">
                {currentCard.partOfSpeech}
              </span>

              {currentCard.examples && currentCard.examples.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left max-w-sm text-xs text-slate-300">
                  <div className="font-japanese font-semibold text-white">
                    {currentCard.examples[0].japanese}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    {currentCard.examples[0].vietnamese}
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles size={13} className="text-amber-400" />
              <span>Đánh giá mức độ ghi nhớ ở các nút bên dưới</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="w-full flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePrev}
          className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
          title="Thẻ trước"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          onClick={handleDontKnow}
          className="flex-1 py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm border border-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <X size={16} />
          <span>Chưa nhớ (A)</span>
        </button>

        <button
          type="button"
          onClick={handleKnow}
          className="flex-1 py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs sm:text-sm border border-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check size={16} />
          <span>Đã thuộc (D)</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
          title="Thẻ sau"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Progress Footer */}
      <div className="w-full mt-4 text-center text-xs text-slate-400">
        Phím tắt: [Space] Lật thẻ • [← / →] Đổi thẻ • [A] Chưa nhớ • [D] Đã thuộc
      </div>
    </div>
  );
}
