import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Cloud,
  Dumbbell,
  Flame,
  HeartPulse,
  ListChecks,
  MapPin,
  MessageCircle,
  Play,
  RefreshCw,
  Rotate3d,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Trophy,
  Utensils,
} from 'lucide-react';
import type { GymCloudSyncStatus } from '../hooks/useGymCoachState';
import type {
  GymBodyMetricEntry,
  GymCycleTrackingState,
  GymExerciseDefinition,
  GymExerciseUserLog,
  GymFemaleBodyProfile,
  GymGenderMode,
  GymSetDetailItem,
  GymSplitDayConfig,
  GymSymptomCode,
  GymWorkoutHistoryEntry,
} from '../types/gym';
import {
  computeSmartSetRecommendation,
  resolveGenderReadinessStatus,
} from '../utils/gymCycleAndProgressionUtils';
import {
  buildSessionsFromSavedSplitDays,
  generateGenderWorkoutAndNutritionPlan,
  type GenderWorkoutAndNutritionRecommendation,
} from '../utils/gymGenderAdvisorUtils';
import ExerciseReferenceDualView from './ExerciseReferenceDualView';
import GymInlineMetricsTools from './GymInlineMetricsTools';
import GymMannequin3DViewer from './GymMannequin3DViewer';
import GymNutritionTabView from './GymNutritionTabView';
import GymProfileSetupTabView from './GymProfileSetupTabView';
import GymProgressHistoryModal from './GymProgressHistoryModal';
import RealGymMachineView from './RealGymMachineView';

export type GymMainAppTab = 'workout' | 'nutrition' | 'progress' | 'profile';
type StageVisualTab = 'gym_photo' | 'dual_photo' | '3d';

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
  workoutHistory?: GymWorkoutHistoryEntry[];
  bodyMetricsHistory?: GymBodyMetricEntry[];
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
  onRecordTodayBodyMetrics?: () => void;
  onCompleteSession?: (summary: CompleteSessionSummaryInput) => void;
  onOpenSubstituteModal?: () => void;
  onOpenCustomizerModal?: () => void;
  onOpenProgressModal?: () => void;
  onOpenAiCoachDrawer: () => void;
}

