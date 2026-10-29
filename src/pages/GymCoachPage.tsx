import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Cloud,
  CloudOff,
  Dumbbell,
  Flame,
  Layers,
  Minus,
  Plus,
  RefreshCw,
  Save,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import ExerciseReferenceDualView from '../features/gym/components/ExerciseReferenceDualView';
import GymMannequin3DViewer from '../features/gym/components/GymMannequin3DViewer';
import GymRestTimerBar from '../features/gym/components/GymRestTimerBar';
import SplitCustomizerModal from '../features/gym/components/SplitCustomizerModal';
import { GYM_EXERCISE_CATALOG } from '../features/gym/data/defaultGymCatalog';
import {
  useGymCoachState,
  type GymCloudSyncStatus,
} from '../features/gym/hooks/useGymCoachState';
import type {
  GymExerciseDefinition,
  GymExerciseUserLog,
} from '../features/gym/types/gym';
import { resolveExercisesForDay } from '../features/gym/utils/gymStateUtils';
import { useAuthContext } from '../context/useAuthContext';

type VisualDisplayMode = 'hybrid' | '3d-only' | 'photo-only';

interface WeightLoggerBoxProps {
  exercise: GymExerciseDefinition;
  savedLog?: GymExerciseUserLog;
  onSave: (weightKg: number, repsNote: string, personalTip: string) => void;
}

function WeightLoggerBox({ exercise, savedLog, onSave }: WeightLoggerBoxProps) {
  const [weightKg, setWeightKg] = useState<number>(
    savedLog?.weightKg ?? exercise.defaultWeightKg
  );
  const [repsNote, setRepsNote] = useState<string>(savedLog?.repsNote ?? '');
  const [personalTip, setPersonalTip] = useState<string>(savedLog?.personalTip ?? '');
  const [justSaved, setJustSaved] = useState<boolean>(false);

  const triggerSave = (nextWeight: number, nextReps = repsNote, nextTip = personalTip) => {
    const cleanWeight = Math.max(0, Number(nextWeight.toFixed(1)));
    setWeightKg(cleanWeight);
    onSave(cleanWeight, nextReps, nextTip);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Dumbbell size={14} className="text-[#F05A28]" />
          <span>Sổ nhớ mức tạ ({exercise.weightUnitLabel})</span>
        </div>
        {justSaved && (
          <span className="text-xs font-bold text-emerald-600">Đã lưu!</span>
        )}
      </div>

      {/* Thumb-friendly +/- 2.5kg steppers */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => triggerSave(Math.max(0, weightKg - 2.5))}
          aria-label="Giảm 2.5 kg"
          className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0"
        >
          <Minus size={16} />
        </button>

        <div className="flex-1 relative">
          <input
            type="number"
            step="0.5"
            min="0"
            aria-label="Mức tạ tính bằng kg"
            value={weightKg}
            onChange={(e) => setWeightKg(Math.max(0, Number(e.target.value) || 0))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-center text-base font-black text-slate-900 focus:outline-none focus:border-[#F05A28]"
          />
        </div>

        <button
          type="button"
          onClick={() => triggerSave(weightKg + 2.5)}
          aria-label="Tăng 2.5 kg"
          className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          value={repsNote}
          onChange={(e) => setRepsNote(e.target.value)}
          placeholder="Ghi hiệp (VD: 3x12 chuẩn)"
          aria-label="Ghi chú số hiệp và số lần"
          className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#F05A28]"
        />
        <input
          type="text"
          value={personalTip}
          onChange={(e) => setPersonalTip(e.target.value)}
          placeholder="Nấc ghế / Ghim máy (VD: Ghế số 3)"
          aria-label="Ghi chú nấc ghế hoặc máy tập"
          className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#F05A28]"
        />
      </div>

      <button
        type="button"
        onClick={() => triggerSave(weightKg)}
        className="w-full py-2 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Save size={14} />
        <span>Lưu mức tạ &amp; nấc ghế cho buổi sau</span>
      </button>
    </div>
  );
}

function renderSyncBadge(status: GymCloudSyncStatus) {
  if (status === 'synced') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
        <Cloud size={13} />
        <span>Đã đồng bộ Cloud KeyT</span>
      </span>
    );
  }
  if (status === 'syncing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
        <RefreshCw size={13} className="animate-spin" />
        <span>Đang đồng bộ...</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
      <CloudOff size={13} />
      <span>Lưu tức thì trên máy (0s)</span>
    </span>
  );
}

