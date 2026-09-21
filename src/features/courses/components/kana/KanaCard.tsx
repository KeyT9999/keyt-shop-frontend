import React, { useState, useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import type { KanaItem, KanaType } from '../../data/kanaData';

interface KanaCardProps {
  item: KanaItem;
  kanaType: KanaType;
  fontFamily: string;
  isActive: boolean;
  isSolved: boolean;
  submittedRomaji: string;
  onSelect: () => void;
  onSubmitAnswer: (input: string) => boolean;
  onPlayAudio: () => void;
  inputRefCallback: (el: HTMLInputElement | null) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  cardSize?: 'sm' | 'md' | 'lg';
}

export default function KanaCard({
  item,
  kanaType,
  fontFamily,
  isActive,
  isSolved,
  submittedRomaji,
  onSelect,
  onSubmitAnswer,
  onPlayAudio,
  inputRefCallback,
  onKeyDown,
  cardSize = 'md'
}: KanaCardProps) {
  const [inputValue, setInputValue] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const localInputRef = useRef<HTMLInputElement | null>(null);

  const character = item.displayMode
    ? (item.displayMode === 'katakana' ? item.katakana : item.hiragana)
    : (kanaType === 'katakana' ? item.katakana : item.hiragana);

  // Sync input value when solved or reset
  useEffect(() => {
    if (isSolved) {
      setInputValue(submittedRomaji || item.romaji);
    } else {
      setInputValue('');
    }
  }, [isSolved, submittedRomaji, item.romaji]);

  // Handle local submit
  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!inputValue.trim()) return;

      const isCorrect = onSubmitAnswer(inputValue.trim());
      if (!isCorrect) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
        // Select text on error so user can retype immediately
        localInputRef.current?.select();
      }
    } else {
      onKeyDown(e);
    }
  };

  // Sizing styles
  const sizeConfig = {
    sm: {
      card: 'w-16 h-22 sm:w-18 sm:h-24 p-1.5',
      char: 'text-2xl sm:text-3xl',
      input: 'h-6 text-xs'
    },
    md: {
      card: 'w-20 h-28 sm:w-24 sm:h-32 p-2',
      char: 'text-3xl sm:text-4xl',
      input: 'h-8 text-sm'
    },
    lg: {
      card: 'w-24 h-34 sm:w-28 sm:h-38 p-2.5',
      char: 'text-4xl sm:text-5xl',
      input: 'h-9 text-base'
    }
  }[cardSize];

  return (
    <div
      onClick={onSelect}
      className={`relative flex flex-col items-center justify-between rounded-2xl select-none transition-all duration-200 cursor-pointer ${
        sizeConfig.card
      } ${
        isSolved
          ? 'bg-[#58cc02] text-white shadow-md'
          : isActive
          ? 'bg-[#2060b4] text-white ring-4 ring-orange-400/90 shadow-xl -translate-y-1 z-10'
          : 'bg-[#388bea] text-white shadow-sm hover:bg-[#2d7ad4] hover:shadow-md'
      } ${isShaking ? 'animate-wiggle ring-2 ring-rose-400' : ''}`}
    >
      {/* Sound button on top right for solved cards */}
      {isSolved && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlayAudio();
          }}
          className="absolute top-1 right-1 p-0.5 rounded-full text-white/80 hover:text-white hover:bg-black/10 transition-colors"
          title="Nghe phát âm"
        >
          <Volume2 size={12} />
        </button>
      )}

      {/* Kana Character Display */}
      <div
        style={{ fontFamily }}
        className={`flex-1 flex items-center justify-center font-bold tracking-normal leading-none drop-shadow-xs ${sizeConfig.char}`}
      >
        {character}
      </div>

      {/* Romaji Text Input */}
      <div className="w-full">
        {isSolved ? (
          <div
            className={`w-full ${sizeConfig.input} rounded-lg bg-white/90 text-slate-600 font-bold flex items-center justify-center select-all border border-black/5 shadow-inner`}
          >
            {inputValue}
          </div>
        ) : (
          <input
            ref={(el) => {
              localInputRef.current = el;
              inputRefCallback(el);
            }}
            type="text"
            value={inputValue}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            onChange={(e) => setInputValue(e.target.value.toLowerCase())}
            onKeyDown={handleKeyDownInternal}
            onFocus={onSelect}
            className={`w-full ${sizeConfig.input} rounded-lg bg-white text-slate-900 font-bold text-center px-1 border-2 focus:outline-none focus:border-amber-400 shadow-inner transition-colors`}
          />
        )}
      </div>
    </div>
  );
}
