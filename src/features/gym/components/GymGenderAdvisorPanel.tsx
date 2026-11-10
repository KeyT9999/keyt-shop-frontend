import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cloud,
  Columns2,
  Droplets,
  Dumbbell,
  Flame,
  HeartPulse,
  ListChecks,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  Rotate3d,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  Utensils,
  Zap,
} from 'lucide-react';
import type { GymCloudSyncStatus } from '../hooks/useGymCoachState';
import type {
  GymCycleTrackingState,
  GymExerciseUserLog,
  GymExperienceLevel,
  GymFemaleBodyProfile,
  GymGenderMode,
  GymMaleGoal,
  GymManualPhaseOverride,
  GymPrimaryGoal,
  GymSetDetailItem,
  GymSplitDayConfig,
  GymSymptomCode,
} from '../types/gym';
import {
  computeSmartSetRecommendation,
  GYM_PRIMARY_GOAL_META,
  GYM_SYMPTOM_META,
  resolveGenderReadinessStatus,
} from '../utils/gymCycleAndProgressionUtils';
import {
  buildSessionsFromSavedSplitDays,
  generateGenderWorkoutAndNutritionPlan,
  GYM_MALE_GOAL_META,
  type GenderWorkoutAndNutritionRecommendation,
} from '../utils/gymGenderAdvisorUtils';
import ExerciseReferenceDualView from './ExerciseReferenceDualView';
import GymInlineMetricsTools from './GymInlineMetricsTools';
import GymMannequin3DViewer from './GymMannequin3DViewer';
import RealGymMachineView from './RealGymMachineView';

type StageVisualTab = '3d' | 'gym_photo' | 'photo' | 'split';

export interface CompleteSessionSummaryInput {
  dayId: string;
  dayTitle: string;
  nextDayId: string;
  durationMinutes: number;
  totalVolumeKg: number;
  completedExercisesCount: number;
  caloriesBurned: number;
  prHighlights: string[];
}

interface GymGenderAdvisorPanelProps {
  activeGender: GymGenderMode;
  selectedExerciseId?: string;
  savedGenderDays?: GymSplitDayConfig[];
  activeGenderDayId?: string;
  syncStatus?: GymCloudSyncStatus;
  workoutStreak?: number;
  userProfile: GymFemaleBodyProfile;
  cycleTracking: GymCycleTrackingState;
  exerciseLogs?: Record<string, GymExerciseUserLog>;
  completedIdsToday?: string[];
  onSelectGenderRoute: (gender: GymGenderMode) => void;
  onSelectGenderDay?: (dayId: string) => void;
  onSaveProfile: (patch: Partial<GymFemaleBodyProfile>) => void;
  onSaveCycle: (patch: Partial<GymCycleTrackingState>) => void;
  onApplyRecommendedSplit: (days: GymSplitDayConfig[]) => void;
  onSelectExerciseFor3D: (exerciseId: string) => void;
  onToggleExerciseDone?: (exerciseId: string) => void;
  onSaveExerciseLog?: (
    exerciseId: string,
    weightKg: number,
    repsNote: string,
    personalTip: string,
    extra?: {
      seatPinNote?: string;
      setsDetail?: GymSetDetailItem[];
      setsCompletedToday?: number[];
      autoMarkCompleted?: boolean;
    }
  ) => void;
  onAddWaterIntakeMl?: (deltaMl: number) => void;
  onCompleteSession?: (summary: CompleteSessionSummaryInput) => void;
  onOpenSubstituteModal?: () => void;
  onOpenCustomizerModal?: () => void;
  onOpenProgressModal?: () => void;
  onOpenAiCoachDrawer: () => void;
}

const FEMALE_PHASE_OPTIONS: {
  id: GymManualPhaseOverride;
  label: string;
}[] = [
  { id: 'auto', label: 'Tự động theo ngày' },
  { id: 'follicular', label: 'Nang Trứng (Sung sức)' },
  { id: 'ovulatory', label: 'Rụng Trứng (Đỉnh lực)' },
  { id: 'luteal', label: 'Hoàng Thể / PMS' },
  { id: 'menstrual', label: 'Kỳ Dâu (Giảm 20% tạ)' },
];

const MALE_ENERGY_OPTIONS: { level: 2 | 4 | 5; label: string }[] = [
  { level: 2, label: 'Hơi mỏi / Thiếu ngủ (-10% tạ)' },
  { level: 4, label: 'Phong độ chuẩn' },
  { level: 5, label: 'Đỉnh sung sức (Thử PR)' },
];

const EXPERIENCE_OPTIONS: { id: GymExperienceLevel; label: string }[] = [
  { id: 'beginner', label: 'Mới tập' },
  { id: 'intermediate', label: 'Trung cấp' },
  { id: 'advanced', label: 'Nâng cao' },
];

function extractShortFoodChips(menuOption: string): string[] {
  return menuOption
    .replace(/\([^)]*\)/g, '')
    .split('+')
    .map((part) => part.replace(/\.$/, '').trim())
    .filter(Boolean)
    .slice(0, 4);
}

