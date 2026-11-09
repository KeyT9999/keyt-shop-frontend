import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudOff,
  Flame,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import type { GymCloudSyncStatus } from '../hooks/useGymCoachState';
import type {
  GymExerciseDefinition,
  GymExerciseUserLog,
  GymSplitDayConfig,
} from '../types/gym';

interface GymSelectorCockpitProps {
  days: GymSplitDayConfig[];
  activeDay: GymSplitDayConfig;
  dayExercises: GymExerciseDefinition[];
  currentExercise: GymExerciseDefinition;
  currentOrderIndex: number;
  completedIdsToday: string[];
  exerciseLogs: Record<string, GymExerciseUserLog>;
  workoutStreak: number;
  syncStatus: GymCloudSyncStatus;
  onSelectDay: (dayId: string) => void;
  onSelectExercise: (exerciseId: string) => void;
  onToggleExerciseDone: (exerciseId: string) => void;
  onCompleteDayAndAdvance: () => void;
  onOpenCustomizer: () => void;
  onOpenSubstitute?: () => void;
}

type OpenMenuKind = 'none' | 'day' | 'exercise';

function SyncMiniDot({ status }: { status: GymCloudSyncStatus }) {
  if (status === 'synced') {
    return (
      <span
        title="Đã đồng bộ Cloud KeyT"
        className="w-8 h-9 rounded-xl bg-[#A3F77B]/15 border border-[#A3F77B]/40 text-[#A3F77B] flex items-center justify-center shrink-0"
      >
        <Cloud size={14} />
      </span>
    );
  }
  if (status === 'syncing') {
    return (
      <span
        title="Đang đồng bộ..."
        className="w-8 h-9 rounded-xl bg-[#7CE7FF]/15 border border-[#7CE7FF]/40 text-[#7CE7FF] flex items-center justify-center shrink-0"
      >
        <RefreshCw size={14} className="animate-spin" />
      </span>
    );
  }
  return (
    <span
      title="Lưu tức thì trên máy (0s)"
      className="w-8 h-9 rounded-xl bg-[#1F1F28] border border-[#2E2E3A] text-zinc-400 flex items-center justify-center shrink-0"
    >
      <CloudOff size={14} />
    </span>
  );
}

/**
 * Compact Dual-Dropdown Cockpit Bar styled in Dark Charcoal (#16161C) & Neon Pink (#FF5C8A).
 */
