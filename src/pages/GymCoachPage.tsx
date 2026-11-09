import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bot,
  Camera,
  Check,
  CheckCircle2,
  Columns2,
  HeartPulse,
  MapPin,
  RefreshCw,
  Rotate3d,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useAuthContext } from '../context/useAuthContext';
import ExerciseReferenceDualView from '../features/gym/components/ExerciseReferenceDualView';
import FemaleCycleAndProfileModal from '../features/gym/components/FemaleCycleAndProfileModal';
import GymAiCoachDrawer from '../features/gym/components/GymAiCoachDrawer';
import GymExerciseSubstituteModal from '../features/gym/components/GymExerciseSubstituteModal';
import GymGenderAdvisorPanel from '../features/gym/components/GymGenderAdvisorPanel';
import GymInlineMetricsTools from '../features/gym/components/GymInlineMetricsTools';
import GymMannequin3DViewer from '../features/gym/components/GymMannequin3DViewer';
import GymNeonHeroDashboard from '../features/gym/components/GymNeonHeroDashboard';
import GymRestTimerBar from '../features/gym/components/GymRestTimerBar';
import GymSelectorCockpit from '../features/gym/components/GymSelectorCockpit';
import RealGymMachineView from '../features/gym/components/RealGymMachineView';
import SplitCustomizerModal from '../features/gym/components/SplitCustomizerModal';
import {
  GYM_EXERCISE_CATALOG,
  GYM_EXERCISE_MAP,
} from '../features/gym/data/defaultGymCatalog';
import { useGymCoachState } from '../features/gym/hooks/useGymCoachState';
import type { GymGenderMode } from '../features/gym/types/gym';
import {
  computeSessionEnergyStats,
  computeSmartSetRecommendation,
  resolveCycleStatus,
} from '../features/gym/utils/gymCycleAndProgressionUtils';
import { resolveExercisesForDay } from '../features/gym/utils/gymStateUtils';

/**
 * Decision: Default to single-stage '3d' on mobile so the visual viewport stays
 * compact and "Máy tập + Cách thực hiện + Technique Pillar Card" appear right below.
 */
type StageVisualTab = '3d' | 'gym_photo' | 'photo' | 'split';

interface GymCoachPageProps {
  genderRoute?: GymGenderMode;
}

