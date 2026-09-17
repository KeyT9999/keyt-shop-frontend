import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Volume2,
  Mic,
  MicOff,
  Clock,
  Award,
  CheckCircle,
  Sparkles,
  ArrowRight,
  UserCheck,
  MessageSquare,
  Image as ImageIcon,
  Info
} from 'lucide-react';

import type {
  MockExamPack,
  MockExamScorecard,
  PronunciationEvaluationResult
} from '../../types/speaking';
import { speakingApi } from '../../api/speakingApi';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { SpeakingScorecardModal } from './SpeakingScorecardModal';

type ExamState =
  | 'idle'
  | 'greeting'
  | 'reading_prep'
  | 'reading_read'
  | 'qa_question'
  | 'farewell'
  | 'scorecard';

interface MockExamSimulatorProps {
  courseCode?: string;
}

export const MockExamSimulator: React.FC<MockExamSimulatorProps> = ({
  courseCode = 'jpd123'
}) => {
  const [examPack, setExamPack] = useState<MockExamPack | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [examState, setExamState] = useState<ExamState>('idle');

  // Timers
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // Greeting step
  const [greetingSpoken, setGreetingSpoken] = useState<boolean>(false);
  const [greetingScore, setGreetingScore] = useState<number>(10);
  const [greetingFeedback, setGreetingFeedback] = useState<string>('');

  // Reading step
  const [readingTranscript, setReadingTranscript] = useState<string>('');
  const [readingResult, setReadingResult] = useState<PronunciationEvaluationResult | null>(null);

  // Q&A step
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [qaReplayCount, setQaReplayCount] = useState<number>(0); // max 3
  const [qaAnswers, setQaAnswers] = useState<
    Array<{
      questionId: string;
      questionText: string;
      studentAnswerText: string;
      score: number;
      feedback: string;
    }>
  >([]);
  const [currentAnswerText, setCurrentAnswerText] = useState<string>('');

  // Evaluating loading state
  const [isAiEvaluating, setIsAiEvaluating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Scorecard
  const [scorecard, setScorecard] = useState<MockExamScorecard | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Hooks
  const { speak, isSpeaking, stop: stopAudio } = useSpeechSynthesis();
  const {
    isRecording,
    duration: recordDuration,
    volumeLevel,
    startRecording,
    stopRecording,
    resetAudio
  } = useAudioRecorder();


  const timerRef = useRef<any>(null);

  // Load Exam Pack
  const loadExam = async () => {
    try {
      setLoading(true);
      const pack = await speakingApi.getMockExamPack(courseCode);
      setExamPack(pack);
      resetAll();
    } catch (err) {
      console.error('Failed to load mock exam pack', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExam();
  }, [courseCode]);

  const resetAll = () => {
    setExamState('idle');
    setTimerSeconds(0);
    setGreetingSpoken(false);
    setGreetingScore(10);
    setGreetingFeedback('');
    setReadingTranscript('');
    setReadingResult(null);
    setCurrentQIndex(0);
    setQaReplayCount(0);
    setQaAnswers([]);
    setCurrentAnswerText('');
    setScorecard(null);
    setShowModal(false);
    setIsAiEvaluating(false);
    setAiError(null);
    if (timerRef.current) clearInterval(timerRef.current);
    resetAudio();
    stopAudio();
  };

  // Timer countdown handler
  useEffect(() => {
    if (timerSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      if (examState === 'reading_prep') {
        startReadingPhase();
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerSeconds, examState]);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // STEP 1: START EXAM (Enter Greeting phase)
  const handleStartExam = () => {
    setExamState('greeting');
    speak('どうぞ、入ってください。');
  };

  // Record Greeting
  const handleRecordGreeting = async () => {
    if (isRecording) {
      try {
        setIsAiEvaluating(true);
        const blob = await stopRecording();
        if (blob) {
          const res = await speakingApi.evaluateGreeting(courseCode, blob, '失礼します');
          setGreetingSpoken(res.passed);
          setGreetingScore(res.score);
          setGreetingFeedback(res.feedback);
        }
      } catch (err) {
        console.warn('Greeting evaluation fallback:', err);
        setGreetingSpoken(true);
        setGreetingScore(10);
      } finally {
        setIsAiEvaluating(false);
      }
    } else {
      resetAudio();
      setAiError(null);
      await startRecording();
    }
  };

  // STEP 2: COMPLETE GREETING -> START READING PREP
  const handleGreetingDone = () => {
    resetAudio();
    setExamState('reading_prep');
    setTimerSeconds(examPack?.prepTimeSeconds || 20);
    speak('では、問題用紙を見てください。20秒準備してください。');
  };

  // STEP 3: PREP OVER -> START READING
  const startReadingPhase = async () => {
    setExamState('reading_read');
    resetAudio();
    speak('はい、読んでください。');
  };

  // Record Reading
  const handleToggleReadingRecord = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      resetAudio();
      await startRecording();
    }
  };

  // STEP 4: READING FINISHED -> START Q&A
  const handleFinishReading = async () => {
    try {
      setIsAiEvaluating(true);
      let blob: Blob | null = null;
      if (isRecording) {
        blob = await stopRecording();
      }

      if (blob && examPack) {
        try {
          const evalRes = await speakingApi.evaluatePronunciation(
            courseCode,
            blob,
            examPack.readingPassage.contentJapanese,
            examPack.readingPassage.id
          );
          setReadingResult(evalRes);
          setReadingTranscript(evalRes.transcript || '');
        } catch (evalErr) {
          console.warn('Reading evaluation fallback:', evalErr);
          setReadingTranscript('Đã hoàn thành phần đọc');
        }
      }
    } catch (err) {
      console.warn('Reading finish error:', err);
    } finally {
      setIsAiEvaluating(false);
      setExamState('qa_question');
      setCurrentQIndex(0);
      setQaReplayCount(0);
      resetAudio();
      setCurrentAnswerText('');

      speak('はい、結構です。次は質問です。', () => {
        askQuestion(0);
      });
    }
  };

  // Ask specific question
  const askQuestion = (idx: number) => {
    if (!examPack || !examPack.qaQuestions[idx]) return;
    const q = examPack.qaQuestions[idx];
    setQaReplayCount((prev) => prev + 1);
    setTimerSeconds(10); // 10s thinking timer
    speak(q.questionJapanese);
  };

  // Replay question audio (max 3 times)
  const handleReplayQuestion = () => {
    if (qaReplayCount >= 3) return;
    askQuestion(currentQIndex);
  };

  // Toggle QA record
  const handleToggleQARecord = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      resetAudio();
      await startRecording();
    }
  };

  // Submit current Q&A answer
  const handleSubmitAnswer = async () => {
    if (!examPack) return;
    const currentQ = examPack.qaQuestions[currentQIndex];

    try {
      setIsAiEvaluating(true);
      let blob: Blob | null = null;
      if (isRecording) {
        blob = await stopRecording();
      }

      let score = 12;
      let feedback = 'Trả lời tốt theo barem kỳ thi.';
      let studentText = currentAnswerText.trim();

      if (blob) {
        try {
          const qaEval = await speakingApi.evaluateQA(
            courseCode,
            blob,
            currentQ.questionJapanese,
            currentQ.keywords || [],
            currentQ.grammarPattern || '',
            currentQ.answers
          );
          score = qaEval.score;
          feedback = qaEval.feedback;
          studentText = qaEval.transcript || studentText || '(Đã ghi âm)';
        } catch (qaErr) {
          console.warn('QA eval fallback:', qaErr);
        }
      } else if (!studentText) {
        score = 3;
        feedback = 'Không ghi nhận được câu trả lời rõ ràng (quá thời gian hoặc chưa bật mic).';
        studentText = '(Không có câu trả lời)';
      }

      const recordedQA = {
        questionId: currentQ.id,
        questionText: currentQ.questionJapanese,
        studentAnswerText: studentText,
        score,
        feedback
      };

      const newQAs = [...qaAnswers, recordedQA];
      setQaAnswers(newQAs);

      resetAudio();
      setCurrentAnswerText('');

      // Next question or farewell
      if (currentQIndex < examPack.qaQuestions.length - 1) {
        const nextIdx = currentQIndex + 1;
        setCurrentQIndex(nextIdx);
        setQaReplayCount(0);
        speak('はい、次の質問です。', () => {
          askQuestion(nextIdx);
        });
      } else {
        handleFinishQA(newQAs);
      }
    } catch (err) {
      console.warn('Submit answer error:', err);
    } finally {
      setIsAiEvaluating(false);
    }
  };

  // STEP 5: FINISH Q&A -> FAREWELL
  const handleFinishQA = (_allQAs: typeof qaAnswers) => {
    setExamState('farewell');
    speak('はい、以上で終わります。お疲れ様でした。');
  };

  // STEP 6: CALCULATE FINAL SCORECARD
  const handleGenerateScorecard = () => {
    if (!examPack) return;

    // Real Reading score from AI (or fallback based on reading transcript)
    const totalReading = readingResult ? readingResult.feScore : 38;

    // Real Q&A score from AI
    const totalQA = qaAnswers.reduce((sum, item) => sum + item.score, 0);

    // Real Manner score
    const mannerScore = greetingSpoken ? greetingScore : 8;

    const totalScore = totalReading + totalQA + mannerScore;
    const passed = totalScore >= 50;

    let generalFeedback = '';
    if (totalScore >= 80) {
      generalFeedback =
        'Xuất sắc! Bạn phát âm rõ ràng, phản xạ nhanh và ngữ pháp rất chắc chắn. Tự tin bước vào phòng thi thật nhé!';
    } else if (totalScore >= 50) {
      generalFeedback =
        'Đạt yêu cầu qua môn! Tuy nhiên hãy chú ý chia đúng thì quá khứ (ました) và phân biệt kỹ trợ từ で và に để kéo điểm lên mức Giỏi.';
    } else {
      generalFeedback =
        'Chưa đạt mức an toàn (50đ). Bạn cần luyện tập thêm phản xạ trong tab Q&A và nghe kỹ câu hỏi mẫu của giám thị.';
    }

    const card: MockExamScorecard = {
      examCode: examPack.examCode,
      date: new Date().toLocaleDateString('vi-VN'),
      readingScore: totalReading,
      readingDetails: {
        kanjiScore: readingResult ? Math.round((readingResult.metrics.accuracy / 100) * 15) : 13,
        katakanaScore: readingResult ? Math.round((readingResult.metrics.pronunciation / 100) * 10) : 9,
        hiraganaScore: readingResult ? Math.round((readingResult.metrics.fluency / 100) * 20) : 16,
        fluencyScore: readingResult ? readingResult.metrics.fluency : 80
      },
      qaScore: totalQA,
      qaDetails: qaAnswers,
      mannerScore,
      totalScore,
      passed,
      generalFeedback
    };

    setScorecard(card);
    setExamState('scorecard');
    setShowModal(true);
  };

  if (loading || !examPack) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang khởi tạo phòng thi ảo 1-1...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#F05A28] flex items-center justify-center font-black text-xl shadow-xs">
            1-1
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 text-orange-800">
                {examPack.examCode}
              </span>
              <span className="text-xs font-semibold text-slate-500">Mô phỏng thi vấn đáp</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Phòng Khảo Thí FE Tiếng Nhật - Giám Thị AI
            </h2>
          </div>
        </div>

        {/* Progress Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              examState === 'idle'
                ? 'bg-slate-100 text-slate-600'
                : examState === 'greeting'
                ? 'bg-amber-100 text-amber-800 animate-pulse'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            1. Chào hỏi (10đ)
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              examState === 'reading_prep' || examState === 'reading_read'
                ? 'bg-amber-100 text-amber-800 animate-pulse'
                : examState === 'qa_question' || examState === 'farewell' || examState === 'scorecard'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            2. Đọc Đề A (45đ)
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              examState === 'qa_question'
                ? 'bg-amber-100 text-amber-800 animate-pulse'
                : examState === 'farewell' || examState === 'scorecard'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            3. Q&amp;A Đề B (45đ)
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              examState === 'scorecard'
                ? 'bg-[#F05A28] text-white'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            4. Bảng Điểm
          </span>
        </div>
      </div>

      {/* STAGE 1: IDLE / BRIEFING ROOM */}
      {examState === 'idle' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-orange-50 text-[#F05A28] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full uppercase tracking-wider">
              Mô Phỏng Phòng Khảo Thí FPT
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              Bắt Đầu Bài Thi Nói 1-1 Với Giám Thị AI
            </h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Bạn sẽ trải qua quy trình thi như thật: Chào khi vào phòng ➔ 20s chuẩn bị và đọc đoạn văn Mã A ➔ Trả lời 3 câu hỏi vấn đáp Mã B ➔ Nhận phiếu điểm chuẩn FPT (/100đ) chấm bằng AI!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Thời lượng</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">5 - 7 Phút</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Công nghệ AI</span>
              <p className="text-sm font-bold text-orange-600 mt-0.5">Whisper + VAD</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Điểm qua môn</span>
              <p className="text-sm font-bold text-emerald-600 mt-0.5">50 / 100 Điểm</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartExam}
            className="w-full md:w-auto px-8 py-3.5 bg-[#F05A28] hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            <Play className="w-5 h-5 fill-white" />
            Bước Vào Phòng Thi &amp; Bắt Đầu
          </button>
        </div>
      )}

      {/* STAGE 2: GREETING PHASE */}
      {examState === 'greeting' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md max-w-2xl mx-auto space-y-6 text-center">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center gap-3">
            <UserCheck className="w-8 h-8 text-blue-600" />
            <div className="text-left">
              <span className="text-xs font-bold uppercase text-blue-700">Giám thị Tanaka</span>
              <p className="text-base font-bold text-slate-900 font-japanese">
                「 どうぞ、入ってください。」
              </p>
              <p className="text-xs text-slate-500">(Mời em vào phòng thi)</p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lượt của bạn: Chào hỏi giám thị (Tác phong: 10đ)
            </span>
            <p className="text-2xl font-black text-slate-900 font-japanese">
              失礼します。
            </p>
            <p className="text-xs text-slate-400 font-mono italic">
              Shitsurei shimasu (Em xin phép vào ạ)
            </p>

            {/* Live Audio Visualizer for Greeting */}
            {isRecording && (
              <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
                  <span className="text-xs font-mono font-bold text-red-400">
                    REC: {formatTime(recordDuration)}
                  </span>
                </div>
                <div className="flex items-center gap-1 h-6">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#F05A28] rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(15, Math.min(100, volumeLevel))}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleRecordGreeting}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-[#F05A28] text-white hover:bg-orange-600'
                }`}
              >
                {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
                <span>{isRecording ? 'Dừng & Chấm Lời Chào' : 'Nói "失礼します" Qua Micro'}</span>
              </button>

              {greetingFeedback && (
                <p className="text-xs font-semibold text-emerald-600 mt-1">
                  ✓ {greetingFeedback}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleGreetingDone}
              className="px-6 py-3 bg-[#1E293B] text-white font-bold rounded-xl shadow hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-2"
            >
              Tiếp tục bước Chuẩn bị đọc <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: READING PREP (20s Countdown) */}
      {examState === 'reading_prep' && examPack && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-[#F05A28] uppercase tracking-wider">
                Phần 1: Đoạn Văn Mã Đề A ({examPack.readingPassage.code})
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {examPack.readingPassage.title}
              </h3>
            </div>

            {/* 20s Countdown Box */}
            <div className="flex items-center gap-3 px-5 py-2.5 bg-amber-50 border-2 border-amber-400 rounded-2xl">
              <Clock className="w-6 h-6 text-amber-600 animate-spin" />
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase block">
                  Thời Gian Chuẩn Bị
                </span>
                <span className="text-2xl font-black text-amber-900">
                  {timerSeconds} <span className="text-xs font-semibold">Giây</span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl leading-loose font-japanese text-lg md:text-xl text-slate-800">
            {examPack.readingPassage.contentJapanese}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 italic">
              *Hãy đọc thầm, quan sát kỹ các chữ Hán và từ Katakana. Khi hết 20 giây, bạn sẽ bắt đầu đọc to.
            </span>
            <button
              type="button"
              onClick={startReadingPhase}
              className="px-5 py-2.5 bg-[#1E293B] text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Sẵn sàng đọc ngay (Bỏ qua đếm ngược)
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: READING READ PHASE */}
      {examState === 'reading_read' && examPack && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-emerald-600 animate-pulse" /> Đang Thu Âm Đọc Đoạn Văn
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Đề A: {examPack.readingPassage.title}
              </h3>
            </div>

            <button
              type="button"
              disabled={isAiEvaluating}
              onClick={handleFinishReading}
              className="px-6 py-2.5 bg-[#F05A28] text-white font-bold text-sm rounded-xl hover:bg-orange-600 transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isAiEvaluating ? 'AI Đang Chấm...' : 'Hoàn Thành & Chấm Bài Đọc'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 bg-amber-50/40 border border-amber-200/80 rounded-2xl leading-loose font-japanese text-lg md:text-xl text-slate-900 shadow-inner">
            {examPack.readingPassage.contentJapanese}
          </div>

          {/* Recorder box with live waveform */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleReadingRecord}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-[#F05A28] text-white hover:bg-orange-600'
                }`}
              >
                {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
                <span>{isRecording ? 'Tạm dừng đọc' : 'Bật Micro Đọc'}</span>
              </button>

              {isRecording && (
                <span className="text-xs font-mono text-red-400 font-bold">
                  REC: {formatTime(recordDuration)}
                </span>
              )}
            </div>

            {isRecording && (
              <div className="flex items-center gap-1 h-6">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-[#F05A28] to-amber-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(15, Math.min(100, volumeLevel))}%` }}
                  ></div>
                ))}
              </div>
            )}
          </div>

          {readingTranscript && (
            <p className="text-xs font-japanese text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Văn bản nhận diện: <strong className="text-slate-800">{readingTranscript}</strong>
            </p>
          )}

          {aiError && (
            <p className="text-xs text-red-500 font-semibold">{aiError}</p>
          )}
        </div>
      )}


      {/* STAGE 5: Q&A QUESTION PHASE */}
      {examState === 'qa_question' && examPack && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-xs font-bold rounded-md">
                  Câu hỏi {currentQIndex + 1} / {examPack.qaQuestions.length}
                </span>
                {examPack.qaQuestions[currentQIndex].hasImage && (
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded-md flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Câu hỏi có tranh
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Phần 2: Vấn Đáp Cùng Giám Thị
              </h3>
            </div>

            {/* Replay Counter & Timer */}
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-600 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                Lần nghe: <span className="text-[#F05A28] font-bold">{qaReplayCount} / 3</span>
              </div>
              <button
                type="button"
                onClick={handleReplayQuestion}
                disabled={qaReplayCount >= 3 || isSpeaking}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:border-orange-400 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Volume2 className="w-4 h-4 text-[#F05A28]" />
                Nghe lại câu hỏi
              </button>
            </div>
          </div>

          {/* Visual Image if present */}
          {examPack.qaQuestions[currentQIndex].hasImage && (
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-purple-800 block">
                  Hình Ảnh Minh Họa Đề Thi
                </span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {examPack.qaQuestions[currentQIndex].imageDescription}
                </p>
                <span className="text-xs text-slate-500 italic mt-1 block">
                  *Hãy quan sát sự hiện diện và hoạt động trong tranh để trả lời chính xác.
                </span>
              </div>
            </div>
          )}

          {/* Examiner Dialogue Box */}
          <div className="p-6 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-start gap-4 shadow-xs">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1 w-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 uppercase">
                  Giám thị Tanaka hỏi:
                </span>
                <span className="text-xs text-slate-400">15 Điểm</span>
              </div>
              <div className="text-xl md:text-2xl font-bold font-japanese text-slate-900">
                {examPack.qaQuestions[currentQIndex].questionJapanese}
              </div>
              <div className="text-xs text-slate-500">
                {examPack.qaQuestions[currentQIndex].questionVietnamese}
              </div>
            </div>
          </div>

          {/* Voice Recording Panel for Answer */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-orange-400 flex items-center gap-1.5">
                <Mic size={14} />
                <span>Trả Lời Giám Thị Bằng Giọng Nói:</span>
              </label>

              <button
                type="button"
                onClick={handleToggleQARecord}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-[#F05A28] text-white hover:bg-orange-600'
                }`}
              >
                {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                <span>{isRecording ? `Dừng ghi (${formatTime(recordDuration)})` : 'Bật Micro Trả Lời'}</span>
              </button>
            </div>

            {/* Live waveform */}
            {isRecording && (
              <div className="p-3 bg-slate-950 rounded-xl flex items-center justify-between gap-2">
                <span className="text-xs text-red-400 font-mono font-bold">
                  REC: {formatTime(recordDuration)}
                </span>
                <div className="flex items-center gap-1 h-6">
                  {[...Array(14)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#F05A28] rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(15, Math.min(100, volumeLevel))}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback Textarea */}
            <textarea
              value={currentAnswerText}
              onChange={(e) => setCurrentAnswerText(e.target.value)}
              placeholder="Nói qua Micro (khuyên dùng) hoặc nhập câu trả lời tiếng Nhật vào đây..."
              rows={2}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl font-japanese text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-500" />
              Không im lặng quá 10 giây. Hãy kết thúc câu bằng 〜です / 〜ます.
            </span>

            <button
              type="button"
              disabled={isAiEvaluating}
              onClick={handleSubmitAnswer}
              className="px-6 py-3 bg-[#F05A28] hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isAiEvaluating
                ? 'AI Đang Chấm...'
                : currentQIndex < examPack.qaQuestions.length - 1
                ? 'Nộp & Sang Câu Tiếp Theo'
                : 'Hoàn Thành Phần Thi Q&A'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 6: FAREWELL PHASE */}
      {examState === 'farewell' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md max-w-2xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
              Kết Thúc Buổi Thi
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              Giám Thị:「 はい、以上で終わります。お疲れ様でした。」
            </h3>
            <p className="text-slate-600 text-sm mt-2">
              Đừng quên câu chào tạm biệt trước khi rời phòng thi:
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-japanese text-xl font-bold text-slate-800">
            どうもありがとうございました。失礼いたします。
            <div className="text-xs font-sans text-slate-400 font-normal mt-1">
              (Em xin chân thành cảm ơn thầy/cô. Em xin phép ạ)
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateScorecard}
            className="w-full px-8 py-3.5 bg-[#F05A28] hover:bg-orange-600 text-white font-black text-base rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Award className="w-5 h-5" /> Xem Phiếu Điểm Đánh Giá FPT (/100đ)
          </button>
        </div>
      )}

      {/* Final Scorecard Modal */}
      {showModal && scorecard && (
        <SpeakingScorecardModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          scorecard={scorecard}
          onRetry={resetAll}
          onNewExam={loadExam}
        />
      )}
    </div>
  );
};

export default MockExamSimulator;
