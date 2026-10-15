import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  Award,
  Layers,
  GraduationCap,
  HelpCircle,
  Check
} from 'lucide-react';
import type { VocabularyItem } from '../../../types';
import { weakWordsStorage } from '../../../utils/weakWordsStorage';
import { getCourseLanguage } from '../../../utils/courseLanguage';

interface MasteryLoopModeProps {
  items: VocabularyItem[];
  courseCode: string;
  lessonSlug: string;
  onRecordResult: (id: string, isCorrect: boolean) => void;
}

type QuestionDirection = 'term-to-meaning' | 'meaning-to-term' | 'listening-to-meaning';

interface LoopQuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  subtext?: string;
  isCorrect: boolean;
}

interface LoopQuestion {
  id: string;
  targetId: string;
  targetItem: VocabularyItem;
  direction: QuestionDirection;
  prompt: string;
  subprompt?: string;
  termDisplay: string;
  readingDisplay?: string;
  partOfSpeech: string;
  options: LoopQuestionOption[];
  correctOptionId: 'A' | 'B' | 'C' | 'D';
}

interface ItemProgressState {
  item: VocabularyItem;
  // level 0: Chưa thuộc / Mới bắt đầu hoặc vừa làm sai
  // level 1: Tạm nhớ (Đã đúng 1 lần, cần xác thực lần 2 ở chiều ngược lại)
  // level 2: ĐÃ THUỘC 100% (Mastered - đã vượt qua 2 lần kiểm tra)
  level: 0 | 1 | 2;
  attempts: number;
  correctCount: number;
}

