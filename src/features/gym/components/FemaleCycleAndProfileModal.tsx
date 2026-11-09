import { useState } from 'react';
import {
  Check,
  Flame,
  HeartPulse,
  ShieldAlert,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { GYM_SPLIT_PRESETS } from '../data/defaultGymCatalog';
import type {
  GymCycleTrackingState,
  GymFemaleBodyProfile,
  GymManualPhaseOverride,
  GymPrimaryGoal,
  GymSplitDayConfig,
  GymSymptomCode,
} from '../types/gym';
import {
  GYM_PRIMARY_GOAL_META,
  GYM_SYMPTOM_META,
} from '../utils/gymCycleAndProgressionUtils';

interface FemaleCycleAndProfileModalProps {
  open: boolean;
  userProfile: GymFemaleBodyProfile;
  cycleTracking: GymCycleTrackingState;
  onClose: () => void;
  onSaveProfile: (patch: Partial<GymFemaleBodyProfile>) => void;
  onSaveCycle: (patch: Partial<GymCycleTrackingState>) => void;
  onApplyPresetDays: (days: GymSplitDayConfig[]) => void;
}

const PHASE_OPTIONS: {
  id: GymManualPhaseOverride;
  title: string;
  desc: string;
}[] = [
  {
    id: 'auto',
    title: 'Tự động tính theo ngày kinh',
    desc: 'Dự đoán pha dựa trên ngày bắt đầu kỳ gần nhất',
  },
  {
    id: 'menstrual',
    title: 'Kỳ Dâu (Hành Kinh • Ngày 1–5)',
    desc: 'Tự động Deload giảm 15–20% tạ & cảnh báo bài nén bụng/lưng',
  },
  {
    id: 'follicular',
    title: 'Pha Nang Trứng (Ngày 6–13)',
    desc: 'Năng lượng dồi dào, phục hồi nhanh — Thời điểm vàng độ mông',
  },
  {
    id: 'ovulatory',
    title: 'Pha Rụng Trứng (Ngày 14–16)',
    desc: 'Đỉnh sức mạnh trong tháng — Gợi ý tăng nhẹ mức tạ +2.5kg',
  },
  {
    id: 'luteal',
    title: 'Pha Hoàng Thể / PMS (Ngày 17–28)',
    desc: 'Dễ giữ nước & mỏi cơ — Ưu tiên tạ vừa phải 12–15 lần',
  },
];

export default function FemaleCycleAndProfileModal({
  open,
  userProfile,
  cycleTracking,
  onClose,
  onSaveProfile,
  onSaveCycle,
  onApplyPresetDays,
}: FemaleCycleAndProfileModalProps) {
  const [draftProfile, setDraftProfile] = useState<GymFemaleBodyProfile>(userProfile);
  const [draftCycle, setDraftCycle] = useState<GymCycleTrackingState>(cycleTracking);
  const [appliedPresetNotice, setAppliedPresetNotice] = useState<string>('');

  if (!open) return null;

  const toggleSymptom = (code: GymSymptomCode) => {
    setDraftCycle((prev) => {
      const exists = prev.todaySymptoms.includes(code);
      const next = exists
        ? prev.todaySymptoms.filter((s) => s !== code)
        : [...prev.todaySymptoms, code];
      return { ...prev, todaySymptoms: next };
    });
  };

  const handleSaveAll = () => {
    onSaveProfile(draftProfile);
    onSaveCycle(draftCycle);
    onClose();
  };

  const handleQuickApplyFemalePreset = (presetId: string, label: string) => {
    const found = GYM_SPLIT_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    onApplyPresetDays(found.days);
    setAppliedPresetNotice(`Đã nạp "${label}" vào lịch 5 ngày của bạn!`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Hồ sơ thể trạng nữ và Chu kỳ kinh nguyệt"
    >
      <div className="bg-[#16161C] border border-[#2C2C38] rounded-3xl text-[#F7F7F7] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#272732] flex items-center justify-between gap-3 bg-[#111114]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FF5C8A]/15 border border-[#FF5C8A]/40 text-[#FF5C8A] flex items-center justify-center">
              <HeartPulse size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#F7F7F7]">
                Hồ Sơ Thể Trạng Nữ &amp; Chu Kỳ Tập Luyện
              </h2>
              <p className="text-xs text-zinc-400">
                Thông tin này giúp hệ thống tự chỉnh mức tạ và giúp AI Coach hiểu rõ cơ thể bạn.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hồ sơ"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#24242F] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Section 1: Body Metrics */}
          <div className="rounded-2xl bg-[#111114] border border-[#272732] p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FF5C8A]">
              <User size={14} />
              <span>1. Chỉ Số Cơ Thể &amp; Mục Tiêu Nữ Giới</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="gymProfileNickname"
                  className="block text-xs font-bold text-zinc-400 mb-1"
                >
                  Tên / Biệt danh
                </label>
                <input
                  id="gymProfileNickname"
                  type="text"
                  value={draftProfile.nickname}
                  onChange={(e) =>
                    setDraftProfile((p) => ({ ...p, nickname: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
                />
              </div>

              <div>
                <label
                  htmlFor="gymProfileHeight"
                  className="block text-xs font-bold text-zinc-400 mb-1"
                >
                  Chiều cao (cm)
                </label>
                <input
                  id="gymProfileHeight"
                  type="number"
                  min={120}
                  max={210}
                  value={draftProfile.heightCm}
                  onChange={(e) =>
                    setDraftProfile((p) => ({
                      ...p,
                      heightCm: Number(e.target.value) || 160,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
                />
              </div>

              <div>
                <label
                  htmlFor="gymProfileWeight"
                  className="block text-xs font-bold text-zinc-400 mb-1"
                >
                  Cân nặng (kg)
                </label>
                <input
                  id="gymProfileWeight"
                  type="number"
                  min={35}
                  max={150}
                  step="0.5"
                  value={draftProfile.weightKg}
                  onChange={(e) =>
                    setDraftProfile((p) => ({
                      ...p,
                      weightKg: Number(e.target.value) || 50,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
                />
              </div>

              <div>
                <label
                  htmlFor="gymProfileWaist"
                  className="block text-xs font-bold text-zinc-400 mb-1"
                >
                  Vòng eo V2 (cm)
                </label>
                <input
                  id="gymProfileWaist"
                  type="number"
                  min={45}
                  max={130}
                  value={draftProfile.waistCm}
                  onChange={(e) =>
                    setDraftProfile((p) => ({
                      ...p,
                      waistCm: Number(e.target.value) || 63,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
                />
              </div>

              <div>
                <label
                  htmlFor="gymProfileHip"
                  className="block text-xs font-bold text-zinc-400 mb-1"
                >
                  Vòng mông V3 (cm)
                </label>
                <input
                  id="gymProfileHip"
                  type="number"
                  min={60}
                  max={150}
                  value={draftProfile.hipCm}
                  onChange={(e) =>
                    setDraftProfile((p) => ({
                      ...p,
                      hipCm: Number(e.target.value) || 92,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
                />
              </div>

              <div>
                <label
                  htmlFor="gymProfileAge"
                  className="block text-xs font-bold text-zinc-400 mb-1"
                >
                  Tuổi
                </label>
                <input
                  id="gymProfileAge"
                  type="number"
                  min={14}
                  max={80}
                  value={draftProfile.age}
                  onChange={(e) =>
                    setDraftProfile((p) => ({
                      ...p,
                      age: Number(e.target.value) || 23,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
                />
              </div>
            </div>

            {/* Primary Goal Selector */}
            <div className="space-y-1.5 pt-1">
              <div className="text-xs font-bold text-zinc-400">
                Mục tiêu hình thể ưu tiên
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(GYM_PRIMARY_GOAL_META) as GymPrimaryGoal[]).map((goalKey) => {
                  const meta = GYM_PRIMARY_GOAL_META[goalKey];
                  const selected = draftProfile.primaryGoal === goalKey;
                  return (
                    <button
                      key={goalKey}
                      type="button"
                      onClick={() =>
                        setDraftProfile((p) => ({ ...p, primaryGoal: goalKey }))
                      }
                      className={`text-left p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#FF5C8A]/15 border-[#FF5C8A] text-[#F7F7F7]'
                          : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      <div className="text-xs font-extrabold flex items-center justify-between">
                        <span>{meta.labelVi}</span>
                        {selected && <Check size={14} className="text-[#FF5C8A]" />}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{meta.descVi}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Female Biomechanics Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  setDraftProfile((p) => ({
                    ...p,
                    avoidHeavyQuads: !p.avoidHeavyQuads,
                  }))
                }
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 cursor-pointer ${
                  draftProfile.avoidHeavyQuads
                    ? 'bg-[#A3F77B]/15 border-[#A3F77B] text-[#F7F7F7]'
                    : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-400'
                }`}
              >
                <span className="text-xs font-bold">
                  Ưu tiên ăn vào Mông • Hạn chế to đùi trước
                </span>
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    draftProfile.avoidHeavyQuads
                      ? 'bg-[#A3F77B] text-[#111114]'
                      : 'border border-zinc-600'
                  }`}
                >
                  {draftProfile.avoidHeavyQuads && <Check size={13} />}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setDraftProfile((p) => ({
                    ...p,
                    protectLowerBackKnee: !p.protectLowerBackKnee,
                  }))
                }
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 cursor-pointer ${
                  draftProfile.protectLowerBackKnee
                    ? 'bg-[#7CE7FF]/15 border-[#7CE7FF] text-[#F7F7F7]'
                    : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-400'
                }`}
              >
                <span className="text-xs font-bold">
                  Bảo vệ lưng dưới &amp; khớp gối (Tránh nén nặng)
                </span>
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    draftProfile.protectLowerBackKnee
                      ? 'bg-[#7CE7FF] text-[#111114]'
                      : 'border border-zinc-600'
                  }`}
                >
                  {draftProfile.protectLowerBackKnee && <Check size={13} />}
                </span>
              </button>
            </div>

            <div>
              <label
                htmlFor="gymProfileNotes"
                className="block text-xs font-bold text-zinc-400 mb-1"
              >
                Ghi chú riêng cho AI Coach (chấn thương, thói quen ăn uống, lịch bận...)
              </label>
              <input
                id="gymProfileNotes"
                type="text"
                placeholder="VD: Hay mỏi cổ vai gáy, muốn tăng vòng 3 lên 95cm, dị ứng hải sản..."
                value={draftProfile.personalNotes}
                onChange={(e) =>
                  setDraftProfile((p) => ({ ...p, personalNotes: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
              />
            </div>
          </div>

          {/* Section 2: Menstrual Cycle & Today's Energy */}
          <div className="rounded-2xl bg-[#111114] border border-[#272732] p-4 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FF5C8A]">
                <Flame size={14} />
                <span>2. Theo Dõi Chu Kỳ &amp; Năng Lượng Hôm Nay</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-semibold">
                Tự động điều chỉnh mức tạ gợi ý
              </span>
            </div>

            {/* Phase Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PHASE_OPTIONS.map((opt) => {
                const selected = draftCycle.manualPhaseOverride === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setDraftCycle((c) => ({ ...c, manualPhaseOverride: opt.id }))
                    }
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#FF5C8A]/18 border-[#FF5C8A] text-[#F7F7F7]'
                        : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    <div className="text-xs font-extrabold flex items-center justify-between">
                      <span>{opt.title}</span>
                      {selected && <Check size={14} className="text-[#FF5C8A]" />}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Energy Level 1-5 + Period Start Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div className="text-xs font-bold text-zinc-400 mb-1.5">
                  Mức năng lượng hôm nay ({draftCycle.todayEnergyLevel}/5)
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {([1, 2, 3, 4, 5] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() =>
                        setDraftCycle((c) => ({ ...c, todayEnergyLevel: lvl }))
                      }
                      className={`py-2 rounded-xl text-xs font-black border transition-colors cursor-pointer ${
                        draftCycle.todayEnergyLevel === lvl
                          ? 'bg-[#FF5C8A] border-[#FF5C8A] text-[#111114]'
                          : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastPeriodDateInput"
                  className="block text-xs font-bold text-zinc-400 mb-1.5"
                >
                  Ngày bắt đầu kỳ kinh gần nhất (tùy chọn)
                </label>
                <input
                  id="lastPeriodDateInput"
                  type="date"
                  value={draftCycle.lastPeriodStartDate}
                  onChange={(e) =>
                    setDraftCycle((c) => ({
                      ...c,
                      lastPeriodStartDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-xs font-bold text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
                />
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <div className="text-xs font-bold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <ShieldAlert size={13} className="text-[#FF5C8A]" />
                <span>Triệu chứng hôm nay (Bấm chọn để giảm tải bài tập tương ứng)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(GYM_SYMPTOM_META) as GymSymptomCode[]).map((code) => {
                  const active = draftCycle.todaySymptoms.includes(code);
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleSymptom(code)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#FF5C8A] border-[#FF5C8A] text-[#111114]'
                          : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      {GYM_SYMPTOM_META[code].labelVi}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: 1-Tap Female Workout Split Presets */}
          <div className="rounded-2xl bg-[#111114] border border-[#272732] p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#A3F77B]">
              <Sparkles size={14} />
              <span>3. Nạp Nhanh Lịch Tập Thiết Kế Riêng Cho Nữ</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickApplyFemalePreset(
                    'female_glute_sculpt_5day',
                    'Lịch Nữ Độ Mông Đào S-Line'
                  )
                }
                className="p-3 rounded-2xl bg-[#1B1B22] hover:bg-[#24242F] border border-[#FF5C8A]/50 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-black text-[#FF5C8A]">
                  Nạp Lịch Độ Mông Đào S-Line (5 Ngày)
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Tập trung Hip Thrust, Mở mông, RDL &amp; Lưng V-Taper giúp eo nhỏ mông cong.
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickApplyFemalePreset(
                    'female_period_gentle_5day',
                    'Chế Độ Nhẹ Nhàng Ngày Đèn Đỏ'
                  )
                }
                className="p-3 rounded-2xl bg-[#1B1B22] hover:bg-[#24242F] border border-[#A3F77B]/50 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-black text-[#A3F77B]">
                  Nạp Lịch Nhẹ Nhàng Ngày Đèn Đỏ
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Không nén cột sống/ổ bụng, ưu tiên giãn cơ mở hông và cô lập mông nhẹ.
                </div>
              </button>
            </div>
            {appliedPresetNotice && (
              <div className="text-xs font-bold text-[#A3F77B]">
                {appliedPresetNotice}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#111114] border-t border-[#272732] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] hover:bg-[#252530] text-xs font-bold text-zinc-300 cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-xl bg-[#FF5C8A] hover:bg-[#ff4278] text-[#111114] text-xs font-black shadow-lg shadow-[#FF5C8A]/25 cursor-pointer"
          >
            Lưu Hồ Sơ &amp; Áp Dụng Ngay
          </button>
        </div>
      </div>
    </div>
  );
}
