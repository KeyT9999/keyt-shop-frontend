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
}

type OpenMenuKind = 'none' | 'day' | 'exercise';

function SyncMiniDot({ status }: { status: GymCloudSyncStatus }) {
  if (status === 'synced') {
    return (
      <span
        title="Đã đồng bộ Cloud KeyT"
        className="w-8 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0"
      >
        <Cloud size={14} />
      </span>
    );
  }
  if (status === 'syncing') {
    return (
      <span
        title="Đang đồng bộ..."
        className="w-8 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0"
      >
        <RefreshCw size={14} className="animate-spin" />
      </span>
    );
  }
  return (
    <span
      title="Lưu tức thì trên máy (0s)"
      className="w-8 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0"
    >
      <CloudOff size={14} />
    </span>
  );
}

/**
 * Decision: Replace bulky Hero + 5-day card grid + 4-card exercise list on mobile
 * with a compact Dual-Dropdown Cockpit Bar (~92px height) so the 3D simulation and
 * step-by-step execution cues remain immediately visible above the fold.
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
      className="bg-white rounded-2xl border border-slate-200/90 p-2 sm:p-3 shadow-xs space-y-2 relative z-30"
    >
      {/* Row 1: Day Dropdown + Streak/Sync + Advance Day + Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="relative flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setOpenMenu((m) => (m === 'day' ? 'none' : 'day'))}
            aria-expanded={openMenu === 'day'}
            className="w-full h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white flex items-center justify-between gap-2 transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <CalendarDays size={14} className="text-[#F05A28] shrink-0" />
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#F05A28] shrink-0">
                {activeDay.dayLabel}:
              </span>
              <span className="text-xs sm:text-sm font-extrabold truncate">
                {activeDay.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-[11px] font-bold text-emerald-300">
                {completedCount}/{dayExercises.length}
              </span>
              <ChevronDown
                size={15}
                className={`text-slate-300 transition-transform duration-200 ${
                  openMenu === 'day' ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {openMenu === 'day' && (
            <div className="absolute left-0 right-0 sm:w-96 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 space-y-1 z-50">
              <div className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
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
                        ? 'bg-[#1E293B] text-white'
                        : 'hover:bg-orange-50/60 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-[#F05A28]">
                          {day.dayLabel}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold truncate">
                          {day.title}
                        </span>
                      </div>
                      <div
                        className={`text-[11px] truncate ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {day.subtitle}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isSelected
                          ? 'bg-[#F05A28] text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {day.exerciseIds.length} bài
                    </span>
                  </button>
                );
              })}

              <div className="pt-1.5 mt-1 border-t border-slate-100 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu('none');
                    onOpenCustomizer();
                  }}
                  className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal size={13} className="text-[#F05A28]" />
                  <span>Đổi bài / Chỉnh lịch</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCompleteDayAndAdvance();
                    setOpenMenu('none');
                  }}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-[#F05A28] hover:bg-orange-600 text-white text-xs font-extrabold flex items-center justify-center gap-1 transition-colors cursor-pointer"
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
            className="hidden xs:inline-flex items-center gap-1 h-9 sm:h-10 px-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-extrabold shrink-0"
          >
            <Flame size={13} className="text-[#F05A28]" />
            <span>{workoutStreak}</span>
          </span>
        )}

        <SyncMiniDot status={syncStatus} />

        <button
          type="button"
          onClick={onOpenCustomizer}
          title="Chỉnh lịch 5 ngày"
          aria-label="Chỉnh lịch 5 ngày"
          className="w-9 h-9 sm:h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
        >
          <SlidersHorizontal size={15} className="text-[#F05A28]" />
        </button>

        <button
          type="button"
          onClick={onCompleteDayAndAdvance}
          title={`Hoàn thành ${activeDay.dayLabel} và chuyển sang ngày kế`}
          className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-[#F05A28] hover:bg-orange-600 text-white text-xs font-extrabold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
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
          className="w-9 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
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
            className="w-full h-10 px-2.5 sm:px-3 rounded-xl border border-slate-200 bg-orange-50/45 hover:border-[#F05A28]/70 flex items-center justify-between gap-2 transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="px-1.5 py-0.5 rounded-md bg-[#F05A28] text-white text-[11px] font-extrabold shrink-0">
                Bài {currentOrderIndex + 1}/{dayExercises.length}
              </span>
              <span
                className={`text-xs sm:text-sm font-extrabold truncate ${
                  isCurrentDone ? 'line-through text-slate-400' : 'text-slate-900'
                }`}
              >
                {currentExercise.vietnameseName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {currentWeight > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-slate-200/80 text-slate-800 text-[11px] font-extrabold">
                  {currentWeight}kg
                </span>
              )}
              <ChevronDown
                size={15}
                className={`text-slate-500 transition-transform duration-200 ${
                  openMenu === 'exercise' ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {openMenu === 'exercise' && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 space-y-1.5 max-h-80 overflow-y-auto z-50">
              <div className="px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
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
                        ? 'bg-orange-50 border-[#F05A28]'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-extrabold text-[#F05A28]">
                          Bài {idx + 1}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          • {ex.sets} × {ex.reps}
                        </span>
                        {w > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-[11px] font-bold text-slate-800">
                            {w}kg
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs sm:text-sm font-extrabold truncate ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {ex.vietnameseName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
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
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-white border-slate-300 text-slate-400 hover:border-emerald-500'
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
          className="w-9 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
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
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
              : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-600'
          }`}
        >
          <Check size={17} />
        </button>
      </div>
    </div>
  );
}
