import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  Columns2,
  MapPin,
  Rotate3d,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useAuthContext } from '../context/useAuthContext';
import ExerciseReferenceDualView from '../features/gym/components/ExerciseReferenceDualView';
import GymInlineMetricsTools from '../features/gym/components/GymInlineMetricsTools';
import GymMannequin3DViewer from '../features/gym/components/GymMannequin3DViewer';
import GymRestTimerBar from '../features/gym/components/GymRestTimerBar';
import GymSelectorCockpit from '../features/gym/components/GymSelectorCockpit';
import RealGymMachineView from '../features/gym/components/RealGymMachineView';
import SplitCustomizerModal from '../features/gym/components/SplitCustomizerModal';
import { GYM_EXERCISE_CATALOG } from '../features/gym/data/defaultGymCatalog';
import { useGymCoachState } from '../features/gym/hooks/useGymCoachState';
import { resolveExercisesForDay } from '../features/gym/utils/gymStateUtils';

/**
 * Decision: Default to single-stage '3d' on mobile so the visual viewport stays
 * fixed at 224px (h-56) and "Máy tập + Cách thực hiện" appear right above the fold
 * without scrolling. Users can flip to 'photo' in 1 tap, or 'split' on wider screens.
 */
type StageVisualTab = '3d' | 'gym_photo' | 'photo' | 'split';

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
  const [visualTab, setVisualTab] = useState<StageVisualTab>('3d');
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

  const effectiveVisualTab: StageVisualTab =
    visualTab === 'gym_photo' && !currentExercise.realGymPhoto ? '3d' : visualTab;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-2.5 sm:py-5 px-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-2.5 sm:space-y-4">
        {/* Compact Dual-Dropdown Cockpit (Day Dropdown + Exercise Dropdown + Prev/Next/Done) */}
        {activeDay && (
          <GymSelectorCockpit
            days={state.customDays}
            activeDay={activeDay}
            dayExercises={dayExercises}
            currentExercise={currentExercise}
            currentOrderIndex={currentOrderIndex}
            completedIdsToday={state.completedExerciseIdsToday}
            exerciseLogs={state.exerciseLogs}
            workoutStreak={state.workoutStreak}
            syncStatus={syncStatus}
            onSelectDay={(dayId) => {
              selectDay(dayId);
              setSelectedExerciseId('');
            }}
            onSelectExercise={(exId) => setSelectedExerciseId(exId)}
            onToggleExerciseDone={toggleExerciseDone}
            onCompleteDayAndAdvance={() => {
              completeDayAndAdvance();
              setSelectedExerciseId('');
            }}
            onOpenCustomizer={() => setCustomizerOpen(true)}
          />
        )}

        {/* Main Workspace: Mobile shows Main Simulation + Execution FIRST (zero bloat above!) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Desktop-Only Left Queue Sidebar (hidden on mobile because mobile uses the fast top Dropdowns) */}
          <aside className="hidden lg:block lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    {activeDay?.dayLabel}: {activeDay?.title}
                  </h2>
                  <p className="text-xs text-slate-500">{activeDay?.subtitle}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
                  {completedInCurrentDay}/{dayExercises.length} xong
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3">
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
                  const shownWeight =
                    state.exerciseLogs[ex.id]?.weightKg ?? ex.defaultWeightKg;

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
                      className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-orange-50/80 border-[#F05A28] shadow-2xs'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-extrabold ${
                              isSelected ? 'text-[#F05A28]' : 'text-slate-500'
                            }`}
                          >
                            Bài {idx + 1}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-600">
                            {ex.sets} × {ex.reps}
                          </span>
                          {shownWeight > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-800 text-[11px] font-bold">
                              {shownWeight}kg
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-sm font-extrabold truncate mt-0.5 ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {ex.vietnameseName}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {ex.name}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExerciseDone(ex.id);
                        }}
                        aria-label={`Đánh dấu hoàn thành ${ex.vietnameseName}`}
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
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
            </div>

            <GymRestTimerBar
              key={`desk_${currentExercise.id}`}
              defaultSeconds={currentExercise.restSeconds}
            />
          </aside>

          {/* Primary Cockpit Card: Visual Stage + Inline Tools + Machine + Execution Steps */}
          <section className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Compact Title + Stage Mode Toggle */}
            <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-black text-slate-900 truncate">
                  {currentExercise.name}
                </h1>
                <p className="text-xs text-slate-500 font-semibold truncate">
                  {currentExercise.vietnameseName} • {currentExercise.muscleTag}
                </p>
              </div>

              <div className="inline-flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setVisualTab('3d')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
                    effectiveVisualTab === '3d'
                      ? 'bg-[#1E293B] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Rotate3d size={13} className="text-[#F05A28]" />
                  <span>3D</span>
                </button>

                {currentExercise.realGymPhoto && (
                  <button
                    type="button"
                    onClick={() => setVisualTab('gym_photo')}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
                      effectiveVisualTab === 'gym_photo'
                        ? 'bg-[#1E293B] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <MapPin size={13} className="text-[#F05A28]" />
                    <span>Máy thật</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setVisualTab('photo')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
                    effectiveVisualTab === 'photo'
                      ? 'bg-[#1E293B] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera size={13} className="text-[#F05A28]" />
                  <span>2 Ảnh</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisualTab('split')}
                  className={`hidden md:inline-flex px-2.5 py-1 rounded-lg text-xs font-extrabold items-center gap-1 transition-colors cursor-pointer ${
                    effectiveVisualTab === 'split'
                      ? 'bg-[#1E293B] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Columns2 size={13} className="text-[#F05A28]" />
                  <span>Song song</span>
                </button>
              </div>
            </div>

            {/* Unified Visual Stage (Fixed compact height on mobile so Steps stay visible right below!) */}
            <div className="p-2.5 sm:p-4 bg-slate-50/60">
              {effectiveVisualTab === '3d' && (
                <GymMannequin3DViewer exercise={currentExercise} />
              )}
              {effectiveVisualTab === 'gym_photo' && (
                <RealGymMachineView
                  exercise={currentExercise}
                  onSwitchTo3D={() => setVisualTab('3d')}
                />
              )}
              {effectiveVisualTab === 'photo' && (
                <ExerciseReferenceDualView exercise={currentExercise} />
              )}
              {effectiveVisualTab === 'split' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <GymMannequin3DViewer exercise={currentExercise} />
                  {currentExercise.realGymPhoto ? (
                    <RealGymMachineView exercise={currentExercise} />
                  ) : (
                    <ExerciseReferenceDualView exercise={currentExercise} />
                  )}
                </div>
              )}
            </div>

            {/* Compact Metrics + 1-Tap Rest Timer + +/-2.5kg Weight Stepper */}
            <GymInlineMetricsTools
              key={currentExercise.id}
              exercise={currentExercise}
              savedLog={state.exerciseLogs[currentExercise.id]}
              onSaveLog={(w, r, tip) =>
                saveExerciseLog(currentExercise.id, w, r, tip)
              }
            />

            {/* Above-the-Fold Execution Guide: Machine Setup + Step-by-Step + Mistakes */}
            <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 bg-white">
              {/* Compact Machine & Seat Setup Banner */}
              <div className="rounded-xl border border-orange-200/90 bg-orange-50/55 px-3 py-2.5 flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#F05A28]/15 text-[#F05A28] flex items-center justify-center shrink-0 mt-0.5">
                    <Wrench size={15} />
                  </div>
                  <div className="min-w-0 text-xs sm:text-sm leading-snug">
                    <div className="font-extrabold text-slate-900">
                      Máy / Dụng cụ: {currentExercise.machineName}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 flex items-start gap-1">
                      <CheckCircle2
                        size={13}
                        className="text-emerald-600 shrink-0 mt-0.5"
                      />
                      <span>{currentExercise.machineSetupTip}</span>
                    </div>
                  </div>
                </div>

                {currentExercise.realGymPhoto && (
                  <button
                    type="button"
                    onClick={() =>
                      setVisualTab(
                        effectiveVisualTab === 'gym_photo' ? '3d' : 'gym_photo'
                      )
                    }
                    title="Xem ảnh máy thực tế ở phòng Gym"
                    className="shrink-0 w-11 h-11 rounded-lg overflow-hidden border border-orange-300 shadow-2xs relative group cursor-pointer"
                  >
                    <img
                      src={currentExercise.realGymPhoto}
                      alt={currentExercise.machineName}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </button>
                )}
              </div>

              {/* Step-by-Step Execution (Immediately visible without scrolling!) */}
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#1E293B] mb-2">
                  Cách thực hiện chuẩn kỹ thuật
                </h2>
                <ol className="space-y-1.5 sm:space-y-2">
                  {currentExercise.steps.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[13px] sm:text-sm text-slate-800 leading-snug"
                    >
                      <span className="w-5 h-5 rounded-md bg-[#1E293B] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Mistakes to Avoid + Benefit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-red-50/80 border border-red-200/90 flex items-start gap-2 text-xs sm:text-sm leading-snug text-slate-800">
                  <AlertTriangle
                    size={16}
                    className="text-red-600 shrink-0 mt-0.5"
                  />
                  <div>
                    <strong className="font-extrabold text-red-700">
                      Lỗi cần tránh:{' '}
                    </strong>
                    <span>{currentExercise.mistakes}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-xs sm:text-sm leading-snug text-slate-700">
                  <Sparkles
                    size={16}
                    className="text-[#F05A28] shrink-0 mt-0.5"
                  />
                  <div>
                    <strong className="font-extrabold text-slate-900">
                      Tác dụng:{' '}
                    </strong>
                    <span>{currentExercise.benefit}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

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
