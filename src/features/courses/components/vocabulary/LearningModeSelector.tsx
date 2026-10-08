import {
  Layers,
  Keyboard,
  CheckSquare,
  Table,
  Zap,
  HelpCircle,
  Flame,
  ShieldAlert,
  Headphones
} from 'lucide-react';
import type { LearningMode } from '../../types';

interface LearningModeSelectorProps {
  activeMode: LearningMode;
  onSelectMode: (mode: LearningMode) => void;
  weakWordsCount?: number;
  passiveListeningEnabled?: boolean;
}

export default function LearningModeSelector({
  activeMode,
  onSelectMode,
  weakWordsCount = 0,
  passiveListeningEnabled = false
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

  if (passiveListeningEnabled) {
    coreModes.push({
      id: 'passive-listening',
      label: 'Nghe thụ động',
      icon: Headphones
    });
  }

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
      badge: 'GAME',
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
      badge: 'HOT',
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
    <div className="mb-6 w-full space-y-3 sm:mb-8">
      {/* ── Row 1: Core Learning Modes ── */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-2 md:grid-cols-3 lg:flex lg:flex-wrap lg:items-center">
        <span className="col-span-2 px-1 text-[10px] font-black uppercase tracking-wider text-slate-500 md:col-span-full lg:col-span-1 lg:px-2">
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
              aria-pressed={isActive}
              className={`flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-bold transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:px-3 sm:text-sm lg:flex-1 lg:min-w-[120px] ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon size={16} className={`shrink-0 ${isActive ? 'text-[#F05A28]' : 'text-slate-400'}`} />
              <span className="truncate sm:whitespace-nowrap">{m.label}</span>
              {m.badge && (
                <span className="hidden shrink-0 rounded-md border border-orange-200/60 bg-orange-50 px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#F05A28] sm:inline-flex">
                  {m.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Row 2: Gamification & Speed Challenges ── */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-orange-200/60 bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-slate-50 p-2 md:grid-cols-4 lg:flex lg:flex-wrap lg:items-center">
        <span className="col-span-2 px-1 text-[10px] font-black uppercase tracking-wider text-orange-700 md:col-span-full lg:col-span-1 lg:px-2">
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
              aria-pressed={isActive}
              className={`flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-bold transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:px-3 sm:text-sm lg:flex-1 lg:min-w-[125px] ${
                isActive
                  ? 'bg-[#1E293B] text-white shadow-md shadow-slate-900/20 scale-101'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Icon size={16} className={`shrink-0 ${isActive ? 'text-amber-400' : 'text-[#F05A28]'}`} />
              <span className="truncate sm:whitespace-nowrap">{m.label}</span>
              {m.badge && (
                <span
                  className={`hidden shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-black leading-none sm:inline-flex ${
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