export default function GymCoachPage() {
  const { token } = useAuthContext();
  const {
    state,
    syncStatus,
    selectDay,
    toggleExerciseDone,
    completeDayAndAdvance,
    saveExerciseLog,
    saveCustomSplitDays,
  } = useGymCoachState(token);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [visualMode, setVisualMode] = useState<VisualDisplayMode>('hybrid');
  const [customizerOpen, setCustomizerOpen] = useState<boolean>(false);

  const activeDay = useMemo(() => {
    return (
      state.customDays.find((d) => d.id === state.activeDayId) ||
      state.customDays[0]
    );
  }, [state.customDays, state.activeDayId]);

  const dayExercises = useMemo(() => {
    if (!activeDay) return [GYM_EXERCISE_CATALOG[0]];
    const resolved = resolveExercisesForDay(activeDay);
    return resolved.length > 0 ? resolved : [GYM_EXERCISE_CATALOG[0]];
  }, [activeDay]);

  const currentExercise = useMemo(() => {
    return (
      dayExercises.find((e) => e.id === selectedExerciseId) || dayExercises[0]
    );
  }, [dayExercises, selectedExerciseId]);

  const currentOrderIndex = Math.max(
    0,
    dayExercises.findIndex((e) => e.id === currentExercise.id)
  );

  const completedInCurrentDay = dayExercises.filter((e) =>
    state.completedExerciseIdsToday.includes(e.id)
  ).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-5 sm:py-8 px-3.5 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Top Hero & Action Bar */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F05A28]/12 border border-[#F05A28]/25 flex items-center justify-center text-[#F05A28] shrink-0">
              <Dumbbell size={24} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#F05A28] text-white text-xs font-extrabold">
                  KeyT Gym 3D Coach
                </span>
                {renderSyncBadge(syncStatus)}
                {state.workoutStreak > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-extrabold">
                    <Flame size={13} className="text-[#F05A28]" />
                    <span>{state.workoutStreak} buổi hoàn thành</span>
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] mt-1.5 leading-tight">
                Lộ Trình Tập Gym Cá Nhân &amp; Mô Phỏng Tư Thế 3D
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Mở điện thoại biết ngay hôm nay tập nhóm cơ nào, tìm đúng máy tập, xoay 3D 360° chuẩn form và nhớ mức tạ buổi trước.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setCustomizerOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={15} className="text-[#F05A28]" />
              <span>Chỉnh lịch 5 ngày</span>
            </button>

            <button
              type="button"
              onClick={() => {
                completeDayAndAdvance();
                setSelectedExerciseId('');
              }}
              className="px-4 py-2.5 rounded-xl bg-[#F05A28] hover:bg-orange-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <span>Xong {activeDay?.dayLabel} • Chuyển ngày kế</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>

        {/* 5-Day Split Selector Strip */}
        <section
          aria-label="Chọn ngày trong chu kỳ tập"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5"
        >
          {state.customDays.map((day) => {
            const isActive = day.id === activeDay?.id;
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => {
                  selectDay(day.id);
                  setSelectedExerciseId('');
                }}
                className={`text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#1E293B] text-white border-[#1E293B] shadow-md -translate-y-0.5'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-[#F05A28]/60 hover:bg-orange-50/20'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`text-xs font-extrabold uppercase tracking-wider ${
                      isActive ? 'text-[#F05A28]' : 'text-[#F05A28]'
                    }`}
                  >
                    {day.dayLabel}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/15 text-slate-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {day.exerciseIds.length} bài
                  </span>
                </div>
                <div className="text-sm sm:text-base font-extrabold mt-1 truncate">
                  {day.title}
                </div>
                <div
                  className={`text-xs mt-0.5 truncate ${
                    isActive ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {day.subtitle}
                </div>
              </button>
            );
          })}
        </section>

        {/* Main 2-Column Gym Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Exercise Queue + Rest Timer + Quick Weight Memory */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    {activeDay?.dayLabel}: {activeDay?.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Bấm chọn bài để xem 3D &amp; cách chỉnh máy
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold shrink-0">
                  {completedInCurrentDay}/{dayExercises.length} xong
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-3.5">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      (completedInCurrentDay / Math.max(dayExercises.length, 1)) * 100
                    )}%`,
                  }}
                />
              </div>

              <div className="space-y-2">
                {dayExercises.map((ex, idx) => {
                  const isSelected = ex.id === currentExercise.id;
                  const isDone = state.completedExerciseIdsToday.includes(ex.id);
                  const savedLog = state.exerciseLogs[ex.id];
                  const shownWeight = savedLog?.weightKg ?? ex.defaultWeightKg;

                  return (
                    <div
                      key={ex.id}
                      onClick={() => setSelectedExerciseId(ex.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedExerciseId(ex.id);
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-orange-50/80 border-[#F05A28] shadow-2xs'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-xs font-extrabold ${
                              isSelected ? 'text-[#F05A28]' : 'text-slate-500'
                            }`}
                          >
                            Bài {idx + 1}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-600">
                            {ex.sets} hiệp × {ex.reps}
                          </span>
                          {shownWeight > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-800 text-xs font-bold">
                              {shownWeight}kg
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-sm font-extrabold truncate mt-0.5 ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {ex.name}
                        </div>
                        <div className="text-xs text-slate-600 truncate">
                          {ex.vietnameseName}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExerciseDone(ex.id);
                        }}
                        aria-label={`Đánh dấu hoàn thành ${ex.name}`}
                        title="Đánh dấu đã tập xong bài này"
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-white border-slate-300 text-slate-400 hover:border-emerald-500 hover:text-emerald-600'
                        }`}
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rest Countdown Timer */}
            <GymRestTimerBar
              key={currentExercise.id}
              defaultSeconds={currentExercise.restSeconds}
            />

            {/* Weight & Seat Pin Memory */}
            <WeightLoggerBox
              key={currentExercise.id}
              exercise={currentExercise}
              savedLog={state.exerciseLogs[currentExercise.id]}
              onSave={(w, r, tip) => saveExerciseLog(currentExercise.id, w, r, tip)}
            />
          </aside>

          {/* Right Column: Hybrid 3D + Reference Photos + Step-by-Step Guide */}
          <section className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Card Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#F05A28]/12 text-[#F05A28] text-xs font-extrabold">
                    Bài {currentOrderIndex + 1} • {currentExercise.categoryLabel}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {currentExercise.muscleTag}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1.5">
                  {currentExercise.name} – {currentExercise.vietnameseName}
                </h2>
              </div>

              {/* View Mode Switcher */}
              <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start shrink-0">
                {(
                  [
                    { id: 'hybrid', label: 'Hybrid (3D + Ảnh)' },
                    { id: '3d-only', label: 'Chỉ 3D' },
                    { id: 'photo-only', label: 'Chỉ Ảnh mẫu' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setVisualMode(tab.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                      visualMode === tab.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.id === 'hybrid' && <Layers size={13} className="text-[#F05A28]" />}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Demonstration Body */}
            <div className="p-4 sm:p-6 space-y-4 bg-slate-50/50">
              {(visualMode === 'hybrid' || visualMode === '3d-only') && (
                <GymMannequin3DViewer exercise={currentExercise} />
              )}

              {(visualMode === 'hybrid' || visualMode === 'photo-only') && (
                <ExerciseReferenceDualView exercise={currentExercise} />
              )}
            </div>

            {/* 3-Column Metrics Strip (Exact clean visual rhythm as Hammer Curl reference screenshot) */}
            <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-b border-slate-200 bg-white">
              <div className="p-4 sm:px-6">
                <div className="text-xs font-semibold text-slate-500">Số hiệp</div>
                <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                  {currentExercise.sets}
                </div>
              </div>
              <div className="p-4 sm:px-6">
                <div className="text-xs font-semibold text-slate-500">Số lần</div>
                <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                  {currentExercise.reps}
                </div>
              </div>
              <div className="p-4 sm:px-6">
                <div className="text-xs font-semibold text-slate-500">Nghỉ</div>
                <div className="text-lg sm:text-xl font-black text-[#F05A28] mt-0.5">
                  {currentExercise.restLabel}
                </div>
              </div>
            </div>

            {/* Detailed Coaching Cues: Benefit, Step-by-Step & Mistakes to Avoid */}
            <div className="p-4 sm:p-6 space-y-5 bg-white">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm leading-relaxed text-slate-700 flex items-start gap-2.5">
                <Sparkles size={18} className="text-[#F05A28] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold text-slate-900">Tác dụng: </strong>
                  <span>{currentExercise.benefit}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">
                  Cách thực hiện chuẩn kỹ thuật:
                </h3>
                <ol className="space-y-2">
                  {currentExercise.steps.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed"
                    >
                      <span className="w-6 h-6 rounded-lg bg-[#1E293B] text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed text-slate-800">
                  <strong className="font-extrabold text-red-700">Lỗi cần tránh: </strong>
                  <span>{currentExercise.mistakes}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Customizer Modal */}
      {customizerOpen && (
        <SplitCustomizerModal
          open={customizerOpen}
          currentDays={state.customDays}
          onClose={() => setCustomizerOpen(false)}
          onSave={saveCustomSplitDays}
        />
      )}
    </div>
  );
}
