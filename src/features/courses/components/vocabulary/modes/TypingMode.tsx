import { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle2, XCircle, ArrowRight, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import type { VocabularyItem } from '../../../types';
import { courseApi } from '../../../api/courseApi';

interface TypingModeProps {
  items: VocabularyItem[];
  onRecordResult: (id: string, isCorrect: boolean) => void;
}

export default function TypingMode({ items, onRecordResult }: TypingModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'ja-to-vi' | 'vi-to-ja'>('vi-to-ja');
  const [userInput, setUserInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctReveal, setCorrectReveal] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const currentItem = items[currentIndex];

  useEffect(() => {
    setUserInput('');
    setIsSubmitted(false);
    setIsCorrect(null);
    setCorrectReveal('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, direction]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isSubmitted || !currentItem) return;

    try {
      const res = await courseApi.verifyTyping(currentItem._id, userInput, direction);
      const correct = res.isCorrect;

      setIsSubmitted(true);
      setIsCorrect(correct);
      setCorrectReveal(res.correctAnswer);
      setTotalAttempts((prev) => prev + 1);

      if (correct) {
        setCorrectCount((prev) => prev + 1);
        speak(currentItem.term);
      }

      onRecordResult(currentItem._id, correct);
    } catch (err) {
      console.error('Typing verification error:', err);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished loop
      setCurrentIndex(0);
    }
  };

  if (!currentItem) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        Không có từ vựng nào để luyện gõ.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center">
      {/* Direction & Stats Header */}
      <div className="w-full flex items-center justify-between mb-4 px-2 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-800 font-mono font-bold px-3 py-1 rounded-full border border-slate-200">
            {currentIndex + 1} / {items.length}
          </span>
          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
            Đúng: {correctCount} / {totalAttempts}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setDirection((prev) => (prev === 'vi-to-ja' ? 'ja-to-vi' : 'vi-to-ja'))}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-900 transition-all cursor-pointer font-medium"
        >
          <RotateCcw size={12} />
          <span>{direction === 'vi-to-ja' ? 'Nghĩa → Gõ Nhật' : 'Từ Nhật → Gõ Nghĩa'}</span>
        </button>
      </div>

      {/* Question Card */}
      <div className="w-full p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-lg text-center mb-6">
        <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-2">
          {direction === 'vi-to-ja' ? 'Hãy gõ chữ Hán hoặc Hiragana của từ:' : 'Hãy gõ nghĩa tiếng Việt của từ:'}
        </span>

        {direction === 'vi-to-ja' ? (
          <div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
              {currentItem.meaning}
            </h3>
            <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600">
              {currentItem.partOfSpeech}
            </span>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-4xl sm:text-5xl font-black text-slate-900 font-japanese">
                {currentItem.term}
              </h3>
              <button
                type="button"
                onClick={() => speak(currentItem.term)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-[#F05A28] cursor-pointer"
              >
                <Volume2 size={18} />
              </button>
            </div>
            <div className="text-sm font-semibold text-[#F05A28] mt-1 font-japanese">
              {currentItem.reading}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isSubmitted}
              placeholder={
                direction === 'vi-to-ja'
                  ? 'Ví dụ: きた hoặc 北...'
                  : 'Ví dụ: phía bắc...'
              }
              className={`w-full py-4 pl-5 pr-14 rounded-2xl text-base sm:text-lg font-bold border-2 transition-all outline-none ${
                isSubmitted
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900'
                    : 'border-rose-500 bg-rose-50/50 text-rose-900'
                  : 'border-slate-300 focus:border-[#F05A28] focus:ring-4 focus:ring-orange-500/10'
              }`}
            />

            {!isSubmitted ? (
              <button
                type="submit"
                disabled={!userInput.trim()}
                className="absolute right-2 p-2.5 rounded-xl bg-[#F05A28] disabled:bg-slate-200 text-white transition-all cursor-pointer disabled:cursor-not-allowed"
                title="Gửi câu trả lời"
              >
                <Send size={18} />
              </button>
            ) : null}
          </div>
        </form>

        {/* Feedback Area */}
        {isSubmitted && (
          <div
            className={`mt-6 p-4 rounded-2xl border flex items-center justify-between gap-4 text-left animate-fadeIn ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              ) : (
                <XCircle size={24} className="text-rose-600 shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  {isCorrect ? 'Chính xác!' : 'Chưa đúng rồi!'}
                </div>
                {!isCorrect && (
                  <div className="text-sm font-semibold mt-0.5">
                    Đáp án đúng:{' '}
                    <strong className="font-bold text-slate-900">
                      {correctReveal}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
            >
              <span>Từ tiếp theo</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400 flex items-center gap-1">
        <Sparkles size={13} className="text-amber-500" />
        <span>Gõ phím [Enter] để gửi đáp án nhanh chóng</span>
      </div>
    </div>
  );
}
