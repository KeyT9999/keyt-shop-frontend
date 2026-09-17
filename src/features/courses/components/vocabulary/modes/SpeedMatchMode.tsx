import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Zap,
  RotateCcw,
  Trophy,
  Sparkles,
  ChevronRight,
  Flame
} from 'lucide-react';
import type { VocabularyItem } from '../../../types';
import { weakWordsStorage } from '../../../utils/weakWordsStorage';

interface SpeedMatchModeProps {
  items: VocabularyItem[];
  courseCode: string;
  lessonSlug: string;
  onRecordResult: (id: string, isCorrect: boolean) => void;
}

interface MatchCard {
  id: string; // unique card id (e.g. '123_jp' or '123_vi')
  wordId: string;
  type: 'japanese' | 'vietnamese';
  text: string;
  subtext?: string;
  originalItem: VocabularyItem;
}

export default function SpeedMatchMode({
  items,
  courseCode,
  lessonSlug,
  onRecordResult
}: SpeedMatchModeProps) {
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<MatchCard | null>(null);
  const [matchedWordIds, setMatchedWordIds] = useState<Set<string>>(new Set());
  const [wrongPairIds, setWrongPairIds] = useState<string[]>([]);
  const [justMatchedPairIds, setJustMatchedPairIds] = useState<string[]>([]);

  // Timer states
  const [isStarted, setIsStarted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const storageKey = `speed_match_best_${(courseCode || 'jpd123').toLowerCase()}_${lessonSlug}`;
  const [personalBest, setPersonalBest] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? parseFloat(saved) : null;
    } catch {
      return null;
    }
  });

  // Speech Helper
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  }, []);

  // Initialize game with 6 random pairs
  const initGame = useCallback(() => {
    if (!items || items.length === 0) return;

    // Reset game states
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedCard(null);
    setMatchedWordIds(new Set());
    setWrongPairIds([]);
    setJustMatchedPairIds([]);
    setIsVictory(false);
    setIsNewRecord(false);
    setStreakCount(0);
    setElapsedMs(0);
    setIsStarted(false);

    // Pick 6 random words (or all if < 6)
    const shuffledPool = [...items].sort(() => Math.random() - 0.5);
    const chosenItems = shuffledPool.slice(0, Math.min(6, items.length));

    const gameCards: MatchCard[] = [];
    chosenItems.forEach((item) => {
      gameCards.push({
        id: `${item._id}_jp`,
        wordId: item._id,
        type: 'japanese',
        text: item.term,
        subtext: item.reading !== item.term ? item.reading : undefined,
        originalItem: item
      });
      gameCards.push({
        id: `${item._id}_vi`,
        wordId: item._id,
        type: 'vietnamese',
        text: item.meaning,
        originalItem: item
      });
    });

    // Shuffle all 12 cards
    setCards(gameCards.sort(() => Math.random() - 0.5));
  }, [items]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Start timer on first card click
  const startTimer = () => {
    if (!isStarted) {
      setIsStarted(true);
      startTimeRef.current = Date.now() - elapsedMs;
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 50);
    }
  };

  // Stop timer on victory
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Handle Card Click
  const handleCardClick = (card: MatchCard) => {
    // If already matched or clicking on wrong pair animation, ignore
    if (matchedWordIds.has(card.wordId) || wrongPairIds.includes(card.id)) return;

    startTimer();

    // If no card is currently selected
    if (!selectedCard) {
      setSelectedCard(card);
      if (card.type === 'japanese') {
        speak(card.text);
      }
      return;
    }

    // If clicked on the same card, deselect
    if (selectedCard.id === card.id) {
      setSelectedCard(null);
      return;
    }

    // Check if match
    const isMatch = selectedCard.wordId === card.wordId && selectedCard.type !== card.type;

    if (isMatch) {
      // Correct Match!
      const currentWordId = card.wordId;
      setJustMatchedPairIds([selectedCard.id, card.id]);
      setStreakCount((prev) => prev + 1);

      // Play audio of Japanese term
      speak(card.originalItem.term);

      // Record result
      onRecordResult(currentWordId, true);
      weakWordsStorage.recordAttempt(courseCode, lessonSlug, currentWordId, true);

      setTimeout(() => {
        setMatchedWordIds((prev) => {
          const next = new Set(prev).add(currentWordId);
          // Check Victory
          const totalPairs = cards.length / 2;
          if (next.size >= totalPairs) {
            stopTimer();
            setIsVictory(true);

            // Calculate final time in seconds
            const finalSec = parseFloat(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
            if (!personalBest || finalSec < personalBest) {
              setIsNewRecord(true);
              setPersonalBest(finalSec);
              try {
                localStorage.setItem(storageKey, finalSec.toString());
              } catch {
                // ignore
              }
            }
          }
          return next;
        });
        setJustMatchedPairIds([]);
        setSelectedCard(null);
      }, 350);
    } else {
      // Wrong Match!
      setStreakCount(0);
      setWrongPairIds([selectedCard.id, card.id]);

      // Record mistake
      weakWordsStorage.addWeakWord(courseCode, lessonSlug, selectedCard.wordId);
      weakWordsStorage.addWeakWord(courseCode, lessonSlug, card.wordId);
      onRecordResult(selectedCard.wordId, false);

      setTimeout(() => {
        setWrongPairIds([]);
        setSelectedCard(null);
      }, 500);
    }
  };

  const formattedSeconds = (elapsedMs / 1000).toFixed(1);
  const totalPairs = cards.length / 2;
  const remainingPairs = totalPairs - matchedWordIds.size;

  if (items.length < 3) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        Bài học cần ít nhất 3 từ vựng để mở trò chơi Ghép Cặp Thần Tốc.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center select-none">
      {/* ── Top Bar: Stopwatch & Personal Best ── */}
      <div className="w-full mb-6 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
        {/* Left: Stopwatch */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#F05A28] flex items-center justify-center font-bold">
            <Zap size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Thời Gian Đua
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 leading-none">
              {formattedSeconds}s
            </div>
          </div>
        </div>

        {/* Center: Streak / Remaining */}
        <div className="hidden sm:flex items-center gap-2">
          {streakCount >= 2 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-orange-500 to-amber-500 text-white font-black text-xs shadow-xs animate-bounce">
              <Flame size={14} />
              <span>Combo x{streakCount}!</span>
            </div>
          )}
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs">
            Còn lại: <strong className="text-slate-900">{remainingPairs}</strong> cặp
          </span>
        </div>

        {/* Right: Personal Best & Restart */}
        <div className="flex items-center gap-2">
          {personalBest !== null && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-bold">
              <Trophy size={14} className="text-amber-500" />
              <span>Kỷ lục: {personalBest}s</span>
            </div>
          )}

          <button
            type="button"
            onClick={initGame}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            title="Làm mới bảng thẻ"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* ── Match Cards Grid (3x4 or 4x3) ── */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3.5">
        {cards.map((card) => {
          const isMatched = matchedWordIds.has(card.wordId);
          const isSelected = selectedCard?.id === card.id;
          const isWrong = wrongPairIds.includes(card.id);
          const isJustMatched = justMatchedPairIds.includes(card.id);

          // Card Styles
          let cardStyle =
            'bg-white text-slate-800 border-2 border-slate-200 hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0';

          if (isSelected) {
            cardStyle =
              'bg-orange-50/90 text-orange-950 border-2 border-orange-500 shadow-lg scale-102 ring-3 ring-orange-200';
          }

          if (isWrong) {
            cardStyle =
              'bg-rose-50 text-rose-900 border-2 border-rose-500 shadow-md ring-3 ring-rose-200 animate-shake';
          }

          if (isJustMatched) {
            cardStyle =
              'bg-emerald-50 text-emerald-900 border-2 border-emerald-500 shadow-lg ring-3 ring-emerald-200 scale-105';
          }

          if (isMatched) {
            cardStyle = 'opacity-0 pointer-events-none scale-90 transition-all duration-300';
          }

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(card)}
              disabled={isMatched}
              className={`min-h-[110px] sm:min-h-[125px] p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${cardStyle}`}
            >
              {card.type === 'japanese' ? (
                <div className="space-y-1">
                  {card.subtext && (
                    <div className="text-xs font-bold text-[#F05A28] font-japanese leading-none">
                      {card.subtext}
                    </div>
                  )}
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-japanese leading-snug">
                    {card.text}
                  </div>
                </div>
              ) : (
                <div className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                  {card.text}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Helper Instruction ── */}
      <div className="mt-6 text-center text-xs text-slate-400 font-medium">
        💡 Click 1 thẻ Tiếng Nhật và 1 thẻ Ý Nghĩa để ghép cặp. Càng nhanh thứ hạng càng cao!
      </div>

      {/* ── Victory Modal ── */}
      {isVictory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-linear-to-tr from-amber-400 to-[#F05A28] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
              <Trophy size={32} />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
              Tuyệt Vời! Đã Hoàn Thành!
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Bạn đã ghép chính xác toàn bộ 6 cặp từ vựng!
            </p>

            {/* Stats Badge */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200/80">
                <div className="text-3xl font-black text-[#F05A28] font-mono">
                  {formattedSeconds}s
                </div>
                <div className="text-xs font-bold text-orange-600 mt-1">Thời gian lần này</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80">
                <div className="text-3xl font-black text-amber-700 font-mono">
                  {personalBest !== null ? `${personalBest}s` : `${formattedSeconds}s`}
                </div>
                <div className="text-xs font-bold text-amber-600 mt-1">
                  {isNewRecord ? '🔥 Kỷ Lục Mới!' : 'Kỷ lục tốt nhất'}
                </div>
              </div>
            </div>

            {isNewRecord && (
              <div className="mb-6 p-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
                <Sparkles size={16} />
                <span>Chúc mừng! Bạn vừa thiết lập Kỷ Lục Mới cho bài học này!</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={initGame}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F05A28] hover:bg-[#d94817] text-white font-bold text-sm transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Chơi vòng mới (6 từ ngẫu nhiên)</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => setIsVictory(false)}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Xem lại bảng chơi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
