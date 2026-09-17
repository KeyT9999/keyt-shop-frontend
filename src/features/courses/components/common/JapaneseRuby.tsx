interface JapaneseRubyProps {
  term: string;
  reading?: string;
  showReading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function JapaneseRuby({
  term,
  reading,
  showReading = true,
  size = 'md',
  className = ''
}: JapaneseRubyProps) {
  // If term and reading are identical (e.g. hiragana words like どのくらい), don't show double furigana
  const isDuplicate = !reading || term === reading;

  const sizeStyles = {
    sm: {
      term: 'text-sm font-bold',
      reading: 'text-[10px] text-slate-500 font-medium'
    },
    md: {
      term: 'text-base sm:text-lg font-bold',
      reading: 'text-[11px] text-slate-500 font-medium'
    },
    lg: {
      term: 'text-2xl sm:text-3xl font-extrabold',
      reading: 'text-xs sm:text-sm text-slate-500 font-medium'
    },
    xl: {
      term: 'text-4xl sm:text-5xl font-black',
      reading: 'text-sm sm:text-base text-slate-500 font-medium'
    }
  }[size];

  return (
    <div className={`inline-flex flex-col items-center justify-center text-center font-japanese leading-tight ${className}`}>
      {showReading && !isDuplicate && (
        <span className={`${sizeStyles.reading} tracking-wider select-none mb-0.5 text-[#F05A28]`}>
          {reading}
        </span>
      )}
      <span className={`${sizeStyles.term} text-slate-900 tracking-wide`}>
        {term}
      </span>
    </div>
  );
}
