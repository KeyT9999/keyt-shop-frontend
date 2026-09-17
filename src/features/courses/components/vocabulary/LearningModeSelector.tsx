import {
  Layers,
  Keyboard,
  CheckSquare,
  Table,
  Zap,
  HelpCircle,
  Flame,
  ShieldAlert
} from 'lucide-react';
import type { LearningMode } from '../../types';

interface LearningModeSelectorProps {
  activeMode: LearningMode;
  onSelectMode: (mode: LearningMode) => void;
  weakWordsCount?: number;
}

export default function LearningModeSelector({
  activeMode,
  onSelectMode,
  weakWordsCount = 0
}: LearningModeSelectorProps) {
  const coreModes: Array<{
    id: LearningMode;
    label: string;
    badge?: string;
    icon: typeof Layers;
  }> = [
    {
      id: 'flashcard',
      label: 'Flashcard 3D',
      badge: 'SRS',
      icon: Layers
    },
    {
      id: 'typing',
      label: 'Luyện gõ từ',
      icon: Keyboard
    },
    {
      id: 'multichoice',
      label: 'Trắc nghiệm',
      icon: CheckSquare
    },
    {
      id: 'table',
      label: 'Danh sách từ',
      icon: Table
    }
  ];

  const advancedModes: Array<{
    id: LearningMode;
    label: string;
    badge?: string;
    badgeColor?: string;
    icon: typeof Zap;
  }> = [
    {
      id: 'speed-match',
      label: 'Ghép cặp',
      badge: 'GAME ⚡',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: Zap
    },
    {
      id: 'smart-quiz',
      label: 'Smart Quiz',
      badge: 'CHUẨN FE',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: HelpCircle
    },
    {
      id: 'time-attack',
      label: 'Đấu trí 60s',
      badge: 'HOT 🔥',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: Flame
    },
    {
      id: 'mistake-buster',
      label: 'Từ hay sai',
      badge: weakWordsCount > 0 ? `${weakWordsCount} từ` : 'Cứu cánh',
      badgeColor:
        weakWordsCount > 0
          ? 'bg-rose-500 text-white border-rose-600'
          : 'bg-slate-100 text-slate-700 border-slate-300',
      icon: ShieldAlert
    }
  ];

  return (
    <div className="w-full space-y-2.5 mb-8">
      {/* ── Row 1: Core Learning Modes ── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80">
        <span className="hidden md:inline-block text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">
          Cốt Lõi
        </span>
        {coreModes.map((m) => {
          const Icon = m.icon;
          const isActive = activeMode === m.id;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMode(m.id)}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-[#F05A28]' : 'text-slate-400'} />
              <span className="whitespace-nowrap">{m.label}</span>
              {m.badge && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-orange-50 text-[#F05A28] border border-orange-200/60">
                  {m.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Row 2: Gamification & Speed Challenges ── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-slate-50 border border-orange-200/60">
        <span className="hidden md:inline-block text-[10px] font-black uppercase tracking-wider text-orange-600 px-2">
          Đột Phá
        </span>
        {advancedModes.map((m) => {
          const Icon = m.icon;
          const isActive = activeMode === m.id;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMode(m.id)}
              className={`flex-1 min-w-[125px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#1E293B] text-white shadow-md shadow-slate-900/20 scale-101'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-amber-400' : 'text-[#F05A28]'} />
              <span className="whitespace-nowrap">{m.label}</span>
              {m.badge && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border leading-none shrink-0 ${
                    isActive
                      ? 'bg-amber-400 text-slate-900 border-amber-300'
                      : m.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {m.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
