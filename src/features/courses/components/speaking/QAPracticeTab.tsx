import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  Timer,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Image as ImageIcon,
  RotateCcw,
  AudioWaveform,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Layers,
  Lightbulb,
  Compass,
  ArrowRight,
  Flame,
  FileQuestion,
  GraduationCap
} from 'lucide-react';

import type { SpeakingQuestion, QAEvaluationResult, QALessonOverview } from '../../types/speaking';
import { QA_LESSON_OVERVIEWS, ALL_QA_QUESTIONS } from '../../data/speakingQAQuestionsData';
import { speakingApi } from '../../api/speakingApi';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

export interface QAPracticeTabProps {
  questions?: SpeakingQuestion[];
  courseCode?: string;
}

export function QAPracticeTab({
  questions: initialQuestions,
  courseCode = 'jpd123'
}: QAPracticeTabProps) {
  // Questions data
  const [questions, setQuestions] = useState<SpeakingQuestion[]>(
    initialQuestions && initialQuestions.length > 0 ? initialQuestions : ALL_QA_QUESTIONS
  );


  // Active Lesson (4, 5, 6, 7)
  const [selectedLesson, setSelectedLesson] = useState<number>(4);

  // Active Mode: 'reflex' (Vấn đáp không tranh) vs 'image' (Vấn đáp có tranh)
  const [activeMode, setActiveMode] = useState<'reflex' | 'image'>('reflex');

  // Active Part within the lesson (0 = all, 1, 2, 3, 4)
  const [selectedPart, setSelectedPart] = useState<number>(1);

  // Overview Drawer / Modal state
  const [showOverviewModal, setShowOverviewModal] = useState<boolean>(false);

  // Question navigation
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [activeAnswerLevel, setActiveAnswerLevel] = useState<'level1' | 'level2' | 'level3'>('level2');
  const [showFurigana, setShowFurigana] = useState<boolean>(true);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(true);

  // Listen count (Max 3 times per FPT exam rules)
  const [listenCount, setListenCount] = useState<number>(0);

  // 10s thinking countdown
  const [thinkTimeLeft, setThinkTimeLeft] = useState<number>(10);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // AI Evaluation state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [qaResult, setQaResult] = useState<QAEvaluationResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Speech & Audio
  const { isPlaying, speak, stop: stopAudio } = useSpeechSynthesis();
  const {
    isRecording,
    duration,
    volumeLevel,
    startRecording,
    stopRecording,
    resetAudio
  } = useAudioRecorder();

  // Fetch from API in background if needed
  useEffect(() => {
    let isMounted = true;
    const fetchQuestions = async () => {
      try {
        const data = await speakingApi.getQAQuestions(courseCode);
        if (isMounted && data && data.length > 0) {
          setQuestions(data);
        }
      } catch (err) {
        console.warn('Backend questions load warning, using local dataset:', err);
      }
    };
    fetchQuestions();
    return () => {
      isMounted = false;
    };
  }, [courseCode]);

  // Current Lesson Overview object
  const currentOverview: QALessonOverview = useMemo(() => {
    return (
      QA_LESSON_OVERVIEWS.find((o) => o.lesson === selectedLesson) ||
      QA_LESSON_OVERVIEWS[0]
    );
  }, [selectedLesson]);

  // Filter questions according to Lesson, Mode, and Part
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (q.lesson !== selectedLesson) return false;
      if (activeMode === 'image') {
        return q.hasImage;
      }
      // reflex (non-image) mode
      if (q.hasImage) return false;
      if (selectedPart > 0 && q.part !== undefined) {
        return q.part === selectedPart;
      }
      return true;
    });
  }, [questions, selectedLesson, activeMode, selectedPart]);

  // Ensure current index is within bounds
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedLesson, activeMode, selectedPart]);

  const currentQuestion: SpeakingQuestion | undefined = filteredQuestions[currentIndex] || filteredQuestions[0];

  // Reset states on question change
  useEffect(() => {
    setListenCount(0);
    setIsThinking(false);
    setThinkTimeLeft(10);
    setShowAnswer(false);
    resetAudio();
    setQaResult(null);
    setEvalError(null);
    stopAudio();
  }, [currentIndex, selectedLesson, activeMode, selectedPart]);

  // 10s countdown timer
  useEffect(() => {
    let timer: any;
    if (isThinking && thinkTimeLeft > 0) {
      timer = setInterval(() => {
        setThinkTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (thinkTimeLeft === 0 && isThinking) {
      setIsThinking(false);
    }
    return () => clearInterval(timer);
  }, [isThinking, thinkTimeLeft]);

  const handlePlayQuestionAudio = useCallback(() => {
    if (!currentQuestion) return;
    if (listenCount >= 3) return;
    setListenCount((prev) => prev + 1);
    stopAudio();
    speak(currentQuestion.questionJapanese, 1.0, () => {
      // Trigger 10s thinking timer once question finishes playing
      setThinkTimeLeft(10);
      setIsThinking(true);
    });
  }, [currentQuestion, listenCount, stopAudio, speak]);

  const handleStartRecording = async () => {
    stopAudio();
    setQaResult(null);
    setEvalError(null);
    setIsThinking(false);
    await startRecording();
  };

  const handleStopAndEvaluate = async () => {
    try {
      const blob = await stopRecording();
      if (!blob || !currentQuestion) return;

      setIsEvaluating(true);
      setEvalError(null);

      const result = await speakingApi.evaluateQA(
        courseCode,
        blob,
        currentQuestion.questionJapanese,
        currentQuestion.keywords || [],
        currentQuestion.grammarPattern || '',
        currentQuestion.answers
      );

      setQaResult(result);
    } catch (err: any) {
      console.error('QA evaluation failed:', err);
      setEvalError(
        err.response?.data?.message ||
        err.message ||
        'Không thể chấm điểm câu trả lời. Vui lòng đảm bảo dịch vụ AI Speech đang chạy.'
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleResetAnswer = () => {
    resetAudio();
    setQaResult(null);
    setEvalError(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') {
        if (currentIndex < filteredQuestions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        handlePlayQuestionAudio();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredQuestions.length, handlePlayQuestionAudio]);

  const ansObj = currentQuestion ? (
    activeAnswerLevel === 'level1'
      ? currentQuestion.answers.level1_short
      : activeAnswerLevel === 'level3'
      ? currentQuestion.answers.level3_expanded
      : currentQuestion.answers.level2_polite
  ) : null;

  return (
    <div className="space-y-6">
      {/* 4 LESSON CARDS SELECTOR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F05A28]"></span>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              Danh sách bài vấn đáp JPD123
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            4 bài học trọng tâm chuẩn kỳ thi FE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {QA_LESSON_OVERVIEWS.map((ov) => {
            const isSelected = selectedLesson === ov.lesson;
            return (
              <div
                key={ov.lesson}
                onClick={() => {
                  setSelectedLesson(ov.lesson);
                  setSelectedPart(1);
                  setCurrentIndex(0);
                }}
                className={`group relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-orange-50/70 to-white border-[#F05A28] shadow-md ring-2 ring-[#F05A28]/20'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isSelected
                          ? 'bg-[#F05A28] text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      <span>🌸 桜花</span>
                      <span>Lesson {ov.lesson}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {ov.nonImageCount} câu
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {ov.title}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {ov.description}
                  </p>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                      isSelected ? 'text-[#F05A28]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    <span>{isSelected ? 'Đang luyện tập' : 'Sẵn sàng học'}</span>
                  </span>
                  <ArrowRight
                    size={14}
                    className={`transition-transform ${
                      isSelected
                        ? 'text-[#F05A28] translate-x-0.5'
                        : 'text-slate-300 group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LESSON BANNER & OVERVIEW TOGGLE */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#1E293B] text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F05A28]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F05A28] text-white">
                🌸 桜 Vấn đáp - Bài {currentOverview.lesson}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/90">
                {currentOverview.subtitle}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                15 điểm / câu FE
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currentOverview.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {currentOverview.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowOverviewModal(true)}
            className="self-start md:self-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-xs"
          >
            <BookOpen size={14} className="text-orange-400" />
            <span>Mục tiêu & Ngữ pháp trọng tâm</span>
          </button>
        </div>

        {/* QUICK STATS BAR */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Không tranh</span>
            <span className="font-bold text-white text-sm">
              {currentOverview.nonImageCount} câu hỏi phản xạ
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Có tranh miêu tả</span>
            <span className="font-bold text-amber-300 text-sm">
              {currentOverview.imageCount > 0
                ? `${currentOverview.imageCount} câu thi thử`
                : 'Luyện phản xạ'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Phân loại chủ đề</span>
            <span className="font-bold text-white text-sm">
              {currentOverview.parts.length} phần trọng tâm
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Thời gian suy nghĩ</span>
            <span className="font-bold text-emerald-400 text-sm">
              Tối đa 10 giây
            </span>
          </div>
        </div>
      </div>

      {/* MODE SELECTOR (Chế độ 1 vs Chế độ 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-slate-100/80 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveMode('reflex');
              setSelectedPart(1);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeMode === 'reflex'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileQuestion size={15} className={activeMode === 'reflex' ? 'text-[#F05A28]' : ''} />
            <span>Chế độ 1: Vấn đáp không tranh ({currentOverview.nonImageCount} câu)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('image');
              setSelectedPart(0);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeMode === 'image'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ImageIcon size={15} className={activeMode === 'image' ? 'text-amber-500' : ''} />
            <span>
              Chế độ 2: Vấn đáp có tranh{' '}
              {currentOverview.imageCount > 0 ? `(${currentOverview.imageCount} câu)` : ''}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 px-2">
          <span>Phím tắt:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-700">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-700">→</kbd>
          <span>đổi câu,</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-700">Space</kbd>
          <span>nghe</span>
        </div>
      </div>

      {/* PART SUB-TABS (When in reflex mode) */}
      {activeMode === 'reflex' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {currentOverview.parts.map((p) => {
              const isPartActive = selectedPart === p.part;
              return (
                <button
                  key={p.part}
                  type="button"
                  onClick={() => setSelectedPart(p.part)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isPartActive
                      ? 'bg-[#F05A28] text-white border-[#F05A28] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Layers size={13} />
                  <span>{p.title.split(' - ')[0]}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isPartActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {p.questionCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Part Goal description */}
          {selectedPart > 0 && (
            <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/70 text-xs text-slate-700 flex items-start gap-2.5">
              <Lightbulb size={15} className="text-[#F05A28] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#F05A28] block">
                  {currentOverview.parts.find((p) => p.part === selectedPart)?.title}
                </span>
                <p className="mt-0.5 text-slate-600">
                  {currentOverview.parts.find((p) => p.part === selectedPart)?.goal}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MAIN QUESTION INTERACTION CARD */}
      {!currentQuestion ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <AlertCircle size={36} className="mx-auto text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">
            Không tìm thấy câu hỏi phù hợp cho lựa chọn này.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveMode('reflex');
              setSelectedPart(1);
            }}
            className="px-4 py-2 rounded-xl bg-[#F05A28] text-white text-xs font-bold cursor-pointer"
          >
            Quay lại Phần 1
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-6">
          {/* Top Bar: Question Index, Badges, Thinking Timer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
                Câu {currentIndex + 1} / {filteredQuestions.length}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#F05A28] border border-orange-200/60">
                Bài {currentQuestion.lesson}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Thang điểm: 15đ FE
              </span>
              {currentQuestion.hasImage && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <ImageIcon size={13} />
                  <span>Câu hỏi có tranh (Đề B - Câu 1)</span>
                </span>
              )}
            </div>

            {/* Thinking Timer Pill */}
            <div className="flex items-center gap-2">
              {isThinking ? (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold animate-pulse">
                  <Timer size={14} className="text-amber-600" />
                  <span>Suy nghĩ: {thinkTimeLeft}s (Tối đa 10s)</span>
                </div>
              ) : (
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Timer size={13} />
                  <span>Chuẩn phòng thi: Trả lời trong vòng 10s</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Navigator Bar (Pills 1..N) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {filteredQuestions.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center justify-center border ${
                  idx === currentIndex
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Image Scenario Box (If applicable) */}
          {currentQuestion.hasImage && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border-2 border-amber-200 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
                <ImageIcon size={34} />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase text-amber-800 tracking-wider flex items-center gap-1">
                  <Flame size={12} className="text-amber-600" />
                  <span>Dữ liệu hình ảnh trong đề thi (Bắt buộc trả lời đúng số liệu):</span>
                </span>
                <p className="text-sm font-semibold text-slate-800 leading-snug">
                  {currentQuestion.imageDescription}
                </p>
                <p className="text-[11px] text-amber-700/90 italic">
                  * Mẹo: Trả lời đúng ngữ pháp nhưng sai dữ liệu hình ảnh sẽ bị trừ 5 điểm!
                </p>
              </div>
            </div>
          )}

          {/* Question Text in Japanese */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-50/40 via-white to-amber-50/30 border-2 border-orange-200/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28] flex items-center gap-1.5">
                <Compass size={14} />
                <span>Giám khảo hỏi:</span>
              </span>

              {/* Listen Counter (Max 3) */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400">Số lần nghe:</span>
                <span
                  className={`font-black px-2 py-0.5 rounded-full text-xs ${
                    listenCount >= 3
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {listenCount}/3 lần
                </span>
              </div>
            </div>

            <p className="text-2xl sm:text-3xl font-black font-japanese text-slate-900 tracking-wide leading-relaxed">
              {currentQuestion.questionJapanese}
            </p>

            {showFurigana && (
              <p className="text-xs font-japanese text-[#F05A28] font-medium tracking-wide">
                【{currentQuestion.questionFurigana}】
              </p>
            )}

            {showVietnamese && (
              <p className="text-sm font-medium text-slate-600 pt-2.5 border-t border-slate-200/70">
                Dịch nghĩa: <strong className="text-slate-800">{currentQuestion.questionVietnamese}</strong>
              </p>
            )}
          </div>

          {/* Controls: Audio, Toggles, Recording */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={listenCount >= 3}
                onClick={handlePlayQuestionAudio}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  listenCount >= 3
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : isPlaying
                    ? 'bg-slate-800 text-white'
                    : 'bg-[#F05A28] hover:bg-[#d94817] text-white'
                }`}
              >
                <Volume2 size={15} />
                <span>{isPlaying ? 'Đang phát...' : `Nghe câu hỏi (${3 - listenCount} lần còn)`}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFurigana(!showFurigana)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                  showFurigana
                    ? 'bg-orange-50 text-[#F05A28] border-orange-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                Furigana
              </button>

              <button
                type="button"
                onClick={() => setShowVietnamese(!showVietnamese)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                  showVietnamese
                    ? 'bg-orange-50 text-[#F05A28] border-orange-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                Dịch nghĩa
              </button>

              {(qaResult || evalError) && (
                <button
                  type="button"
                  onClick={handleResetAnswer}
                  className="px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border bg-white text-slate-600 border-slate-200 hover:border-slate-300 flex items-center gap-1"
                >
                  <RotateCcw size={13} />
                  <span>Làm lại</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs w-full sm:w-auto"
                >
                  <Mic size={15} className="text-orange-400" />
                  <span>Thu âm trả lời (15đ)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopAndEvaluate}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs animate-pulse w-full sm:w-auto"
                >
                  <MicOff size={15} />
                  <span>Dừng & Chấm điểm ({formatTime(duration)})</span>
                </button>
              )}
            </div>
          </div>

          {/* RECORDING / EVALUATING STATUS */}
          {isRecording && (
            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                <AudioWaveform size={16} className="text-red-600 animate-pulse" />
                <span className="font-bold">Đang ghi âm câu trả lời... (Âm lượng: {Math.round(volumeLevel * 100)}%)</span>
              </div>
              <div className="font-mono font-bold text-red-800">{formatTime(duration)}</div>
            </div>
          )}

          {isEvaluating && (
            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 text-xs text-[#F05A28] flex items-center gap-2.5">
              <div className="w-4 h-4 border-2 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
              <span className="font-bold">AI đang phân tích âm thanh và chấm điểm phản xạ (15đ)...</span>
            </div>
          )}

          {evalError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Lỗi chấm điểm:</strong>
                <p>{evalError}</p>
              </div>
            </div>
          )}

          {/* AI EVALUATION RESULT BOX */}
          {qaResult && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border-2 border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-600" />
                  <span className="text-xs font-bold uppercase text-emerald-800 tracking-wider">
                    Kết quả đánh giá AI (Phần Q&amp;A Đề B)
                  </span>
                </div>
                <div className="text-lg font-black text-emerald-700">
                  {qaResult.score} / {qaResult.maxScore} điểm
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs space-y-1">
                <span className="text-slate-400 block text-[11px]">Nội dung AI nghe được:</span>
                <p className="font-japanese font-bold text-slate-800 text-sm">
                  {qaResult.transcript || '(Chưa nhận diện được giọng nói)'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100">
                  <span className="text-slate-500 block text-[11px]">Độ tương đồng mẫu câu:</span>
                  <span className="font-bold text-slate-800">
                    {qaResult.matchedLevel === 'level3'
                      ? '⭐ Level 3 (Mở rộng ghi điểm)'
                      : qaResult.matchedLevel === 'level2'
                      ? '✅ Level 2 (Chuẩn lịch sự)'
                      : qaResult.matchedLevel === 'level1'
                      ? '⚡ Level 1 (Ngắn gọn)'
                      : 'Chưa đạt chuẩn'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100">
                  <span className="text-slate-500 block text-[11px]">Đuôi câu lịch sự:</span>
                  <span className="font-bold text-slate-800">
                    {qaResult.hasPoliteEnding ? '✅ Đạt chuẩn (+です/+ます)' : '⚠️ Cần thêm です/ます'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-emerald-100 text-xs text-slate-700">
                <span className="font-bold text-emerald-800 block mb-0.5">Nhận xét từ Giám khảo AI:</span>
                <p>{qaResult.feedback}</p>
              </div>
            </div>
          )}

          {/* 3-LEVEL MODEL ANSWERS ACCORDION */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAnswer(!showAnswer)}
                className="flex items-center gap-2 text-xs font-bold text-[#F05A28] hover:text-[#d94817] cursor-pointer"
              >
                {showAnswer ? <EyeOff size={15} /> : <Eye size={15} />}
                <span>{showAnswer ? 'Ẩn câu trả lời mẫu 3 cấp độ' : 'Xem câu trả lời mẫu 3 cấp độ (Gợi ý thi)'}</span>
              </button>

              <div className="text-xs text-slate-400 font-medium">
                Mẫu câu: <code className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{currentQuestion.grammarPattern}</code>
              </div>
            </div>

            {showAnswer && ansObj && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                {/* 3 Level Tabs */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-200/70 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveAnswerLevel('level1')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                      activeAnswerLevel === 'level1'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Level 1: Ngắn gọn
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAnswerLevel('level2')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                      activeAnswerLevel === 'level2'
                        ? 'bg-white text-[#F05A28] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Level 2: Chuẩn lịch sự
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAnswerLevel('level3')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                      activeAnswerLevel === 'level3'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Level 3: Mở rộng (Tối đa điểm)
                  </button>
                </div>

                {/* Active Level Content */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      {activeAnswerLevel === 'level1'
                        ? 'Câu trả lời an toàn, ngắn gọn (Đủ ý):'
                        : activeAnswerLevel === 'level2'
                        ? 'Câu trả lời chuẩn mực đề xuất trong phòng thi:'
                        : 'Câu trả lời mở rộng, tạo ấn tượng điểm cao với Giám Khảo:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => speak(ansObj.japanese)}
                      className="text-xs text-[#F05A28] hover:underline cursor-pointer flex items-center gap-1 font-bold"
                    >
                      <Volume2 size={13} />
                      <span>Nghe phát âm</span>
                    </button>
                  </div>

                  <p className="text-xl font-bold font-japanese text-slate-900">
                    {ansObj.japanese}
                  </p>

                  <p className="text-xs font-japanese text-[#F05A28]">
                    【{ansObj.reading}】
                  </p>

                  <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                    Ý nghĩa: <strong className="text-slate-800">{ansObj.vietnamese}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM PREV / NEXT NAVIGATION */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                currentIndex === 0
                  ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 cursor-pointer shadow-xs'
              }`}
            >
              <ChevronLeft size={16} />
              <span>Câu trước</span>
            </button>

            <span className="text-xs font-semibold text-slate-500">
              Câu {currentIndex + 1} / {filteredQuestions.length} ({currentOverview.title.split(' - ')[0]})
            </span>

            <button
              type="button"
              disabled={currentIndex >= filteredQuestions.length - 1}
              onClick={() =>
                setCurrentIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1))
              }
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                currentIndex >= filteredQuestions.length - 1
                  ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                  : 'bg-[#F05A28] text-white border-[#F05A28] hover:bg-[#d94817] cursor-pointer shadow-xs'
              }`}
            >
              <span>Câu tiếp</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* OVERVIEW MODAL / DRAWER (Mục tiêu, Ngữ pháp, Mẹo thi) */}
      {showOverviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F05A28] text-white">
                  Bài {currentOverview.lesson}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {currentOverview.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOverviewModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Overview Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tổng quan bài học
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                {currentOverview.description}
              </p>
            </div>

            {/* Can Do Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <GraduationCap size={14} className="text-[#F05A28]" />
                <span>Sinh viên có thể (Chuẩn đầu ra Can-Do)</span>
              </h4>
              <div className="space-y-1.5">
                {currentOverview.canDo.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70 text-xs text-slate-800"
                  >
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grammar Focus */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen size={14} className="text-[#F05A28]" />
                <span>Trọng tâm ngữ pháp (Grammar Focus)</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentOverview.grammarFocus.map((pattern, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 font-mono"
                  >
                    {pattern}
                  </span>
                ))}
              </div>
            </div>

            {/* Exam Tips Box */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold uppercase tracking-wider">
                <Flame size={14} className="text-amber-600" />
                <span>Mẹo thi vấn đáp đạt điểm tối đa:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {currentOverview.tips}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowOverviewModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#F05A28] text-white text-xs font-bold cursor-pointer hover:bg-[#d94817] shadow-xs"
              >
                Đã hiểu & Bắt đầu luyện
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
