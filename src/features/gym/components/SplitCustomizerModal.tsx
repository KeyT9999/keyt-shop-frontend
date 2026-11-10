import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  GYM_EXERCISE_CATALOG,
  GYM_EXERCISE_MAP,
  GYM_SPLIT_PRESETS,
} from '../data/defaultGymCatalog';
import type { GymGenderMode, GymSplitDayConfig } from '../types/gym';
import { cloneDefaultSplitDays } from '../utils/gymStateUtils';

interface SplitCustomizerModalProps {
  open: boolean;
  gender?: GymGenderMode;
  currentDays: GymSplitDayConfig[];
  recommendedDefaultDays?: GymSplitDayConfig[];
  onClose: () => void;
  onSave: (days: GymSplitDayConfig[]) => void;
}

export default function SplitCustomizerModal({
  open,
  gender = 'female',
  currentDays,
  recommendedDefaultDays,
  onClose,
  onSave,
}: SplitCustomizerModalProps) {
  const [draftDays, setDraftDays] = useState<GymSplitDayConfig[]>(() =>
    currentDays.map((d) => ({ ...d, exerciseIds: [...d.exerciseIds] }))
  );
  const [editingDayIdx, setEditingDayIdx] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('Tất cả');

  if (!open) return null;

  const isMale = gender === 'male';
  const accentText = isMale ? 'text-[#5CE1E6]' : 'text-[#FF5C8A]';
  const accentBtn = isMale
    ? 'bg-[#5CE1E6] hover:bg-[#47d2d8] text-[#111114]'
    : 'bg-[#FF5C8A] hover:bg-[#ff4278] text-[#111114]';
  const accentSelectedCard = isMale
    ? 'bg-[#5CE1E6]/15 border-[#5CE1E6] text-[#F7F7F7]'
    : 'bg-[#FF5C8A]/15 border-[#FF5C8A] text-[#F7F7F7]';

  const activeDay = draftDays[editingDayIdx] || draftDays[0];
  const categories = [
    'Tất cả',
    ...Array.from(new Set(GYM_EXERCISE_CATALOG.map((e) => e.categoryLabel))),
  ];

  const filteredCatalog =
    categoryFilter === 'Tất cả'
      ? GYM_EXERCISE_CATALOG
      : GYM_EXERCISE_CATALOG.filter((e) => e.categoryLabel === categoryFilter);

  const updateActiveDay = (patch: Partial<GymSplitDayConfig>) => {
    setDraftDays((prev) =>
      prev.map((d, idx) => (idx === editingDayIdx ? { ...d, ...patch } : d))
    );
  };

  const handleToggleExerciseInDay = (exerciseId: string) => {
    if (!activeDay) return;
    const exists = activeDay.exerciseIds.includes(exerciseId);
    const nextIds = exists
      ? activeDay.exerciseIds.filter((id) => id !== exerciseId)
      : [...activeDay.exerciseIds, exerciseId];
    updateActiveDay({ exerciseIds: nextIds });
  };

  const handleMoveExercise = (pos: number, delta: -1 | 1) => {
    if (!activeDay) return;
    const target = pos + delta;
    if (target < 0 || target >= activeDay.exerciseIds.length) return;
    const nextIds = [...activeDay.exerciseIds];
    const [picked] = nextIds.splice(pos, 1);
    nextIds.splice(target, 0, picked);
    updateActiveDay({ exerciseIds: nextIds });
  };

  const handleAddDay = () => {
    if (draftDays.length >= 7) return;
    const nextNum = draftDays.length + 1;
    const newDay: GymSplitDayConfig = {
      id: `${isMale ? 'm' : 'f'}_custom_day_${Date.now()}`,
      dayLabel: `Buổi ${nextNum}`,
      title: 'Nhóm cơ tự chọn',
      subtitle: 'Tùy chỉnh bài tập',
      exerciseIds: [isMale ? 'brtw_incline_chest_press' : 'machine_hip_thrust'],
    };
    setDraftDays((prev) => [...prev, newDay]);
    setEditingDayIdx(draftDays.length);
  };

  const handleRemoveDay = (idx: number) => {
    if (draftDays.length <= 2) return;
    const next = draftDays
      .filter((_, i) => i !== idx)
      .map((d, i) => ({ ...d, dayLabel: `Buổi ${i + 1}` }));
    setDraftDays(next);
    setEditingDayIdx(Math.max(0, Math.min(editingDayIdx, next.length - 1)));
  };

  const handleApplyPreset = (presetDays: GymSplitDayConfig[]) => {
    setDraftDays(presetDays.map((d) => ({ ...d, exerciseIds: [...d.exerciseIds] })));
    setEditingDayIdx(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Tùy chỉnh lịch tập cá nhân"
    >
      <div className="bg-[#16161C] rounded-3xl border border-[#2C2C38] text-[#F7F7F7] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#272732] bg-[#111114] flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#F7F7F7]">
              Tùy Chỉnh Lộ Trình &amp; Bài Tập Cá Nhân ({isMale ? 'Gym Nam' : 'Gym Nữ'})
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Đổi tên buổi, sắp xếp thứ tự bài tập hoặc thêm/bớt các máy BRTW &amp; Impulse có sẵn ở phòng tập.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#24242F] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Quick Presets Row */}
          <div className="space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles size={14} className={accentText} />
              <span>Mẫu lịch tập gợi ý (1 chạm nạp nhanh)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recommendedDefaultDays && recommendedDefaultDays.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleApplyPreset(recommendedDefaultDays)}
                  className="text-left p-3 rounded-2xl border border-[#A3F77B]/40 hover:border-[#A3F77B] bg-[#A3F77B]/10 transition-colors cursor-pointer"
                >
                  <div className="text-xs font-black text-[#A3F77B]">
                    Phác Đồ Chuẩn Theo Số Đo Vừa Nhập ({recommendedDefaultDays.length} buổi)
                  </div>
                  <div className="text-xs text-zinc-300 mt-0.5 leading-snug">
                    Khôi phục đúng danh sách buổi tập AI đề xuất riêng cho thể trạng {isMale ? 'Nam' : 'Nữ'} của bạn.
                  </div>
                </button>
              )}

              {GYM_SPLIT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.days)}
                  className="text-left p-3 rounded-2xl border border-[#2A2A36] hover:border-zinc-400 bg-[#111114] transition-colors cursor-pointer"
                >
                  <div className="text-xs font-black text-[#F7F7F7]">{preset.name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5 leading-snug">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Day Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-t border-[#262632] pt-4">
            {draftDays.map((day, idx) => (
              <button
                key={day.id}
                type="button"
                onClick={() => setEditingDayIdx(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-black border transition-colors cursor-pointer ${
                  idx === editingDayIdx
                    ? isMale
                      ? 'bg-[#5CE1E6] text-[#111114] border-[#5CE1E6]'
                      : 'bg-[#FF5C8A] text-[#111114] border-[#FF5C8A]'
                    : 'bg-[#111114] text-zinc-300 border-[#2A2A36] hover:border-zinc-500'
                }`}
              >
                {day.dayLabel}: {day.title}
              </button>
            ))}

            {draftDays.length < 7 && (
              <button
                type="button"
                onClick={handleAddDay}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-dashed border-[#383848] text-zinc-300 hover:border-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Thêm buổi</span>
              </button>
            )}
          </div>

          {activeDay && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left: Day Info + Ordered Selected Exercises */}
              <div className="lg:col-span-6 space-y-3 bg-[#111114] rounded-2xl p-4 border border-[#272732]">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-black uppercase ${accentText}`}>
                    Đang sửa {activeDay.dayLabel}
                  </span>
                  {draftDays.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDay(editingDayIdx)}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Xóa buổi này</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="dayTitleInput"
                      className="block text-xs font-bold text-zinc-400 mb-1"
                    >
                      Tên nhóm cơ chính
                    </label>
                    <input
                      id="dayTitleInput"
                      type="text"
                      value={activeDay.title}
                      onChange={(e) => updateActiveDay({ title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-sm font-bold text-[#F7F7F7] focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="daySubInput"
                      className="block text-xs font-bold text-zinc-400 mb-1"
                    >
                      Ghi chú ngắn
                    </label>
                    <input
                      id="daySubInput"
                      type="text"
                      value={activeDay.subtitle}
                      onChange={(e) => updateActiveDay({ subtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-sm text-zinc-200 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <div className="text-xs font-bold text-zinc-400 mb-2">
                    Thứ tự bài tập trong buổi ({activeDay.exerciseIds.length} bài)
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {activeDay.exerciseIds.map((exId, pos) => {
                      const ex = GYM_EXERCISE_MAP[exId];
                      if (!ex) return null;
                      return (
                        <div
                          key={exId}
                          className="p-2.5 rounded-xl bg-[#191922] border border-[#292938] flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-black text-[#F7F7F7] truncate">
                              {pos + 1}. {ex.vietnameseName}
                            </div>
                            <div className="text-[11px] text-zinc-400 truncate">
                              {ex.name} • {ex.machineName}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveExercise(pos, -1)}
                              disabled={pos === 0}
                              aria-label="Chuyển lên"
                              className="p-1.5 rounded-lg hover:bg-[#262634] disabled:opacity-30 text-zinc-300 cursor-pointer"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveExercise(pos, 1)}
                              disabled={pos === activeDay.exerciseIds.length - 1}
                              aria-label="Chuyển xuống"
                              className="p-1.5 rounded-lg hover:bg-[#262634] disabled:opacity-30 text-zinc-300 cursor-pointer"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleExerciseInDay(exId)}
                              aria-label="Gỡ bài tập"
                              className="p-1.5 rounded-lg hover:bg-rose-500/15 text-rose-400 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Exercise Library Picker */}
              <div className="lg:col-span-6 space-y-3 rounded-2xl p-4 border border-[#272732] bg-[#111114]">
                <div className="text-xs font-extrabold uppercase text-zinc-400">
                  Kho 38 Máy &amp; Bài Tập 3D (Bấm để thêm / gỡ khỏi {activeDay.dayLabel})
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-extrabold transition-colors cursor-pointer ${
                        categoryFilter === cat
                          ? accentBtn
                          : 'bg-[#1B1B22] text-zinc-300 border border-[#2E2E3A] hover:border-zinc-500'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {filteredCatalog.map((item) => {
                    const selected = activeDay.exerciseIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleExerciseInDay(item.id)}
                        className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          selected
                            ? accentSelectedCard
                            : 'bg-[#191922] border-[#292938] hover:border-zinc-500'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-black text-[#F7F7F7] truncate">
                            {item.vietnameseName}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">
                            {item.categoryLabel} • {item.machineName}
                          </div>
                        </div>
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            selected
                              ? accentBtn
                              : 'border border-[#383848] text-zinc-400'
                          }`}
                        >
                          {selected ? <Check size={14} /> : <Plus size={14} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-[#111114] border-t border-[#272732] flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() =>
              handleApplyPreset(
                recommendedDefaultDays && recommendedDefaultDays.length > 0
                  ? recommendedDefaultDays
                  : cloneDefaultSplitDays()
              )
            }
            className="px-3 py-2 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] hover:bg-[#252530] text-xs font-bold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Khôi phục lộ trình chuẩn</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] hover:bg-[#252530] text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(draftDays);
                onClose();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer ${accentBtn}`}
            >
              Lưu Lộ Trình Tập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
