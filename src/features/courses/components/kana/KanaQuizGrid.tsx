import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  CheckCircle2,
  Type,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import KanaCard from './KanaCard';
import {
  type KanaItem,
  type KanaType,
  KANA_FONT_OPTIONS
} from '../../data/kanaData';

interface KanaQuizGridProps {
  items: KanaItem[];
  kanaType: KanaType;
  selectedFontId: string;
  onFontChange: (fontId: string) => void;
  soundEnabled: boolean;
  onSoundChange: (enabled: boolean) => void;
  onPlaySpeech: (text: string) => void;
  onBackToSetup: () => void;
  onFinishQuiz: (stats: {
    totalItems: number;
    solvedCount: number;
    solvedIds: string[];
    missedIds: string[];
    attemptsMap: Record<string, number>;
    startTime: number;
    endTime: number;
  }) => void;
}

export default function KanaQuizGrid({
  items,
  kanaType,
  selectedFontId,
  onFontChange,
  soundEnabled,
  onSoundChange,
  onPlaySpeech,
  onBackToSetup,
  onFinishQuiz
}: KanaQuizGridProps) {
  // Solved state map: id -> submitted romaji
  const [solvedMap, setSolvedMap] = useState<Record<string, string>>({});
  // Attempts tracking: id -> number of incorrect attempts
  const [attemptsMap, setAttemptsMap] = useState<Record<string, number>>({});
  // Active index
  const [activeIndex, setActiveIndex] = useState<number>(0);
  // Card size: sm, md, lg
  const [cardSize, setCardSize] = useState<'sm' | 'md' | 'lg'>('md');
  // Zoom percent display
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  // Time tracking
  const startTimeRef = useRef<number>(Date.now());

  // Input refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Active font
  const activeFont = useMemo(
    () => KANA_FONT_OPTIONS.find((f) => f.id === selectedFontId) || KANA_FONT_OPTIONS[0],
    [selectedFontId]
  );

  const totalItems = items.length;
  const solvedCount = Object.keys(solvedMap).length;
  const progressPercent = totalItems > 0 ? Math.round((solvedCount / totalItems) * 100) : 0;

  // Auto focus active card input on mount or active change
  useEffect(() => {
    const input = inputRefs.current[activeIndex];
    if (input) {
      input.focus();
    }
  }, [activeIndex]);

  // Find next unsolved card starting from a given index
  const findNextUnsolvedIndex = useCallback(
    (fromIndex: number, currentSolvedMap: Record<string, string>): number => {
      // 1. Search forward
      for (let i = fromIndex + 1; i < items.length; i++) {
        if (!currentSolvedMap[items[i].id]) {
          return i;
        }
      }
      // 2. Wrap around from beginning
      for (let i = 0; i <= fromIndex; i++) {
        if (!currentSolvedMap[items[i].id]) {
          return i;
        }
      }
      // All solved
      return fromIndex;
    },
    [items]
  );

  // Handle Answer Submit
  const handleCardSubmit = (index: number, input: string): boolean => {
    const item = items[index];
    const cleanInput = input.trim().toLowerCase();

    const isMatch = item.aliases.includes(cleanInput);

    if (isMatch) {
      const nextSolved = { ...solvedMap, [item.id]: cleanInput };
      setSolvedMap(nextSolved);

      // Pronounce voice if sound is enabled
      if (soundEnabled) {
        const textToSpeak = kanaType === 'hiragana' ? item.hiragana : item.katakana;
        onPlaySpeech(textToSpeak);
      }

      // Check if all solved
      if (Object.keys(nextSolved).length === totalItems) {
        // All finished! Auto finish or move
        setActiveIndex(index);
      } else {
        const nextIdx = findNextUnsolvedIndex(index, nextSolved);
        setActiveIndex(nextIdx);
      }

      return true;
    } else {
      // Incorrect attempt
      setAttemptsMap((prev) => ({
        ...prev,
        [item.id]: (prev[item.id] || 0) + 1
      }));
      return false;
    }
  };

  // Keyboard navigation between cards (Arrow keys)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (index + 1) % items.length;
      setActiveIndex(next);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (index - 1 + items.length) % items.length;
      setActiveIndex(prev);
    }
  };

  // Handle Zoom change
  const handleZoomChange = (delta: number) => {
    setZoomPercent((prev) => {
      const next = Math.max(50, Math.min(150, prev + delta));
      if (next <= 70) setCardSize('sm');
      else if (next <= 110) setCardSize('md');
      else setCardSize('lg');
      return next;
    });
  };

  const handleZoomReset = () => {
    setZoomPercent(100);
    setCardSize('md');
  };

  // Handle Finish Quiz
  const handleFinish = () => {
    const solvedIds = Object.keys(solvedMap);
    const missedIds = items.filter((it) => !solvedMap[it.id]).map((it) => it.id);

    onFinishQuiz({
      totalItems,
      solvedCount,
      solvedIds,
      missedIds,
      attemptsMap,
      startTime: startTimeRef.current,
      endTime: Date.now()
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      {/* Top Header & Tofugu-style Instructions */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[#388bea] tracking-tight mb-2">
          Type Romaji for the Kana You Know
        </h1>
        <ul className="text-xs sm:text-sm text-slate-600 space-y-1 text-left sm:text-center font-medium inline-block mx-auto leading-relaxed">
          <li>• Type your answer in romaji in the card&apos;s text field</li>
          <li>• Press ENTER to submit</li>
          <li>• Repeat for as many cards as you can</li>
          <li>• You can try as many times as you want</li>
          <li>• When you&apos;re done press the &quot;Finish Quiz&quot; button at the bottom</li>
        </ul>
      </div>

      {/* Utility Toolbar (Zoom, Font, Sound, Progress, Back) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sm:p-4 mb-8 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back & Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBackToSetup}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Quay lại chọn bảng chữ"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Chọn lại bảng</span>
          </button>

          {/* Font Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <Type size={14} className="text-[#388bea]" />
            <select
              value={selectedFontId}
              onChange={(e) => onFontChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#388bea]"
            >
              {KANA_FONT_OPTIONS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name.split(' (')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Progress Bar */}
        <div className="flex-1 min-w-[200px] max-w-xs mx-auto">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
            <span>Tiến độ</span>
            <span className="text-[#388bea]">
              {solvedCount} / {totalItems} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Sound & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom controls (Matching Tofugu Image 3) */}
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 text-xs font-bold text-slate-700">
            <button
              type="button"
              onClick={() => handleZoomChange(-15)}
              className="px-2 py-1 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut size={13} />
            </button>
            <span className="px-1.5 text-[11px] select-none">{zoomPercent}%</span>
            <button
              type="button"
              onClick={() => handleZoomChange(15)}
              className="px-2 py-1 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="px-2 py-1 hover:bg-white text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer text-[11px]"
              title="Reset kích thước"
            >
              Reset
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => onSoundChange(!soundEnabled)}
            className={`p-2 rounded-xl transition-colors cursor-pointer border ${
              soundEnabled
                ? 'bg-blue-50 text-[#388bea] border-blue-200 hover:bg-blue-100'
                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
            }`}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Cards Grid Container */}
      <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3.5 mb-10 select-none">
        {items.map((item, index) => (
          <KanaCard
            key={item.id}
            item={item}
            kanaType={kanaType}
            fontFamily={activeFont.fontFamily}
            isActive={activeIndex === index}
            isSolved={Boolean(solvedMap[item.id])}
            submittedRomaji={solvedMap[item.id] || ''}
            onSelect={() => setActiveIndex(index)}
            onSubmitAnswer={(input) => handleCardSubmit(index, input)}
            onPlayAudio={() => {
              const textToSpeak = kanaType === 'hiragana' ? item.hiragana : item.katakana;
              onPlaySpeech(textToSpeak);
            }}
            inputRefCallback={(el) => {
              inputRefs.current[index] = el;
            }}
            onKeyDown={(e) => handleKeyDown(index, e)}
            cardSize={cardSize}
          />
        ))}
      </div>

      {/* Bottom Action: Finish Quiz Button */}
      <div className="flex flex-col items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleFinish}
          className="py-3.5 px-8 rounded-2xl bg-[#388bea] hover:bg-[#2879d7] text-white font-black text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
        >
          <CheckCircle2 size={18} />
          <span>Finish Quiz</span>
        </button>
        <span className="text-xs text-slate-500 font-medium">
          Bạn có thể nhấn Finish Quiz bất kỳ lúc nào để xem bảng kết quả và ôn lại chữ chưa thuộc
        </span>
      </div>
    </div>
  );
}
