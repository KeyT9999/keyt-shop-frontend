import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Flag,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import type { FEExamDetail } from '../../types/speaking';
import { speakingApi } from '../../api/speakingApi';

interface FEExamRunnerProps {
  courseCode?: string;
  slug: string;
  onExit: () => void;
}

export const FEExamRunner: React.FC<FEExamRunnerProps> = ({
  courseCode = 'jpd123',
  slug,
  onExit
}) => {
  const [examDetail, setExamDetail] = useState<FEExamDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // 60-minute countdown (3600 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(3600);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await speakingApi.getFeExamDetail(courseCode, slug);
        if (isMounted) {
          setExamDetail(data);
          setTimeLeft(data.durationMinutes * 60);
        }
      } catch (err) {
        console.error('Failed to load FE exam detail', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [courseCode, slug]);

  // Timer countdown
  useEffect(() => {
    if (!isSubmitted && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isSubmitted && examDetail) {
      handleSubmit();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isSubmitted, examDetail]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qOrder: number, optionLetter: string) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qOrder]: optionLetter
    }));
  };

  const toggleFlag = (qOrder: number) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [qOrder]: !prev[qOrder]
    }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setIsSubmitted(false);
    setCurrentIndex(0);
    if (examDetail) setTimeLeft(examDetail.durationMinutes * 60);
  };

  if (loading || !examDetail) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang tải đề thi khảo thí...</p>
      </div>
    );
  }

  const questions = examDetail.questions;
  const currentQ = questions[currentIndex];

  // Scoring
  const answeredCount = Object.keys(selectedAnswers).length;
  let correctCount = 0;
  if (isSubmitted) {
    questions.forEach(q => {
      if (selectedAnswers[q.order] === q.correctAnswer) {
        correctCount++;
      }
    });
  }
  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const isPassed = scorePercent >= examDetail.passingScore;

  // Filtered list for navigation palette
  const filteredQuestions = questions.filter(q => {
    if (filterCategory === 'all') return true;
    return q.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 sticky top-4 z-20 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Quay lại danh sách đề thi"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-bold text-[#F05A28] uppercase tracking-wider block">
              Khảo Thí FE JPD123
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
              {examDetail.title}
            </h2>
          </div>
        </div>

        {/* Timer & Submit CTA */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm ${
              timeLeft < 300
                ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-[#F05A28]" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {!isSubmitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-[#F05A28] hover:bg-[#d94819] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Nộp Bài Thi
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1E293B] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Làm lại
            </button>
          )}
        </div>
      </div>

      {/* Result Card (When submitted) */}
      {isSubmitted && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-md animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl shadow-md ${
                  isPassed
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-[#F05A28]'
                }`}
              >
                {scorePercent}%
              </div>
              <div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full uppercase">
                  Kết Quả Đánh Giá FE
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {isPassed ? 'Chúc mừng! Bạn đã ĐẠT' : 'Chưa đạt điểm an toàn'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Đúng: <strong className="text-slate-800">{correctCount}</strong> / {questions.length} câu • Điểm chuẩn qua môn: {examDetail.passingScore}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Làm lại đề này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Examination Layout: Question + Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Current Question Display */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded-lg">
                  Câu {currentQ.order} / {questions.length}
                </span>
                <span className="px-2.5 py-1 bg-orange-50 text-[#F05A28] border border-orange-200 text-xs font-semibold rounded-lg uppercase">
                  {currentQ.category}
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggleFlag(currentQ.order)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  flaggedQuestions[currentQ.order]
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                {flaggedQuestions[currentQ.order] ? 'Đã đánh dấu xem lại' : 'Đánh dấu'}
              </button>
            </div>

            {/* Question Text */}
            <div className="font-japanese text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
              {currentQ.question}
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const optionLetter = ['A', 'B', 'C', 'D'][optIdx] || String.fromCharCode(65 + optIdx);
                const isSelected = selectedAnswers[currentQ.order] === optionLetter;
                const isCorrect = currentQ.correctAnswer === optionLetter;

                let btnStyles = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300';
                if (isSelected) {
                  btnStyles = 'bg-orange-50 border-[#F05A28] text-[#F05A28] shadow-sm';
                }

                if (isSubmitted) {
                  if (isCorrect) {
                    btnStyles = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyles = 'bg-rose-50 border-rose-400 text-rose-900';
                  } else {
                    btnStyles = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(currentQ.order, optionLetter)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${btnStyles}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-[#F05A28] text-white'
                          : 'bg-white border border-slate-300 text-slate-600'
                      }`}
                    >
                      {optionLetter}
                    </span>
                    <span className="font-japanese text-base font-medium flex-1 pt-0.5">
                      {opt}
                    </span>
                    {isSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation when submitted */}
            {isSubmitted && (
              <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1.5 animate-in fade-in duration-200">
                <span className="text-xs font-bold uppercase text-blue-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Đáp án &amp; Giải thích chi tiết:
                </span>
                <p className="text-sm text-slate-800 font-medium leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Question Nav Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Câu trước
              </button>

              <span className="text-xs font-semibold text-slate-400">
                {currentIndex + 1} / {questions.length}
              </span>

              <button
                type="button"
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
              >
                Câu tiếp theo <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Palette & Category Filters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase text-slate-700 tracking-wider">
                Bảng Câu Hỏi ({answeredCount}/{questions.length})
              </h3>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'grammar', label: 'Ngữ pháp' },
                { id: 'vocabulary', label: 'Từ vựng' },
                { id: 'kanji', label: 'Hán tự' },
                { id: 'particles', label: 'Trợ từ' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    filterCategory === cat.id
                      ? 'bg-[#F05A28] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Palette Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-[360px] overflow-y-auto p-1">
              {filteredQuestions.map((q) => {
                const idx = questions.findIndex(orig => orig.order === q.order);
                const isSelected = selectedAnswers[q.order] !== undefined;
                const isFlagged = flaggedQuestions[q.order];
                const isCurrent = currentIndex === idx;
                const isCorrect = selectedAnswers[q.order] === q.correctAnswer;

                let cellStyles = 'bg-slate-100 text-slate-700 hover:bg-slate-200';

                if (isSelected) {
                  cellStyles = 'bg-orange-100 text-[#F05A28] font-bold border border-orange-300';
                }

                if (isFlagged) {
                  cellStyles += ' ring-2 ring-amber-400';
                }

                if (isCurrent) {
                  cellStyles += ' ring-2 ring-slate-900 shadow-md scale-105';
                }

                if (isSubmitted) {
                  if (isCorrect) {
                    cellStyles = 'bg-emerald-500 text-white font-bold';
                  } else {
                    cellStyles = 'bg-rose-500 text-white font-bold';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer relative ${cellStyles}`}
                  >
                    {q.order}
                    {isFlagged && !isSubmitted && (
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full absolute top-1 right-1"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Palette Legend */}
            <div className="pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-orange-100 border border-orange-300"></span>
                <span>Đã trả lời ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-100"></span>
                <span>Chưa trả lời ({questions.length - answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-white border border-amber-400 ring-2 ring-amber-400"></span>
                <span>Đã đánh dấu xem lại</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
