import { useState, useEffect } from 'react';
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
  XCircle
} from 'lucide-react';

import type { SpeakingQuestion, QAEvaluationResult } from '../../types/speaking';
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
  const [questions, setQuestions] = useState<SpeakingQuestion[]>(initialQuestions || []);
  const [loading, setLoading] = useState<boolean>(!initialQuestions || initialQuestions.length === 0);
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<number | 'all' | 'image'>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [activeAnswerLevel, setActiveAnswerLevel] = useState<'level1' | 'level2' | 'level3'>('level2');

  // Listen count (Max 3 times per FPT exam rules)
  const [listenCount, setListenCount] = useState<number>(0);

  // 10s thinking countdown
  const [thinkTimeLeft, setThinkTimeLeft] = useState<number>(10);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // AI Evaluation state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [qaResult, setQaResult] = useState<QAEvaluationResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await speakingApi.getQAQuestions(courseCode);
        if (isMounted) {
          setQuestions(data);
        }
      } catch (err) {
        console.error('Failed to load QA questions', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchQuestions();
    return () => {
      isMounted = false;
    };
  }, [initialQuestions, courseCode]);

  const { isPlaying, speak, stop: stopAudio } = useSpeechSynthesis();
  const {
    isRecording,
    duration,
    volumeLevel,
    audioUrl,
    error: recorderError,
    isSupported: isMicSupported,
    startRecording,
    stopRecording,
    resetAudio
  } = useAudioRecorder();

  // Filtered list
  const filteredQuestions = questions.filter((q) => {
    if (selectedLessonFilter === 'all') return true;
    if (selectedLessonFilter === 'image') return q.hasImage;
    return q.lesson === selectedLessonFilter;
  });

  const currentQuestion = filteredQuestions[currentIndex] || filteredQuestions[0];

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
  }, [currentIndex, selectedLessonFilter]);

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

  const handlePlayQuestionAudio = () => {
    if (listenCount >= 3) return;
    setListenCount((prev) => prev + 1);
    stopAudio();
    speak(currentQuestion.questionJapanese, 1.0, () => {
      // Trigger 10s thinking timer
      setThinkTimeLeft(10);
      setIsThinking(true);
    });
  };

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

  if (loading || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang tải ngân hàng câu hỏi Q&amp;A Đề B...</p>
      </div>
    );
  }

  const ansObj =
    activeAnswerLevel === 'level1'
      ? currentQuestion.answers.level1_short
      : activeAnswerLevel === 'level3'
      ? currentQuestion.answers.level3_expanded
      : currentQuestion.answers.level2_polite;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Lesson Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => {
            setSelectedLessonFilter('all');
            setCurrentIndex(0);
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer border ${
            selectedLessonFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          Tất cả ({questions.length} câu)
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedLessonFilter('image');
            setCurrentIndex(0);
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer border flex items-center gap-1 ${
            selectedLessonFilter === 'image'
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          <ImageIcon size={13} />
          <span>Có tranh miêu tả</span>
        </button>

        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lessonNum) => (
          <button
            key={lessonNum}
            type="button"
            onClick={() => {
              setSelectedLessonFilter(lessonNum);
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer border ${
              selectedLessonFilter === lessonNum
                ? 'bg-[#F05A28] text-white border-[#F05A28]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            Bài {lessonNum}
          </button>
        ))}
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
              Câu {currentIndex + 1} / {filteredQuestions.length}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#F05A28] border border-orange-200/60">
              Bài {currentQuestion.lesson}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Rubric: 15đ FE
            </span>
            {currentQuestion.hasImage && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <ImageIcon size={13} />
                <span>Câu Hỏi Có Tranh (Đề B - Câu 1)</span>
              </span>
            )}
          </div>

          {/* Thinking Timer Pill */}
          <div className="flex items-center gap-2">
            {isThinking ? (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold animate-pulse">
                <Timer size={14} className="text-amber-600" />
                <span>Suy nghĩ: {thinkTimeLeft}s (Không quá 10s)</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-medium">
                Quy định phòng thi: Suy nghĩ không quá 10s
              </div>
            )}
          </div>
        </div>

        {/* Image Display if applicable */}
        {currentQuestion.hasImage && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
              <ImageIcon size={32} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-amber-700 tracking-wider block mb-0.5">
                Mô tả hình ảnh trong phòng thi:
              </span>
              <p className="text-sm font-semibold text-slate-800 leading-snug">
                {currentQuestion.imageDescription}
              </p>
            </div>
          </div>
        )}

        {/* Question Text in Japanese */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-50/30 to-amber-50/30 border-2 border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28]">
              Giám Thị Hỏi:
            </span>

            {/* Listen Counter (Max 3) */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Đã nghe:</span>
              <span
                className={`font-black ${
                  listenCount >= 3 ? 'text-red-500' : 'text-slate-800'
                }`}
              >
                {listenCount}/3 lần
              </span>
            </div>
          </div>

          <p className="text-2xl sm:text-3xl font-black font-japanese text-slate-900 tracking-wide">
            {currentQuestion.questionJapanese}
          </p>

          <p className="text-xs font-japanese text-[#F05A28] font-medium">
            【{currentQuestion.questionFurigana}】
          </p>

          <p className="text-sm font-medium text-slate-600 pt-2 border-t border-slate-200/60">
            Dịch nghĩa: <strong className="text-slate-800">{currentQuestion.questionVietnamese}</strong>
          </p>
        </div>

        {/* Audio Speaker & Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            disabled={listenCount >= 3}
            onClick={handlePlayQuestionAudio}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
              listenCount >= 3
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Volume2 size={16} />
            <span>
              {isPlaying
                ? 'Đang phát câu hỏi...'
                : listenCount >= 3
                ? 'Đã hết 3 lượt nghe'
                : 'Nghe Giám Thị Hỏi'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {showAnswer ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>{showAnswer ? 'Ẩn Gợi Ý Đáp Án' : 'Xem Gợi Ý Đáp Án'}</span>
          </button>
        </div>

        {/* Voice Recording Box */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Mic size={16} className="text-[#F05A28]" />
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                  Trả Lời Bằng Giọng Nói (AI Speech Chấm Barem 15đ)
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {isRecording
                  ? 'Đang thu âm câu trả lời của bạn... Hãy nói to, dùng thể lịch sự です/ます.'
                  : isEvaluating
                  ? 'AI đang phân tích câu trả lời, từ khóa và thể lịch sự...'
                  : 'Bấm nút để trả lời câu hỏi giám thị bằng giọng nói của bạn.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isMicSupported ? (
                <>
                  {!isRecording ? (
                    <button
                      type="button"
                      disabled={isEvaluating}
                      onClick={handleStartRecording}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F05A28] text-white text-xs font-bold hover:bg-orange-600 transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Mic size={16} />
                      <span>Bật Micro Trả Lời</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopAndEvaluate}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all cursor-pointer shadow-md animate-pulse"
                    >
                      <MicOff size={16} />
                      <span>Dừng & Chấm Điểm ({formatTime(duration)})</span>
                    </button>
                  )}

                  {(audioUrl || qaResult) && !isRecording && (
                    <button
                      type="button"
                      onClick={handleResetAnswer}
                      className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Thu âm lại"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                </>
              ) : (
                <div className="text-xs text-amber-300 flex items-center gap-1.5">
                  <AlertCircle size={15} />
                  <span>Trình duyệt không hỗ trợ microphone.</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Waveform when Recording */}
          {isRecording && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
                <span className="text-xs font-mono font-bold text-red-400">
                  REC: {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 h-8">
                {[...Array(16)].map((_, i) => {
                  const dynamicHeight = Math.max(
                    15,
                    Math.min(100, (volumeLevel * (0.6 + ((i * 17) % 50) / 100)))
                  );
                  return (
                    <div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-[#F05A28] to-amber-400 rounded-full transition-all duration-75"
                      style={{ height: `${dynamicHeight}%` }}
                    ></div>
                  );
                })}
              </div>

              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                Âm lượng: {volumeLevel}%
              </span>
            </div>
          )}

          {/* Evaluating State */}
          {isEvaluating && (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-slate-200">
                AI đang nhận diện giọng nói và chấm điểm theo barem FPT...
              </span>
            </div>
          )}

          {/* Error Message */}
          {(recorderError || evalError) && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{recorderError || evalError}</span>
            </div>
          )}

          {/* Audio Player of user's answer */}
          {audioUrl && !isRecording && (
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AudioWaveform size={15} className="text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  Câu trả lời đã ghi âm ({formatTime(duration || 0)}):
                </span>
              </div>
              <audio src={audioUrl} controls className="h-8 max-w-full sm:max-w-xs" />
            </div>
          )}
        </div>

        {/* AI Q&A Evaluation Result Box */}
        {qaResult && (
          <div className="p-6 rounded-3xl bg-slate-50 border-2 border-orange-200/90 space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-4">
                {/* Score Pill */}
                <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 text-white shadow-md border-2 border-orange-500/40 shrink-0">
                  <span className="text-[10px] font-bold text-orange-400 uppercase">Điểm Câu</span>
                  <span className="text-2xl font-black">{qaResult.score}</span>
                  <span className="text-[10px] text-slate-400">/ 15đ</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        qaResult.matchedLevel === 'level3'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : qaResult.matchedLevel === 'level2'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}
                    >
                      {qaResult.matchedLevel === 'level3'
                        ? 'Cấp 3: Mở Rộng Điểm Cao ⭐'
                        : qaResult.matchedLevel === 'level2'
                        ? 'Cấp 2: Lịch Sự Chuẩn Barem'
                        : 'Cấp 1: Ngắn Gọn Cơ Bản'}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                        qaResult.hasPoliteEnding
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {qaResult.hasPoliteEnding ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Thể lịch sự (です/ます)</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={13} />
                          <span>Thiếu đuôi lịch sự</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {qaResult.feedback}
                  </p>
                </div>
              </div>
            </div>

            {/* Spoken text recognized */}
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
                Văn bản nhận diện từ giọng nói (faster-whisper):
              </span>
              <p className="font-japanese text-base font-bold text-slate-900">
                {qaResult.transcript || '(Không ghi nhận được âm thanh rõ ràng)'}
              </p>
            </div>

            {/* Keywords Checklist */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Từ Khóa Trọng Tâm Được Giám Thị Chấm:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentQuestion.keywords.map((kw, i) => {
                  const isMatched = qaResult.matchedKeywords.includes(kw);
                  return (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                        isMatched
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {isMatched ? (
                        <CheckCircle2 size={13} className="text-emerald-600" />
                      ) : (
                        <XCircle size={13} className="text-slate-400" />
                      )}
                      <span>{kw}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3-Level Suggested Answers */}
        {showAnswer && (
          <div className="p-6 rounded-3xl bg-white border-2 border-orange-200 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#F05A28]" />
                <span>3 Cấp Độ Trả Lời Chuẩn Barem FPT:</span>
              </span>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveAnswerLevel('level1')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeAnswerLevel === 'level1'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Cấp 1: Ngắn Gọn
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAnswerLevel('level2')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeAnswerLevel === 'level2'
                      ? 'bg-[#F05A28] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Cấp 2: Lịch Sự
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAnswerLevel('level3')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeAnswerLevel === 'level3'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Cấp 3: Mở Rộng ⭐
                </button>
              </div>
            </div>

            {/* Answer Display */}
            <div className="p-4 rounded-2xl bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xl font-black font-japanese text-slate-900">
                  {ansObj.japanese}
                </div>
                <button
                  type="button"
                  onClick={() => speak(ansObj.japanese, 0.9)}
                  className="p-2 rounded-xl bg-white text-slate-600 hover:text-[#F05A28] border border-slate-200 shadow-xs transition-colors cursor-pointer"
                  title="Nghe phát âm đáp án"
                >
                  <Volume2 size={16} />
                </button>
              </div>

              <div className="text-xs font-japanese text-[#F05A28] font-semibold">
                【{ansObj.reading}】
              </div>

              <div className="text-sm text-slate-600 font-medium">
                Dịch: <strong className="text-slate-800">{ansObj.vietnamese}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            <span>Câu trước</span>
          </button>

          <button
            type="button"
            disabled={currentIndex === filteredQuestions.length - 1}
            onClick={() => setCurrentIndex((i) => Math.min(filteredQuestions.length - 1, i + 1))}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Câu sau</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default QAPracticeTab;