export default function GymSelectorCockpit({
  days,
  activeDay,
  dayExercises,
  currentExercise,
  currentOrderIndex,
  completedIdsToday,
  exerciseLogs,
  workoutStreak,
  syncStatus,
  onSelectDay,
  onSelectExercise,
  onToggleExerciseDone,
  onCompleteDayAndAdvance,
  onOpenCustomizer,
  onOpenSubstitute,
}: GymSelectorCockpitProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenuKind>('none');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openMenu === 'none') return;
    const handlePointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpenMenu('none');
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu('none');
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openMenu]);

  const completedCount = dayExercises.filter((e) =>
    completedIdsToday.includes(e.id)
  ).length;
  const isCurrentDone = completedIdsToday.includes(currentExercise.id);
  const currentWeight =
    exerciseLogs[currentExercise.id]?.weightKg ?? currentExercise.defaultWeightKg;

  const stepExercise = (delta: number) => {
    const len = dayExercises.length;
    if (len <= 1) return;
    const nextIdx = (currentOrderIndex + delta + len) % len;
    onSelectExercise(dayExercises[nextIdx].id);
  };

  return (
    <div
      ref={rootRef}
      className="bg-[#16161C] rounded-2xl border border-[#292935] p-2 sm:p-3 shadow-xl space-y-2 relative z-30 text-[#F7F7F7]"
    >
      {/* Row 1: Day Dropdown + Streak/Sync + Advance Day + Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="relative flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setOpenMenu((m) => (m === 'day' ? 'none' : 'day'))}
            aria-expanded={openMenu === 'day'}
            className="w-full h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-[#111114] hover:bg-[#1E1E26] border border-[#2E2E3C] text-[#F7F7F7] flex items-center justify-between gap-2 transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <CalendarDays size={14} className="text-[#FF5C8A] shrink-0" />
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#FF5C8A] shrink-0">
                {activeDay.dayLabel}:
              </span>
              <span className="text-xs sm:text-sm font-extrabold truncate">
                {activeDay.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-1.5 py-0.5 rounded-md bg-[#A3F77B]/15 text-[11px] font-bold text-[#A3F77B]">
                {completedCount}/{dayExercises.length}
              </span>
              <ChevronDown
                size={15}
                className={`text-zinc-400 transition-transform duration-200 ${
                  openMenu === 'day' ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {openMenu === 'day' && (
            <div className="absolute left-0 right-0 sm:w-96 mt-1.5 bg-[#16161C] rounded-2xl border border-[#2E2E3C] shadow-2xl p-2 space-y-1 z-50">
              <div className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                Chọn ngày trong chu kỳ 5 ngày
              </div>
              {days.map((day) => {
                const isSelected = day.id === activeDay.id;
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => {
                      onSelectDay(day.id);
                      setOpenMenu('none');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2 transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF5C8A] text-[#111114]'
                        : 'hover:bg-[#22222C] text-[#F7F7F7]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-extrabold ${
                            isSelected ? 'text-[#111114]' : 'text-[#FF5C8A]'
                          }`}
                        >
                          {day.dayLabel}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold truncate">
                          {day.title}
                        </span>
                      </div>
                      <div
                        className={`text-[11px] truncate ${
                          isSelected ? 'text-[#111114]/80' : 'text-zinc-400'
                        }`}
                      >
                        {day.subtitle}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isSelected
                          ? 'bg-[#111114] text-[#F7F7F7]'
                          : 'bg-[#242430] text-zinc-300'
                      }`}
                    >
                      {day.exerciseIds.length} bài
                    </span>
                  </button>
                );
              })}

              <div className="pt-1.5 mt-1 border-t border-[#292935] flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu('none');
                    onOpenCustomizer();
                  }}
                  className="flex-1 py-2 px-2.5 rounded-xl border border-[#2E2E3C] bg-[#1F1F28] hover:bg-[#282834] text-[#F7F7F7] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal size={13} className="text-[#FF5C8A]" />
                  <span>Đổi bài / Chỉnh lịch</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCompleteDayAndAdvance();
                    setOpenMenu('none');
                  }}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-[#FF5C8A] hover:bg-[#ff4278] text-[#111114] text-xs font-extrabold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Qua ngày kế</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {workoutStreak > 0 && (
          <span
            title={`${workoutStreak} buổi tập hoàn thành`}
            className="hidden xs:inline-flex items-center gap-1 h-9 sm:h-10 px-2.5 rounded-xl bg-[#FF5C8A]/15 border border-[#FF5C8A]/40 text-[#FF5C8A] text-xs font-extrabold shrink-0"
          >
            <Flame size={13} className="text-[#FF5C8A]" />
            <span>{workoutStreak}</span>
          </span>
        )}

        <SyncMiniDot status={syncStatus} />

        {onOpenSubstitute && (
          <button
            type="button"
            onClick={onOpenSubstitute}
            title="Đổi bài tương đương (Kẹt máy / Đau khớp)"
            aria-label="Đổi bài tương đương"
            className="w-9 h-9 sm:h-10 rounded-xl border border-[#2E2E3C] bg-[#1F1F28] hover:border-[#A3F77B] text-[#A3F77B] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={onOpenCustomizer}
          title="Chỉnh lịch 5 ngày"
          aria-label="Chỉnh lịch 5 ngày"
          className="w-9 h-9 sm:h-10 rounded-xl border border-[#2E2E3C] bg-[#1F1F28] hover:bg-[#282834] text-zinc-200 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
        >
          <SlidersHorizontal size={15} className="text-[#FF5C8A]" />
        </button>

        <button
          type="button"
          onClick={onCompleteDayAndAdvance}
          title={`Hoàn thành ${activeDay.dayLabel} và chuyển sang ngày kế`}
          className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-[#FF5C8A] hover:bg-[#ff4278] text-[#111114] text-xs font-black flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
        >
          <span className="hidden sm:inline">Xong ngày</span>
          <span className="sm:hidden">Kế</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Row 2: Prev + Exercise Dropdown + Next + 1-Tap Done */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => stepExercise(-1)}
          aria-label="Bài tập trước"
          className="w-9 h-10 rounded-xl border border-[#2E2E3C] bg-[#1F1F28] hover:bg-[#282834] text-zinc-200 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
        >
          <ChevronLeft size={17} />
        </button>

        <div className="relative flex-1 min-w-0">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((m) => (m === 'exercise' ? 'none' : 'exercise'))
            }
            aria-expanded={openMenu === 'exercise'}
            className="w-full h-10 px-2.5 sm:px-3 rounded-xl border border-[#2E2E3C] bg-[#111114] hover:border-[#FF5C8A] flex items-center justify-between gap-2 transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="px-1.5 py-0.5 rounded-md bg-[#FF5C8A] text-[#111114] text-[11px] font-black shrink-0">
                Bài {currentOrderIndex + 1}/{dayExercises.length}
              </span>
              <span
                className={`text-xs sm:text-sm font-extrabold truncate ${
                  isCurrentDone ? 'line-through text-zinc-500' : 'text-[#F7F7F7]'
                }`}
              >
                {currentExercise.vietnameseName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {currentWeight > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#252532] text-[#FF85A9] text-[11px] font-extrabold">
                  {currentWeight}kg
                </span>
              )}
              <ChevronDown
                size={15}
                className={`text-zinc-400 transition-transform duration-200 ${
                  openMenu === 'exercise' ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {openMenu === 'exercise' && (
            <div className="absolute left-0 right-0 mt-1.5 bg-[#16161C] rounded-2xl border border-[#2E2E3C] shadow-2xl p-2 space-y-1.5 max-h-80 overflow-y-auto z-50">
              <div className="px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                Danh sách bài tập • {activeDay.dayLabel}: {activeDay.title}
              </div>
              {dayExercises.map((ex, idx) => {
                const isSelected = ex.id === currentExercise.id;
                const isDone = completedIdsToday.includes(ex.id);
                const w = exerciseLogs[ex.id]?.weightKg ?? ex.defaultWeightKg;

                return (
                  <div
                    key={ex.id}
                    onClick={() => {
                      onSelectExercise(ex.id);
                      setOpenMenu('none');
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectExercise(ex.id);
                        setOpenMenu('none');
                      }
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF5C8A]/15 border-[#FF5C8A]'
                        : 'bg-[#111114] border-[#272732] hover:bg-[#1E1E28]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-extrabold text-[#FF5C8A]">
                          Bài {idx + 1}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-semibold">
                          • {ex.sets} × {ex.reps}
                        </span>
                        {w > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-[#252532] text-[11px] font-bold text-[#FF85A9]">
                            {w}kg
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs sm:text-sm font-extrabold truncate ${
                          isDone ? 'line-through text-zinc-500' : 'text-[#F7F7F7]'
                        }`}
                      >
                        {ex.vietnameseName}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {ex.name}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExerciseDone(ex.id);
                      }}
                      aria-label={`Đánh dấu xong ${ex.vietnameseName}`}
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-[#A3F77B] border-[#A3F77B] text-[#111114]'
                          : 'bg-[#1B1B24] border-[#323240] text-zinc-400 hover:border-[#A3F77B]'
                      }`}
                    >
                      <Check size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => stepExercise(1)}
          aria-label="Bài tập tiếp theo"
          className="w-9 h-10 rounded-xl border border-[#2E2E3C] bg-[#1F1F28] hover:bg-[#282834] text-zinc-200 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
        >
          <ChevronRight size={17} />
        </button>

        <button
          type="button"
          onClick={() => onToggleExerciseDone(currentExercise.id)}
          aria-label="Đánh dấu hoàn thành bài đang tập"
          title="Đánh dấu xong bài này"
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer ${
            isCurrentDone
              ? 'bg-[#A3F77B] border-[#A3F77B] text-[#111114] shadow-xs'
              : 'bg-[#1F1F28] border-[#2E2E3C] text-zinc-300 hover:border-[#A3F77B] hover:text-[#A3F77B]'
          }`}
        >
          <Check size={17} />
        </button>
      </div>
    </div>
  );
}