export default function GymGenderAdvisorPanel({
  activeGender,
  selectedExerciseId,
  savedGenderDays,
  activeGenderDayId,
  syncStatus = 'local-only',
  workoutStreak = 0,
  userProfile,
  cycleTracking,
  exerciseLogs = {},
  completedIdsToday = [],
  onSelectGenderRoute,
  onSelectGenderDay,
  onSaveProfile,
  onSaveCycle,
  onApplyRecommendedSplit,
  onSelectExerciseFor3D,
  onToggleExerciseDone,
  onSaveExerciseLog,
  onAddWaterIntakeMl,
  onCompleteSession,
  onOpenSubstituteModal,
  onOpenCustomizerModal,
  onOpenProgressModal,
}: GymGenderAdvisorPanelProps) {
  const [draftProfile, setDraftProfile] = useState<GymFemaleBodyProfile>(() => ({
    ...userProfile,
    gender: activeGender,
    age: userProfile.age || 24,
    heightCm:
      userProfile.heightCm || (activeGender === 'male' ? 172 : 160),
    weightKg:
      userProfile.weightKg || (activeGender === 'male' ? 68 : 50),
    chestCm: userProfile.chestCm || 96,
    armCm: userProfile.armCm || 35,
    workoutsPerWeek: userProfile.workoutsPerWeek || 4,
    maleGoal: userProfile.maleGoal || 'chest_shoulder_3d',
    maleEnergyLevel: userProfile.maleEnergyLevel || 4,
    shoulderSafe: Boolean(userProfile.shoulderSafe),
  }));

  const [draftCycle, setDraftCycle] = useState<GymCycleTrackingState>(cycleTracking);
  const [isFormExpanded, setIsFormExpanded] = useState<boolean>(true);
  const [pickedSessionId, setPickedSessionId] = useState<string>('');
  const [activeExerciseIdx, setActiveExerciseIdx] = useState<number>(0);
  const [visualTab, setVisualTab] = useState<StageVisualTab>('3d');
  const [showStepsDetail, setShowStepsDetail] = useState<boolean>(false);
  const [localDoneIds, setLocalDoneIds] = useState<string[]>([]);
  const [localWaterMl, setLocalWaterMl] = useState<number>(
    userProfile.waterIntakeMlToday || 0
  );

  const recommendation: GenderWorkoutAndNutritionRecommendation = useMemo(
    () =>
      generateGenderWorkoutAndNutritionPlan({
        gender: activeGender,
        userProfile: draftProfile,
        cycleTracking: draftCycle,
      }),
    [activeGender, draftProfile, draftCycle]
  );

  // Single Source of Truth: hydrate persisted gender split days if user customized or swapped exercises
  const displayedSessions = useMemo(
    () =>
      buildSessionsFromSavedSplitDays({
        savedDays: savedGenderDays,
        fallbackSessions: recommendation.sessions,
        gender: activeGender,
        userProfile: draftProfile,
        cycleTracking: draftCycle,
      }),
    [savedGenderDays, recommendation.sessions, activeGender, draftProfile, draftCycle]
  );

  const targetSessionId = pickedSessionId || activeGenderDayId || '';
  const foundSessionIdx = targetSessionId
    ? displayedSessions.findIndex((s) => s.id === targetSessionId)
    : 0;
  const safeSessionIdx = foundSessionIdx >= 0 ? foundSessionIdx : 0;
  const currentSession =
    displayedSessions[safeSessionIdx] || displayedSessions[0];
  const sessionExercises = useMemo(
    () => currentSession?.exercises || [],
    [currentSession]
  );

  const propExerciseIdx = selectedExerciseId
    ? sessionExercises.findIndex((item) => item.exercise.id === selectedExerciseId)
    : -1;
  const rawExerciseIdx =
    propExerciseIdx >= 0 ? propExerciseIdx : activeExerciseIdx;
  const safeExerciseIdx =
    rawExerciseIdx < sessionExercises.length ? rawExerciseIdx : 0;
  const currentItem = sessionExercises[safeExerciseIdx] || sessionExercises[0];
  const currentExercise = currentItem?.exercise;

  const readinessStatus = useMemo(
    () =>
      resolveGenderReadinessStatus(
        activeGender,
        draftProfile,
        draftCycle,
        currentExercise
      ),
    [activeGender, draftProfile, draftCycle, currentExercise]
  );

  const setRecommendation = useMemo(
    () =>
      currentExercise
        ? computeSmartSetRecommendation(
            currentExercise,
            exerciseLogs[currentExercise.id],
            readinessStatus,
            activeGender
          )
        : null,
    [currentExercise, exerciseLogs, readinessStatus, activeGender]
  );

  const updateProfileLive = (patch: Partial<GymFemaleBodyProfile>) => {
    setDraftProfile((prev) => {
      const next = { ...prev, ...patch, gender: activeGender };
      onSaveProfile(next);
      return next;
    });
  };

  const updateCycleLive = (patch: Partial<GymCycleTrackingState>) => {
    setDraftCycle((prev) => {
      const next = { ...prev, ...patch };
      onSaveCycle(next);
      return next;
    });
  };

  const toggleSymptom = (code: GymSymptomCode) => {
    setDraftCycle((prev) => {
      const exists = prev.todaySymptoms.includes(code);
      const nextSymptoms = exists
        ? prev.todaySymptoms.filter((s) => s !== code)
        : [...prev.todaySymptoms, code];
      const next = { ...prev, todaySymptoms: nextSymptoms };
      onSaveCycle(next);
      return next;
    });
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...draftProfile,
      gender: activeGender,
    });
    onSaveCycle(draftCycle);
    onApplyRecommendedSplit(recommendation.recommendedSplitDays);
    const firstSession = recommendation.sessions[0];
    setPickedSessionId(firstSession?.id || '');
    setActiveExerciseIdx(0);
    if (firstSession) {
      onSelectGenderDay?.(firstSession.id);
      if (firstSession.exercises[0]) {
        onSelectExerciseFor3D(firstSession.exercises[0].exercise.id);
      }
    }
    setIsFormExpanded(false);
  };

  const isExerciseDone = (exId: string) =>
    completedIdsToday.includes(exId) || localDoneIds.includes(exId);

  const buildCurrentSessionSummary = (nextSessionId: string): CompleteSessionSummaryInput => {
    let totalVolumeKg = 0;
    const prHighlights: string[] = [];

    for (const item of sessionExercises) {
      const log = exerciseLogs[item.exercise.id];
      const w = log?.weightKg ?? item.suggestedWeightKg ?? 0;
      if (log?.setsDetail && log.setsDetail.some((s) => s.completed)) {
        for (const s of log.setsDetail) {
          if (s.completed) {
            totalVolumeKg += (s.weightKg || w) * (s.reps || 10);
          }
        }
      } else if (w > 0) {
        totalVolumeKg += w * 3 * 10;
      }

      if (log && log.weightKg > 0 && log.personalRecordKg && log.weightKg >= log.personalRecordKg) {
        prHighlights.push(`${item.exercise.vietnameseName}: ${log.weightKg}kg`);
      }
    }

    const weightFactor = Math.max(40, Math.min(130, draftProfile.weightKg || 55)) / 55;
    const durationMinutes = currentSession?.estimatedMinutes || sessionExercises.length * 7;
    const caloriesBurned = Math.round(sessionExercises.length * 42 * weightFactor);

    return {
      dayId: currentSession?.id || 'session_1',
      dayTitle: `${currentSession?.dayLabelVi || 'Buổi tập'}: ${currentSession?.titleVi || ''}`,
      nextDayId: nextSessionId,
      durationMinutes,
      totalVolumeKg: Math.round(totalVolumeKg),
      completedExercisesCount: sessionExercises.length,
      caloriesBurned,
      prHighlights: prHighlights.slice(0, 5),
    };
  };

  const handleCompleteAndNextExercise = () => {
    if (!currentExercise) return;
    if (!isExerciseDone(currentExercise.id)) {
      if (onToggleExerciseDone) {
        onToggleExerciseDone(currentExercise.id);
      } else {
        setLocalDoneIds((prev) => [...prev, currentExercise.id]);
      }
    }

    if (safeExerciseIdx + 1 < sessionExercises.length) {
      const nextIdx = safeExerciseIdx + 1;
      setActiveExerciseIdx(nextIdx);
      onSelectExerciseFor3D(sessionExercises[nextIdx].exercise.id);
    } else {
      const nextSIdx =
        safeSessionIdx + 1 < displayedSessions.length ? safeSessionIdx + 1 : 0;
      const nextSession = displayedSessions[nextSIdx] || displayedSessions[0];
      if (onCompleteSession && nextSession) {
        onCompleteSession(buildCurrentSessionSummary(nextSession.id));
      }
      setPickedSessionId(nextSession?.id || '');
      setActiveExerciseIdx(0);
      if (nextSession) {
        onSelectGenderDay?.(nextSession.id);
        const firstEx = nextSession.exercises[0]?.exercise;
        if (firstEx) onSelectExerciseFor3D(firstEx.id);
      }
    }
  };

  const handlePrevExercise = () => {
    if (safeExerciseIdx > 0) {
      const prevIdx = safeExerciseIdx - 1;
      setActiveExerciseIdx(prevIdx);
      onSelectExerciseFor3D(sessionExercises[prevIdx].exercise.id);
    }
  };

  const handleAdjustWater = (deltaMl: number) => {
    if (onAddWaterIntakeMl) {
      onAddWaterIntakeMl(deltaMl);
    }
    setLocalWaterMl((prev) => Math.max(0, Math.min(8000, prev + deltaMl)));
  };

  const displayedWaterMl = userProfile.waterIntakeMlToday ?? localWaterMl;
  const targetWaterMl = Math.round(recommendation.nutritionPlan.waterLiters * 1000);
  const waterPercent = Math.min(
    100,
    Math.round((displayedWaterMl / Math.max(1000, targetWaterMl)) * 100)
  );

  const isMale = activeGender === 'male';
  const accentBtnClass = isMale
    ? 'bg-[#5CE1E6] text-[#111114]'
    : 'bg-[#FF5C8A] text-[#111114]';
  const accentSoftText = isMale ? 'text-[#5CE1E6]' : 'text-[#FF85A9]';

  const effectiveVisualTab: StageVisualTab =
    visualTab === 'gym_photo' && !currentExercise?.realGymPhoto ? '3d' : visualTab;

  const syncLabelVi =
    syncStatus === 'synced'
      ? 'Đã đồng bộ Cloud'
      : syncStatus === 'syncing'
        ? 'Đang đồng bộ...'
        : 'Lưu trên máy';

  return (
    <section
      aria-label="Bộ định tuyến Nam Nữ và tư vấn bài tập ăn uống cá nhân hóa"
      className="rounded-3xl bg-[#16161C] border border-[#282834] p-3.5 sm:p-5 text-[#F7F7F7] shadow-2xl space-y-4"
    >
      {/* 1. COMPACT 2-ROUTER BAR (/gym/nam vs /gym/nu) + PROGRESS + SYNC */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#262632]">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center border shrink-0 ${
              isMale
                ? 'bg-[#5CE1E6]/15 border-[#5CE1E6]/40 text-[#5CE1E6]'
                : 'bg-[#FF5C8A]/15 border-[#FF5C8A]/40 text-[#FF5C8A]'
            }`}
          >
            {isMale ? <Dumbbell size={18} /> : <HeartPulse size={18} />}
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-[#F7F7F7] flex flex-wrap items-center gap-2">
              <span>{isMale ? 'GYM 3D NAM' : 'GYM 3D NỮ'}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isMale
                    ? 'bg-[#5CE1E6]/20 text-[#5CE1E6]'
                    : 'bg-[#FF5C8A]/20 text-[#FF5C8A]'
                }`}
              >
                {recommendation.goalLabelVi}
              </span>
            </h1>
            <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1">
                <Cloud
                  size={12}
                  className={
                    syncStatus === 'synced' ? 'text-[#A3F77B]' : 'text-zinc-400'
                  }
                />
                <span>{syncLabelVi}</span>
              </span>
              <span>•</span>
              <span className={accentSoftText}>{readinessStatus.phaseShortVi}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Chọn chế độ Gym Nam hoặc Gym Nữ"
            className="grid grid-cols-2 gap-1.5 bg-[#111114] p-1 rounded-2xl border border-[#2A2A36]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isMale}
              onClick={() => {
                onSelectGenderRoute('male');
                setIsFormExpanded(true);
              }}
              className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isMale
                  ? 'bg-[#5CE1E6] text-[#111114] shadow-md shadow-[#5CE1E6]/25'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              <Dumbbell size={14} />
              <span>GYM NAM (/gym/nam)</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={!isMale}
              onClick={() => {
                onSelectGenderRoute('female');
                setIsFormExpanded(true);
              }}
              className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isMale
                  ? 'bg-[#FF5C8A] text-[#111114] shadow-md shadow-[#FF5C8A]/25'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              <HeartPulse size={14} />
              <span>GYM NỮ (/gym/nu)</span>
            </button>
          </div>

          {onOpenProgressModal && (
            <button
              type="button"
              onClick={onOpenProgressModal}
              className="px-3 py-2 rounded-xl bg-[#111114] border border-[#2A2A36] hover:border-[#A3F77B] text-xs font-extrabold text-[#A3F77B] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trophy size={13} />
              <span>PR &amp; Tiến độ{workoutStreak > 0 ? ` (${workoutStreak})` : ''}</span>
            </button>
          )}

          {onOpenCustomizerModal && (
            <button
              type="button"
              onClick={onOpenCustomizerModal}
              className="px-3 py-2 rounded-xl bg-[#111114] border border-[#2A2A36] hover:border-zinc-400 text-xs font-extrabold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ListChecks size={13} />
              <span className="hidden sm:inline">Tùy chỉnh lịch</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFormExpanded((v) => !v)}
            className="px-3 py-2 rounded-xl bg-[#111114] border border-[#2A2A36] hover:border-zinc-500 text-xs font-extrabold text-zinc-200 flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal size={13} />
            <span>{isFormExpanded ? 'Thu gọn' : 'Đổi nhu cầu'}</span>
            {isFormExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* 2. CONCISE, GENDER-ACCURATE QUESTIONNAIRE FORM */}
      {isFormExpanded && (
        <form onSubmit={handleSubmitForm} className="space-y-3">
          {isMale ? (
            /* ================= MALE COMPACT FORM (/gym/nam) ================= */
            <div className="space-y-3 rounded-2xl bg-[#111114] border border-[#262632] p-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                <div>
                  <label
                    htmlFor="maleAge"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Tuổi
                  </label>
                  <input
                    id="maleAge"
                    type="number"
                    min={14}
                    max={80}
                    value={draftProfile.age ?? 24}
                    onChange={(e) =>
                      updateProfileLive({ age: Number(e.target.value) || 24 })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs font-bold text-[#F7F7F7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="maleHeight"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Chiều cao (cm)
                  </label>
                  <input
                    id="maleHeight"
                    type="number"
                    min={130}
                    max={220}
                    value={draftProfile.heightCm}
                    onChange={(e) =>
                      updateProfileLive({
                        heightCm: Number(e.target.value) || 172,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs font-bold text-[#F7F7F7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="maleWeight"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Cân nặng (kg)
                  </label>
                  <input
                    id="maleWeight"
                    type="number"
                    min={40}
                    max={160}
                    step="0.5"
                    value={draftProfile.weightKg}
                    onChange={(e) =>
                      updateProfileLive({
                        weightKg: Number(e.target.value) || 68,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs font-bold text-[#F7F7F7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="maleChest"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Vòng ngực (cm)
                  </label>
                  <input
                    id="maleChest"
                    type="number"
                    min={65}
                    max={150}
                    value={draftProfile.chestCm ?? 96}
                    onChange={(e) =>
                      updateProfileLive({
                        chestCm: Number(e.target.value) || 96,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs font-bold text-[#F7F7F7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="maleWaist"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Vòng bụng (cm)
                  </label>
                  <input
                    id="maleWaist"
                    type="number"
                    min={55}
                    max={140}
                    value={draftProfile.waistCm}
                    onChange={(e) =>
                      updateProfileLive({
                        waistCm: Number(e.target.value) || 78,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs font-bold text-[#F7F7F7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="maleArm"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Bắp tay (cm)
                  </label>
                  <input
                    id="maleArm"
                    type="number"
                    min={20}
                    max={60}
                    value={draftProfile.armCm ?? 35}
                    onChange={(e) =>
                      updateProfileLive({
                        armCm: Number(e.target.value) || 35,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs font-bold text-[#F7F7F7]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label
                    htmlFor="maleWorkoutsPerWeek"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Số buổi/tuần
                  </label>
                  <select
                    id="maleWorkoutsPerWeek"
                    value={draftProfile.workoutsPerWeek ?? 4}
                    onChange={(e) =>
                      updateProfileLive({
                        workoutsPerWeek: Number(e.target.value) || 4,
                      })
                    }
                    className="w-full px-2 py-1.5 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs font-bold text-[#F7F7F7] cursor-pointer"
                  >
                    <option value={3}>3 buổi</option>
                    <option value={4}>4 buổi</option>
                    <option value={5}>5 buổi</option>
                    <option value={6}>6 buổi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {(Object.keys(GYM_MALE_GOAL_META) as GymMaleGoal[]).map((goalKey) => {
                  const meta = GYM_MALE_GOAL_META[goalKey];
                  const selected = (draftProfile.maleGoal || 'chest_shoulder_3d') === goalKey;
                  return (
                    <button
                      key={goalKey}
                      type="button"
                      onClick={() => updateProfileLive({ maleGoal: goalKey })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                        selected
                          ? 'bg-[#5CE1E6]/15 border-[#5CE1E6] text-[#F7F7F7]'
                          : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      <span className="text-xs font-black">{meta.labelVi}</span>
                      {selected && <Check size={14} className="text-[#5CE1E6] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Male Readiness + Joint Guard Controls */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {MALE_ENERGY_OPTIONS.map((opt) => {
                  const selected = (draftProfile.maleEnergyLevel || 4) === opt.level;
                  return (
                    <button
                      key={opt.level}
                      type="button"
                      onClick={() => updateProfileLive({ maleEnergyLevel: opt.level })}
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-black cursor-pointer ${
                        selected
                          ? 'bg-[#5CE1E6]/20 border-[#5CE1E6] text-[#5CE1E6]'
                          : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    updateProfileLive({ shoulderSafe: !draftProfile.shoulderSafe })
                  }
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                    draftProfile.shoulderSafe
                      ? 'bg-[#A3F77B] text-[#111114] border-[#A3F77B]'
                      : 'bg-[#1B1B22] text-zinc-300 border-[#2E2E3A]'
                  }`}
                >
                  <ShieldCheck size={12} />
                  <span>Bảo vệ khớp vai trước</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateProfileLive({
                      protectLowerBackKnee: !draftProfile.protectLowerBackKnee,
                    })
                  }
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                    draftProfile.protectLowerBackKnee
                      ? 'bg-[#A3F77B] text-[#111114] border-[#A3F77B]'
                      : 'bg-[#1B1B22] text-zinc-300 border-[#2E2E3A]'
                  }`}
                >
                  <ShieldCheck size={12} />
                  <span>Bảo vệ lưng dưới &amp; gối</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  {EXPERIENCE_OPTIONS.map((exp) => {
                    const active = draftProfile.experienceLevel === exp.id;
                    return (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() =>
                          updateProfileLive({ experienceLevel: exp.id })
                        }
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-extrabold cursor-pointer ${
                          active
                            ? 'bg-[#5CE1E6] text-[#111114] border-[#5CE1E6]'
                            : 'bg-[#1B1B22] text-zinc-300 border-[#2E2E3A]'
                        }`}
                      >
                        {exp.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-linear-to-r from-[#5CE1E6] to-[#A3F77B] text-[#111114] font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Sparkles size={15} />
                  <span>PHÂN TÍCH NAM GIỚI &amp; ĐỀ XUẤT BÀI TẬP + ĂN UỐNG NGAY</span>
                </button>
              </div>
            </div>
          ) : (
            /* ================= FEMALE COMPACT FORM (/gym/nu) ================= */
            <div className="space-y-3 rounded-2xl bg-[#111114] border border-[#262632] p-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                <div>
                  <label
                    htmlFor="femaleAge"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Tuổi
                  </label>
                  <input
                    id="femaleAge"
                    type="number"
                    min={14}
                    max={80}
                    value={draftProfile.age ?? 24}
                    onChange={(e) =>
                      updateProfileLive({ age: Number(e.target.value) || 24 })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs font-bold text-[#F7F7F7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="femaleHeight"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Chiều cao (cm)
                  </label>
                  <input
                    id="femaleHeight"
                    type="number"
                    min={120}
                    max={200}
                    value={draftProfile.heightCm}
                    onChange={(e) =>
                      updateProfileLive({
                        heightCm: Number(e.target.value) || 160,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs font-bold text-[#F7F7F7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="femaleWeight"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Cân nặng (kg)
                  </label>
                  <input
                    id="femaleWeight"
                    type="number"
                    min={35}
                    max={130}
                    step="0.5"
                    value={draftProfile.weightKg}
                    onChange={(e) =>
                      updateProfileLive({
                        weightKg: Number(e.target.value) || 50,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs font-bold text-[#F7F7F7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="femaleWaist"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Vòng eo V2 (cm)
                  </label>
                  <input
                    id="femaleWaist"
                    type="number"
                    min={45}
                    max={120}
                    value={draftProfile.waistCm}
                    onChange={(e) =>
                      updateProfileLive({
                        waistCm: Number(e.target.value) || 63,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs font-bold text-[#F7F7F7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="femaleHip"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Vòng mông V3 (cm)
                  </label>
                  <input
                    id="femaleHip"
                    type="number"
                    min={65}
                    max={140}
                    value={draftProfile.hipCm}
                    onChange={(e) =>
                      updateProfileLive({
                        hipCm: Number(e.target.value) || 92,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs font-bold text-[#F7F7F7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="femaleWorkoutsPerWeek"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Số buổi/tuần
                  </label>
                  <select
                    id="femaleWorkoutsPerWeek"
                    value={draftProfile.workoutsPerWeek ?? 4}
                    onChange={(e) =>
                      updateProfileLive({
                        workoutsPerWeek: Number(e.target.value) || 4,
                      })
                    }
                    className="w-full px-2 py-1.5 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs font-bold text-[#F7F7F7] cursor-pointer"
                  >
                    <option value={3}>3 buổi</option>
                    <option value={4}>4 buổi</option>
                    <option value={5}>5 buổi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {(Object.keys(GYM_PRIMARY_GOAL_META) as GymPrimaryGoal[]).map(
                  (goalKey) => {
                    const meta = GYM_PRIMARY_GOAL_META[goalKey];
                    const selected = draftProfile.primaryGoal === goalKey;
                    return (
                      <button
                        key={goalKey}
                        type="button"
                        onClick={() => updateProfileLive({ primaryGoal: goalKey })}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                          selected
                            ? 'bg-[#FF5C8A]/15 border-[#FF5C8A] text-[#F7F7F7]'
                            : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        <span className="text-xs font-black">{meta.labelVi}</span>
                        {selected && (
                          <Check size={14} className="text-[#FF5C8A] shrink-0" />
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Auto Cycle Date Picker + Phase Pills + Female Biomechanics Toggles */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <label
                  htmlFor="femaleLastPeriod"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-[11px] font-bold text-zinc-300"
                >
                  <Calendar size={12} className="text-[#FF5C8A]" />
                  <span>Ngày đầu kỳ:</span>
                  <input
                    id="femaleLastPeriod"
                    type="date"
                    value={draftCycle.lastPeriodStartDate || ''}
                    onChange={(e) =>
                      updateCycleLive({
                        lastPeriodStartDate: e.target.value,
                        manualPhaseOverride: 'auto',
                      })
                    }
                    className="bg-transparent text-[#F7F7F7] font-extrabold focus:outline-none cursor-pointer"
                  />
                </label>

                {FEMALE_PHASE_OPTIONS.map((p) => {
                  const selected = draftCycle.manualPhaseOverride === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        updateCycleLive({ manualPhaseOverride: p.id })
                      }
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-black cursor-pointer ${
                        selected
                          ? 'bg-[#FF5C8A] text-[#111114] border-[#FF5C8A]'
                          : 'bg-[#1B1B22] text-zinc-300 border-[#2E2E3A]'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(Object.keys(GYM_SYMPTOM_META) as GymSymptomCode[]).map(
                  (code) => {
                    const active = draftCycle.todaySymptoms.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleSymptom(code)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border cursor-pointer ${
                          active
                            ? 'bg-[#A3F77B] text-[#111114] border-[#A3F77B]'
                            : 'bg-[#1B1B22] text-zinc-400 border-[#2E2E3A]'
                        }`}
                      >
                        {GYM_SYMPTOM_META[code].labelVi}
                      </button>
                    );
                  }
                )}

                <button
                  type="button"
                  onClick={() =>
                    updateProfileLive({
                      avoidHeavyQuads: !draftProfile.avoidHeavyQuads,
                    })
                  }
                  className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                    draftProfile.avoidHeavyQuads
                      ? 'bg-[#FF5C8A]/20 border-[#FF5C8A] text-[#FF85A9]'
                      : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-400'
                  }`}
                >
                  <ShieldCheck size={12} />
                  <span>Hạn chế to đùi trước</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateProfileLive({
                      protectLowerBackKnee: !draftProfile.protectLowerBackKnee,
                    })
                  }
                  className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                    draftProfile.protectLowerBackKnee
                      ? 'bg-[#FF5C8A]/20 border-[#FF5C8A] text-[#FF85A9]'
                      : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-400'
                  }`}
                >
                  <ShieldCheck size={12} />
                  <span>Bảo vệ lưng &amp; gối</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {EXPERIENCE_OPTIONS.map((exp) => {
                    const active = draftProfile.experienceLevel === exp.id;
                    return (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() =>
                          updateProfileLive({ experienceLevel: exp.id })
                        }
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-extrabold cursor-pointer ${
                          active
                            ? 'bg-[#FF5C8A] text-[#111114] border-[#FF5C8A]'
                            : 'bg-[#1B1B22] text-zinc-300 border-[#2E2E3A]'
                        }`}
                      >
                        {exp.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-linear-to-r from-[#FF5C8A] to-[#FF85A9] text-[#111114] font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Sparkles size={15} />
                  <span>PHÂN TÍCH NỮ GIỚI &amp; ĐỀ XUẤT BÀI TẬP + ĂN UỐNG NGAY</span>
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* 3. SINGLE DETAILED 3D MODEL STAGE (STEP-BY-STEP: TẬP XONG -> NEXT BÀI KHÁC) */}
      <div
        aria-label="Kết quả đề xuất bài tập và chế độ ăn uống cá nhân hóa"
        className="space-y-4 pt-2 border-t border-[#262632]"
      >
        <div className="space-y-3">
          {/* Header + Session Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Rotate3d
                size={16}
                className={isMale ? 'text-[#5CE1E6]' : 'text-[#FF5C8A]'}
              />
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#F7F7F7]">
                1. Đề Xuất Bài Tập Trọng Tâm Cho Bạn ({displayedSessions.length} Buổi/Tuần)
              </h2>
            </div>

            {/* Session Selector Pills (Buổi 1, Buổi 2, Buổi 3, Buổi 4...) */}
            <div
              role="tablist"
              aria-label="Chọn buổi tập trong tuần"
              className="flex flex-wrap items-center gap-1.5"
            >
              {displayedSessions.map((session, sIdx) => {
                const isCurrentSession = safeSessionIdx === sIdx;
                return (
                  <button
                    key={session.id}
                    type="button"
                    role="tab"
                    aria-selected={isCurrentSession}
                    onClick={() => {
                      setPickedSessionId(session.id);
                      setActiveExerciseIdx(0);
                      onSelectGenderDay?.(session.id);
                      if (session.exercises[0]) {
                        onSelectExerciseFor3D(session.exercises[0].exercise.id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      isCurrentSession
                        ? isMale
                          ? 'bg-[#5CE1E6] text-[#111114] border-[#5CE1E6]'
                          : 'bg-[#FF5C8A] text-[#111114] border-[#FF5C8A]'
                        : 'bg-[#111114] border-[#272733] text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    {session.dayLabelVi} ({session.exercises.length} bài)
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step-by-Step Exercise Navigation Bar + Single Detailed 3D Viewer */}
          {currentExercise && currentItem && (
            <div className="rounded-3xl bg-[#111114] border border-[#272733] overflow-hidden shadow-xl">
              {/* Top Stepper Bar: Exercise Dots + Prev + "Tập Xong • Qua Bài Tiếp (Next)" */}
              <div className="px-3.5 sm:px-5 py-3 bg-[#15151D] border-b border-[#262632] flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 ${accentBtnClass}`}
                  >
                    Bài {safeExerciseIdx + 1}/{sessionExercises.length}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-black text-[#F7F7F7] truncate flex items-center gap-2">
                      <span>{currentExercise.vietnameseName}</span>
                      {isExerciseDone(currentExercise.id) && (
                        <CheckCircle2 size={16} className="text-[#A3F77B] shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] font-bold text-zinc-400 truncate">
                      {currentSession?.dayLabelVi}: {currentSession?.titleVi} •{' '}
                      <span className="text-[#A3F77B]">
                        {currentItem.suggestedWeightKg > 0
                          ? `Gợi ý ${currentItem.suggestedWeightKg}kg`
                          : 'Trọng lượng cơ thể'}
                      </span>{' '}
                      • <span className={accentSoftText}>{currentItem.suggestedSetsReps}</span>
                    </div>
                  </div>
                </div>

                {/* Step Dots + Prev / Next Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="hidden sm:flex items-center gap-1 mr-1">
                    {sessionExercises.map((exItem, idx) => {
                      const active = idx === safeExerciseIdx;
                      const done = isExerciseDone(exItem.exercise.id);
                      return (
                        <button
                          key={exItem.exercise.id}
                          type="button"
                          onClick={() => {
                            setActiveExerciseIdx(idx);
                            onSelectExerciseFor3D(exItem.exercise.id);
                          }}
                          title={`Bài ${idx + 1}: ${exItem.exercise.vietnameseName}`}
                          className={`w-7 h-7 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center border ${
                            active
                              ? isMale
                                ? 'bg-[#5CE1E6] text-[#111114] border-[#5CE1E6]'
                                : 'bg-[#FF5C8A] text-[#111114] border-[#FF5C8A]'
                              : done
                                ? 'bg-[#A3F77B]/20 text-[#A3F77B] border-[#A3F77B]/50'
                                : 'bg-[#1D1D27] text-zinc-400 border-[#2D2D3B] hover:text-white'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={safeExerciseIdx === 0}
                    onClick={handlePrevExercise}
                    className="px-3 py-2 rounded-xl bg-[#1E1E28] hover:bg-[#282836] disabled:opacity-40 border border-[#2E2E3D] text-xs font-extrabold text-zinc-200 flex items-center gap-1 cursor-pointer disabled:cursor-default"
                  >
                    <ArrowLeft size={14} />
                    <span>Bài trước</span>
                  </button>

                  {onOpenSubstituteModal && (
                    <button
                      type="button"
                      onClick={onOpenSubstituteModal}
                      className="px-3 py-2 rounded-xl bg-[#1E1E28] hover:bg-[#282836] border border-[#2E2E3D] text-xs font-extrabold text-zinc-200 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Đổi bài</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCompleteAndNextExercise}
                    className="px-4 py-2 rounded-xl bg-[#A3F77B] hover:brightness-105 text-[#111114] font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-[#A3F77B]/20 transition active:scale-98 cursor-pointer"
                  >
                    <Check size={15} />
                    <span>
                      {safeExerciseIdx + 1 < sessionExercises.length
                        ? `Tập Xong • Qua Bài ${safeExerciseIdx + 2} (Next)`
                        : 'Hoàn Thành Buổi • Qua Buổi Tiếp'}
                    </span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* View Mode Switcher Bar (Gender-Adaptive Theme) */}
              <div className="px-4 py-2 bg-[#111114] border-b border-[#22222C] flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-zinc-400 truncate">
                  Thiết bị: <strong className="text-zinc-200">{currentExercise.machineName}</strong>
                </span>

                <div className="inline-flex items-center gap-0.5 bg-[#1B1B22] border border-[#2E2E3A] p-1 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setVisualTab('3d')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer ${
                      effectiveVisualTab === '3d'
                        ? accentBtnClass
                        : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Rotate3d size={13} />
                    <span>3D Chi Tiết</span>
                  </button>

                  {currentExercise.realGymPhoto && (
                    <button
                      type="button"
                      onClick={() => setVisualTab('gym_photo')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer ${
                        effectiveVisualTab === 'gym_photo'
                          ? accentBtnClass
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer ${
                      effectiveVisualTab === 'photo'
                        ? accentBtnClass
                        : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Camera size={13} />
                    <span>2 Ảnh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisualTab('split')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer ${
                      effectiveVisualTab === 'split'
                        ? accentBtnClass
                        : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Columns2 size={13} />
                    <span>Đôi 3D</span>
                  </button>
                </div>
              </div>

              {/* Single Detailed 3D Canvas + Visual Reference + Dark Readiness Card */}
              <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
                <div className="lg:col-span-7">
                  {effectiveVisualTab === '3d' && (
                    <GymMannequin3DViewer
                      exercise={currentExercise}
                      gender={activeGender}
                      tall
                    />
                  )}
                  {effectiveVisualTab === 'gym_photo' && currentExercise.realGymPhoto && (
                    <RealGymMachineView exercise={currentExercise} />
                  )}
                  {effectiveVisualTab === 'photo' && (
                    <ExerciseReferenceDualView exercise={currentExercise} />
                  )}
                  {effectiveVisualTab === 'split' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <GymMannequin3DViewer
                        exercise={currentExercise}
                        gender={activeGender}
                      />
                      {currentExercise.realGymPhoto ? (
                        <RealGymMachineView exercise={currentExercise} />
                      ) : (
                        <ExerciseReferenceDualView exercise={currentExercise} />
                      )}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                  <div className="flex-1">
                    {currentExercise.realGymPhoto && effectiveVisualTab === '3d' ? (
                      <RealGymMachineView exercise={currentExercise} />
                    ) : (
                      <ExerciseReferenceDualView exercise={currentExercise} />
                    )}
                  </div>

                  {/* Dark Neon Biomechanics & Readiness Advice Card (Replaces duplicate white timer) */}
                  <div className="rounded-2xl bg-[#16161E] border border-[#282836] p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-black flex items-center gap-1.5 ${accentSoftText}`}>
                        {readinessStatus.isHighSpinalLoadWarning ? (
                          <ShieldAlert size={14} className="text-amber-400" />
                        ) : (
                          <ShieldCheck size={14} className="text-[#A3F77B]" />
                        )}
                        <span>{readinessStatus.phaseTitleVi}</span>
                      </span>
                      {!isMale && readinessStatus.dayOfCycle > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-[#22222E] text-[10px] font-bold text-zinc-300">
                          Ngày {readinessStatus.dayOfCycle} chu kỳ
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      {readinessStatus.coachingBannerVi}
                    </p>
                    {currentExercise.mistakes && (
                      <p className="text-[11px] text-zinc-400">
                        <strong className="text-zinc-200">Tránh lỗi sai:</strong>{' '}
                        {currentExercise.mistakes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Unified Set-by-Set Cockpit, Timestamp Rest Timer, Plate Calculator & Weight Stepper */}
              {setRecommendation && (
                <GymInlineMetricsTools
                  key={`${activeGender}_${currentExercise.id}`}
                  exercise={currentExercise}
                  gender={activeGender}
                  savedLog={exerciseLogs[currentExercise.id]}
                  recommendation={setRecommendation}
                  onSaveLog={(w, r, tip, extra) =>
                    onSaveExerciseLog?.(currentExercise.id, w, r, tip, extra)
                  }
                />
              )}

              {/* Optional Collapsible 4 Steps */}
              <div className="px-4 py-2.5 bg-[#15151D] border-t border-[#262632]">
                <button
                  type="button"
                  onClick={() => setShowStepsDetail((v) => !v)}
                  className="w-full flex items-center justify-between text-xs font-extrabold text-zinc-400 hover:text-white cursor-pointer"
                >
                  <span className="text-left">
                    Mẹo chỉnh máy: {currentExercise.machineSetupTip}
                  </span>
                  <span className={`inline-flex items-center gap-1 shrink-0 ml-2 ${accentSoftText}`}>
                    <span>{showStepsDetail ? 'Ẩn bước tập' : 'Xem 4 bước ngắn'}</span>
                    {showStepsDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </span>
                </button>

                {showStepsDetail && (
                  <ol className="mt-2.5 pt-2.5 border-t border-[#262632] grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentExercise.steps.map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-zinc-300 bg-[#111114] p-2.5 rounded-xl border border-[#252530]"
                      >
                        <span
                          className={`w-4 h-4 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 ${accentBtnClass}`}
                        >
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </div>

        {/* PART B: VISUAL NUTRITION, INTERACTIVE WATER TRACKER & 4 MEAL CHIPS */}
        <div className="space-y-2.5 pt-2 border-t border-[#262632]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Utensils size={16} className="text-[#A3F77B]" />
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#F7F7F7]">
                2. Đề Xuất Chế Độ Ăn Uống &amp; Thực Đơn 4 Bữa Trong Ngày
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#A3F77B]/15 text-[#A3F77B] text-[11px] font-black">
              {recommendation.nutritionPlan.calorieBadgeVi}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="rounded-2xl bg-[#111114] border border-[#272733] px-3 py-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                <Flame size={13} className={isMale ? 'text-[#5CE1E6]' : 'text-[#FF5C8A]'} /> Calo
              </span>
              <span className="text-sm sm:text-base font-black text-[#F7F7F7]">
                {recommendation.nutritionPlan.targetCaloriesKcal} kcal
              </span>
            </div>

            <div className="rounded-2xl bg-[#111114] border border-[#272733] px-3 py-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                <Zap size={13} className="text-[#A3F77B]" /> Đạm
              </span>
              <span className="text-sm sm:text-base font-black text-[#A3F77B]">
                {recommendation.nutritionPlan.proteinGrams}g
              </span>
            </div>

            <div className="rounded-2xl bg-[#111114] border border-[#272733] px-3 py-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                <Activity size={13} className="text-[#5CE1E6]" /> Tinh bột
              </span>
              <span className="text-sm sm:text-base font-black text-[#5CE1E6]">
                {recommendation.nutritionPlan.carbsGrams}g
              </span>
            </div>

            <div className="rounded-2xl bg-[#111114] border border-[#272733] px-3 py-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                <ShieldCheck size={13} className="text-[#FF85A9]" /> Chất béo
              </span>
              <span className="text-sm sm:text-base font-black text-[#FF85A9]">
                {recommendation.nutritionPlan.fatGrams}g
              </span>
            </div>

            {/* Interactive Water Intake Tracker */}
            <div className="col-span-2 sm:col-span-1 rounded-2xl bg-[#111114] border border-[#272733] px-3 py-2 space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                  <Droplets size={13} className="text-[#5CE1E6]" /> Nước
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleAdjustWater(-250)}
                    aria-label="Giảm 250ml nước"
                    className="w-6 h-6 rounded-lg bg-[#1B1B24] hover:bg-[#262634] border border-[#2E2E3C] text-zinc-300 flex items-center justify-center cursor-pointer"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="text-xs font-black text-[#F7F7F7]">
                    {(displayedWaterMl / 1000).toFixed(2)}/{recommendation.nutritionPlan.waterLiters}L
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdjustWater(250)}
                    aria-label="Thêm 250ml nước"
                    className="w-6 h-6 rounded-lg bg-[#5CE1E6]/20 hover:bg-[#5CE1E6]/35 border border-[#5CE1E6]/40 text-[#5CE1E6] flex items-center justify-center cursor-pointer"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#1E1E28] overflow-hidden">
                <div
                  className="h-full bg-[#5CE1E6] transition-all duration-200"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {recommendation.nutritionPlan.meals.map((meal) => {
              const chips = extractShortFoodChips(meal.menuOptionsVi[0] || '');
              return (
                <div
                  key={meal.id}
                  className="rounded-2xl bg-[#111114] border border-[#272733] p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-[#F7F7F7] truncate">
                      {meal.mealTitleVi.split('(')[0].trim()}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#1F1F2B] text-[#A3F77B] text-[11px] font-black shrink-0">
                      {meal.approxKcal} kcal
                    </span>
                  </div>

                  <div className="text-[10px] font-bold text-zinc-400">
                    {meal.timingVi} • {meal.macroTagVi.split('•')[0].trim()}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {chips.map((chip, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-lg bg-[#1B1B24] border border-[#2B2B38] text-[11px] font-bold text-zinc-200"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
