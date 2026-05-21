import React, { useEffect, useRef } from 'react';

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const ReactionPicker: React.FC<ReactionPickerProps> = ({ onSelect, onClose }) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      className="w-max rounded-lg border border-slate-200 bg-white p-2 shadow-xl"
      ref={pickerRef}
      role="dialog"
      aria-label="Chọn reaction"
    >
      <div className="grid grid-cols-3 gap-1">
        {ALLOWED_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            className="flex h-10 w-10 items-center justify-center rounded-md text-2xl transition hover:scale-110 hover:bg-slate-100 active:scale-105"
            onClick={() => onSelect(emoji)}
            title={`React with ${emoji}`}
            type="button"
          >
            {emoji}
          </button>
        ))}
      </div>

    </div>
  );
};

export default ReactionPicker;
