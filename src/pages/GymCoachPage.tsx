import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/useAuthContext';
import FemaleCycleAndProfileModal from '../features/gym/components/FemaleCycleAndProfileModal';
import GymAiCoachDrawer from '../features/gym/components/GymAiCoachDrawer';
import GymExerciseSubstituteModal from '../features/gym/components/GymExerciseSubstituteModal';
import GymGenderAdvisorPanel from '../features/gym/components/GymGenderAdvisorPanel';
import SplitCustomizerModal from '../features/gym/components/SplitCustomizerModal';
import {
  GYM_EXERCISE_CATALOG,
  GYM_EXERCISE_MAP,
} from '../features/gym/data/defaultGymCatalog';
import { useGymCoachState } from '../features/gym/hooks/useGymCoachState';
import type { GymGenderMode } from '../features/gym/types/gym';
import { resolveCycleStatus } from '../features/gym/utils/gymCycleAndProgressionUtils';
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
    toggleExerciseDone,
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

  return (
    <div className="min-h-screen bg-[#111114] text-[#F7F7F7] py-3 sm:py-5 px-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <GymGenderAdvisorPanel
          activeGender={activeGender}
          selectedExerciseId={currentExercise.id}
          userProfile={state.userProfile}
          cycleTracking={state.cycleTracking}
          exerciseLogs={state.exerciseLogs}
          completedIdsToday={state.completedExerciseIdsToday}
          onSelectGenderRoute={handleSelectGenderRoute}
          onSaveProfile={saveUserProfile}
          onSaveCycle={saveCycleTracking}
          onApplyRecommendedSplit={(days) => {
            saveCustomSplitDays(days);
          }}
          onSelectExerciseFor3D={(exId) => {
            setSelectedExerciseId(exId);
          }}
          onToggleExerciseDone={toggleExerciseDone}
          onSaveExerciseLog={saveExerciseLog}
          onOpenSubstituteModal={() => setSubstituteOpen(true)}
          onOpenAiCoachDrawer={() => setAiCoachOpen(true)}
        />
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
