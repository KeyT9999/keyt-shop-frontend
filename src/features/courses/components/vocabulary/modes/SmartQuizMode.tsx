import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Award
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
  options: Array<{
    id: string; // 'A' | 'B' | 'C' | 'D'
    text: string;
    subtext?: string;
    isCorrect: boolean;
  }>;
}

export default function SmartQuizMode({
  items,
  courseCode,
  lessonSlug,
  onRecordResult
}: SmartQuizModeProps) {
  const [questions, setQuestions] = useState<SmartQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wrongItems, setWrongItems] = useState<VocabularyItem[]>([]);

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

  // Generate 10 smart questions cycling through 4 formats
  const generateQuiz = useCallback(() => {
    if (!items || items.length < 3) return;

    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    const selectedPool = shuffledItems.slice(0, Math.min(10, items.length));

    const generated: SmartQuizQuestion[] = [];

    selectedPool.forEach((target, index) => {
      // Determine format: cycle between 4 formats, fallback if no example or no kanji
      const formatOptions: QuestionFormat[] = ['viet-to-jp', 'audio-listening'];
      if (target.term !== target.reading) {
        formatOptions.push('kanji-to-reading');
      }
      if (target.examples && target.examples.length > 0) {
        formatOptions.push('context-cloze');
      }

      const format = formatOptions[index % formatOptions.length];

      // Distractors pool
      const otherItems = items.filter((it) => it._id !== target._id).sort(() => Math.random() - 0.5);
      const distractors = otherItems.slice(0, 3);

      let question: SmartQuizQuestion;

      if (format === 'kanji-to-reading' && target.term !== target.reading) {
        // Dạng 1: Đọc Kanji
        const rawOptions = [
          { text: target.reading, isCorrect: true },
          ...distractors.map((d) => ({ text: d.reading, isCorrect: false }))
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
            isCorrect: opt.isCorrect
          }))
        };
      } else if (format === 'context-cloze' && target.examples && target.examples[0]) {
        // Dạng 3: Điền từ vào ngữ cảnh
        const ex = target.examples[0];
        // Replace target term with blank
        const blankCloze = ex.japanese.includes(target.term)
          ? ex.japanese.replace(target.term, '【 _____ 】')
          : ex.japanese.replace(target.reading, '【 _____ 】');

        const rawOptions = [
          { text: target.term, subtext: target.reading, isCorrect: true },
          ...distractors.map((d) => ({ text: d.term, subtext: d.reading, isCorrect: false }))
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
            subtext: opt.subtext !== opt.text ? opt.subtext : undefined,
            isCorrect: opt.isCorrect
          }))
        };
      } else if (format === 'audio-listening') {
        // Dạng 2: Nghe đoán từ
        const rawOptions = [
          { text: target.meaning, subtext: `${target.term} (${target.reading})`, isCorrect: true },
          ...distractors.map((d) => ({
            text: d.meaning,
            subtext: `${d.term} (${d.reading})`,
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
            isCorrect: opt.isCorrect
          }))
        };
      } else {
        // Dạng 4: Phản xạ ngược Việt -> Nhật
        const rawOptions = [
          { text: target.term, subtext: target.reading, isCorrect: true },
          ...distractors.map((d) => ({ text: d.term, subtext: d.reading, isCorrect: false }))
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
            subtext: opt.subtext !== opt.text ? opt.subtext : undefined,
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
  }, [items]);

  useEffect(() => {
    generateQuiz();
  }, [generateQuiz]);

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

    if (isCorrect) {
      setScore((prev) => prev + 1);
      speak(currentQ.targetItem.term);
      onRecordResult(currentQ.targetItem._id, true);
      weakWordsStorage.recordAttempt(courseCode, lessonSlug, currentQ.targetItem._id, true);
    } else {
      setWrongItems((prev) => [...prev, currentQ.targetItem]);
      weakWordsStorage.addWeakWord(courseCode, lessonSlug, currentQ.targetItem._id);
      onRecordResult(currentQ.targetItem._id, false);
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

  const accuracyPercent = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round((score / questions.length) * 100);
  }, [score, questions.length]);

  if (items.length < 3) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        Bài học cần ít nhất 3 từ vựng để tạo Smart Quiz 4 dạng.
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center animate-scaleUp">
        <div className="w-16 h-16 rounded-full bg-linear-to-tr from-amber-400 to-[#F05A28] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/25">
          <Award size={32} />
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
          Hoàn Thành Smart Quiz!
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Bạn đã trải nghiệm 4 dạng câu hỏi trắc nghiệm chuẩn cấu trúc bài thi FE FPT.
        </p>

        {/* Scorecard Box */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
            <div className="text-3xl font-black text-emerald-700 font-mono">
              {score} / {questions.length}
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-1">Câu trả lời đúng</div>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200/80">
            <div className="text-3xl font-black text-[#F05A28] font-mono">
              {accuracyPercent}%
            </div>
            <div className="text-xs font-bold text-orange-600 mt-1">Độ chính xác</div>
          </div>
        </div>

        {wrongItems.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-2">
              <XCircle size={14} />
              <span>{wrongItems.length} từ đã được đưa vào kho "Cứu Cánh Từ Hay Sai":</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {wrongItems.map((item) => (
                <span
                  key={item._id}
                  className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-xs font-bold text-slate-800 font-japanese"
                >
                  {item.term} ({item.reading}): {item.meaning}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={generateQuiz}
            className="w-full py-3.5 px-4 rounded-xl bg-[#F05A28] hover:bg-[#d94817] text-white font-bold text-sm transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Làm lại bộ câu hỏi mới (10 câu ngẫu nhiên)</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const BadgeIcon = currentQ.formatIcon;

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* ── Top Progress & Format Badge ── */}
      <div className="w-full mb-4 space-y-2">
        <div className="flex items-center justify-between gap-2 px-1 text-xs">
          {/* Format Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs border shadow-2xs ${currentQ.badgeColor}`}
          >
            <BadgeIcon size={14} />
            <span>{currentQ.formatLabel}</span>
          </div>

          {/* Question Counter */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-mono font-bold text-xs">
              Câu {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-slate-500 font-bold text-xs">
              Điểm: <strong className="text-emerald-600">{score}</strong>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
          <div
            className="h-full bg-linear-to-r from-[#F05A28] to-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
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

      {/* ── 4 Option Buttons (Grid 2x2 on sm) ── */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {currentQ.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          let btnStyle =
            'bg-white text-slate-800 border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50/30';

          if (isAnswered) {
            if (opt.isCorrect) {
              btnStyle = 'bg-emerald-50 text-emerald-900 border-2 border-emerald-500 shadow-md ring-2 ring-emerald-200';
            } else if (isSelected && !opt.isCorrect) {
              btnStyle = 'bg-rose-50 text-rose-900 border-2 border-rose-500 shadow-md ring-2 ring-rose-200';
            } else {
              btnStyle = 'bg-slate-50 text-slate-400 border-slate-200 opacity-60';
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectOption(opt.id)}
              disabled={isAnswered}
              className={`p-4 rounded-2xl text-left transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold font-mono text-xs flex items-center justify-center shrink-0 border border-slate-200">
                  {opt.id}
                </span>
                <div>
                  <div className="text-sm sm:text-base font-black text-slate-900 font-japanese leading-tight">
                    {opt.text}
                  </div>
                  {opt.subtext && isAnswered && (
                    <div className="text-xs text-slate-500 mt-0.5">{opt.subtext}</div>
                  )}
                </div>
              </div>

              {isAnswered && (
                <div>
                  {opt.isCorrect ? (
                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  ) : isSelected ? (
                    <XCircle size={20} className="text-rose-600 shrink-0" />
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
            <span>{currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
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
