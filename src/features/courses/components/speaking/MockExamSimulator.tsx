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
import type { MockExamPack, MockExamScorecard } from '../../types/speaking';
import { speakingApi } from '../../api/speakingApi';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
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

  // Reading step
  const [readingTranscript, setReadingTranscript] = useState<string>('');

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

  // Scorecard
  const [scorecard, setScorecard] = useState<MockExamScorecard | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Hooks
  const { speak, isSpeaking } = useSpeechSynthesis();
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({ lang: 'ja-JP', continuous: true });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    setReadingTranscript('');
    setCurrentQIndex(0);
    setQaReplayCount(0);
    setQaAnswers([]);
    setCurrentAnswerText('');
    setScorecard(null);
    setShowModal(false);
    if (timerRef.current) clearInterval(timerRef.current);
    resetTranscript();
  };

  // Synchronize recognition transcript with active state
  useEffect(() => {
    if (examState === 'greeting') {
      if (
        transcript.toLowerCase().includes('失礼') ||
        transcript.toLowerCase().includes('しつれい') ||
        transcript.toLowerCase().includes('shitsurei')
      ) {
        setGreetingSpoken(true);
      }
    } else if (examState === 'reading_read') {
      setReadingTranscript(transcript);
    } else if (examState === 'qa_question') {
      if (transcript) {
        setCurrentAnswerText(transcript);
      }
    }
  }, [transcript, examState]);

  // Timer countdown handler
  useEffect(() => {
    if (timerSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      if (examState === 'reading_prep') {
        // Prep time ended, switch to reading
        startReadingPhase();
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerSeconds, examState]);

  // STEP 1: START EXAM (Enter Greeting phase)
  const handleStartExam = () => {
    setExamState('greeting');
    speak('どうぞ、入ってください。', () => {
      startListening();
    });
  };

  // STEP 2: COMPLETE GREETING -> START READING PREP
  const handleGreetingDone = () => {
    stopListening();
    resetTranscript();
    setExamState('reading_prep');
    setTimerSeconds(examPack?.prepTimeSeconds || 20);
    speak('では、問題用紙を見てください。20秒準備してください。');
  };

  // STEP 3: PREP OVER -> START READING
  const startReadingPhase = () => {
    setExamState('reading_read');
    resetTranscript();
    startListening();
    speak('はい、読んでください。');
  };

  // STEP 4: READING FINISHED -> START Q&A
  const handleFinishReading = () => {
    stopListening();
    setExamState('qa_question');
    setCurrentQIndex(0);
    setQaReplayCount(0);
    resetTranscript();
    setCurrentAnswerText('');

    // Announce Q&A start
    speak('はい、結構です。次は質問です。', () => {
      askQuestion(0);
    });
  };

  // Ask specific question
  const askQuestion = (idx: number) => {
    if (!examPack || !examPack.qaQuestions[idx]) return;
    const q = examPack.qaQuestions[idx];
    setQaReplayCount(prev => prev + 1);
    setTimerSeconds(10); // 10s thinking timer
    speak(q.questionJapanese, () => {
      resetTranscript();
      startListening();
    });
  };

  // Replay question audio (max 3 times)
  const handleReplayQuestion = () => {
    if (qaReplayCount >= 3) return;
    askQuestion(currentQIndex);
  };

  // Submit current Q&A answer
  const handleSubmitAnswer = () => {
    stopListening();
    if (!examPack) return;
    const currentQ = examPack.qaQuestions[currentQIndex];
    const answer = currentAnswerText.trim();

    // Grade answer
    let score = 15;
    let feedback = 'Trả lời chính xác, trôi chảy và đầy đủ trợ từ.';

    if (!answer) {
      score = 0;
      feedback = 'Không ghi nhận câu trả lời (quá thời gian hoặc im lặng).';
    } else {
      // Check keywords
      const matchedKeywords = currentQ.keywords.filter(kw =>
        answer.toLowerCase().includes(kw.toLowerCase())
      );

      if (matchedKeywords.length === 0) {
        score -= 7;
        feedback = 'Chưa đúng trọng tâm câu hỏi hoặc thiếu từ vựng chính.';
      }

      // Check polite ending です / ます / ました
      if (
        !answer.endsWith('です') &&
        !answer.endsWith('ます') &&
        !answer.endsWith('でした') &&
        !answer.endsWith('ました') &&
        !answer.endsWith('ません') &&
        !answer.endsWith('ましたか')
      ) {
        score -= 3;
        feedback += ' Cần chú ý dùng thể lịch sự (〜です / 〜ます).';
      }
    }

    const recordedQA = {
      questionId: currentQ.id,
      questionText: currentQ.questionJapanese,
      studentAnswerText: answer || '(Không trả lời)',
      score: Math.max(0, score),
      feedback
    };

    const newQAs = [...qaAnswers, recordedQA];
    setQaAnswers(newQAs);

    // Next question or farewell
    if (currentQIndex < examPack.qaQuestions.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      setQaReplayCount(0);
      resetTranscript();
      setCurrentAnswerText('');
      speak('はい、次の質問です。', () => {
        askQuestion(nextIdx);
      });
    } else {
      // Complete all Qs
      handleFinishQA(newQAs);
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

    // Calculate Reading score
    let kanjiScore = 15;
    let katakanaScore = 10;
    let hiraganaScore = 18;

    const readText = readingTranscript.toLowerCase();
    if (readText.length > 20) {
      // Check kanji recognition
      const matchedKanji = examPack.readingPassage.targetKanji.filter(
        k =>
          readText.includes(k.character) ||
          readText.includes(k.reading) ||
          readText.includes(k.hanViet.toLowerCase())
      );
      if (matchedKanji.length < examPack.readingPassage.targetKanji.length / 2) {
        kanjiScore = 10;
      }

      // Katakana check
      const matchedKana = examPack.readingPassage.targetKatakana.filter(k =>
        readText.includes(k.toLowerCase())
      );
      if (matchedKana.length === 0 && examPack.readingPassage.targetKatakana.length > 0) {
        katakanaScore = 7;
      }
    } else {
      // Too short or no mic input
      kanjiScore = 12;
      katakanaScore = 8;
      hiraganaScore = 15;
    }

    const totalReading = kanjiScore + katakanaScore + hiraganaScore; // /45

    // Q&A score
    const totalQA = qaAnswers.reduce((sum, item) => sum + item.score, 0); // /45

    // Manner score
    const mannerScore = greetingSpoken ? 10 : 8; // /10

    const totalScore = totalReading + totalQA + mannerScore;
    const passed = totalScore >= 50;

    let generalFeedback = '';
    if (totalScore >= 80) {
      generalFeedback =
        'Xuất sắc! Bạn phát âm rõ ràng, phản xạ nhanh và ngữ pháp rất chắc chắn. Sẵn sàng tự tin bước vào phòng thi thật!';
    } else if (totalScore >= 50) {
      generalFeedback =
        'Đạt yêu cầu qua môn! Tuy nhiên hãy chú ý chia đúng thì quá khứ (ました) và phân biệt kỹ trợ từ で và に để kéo điểm lên mức Giỏi.';
    } else {
      generalFeedback =
        'Chưa đạt mức an toàn (50đ). Bạn cần luyện tập thêm các câu cứu cánh để không im lặng quá 10s và nghe kỹ câu hỏi mẫu trong tab Q&A.';
    }

    const card: MockExamScorecard = {
      examCode: examPack.examCode,
      date: new Date().toLocaleDateString('vi-VN'),
      readingScore: totalReading,
      readingDetails: {
        kanjiScore,
        katakanaScore,
        hiraganaScore,
        fluencyScore: 18
      },
      qaScore: totalQA,
      qaDetails: qaAnswers,
      mannerScore,
      totalScore,
      passed,
      generalFeedback
    };

    setScorecard(card);
    setShowModal(true);
    setExamState('scorecard');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang chuẩn bị phòng thi giả lập...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scorecard Modal */}
      <SpeakingScorecardModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        scorecard={scorecard}
        onRetry={() => resetAll()}
        onNewExam={() => loadExam()}
      />

      {/* HEADER / STATUS BAR */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-100 text-[#F05A28] flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Phòng Thi Nói Giả Lập 1-1
              </span>
              <span className="px-2 py-0.5 bg-orange-100 text-[#F05A28] text-xs font-bold rounded">
                Mã: {examPack?.examCode}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Giám Thị AI FPT (Sensei Tanaka)
            </h2>
          </div>
        </div>

        {/* Progress Pills */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              examState === 'idle'
                ? 'bg-slate-100 text-slate-600'
                : examState === 'greeting'
                ? 'bg-amber-100 text-amber-800 animate-pulse'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            1. Chào hỏi
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
              Bắt Đầu Bài Thi Nói 1-1 Với Giám Thị
            </h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Bạn sẽ trải qua quy trình thi như thi thật: Chào khi vào phòng ➔ 20s chuẩn bị và đọc đoạn văn A-02 ➔ Trả lời 3 câu hỏi (1 tranh + 2 câu vấn đáp) ➔ Nhận phiếu điểm chuẩn FPT ngay lập tức!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Thời lượng</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">5 - 7 Phút</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Thiết bị</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">Micro + Loa</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Điểm qua môn</span>
              <p className="text-sm font-bold text-emerald-600 mt-0.5">50 / 100 Điểm</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartExam}
            className="w-full md:w-auto px-8 py-3.5 bg-[#F05A28] hover:bg-[#d94819] text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto cursor-pointer"
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
              Lượt của bạn: Chào hỏi giám thị
            </span>
            <p className="text-2xl font-black text-slate-900 font-japanese">
              失礼します。
            </p>
            <p className="text-xs text-slate-400 font-mono italic">
              Shitsurei shimasu (Em xin phép vào ạ)
            </p>

            <div className="pt-3 flex flex-col items-center justify-center gap-2">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold ${
                  isListening
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                {isListening ? 'Đang lắng nghe giọng nói của bạn...' : 'Micro chưa bật'}
              </div>

              {transcript && (
                <p className="text-xs text-slate-600">
                  Ghi nhận: <span className="font-japanese font-bold">{transcript}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleGreetingDone}
              className="px-6 py-3 bg-[#F05A28] text-white font-bold rounded-xl shadow hover:bg-[#d94819] transition-all cursor-pointer flex items-center gap-2"
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
              onClick={handleFinishReading}
              className="px-6 py-2.5 bg-[#F05A28] text-white font-bold text-sm rounded-xl hover:bg-[#d94819] transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              Hoàn Thành Bài Đọc <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 bg-amber-50/40 border border-amber-200/80 rounded-2xl leading-loose font-japanese text-lg md:text-xl text-slate-900 shadow-inner">
            {examPack.readingPassage.contentJapanese}
          </div>

          {/* Realtime voice recognition feedback */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Lời đọc nhận diện trực tiếp:
            </span>
            <p className="text-sm font-japanese text-slate-800 min-h-[40px]">
              {readingTranscript || (
                <span className="text-slate-400 italic font-sans text-xs">
                  (Đang lắng nghe giọng đọc của bạn qua micro...)
                </span>
              )}
            </p>
          </div>
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
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:border-orange-400 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm"
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
          <div className="p-6 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-start gap-4 shadow-sm">
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

          {/* Student's Answer Input (Voice + Manual fallback) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-700">
                Câu trả lời của bạn:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) stopListening();
                    else startListening();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  {isListening ? 'Đang ghi âm...' : 'Bật Micro'}
                </button>
              </div>
            </div>

            <textarea
              value={currentAnswerText}
              onChange={e => setCurrentAnswerText(e.target.value)}
              placeholder="Nói qua Micro hoặc nhập câu trả lời tiếng Nhật vào đây..."
              rows={3}
              className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl font-japanese text-base focus:bg-white focus:border-[#F05A28] focus:ring-2 focus:ring-orange-200 outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-500" />
              Không im lặng quá 10 giây. Hãy kết thúc câu bằng 〜です / 〜ます.
            </span>

            <button
              type="button"
              onClick={handleSubmitAnswer}
              className="px-6 py-3 bg-[#F05A28] hover:bg-[#d94819] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {currentQIndex < examPack.qaQuestions.length - 1
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
            className="w-full px-8 py-3.5 bg-[#F05A28] hover:bg-[#d94819] text-white font-black text-base rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Award className="w-5 h-5" /> Xem Phiếu Điểm Đánh Giá FPT (/100đ)
          </button>
        </div>
      )}
    </div>
  );
};
