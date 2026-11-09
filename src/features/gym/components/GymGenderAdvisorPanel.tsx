import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Droplets,
  Dumbbell,
  Flame,
  HeartPulse,
  Rotate3d,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  Zap,
} from 'lucide-react';
import type {
  GymCycleTrackingState,
  GymExperienceLevel,
  GymFemaleBodyProfile,
  GymGenderMode,
  GymMaleGoal,
  GymManualPhaseOverride,
  GymPrimaryGoal,
  GymSplitDayConfig,
  GymSymptomCode,
} from '../types/gym';
import {
  GYM_PRIMARY_GOAL_META,
  GYM_SYMPTOM_META,
} from '../utils/gymCycleAndProgressionUtils';
import {
  generateGenderWorkoutAndNutritionPlan,
  GYM_MALE_GOAL_META,
  type GenderWorkoutAndNutritionRecommendation,
} from '../utils/gymGenderAdvisorUtils';
import GymMannequin3DViewer from './GymMannequin3DViewer';

interface GymGenderAdvisorPanelProps {
  activeGender: GymGenderMode;
  selectedExerciseId?: string;
  userProfile: GymFemaleBodyProfile;
  cycleTracking: GymCycleTrackingState;
  onSelectGenderRoute: (gender: GymGenderMode) => void;
  onSaveProfile: (patch: Partial<GymFemaleBodyProfile>) => void;
  onSaveCycle: (patch: Partial<GymCycleTrackingState>) => void;
  onApplyRecommendedSplit: (days: GymSplitDayConfig[]) => void;
  onSelectExerciseFor3D: (exerciseId: string) => void;
  onOpenAiCoachDrawer: () => void;
}

const FEMALE_PHASE_OPTIONS: {
  id: GymManualPhaseOverride;
  label: string;
}[] = [
  { id: 'follicular', label: 'Nang Trứng (Sung sức)' },
  { id: 'ovulatory', label: 'Rụng Trứng (Đỉnh lực)' },
  { id: 'luteal', label: 'Hoàng Thể / PMS' },
  { id: 'menstrual', label: 'Kỳ Dâu (Giảm 20% tạ)' },
];

const EXPERIENCE_OPTIONS: { id: GymExperienceLevel; label: string }[] = [
  { id: 'beginner', label: 'Mới tập' },
  { id: 'intermediate', label: 'Trung cấp' },
  { id: 'advanced', label: 'Nâng cao' },
];

