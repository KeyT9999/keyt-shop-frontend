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
  Image as ImageIcon
} from 'lucide-react';
import type { SpeakingQuestion } from '../../types/speaking';
import { speakingApi } from '../../api/speakingApi';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

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
    isSupported: isMicSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

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
    resetTranscript();
    stopAudio();
    if (isListening) stopListening();
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
      // Auto prompt mic
      if (isMicSupported && !isListening) startListening();
    }
    return () => clearInterval(timer);
  }, [isThinking, thinkTimeLeft, isMicSupported, isListening, startListening]);

  if (loading || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang tải ngân hàng câu hỏi Q&amp;A Đề B...</p>
      </div>
    );
  }

  const handlePlayQuestionAudio = () => {
    if (!currentQuestion) return;
    if (listenCount >= 3) return;

    setListenCount((c) => c + 1);
    speak(currentQuestion.questionJapanese, 0.9);
    // Start 10s thinking timer
    setIsThinking(true);
    setThinkTimeLeft(10);
  };

  const handleFilterChange = (val: number | 'all' | 'image') => {
    setSelectedLessonFilter(val);
    setCurrentIndex(0);
  };

  if (!currentQuestion) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500">Không tìm thấy câu hỏi phù hợp với bộ lọc.</p>
      </div>
    );
  }

  const ansObj = currentQuestion.answers[
    activeAnswerLevel === 'level1'
      ? 'level1_short'
      : activeAnswerLevel === 'level2'
      ? 'level2_polite'
      : 'level3_expanded'
  ];

  return (
    <div className="space-y-6">
      {/* Lesson Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { label: 'Tất Cả', val: 'all' },
            { label: 'Bài 4 (Địa điểm/Tính từ)', val: 4 },
            { label: 'Bài 5 (Quá khứ/Sở thích)', val: 5 },
            { label: 'Bài 6 (Rủ rê/So sánh)', val: 6 },
            { label: 'Bài 7 (Vị trí/Tiếp diễn)', val: 7 },
            { label: 'Câu Có Tranh 🖼️', val: 'image' }
          ].map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => handleFilterChange(f.val as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer border ${
                selectedLessonFilter === f.val
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-bold text-slate-500">
          Câu <strong className="text-rose-600 text-sm font-black">{currentIndex + 1}</strong> / {filteredQuestions.length}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Question Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200/60">
              Mã: {currentQuestion.id}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              Bài {currentQuestion.lesson}
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
                Quy định: Suy nghĩ không quá 10s
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
        <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-50/40 to-amber-50/30 border-2 border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
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

          <p className="text-xs font-japanese text-rose-600 font-medium">
            【{currentQuestion.questionFurigana}】
          </p>

          <p className="text-sm font-medium text-slate-600 pt-2 border-t border-slate-200/60">
            Dịch nghĩa: <strong className="text-slate-800">{currentQuestion.questionVietnamese}</strong>
          </p>
        </div>

        {/* Audio Speaker & Voice Control */}
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

          {isMicSupported ? (
            <button
              type="button"
              onClick={() => {
                if (isListening) stopListening();
                else startListening();
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-[#F05A28] text-white hover:bg-orange-600'
              }`}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              <span>{isListening ? 'Dừng thu âm' : 'Bật Micro Trả Lời'}</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {showAnswer ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>{showAnswer ? 'Ẩn Gợi Ý Đáp Án' : 'Xem Gợi Ý Đáp Án'}</span>
          </button>
        </div>

        {/* Real-time Voice Answer Recognition */}
        {transcript && (
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <Mic size={13} />
                <span>Câu trả lời của bạn:</span>
              </span>
              <button
                type="button"
                onClick={resetTranscript}
                className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
              >
                Xóa làm lại
              </button>
            </div>
            <p className="font-japanese text-base font-bold text-slate-100">{transcript}</p>
          </div>
        )}

        {/* 3-Level Suggested Answers */}
        {showAnswer && (
          <div className="p-6 rounded-3xl bg-white border-2 border-rose-200 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles size={14} className="text-rose-500" />
                <span>3 Cấp Độ Trả Lời Chuẩn Barem FPT:</span>
              </span>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveAnswerLevel('level1')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeAnswerLevel === 'level1'
                      ? 'bg-white text-slate-800 shadow-2xs'
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
                      ? 'bg-rose-600 text-white shadow-2xs'
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
                      ? 'bg-[#F05A28] text-white shadow-2xs'
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
                  className="p-2 rounded-xl bg-white text-slate-600 hover:text-rose-600 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  title="Nghe phát âm đáp án"
                >
                  <Volume2 size={16} />
                </button>
              </div>

              <div className="text-xs font-japanese text-rose-600 font-semibold">
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