function ExerciseThumb({ exercise }: { exercise: GymExerciseDefinition }) {
  const [imgFailed, setImgFailed] = useState<boolean>(false);
  const src = exercise.realGymPhoto || exercise.referenceImages[0];

  if (!src || imgFailed) {
    return (
      <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
        <Dumbbell size={20} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={exercise.vietnameseName}
      loading="lazy"
      onError={() => setImgFailed(true)}
      className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
    />
  );
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
  workoutHistory = [],
  bodyMetricsHistory = [],
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
  onRecordTodayBodyMetrics,
  onCompleteSession,
  onOpenSubstituteModal,
  onOpenCustomizerModal,
  onOpenAiCoachDrawer,
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
  const [activeMainTab, setActiveMainTab] = useState<GymMainAppTab>('workout');
  const [mobileWorkoutMode, setMobileWorkoutMode] = useState<'list' | 'player'>('list');
  const [pickedSessionId, setPickedSessionId] = useState<string>('');
  const [activeExerciseIdx, setActiveExerciseIdx] = useState<number>(0);
  const [visualTab, setVisualTab] = useState<StageVisualTab>('gym_photo');
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
    setActiveMainTab('workout');
  };

  const isExerciseDone = (exId: string) =>
    completedIdsToday.includes(exId) || localDoneIds.includes(exId);

  const completedInSessionCount = sessionExercises.filter((item) =>
    isExerciseDone(item.exercise.id)
  ).length;
  const sessionProgressPct =
    sessionExercises.length > 0
      ? Math.round((completedInSessionCount / sessionExercises.length) * 100)
      : 0;

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
      setMobileWorkoutMode('list');
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
  const isMale = activeGender === 'male';

  const effectiveVisualTab: StageVisualTab =
    visualTab === 'gym_photo' && !currentExercise?.realGymPhoto
      ? 'dual_photo'
      : visualTab;

  const syncLabelVi =
    syncStatus === 'synced'
      ? 'Đã đồng bộ'
      : syncStatus === 'syncing'
        ? 'Đang lưu...'
        : 'Lưu trên máy';

  const navItems: Array<{
    id: GymMainAppTab;
    label: string;
    mobileLabel: string;
    icon: typeof Dumbbell;
  }> = [
    {
      id: 'workout',
      label: 'Tập Hôm Nay',
      mobileLabel: 'Tập luyện',
      icon: Dumbbell,
    },
    {
      id: 'nutrition',
      label: 'Thực Đơn',
      mobileLabel: 'Thực đơn',
      icon: Utensils,
    },
    {
      id: 'progress',
      label: 'Tiến Độ',
      mobileLabel: 'Tiến độ',
      icon: Trophy,
    },
    {
      id: 'profile',
      label: 'Hồ Sơ & Mục Tiêu',
      mobileLabel: 'Hồ sơ',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <section
      aria-label="Ứng dụng Huấn luyện Gym cá nhân hóa KeyT"
      className="space-y-4"
    >
      {/* 1. CLEAN LIGHT SPORT TOP APP HEADER */}
      <header className="rounded-3xl bg-white border border-slate-200/90 px-4 py-3.5 sm:px-5 sm:py-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#F05A28] text-white flex items-center justify-center shadow-xs shrink-0">
            {isMale ? <Dumbbell size={20} /> : <HeartPulse size={20} />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {isMale ? 'KeyT Gym Nam' : 'KeyT Gym Nữ'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#F05A28] text-[11px] font-bold truncate max-w-48 sm:max-w-none">
                {recommendation.goalLabelVi}
              </span>
            </div>

            <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1">
                <Cloud
                  size={12}
                  className={
                    syncStatus === 'synced' ? 'text-emerald-600' : 'text-slate-400'
                  }
                />
                <span>{syncLabelVi}</span>
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveMainTab('profile')}
                className="text-slate-700 hover:text-[#F05A28] font-semibold underline-offset-2 hover:underline cursor-pointer"
              >
                {readinessStatus.phaseShortVi}
              </button>
              {workoutStreak > 0 && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#F05A28]">
                    <Flame size={12} />
                    <span>{workoutStreak} buổi</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls: Clean Gender Switch + AI Coach Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div
            role="tablist"
            aria-label="Chọn chế độ Gym Nam hoặc Gym Nữ"
            className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isMale}
              onClick={() => onSelectGenderRoute('male')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isMale
                  ? 'bg-[#1E293B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Dumbbell size={14} />
              <span>Gym Nam</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={!isMale}
              onClick={() => onSelectGenderRoute('female')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isMale
                  ? 'bg-[#F05A28] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartPulse size={14} />
              <span>Gym Nữ</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenAiCoachDrawer}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <MessageCircle size={15} className="text-[#F05A28]" />
            <span>Hỏi AI</span>
          </button>
        </div>
      </header>

      {/* 2. DESKTOP SEGMENTED NAVIGATION BAR (Hidden on Mobile, replaced by Fixed Bottom Bar) */}
      <nav
        aria-label="Điều hướng khu vực tập luyện"
        className="hidden md:flex items-center justify-between gap-3 rounded-2xl bg-white border border-slate-200/90 p-1.5 shadow-2xs"
      >
        <div className="flex items-center gap-1">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMainTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#F05A28] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {onOpenCustomizerModal && (
          <button
            type="button"
            onClick={onOpenCustomizerModal}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer mr-1"
          >
            <ListChecks size={15} />
            <span>Tùy chỉnh lịch</span>
          </button>
        )}
      </nav>

      {/* 3. ACTIVE TAB CONTENT */}
      {activeMainTab === 'workout' && (
        <div className="space-y-4">
          {/* Horizontal Scrollable Session Selector Pills */}
          <div className="flex items-center justify-between gap-2">
            <div
              role="tablist"
              aria-label="Chọn buổi tập trong tuần"
              className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full"
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
                    className={`px-3.5 py-2 rounded-2xl border text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isCurrentSession
                        ? 'bg-[#1E293B] text-white border-[#1E293B] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {session.dayLabelVi} ({session.exercises.length} bài)
                  </button>
                );
              })}
            </div>

            {onOpenCustomizerModal && (
              <button
                type="button"
                onClick={onOpenCustomizerModal}
                aria-label="Tùy chỉnh lịch tập"
                className="md:hidden px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <ListChecks size={14} />
                <span>Sửa lịch</span>
              </button>
            )}
          </div>

          {/* Responsive Master-Detail Grid: Left = Session Overview List, Right = Focus Workout Player */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* LEFT COLUMN: SESSION OVERVIEW & CLEAN PHOTO THUMBNAIL EXERCISE LIST */}
            <div
              className={`lg:col-span-5 space-y-3 ${
                mobileWorkoutMode === 'player' ? 'hidden lg:block' : 'block'
              }`}
            >
              {/* Today's Session Hero Card */}
              {currentSession && (
                <div className="rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-[#F05A28]">
                        {currentSession.dayLabelVi} • {currentSession.focusTagVi}
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5 leading-snug">
                        {currentSession.titleVi}
                      </h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1 shrink-0">
                      <Clock size={12} />
                      <span>~{currentSession.estimatedMinutes}p</span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">
                        Tiến độ buổi tập hôm nay
                      </span>
                      <span className="text-slate-900 tabular-nums">
                        {completedInSessionCount}/{sessionExercises.length} bài ({sessionProgressPct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-200"
                        style={{ width: `${sessionProgressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Mobile Primary CTA to Enter Focus Workout Player */}
                  <button
                    type="button"
                    onClick={() => setMobileWorkoutMode('player')}
                    className="lg:hidden w-full py-3 px-4 rounded-2xl bg-[#F05A28] hover:bg-[#d94d1f] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Play size={16} fill="currentColor" />
                    <span>
                      {completedInSessionCount > 0
                        ? `Tiếp tục tập (Bài ${safeExerciseIdx + 1}/${sessionExercises.length})`
                        : 'Bắt đầu buổi tập ngay'}
                    </span>
                  </button>
                </div>
              )}

              {/* Clean Exercise List with Real Thumbnails (Zero 3D Toy Clutter!) */}
              <div className="space-y-2">
                {sessionExercises.map((exItem, idx) => {
                  const isSelected = idx === safeExerciseIdx;
                  const done = isExerciseDone(exItem.exercise.id);
                  const savedW = exerciseLogs[exItem.exercise.id]?.weightKg;
                  const displayW = savedW ?? exItem.suggestedWeightKg;

                  return (
                    <button
                      key={exItem.exercise.id}
                      type="button"
                      onClick={() => {
                        setActiveExerciseIdx(idx);
                        onSelectExerciseFor3D(exItem.exercise.id);
                        setMobileWorkoutMode('player');
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-white border-[#F05A28] ring-2 ring-[#F05A28]/15 shadow-xs'
                          : done
                            ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <ExerciseThumb exercise={exItem.exercise} />

                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                          {idx + 1}. {exItem.exercise.vietnameseName}
                        </div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">
                          {exItem.exercise.machineName}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                            {exItem.suggestedSetsReps}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[#F05A28] text-[11px] font-extrabold tabular-nums">
                            {displayW > 0 ? `${displayW} kg` : 'Cơ thể'}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {done ? (
                          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check size={16} />
                          </span>
                        ) : (
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#F05A28] text-white'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <ChevronRight size={16} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: FOCUS WORKOUT PLAYER (HEVY / NIKE TRAINING CLUB STYLE) */}
            {currentExercise && currentItem && (
              <div
                className={`lg:col-span-7 rounded-3xl bg-white border border-slate-200/90 p-3.5 sm:p-5 shadow-2xs space-y-4 ${
                  mobileWorkoutMode === 'list' ? 'hidden lg:block' : 'block'
                }`}
              >
                {/* Player Top Bar: Mobile Back + Step Badge + Swap Exercise */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMobileWorkoutMode('list')}
                      className="lg:hidden px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Danh sách</span>
                    </button>

                    <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#F05A28] text-xs font-extrabold tabular-nums">
                      Bài {safeExerciseIdx + 1}/{sessionExercises.length}
                    </span>

                    {isExerciseDone(currentExercise.id) && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={13} />
                        <span>Đã xong</span>
                      </span>
                    )}
                  </div>

                  {onOpenSubstituteModal && (
                    <button
                      type="button"
                      onClick={onOpenSubstituteModal}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Đổi bài</span>
                    </button>
                  )}
                </div>

                {/* Exercise Name & Target Summary */}
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                    {currentExercise.vietnameseName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Thiết bị: <strong className="text-slate-700">{currentExercise.machineName}</strong> • Mục tiêu:{' '}
                    <strong className="text-[#F05A28]">{currentItem.suggestedSetsReps}</strong>
                  </p>
                </div>

                {/* Visual Stage Switcher (Real Photo First, 3D Optional on Tap!) */}
                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                    {currentExercise.realGymPhoto && (
                      <button
                        type="button"
                        onClick={() => setVisualTab('gym_photo')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          effectiveVisualTab === 'gym_photo'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <MapPin size={13} className="text-[#F05A28]" />
                        <span>Máy thật</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setVisualTab('dual_photo')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        effectiveVisualTab === 'dual_photo'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Camera size={13} className="text-[#F05A28]" />
                      <span>2 Tư thế</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisualTab('3d')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        effectiveVisualTab === '3d'
                          ? 'bg-[#1E293B] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Rotate3d size={13} />
                      <span>Mô phỏng 3D</span>
                    </button>
                  </div>

                  {effectiveVisualTab === 'gym_photo' && currentExercise.realGymPhoto && (
                    <RealGymMachineView
                      exercise={currentExercise}
                      onSwitchTo3D={() => setVisualTab('3d')}
                    />
                  )}
                  {effectiveVisualTab === 'dual_photo' && (
                    <ExerciseReferenceDualView
                      exercise={currentExercise}
                      onSwitchTo3D={() => setVisualTab('3d')}
                    />
                  )}
                  {effectiveVisualTab === '3d' && (
                    <GymMannequin3DViewer
                      exercise={currentExercise}
                      gender={activeGender}
                    />
                  )}
                </div>

                {/* Concise Biomechanics & Readiness Note */}
                <div
                  className={`rounded-2xl p-3 border text-xs leading-relaxed flex items-start gap-2.5 ${
                    readinessStatus.isHighSpinalLoadWarning
                      ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                      : 'bg-slate-50 border-slate-200/80 text-slate-700'
                  }`}
                >
                  {readinessStatus.isHighSpinalLoadWarning ? (
                    <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-slate-900">
                      {readinessStatus.phaseTitleVi}
                    </div>
                    <p>{readinessStatus.coachingBannerVi}</p>
                  </div>
                </div>

                {/* Hevy / Strong Style Set-by-Set Table, Rest Timer & Plate Calculator */}
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

                {/* Collapsible 4-Step Technique & Machine Setup */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 px-3.5 py-2.5">
                  <button
                    type="button"
                    onClick={() => setShowStepsDetail((v) => !v)}
                    className="w-full flex items-center justify-between gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                  >
                    <span className="text-left truncate">
                      Mẹo chỉnh máy: {currentExercise.machineSetupTip}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#F05A28] shrink-0">
                      <span>{showStepsDetail ? 'Thu gọn' : '4 bước tập'}</span>
                      {showStepsDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </button>

                  {showStepsDetail && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 space-y-2">
                      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentExercise.steps.map((step, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80"
                          >
                            <span className="w-5 h-5 rounded-md bg-[#1E293B] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      {currentExercise.mistakes && (
                        <p className="text-xs text-slate-600 px-1">
                          <strong className="text-slate-900">Tránh lỗi sai:</strong>{' '}
                          {currentExercise.mistakes}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Prev / Primary Next Exercise Action Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={safeExerciseIdx === 0}
                    onClick={handlePrevExercise}
                    className="h-12 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:cursor-default shrink-0"
                  >
                    <ArrowLeft size={16} />
                    <span>Bài trước</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCompleteAndNextExercise}
                    className="flex-1 h-12 px-4 rounded-2xl bg-[#F05A28] hover:bg-[#d94d1f] text-white font-extrabold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all active:scale-99 cursor-pointer"
                  >
                    <Check size={17} />
                    <span>
                      {safeExerciseIdx + 1 < sessionExercises.length
                        ? `Tập xong • Qua bài ${safeExerciseIdx + 2}`
                        : 'Hoàn thành buổi tập'}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeMainTab === 'nutrition' && (
        <GymNutritionTabView
          gender={activeGender}
          goalLabelVi={recommendation.goalLabelVi}
          nutritionPlan={recommendation.nutritionPlan}
          displayedWaterMl={displayedWaterMl}
          onAdjustWater={handleAdjustWater}
        />
      )}

      {activeMainTab === 'progress' && (
        <GymProgressHistoryModal
          open={true}
          mode="inline"
          gender={activeGender}
          workoutStreak={workoutStreak}
          userProfile={draftProfile}
          exerciseLogs={exerciseLogs}
          workoutHistory={workoutHistory}
          bodyMetricsHistory={bodyMetricsHistory}
          onRecordTodayBodyMetrics={() => {
            if (onRecordTodayBodyMetrics) {
              onRecordTodayBodyMetrics();
            } else {
              onSaveProfile({ ...draftProfile, gender: activeGender });
            }
          }}
        />
      )}

      {activeMainTab === 'profile' && (
        <GymProfileSetupTabView
          gender={activeGender}
          draftProfile={draftProfile}
          draftCycle={draftCycle}
          onUpdateProfileLive={updateProfileLive}
          onUpdateCycleLive={updateCycleLive}
          onToggleSymptom={toggleSymptom}
          onSubmitForm={handleSubmitForm}
          onOpenCustomizerModal={onOpenCustomizerModal}
        />
      )}

      {/* 4. MOBILE FIXED BOTTOM TAB BAR (Native App Ergonomics on Phones <768px) */}
      <nav
        aria-label="Thanh điều hướng di động"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(15,23,42,0.06)]"
      >
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMainTab(tab.id)}
                className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#F05A28] font-extrabold'
                    : 'text-slate-500 font-semibold hover:text-slate-800'
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[11px] leading-tight">{tab.mobileLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </section>
  );
}
