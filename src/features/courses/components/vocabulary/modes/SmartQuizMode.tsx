import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Headphones,
  FileText,
  Languages,
  BookOpen,
  Sliders
} from 'lucide-react';
import type { VocabularyItem } from '../../../types';
import { weakWordsStorage } from '../../../utils/weakWordsStorage';

interface SmartQuizModeProps {
  items: VocabularyItem[];
  courseCode: string;
  lessonSlug: string;
  onRecordResult: (id: string, isCorrect: boolean) => void;
}

type QuestionFormat = 'kanji-to-reading' | 'audio-listening' | 'context-cloze' | 'viet-to-jp';

interface SmartQuizOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string; // Kanji / Japanese word or Vietnamese meaning
  subtext?: string; // Hiragana reading or meaning
  romaji?: string;
  isCorrect: boolean;
}

interface SmartQuizQuestion {
  id: string;
  format: QuestionFormat;
  formatLabel: string;
  formatIcon: typeof BookOpen;
  badgeColor: string;
  prompt: string;
  subprompt?: string;
  contextSentence?: string;
  contextTranslation?: string;
  audioTextToPlay?: string;
  targetItem: VocabularyItem;
  options: SmartQuizOption[];
}

export default function SmartQuizMode({
  items,
  courseCode,
  lessonSlug,
  onRecordResult
}: SmartQuizModeProps) {
  // Question pool and quiz configuration
  const defaultCount = Math.min(10, Math.max(3, items.length));
  const [questionCount, setQuestionCount] = useState<number>(defaultCount);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [customInputCount, setCustomInputCount] = useState<string>(defaultCount.toString());

  const [questions, setQuestions] = useState<SmartQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wrongItems, setWrongItems] = useState<VocabularyItem[]>([]);
  const [answersHistory, setAnswersHistory] = useState<
    Array<{
      question: SmartQuizQuestion;
      selectedOptionId: string;
      isCorrect: boolean;
    }>
  >([]);

  // Ref to prevent parent `items` state changes from wiping the quiz
  const itemsPoolRef = useRef<VocabularyItem[]>(items);
  useEffect(() => {
    itemsPoolRef.current = items;
  }, [items]);

  // Speech Helper
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  }, []);

  // Generate quiz questions
  const generateQuiz = useCallback(
    (count?: number) => {
      const sourceItems = itemsPoolRef.current && itemsPoolRef.current.length > 0 ? itemsPoolRef.current : items;
      if (!sourceItems || sourceItems.length < 2) return;

      const targetCount = count !== undefined ? count : questionCount;
      const validCount = Math.min(targetCount, sourceItems.length);

      const shuffledItems = [...sourceItems].sort(() => Math.random() - 0.5);
      const selectedPool = shuffledItems.slice(0, validCount);

      const generated: SmartQuizQuestion[] = [];

      selectedPool.forEach((target, index) => {
        // Determine available formats
        const formatOptions: QuestionFormat[] = ['viet-to-jp', 'audio-listening'];
        if (target.term !== target.reading) {
          formatOptions.push('kanji-to-reading');
        }
        if (target.examples && target.examples.length > 0) {
          formatOptions.push('context-cloze');
        }

        const format = formatOptions[index % formatOptions.length];

        // Distractors pool
        const otherItems = sourceItems
          .filter((it) => (it._id ? it._id !== target._id : it.term !== target.term))
          .sort(() => Math.random() - 0.5);
        const distractors = otherItems.slice(0, 3);

        let question: SmartQuizQuestion;

        if (format === 'kanji-to-reading' && target.term !== target.reading) {
          // ── Dạng 1: Đọc Kanji → Hiragana ──
          const rawOptions = [
            { text: target.reading, subtext: target.meaning, romaji: target.romaji, isCorrect: true },
            ...distractors.map((d) => ({
              text: d.reading,
              subtext: d.meaning,
              romaji: d.romaji,
              isCorrect: false
            }))
          ].sort(() => Math.random() - 0.5);

          question = {
            id: `q_${index}`,
            format,
            formatLabel: 'Hán Tự → Cách Đọc Hiragana',
            formatIcon: FileText,
            badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
            prompt: target.term,
            subprompt: `Chữ Hán trên có cách đọc Hiragana đúng là gì? (Nghĩa: ${target.meaning})`,
            audioTextToPlay: target.term,
            targetItem: target,
            options: rawOptions.map((opt, i) => ({
              id: String.fromCharCode(65 + i),
              text: opt.text,
              subtext: opt.subtext,
              romaji: opt.romaji,
              isCorrect: opt.isCorrect
            }))
          };
        } else if (format === 'context-cloze' && target.examples && target.examples[0]) {
          // ── Dạng 3: Điền từ vào ngữ cảnh (FE FPT) ──
          const ex = target.examples[0];
          const blankCloze = ex.japanese.includes(target.term)
            ? ex.japanese.replace(target.term, '【 _____ 】')
            : ex.japanese.replace(target.reading, '【 _____ 】');

          const rawOptions = [
            {
              text: target.term,
              subtext: target.reading !== target.term ? target.reading : undefined,
              romaji: target.romaji,
              isCorrect: true
            },
            ...distractors.map((d) => ({
              text: d.term,
              subtext: d.reading !== d.term ? d.reading : undefined,
              romaji: d.romaji,
              isCorrect: false
            }))
          ].sort(() => Math.random() - 0.5);

          question = {
            id: `q_${index}`,
            format,
            formatLabel: 'Điền Từ Ngữ Cảnh (FE FPT)',
            formatIcon: Languages,
            badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            prompt: blankCloze,
            subprompt: `Chọn từ thích hợp để hoàn thành câu (Nghĩa: "${ex.vietnamese}")`,
            contextSentence: ex.japanese,
            contextTranslation: ex.vietnamese,
            audioTextToPlay: ex.japanese,
            targetItem: target,
            options: rawOptions.map((opt, i) => ({
              id: String.fromCharCode(65 + i),
              text: opt.text,
              subtext: opt.subtext,
              romaji: opt.romaji,
              isCorrect: opt.isCorrect
            }))
          };
        } else if (format === 'audio-listening') {
          // ── Dạng 2: Nghe phát âm đoán từ ──
          const rawOptions = [
            {
              text: target.meaning,
              subtext: target.term !== target.reading ? `${target.term} (${target.reading})` : target.term,
              romaji: target.romaji,
              isCorrect: true
            },
            ...distractors.map((d) => ({
              text: d.meaning,
              subtext: d.term !== d.reading ? `${d.term} (${d.reading})` : d.term,
              romaji: d.romaji,
              isCorrect: false
            }))
          ].sort(() => Math.random() - 0.5);

          question = {
            id: `q_${index}`,
            format,
            formatLabel: 'Luyện Tai Nghe & Phản Xạ',
            formatIcon: Headphones,
            badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            prompt: '🔊 Nhấn loa để nghe phát âm',
            subprompt: 'Chọn nghĩa tiếng Việt chính xác của từ bạn vừa nghe được:',
            audioTextToPlay: target.term,
            targetItem: target,
            options: rawOptions.map((opt, i) => ({
              id: String.fromCharCode(65 + i),
              text: opt.text,
              subtext: opt.subtext,
              romaji: opt.romaji,
              isCorrect: opt.isCorrect
            }))
          };
        } else {
          // ── Dạng 4: Phản xạ ngược Việt → Nhật ──
          const rawOptions = [
            {
              text: target.term,
              subtext: target.reading !== target.term ? target.reading : undefined,
              romaji: target.romaji,
              isCorrect: true
            },
            ...distractors.map((d) => ({
              text: d.term,
              subtext: d.reading !== d.term ? d.reading : undefined,
              romaji: d.romaji,
              isCorrect: false
            }))
          ].sort(() => Math.random() - 0.5);

          question = {
            id: `q_${index}`,
            format: 'viet-to-jp',
            formatLabel: 'Phản Xạ Việt → Nhật',
            formatIcon: BookOpen,
            badgeColor: 'bg-orange-50 text-[#F05A28] border-orange-200',
            prompt: `「${target.meaning}」`,
            subprompt: 'Từ vựng tiếng Nhật nào tương ứng với ý nghĩa trên?',
            audioTextToPlay: target.term,
            targetItem: target,
            options: rawOptions.map((opt, i) => ({
              id: String.fromCharCode(65 + i),
              text: opt.text,
              subtext: opt.subtext,
              romaji: opt.romaji,
              isCorrect: opt.isCorrect
            }))
          };
        }

        generated.push(question);
      });

      setQuestions(generated);
      setCurrentIndex(0);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setScore(0);
      setIsCompleted(false);
      setWrongItems([]);
      setAnswersHistory([]);
    },
    [items, questionCount]
  );

  // Generate on mount or when lessonSlug changes
  useEffect(() => {
    generateQuiz();
  }, [lessonSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentQ = questions[currentIndex];

  // Auto play audio when entering audio-listening question
  useEffect(() => {
    if (currentQ?.format === 'audio-listening' && currentQ.audioTextToPlay && !isAnswered) {
      const timer = setTimeout(() => {
        speak(currentQ.audioTextToPlay!);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentQ, isAnswered, speak]);

  // Handle Option Select
  const handleSelectOption = (optId: string) => {
    if (isAnswered || !currentQ) return;

    setSelectedOptionId(optId);
    setIsAnswered(true);

    const selectedOpt = currentQ.options.find((o) => o.id === optId);
    const isCorrect = !!selectedOpt?.isCorrect;

    // Record answer history
    setAnswersHistory((prev) => [
      ...prev,
      {
        question: currentQ,
        selectedOptionId: optId,
        isCorrect
      }
    ]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      speak(currentQ.targetItem.term);
      if (currentQ.targetItem._id) {
        onRecordResult(currentQ.targetItem._id, true);
        weakWordsStorage.recordAttempt(courseCode, lessonSlug, currentQ.targetItem._id, true);
      }
    } else {
      setWrongItems((prev) => [...prev, currentQ.targetItem]);
      if (currentQ.targetItem._id) {
        weakWordsStorage.addWeakWord(courseCode, lessonSlug, currentQ.targetItem._id);
        onRecordResult(currentQ.targetItem._id, false);
      }
    }
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!isAnswered) {
        if (['1', 'a', 'A'].includes(e.key)) handleSelectOption('A');
        if (['2', 'b', 'B'].includes(e.key)) handleSelectOption('B');
        if (['3', 'c', 'C'].includes(e.key)) handleSelectOption('C');
        if (['4', 'd', 'D'].includes(e.key)) handleSelectOption('D');
      } else {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, handleNext]);

  // Handle Changing Question Count
  const applyQuestionCount = (newCount: number) => {
    const valid = Math.max(2, Math.min(newCount, items.length));
    setQuestionCount(valid);
    setCustomInputCount(valid.toString());
    setShowConfig(false);
    generateQuiz(valid);
  };

  const accuracyPercent = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round((score / questions.length) * 100);
  }, [score, questions.length]);

  // Rank calculation for victory screen
  const getRank = (percent: number) => {
    if (percent === 100) return { rank: 'S', title: 'Thần Sầu (100%)', color: 'from-amber-400 to-orange-500' };
    if (percent >= 80) return { rank: 'A', title: 'Xuất Sắc (≥80%)', color: 'from-emerald-400 to-teal-500' };
    if (percent >= 60) return { rank: 'B', title: 'Đạt Chuẩn (≥60%)', color: 'from-blue-400 to-indigo-500' };
    return { rank: 'C', title: 'Cần Rèn Luyện (<60%)', color: 'from-slate-400 to-slate-600' };
  };

  if (!items || items.length < 2) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        Bài học cần ít nhất 2 từ vựng để tạo Smart Quiz 4 dạng.
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // ── SCREEN: VICTORY & SUMMARY REPORT ─────────────────────────
  // ─────────────────────────────────────────────────────────────
  if (isCompleted) {
    const rankInfo = getRank(accuracyPercent);
    const finalPoints = score * 100;

    return (
      <div className="max-w-2xl mx-auto p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center animate-scaleUp">
        {/* Rank Avatar */}
        <div
          className={`w-20 h-20 rounded-3xl bg-linear-to-tr ${rankInfo.color} text-white flex flex-col items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/20`}
        >
          <span className="text-3xl font-black leading-none">{rankInfo.rank}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{rankInfo.title.split(' ')[0]}</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
          Hoàn Thành Smart Quiz! 🎯
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Bạn vừa hoàn tất {questions.length} câu hỏi trắc nghiệm mô phỏng cấu trúc đề thi FE FPT.
        </p>

        {/* Scorecard Boxes */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200/80">
            <div className="text-2xl sm:text-3xl font-black text-[#F05A28] font-mono">
              {finalPoints}
            </div>
            <div className="text-xs font-bold text-orange-600 mt-1">Tổng điểm số</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
              {score} / {questions.length}
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-1">Số câu đúng</div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200/80">
            <div className="text-2xl sm:text-3xl font-black text-indigo-700 font-mono">
              {accuracyPercent}%
            </div>
            <div className="text-xs font-bold text-indigo-600 mt-1">Độ chính xác</div>
          </div>
        </div>

        {/* List of Weak Words Added */}
        {wrongItems.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-2">
              <XCircle size={15} />
              <span>{wrongItems.length} từ đã được tự động lưu vào "Kho Từ Hay Sai":</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {wrongItems.map((item, idx) => (
                <span
                  key={`${item._id || item.term}_${idx}`}
                  className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-xs font-bold text-slate-800 font-japanese"
                >
                  {item.term} ({item.reading}): {item.meaning}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Review Answers List */}
        <div className="mb-6 text-left border-t border-slate-100 pt-5">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
            Chi tiết {answersHistory.length} câu đã trả lời:
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {answersHistory.map((ans, i) => {
              const q = ans.question;
              const correctOpt = q.options.find((o) => o.isCorrect);
              const userOpt = q.options.find((o) => o.id === ans.selectedOptionId);

              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    ans.isCorrect
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[11px] bg-white border">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-bold font-japanese">{q.prompt}</span>
                      <span className="text-slate-500 mx-1.5">•</span>
                      <span>
                        Đáp án: <strong className="font-japanese font-bold">{correctOpt?.text}</strong>
                        {correctOpt?.subtext ? ` (${correctOpt.subtext})` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1 font-bold">
                    {ans.isCorrect ? (
                      <span className="flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 size={14} />
                        Đúng
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-600">
                        <XCircle size={14} />
                        Sai (chọn {userOpt?.id})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Select Question Count for next round */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-600">
            Số câu cho vòng tiếp theo:
          </div>
          <div className="flex items-center gap-1.5">
            {[5, 10, 15, 20].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => applyQuestionCount(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  questionCount === c
                    ? 'bg-[#F05A28] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-orange-300'
                }`}
              >
                {c} câu
              </button>
            ))}
            <button
              type="button"
              onClick={() => applyQuestionCount(items.length)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                questionCount === items.length
                  ? 'bg-[#F05A28] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-orange-300'
              }`}
            >
              Tất cả ({items.length})
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => generateQuiz()}
          className="w-full py-3.5 px-4 rounded-xl bg-[#F05A28] hover:bg-[#d94817] text-white font-bold text-sm transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw size={16} />
          <span>Làm bộ quiz mới ({questionCount} câu ngẫu nhiên)</span>
        </button>
      </div>
    );
  }

  if (!currentQ) return null;

  const BadgeIcon = currentQ.formatIcon;

  // ─────────────────────────────────────────────────────────────
  // ── SCREEN: ACTIVE QUIZ QUESTION ─────────────────────────────
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* ── Top Bar: Progress, Format, Score & Question Count Config ── */}
      <div className="w-full mb-4 space-y-2">
        <div className="flex items-center justify-between gap-2 px-1 text-xs">
          {/* Format Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs border shadow-2xs ${currentQ.badgeColor}`}
          >
            <BadgeIcon size={14} />
            <span>{currentQ.formatLabel}</span>
          </div>

          {/* Question Counter & Controls */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-mono font-bold text-xs">
              Câu {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-slate-500 font-bold text-xs">
              Điểm: <strong className="text-emerald-600">{score * 100}</strong>
            </span>

            {/* Config button */}
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Tùy chỉnh số lượng câu hỏi"
            >
              <Sliders size={14} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
          <div
            className="h-full bg-linear-to-r from-[#F05A28] to-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Expandable Question Count Selector */}
        {showConfig && (
          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="text-xs font-bold text-slate-700">
              Chọn số lượng câu hỏi:
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => applyQuestionCount(count)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    questionCount === count
                      ? 'bg-[#F05A28] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {count} câu
                </button>
              ))}

              <button
                type="button"
                onClick={() => applyQuestionCount(items.length)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  questionCount === items.length
                    ? 'bg-[#F05A28] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tất cả ({items.length})
              </button>

              {/* Custom number input */}
              <div className="flex items-center gap-1 ml-1 border-l pl-2 border-slate-200">
                <input
                  type="number"
                  min={2}
                  max={items.length}
                  value={customInputCount}
                  onChange={(e) => setCustomInputCount(e.target.value)}
                  className="w-14 px-2 py-1 text-xs font-bold border border-slate-300 rounded-lg text-center"
                />
                <button
                  type="button"
                  onClick={() => applyQuestionCount(parseInt(customInputCount, 10) || 10)}
                  className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Question Card ── */}
      <div className="w-full p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-200/90 shadow-lg text-center mb-6 relative">
        {/* Audio helper button top right */}
        {currentQ.audioTextToPlay && (
          <button
            type="button"
            onClick={() => speak(currentQ.audioTextToPlay!)}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-orange-50 text-[#F05A28] hover:bg-[#F05A28] hover:text-white border border-orange-200 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
            title="Phát âm tiếng Nhật"
          >
            <Volume2 size={16} />
          </button>
        )}

        {/* Format Specific Presentation */}
        {currentQ.format === 'audio-listening' ? (
          <div className="my-3 flex flex-col items-center">
            <button
              type="button"
              onClick={() => speak(currentQ.audioTextToPlay!)}
              className="w-20 h-20 rounded-3xl bg-indigo-50 border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95 mb-3"
              title="Click để nghe lại"
            >
              <Volume2 size={36} />
            </button>
            <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              Nhấn loa để nghe lại
            </div>
          </div>
        ) : (
          <h3 className="text-3xl sm:text-5xl font-black text-slate-900 font-japanese my-3 tracking-wide leading-tight">
            {currentQ.prompt}
          </h3>
        )}

        {currentQ.subprompt && (
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto mt-1">
            {currentQ.subprompt}
          </p>
        )}
      </div>

      {/* ── 4 Option Buttons (Grid 2x2 on sm) with Furigana & Clear Color Feedback ── */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {currentQ.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;

          // Distinct Color Feedback:
          // Unanswered: clean white with orange hover
          // Answered:
          // - Correct option: VIBRANT GREEN (bg-emerald-500 text-white)
          // - Selected wrong option: VIBRANT RED (bg-rose-500 text-white)
          // - Other options: dimmed slate
          let btnStyle =
            'bg-white text-slate-800 border-2 border-slate-200/90 hover:border-[#F05A28] hover:bg-orange-50/40 hover:shadow-md active:translate-y-0.5';

          if (isAnswered) {
            if (opt.isCorrect) {
              btnStyle =
                'bg-emerald-500 text-white border-2 border-emerald-600 shadow-lg ring-4 ring-emerald-200 scale-[1.01]';
            } else if (isSelected && !opt.isCorrect) {
              btnStyle =
                'bg-rose-500 text-white border-2 border-rose-600 shadow-lg ring-4 ring-rose-200 animate-shake';
            } else {
              btnStyle = 'bg-slate-50 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed';
            }
          }

          const isHighlighted = isAnswered && (opt.isCorrect || (isSelected && !opt.isCorrect));

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectOption(opt.id)}
              disabled={isAnswered}
              className={`min-h-[76px] p-4 rounded-2xl text-left transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
            >
              <div className="flex items-center gap-3 w-full">
                {/* Letter Badge [A, B, C, D] */}
                <span
                  className={`w-8 h-8 rounded-xl font-bold font-mono text-xs flex items-center justify-center shrink-0 border transition-colors ${
                    isHighlighted
                      ? 'bg-white/20 text-white border-white/40'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {opt.id}
                </span>

                {/* Option Text with Furigana / Hiragana on top if Kanji */}
                <div className="flex flex-col text-left">
                  {/* Furigana / Hiragana reading ALWAYS visible above Kanji */}
                  {opt.subtext && (
                    <span
                      className={`text-xs font-bold font-japanese leading-none mb-1 transition-colors ${
                        isHighlighted ? 'text-white/90' : 'text-[#F05A28]'
                      }`}
                    >
                      {opt.subtext} {opt.romaji ? `(${opt.romaji})` : ''}
                    </span>
                  )}

                  {/* Main text (Kanji, Kana, or Vietnamese) */}
                  <span
                    className={`text-base sm:text-lg font-black font-japanese leading-snug transition-colors ${
                      isHighlighted ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {opt.text}
                  </span>
                </div>
              </div>

              {/* Status Icon */}
              {isAnswered && (
                <div className="shrink-0">
                  {opt.isCorrect ? (
                    <CheckCircle2 size={24} className="text-white drop-shadow-xs" />
                  ) : isSelected ? (
                    <XCircle size={24} className="text-white drop-shadow-xs" />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Explanation & Next Button ── */}
      {isAnswered && (
        <div className="w-full p-4 rounded-2xl bg-white border border-slate-200/90 shadow-md animate-fadeIn flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-[#F05A28] tracking-wider">
                Giải thích đáp án:
              </span>
              <span className="text-xs font-bold text-slate-700 font-japanese">
                {currentQ.targetItem.term} ({currentQ.targetItem.reading}): {currentQ.targetItem.meaning}
              </span>
            </div>
            {currentQ.contextSentence && (
              <p className="text-xs text-slate-500 font-japanese">
                {currentQ.contextSentence} — {currentQ.contextTranslation}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F05A28] hover:bg-[#d94817] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>{currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả & điểm'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Keyboard Helper */}
      <div className="mt-4 text-center text-xs text-slate-400 font-medium">
        Phím tắt: [1, 2, 3, 4] Chọn đáp án A, B, C, D • [Space / Enter] Câu tiếp theo
      </div>
    </div>
  );
}
