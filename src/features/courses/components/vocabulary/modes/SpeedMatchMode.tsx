import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Zap,
  RotateCcw,
  Trophy,
  Sparkles,
  ChevronRight,
  Flame,
  Award,
  Target
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
  id: string; // unique card id: e.g. 'wordKey_jp' or 'wordKey_vi'
  wordKey: string;
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
  const [matchedWordKeys, setMatchedWordKeys] = useState<Set<string>>(new Set());
  const [wrongPairIds, setWrongPairIds] = useState<string[]>([]);
  const [justMatchedPairIds, setJustMatchedPairIds] = useState<string[]>([]);

  // Scoring & Stats
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  // Timer states
  const [isStarted, setIsStarted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [finalTimeSec, setFinalTimeSec] = useState(0);

  // Refs to prevent stale closures and avoid re-render timer glitches
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isStartedRef = useRef<boolean>(false);
  const wrongTimeoutRef = useRef<number | null>(null);
  const matchedTimeoutRef = useRef<number | null>(null);
  const itemsPoolRef = useRef<VocabularyItem[]>(items);

  // Always keep latest items in ref without triggering game restart
  useEffect(() => {
    itemsPoolRef.current = items;
  }, [items]);

  const storageKey = `speed_match_best_${(courseCode || 'jpd123').toLowerCase()}_${lessonSlug}`;
  const [personalBest, setPersonalBest] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? parseFloat(saved) : null;
    } catch {
      return null;
    }
  });

  // Speech helper
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  }, []);

  // Stop Stopwatch
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start Stopwatch on first card click
  const ensureTimerStarted = () => {
    if (!isStartedRef.current) {
      isStartedRef.current = true;
      setIsStarted(true);
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 50);
    }
  };

  // Initialize a new round with 6 pairs (12 cards)
  const initGame = useCallback(() => {
    const sourceItems = itemsPoolRef.current && itemsPoolRef.current.length > 0 ? itemsPoolRef.current : items;
    if (!sourceItems || sourceItems.length === 0) return;

    // Clear any running timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (wrongTimeoutRef.current) {
      clearTimeout(wrongTimeoutRef.current);
      wrongTimeoutRef.current = null;
    }
    if (matchedTimeoutRef.current) {
      clearTimeout(matchedTimeoutRef.current);
      matchedTimeoutRef.current = null;
    }

    isStartedRef.current = false;
    setIsStarted(false);
    setElapsedMs(0);
    setFinalTimeSec(0);
    setSelectedCard(null);
    setMatchedWordKeys(new Set());
    setWrongPairIds([]);
    setJustMatchedPairIds([]);
    setIsVictory(false);
    setIsNewRecord(false);
    setScore(0);
    setWrongCount(0);
    setStreakCount(0);

    // Pick 6 random items
    const shuffledPool = [...sourceItems].sort(() => Math.random() - 0.5);
    const chosenItems = shuffledPool.slice(0, Math.min(6, sourceItems.length));

    const gameCards: MatchCard[] = [];
    chosenItems.forEach((item, idx) => {
      const key = item._id || `${item.term}_${item.order || idx}`;
      // Japanese card
      gameCards.push({
        id: `${key}_jp`,
        wordKey: key,
        type: 'japanese',
        text: item.term,
        subtext: item.reading !== item.term ? item.reading : undefined,
        originalItem: item
      });
      // Vietnamese card
      gameCards.push({
        id: `${key}_vi`,
        wordKey: key,
        type: 'vietnamese',
        text: item.meaning,
        originalItem: item
      });
    });

    // Shuffle all 12 cards
    setCards(gameCards.sort(() => Math.random() - 0.5));
  }, [items]);

  // Init once on mount or when switching lessonSlug ONLY
  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
      if (matchedTimeoutRef.current) clearTimeout(matchedTimeoutRef.current);
    };
  }, [lessonSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Card Click
  const handleCardClick = (card: MatchCard) => {
    // If this card is already matched, ignore
    if (matchedWordKeys.has(card.wordKey)) return;

    // Start timer on first interaction
    ensureTimerStarted();

    // If cards are currently flashing red from a wrong attempt, cancel red state early
    if (wrongPairIds.length > 0) {
      if (wrongTimeoutRef.current) {
        clearTimeout(wrongTimeoutRef.current);
        wrongTimeoutRef.current = null;
      }
      setWrongPairIds([]);
      // Select the newly clicked card as card 1
      setSelectedCard(card);
      if (card.type === 'japanese') {
        speak(card.text);
      }
      return;
    }

    // If no card is selected yet, select it
    if (!selectedCard) {
      setSelectedCard(card);
      if (card.type === 'japanese') {
        speak(card.text);
      }
      return;
    }

    // If clicking the same card again, deselect
    if (selectedCard.id === card.id) {
      setSelectedCard(null);
      return;
    }

    // Check if match: same wordKey AND different card type (1 JP, 1 VI)
    const isMatch = selectedCard.wordKey === card.wordKey && selectedCard.type !== card.type;

    if (isMatch) {
      // ── CORRECT MATCH ──
      const matchedKey = card.wordKey;
      const pairIds = [selectedCard.id, card.id];
      setJustMatchedPairIds(pairIds);
      setSelectedCard(null);

      // Pronounce Japanese term
      speak(card.originalItem.term);

      // Calculate score bonus
      const nextStreak = streakCount + 1;
      setStreakCount(nextStreak);
      const streakBonus = nextStreak > 1 ? (nextStreak - 1) * 50 : 0;
      setScore((prev) => prev + 100 + streakBonus);

      // Record result to learning tracking (safe if _id exists)
      if (card.originalItem._id) {
        onRecordResult(card.originalItem._id, true);
        weakWordsStorage.recordAttempt(courseCode, lessonSlug, card.originalItem._id, true);
      }

      // After 300ms flash green, mark as matched and disappear
      matchedTimeoutRef.current = window.setTimeout(() => {
        setJustMatchedPairIds([]);
        setMatchedWordKeys((prev) => {
          const next = new Set(prev).add(matchedKey);
          const totalPairs = cards.length / 2;

          // Check if all pairs are finished
          if (next.size >= totalPairs) {
            stopTimer();
            const finalSec = parseFloat(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
            setFinalTimeSec(finalSec);

            // Calculate final speed score
            const timeBonus = Math.max(0, Math.round(1000 - finalSec * 25));
            setScore((currentScore) => currentScore + timeBonus);

            // Check personal best
            if (!personalBest || finalSec < personalBest) {
              setIsNewRecord(true);
              setPersonalBest(finalSec);
              try {
                localStorage.setItem(storageKey, finalSec.toString());
              } catch {
                // ignore
              }
            }
            setIsVictory(true);
          }
          return next;
        });
      }, 300);
    } else {
      // ── WRONG MATCH ──
      const wrongIds = [selectedCard.id, card.id];
      setWrongPairIds(wrongIds);
      setWrongCount((prev) => prev + 1);
      setStreakCount(0);
      setScore((prev) => Math.max(0, prev - 25));

      // Record mistake
      if (selectedCard.originalItem._id) {
        weakWordsStorage.addWeakWord(courseCode, lessonSlug, selectedCard.originalItem._id);
        onRecordResult(selectedCard.originalItem._id, false);
      }
      if (card.originalItem._id) {
        weakWordsStorage.addWeakWord(courseCode, lessonSlug, card.originalItem._id);
      }

      // Reset wrong state after 450ms so player can continue playing
      wrongTimeoutRef.current = window.setTimeout(() => {
        setWrongPairIds([]);
        setSelectedCard(null);
      }, 450);
    }
  };

  const totalPairs = cards.length / 2;
  const remainingPairs = Math.max(0, totalPairs - matchedWordKeys.size);
  const formattedSeconds = (elapsedMs / 1000).toFixed(1);

  // Rank calculation for victory screen
  const getRank = (time: number, mistakes: number) => {
    if (time <= 12 && mistakes === 0) return { rank: 'S', title: 'Thần Sầu', color: 'from-amber-400 to-orange-500' };
    if (time <= 20 && mistakes <= 1) return { rank: 'A', title: 'Xuất Sắc', color: 'from-emerald-400 to-teal-500' };
    if (time <= 35 && mistakes <= 3) return { rank: 'B', title: 'Khá Giỏi', color: 'from-blue-400 to-indigo-500' };
    return { rank: 'C', title: 'Cần Rèn Luyện', color: 'from-slate-400 to-slate-600' };
  };

  if (!items || items.length < 2) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        Bài học cần ít nhất 2 từ vựng để mở trò chơi Ghép Cặp Thần Tốc.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center select-none">
      {/* ── Top Bar: Stopwatch, Score, Remaining & Best ── */}
      <div className="w-full mb-6 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
        {/* Left: Stopwatch */}
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-colors ${
            isStarted ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' : 'bg-orange-50 text-[#F05A28]'
          }`}>
            <Zap size={22} className={isStarted ? 'animate-pulse' : ''} />
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

        {/* Center: Score & Remaining */}
        <div className="flex items-center gap-2">
          {streakCount >= 2 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-orange-500 to-amber-500 text-white font-black text-xs shadow-xs animate-bounce">
              <Flame size={14} />
              <span>Combo x{streakCount}!</span>
            </div>
          )}

          <div className="px-3 py-1.5 rounded-xl bg-orange-50 text-[#F05A28] border border-orange-200/60 font-black text-xs">
            {score} Điểm
          </div>

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
            title="Làm mới bảng thẻ (6 từ mới)"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* ── Match Cards Grid (3x4 or 4x3) ── */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3.5 min-h-[380px]">
        {cards.map((card) => {
          const isMatched = matchedWordKeys.has(card.wordKey);
          const isSelected = selectedCard?.id === card.id;
          const isWrong = wrongPairIds.includes(card.id);
          const isJustMatched = justMatchedPairIds.includes(card.id);

          // Card Styles based on interaction state
          let cardStyle =
            'bg-white text-slate-800 border-2 border-slate-200/90 hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0';

          if (isSelected) {
            // Selected state: vibrant orange border and warm background
            cardStyle =
              'bg-orange-50/90 text-orange-950 border-2 border-[#F05A28] shadow-lg scale-102 ring-3 ring-orange-300';
          }

          if (isWrong) {
            // Wrong state: red flash & shake
            cardStyle =
              'bg-rose-500 text-white border-2 border-rose-600 shadow-lg ring-3 ring-rose-300 animate-shake';
          }

          if (isJustMatched) {
            // Correct state: green flash
            cardStyle =
              'bg-emerald-500 text-white border-2 border-emerald-600 shadow-xl ring-4 ring-emerald-300 scale-105 animate-pulse';
          }

          if (isMatched) {
            // Matched state: completely disappear from view
            cardStyle = 'opacity-0 pointer-events-none scale-75 transition-all duration-300 invisible';
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
                    <div className={`text-xs font-bold font-japanese leading-none ${
                      isWrong || isJustMatched ? 'text-white/90' : 'text-[#F05A28]'
                    }`}>
                      {card.subtext}
                    </div>
                  )}
                  <div className={`text-xl sm:text-2xl font-black font-japanese leading-snug ${
                    isWrong || isJustMatched ? 'text-white' : 'text-slate-900'
                  }`}>
                    {card.text}
                  </div>
                </div>
              ) : (
                <div className={`text-xs sm:text-sm font-bold leading-snug ${
                  isWrong || isJustMatched ? 'text-white' : 'text-slate-800'
                }`}>
                  {card.text}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Helper Instruction ── */}
      <div className="mt-6 text-center text-xs text-slate-400 font-medium">
        💡 Click 1 thẻ Tiếng Nhật và 1 thẻ Ý Nghĩa để ghép cặp. Đúng thẻ sẽ lóe xanh và biến mất, sai thẻ sẽ đỏ để tiếp tục ghép cho đến khi xong 6 cặp!
      </div>

      {/* ── Victory Modal ── */}
      {isVictory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center animate-scaleUp">
            {/* Rank Avatar */}
            <div className={`w-20 h-20 rounded-3xl bg-linear-to-tr ${getRank(finalTimeSec, wrongCount).color} text-white flex flex-col items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/20`}>
              <span className="text-3xl font-black leading-none">{getRank(finalTimeSec, wrongCount).rank}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{getRank(finalTimeSec, wrongCount).title}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
              Ghép Cặp Hoàn Tất! ⚡
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Bạn đã ghép chính xác toàn bộ 6 cặp từ vựng!
            </p>

            {/* Score & Time Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200/80">
                <div className="text-3xl font-black text-[#F05A28] font-mono">
                  {finalTimeSec}s
                </div>
                <div className="text-xs font-bold text-orange-600 mt-1 flex items-center justify-center gap-1">
                  <Zap size={13} />
                  <span>Thời gian đua</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80">
                <div className="text-3xl font-black text-amber-700 font-mono">
                  {score}
                </div>
                <div className="text-xs font-bold text-amber-600 mt-1 flex items-center justify-center gap-1">
                  <Award size={13} />
                  <span>Điểm số đạt được</span>
                </div>
              </div>
            </div>

            {/* Mistakes & Personal Best details */}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600 mb-6">
              <span className="flex items-center gap-1.5">
                <Target size={14} className="text-slate-400" />
                Ghép sai: <strong className="text-slate-900">{wrongCount} lần</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Trophy size={14} className="text-amber-500" />
                Kỷ lục: <strong className="text-slate-900 font-mono">{personalBest}s</strong>
              </span>
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
                <span>Chơi vòng mới (6 cặp khác)</span>
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
