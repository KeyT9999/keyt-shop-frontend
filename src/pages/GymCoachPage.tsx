import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Columns2,
  MapPin,
  RefreshCw,
  Rotate3d,
} from 'lucide-react';
import { useAuthContext } from '../context/useAuthContext';
import ExerciseReferenceDualView from '../features/gym/components/ExerciseReferenceDualView';
import FemaleCycleAndProfileModal from '../features/gym/components/FemaleCycleAndProfileModal';
import GymAiCoachDrawer from '../features/gym/components/GymAiCoachDrawer';
import GymExerciseSubstituteModal from '../features/gym/components/GymExerciseSubstituteModal';
import GymGenderAdvisorPanel from '../features/gym/components/GymGenderAdvisorPanel';
import GymInlineMetricsTools from '../features/gym/components/GymInlineMetricsTools';
import GymMannequin3DViewer from '../features/gym/components/GymMannequin3DViewer';
import GymRestTimerBar from '../features/gym/components/GymRestTimerBar';
import RealGymMachineView from '../features/gym/components/RealGymMachineView';
import SplitCustomizerModal from '../features/gym/components/SplitCustomizerModal';
import {
  GYM_EXERCISE_CATALOG,
  GYM_EXERCISE_MAP,
} from '../features/gym/data/defaultGymCatalog';
import { useGymCoachState } from '../features/gym/hooks/useGymCoachState';
import type { GymGenderMode } from '../features/gym/types/gym';
import {
  computeSmartSetRecommendation,
  resolveCycleStatus,
} from '../features/gym/utils/gymCycleAndProgressionUtils';
import { generateGenderWorkoutAndNutritionPlan } from '../features/gym/utils/gymGenderAdvisorUtils';

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
  const [showStepsDetail, setShowStepsDetail] = useState<boolean>(false);
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
    setSelectedExerciseId('');
    navigate(nextGender === 'male' ? '/gym/nam' : '/gym/nu');
  };

  // Personalized exercises strictly driven by the user's current gender & goal
  const personalizedPlan = useMemo(
    () =>
      generateGenderWorkoutAndNutritionPlan({
        gender: activeGender,
        userProfile: state.userProfile,
        cycleTracking: state.cycleTracking,
      }),
    [activeGender, state.userProfile, state.cycleTracking]
  );

  const personalizedExercises = useMemo(
    () =>
      personalizedPlan.recommendedExercises.map((item) => item.exercise),
    [personalizedPlan]
  );

  const currentExercise = useMemo(() => {
    return (
      personalizedExercises.find((e) => e.id === selectedExerciseId) ||
      (selectedExerciseId ? GYM_EXERCISE_MAP[selectedExerciseId] : undefined) ||
      personalizedExercises[0] ||
      GYM_EXERCISE_CATALOG[0]
    );
  }, [personalizedExercises, selectedExerciseId]);

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

  const effectiveVisualTab: StageVisualTab =
    visualTab === 'gym_photo' && !currentExercise.realGymPhoto ? '3d' : visualTab;

  return (
    <div className="min-h-screen bg-[#111114] text-[#F7F7F7] py-3 sm:py-5 px-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* 1. PERSONALIZED GENDER ROUTER + 6 LIVE 3D EXERCISE CARDS + COMPACT 4-MEAL CHIPS */}
        <GymGenderAdvisorPanel
          activeGender={activeGender}
          selectedExerciseId={currentExercise.id}
          userProfile={state.userProfile}
          cycleTracking={state.cycleTracking}
          onSelectGenderRoute={handleSelectGenderRoute}
          onSaveProfile={saveUserProfile}
          onSaveCycle={saveCycleTracking}
          onApplyRecommendedSplit={(days) => {
            saveCustomSplitDays(days);
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

        {/* 2. FOCUSED 3D VISUAL STAGE + POSE REFERENCE FOR SELECTED EXERCISE (Minimal Text) */}
        <section
          id="gym-3d-stage-anchor"
          className="bg-[#16161C] rounded-3xl border border-[#272732] shadow-2xl overflow-hidden"
        >
          {/* Compact Top Bar: Exercise Name + 3D/Photo Switcher */}
          <div className="px-3.5 sm:px-5 py-3 border-b border-[#272732] flex flex-wrap items-center justify-between gap-2 bg-[#111114]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF5C8A]/20 text-[#FF5C8A] text-[11px] font-black shrink-0">
                MÔ PHỎNG 3D CHI TIẾT
              </span>
              <h2 className="text-sm sm:text-base font-black text-[#F7F7F7] truncate">
                {currentExercise.vietnameseName}
              </h2>
              <button
                type="button"
                onClick={() => setSubstituteOpen(true)}
                className="px-2 py-0.5 rounded-lg bg-[#242430] hover:bg-[#FF5C8A] text-zinc-300 hover:text-[#111114] text-[11px] font-extrabold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              >
                <RefreshCw size={11} />
                <span>Đổi bài</span>
              </button>
            </div>

            <div className="inline-flex items-center gap-0.5 bg-[#1B1B22] border border-[#2E2E3A] p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setVisualTab('3d')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
                  effectiveVisualTab === '3d'
                    ? 'bg-[#FF5C8A] text-[#111114]'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <Rotate3d size={13} />
                <span>3D Lớn</span>
              </button>

              {currentExercise.realGymPhoto && (
                <button
                  type="button"
                  onClick={() => setVisualTab('gym_photo')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
                    effectiveVisualTab === 'gym_photo'
                      ? 'bg-[#FF5C8A] text-[#111114]'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <MapPin size={13} />
                  <span>Máy Thật</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setVisualTab('photo')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
                  effectiveVisualTab === 'photo'
                    ? 'bg-[#FF5C8A] text-[#111114]'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <Camera size={13} />
                <span>2 Ảnh</span>
              </button>

              <button
                type="button"
                onClick={() => setVisualTab('split')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
                  effectiveVisualTab === 'split'
                    ? 'bg-[#FF5C8A] text-[#111114]'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <Columns2 size={13} />
                <span>Đôi 3D</span>
              </button>
            </div>
          </div>

          {/* Side-by-Side 3D + Visual Reference Stage */}
          <div className="p-3 sm:p-4 bg-[#111114] grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
            <div className="lg:col-span-7">
              {effectiveVisualTab === '3d' && (
                <GymMannequin3DViewer exercise={currentExercise} tall />
              )}
              {effectiveVisualTab === 'gym_photo' && currentExercise.realGymPhoto && (
                <RealGymMachineView exercise={currentExercise} />
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

            <div className="lg:col-span-5 flex flex-col justify-between gap-3">
              {/* Always show Secondary Visual Pose / Real Machine alongside the 3D Mannequin */}
              <div className="flex-1">
                {currentExercise.realGymPhoto && effectiveVisualTab === '3d' ? (
                  <RealGymMachineView exercise={currentExercise} />
                ) : (
                  <ExerciseReferenceDualView exercise={currentExercise} />
                )}
              </div>

              <GymRestTimerBar
                key={`timer_${currentExercise.id}`}
                defaultSeconds={currentExercise.restSeconds}
              />
            </div>
          </div>

          {/* Compact Weight & Set Stepper Bar */}
          <GymInlineMetricsTools
            key={currentExercise.id}
            exercise={currentExercise}
            savedLog={state.exerciseLogs[currentExercise.id]}
            recommendation={setRecommendation}
            onSaveLog={(w, r, tip) =>
              saveExerciseLog(currentExercise.id, w, r, tip)
            }
          />

          {/* Optional Collapsible Technique Steps (Closed by default so UI stays visual & low-text) */}
          <div className="px-4 py-2.5 bg-[#16161C] border-t border-[#272732]">
            <button
              type="button"
              onClick={() => setShowStepsDetail((v) => !v)}
              className="w-full flex items-center justify-between text-xs font-extrabold text-zinc-400 hover:text-white cursor-pointer"
            >
              <span>
                 Thiết bị: {currentExercise.machineName} • {currentExercise.muscleTag}
              </span>
              <span className="inline-flex items-center gap-1 text-[#FF85A9]">
                <span>{showStepsDetail ? 'Ẩn bước tập' : 'Xem 4 bước ngắn'}</span>
                {showStepsDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>

            {showStepsDetail && (
              <ol className="mt-2.5 pt-2.5 border-t border-[#272732] grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentExercise.steps.map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-zinc-300 bg-[#111114] p-2.5 rounded-xl border border-[#252530]"
                  >
                    <span className="w-4 h-4 rounded-md bg-[#FF5C8A] text-[#111114] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>

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
          currentDayExerciseIds={personalizedExercises.map((e) => e.id)}
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

      <GymAiCoachDrawer
        open={aiCoachOpen}
        activeGender={activeGender}
        token={token}
        userProfile={state.userProfile}
        cycleTracking={state.cycleTracking}
        cycleStatus={cycleStatus}
        activeDay={state.customDays[0]}
        currentExercise={currentExercise}
        workoutStreak={state.workoutStreak}
        customDays={state.customDays}
        exerciseLogs={state.exerciseLogs}
        chatHistory={state.aiChatHistory}
        onOpen={() => setAiCoachOpen(true)}
        onClose={() => setAiCoachOpen(false)}
        onAppendMessages={appendAiChatMessages}
        onClearHistory={clearAiChatHistory}
        onApplyPresetDays={saveCustomSplitDays}
        onOpenProfileModal={() => setCycleProfileOpen(true)}
      />
    </div>
  );
}
