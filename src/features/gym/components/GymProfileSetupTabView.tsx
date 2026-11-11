import {
  Calendar,
  Check,
  ListChecks,
  Ruler,
  ShieldCheck,
  Sparkles,
  Target,
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
  GymSymptomCode,
} from '../types/gym';
import {
  GYM_PRIMARY_GOAL_META,
  GYM_SYMPTOM_META,
} from '../utils/gymCycleAndProgressionUtils';
import { GYM_MALE_GOAL_META } from '../utils/gymGenderAdvisorUtils';

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

interface GymProfileSetupTabViewProps {
  gender: GymGenderMode;
  draftProfile: GymFemaleBodyProfile;
  draftCycle: GymCycleTrackingState;
  onUpdateProfileLive: (patch: Partial<GymFemaleBodyProfile>) => void;
  onUpdateCycleLive: (patch: Partial<GymCycleTrackingState>) => void;
  onToggleSymptom: (code: GymSymptomCode) => void;
  onSubmitForm: (e: React.FormEvent) => void;
  onOpenCustomizerModal?: () => void;
}

export default function GymProfileSetupTabView({
  gender,
  draftProfile,
  draftCycle,
  onUpdateProfileLive,
  onUpdateCycleLive,
  onToggleSymptom,
  onSubmitForm,
  onOpenCustomizerModal,
}: GymProfileSetupTabViewProps) {
  const isMale = gender === 'male';

  return (
    <form onSubmit={onSubmitForm} className="space-y-4">
      {/* 1. Body Measurements Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Ruler size={17} className="text-[#F05A28]" />
              <span>
                Chỉ số cơ thể ({isMale ? 'Nam giới' : 'Nữ giới'})
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống tự động tính mức tạ gợi ý và lượng Calo/Đạm theo đúng số đo của bạn
            </p>
          </div>

          {onOpenCustomizerModal && (
            <button
              type="button"
              onClick={onOpenCustomizerModal}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ListChecks size={14} />
              <span>Tùy chỉnh lịch tập</span>
            </button>
          )}
        </div>

        {isMale ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div>
              <label
                htmlFor="maleAge"
                className="block text-xs font-semibold text-slate-600 mb-1"
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
                  onUpdateProfileLive({ age: Number(e.target.value) || 24 })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#F05A28]"
              />
            </div>

            <div>
              <label
                htmlFor="maleHeight"
                className="block text-xs font-semibold text-slate-600 mb-1"
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
                  onUpdateProfileLive({
                    heightCm: Number(e.target.value) || 172,
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#F05A28]"
              />
            </div>

            <div>
              <label
                htmlFor="maleWeight"
                className="block text-xs font-semibold text-slate-600 mb-1"
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
                  onUpdateProfileLive({
                    weightKg: Number(e.target.value) || 68,
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#F05A28]"
              />
            </div>

            <div>
              <label
                htmlFor="maleChest"
                className="block text-xs font-semibold text-slate-600 mb-1"
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
                  onUpdateProfileLive({
                    chestCm: Number(e.target.value) || 96,
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#F05A28]"
              />
            </div>

            <div>
              <label
                htmlFor="maleWaist"
                className="block text-xs font-semibold text-slate-600 mb-1"
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
                  onUpdateProfileLive({
                    waistCm: Number(e.target.value) || 78,
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#F05A28]"
              />
            </div>

            <div>
              <label
                htmlFor="maleArm"
                className="block text-xs font-semibold text-slate-600 mb-1"
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
                  onUpdateProfileLive({
                    armCm: Number(e.target.value) || 35,
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#F05A28]"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="maleWorkoutsPerWeek"
                className="block text-xs font-semibold text-slate-600 mb-1"
              >
                Số buổi/tuần
              </label>
              <select
                id="maleWorkoutsPerWeek"
                value={draftProfile.workoutsPerWeek ?? 4}
                onChange={(e) =>
                  onUpdateProfileLive({
                    workoutsPerWeek: Number(e.target.value) || 4,
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#F05A28] cursor-pointer"
              >
                <option value={3}>3 buổi / tuần</option>
                <option value={4}>4 buổi / tuần</option>
                <option value={5}>5 buổi / tuần</option>
                <option value={6}>6 buổi / tuần</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label
                htmlFor="femaleAge"
                className="block text-xs font-semibold text-slate-600 mb-1"
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
                  onUpdateProfileLive({ age: Number(e.target.value) || 24 })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#F05A28]"
              />
            </div>

            <div>
              <label
                htmlFor="femaleHeight"
                className="block text-xs font-semibold text-slate-600 mb-1"
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
                  onUpdateProfileLive({
                    heightCm: Number(e.target.value) || 160,
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#F05A28]"
              />
            </div>

            <div>
              <label
                htmlFor="femaleWeight"
                className="block text-xs font-semibold text-slate-600 mb-1"
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
                  onUpdateProfileLive({
                    weightKg: Number(e.target.value) || 50,
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#F05A28]"
              />
            </div>

            <div>
              <label
                htmlFor="femaleWaist"
                className="block text-xs font-semibold text-slate-600 mb-1"
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
                  onUpdateProfileLive({
                    waistCm: Number(e.target.value) || 63,
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#F05A28]"
              />
            </div>

            <div>
              <label
                htmlFor="femaleHip"
                className="block text-xs font-semibold text-slate-600 mb-1"
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
                  onUpdateProfileLive({
                    hipCm: Number(e.target.value) || 92,
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#F05A28]"
              />
            </div>

            <div>
              <label
                htmlFor="femaleWorkoutsPerWeek"
                className="block text-xs font-semibold text-slate-600 mb-1"
              >
                Số buổi/tuần
              </label>
              <select
                id="femaleWorkoutsPerWeek"
                value={draftProfile.workoutsPerWeek ?? 4}
                onChange={(e) =>
                  onUpdateProfileLive({
                    workoutsPerWeek: Number(e.target.value) || 4,
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#F05A28] cursor-pointer"
              >
                <option value={3}>3 buổi / tuần</option>
                <option value={4}>4 buổi / tuần</option>
                <option value={5}>5 buổi / tuần</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 2. Fitness Goal Selection Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Target size={16} className="text-[#F05A28]" />
          <span>Mục tiêu hình thể ưu tiên</span>
        </h3>

        {isMale ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(GYM_MALE_GOAL_META) as GymMaleGoal[]).map((goalKey) => {
              const meta = GYM_MALE_GOAL_META[goalKey];
              const selected = (draftProfile.maleGoal || 'chest_shoulder_3d') === goalKey;
              return (
                <button
                  key={goalKey}
                  type="button"
                  onClick={() => onUpdateProfileLive({ maleGoal: goalKey })}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                    selected
                      ? 'bg-orange-50/70 border-[#F05A28] ring-1 ring-[#F05A28]/30'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {meta.labelVi}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 leading-snug">
                      {meta.descVi}
                    </div>
                  </div>
                  {selected && (
                    <span className="w-6 h-6 rounded-full bg-[#F05A28] text-white flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(GYM_PRIMARY_GOAL_META) as GymPrimaryGoal[]).map((goalKey) => {
              const meta = GYM_PRIMARY_GOAL_META[goalKey];
              const selected = draftProfile.primaryGoal === goalKey;
              return (
                <button
                  key={goalKey}
                  type="button"
                  onClick={() => onUpdateProfileLive({ primaryGoal: goalKey })}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                    selected
                      ? 'bg-orange-50/70 border-[#F05A28] ring-1 ring-[#F05A28]/30'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {meta.labelVi}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 leading-snug">
                      {meta.descVi}
                    </div>
                  </div>
                  {selected && (
                    <span className="w-6 h-6 rounded-full bg-[#F05A28] text-white flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Readiness / Cycle & Joint Safety Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Zap size={16} className="text-[#F05A28]" />
          <span>
            {isMale
              ? 'Thể lực hôm nay & Bảo vệ khớp'
              : 'Chu kỳ sinh lý & Bảo vệ vóc dáng nữ'}
          </span>
        </h3>

        {isMale ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {MALE_ENERGY_OPTIONS.map((opt) => {
                const selected = (draftProfile.maleEnergyLevel || 4) === opt.level;
                return (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => onUpdateProfileLive({ maleEnergyLevel: opt.level })}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#1E293B] border-[#1E293B] text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateProfileLive({ shoulderSafe: !draftProfile.shoulderSafe })
                }
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  draftProfile.shoulderSafe
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck size={14} />
                <span>Bảo vệ khớp vai trước</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateProfileLive({
                    protectLowerBackKnee: !draftProfile.protectLowerBackKnee,
                  })
                }
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  draftProfile.protectLowerBackKnee
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck size={14} />
                <span>Bảo vệ lưng dưới &amp; gối</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="femaleLastPeriod"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
              >
                <Calendar size={14} className="text-[#F05A28]" />
                <span>Ngày đầu kỳ:</span>
                <input
                  id="femaleLastPeriod"
                  type="date"
                  value={draftCycle.lastPeriodStartDate || ''}
                  onChange={(e) =>
                    onUpdateCycleLive({
                      lastPeriodStartDate: e.target.value,
                      manualPhaseOverride: 'auto',
                    })
                  }
                  className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
                />
              </label>

              {FEMALE_PHASE_OPTIONS.map((p) => {
                const selected = draftCycle.manualPhaseOverride === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onUpdateCycleLive({ manualPhaseOverride: p.id })}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#1E293B] text-white border-[#1E293B]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(GYM_SYMPTOM_META) as GymSymptomCode[]).map((code) => {
                const active = draftCycle.todaySymptoms.includes(code);
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => onToggleSymptom(code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {GYM_SYMPTOM_META[code].labelVi}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  onUpdateProfileLive({
                    avoidHeavyQuads: !draftProfile.avoidHeavyQuads,
                  })
                }
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  draftProfile.avoidHeavyQuads
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck size={13} />
                <span>Hạn chế to đùi trước</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateProfileLive({
                    protectLowerBackKnee: !draftProfile.protectLowerBackKnee,
                  })
                }
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  draftProfile.protectLowerBackKnee
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck size={13} />
                <span>Bảo vệ lưng &amp; gối</span>
              </button>
            </div>
          </div>
        )}

        {/* Experience Level + Submit CTA */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1">Kinh nghiệm:</span>
            {EXPERIENCE_OPTIONS.map((exp) => {
              const active = draftProfile.experienceLevel === exp.id;
              return (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() => onUpdateProfileLive({ experienceLevel: exp.id })}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#1E293B] text-white border-[#1E293B]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {exp.label}
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#F05A28] hover:bg-[#d94d1f] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles size={16} />
            <span>Lưu Hồ Sơ &amp; Cập Nhật Lộ Trình</span>
          </button>
        </div>
      </div>
    </form>
  );
}