export default function GymCoachPage({ genderRoute }: GymCoachPageProps = {}) {
  const { token } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    state,
    syncStatus,
    selectDay,
    toggleExerciseDone,
    completeDayAndAdvance,
    saveExerciseLog,
    saveCustomSplitDays,
    saveUserProfile,
    saveCycleTracking,
    replaceExerciseInActiveDay,
    setExerciseRestriction,
    appendAiChatMessages,
    clearAiChatHistory,
  } = useGymCoachState(token);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [visualTab, setVisualTab] = useState<StageVisualTab>('3d');
  const [customizerOpen, setCustomizerOpen] = useState<boolean>(false);
  const [cycleProfileOpen, setCycleProfileOpen] = useState<boolean>(false);
  const [substituteOpen, setSubstituteOpen] = useState<boolean>(false);
  const [aiCoachOpen, setAiCoachOpen] = useState<boolean>(false);

  const activeGender: GymGenderMode = useMemo(() => {
    if (genderRoute) return genderRoute;
    if (location.pathname.startsWith('/gym/nam')) return 'male';
    if (location.pathname.startsWith('/gym/nu')) return 'female';
    return state.userProfile.gender === 'male' ? 'male' : 'female';
  }, [genderRoute, location.pathname, state.userProfile.gender]);

  const handleSelectGenderRoute = (nextGender: GymGenderMode) => {
    saveUserProfile({ gender: nextGender });
    navigate(nextGender === 'male' ? '/gym/nam' : '/gym/nu');
  };

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
      dayExercises.find((e) => e.id === selectedExerciseId) ||
      (selectedExerciseId ? GYM_EXERCISE_MAP[selectedExerciseId] : undefined) ||
      dayExercises[0]
    );
  }, [dayExercises, selectedExerciseId]);

  const currentOrderIndex = Math.max(
    0,
    dayExercises.findIndex((e) => e.id === currentExercise.id)
  );

  const completedInCurrentDay = dayExercises.filter((e) =>
    state.completedExerciseIdsToday.includes(e.id)
  ).length;

  const cycleStatus = useMemo(
    () => resolveCycleStatus(state.cycleTracking, currentExercise),
    [state.cycleTracking, currentExercise]
  );

  const setRecommendation = useMemo(
    () =>
      computeSmartSetRecommendation(
        currentExercise,
        state.exerciseLogs[currentExercise.id],
        cycleStatus
      ),
    [currentExercise, state.exerciseLogs, cycleStatus]
  );

  const sessionStats = useMemo(
    () =>
      computeSessionEnergyStats(
        dayExercises,
        state.completedExerciseIdsToday,
        state.userProfile
      ),
    [dayExercises, state.completedExerciseIdsToday, state.userProfile]
  );

  const effectiveVisualTab: StageVisualTab =
    visualTab === 'gym_photo' && !currentExercise.realGymPhoto ? '3d' : visualTab;

  return (
    <div className="min-h-screen bg-[#111114] text-[#F7F7F7] py-3 sm:py-6 px-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-3.5 sm:space-y-5">
        {/* Dual Router Bar (/gym/nam vs /gym/nu) + Gender-Specific Questionnaire + Instant Workout & Meal Recommendations */}
        <GymGenderAdvisorPanel
          activeGender={activeGender}
          userProfile={state.userProfile}
          cycleTracking={state.cycleTracking}
          onSelectGenderRoute={handleSelectGenderRoute}
          onSaveProfile={saveUserProfile}
          onSaveCycle={saveCycleTracking}
          onApplyRecommendedSplit={(days) => {
            saveCustomSplitDays(days);
            setSelectedExerciseId('');
          }}
          onSelectExerciseFor3D={(exId) => {
            setSelectedExerciseId(exId);
            setVisualTab('3d');
            if (typeof document !== 'undefined') {
              const el = document.getElementById('gym-3d-stage-anchor');
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          onOpenAiCoachDrawer={() => setAiCoachOpen(true)}
        />

        {/* Neon Pink & Dark Charcoal Hero Dashboard (Progress / 7-Day Capsules / WORKOUT Hero / 3 Pillar Cards) */}
        {activeDay && (
          <GymNeonHeroDashboard
            userProfile={state.userProfile}
            cycleStatus={cycleStatus}
            sessionStats={sessionStats}
            setRecommendation={setRecommendation}
            days={state.customDays}
            activeDay={activeDay}
            currentExercise={currentExercise}
            workoutStreak={state.workoutStreak}
            onSelectDay={(dayId) => {
              selectDay(dayId);
              setSelectedExerciseId('');
            }}
            onOpenCycleProfileModal={() => setCycleProfileOpen(true)}
            onOpenSubstituteModal={() => setSubstituteOpen(true)}
            onOpenAiCoachDrawer={() => setAiCoachOpen(true)}
            onOpenCustomizerModal={() => setCustomizerOpen(true)}
          />
        )}

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
            onOpenSubstitute={() => setSubstituteOpen(true)}
          />
        )}

        {/* Main Workspace: Desktop Queue + Primary 3D & Technique Cockpit */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Desktop-Only Left Queue Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 space-y-4">
            <div className="bg-[#16161C] rounded-3xl border border-[#272732] p-4 shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div>
                  <h2 className="text-sm font-black text-[#F7F7F7]">
                    {activeDay?.dayLabel}: {activeDay?.title}
                  </h2>
                  <p className="text-xs text-zinc-400">{activeDay?.subtitle}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#A3F77B]/15 text-[#A3F77B] border border-[#A3F77B]/40 text-xs font-extrabold">
                  {completedInCurrentDay}/{dayExercises.length} xong
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-[#242430] overflow-hidden mb-3">
                <div
                  className="h-full bg-linear-to-r from-[#FF5C8A] to-[#A3F77B] transition-all duration-300"
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
                      className={`p-3 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#FF5C8A]/15 border-[#FF5C8A] shadow-lg shadow-[#FF5C8A]/10'
                          : 'bg-[#111114] border-[#272732] hover:border-[#3A3A48]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-black ${
                              isSelected ? 'text-[#FF5C8A]' : 'text-zinc-400'
                            }`}
                          >
                            Bài {idx + 1}
                          </span>
                          <span className="text-xs text-zinc-600">•</span>
                          <span className="text-xs font-semibold text-zinc-300">
                            {ex.sets} × {ex.reps}
                          </span>
                          {shownWeight > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-[#252532] text-[#FF85A9] text-[11px] font-bold">
                              {shownWeight}kg
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-sm font-extrabold truncate mt-0.5 ${
                            isDone ? 'line-through text-zinc-500' : 'text-[#F7F7F7]'
                          }`}
                        >
                          {ex.vietnameseName}
                        </div>
                        <div className="text-xs text-zinc-400 truncate">
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
                            ? 'bg-[#A3F77B] border-[#A3F77B] text-[#111114]'
                            : 'bg-[#1B1B22] border-[#323240] text-zinc-400 hover:border-[#A3F77B]'
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

          {/* Primary Cockpit Card: Visual Stage + Inline Tools + TECHNIQUE Pillar Card + Execution Steps */}
          <section
            id="gym-3d-stage-anchor"
            className="lg:col-span-8 bg-[#16161C] rounded-3xl border border-[#272732] shadow-2xl overflow-hidden"
          >
            {/* Compact Title + Stage Mode Toggle */}
            <div className="px-3.5 sm:px-5 py-3 sm:py-4 border-b border-[#272732] flex flex-wrap items-center justify-between gap-2 bg-[#111114]">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-lg font-black text-[#F7F7F7] truncate">
                    {currentExercise.name}
                  </h1>
                  <button
                    type="button"
                    onClick={() => setSubstituteOpen(true)}
                    className="px-2 py-0.5 rounded-lg bg-[#242430] hover:bg-[#FF5C8A] text-zinc-300 hover:text-[#111114] text-[11px] font-extrabold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Đổi bài</span>
                  </button>
                </div>
                <p className="text-xs text-[#FF85A9] font-bold truncate mt-0.5">
                  {currentExercise.vietnameseName} • {currentExercise.muscleTag}
                </p>
              </div>

              <div className="inline-flex items-center gap-0.5 bg-[#1B1B22] border border-[#2E2E3A] p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setVisualTab('3d')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
                    effectiveVisualTab === '3d'
                      ? 'bg-[#FF5C8A] text-[#111114] shadow-xs'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <Rotate3d size={13} />
                  <span>3D</span>
                </button>

                {currentExercise.realGymPhoto && (
                  <button
                    type="button"
                    onClick={() => setVisualTab('gym_photo')}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
                      effectiveVisualTab === 'gym_photo'
                        ? 'bg-[#FF5C8A] text-[#111114] shadow-xs'
                        : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    <MapPin size={13} />
                    <span>Máy thật</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setVisualTab('photo')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
                    effectiveVisualTab === 'photo'
                      ? 'bg-[#FF5C8A] text-[#111114] shadow-xs'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <Camera size={13} />
                  <span>2 Ảnh</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisualTab('split')}
                  className={`hidden md:inline-flex px-2.5 py-1 rounded-lg text-xs font-extrabold items-center gap-1 transition-colors cursor-pointer ${
                    effectiveVisualTab === 'split'
                      ? 'bg-[#FF5C8A] text-[#111114] shadow-xs'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <Columns2 size={13} />
                  <span>Song song</span>
                </button>
              </div>
            </div>

            {/* Period / Spinal Load Safety Alert when applicable */}
            {cycleStatus.isHighSpinalLoadWarning && (
              <div className="px-4 py-2.5 bg-[#FF5C8A]/18 border-b border-[#FF5C8A]/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-[#F7F7F7]">
                  <HeartPulse size={15} className="text-[#FF5C8A] shrink-0" />
                  <span>
                    <strong>Lưu ý Chu kỳ / Lưng dưới:</strong> Bài tập này tạo áp lực ổ
                    bụng &amp; cột sống khá lớn. Bạn nên giảm tạ xuống{' '}
                    <strong>{setRecommendation.recommendedWeightKg}kg</strong> hoặc đổi
                    sang bài cô lập mông êm hơn.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSubstituteOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-[#FF5C8A] text-[#111114] font-black cursor-pointer"
                >
                  Đổi bài êm hơn
                </button>
              </div>
            )}

            {/* Unified Visual Stage */}
            <div className="p-2.5 sm:p-4 bg-[#111114]">
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
              recommendation={setRecommendation}
              onSaveLog={(w, r, tip) =>
                saveExerciseLog(currentExercise.id, w, r, tip)
              }
            />

            {/* Execution Guide + Signature Neon Pink TECHNIQUE Pillar Card */}
            <div className="p-3.5 sm:p-5 space-y-4 bg-[#16161C]">
              {/* Signature TECHNIQUE Header + Neon Pink Pillar Card (from Right Phone Screen of Reference Design) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#F7F7F7]">
                    TECHNIQUE
                  </h2>
                  <span className="text-xs font-extrabold text-[#FF5C8A]">
                    {setRecommendation.badgeTextVi}
                  </span>
                </div>

                <div className="rounded-3xl bg-[#FF85A9] text-[#111114] p-4 sm:p-5 shadow-lg space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-widest opacity-75">
                    TIPS • {currentExercise.categoryLabel}
                  </div>
                  <div className="text-base sm:text-lg font-black leading-snug">
                    Pillar description: {currentExercise.vietnameseName}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed opacity-90">
                    {currentExercise.benefit} {setRecommendation.reasonVi}
                  </p>
                </div>
              </div>

              {/* Compact Machine & Seat Setup Banner */}
              <div className="rounded-2xl border border-[#2E2E3C] bg-[#111114] px-3.5 py-3 flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#FF5C8A]/15 text-[#FF5C8A] flex items-center justify-center shrink-0 mt-0.5">
                    <Wrench size={15} />
                  </div>
                  <div className="min-w-0 text-xs sm:text-sm leading-snug">
                    <div className="font-extrabold text-[#F7F7F7]">
                      Máy / Dụng cụ: {currentExercise.machineName}
                    </div>
                    <div className="text-xs text-zinc-300 mt-1 flex items-start gap-1.5">
                      <CheckCircle2
                        size={13}
                        className="text-[#A3F77B] shrink-0 mt-0.5"
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
                    className="shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-[#FF5C8A] shadow-sm relative group cursor-pointer"
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

              {/* Step-by-Step Execution */}
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#FF5C8A] mb-2.5">
                  Cách thực hiện chuẩn kỹ thuật
                </h3>
                <ol className="space-y-2">
                  {currentExercise.steps.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-[13px] sm:text-sm text-zinc-200 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-lg bg-[#FF5C8A] text-[#111114] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Mistakes to Avoid + Cycle Nutrition Tip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 text-xs sm:text-sm leading-snug text-zinc-200">
                  <AlertTriangle
                    size={16}
                    className="text-[#FF5C8A] shrink-0 mt-0.5"
                  />
                  <div>
                    <strong className="font-black text-[#FF85A9]">
                      Lỗi cần tránh:{' '}
                    </strong>
                    <span>{currentExercise.mistakes}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#111114] border border-[#2E2E3C] flex items-start gap-2.5 text-xs sm:text-sm leading-snug text-zinc-200">
                  <Sparkles
                    size={16}
                    className="text-[#A3F77B] shrink-0 mt-0.5"
                  />
                  <div>
                    <strong className="font-black text-[#A3F77B]">
                      Mẹo Dinh Dưỡng &amp; Đốt Calo:{' '}
                    </strong>
                    <span>
                      {cycleStatus.nutritionTipVi} ({sessionStats.funEquivalenceVi})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Floating Bottom-Right AI Coach Quick Trigger */}
      <button
        type="button"
        onClick={() => setAiCoachOpen(true)}
        aria-label="Mở khung chat Huấn luyện viên AI"
        className="fixed bottom-5 right-5 z-40 h-12 px-4 rounded-full bg-[#FF5C8A] hover:bg-[#ff4278] text-[#111114] font-black text-xs sm:text-sm flex items-center gap-2 shadow-2xl shadow-[#FF5C8A]/40 transition-transform duration-200 hover:scale-105 cursor-pointer"
      >
        <Bot size={18} />
        <span>Hỏi AI Coach</span>
      </button>

      {customizerOpen && (
        <SplitCustomizerModal
          open={customizerOpen}
          currentDays={state.customDays}
          onClose={() => setCustomizerOpen(false)}
          onSave={saveCustomSplitDays}
        />
      )}

      {cycleProfileOpen && (
        <FemaleCycleAndProfileModal
          open={cycleProfileOpen}
          userProfile={state.userProfile}
          cycleTracking={state.cycleTracking}
          onClose={() => setCycleProfileOpen(false)}
          onSaveProfile={saveUserProfile}
          onSaveCycle={saveCycleTracking}
          onApplyPresetDays={saveCustomSplitDays}
        />
      )}

      {substituteOpen && (
        <GymExerciseSubstituteModal
          open={substituteOpen}
          currentExercise={currentExercise}
          currentDayExerciseIds={dayExercises.map((e) => e.id)}
          restrictions={state.exerciseRestrictions}
          userProfile={state.userProfile}
          isDeloadOrPeriod={cycleStatus.isDeloadRecommended}
          onClose={() => setSubstituteOpen(false)}
          onSelectSubstitute={(newExId) => {
            replaceExerciseInActiveDay(currentExercise.id, newExId);
            setSelectedExerciseId(newExId);
          }}
          onSetRestriction={setExerciseRestriction}
        />
      )}

      {aiCoachOpen && activeDay && (
        <GymAiCoachDrawer
          open={aiCoachOpen}
          token={token}
          userProfile={state.userProfile}
          cycleTracking={state.cycleTracking}
          cycleStatus={cycleStatus}
          activeDay={activeDay}
          currentExercise={currentExercise}
          customDays={state.customDays}
          exerciseLogs={state.exerciseLogs}
          workoutStreak={state.workoutStreak}
          chatHistory={state.aiChatHistory}
          onClose={() => setAiCoachOpen(false)}
          onAppendMessages={appendAiChatMessages}
          onClearHistory={clearAiChatHistory}
          onApplyPresetDays={saveCustomSplitDays}
          onOpenProfileModal={() => setCycleProfileOpen(true)}
        />
      )}
    </div>
  );
}
