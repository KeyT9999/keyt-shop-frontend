import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Volume2, Trophy, Sparkles } from 'lucide-react';
import type { QuizQuestion } from '../../../types';
import { courseApi } from '../../../api/courseApi';
import { getCourseLanguage } from '../../../utils/courseLanguage';

interface MultiChoiceModeProps {
  courseCode: string;
  lessonSlug: string;
  onRecordResult: (id: string, isCorrect: boolean) => void;
}

export default function MultiChoiceMode({
  courseCode,
  lessonSlug,
  onRecordResult
}: MultiChoiceModeProps) {
  const language = getCourseLanguage(courseCode);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const fetchQuiz = async () => {
    setLoading(true);
    setIsCompleted(false);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOptionId(null);
    setIsAnswered(false);

    try {
      const data = await courseApi.getQuiz(courseCode, lessonSlug, 10);
      setQuestions(data || []);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [courseCode, lessonSlug]);

  const currentQ = questions[currentIndex];

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = language.speechLocale;
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const handleSelectOption = (optId: string) => {
    if (isAnswered || !currentQ) return;

    setSelectedOptionId(optId);
    setIsAnswered(true);

    const isCorrect = optId === currentQ.correctOptionId;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      speak(currentQ.term);
    }

    onRecordResult(currentQ.vocabularyId, isCorrect);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500 animate-pulse sm:p-12">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="text-sm font-semibold">Đang chuẩn bị câu hỏi trắc nghiệm...</span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500 sm:p-10">
        Chưa có đủ từ vựng để tạo bài trắc nghiệm.
      </div>
    );
  }

  // Completion Screen
  if (isCompleted) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-xl sm:p-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Trophy size={32} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-1">Hoàn thành bài thi!</h3>
        <p className="text-xs text-slate-500 mb-6">Bạn đã hoàn thành phiên luyện tập trắc nghiệm</p>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6">
          <div className="text-3xl font-black text-[#F05A28] mb-1 font-mono">
            {score} / {questions.length}
          </div>
          <span className="text-xs font-bold text-slate-600">
            Đạt tỉ lệ chính xác: {percent}%
          </span>
        </div>

        <button
          type="button"
          onClick={fetchQuiz}
          className="w-full py-3 px-5 rounded-xl bg-[#F05A28] hover:bg-[#EA580C] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
        >
          <RotateCcw size={16} />
          <span>Luyện tập lại</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-0 sm:px-2">
      {/* Top Header */}
      <div className="mb-3 flex w-full items-center justify-between gap-2 px-1 text-xs font-semibold text-slate-500 sm:mb-4 sm:px-2">
        <span className="bg-slate-100 text-slate-800 font-mono font-bold px-3 py-1 rounded-full border border-slate-200">
          Câu {currentIndex + 1} / {questions.length}
        </span>
        <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
          Điểm số: {score}
        </span>
      </div>

      {/* Question Box */}
      <div className="mb-5 w-full rounded-3xl border-2 border-slate-200 bg-white p-4 text-center shadow-lg sm:mb-6 sm:p-6 md:p-8">
        <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-2">
          Nghĩa của từ vựng này là gì?
        </span>

        <div className="flex items-center justify-center gap-3 my-2">
          <h3 className={`break-words text-3xl font-black text-slate-900 sm:text-5xl ${language.kind === 'english' ? '' : 'font-japanese'}`}>
            {currentQ.term}
          </h3>
          <button
            type="button"
            onClick={() => speak(currentQ.term)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-[#F05A28] transition-all cursor-pointer"
            title="Phát âm"
          >
            <Volume2 size={20} />
          </button>
        </div>

        <div className={`text-sm font-semibold text-[#F05A28] mb-2 ${language.kind === 'english' ? '' : 'font-japanese'}`}>
          {currentQ.reading}
        </div>
        <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600">
          {currentQ.partOfSpeech}
        </span>

        {/* 4 Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrectOption = opt.id === currentQ.correctOptionId;

            let btnClasses =
              'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/90 hover:border-slate-300';

            if (isAnswered) {
              if (isCorrectOption) {
                btnClasses =
                  'bg-emerald-50 text-emerald-900 border-emerald-500 ring-2 ring-emerald-500/20 font-bold';
              } else if (isSelected && !isCorrectOption) {
                btnClasses =
                  'bg-rose-50 text-rose-900 border-rose-500 ring-2 ring-rose-500/20 font-bold';
              } else {
                btnClasses = 'bg-slate-50 text-slate-400 border-slate-100 opacity-60';
              }
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt.id)}
                className={`min-h-[52px] rounded-2xl border-2 px-3 py-3.5 text-left text-sm font-semibold transition-colors duration-200 flex items-center justify-between gap-2 cursor-pointer sm:px-4 ${btnClasses}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-2xs">
                    {opt.id}
                  </span>
                  <span className="min-w-0 break-words whitespace-normal">{opt.text}</span>
                </div>

                {isAnswered && isCorrectOption && (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                )}
                {isAnswered && isSelected && !isCorrectOption && (
                  <XCircle size={18} className="text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Next Question Bar */}
        {isAnswered && (
          <div className="mt-5 flex flex-col items-stretch justify-between gap-3 border-t border-slate-100 pt-4 animate-fadeIn sm:mt-6 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 text-xs font-semibold leading-relaxed text-slate-600">
              {selectedOptionId === currentQ.correctOptionId ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Chính xác!
                </span>
              ) : (
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <XCircle size={14} /> Đáp án đúng là {currentQ.correctOptionId}:{' '}
                  {currentQ.correctMeaning}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#F05A28] cursor-pointer sm:w-auto sm:text-sm"
            >
              <span>{currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400 flex items-center gap-1">
        <Sparkles size={13} className="text-amber-500" />
        <span>Hệ thống tự động điều chỉnh đáp án nhiễu cùng loại từ</span>
      </div>
    </div>
  );
}