export default function MasteryLoopMode({
  items,
  courseCode,
  lessonSlug,
  onRecordResult
}: MasteryLoopModeProps) {
  const language = getCourseLanguage(courseCode);

  // Pool of all items
  const validItems = useMemo(() => items.filter((i) => i.term && i.meaning), [items]);

  // Master tracking map: itemId -> ItemProgressState
  const [progressMap, setProgressMap] = useState<Record<string, ItemProgressState>>({});

  // Round management
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundQuestions, setRoundQuestions] = useState<LoopQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Answering states
  const [selectedOptionId, setSelectedOptionId] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);

  // Screens
  const [isRoundSummary, setIsRoundSummary] = useState(false);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  // Stats
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [roundCorrectCount, setRoundCorrectCount] = useState(0);
  const [roundTotalAnswered, setRoundTotalAnswered] = useState(0);

  // Shake animation trigger on wrong answer
  const [shakeCard, setShakeCard] = useState(false);

  // Ref to prevent initializeSession from running more than once per items change
  // Track by item IDs (stable identity) instead of array reference (changes on every parent re-render)
  const prevItemsKeyRef = useRef('');

  // Helper SpeechSynthesis
  const speak = useCallback(
    (text: string, rate = 0.95) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = language.speechLocale;
        u.rate = rate;
        window.speechSynthesis.speak(u);
      }
    },
    [language.speechLocale]
  );

  // Helper shuffle array
  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Generate question for a specific target item and direction
  const buildQuestion = useCallback(
    (targetItem: VocabularyItem, direction: QuestionDirection): LoopQuestion => {
      const optionLetters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

      // Pick 3 distractors from validItems
      // Priority 1: Same part of speech, different meaning
      let pool = validItems.filter(
        (i) => i._id !== targetItem._id && i.meaning !== targetItem.meaning && i.partOfSpeech === targetItem.partOfSpeech
      );
      // Priority 2: Any other item from lesson
      if (pool.length < 3) {
        const remaining = validItems.filter(
          (i) => i._id !== targetItem._id && i.meaning !== targetItem.meaning && !pool.some((p) => p._id === i._id)
        );
        pool = [...pool, ...remaining];
      }

      const selectedDistractors = shuffle(pool).slice(0, 3);

      let rawOptions: Array<{ text: string; subtext?: string; isCorrect: boolean }> = [];

      if (direction === 'term-to-meaning' || direction === 'listening-to-meaning') {
        // Question is Foreign Word -> Options are Vietnamese meanings
        rawOptions = [
          { text: targetItem.meaning, isCorrect: true },
          ...selectedDistractors.map((d) => ({ text: d.meaning, isCorrect: false }))
        ];
      } else {
        // Question is Vietnamese Meaning -> Options are Foreign Words + Readings
        rawOptions = [
          {
            text: targetItem.term,
            subtext: targetItem.reading !== targetItem.term ? targetItem.reading : undefined,
            isCorrect: true
          },
          ...selectedDistractors.map((d) => ({
            text: d.term,
            subtext: d.reading !== d.term ? d.reading : undefined,
            isCorrect: false
          }))
        ];
      }

      // Shuffle options and assign A, B, C, D
      const shuffledOptions = shuffle(rawOptions).map((opt, idx) => ({
        id: optionLetters[idx],
        text: opt.text,
        subtext: opt.subtext,
        isCorrect: opt.isCorrect
      }));

      const correctOpt = shuffledOptions.find((o) => o.isCorrect) || shuffledOptions[0];

      let prompt = `Nghĩa tiếng Việt của từ "${targetItem.term}" là gì?`;
      if (direction === 'meaning-to-term') {
        prompt = `Từ nào có nghĩa là: "${targetItem.meaning}"?`;
      } else if (direction === 'listening-to-meaning') {
        prompt = 'Nghe phát âm và chọn nghĩa tiếng Việt chính xác:';
      }

      return {
        id: `${targetItem._id}-${direction}-${Date.now()}-${Math.random()}`,
        targetId: targetItem._id,
        targetItem,
        direction,
        prompt,
        termDisplay: direction === 'meaning-to-term' ? targetItem.meaning : targetItem.term,
        readingDisplay: direction === 'meaning-to-term' ? undefined : targetItem.reading,
        partOfSpeech: targetItem.partOfSpeech,
        options: shuffledOptions,
        correctOptionId: correctOpt.id
      };
    },
    [validItems]
  );

  // Initialize or reset session
  const initializeSession = useCallback(() => {
    if (validItems.length === 0) return;

    // Create fresh progress map: all items at level 0
    const initialMap: Record<string, ItemProgressState> = {};
    validItems.forEach((item) => {
      initialMap[item._id] = {
        item,
        level: 0,
        attempts: 0,
        correctCount: 0
      };
    });
    setProgressMap(initialMap);

    // Build Round 1 questions (All items in term-to-meaning direction)
    const shuffledItems = shuffle(validItems);
    const qList = shuffledItems.map((item) => buildQuestion(item, 'term-to-meaning'));

    setRoundNumber(1);
    setRoundQuestions(qList);
    setCurrentQIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrectAnswer(null);
    setIsRoundSummary(false);
    setIsSessionFinished(false);
    setStreak(0);
    setRoundCorrectCount(0);
    setRoundTotalAnswered(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validItems]);

  // Stable session key: only changes when lesson changes or actual vocabulary IDs change
  const itemsKey = useMemo(
    () => validItems.map((i) => i._id).sort().join(','),
    [validItems]
  );
  const sessionKey = `${lessonSlug}_${itemsKey}`;

  // Run initial setup on mount or when the lesson / vocabulary items list actually changes
  useEffect(() => {
    if (itemsKey && sessionKey !== prevItemsKeyRef.current) {
      prevItemsKeyRef.current = sessionKey;
      initializeSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey]);

  const currentQ = roundQuestions[currentQIndex];

  // Auto-speak foreign word when question changes
  useEffect(() => {
    if (currentQ && !isRoundSummary && !isSessionFinished) {
      if (currentQ.direction === 'term-to-meaning' || currentQ.direction === 'listening-to-meaning') {
        speak(currentQ.targetItem.term);
      }
    }
  }, [currentQ, isRoundSummary, isSessionFinished, speak]);

  // Handle Option Selection
  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered || !currentQ) return;

    setSelectedOptionId(optId);
    setIsAnswered(true);

    const isCorrect = optId === currentQ.correctOptionId;
    setIsCorrectAnswer(isCorrect);
    setRoundTotalAnswered((prev) => prev + 1);

    if (isCorrect) {
      setRoundCorrectCount((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });

      // Update progressMap: elevate level
      setProgressMap((prev) => {
        const currentItemState = prev[currentQ.targetId];
        if (!currentItemState) return prev;

        const nextLevel = Math.min(2, currentItemState.level + 1) as 0 | 1 | 2;
        return {
          ...prev,
          [currentQ.targetId]: {
            ...currentItemState,
            level: nextLevel,
            attempts: currentItemState.attempts + 1,
            correctCount: currentItemState.correctCount + 1
          }
        };
      });

      // Speak confirmation
      speak(currentQ.targetItem.term);

      // Record to parent & weak words
      onRecordResult(currentQ.targetId, true);
      weakWordsStorage.recordAttempt(courseCode, lessonSlug, currentQ.targetId, true);
    } else {
      setStreak(0);
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 500);

      // Reset level to 0 on failure to force re-learning
      setProgressMap((prev) => {
        const currentItemState = prev[currentQ.targetId];
        if (!currentItemState) return prev;

        return {
          ...prev,
          [currentQ.targetId]: {
            ...currentItemState,
            level: 0,
            attempts: currentItemState.attempts + 1
          }
        };
      });

      // Speak the correct word so user hears it immediately
      speak(currentQ.targetItem.term);

      // Record to parent & weak words storage
      onRecordResult(currentQ.targetId, false);
      weakWordsStorage.addWeakWord(courseCode, lessonSlug, currentQ.targetId);
    }
  };

  // Next Question or Trigger Round Summary (Clean, direct state updates without nested updater side-effects)
  const handleNextQuestion = useCallback(() => {
    if (currentQIndex < roundQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setIsCorrectAnswer(null);
    } else {
      // Round completed! Evaluate if all items reached Level 2 (100% Mastered)
      const unmastered = Object.values(progressMap).filter((state) => state.level < 2);
      if (unmastered.length === 0) {
        setIsSessionFinished(true);
      } else {
        setIsRoundSummary(true);
      }
    }
  }, [currentQIndex, roundQuestions.length, progressMap]);

  // Start Next Round with unmastered items
  const handleStartNextRound = () => {
    const unmastered = Object.values(progressMap).filter((state) => state.level < 2);

    if (unmastered.length === 0) {
      setIsSessionFinished(true);
      return;
    }

    // Build new questions for unmastered items:
    // If an item is at level 1: give it 'meaning-to-term' (Reverse retrieval test)
    // If an item is at level 0: give it 'term-to-meaning' or 'listening-to-meaning'
    const newQuestions = unmastered.map((state) => {
      const dir: QuestionDirection =
        state.level === 1
          ? 'meaning-to-term'
          : Math.random() > 0.5
          ? 'term-to-meaning'
          : 'listening-to-meaning';
      return buildQuestion(state.item, dir);
    });

    setRoundNumber((prev) => prev + 1);
    setRoundQuestions(shuffle(newQuestions));
    setCurrentQIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrectAnswer(null);
    setIsRoundSummary(false);
    setRoundCorrectCount(0);
    setRoundTotalAnswered(0);
  };

  // Use refs for handlers so keyboard effect always calls the latest version
  const handleNextQuestionRef = useRef(handleNextQuestion);
  handleNextQuestionRef.current = handleNextQuestion;
  const handleStartNextRoundRef = useRef(handleStartNextRound);
  handleStartNextRoundRef.current = handleStartNextRound;
  const initializeSessionRef = useRef(initializeSession);
  initializeSessionRef.current = initializeSession;

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isRoundSummary || isSessionFinished) {
        if (e.key === 'Enter') {
          if (isRoundSummary) handleStartNextRoundRef.current();
          else initializeSessionRef.current();
        }
        return;
      }

      if (!isAnswered) {
        if (e.key === '1' || e.key.toLowerCase() === 'a') handleSelectOption('A');
        else if (e.key === '2' || e.key.toLowerCase() === 'b') handleSelectOption('B');
        else if (e.key === '3' || e.key.toLowerCase() === 'c') handleSelectOption('C');
        else if (e.key === '4' || e.key.toLowerCase() === 'd') handleSelectOption('D');
      } else {
        if (e.key === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleNextQuestionRef.current();
        }
      }

      if (e.key.toLowerCase() === 'p' && currentQ) {
        speak(currentQ.targetItem.term);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isAnswered,
    isRoundSummary,
    isSessionFinished,
    currentQ,
    speak
  ]);

  // Compute Overall Mastery Stats (Leitner 2-point system: 1 pt for Level 1, 2 pts for Level 2)
  const totalItemsCount = validItems.length;
  const masteredItemsCount = Object.values(progressMap).filter((s) => s.level === 2).length;
  const familiarItemsCount = Object.values(progressMap).filter((s) => s.level === 1).length;
  const maxLeitnerPoints = totalItemsCount * 2;
  const earnedLeitnerPoints = (masteredItemsCount * 2) + familiarItemsCount;
  const overallMasteryPercent =
    maxLeitnerPoints > 0 ? Math.round((earnedLeitnerPoints / maxLeitnerPoints) * 100) : 0;

  // Empty State Guard
  if (validItems.length < 2) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <HelpCircle size={48} className="mx-auto mb-3 text-slate-300" />
        <h4 className="text-base font-bold text-slate-800 mb-1">Chưa có đủ từ vựng</h4>
        <p className="text-xs text-slate-500">
          Bài học này cần tối thiểu 2 từ vựng để bắt đầu Chế độ Luyện Thuộc 100%.
        </p>
      </div>
    );
  }

  // 1. VICTORY 100% SCREEN
  if (isSessionFinished) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center px-2 py-4 animate-fadeIn">
        <div className="w-full rounded-3xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-50/80 via-white to-orange-50/40 p-6 text-center shadow-xl sm:p-10">
          {/* Trophy Header */}
          <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-400 text-white shadow-lg shadow-amber-400/30">
            <Trophy size={44} className="animate-bounce" />
            <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#F05A28] text-[11px] font-black text-white shadow-xs">
              100%
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100/80 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-800 mb-2">
            <Sparkles size={14} className="text-emerald-600" />
            Đạt Chuẩn Thành Thạo 100%
          </div>

          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl mb-2">
            Tuyệt Vời! Bạn Đã Thuộc Làu Bài Này!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
            Theo nguyên lý Leitner & Active Recall, toàn bộ <strong className="text-slate-900">{totalItemsCount} từ vựng</strong> đã được bạn trả lời đúng ở 2 chiều câu hỏi khác nhau.
          </p>

          {/* Performance Stats Cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-8">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Tổng từ thuộc</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
                {masteredItemsCount}/{totalItemsCount}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Số Vòng học</span>
              <span className="text-xl sm:text-2xl font-black text-indigo-600 font-mono">
                {roundNumber} Vòng
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Chuỗi đúng dài nhất</span>
              <span className="text-xl sm:text-2xl font-black text-[#F05A28] font-mono flex items-center justify-center gap-1">
                <Flame size={18} className="text-orange-500 fill-orange-500" />
                {bestStreak}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={initializeSession}
              className="flex min-h-12 w-full flex-1 items-center justify-center gap-2 rounded-2xl bg-[#F05A28] hover:bg-[#d94817] px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw size={16} />
              <span>Luyện lại bài này</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ROUND SUMMARY TRANSITION SCREEN
  if (isRoundSummary) {
    const remainingCount = totalItemsCount - masteredItemsCount;
    const roundAccuracyPercent =
      roundTotalAnswered > 0 ? Math.round((roundCorrectCount / roundTotalAnswered) * 100) : 100;

    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center px-2 py-4 animate-fadeIn">
        <div className="w-full rounded-3xl border-2 border-indigo-200 bg-white p-6 text-center shadow-lg sm:p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-2xs">
            <GraduationCap size={34} />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            Tổng Kết Vòng {roundNumber}
          </span>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
            Đã thuộc vững {masteredItemsCount}/{totalItemsCount} từ vựng!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4 leading-relaxed">
            Hệ thống Leitner đã lọc ra <strong className="text-rose-600 font-bold">{remainingCount} từ</strong> bạn chưa trả lời đúng đủ 2 lần. Hãy tiếp tục Vòng {roundNumber + 1} để ghi nhớ trọn vẹn!
          </p>

          {/* Round Accuracy Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200">
            <span>Độ chính xác Vòng {roundNumber}:</span>
            <strong className="text-[#F05A28] font-bold font-mono">{roundAccuracyPercent}%</strong>
            <span className="text-slate-400 font-mono text-[11px]">({roundCorrectCount}/{roundTotalAnswered} câu)</span>
          </div>

          {/* Progress Breakdown */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
              <span>Tiến độ thuộc bài học</span>
              <span className="font-mono text-[#F05A28] font-black">{overallMasteryPercent}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(masteredItemsCount / totalItemsCount) * 100}%` }}
                title={`Đã thuộc 100%: ${masteredItemsCount} từ`}
              />
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${(familiarItemsCount / totalItemsCount) * 100}%` }}
                title={`Tạm nhớ (1 lần đúng): ${familiarItemsCount} từ`}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Đã thuộc: {masteredItemsCount}
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <Check size={12} className="text-amber-500" />
                Tạm nhớ: {familiarItemsCount}
              </span>
              <span className="flex items-center gap-1 text-rose-700">
                <XCircle size={12} className="text-rose-500" />
                Cần ôn: {remainingCount}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartNextRound}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#F05A28] hover:bg-[#d94817] px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
          >
            <span>Bắt đầu Vòng {roundNumber + 1} ({remainingCount} từ)</span>
            <ArrowRight size={16} />
          </button>
          <span className="block mt-2 text-[11px] text-slate-400 font-medium">
            (Hoặc nhấn phím Enter để tiếp tục)
          </span>
        </div>
      </div>
    );
  }

  // 3. MAIN LEARNING QUESTION SCREEN
  if (!currentQ) return null;

  const currentItemState = progressMap[currentQ.targetId];
  const isTargetAtLevel1 = currentItemState?.level === 1;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-0 sm:px-2">
      {/* ── Top Session Indicators ── */}
      <div className="w-full mb-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
          {/* Round & Step Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1E293B] text-white font-bold font-mono text-xs shadow-2xs">
              <Layers size={13} className="text-orange-400" />
              VÒNG {roundNumber}
            </span>

            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[11px] font-mono">
              Câu {currentQIndex + 1}/{roundQuestions.length}
            </span>
          </div>

          {/* Overall Mastery Percentage & Dual Progress */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {streak > 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 font-bold border border-orange-200 text-[11px] animate-pulse">
                <Flame size={13} className="text-[#F05A28] fill-orange-500" />
                Chuỗi {streak}
              </span>
            )}

            {/* Level 2: Đã thuộc 100% */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]"
              title="Số từ đã thuộc 100% (đúng 2 lần ở cả 2 chiều câu hỏi)"
            >
              <Award size={13} className="text-emerald-600 shrink-0" />
              <span>Thuộc: <strong>{masteredItemsCount}/{totalItemsCount}</strong></span>
            </div>

            {/* Level 1: Tạm nhớ (Đang trong tiến trình) */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 font-bold border border-amber-200 text-[11px]"
              title="Số từ đã trả lời đúng 1 lần (cần 1 lần đảo chiều ở vòng sau để thuộc 100%)"
            >
              <Check size={12} className="text-amber-600 shrink-0" />
              <span>Tạm nhớ: <strong>{familiarItemsCount}</strong></span>
              <span className="text-amber-700 font-mono font-black">({overallMasteryPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Dual Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#F05A28] h-full transition-all duration-300"
            style={{ width: `${((currentQIndex + 1) / roundQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Question Card Box ── */}
      <div
        className={`w-full rounded-3xl border-2 bg-white p-5 text-center shadow-md transition-all duration-200 sm:p-7 ${
          shakeCard ? 'animate-shake border-rose-400' : 'border-slate-200'
        }`}
      >
        {/* Verification Status Tag */}
        <div className="mb-3 flex items-center justify-center gap-2">
          {isTargetAtLevel1 ? (
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Check size={12} className="text-amber-600" />
              Xác thực lần 2 (Đảo chiều)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              <HelpCircle size={12} className="text-slate-500" />
              Vòng ghi nhớ
            </span>
          )}

          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
            {currentQ.partOfSpeech}
          </span>
        </div>

        {/* Prompt Title */}
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          {currentQ.prompt}
        </p>

        {/* Central Display Item */}
        <div className="my-2 flex items-center justify-center gap-3">
          <h3
            className={`break-words text-3xl font-black text-slate-900 sm:text-4xl ${
              language.kind === 'english' ? 'font-sans' : 'font-japanese'
            }`}
          >
            {currentQ.termDisplay}
          </h3>

          <button
            type="button"
            onClick={() => speak(currentQ.targetItem.term)}
            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:border-orange-300 hover:bg-orange-50 hover:text-[#F05A28] transition-colors cursor-pointer"
            title="Nghe phát âm (Phím P)"
            aria-label="Phát âm từ vựng"
          >
            <Volume2 size={20} />
          </button>
        </div>

        {/* Sub-reading (Furigana / Pinyin / IPA) */}
        {currentQ.readingDisplay && (
          <div
            className={`text-sm font-bold text-[#F05A28] mb-4 ${
              language.kind === 'english' ? 'font-mono' : 'font-japanese'
            }`}
          >
            {currentQ.readingDisplay}
          </div>
        )}

        {/* 4 Choices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrectOption = opt.id === currentQ.correctOptionId;

            let btnClasses =
              'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/90 hover:border-slate-300';
            let badgeClasses = 'border-slate-200 bg-white text-slate-700';

            if (isAnswered) {
              if (isCorrectOption) {
                btnClasses =
                  'bg-emerald-50 text-emerald-950 border-emerald-500 ring-2 ring-emerald-500/20 font-bold';
                badgeClasses = 'border-emerald-500 bg-emerald-500 text-white font-bold';
              } else if (isSelected && !isCorrectOption) {
                btnClasses =
                  'bg-rose-50 text-rose-950 border-rose-500 ring-2 ring-rose-500/20 font-bold';
                badgeClasses = 'border-rose-500 bg-rose-500 text-white font-bold';
              } else {
                btnClasses = 'bg-slate-50 text-slate-400 border-slate-100 opacity-60';
                badgeClasses = 'border-slate-200 bg-slate-100 text-slate-400';
              }
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt.id)}
                className={`min-h-[54px] rounded-2xl border-2 px-3.5 py-3 text-left text-sm font-semibold transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer ${btnClasses}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border font-mono text-xs shadow-2xs transition-colors duration-200 ${badgeClasses}`}>
                    {opt.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block break-words whitespace-normal font-semibold">
                      {opt.text}
                    </span>
                    {opt.subtext && (
                      <span className="block text-[11px] text-slate-500 font-mono">
                        {opt.subtext}
                      </span>
                    )}
                  </div>
                </div>

                {isAnswered && isCorrectOption && (
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                )}
                {isAnswered && isSelected && !isCorrectOption && (
                  <XCircle size={18} className="shrink-0 text-rose-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Feedback & Next Section ── */}
        {isAnswered && (
          <div className="mt-5 border-t border-slate-100 pt-4 animate-fadeIn">
            {/* Incorrect Answer Cognitive Feedback Card */}
            {!isCorrectAnswer && (() => {
              const correctOptionObj = currentQ.options.find((o) => o.id === currentQ.correctOptionId);
              return (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-left text-xs text-rose-900">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700 mb-1.5">
                    <XCircle size={16} className="shrink-0" />
                    <span>Chưa chính xác! Cùng học lại từ này nhé:</span>
                  </div>
                  <div className="space-y-1 pl-5">
                    <p className="font-semibold text-slate-900">
                      Đáp án đúng:{' '}
                      <span className="text-emerald-700 font-bold">
                        {currentQ.correctOptionId}. {correctOptionObj?.text || currentQ.targetItem.meaning}
                      </span>
                      {correctOptionObj?.subtext && (
                        <span className="ml-1 text-slate-500 font-mono text-xs">
                          ({correctOptionObj.subtext})
                        </span>
                      )}
                    </p>
                    <p className="text-slate-600">
                      Từ vựng: <strong className="text-slate-900">{currentQ.targetItem.term}</strong>
                      {currentQ.targetItem.reading && currentQ.targetItem.reading !== currentQ.targetItem.term && (
                        <span> ({currentQ.targetItem.reading})</span>
                      )}
                      {' — '}
                      <span>{currentQ.targetItem.meaning}</span>
                    </p>
                    {currentQ.targetItem.examples && currentQ.targetItem.examples.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-rose-200/60 text-slate-700 text-[11px] italic">
                        <span>Ví dụ: "{currentQ.targetItem.examples[0].japanese || currentQ.targetItem.examples[0].reading}" — {currentQ.targetItem.examples[0].vietnamese}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Correct Answer Encouragement */}
            {isCorrectAnswer && (
              <div className="mb-3 text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-200 py-2.5 px-3 rounded-xl">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>
                  {isTargetAtLevel1
                    ? 'Xuất sắc! Từ này đã đạt chuẩn THÀNH THẠO 100%!'
                    : 'Chính xác! Từ đã được chuyển sang trạng thái Tạm Nhớ (Cần xác thực 1 lần nữa ở vòng sau).'}
                </span>
              </div>
            )}

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNextQuestion}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1E293B] hover:bg-[#F05A28] px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 cursor-pointer active:scale-98"
            >
              <span>
                {currentQIndex < roundQuestions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành Vòng này'}
              </span>
              <ArrowRight size={16} />
            </button>
            <span className="block mt-2 text-[11px] text-slate-400 font-medium">
              (Nhấn phím Enter hoặc Space để tiếp tục)
            </span>
          </div>
        )}
      </div>

      {/* Footer Scientific Hint */}
      <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <Sparkles size={13} className="text-amber-500" />
        <span>Hệ thống áp dụng thuật toán Leitner: Mỗi từ cần 2 lần đúng ở 2 chiều để đạt 100%</span>
      </div>
    </div>
  );
}
