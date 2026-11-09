import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Droplets,
  Dumbbell,
  Flame,
  HeartPulse,
  Rotate3d,
  ShieldCheck,
  Sparkles,
  User,
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

interface GymGenderAdvisorPanelProps {
  activeGender: GymGenderMode;
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
  sub: string;
}[] = [
  { id: 'follicular', label: 'Pha Nang Trứng (Ngày 6–13)', sub: 'Sung sức • Vàng độ mông' },
  { id: 'ovulatory', label: 'Pha Rụng Trứng (Ngày 14–16)', sub: 'Đỉnh sức mạnh (+2.5kg)' },
  { id: 'luteal', label: 'Pha Hoàng Thể / PMS (17–28)', sub: 'Tạ vừa • 12–15 reps' },
  { id: 'menstrual', label: 'Kỳ Dâu / Hành Kinh (1–5)', sub: 'Deload -20% • Êm lưng' },
];

const EXPERIENCE_OPTIONS: { id: GymExperienceLevel; label: string }[] = [
  { id: 'beginner', label: 'Mới tập (< 3 tháng)' },
  { id: 'intermediate', label: 'Trung cấp (3–12 tháng)' },
  { id: 'advanced', label: 'Nâng cao (> 1 năm)' },
];

export default function GymGenderAdvisorPanel({
  activeGender,
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
  const [isFormCollapsed, setIsFormCollapsed] = useState<boolean>(false);
  const [appliedSplitBanner, setAppliedSplitBanner] = useState<string>('');

  // Keep draft gender synced when user switches between /gym/nam and /gym/nu
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
    setAppliedSplitBanner('');
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

  const toggleSymptom = (code: GymSymptomCode) => {
    setDraftCycle((prev) => {
      const exists = prev.todaySymptoms.includes(code);
      const next = exists
        ? prev.todaySymptoms.filter((s) => s !== code)
        : [...prev.todaySymptoms, code];
      return { ...prev, todaySymptoms: next };
    });
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...draftProfile,
      gender: activeGender,
    });
    onSaveCycle(draftCycle);
    setHasSubmitted(true);
    setAppliedSplitBanner('');
  };

  const handleApplySplitDays = () => {
    onApplyRecommendedSplit(recommendation.recommendedSplitDays);
    setAppliedSplitBanner(
      `Đã áp dụng "${recommendation.recommendedPresetNameVi}" vào lịch tập chính bên dưới!`
    );
  };

  const isMale = activeGender === 'male';

  return (
    <section
      aria-label="Bộ định tuyến Nam Nữ và tư vấn bài tập ăn uống cá nhân hóa"
      className="rounded-3xl bg-[#16161C] border border-[#282834] p-3.5 sm:p-5 text-[#F7F7F7] shadow-2xl space-y-4"
    >
      {/* 1. TWO-ROUTER SWITCHER BAR (/gym/nam vs /gym/nu) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#262632]">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${
              isMale
                ? 'bg-[#5CE1E6]/15 border-[#5CE1E6]/40 text-[#5CE1E6]'
                : 'bg-[#FF5C8A]/15 border-[#FF5C8A]/40 text-[#FF5C8A]'
            }`}
          >
            {isMale ? <Dumbbell size={20} /> : <HeartPulse size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isMale
                    ? 'bg-[#5CE1E6]/20 text-[#5CE1E6] border border-[#5CE1E6]/40'
                    : 'bg-[#FF5C8A]/20 text-[#FF5C8A] border border-[#FF5C8A]/40'
                }`}
              >
                {isMale ? 'Router Nam • /gym/nam' : 'Router Nữ • /gym/nu'}
              </span>
              <h2 className="text-sm sm:text-base font-black text-[#F7F7F7]">
                {isMale
                  ? 'Gym 3D Phái Mạnh — Ngực Dày • Vai 3D • 6 Múi'
                  : 'Gym 3D Phái Đẹp — Độ Mông S-Line & Đồng Bộ Chu Kỳ'}
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Chọn đúng giới tính để hệ thống hỏi đúng chỉ số và đề xuất bài tập + thực đơn chuẩn xác ngay bên dưới.
            </p>
          </div>
        </div>

        {/* Prominent 2-Router Toggle Buttons */}
        <div
          role="tablist"
          aria-label="Chọn chế độ Gym Nam hoặc Gym Nữ"
          className="grid grid-cols-2 gap-2 bg-[#111114] p-1.5 rounded-2xl border border-[#2A2A36] shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isMale}
            onClick={() => onSelectGenderRoute('male')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              isMale
                ? 'bg-[#5CE1E6] text-[#111114] shadow-lg shadow-[#5CE1E6]/25'
                : 'text-zinc-300 hover:text-white hover:bg-[#1E1E28]'
            }`}
          >
            <Dumbbell size={16} />
            <span>GYM NAM (/gym/nam)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={!isMale}
            onClick={() => onSelectGenderRoute('female')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              !isMale
                ? 'bg-[#FF5C8A] text-[#111114] shadow-lg shadow-[#FF5C8A]/25'
                : 'text-zinc-300 hover:text-white hover:bg-[#1E1E28]'
            }`}
          >
            <HeartPulse size={16} />
            <span>GYM NỮ (/gym/nu)</span>
          </button>
        </div>
      </div>

      {/* Collapse / Expand Form Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-zinc-300">
          <User
            size={14}
            className={isMale ? 'text-[#5CE1E6]' : 'text-[#FF5C8A]'}
          />
          <span>
            {isMale
              ? 'Bảng Khảo Sát Thể Trạng & Mục Tiêu Nam Giới'
              : 'Bảng Khảo Sát Đường Cong & Chu Kỳ Nữ Giới'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsFormCollapsed((v) => !v)}
          className="inline-flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
        >
          <span>{isFormCollapsed ? 'Mở rộng bảng hỏi' : 'Thu gọn bảng hỏi'}</span>
          {isFormCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </button>
      </div>

      {/* 2. GENDER-SPECIFIC QUESTIONNAIRE FORM */}
      {!isFormCollapsed && (
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {isMale ? (
            /* ================= MALE QUESTIONNAIRE (/gym/nam) ================= */
            <div className="space-y-4 rounded-2xl bg-[#111114] border border-[#262632] p-3.5 sm:p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                <div className="col-span-2 sm:col-span-1">
                  <label
                    htmlFor="maleNickname"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Biệt danh
                  </label>
                  <input
                    id="maleNickname"
                    type="text"
                    value={draftProfile.nickname}
                    onChange={(e) =>
                      setDraftProfile((p) => ({ ...p, nickname: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs sm:text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#5CE1E6]"
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
                      setDraftProfile((p) => ({
                        ...p,
                        heightCm: Number(e.target.value) || 172,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs sm:text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#5CE1E6]"
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
                      setDraftProfile((p) => ({
                        ...p,
                        weightKg: Number(e.target.value) || 68,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs sm:text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#5CE1E6]"
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
                      setDraftProfile((p) => ({
                        ...p,
                        chestCm: Number(e.target.value) || 96,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs sm:text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#5CE1E6]"
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
                      setDraftProfile((p) => ({
                        ...p,
                        waistCm: Number(e.target.value) || 78,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs sm:text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#5CE1E6]"
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
                      setDraftProfile((p) => ({
                        ...p,
                        armCm: Number(e.target.value) || 35,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs sm:text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#5CE1E6]"
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
                      setDraftProfile((p) => ({
                        ...p,
                        workoutsPerWeek: Number(e.target.value) || 4,
                      }))
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs sm:text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#5CE1E6] cursor-pointer"
                  >
                    <option value={3}>3 buổi/tuần</option>
                    <option value={4}>4 buổi/tuần</option>
                    <option value={5}>5 buổi/tuần</option>
                    <option value={6}>6 buổi/tuần</option>
                  </select>
                </div>
              </div>

              {/* Male Goal Selection */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-zinc-300">
                  Mục tiêu thể hình Nam Giới ưu tiên:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {(Object.keys(GYM_MALE_GOAL_META) as GymMaleGoal[]).map((goalKey) => {
                    const meta = GYM_MALE_GOAL_META[goalKey];
                    const selected = (draftProfile.maleGoal || 'chest_shoulder_3d') === goalKey;
                    return (
                      <button
                        key={goalKey}
                        type="button"
                        onClick={() =>
                          setDraftProfile((p) => ({ ...p, maleGoal: goalKey }))
                        }
                        className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#5CE1E6]/15 border-[#5CE1E6] text-[#F7F7F7]'
                            : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        <div className="text-xs font-black flex items-center justify-between gap-1">
                          <span>{meta.labelVi}</span>
                          {selected && <Check size={14} className="text-[#5CE1E6] shrink-0" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                          {meta.descVi}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Male Experience & Energy Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="text-xs font-bold text-zinc-300 mb-1.5">
                    Thâm niên tập luyện:
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {EXPERIENCE_OPTIONS.map((exp) => {
                      const active = draftProfile.experienceLevel === exp.id;
                      return (
                        <button
                          key={exp.id}
                          type="button"
                          onClick={() =>
                            setDraftProfile((p) => ({ ...p, experienceLevel: exp.id }))
                          }
                          className={`py-2 px-2 rounded-xl border text-[11px] font-extrabold transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#5CE1E6] text-[#111114] border-[#5CE1E6]'
                              : 'bg-[#1B1B22] text-zinc-300 border-[#2E2E3A] hover:border-zinc-500'
                          }`}
                        >
                          {exp.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-zinc-300 mb-1.5">
                    Mức sung sức &amp; năng lượng hôm nay (1–5):
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {([1, 2, 3, 4, 5] as const).map((lvl) => {
                      const active = draftCycle.todayEnergyLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() =>
                            setDraftCycle((c) => ({ ...c, todayEnergyLevel: lvl }))
                          }
                          className={`py-2 rounded-xl border text-xs font-black transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#A3F77B] text-[#111114] border-[#A3F77B]'
                              : 'bg-[#1B1B22] text-zinc-300 border-[#2E2E3A] hover:border-zinc-500'
                          }`}
                        >
                          {lvl}/5
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= FEMALE QUESTIONNAIRE (/gym/nu) ================= */
            <div className="space-y-4 rounded-2xl bg-[#111114] border border-[#262632] p-3.5 sm:p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <div>
                  <label
                    htmlFor="femaleNickname"
                    className="block text-[11px] font-bold text-zinc-400 mb-1"
                  >
                    Biệt danh
                  </label>
                  <input
                    id="femaleNickname"
                    type="text"
                    value={draftProfile.nickname}
                    onChange={(e) =>
                      setDraftProfile((p) => ({ ...p, nickname: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs sm:text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
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
                      setDraftProfile((p) => ({
                        ...p,
                        heightCm: Number(e.target.value) || 160,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs sm:text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
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
                      setDraftProfile((p) => ({
                        ...p,
                        weightKg: Number(e.target.value) || 50,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs sm:text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
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
                      setDraftProfile((p) => ({
                        ...p,
                        waistCm: Number(e.target.value) || 63,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs sm:text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
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
                      setDraftProfile((p) => ({
                        ...p,
                        hipCm: Number(e.target.value) || 92,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs sm:text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
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
                      setDraftProfile((p) => ({
                        ...p,
                        workoutsPerWeek: Number(e.target.value) || 4,
                      }))
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs sm:text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A] cursor-pointer"
                  >
                    <option value={3}>3 buổi/tuần</option>
                    <option value={4}>4 buổi/tuần</option>
                    <option value={5}>5 buổi/tuần</option>
                  </select>
                </div>
              </div>

              {/* Female Goal Selection */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-zinc-300">
                  Mục tiêu đường cong Nữ Giới ưu tiên:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {(Object.keys(GYM_PRIMARY_GOAL_META) as GymPrimaryGoal[]).map(
                    (goalKey) => {
                      const meta = GYM_PRIMARY_GOAL_META[goalKey];
                      const selected = draftProfile.primaryGoal === goalKey;
                      return (
                        <button
                          key={goalKey}
                          type="button"
                          onClick={() =>
                            setDraftProfile((p) => ({ ...p, primaryGoal: goalKey }))
                          }
                          className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                            selected
                              ? 'bg-[#FF5C8A]/15 border-[#FF5C8A] text-[#F7F7F7]'
                              : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-300 hover:border-zinc-500'
                          }`}
                        >
                          <div className="text-xs font-black flex items-center justify-between gap-1">
                            <span>{meta.labelVi}</span>
                            {selected && (
                              <Check size={14} className="text-[#FF5C8A] shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                            {meta.descVi}
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Female Menstrual Cycle Phase & Symptoms */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1">
                <div className="lg:col-span-7 space-y-1.5">
                  <div className="text-xs font-bold text-zinc-300">
                    Pha Chu Kỳ Kinh Nguyệt hôm nay (Tự chỉnh mức tạ &amp; thực đơn):
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {FEMALE_PHASE_OPTIONS.map((p) => {
                      const selected = draftCycle.manualPhaseOverride === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            setDraftCycle((c) => ({ ...c, manualPhaseOverride: p.id }))
                          }
                          className={`text-left p-2 rounded-xl border transition-colors cursor-pointer ${
                            selected
                              ? 'bg-[#FF5C8A]/20 border-[#FF5C8A] text-[#F7F7F7]'
                              : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-300 hover:border-zinc-500'
                          }`}
                        >
                          <div className="text-[11px] font-black leading-tight">
                            {p.label}
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{p.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-1.5">
                  <div className="text-xs font-bold text-zinc-300">
                    Triệu chứng cơ thể hôm nay (nếu có):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(GYM_SYMPTOM_META) as GymSymptomCode[]).map((code) => {
                      const active = draftCycle.todaySymptoms.includes(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => toggleSymptom(code)}
                          className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#FF5C8A] text-[#111114] border-[#FF5C8A]'
                              : 'bg-[#1B1B22] text-zinc-300 border-[#2E2E3A] hover:border-zinc-500'
                          }`}
                        >
                          {GYM_SYMPTOM_META[code].labelVi}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-zinc-400">
              Bấm nút bên phải để hệ thống tính toán **Đề xuất Bài Tập** và **Thực Đơn Ăn Uống 4 Bữa** hiển thị ngay bên dưới.
            </div>
            <button
              type="submit"
              className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-98 cursor-pointer ${
                isMale
                  ? 'bg-linear-to-r from-[#5CE1E6] to-[#A3F77B] text-[#111114]'
                  : 'bg-linear-to-r from-[#FF5C8A] to-[#FF85A9] text-[#111114]'
              }`}
            >
              <Sparkles size={17} />
              <span>
                {isMale
                  ? 'PHÂN TÍCH NAM GIỚI & ĐỀ XUẤT BÀI TẬP + ĂN UỐNG NGAY'
                  : 'PHÂN TÍCH NỮ GIỚI & ĐỀ XUẤT BÀI TẬP + ĂN UỐNG NGAY'}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* 3. INSTANT INLINE WORKOUT & NUTRITION RECOMMENDATIONS BELOW FORM UPON SUBMIT */}
      {hasSubmitted && (
        <div
          aria-label="Kết quả đề xuất bài tập và chế độ ăn uống cá nhân hóa"
          className="space-y-4 pt-3 border-t border-[#2B2B38] animate-fadeIn"
        >
          {/* Headline Summary Banner */}
          <div
            className={`rounded-2xl p-4 border ${
              isMale
                ? 'bg-[#5CE1E6]/10 border-[#5CE1E6]/40'
                : 'bg-[#FF5C8A]/10 border-[#FF5C8A]/40'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                      isMale
                        ? 'bg-[#5CE1E6] text-[#111114]'
                        : 'bg-[#FF5C8A] text-[#111114]'
                    }`}
                  >
                    Đề Xuất Cá Nhân Hóa
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-[#F7F7F7]">
                    {recommendation.headlineVi}
                  </h3>
                </div>
                <p className="text-xs font-bold text-zinc-200">
                  {recommendation.bodyAnalysisVi}
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {recommendation.strategySummaryVi}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleApplySplitDays}
                  className="px-3.5 py-2.5 rounded-xl bg-[#A3F77B] text-[#111114] font-black text-xs flex items-center gap-1.5 hover:brightness-105 transition cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  <span>Áp Dụng Lịch 5 Ngày Này</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenAiCoachDrawer}
                  className="px-3.5 py-2.5 rounded-xl bg-[#1E1E28] border border-[#343446] text-[#F7F7F7] font-bold text-xs flex items-center gap-1.5 hover:border-[#FF5C8A] transition cursor-pointer"
                >
                  <Bot size={15} className="text-[#FF5C8A]" />
                  <span>Hỏi AI Coach Sâu Hơn</span>
                </button>
              </div>
            </div>

            {appliedSplitBanner && (
              <div className="mt-2.5 px-3 py-2 rounded-xl bg-[#A3F77B]/20 border border-[#A3F77B]/50 text-[#A3F77B] text-xs font-extrabold flex items-center gap-1.5">
                <Check size={14} />
                <span>{appliedSplitBanner}</span>
              </div>
            )}
          </div>

          {/* PART A: RECOMMENDED EXERCISES BELOW FORM */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Dumbbell
                  size={16}
                  className={isMale ? 'text-[#5CE1E6]' : 'text-[#FF5C8A]'}
                />
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#F7F7F7]">
                  1. Đề Xuất Bài Tập Trọng Tâm Cho Bạn ({recommendation.recommendedExercises.length} Bài Chủ Lực)
                </h4>
              </div>
              <span className="text-[11px] text-zinc-400">
                Bấm vào bài bất kỳ để mở Mô hình 3D bên dưới
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {recommendation.recommendedExercises.map((item, idx) => (
                <div
                  key={item.exercise.id}
                  className="rounded-2xl bg-[#111114] border border-[#272733] hover:border-[#FF5C8A]/60 p-3.5 flex flex-col justify-between gap-2.5 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          isMale
                            ? 'bg-[#5CE1E6]/15 text-[#5CE1E6]'
                            : 'bg-[#FF5C8A]/15 text-[#FF5C8A]'
                        }`}
                      >
                        Bài {idx + 1} • {item.exercise.muscleTag}
                      </span>
                      {item.suggestedWeightKg > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#A3F77B]/15 text-[#A3F77B] border border-[#A3F77B]/30 text-[11px] font-black">
                          Gợi ý: {item.suggestedWeightKg}kg
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-black text-[#F7F7F7]">
                      {item.exercise.vietnameseName}
                    </div>
                    <div className="text-[11px] font-bold text-zinc-400">
                      Thiết bị: {item.exercise.machineName}
                    </div>
                    <div className="text-xs font-extrabold text-[#FF85A9]">
                      Khối lượng tập: {item.suggestedSetsReps}
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      {item.whyRecommendedVi}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectExerciseFor3D(item.exercise.id)}
                    className="w-full py-2 px-3 rounded-xl bg-[#1D1D26] hover:bg-[#282836] border border-[#2E2E3C] text-xs font-extrabold text-[#F7F7F7] flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Rotate3d
                      size={14}
                      className={isMale ? 'text-[#5CE1E6]' : 'text-[#FF5C8A]'}
                    />
                    <span>Xem Mô Phỏng 3D &amp; Kỹ Thuật</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* PART B: RECOMMENDED NUTRITION & 4-MEAL PLAN BELOW FORM */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Utensils size={16} className="text-[#A3F77B]" />
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#F7F7F7]">
                  2. Đề Xuất Chế Độ Ăn Uống &amp; Thực Đơn 4 Bữa Trong Ngày
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#A3F77B]/15 border border-[#A3F77B]/40 text-[#A3F77B] text-xs font-black">
                {recommendation.nutritionPlan.calorieBadgeVi}
              </span>
            </div>

            {/* Daily Macro Target Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="rounded-2xl bg-[#111114] border border-[#272733] p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
                  <Flame size={13} className="text-[#FF5C8A]" />
                  <span>Tổng Calo Mục Tiêu</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-[#F7F7F7] mt-1">
                  {recommendation.nutritionPlan.targetCaloriesKcal}{' '}
                  <span className="text-xs font-bold text-zinc-400">kcal</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  TDEE giữ cân: {recommendation.nutritionPlan.tdeeKcal} kcal
                </div>
              </div>

              <div className="rounded-2xl bg-[#111114] border border-[#272733] p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
                  <Zap size={13} className="text-[#A3F77B]" />
                  <span>Đạm (Protein)</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-[#A3F77B] mt-1">
                  {recommendation.nutritionPlan.proteinGrams}g{' '}
                  <span className="text-xs font-bold text-zinc-400">/ngày</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Ưu tiên ức gà, cá, bò, trứng, đậu
                </div>
              </div>

              <div className="rounded-2xl bg-[#111114] border border-[#272733] p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
                  <Activity size={13} className="text-[#5CE1E6]" />
                  <span>Tinh Bột (Carbs)</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-[#5CE1E6] mt-1">
                  {recommendation.nutritionPlan.carbsGrams}g{' '}
                  <span className="text-xs font-bold text-zinc-400">/ngày</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Khoai lang, yến mạch, cơm vừa đủ
                </div>
              </div>

              <div className="rounded-2xl bg-[#111114] border border-[#272733] p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
                  <ShieldCheck size={13} className="text-[#FF85A9]" />
                  <span>Chất Béo Tốt (Fat)</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-[#FF85A9] mt-1">
                  {recommendation.nutritionPlan.fatGrams}g{' '}
                  <span className="text-xs font-bold text-zinc-400">/ngày</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Quả bơ, cá hồi, dầu oliu, hạt
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-2xl bg-[#111114] border border-[#272733] p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
                  <Droplets size={13} className="text-[#5CE1E6]" />
                  <span>Nước Uống</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-[#F7F7F7] mt-1">
                  {recommendation.nutritionPlan.waterLiters} Lít
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Uống từng ngụm nhỏ trong lúc tập
                </div>
              </div>
            </div>

            {/* 4 Vietnamese Meals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {recommendation.nutritionPlan.meals.map((meal) => (
                <div
                  key={meal.id}
                  className="rounded-2xl bg-[#111114] border border-[#272733] p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs sm:text-sm font-black text-[#F7F7F7]">
                        {meal.mealTitleVi}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Khung giờ: {meal.timingVi} • {meal.macroTagVi}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-[#1F1F2B] text-[#A3F77B] text-xs font-black shrink-0">
                      ~{meal.approxKcal} kcal
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {meal.menuOptionsVi.map((opt, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-[#FF5C8A] font-black mt-0.5">•</span>
                        <span>
                          <strong className="text-[#F7F7F7]">Lựa chọn {idx + 1}:</strong>{' '}
                          {opt}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Prioritize vs Avoid + Micronutrient Advice */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div className="rounded-2xl bg-[#111114] border border-[#272733] p-3.5 space-y-1.5">
                <div className="text-xs font-black text-[#A3F77B]">
                  Thực Phẩm Vàng Nên Ưu Tiên
                </div>
                <ul className="space-y-1 text-[11px] text-zinc-300">
                  {recommendation.nutritionPlan.prioritizeFoodsVi.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-[#111114] border border-[#272733] p-3.5 space-y-1.5">
                <div className="text-xs font-black text-[#FF5C8A]">
                  Thực Phẩm &amp; Thói Quen Cần Hạn Chế
                </div>
                <ul className="space-y-1 text-[11px] text-zinc-300">
                  {recommendation.nutritionPlan.avoidFoodsVi.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-[#111114] border border-[#272733] p-3.5 space-y-1.5">
                <div className="text-xs font-black text-[#5CE1E6]">
                  Vi Chất &amp; Lưu Ý Sinh Học ({isMale ? 'Nam Giới' : 'Nữ Giới'})
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  {recommendation.nutritionPlan.keyMicronutrientsVi}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
