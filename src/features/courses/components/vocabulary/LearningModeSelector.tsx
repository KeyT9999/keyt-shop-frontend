import { Layers, Keyboard, CheckSquare, Table } from 'lucide-react';
import type { LearningMode } from '../../types';

interface LearningModeSelectorProps {
  activeMode: LearningMode;
  onSelectMode: (mode: LearningMode) => void;
}

export default function LearningModeSelector({
  activeMode,
  onSelectMode
}: LearningModeSelectorProps) {
  const modes: Array<{
    id: LearningMode;
    label: string;
    sublabel: string;
    icon: typeof Layers;
  }> = [
    {
      id: 'flashcard',
      label: 'Flashcard',
      sublabel: 'Lật thẻ ghi nhớ 3D',
      icon: Layers
    },
    {
      id: 'typing',
      label: 'Luyện gõ từ',
      sublabel: 'Gõ tiếng Nhật phản xạ',
      icon: Keyboard
    },
    {
      id: 'multichoice',
      label: 'Trắc nghiệm',
      sublabel: 'Chọn 1 trong 4 đáp án',
      icon: CheckSquare
    },
    {
      id: 'table',
      label: 'Danh sách',
      sublabel: 'Tra cứu toàn bộ từ',
      icon: Table
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 mb-8 max-w-2xl">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = activeMode === m.id;

        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelectMode(m.id)}
            className={`flex-1 min-w-[130px] py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isActive
                ? 'bg-white text-slate-900 shadow-md shadow-slate-200 border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Icon
              size={16}
              className={isActive ? 'text-[#F05A28]' : 'text-slate-400'}
            />
            <span className="whitespace-nowrap">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
