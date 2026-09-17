import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Timer,
  Flame,
  RotateCcw,
  Trophy,
  Crown,
  Volume2,
  Zap
} from 'lucide-react';
import type { VocabularyItem } from '../../../types';
import { weakWordsStorage } from '../../../utils/weakWordsStorage';

interface TimeAttackModeProps {
  items: VocabularyItem[];
  courseCode: string;
  lessonSlug: string;
  onRecordResult: (id: string, isCorrect: boolean) => void;
}

interface QuickQuestion {
  targetItem: VocabularyItem;
  promptTerm: string;
  promptReading: string;
  options: Array<{
    id: string; // 'A' | 'B' | 'C' | 'D'
    text: string;
    isCorrect: boolean;
  }>;
}

export default function TimeAttackMode({
  items,
  courseCode,
  lessonSlug,
  onRecordResult
}: TimeAttackModeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState(60000); // 60s
  const [score, setScore] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Question state
  const [currentQ, setCurrentQ] = useState<QuickQuestion | null>(null);
  const [feedbackEffect, setFeedbackEffect] = useState<'correct' | 'wrong' | null>(null);
  const [bonusTimeText, setBonusTimeText] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // High score
  const storageKey = `time_attack_high_${(courseCode || 'jpd123').toLowerCase()}_${lessonSlug}`;
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Speech Helper
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = 1.05;
      window.speechSynthesis.speak(u);
    }
  }, []);

  // Generate a random 4-choice question
  const generateQuestion = useCallback((): QuickQuestion | null => {
    if (!items || items.length < 2) return null;

    const target = items[Math.floor(Math.random() * items.length)];
    const distractors = items
      .filter((it) => it._id !== target._id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const rawOptions = [
      { text: target.meaning, isCorrect: true },
      ...distractors.map((d) => ({ text: d.meaning, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);

    return {
      targetItem: target,
      promptTerm: target.term,
      promptReading: target.reading,
      options: rawOptions.map((opt, i) => ({
        id: String.fromCharCode(65 + i),
        text: opt.text,
        isCorrect: opt.isCorrect
      }))
    };
  }, [items]);

  // Start the 60s Challenge
  const startGame = () => {
    setIsPlaying(true);
    setTimeLeftMs(60000);
    setScore(0);
    setComboStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setIsFinished(false);
    setFeedbackEffect(null);
    setBonusTimeText(null);

    setCurrentQ(generateQuestion());
  };

  // Timer interval
  useEffect(() => {
    if (isPlaying && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeftMs((prev) => {
          if (prev <= 100) {
            clearInterval(timerRef.current!);
            setIsFinished(true);
            setIsPlaying(false);
            return 0;
          }
          return prev - 100;
        });
      }, 100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isFinished]);

  // Handle Answer
  const handleAnswer = (isCorrect: boolean) => {
    if (!isPlaying || isFinished || !currentQ) return;

    const wordId = currentQ.targetItem._id;
    onRecordResult(wordId, isCorrect);

    if (isCorrect) {
      // Calculate multiplier
      const nextStreak = comboStreak + 1;
      setComboStreak(nextStreak);
      setMaxStreak((prev) => Math.max(prev, nextStreak));
      setCorrectCount((prev) => prev + 1);

      let multiplier = 1;
      let bonusMs = 0;

      if (nextStreak >= 7) {
        multiplier = 3;
        bonusMs = 3000;
      } else if (nextStreak >= 4) {
        multiplier = 2;
        bonusMs = 2000;
      } else if (nextStreak >= 2) {
        multiplier = 1.5;
        bonusMs = 1500;
      }

      const points = Math.round(100 * multiplier);
      setScore((prev) => {
        const nextScore = prev + points;
        if (nextScore > highScore) {
          setHighScore(nextScore);
          try {
            localStorage.setItem(storageKey, nextScore.toString());
          } catch {
            // ignore
          }
        }
        return nextScore;
      });

      // Bonus Time
      if (bonusMs > 0) {
        setTimeLeftMs((prev) => Math.min(90000, prev + bonusMs));
        setBonusTimeText(`+${(bonusMs / 1000).toFixed(0)}s`);
        setTimeout(() => setBonusTimeText(null), 800);
      }

      setFeedbackEffect('correct');
      weakWordsStorage.recordAttempt(courseCode, lessonSlug, wordId, true);
    } else {
      // Wrong Answer!
      setComboStreak(0);
      setWrongCount((prev) => prev + 1);

      // Penalty: -3 seconds!
      setTimeLeftMs((prev) => Math.max(0, prev - 3000));
      setBonusTimeText('-3s');
      setTimeout(() => setBonusTimeText(null), 800);

      setFeedbackEffect('wrong');
      weakWordsStorage.addWeakWord(courseCode, lessonSlug, wordId);
    }

    // Quick transition to next question (150ms for hyper-fast tempo)
    setTimeout(() => {
      setFeedbackEffect(null);
      setCurrentQ(generateQuestion());
    }, 150);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!isPlaying || isFinished || !currentQ) return;

      let chosenIndex = -1;
      if (['1', 'a', 'A'].includes(e.key)) chosenIndex = 0;
      if (['2', 'b', 'B'].includes(e.key)) chosenIndex = 1;
      if (['3', 'c', 'C'].includes(e.key)) chosenIndex = 2;
      if (['4', 'd', 'D'].includes(e.key)) chosenIndex = 3;

      if (chosenIndex >= 0 && currentQ.options[chosenIndex]) {
        handleAnswer(currentQ.options[chosenIndex].isCorrect);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFinished, currentQ]);

  // Rank Calculation
  const getRank = (finalScore: number) => {
    if (finalScore >= 1800) return { rank: 'S', title: 'Thần Sầu Phản Xạ', color: 'text-amber-500 bg-amber-50 border-amber-300' };
    if (finalScore >= 1200) return { rank: 'A', title: 'Xuất Sắc Vượt Trội', color: 'text-emerald-600 bg-emerald-50 border-emerald-300' };
    if (finalScore >= 600) return { rank: 'B', title: 'Khá Giỏi Vững Vàng', color: 'text-blue-600 bg-blue-50 border-blue-300' };
    return { rank: 'C', title: 'Cần Thêm Tốc Độ', color: 'text-slate-600 bg-slate-50 border-slate-300' };
  };

  const rankInfo = getRank(score);
  const formattedSeconds = (timeLeftMs / 1000).toFixed(1);

  if (items.length < 3) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        Bài học cần ít nhất 3 từ vựng để mở chế độ Đấu Trí Phản Xạ 60 Giây.
      </div>
    );
  }

  // Pre-game Welcome Screen
  if (!isPlaying && !isFinished) {
    return (
      <div className="max-w-xl mx-auto p-8 sm:p-12 bg-white rounded-3xl border border-slate-200 shadow-xl text-center animate-scaleUp">
        <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-amber-500 via-[#F05A28] to-rose-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/30">
          <Flame size={44} className="animate-pulse" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          Đấu Trí Phản Xạ 60 Giây 🔥
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed max-w-md mx-auto">
          Thử thách tốc độ đọc hiểu từ vựng tiếng Nhật trong 60 giây! Đúng liên tiếp tạo <strong>Combo Streak (x1.5, x2, x3)</strong> và cộng thêm <strong>+2s</strong>; Trả lời sai bị phạt trừ <strong>-3s</strong>!
        </p>

        {highScore > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-6">
            <Trophy size={16} className="text-amber-500" />
            <span>Điểm kỷ lục của bạn: <strong className="text-slate-900 font-mono text-sm">{highScore}</strong> điểm</span>
          </div>
        )}

        <button
          type="button"
          onClick={startGame}
          className="w-full py-4 px-6 rounded-2xl bg-linear-to-r from-[#F05A28] to-amber-500 hover:brightness-110 text-white font-black text-base transition-all shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Zap size={20} />
          <span>Bắt Đầu Đua Ngay!</span>
        </button>

        <div className="mt-4 text-xs text-slate-400 font-medium">
          Dùng phím số [1, 2, 3, 4] để chọn đáp án siêu tốc
        </div>
      </div>
    );
  }

  // End Game Screen
  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto p-8 sm:p-12 bg-white rounded-3xl border border-slate-200 shadow-2xl text-center animate-scaleUp">
        <div className={`w-20 h-20 rounded-3xl mx-auto mb-4 border-2 flex items-center justify-center font-black text-4xl shadow-md ${rankInfo.color}`}>
          {rankInfo.rank}
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
          Hết Giờ! Đạt {rankInfo.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Bạn đã hoàn thành 60 giây nghẹt thở với những con số ấn tượng!
        </p>

        {/* Score Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 text-center">
          <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200/80">
            <div className="text-2xl sm:text-3xl font-black text-[#F05A28] font-mono">{score}</div>
            <div className="text-[11px] font-bold text-orange-600 mt-1">Tổng điểm</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">{correctCount}</div>
            <div className="text-[11px] font-bold text-emerald-600 mt-1">Câu đúng</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80">
            <div className="text-2xl sm:text-3xl font-black text-rose-700 font-mono">{wrongCount}</div>
            <div className="text-[11px] font-bold text-rose-600 mt-1">Câu sai</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80">
            <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">x{maxStreak}</div>
            <div className="text-[11px] font-bold text-amber-600 mt-1">Max Combo</div>
          </div>
        </div>

        {score >= highScore && score > 0 && (
          <div className="mb-6 p-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
            <Crown size={16} />
            <span>Kỷ lục mới! Bạn vừa phá vỡ thành tích cao nhất từ trước tới nay!</span>
          </div>
        )}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={startGame}
            className="w-full py-3.5 px-4 rounded-xl bg-[#F05A28] hover:bg-[#d94817] text-white font-bold text-sm transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Thử Thách Lại Lần Nữa</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* ── Arcade HUD Top Bar ── */}
      <div className="w-full mb-4 p-4 rounded-3xl bg-slate-900 text-white shadow-xl flex items-center justify-between gap-4 border border-slate-800">
        {/* Stopwatch & Bonus */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-[#F05A28] flex items-center justify-center font-bold">
            <Timer size={22} className={timeLeftMs < 10000 ? 'text-rose-400 animate-spin' : ''} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Thời Gian Còn
            </div>
            <div
              className={`text-2xl sm:text-3xl font-black font-mono leading-none ${
                timeLeftMs < 10000 ? 'text-rose-400 animate-pulse' : 'text-white'
              }`}
            >
              {formattedSeconds}s
            </div>
          </div>

          {bonusTimeText && (
            <span
              className={`text-sm font-black font-mono animate-bounce px-2 py-0.5 rounded-lg ${
                bonusTimeText.startsWith('+') ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`}
            >
              {bonusTimeText}
            </span>
          )}
        </div>

        {/* Combo Fire */}
        {comboStreak >= 2 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-orange-500 to-amber-500 text-white font-black text-xs shadow-md animate-pulse">
            <Flame size={14} />
            <span>Combo x{comboStreak}!</span>
          </div>
        )}

        {/* Score Counter */}
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Điểm Số
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 leading-none">
            {score}
          </div>
        </div>
      </div>

      {/* ── Question Card with Flash Effect ── */}
      <div
        className={`w-full p-6 sm:p-8 rounded-3xl bg-white border-2 transition-all shadow-xl text-center mb-6 relative ${
          feedbackEffect === 'correct'
            ? 'border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-200'
            : feedbackEffect === 'wrong'
            ? 'border-rose-500 bg-rose-50/50 ring-4 ring-rose-200 animate-shake'
            : 'border-slate-200/90'
        }`}
      >
        <button
          type="button"
          onClick={() => speak(currentQ.promptTerm)}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-orange-50 text-[#F05A28] hover:bg-[#F05A28] hover:text-white border border-orange-200 transition-all flex items-center justify-center cursor-pointer"
          title="Phát âm"
        >
          <Volume2 size={16} />
        </button>

        {currentQ.promptReading !== currentQ.promptTerm && (
          <div className="inline-flex px-3 py-0.5 rounded-full bg-orange-50 text-[#F05A28] font-bold text-sm font-japanese border border-orange-200/60 mb-2">
            {currentQ.promptReading}
          </div>
        )}

        <h3 className="text-4xl sm:text-6xl font-black text-slate-900 font-japanese tracking-wide my-2">
          {currentQ.promptTerm}
        </h3>

        <p className="text-xs text-slate-400 font-medium">Chọn nghĩa tiếng Việt đúng nhất:</p>
      </div>

      {/* ── 4 Fast Response Buttons ── */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {currentQ.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleAnswer(opt.isCorrect)}
            className="p-4 rounded-2xl bg-white text-slate-800 border-2 border-slate-200 hover:border-orange-400 hover:bg-orange-50/30 hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer text-left active:scale-95"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold font-mono text-xs flex items-center justify-center shrink-0 border border-slate-200">
                {opt.id}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {opt.text}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Keyboard Helper */}
      <div className="text-center text-xs text-slate-400 font-medium">
        Bấm phím [1, 2, 3, 4] để chọn nhanh mà không cần dùng chuột!
      </div>
    </div>
  );
}