/**
 * Extracts concise food tags from a meal option string so the UI displays
 * clean visual chips instead of long paragraphs.
 */
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
  userProfile,
  cycleTracking,
  onSelectGenderRoute,
  onSaveProfile,
  onSaveCycle,
  onApplyRecommendedSplit,
  onSelectExerciseFor3D,
  onOpenAiCoachDrawer,
}: GymGenderAdvisorPanelProps) {
  const [draftProfile, setDraftProfile] = useState<GymFemaleBodyProfile>(() => ({
    ...userProfile,
    gender: activeGender,
    heightCm:
      userProfile.heightCm || (activeGender === 'male' ? 172 : 160),
    weightKg:
      userProfile.weightKg || (activeGender === 'male' ? 68 : 50),
    chestCm: userProfile.chestCm || 96,
    armCm: userProfile.armCm || 35,
    workoutsPerWeek: userProfile.workoutsPerWeek || 4,
    maleGoal: userProfile.maleGoal || 'chest_shoulder_3d',
  }));

  const [draftCycle, setDraftCycle] = useState<GymCycleTrackingState>(cycleTracking);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isFormExpanded, setIsFormExpanded] = useState<boolean>(true);

  useEffect(() => {
    setDraftProfile((prev) => {
      const switchingToMaleDefault =
        activeGender === 'male' && prev.heightCm === 160 && prev.weightKg === 50;
      const switchingToFemaleDefault =
        activeGender === 'female' && prev.heightCm === 172 && prev.weightKg === 68;

      return {
        ...prev,
        gender: activeGender,
        heightCm: switchingToMaleDefault
          ? 172
          : switchingToFemaleDefault
            ? 160
            : prev.heightCm,
        weightKg: switchingToMaleDefault
          ? 68
          : switchingToFemaleDefault
            ? 50
            : prev.weightKg,
        waistCm: switchingToMaleDefault
          ? 78
          : switchingToFemaleDefault
            ? 63
            : prev.waistCm,
      };
    });
  }, [activeGender]);

  const recommendation: GenderWorkoutAndNutritionRecommendation = useMemo(
    () =>
      generateGenderWorkoutAndNutritionPlan({
        gender: activeGender,
        userProfile: draftProfile,
        cycleTracking: draftCycle,
      }),
    [activeGender, draftProfile, draftCycle]
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
    if (recommendation.recommendedExercises[0]) {
      onSelectExerciseFor3D(recommendation.recommendedExercises[0].exercise.id);
    }
    setHasSubmitted(true);
    setIsFormExpanded(false);
  };

  const isMale = activeGender === 'male';

  return (
    <section
      aria-label="Bộ định tuyến Nam Nữ và tư vấn bài tập ăn uống cá nhân hóa"
      className="rounded-3xl bg-[#16161C] border border-[#282834] p-3.5 sm:p-5 text-[#F7F7F7] shadow-2xl space-y-4"
    >
      {/* 1. COMPACT 2-ROUTER BAR (/gym/nam vs /gym/nu) */}
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
            <h1 className="text-sm sm:text-base font-black text-[#F7F7F7] flex items-center gap-2">
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
          </div>
        </div>

        <div className="flex items-center gap-2">
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
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isMale
                  ? 'bg-[#5CE1E6] text-[#111114] shadow-md shadow-[#5CE1E6]/20'
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
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isMale
                  ? 'bg-[#FF5C8A] text-[#111114] shadow-md shadow-[#FF5C8A]/20'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              <HeartPulse size={14} />
              <span>GYM NỮ (/gym/nu)</span>
            </button>
          </div>

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

      {/* 2. ULTRA-CONCISE QUESTIONNAIRE FORM (Auto-collapses on submit) */}
      {isFormExpanded && (
        <form onSubmit={handleSubmitForm} className="space-y-3">
          {isMale ? (
            /* ================= MALE COMPACT FORM (/gym/nam) ================= */
            <div className="space-y-3 rounded-2xl bg-[#111114] border border-[#262632] p-3.5">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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

                <div>
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

              {/* Male Goal Pills (Short Title Only) */}
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
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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

                <div className="col-span-2 sm:col-span-1">
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

              {/* Female Goal Pills (Short Title Only) */}
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

              {/* Female Cycle Pills + Symptoms + Submit */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
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

                  {(Object.keys(GYM_SYMPTOM_META) as GymSymptomCode[])
                    .slice(0, 3)
                    .map((code) => {
                      const active = draftCycle.todaySymptoms.includes(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => toggleSymptom(code)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer ${
                            active
                              ? 'bg-[#A3F77B] text-[#111114] border-[#A3F77B]'
                              : 'bg-[#1B1B22] text-zinc-400 border-[#2E2E3A]'
                          }`}
                        >
                          {GYM_SYMPTOM_META[code].labelVi}
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

      {/* 3. VISUAL-FIRST 3D WORKOUT & COMPACT MEAL PLAN (Personalized to User's Need) */}
      <div
        aria-label="Kết quả đề xuất bài tập và chế độ ăn uống cá nhân hóa"
        className={`space-y-4 ${hasSubmitted ? 'pt-1' : 'pt-2 border-t border-[#262632]'}`}
      >
        {/* PART A: 6 LIVE 3D EXERCISE CARDS FOR THIS USER'S GOAL */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Rotate3d
                size={16}
                className={isMale ? 'text-[#5CE1E6]' : 'text-[#FF5C8A]'}
              />
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#F7F7F7]">
                1. Đề Xuất Bài Tập Trọng Tâm Cho Bạn ({recommendation.recommendedExercises.length} Mô Hình 3D)
              </h2>
            </div>

            <button
              type="button"
              onClick={onOpenAiCoachDrawer}
              className="px-3 py-1.5 rounded-xl bg-[#111114] border border-[#2E2E3C] hover:border-[#FF5C8A] text-xs font-extrabold text-[#F7F7F7] flex items-center gap-1.5 cursor-pointer"
            >
              <Bot size={14} className="text-[#FF5C8A]" />
              <span>AI Coach</span>
            </button>
          </div>

          {/* 6 Live 3D Visual Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendation.recommendedExercises.map((item, idx) => {
              const isSelected = selectedExerciseId === item.exercise.id;
              return (
                <div
                  key={item.exercise.id}
                  onClick={() => onSelectExerciseFor3D(item.exercise.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectExerciseFor3D(item.exercise.id);
                    }
                  }}
                  className={`rounded-2xl bg-[#111114] border p-2.5 flex flex-col gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? isMale
                        ? 'border-[#5CE1E6] ring-2 ring-[#5CE1E6]/25'
                        : 'border-[#FF5C8A] ring-2 ring-[#FF5C8A]/25'
                      : 'border-[#272733] hover:border-zinc-500'
                  }`}
                >
                  {/* Live 3D Mannequin Illustration Inside Every Card */}
                  <GymMannequin3DViewer exercise={item.exercise} compact />

                  {/* Ultra-Clean 2-Line Footer (Minimal Text) */}
                  <div className="px-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs sm:text-sm font-black text-[#F7F7F7] truncate">
                        {idx + 1}. {item.exercise.vietnameseName}
                      </span>
                      {item.suggestedWeightKg > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#A3F77B]/15 text-[#A3F77B] text-[11px] font-black shrink-0">
                          {item.suggestedWeightKg}kg
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-zinc-400">
                      <span className="text-[#FF85A9]">
                        {item.exercise.sets} × {item.exercise.reps}
                      </span>
                      <span className="truncate">{item.exercise.machineName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PART B: ULTRA-CONCISE VISUAL NUTRITION & 4 MEAL CHIPS */}
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

          {/* 5 Compact Macro Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="rounded-2xl bg-[#111114] border border-[#272733] px-3 py-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                <Flame size={13} className="text-[#FF5C8A]" /> Calo
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

            <div className="col-span-2 sm:col-span-1 rounded-2xl bg-[#111114] border border-[#272733] px-3 py-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                <Droplets size={13} className="text-[#5CE1E6]" /> Nước
              </span>
              <span className="text-sm sm:text-base font-black text-[#F7F7F7]">
                {recommendation.nutritionPlan.waterLiters}L
              </span>
            </div>
          </div>

          {/* 4 Meal Cards with Short Food Chips (No Long Sentences) */}
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
