import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/useAuthContext';
import FemaleCycleAndProfileModal from '../features/gym/components/FemaleCycleAndProfileModal';
import GymAiCoachDrawer from '../features/gym/components/GymAiCoachDrawer';
import GymExerciseSubstituteModal from '../features/gym/components/GymExerciseSubstituteModal';
import GymGenderAdvisorPanel from '../features/gym/components/GymGenderAdvisorPanel';
import GymProgressHistoryModal from '../features/gym/components/GymProgressHistoryModal';
import SplitCustomizerModal from '../features/gym/components/SplitCustomizerModal';
import {
  GYM_EXERCISE_CATALOG,
  GYM_EXERCISE_MAP,
} from '../features/gym/data/defaultGymCatalog';
import { useGymCoachState } from '../features/gym/hooks/useGymCoachState';
import type {
  GymExerciseDefinition,
  GymGenderMode,
  GymWorkoutHistoryEntry,
} from '../features/gym/types/gym';
import { resolveGenderReadinessStatus } from '../features/gym/utils/gymCycleAndProgressionUtils';
import { generateGenderWorkoutAndNutritionPlan } from '../features/gym/utils/gymGenderAdvisorUtils';

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
    completeGenderWorkoutSession,
    saveExerciseLog,
    saveCustomSplitDays,
    saveUserProfile,
    addWaterIntakeMl,
    saveCycleTracking,
    replaceExerciseInActiveDay,
    setExerciseRestriction,
    appendAiChatMessages,
    clearAiChatHistory,
  } = useGymCoachState(token);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [customizerOpen, setCustomizerOpen] = useState<boolean>(false);
  const [cycleProfileOpen, setCycleProfileOpen] = useState<boolean>(false);
  const [substituteOpen, setSubstituteOpen] = useState<boolean>(false);
  const [progressOpen, setProgressOpen] = useState<boolean>(false);
  const [celebrationSession, setCelebrationSession] =
    useState<GymWorkoutHistoryEntry | null>(null);
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

  const personalizedPlan = useMemo(
    () =>
      generateGenderWorkoutAndNutritionPlan({
        gender: activeGender,
        userProfile: state.userProfile,
        cycleTracking: state.cycleTracking,
      }),
    [activeGender, state.userProfile, state.cycleTracking]
  );

  const savedGenderDays =
    activeGender === 'male' ? state.maleCustomDays : state.femaleCustomDays;
  const activeGenderDayId =
    activeGender === 'male' ? state.activeMaleDayId : state.activeFemaleDayId;

  const effectiveGenderDays = useMemo(
    () =>
      savedGenderDays && savedGenderDays.length > 0
        ? savedGenderDays
        : personalizedPlan.recommendedSplitDays,
    [savedGenderDays, personalizedPlan.recommendedSplitDays]
  );

  const activeSessionDay = useMemo(
    () =>
      effectiveGenderDays.find((d) => d.id === activeGenderDayId) ||
      effectiveGenderDays[0] ||
      state.customDays[0],
    [effectiveGenderDays, activeGenderDayId, state.customDays]
  );

  const currentDayExercises = useMemo(
    () =>
      (activeSessionDay?.exerciseIds || [])
        .map((id) => GYM_EXERCISE_MAP[id])
        .filter((e): e is GymExerciseDefinition => Boolean(e)),
    [activeSessionDay]
  );

  const currentExercise = useMemo(() => {
    return (
      currentDayExercises.find((e) => e.id === selectedExerciseId) ||
      (selectedExerciseId ? GYM_EXERCISE_MAP[selectedExerciseId] : undefined) ||
      currentDayExercises[0] ||
      GYM_EXERCISE_CATALOG[0]
    );
  }, [currentDayExercises, selectedExerciseId]);

  const readinessStatus = useMemo(
    () =>
      resolveGenderReadinessStatus(
        activeGender,
        state.userProfile,
        state.cycleTracking,
        currentExercise
      ),
    [activeGender, state.userProfile, state.cycleTracking, currentExercise]
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-3 sm:pt-5 pb-24 md:pb-12 px-2.5 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <GymGenderAdvisorPanel
          key={activeGender}
          activeGender={activeGender}
          selectedExerciseId={currentExercise.id}
          savedGenderDays={savedGenderDays}
          activeGenderDayId={activeSessionDay?.id}
          syncStatus={syncStatus}
          workoutStreak={state.workoutStreak}
          userProfile={state.userProfile}
          cycleTracking={state.cycleTracking}
          exerciseLogs={state.exerciseLogs}
          workoutHistory={state.workoutHistory}
          bodyMetricsHistory={state.bodyMetricsHistory}
          completedIdsToday={state.completedExerciseIdsToday}
          onSelectGenderRoute={handleSelectGenderRoute}
          onSelectGenderDay={(dayId) => selectDay(dayId, activeGender)}
          onSaveProfile={saveUserProfile}
          onSaveCycle={saveCycleTracking}
          onApplyRecommendedSplit={(days) => {
            saveCustomSplitDays(days, activeGender);
          }}
          onSelectExerciseFor3D={(exId) => {
            setSelectedExerciseId(exId);
          }}
          onToggleExerciseDone={toggleExerciseDone}
          onSaveExerciseLog={saveExerciseLog}
          onAddWaterIntakeMl={addWaterIntakeMl}
          onRecordTodayBodyMetrics={() =>
            saveUserProfile({ gender: activeGender }, true)
          }
          onCompleteSession={(summary) => {
            const entry = completeGenderWorkoutSession({
              gender: activeGender,
              ...summary,
            });
            setCelebrationSession(entry);
            setProgressOpen(true);
          }}
          onOpenSubstituteModal={() => setSubstituteOpen(true)}
          onOpenCustomizerModal={() => setCustomizerOpen(true)}
          onOpenProgressModal={() => {
            setCelebrationSession(null);
            setProgressOpen(true);
          }}
          onOpenAiCoachDrawer={() => setAiCoachOpen(true)}
        />
      </div>

      {customizerOpen && (
        <SplitCustomizerModal
          open={customizerOpen}
          gender={activeGender}
          currentDays={effectiveGenderDays}
          recommendedDefaultDays={personalizedPlan.recommendedSplitDays}
          onClose={() => setCustomizerOpen(false)}
          onSave={(days) => saveCustomSplitDays(days, activeGender)}
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
          onApplyPresetDays={(days) => saveCustomSplitDays(days, 'female')}
        />
      )}

      {substituteOpen && (
        <GymExerciseSubstituteModal
          open={substituteOpen}
          gender={activeGender}
          currentExercise={currentExercise}
          currentDayExerciseIds={currentDayExercises.map((e) => e.id)}
          restrictions={state.exerciseRestrictions}
          userProfile={state.userProfile}
          isDeloadOrPeriod={readinessStatus.isDeloadRecommended}
          onClose={() => setSubstituteOpen(false)}
          onSelectSubstitute={(newExId) => {
            replaceExerciseInActiveDay(currentExercise.id, newExId, {
              gender: activeGender,
              dayId: activeSessionDay?.id,
              fallbackDays: effectiveGenderDays,
            });
            setSelectedExerciseId(newExId);
          }}
          onSetRestriction={setExerciseRestriction}
        />
      )}

      {progressOpen && (
        <GymProgressHistoryModal
          open={progressOpen}
          mode="modal"
          gender={activeGender}
          workoutStreak={state.workoutStreak}
          userProfile={state.userProfile}
          exerciseLogs={state.exerciseLogs}
          workoutHistory={state.workoutHistory}
          bodyMetricsHistory={state.bodyMetricsHistory}
          celebrationSession={celebrationSession}
          onRecordTodayBodyMetrics={() =>
            saveUserProfile({ gender: activeGender }, true)
          }
          onClose={() => {
            setProgressOpen(false);
            setCelebrationSession(null);
          }}
        />
      )}

      <GymAiCoachDrawer
        open={aiCoachOpen}
        activeGender={activeGender}
        token={token}
        userProfile={state.userProfile}
        cycleTracking={state.cycleTracking}
        cycleStatus={readinessStatus}
        activeDay={activeSessionDay}
        currentExercise={currentExercise}
        workoutStreak={state.workoutStreak}
        customDays={effectiveGenderDays}
        exerciseLogs={state.exerciseLogs}
        workoutHistory={state.workoutHistory}
        chatHistory={state.aiChatHistory}
        onOpen={() => setAiCoachOpen(true)}
        onClose={() => setAiCoachOpen(false)}
        onAppendMessages={appendAiChatMessages}
        onClearHistory={clearAiChatHistory}
        onApplyPresetDays={(days) => saveCustomSplitDays(days, activeGender)}
        onOpenProfileModal={() => setCycleProfileOpen(true)}
      />
    </div>
  );
}
