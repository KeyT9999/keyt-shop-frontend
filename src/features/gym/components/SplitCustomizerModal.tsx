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
import type { GymSplitDayConfig } from '../types/gym';
import { cloneDefaultSplitDays } from '../utils/gymStateUtils';

interface SplitCustomizerModalProps {
  open: boolean;
  currentDays: GymSplitDayConfig[];
  onClose: () => void;
  onSave: (days: GymSplitDayConfig[]) => void;
}

export default function SplitCustomizerModal({
  open,
  currentDays,
  onClose,
  onSave,
}: SplitCustomizerModalProps) {
  const [draftDays, setDraftDays] = useState<GymSplitDayConfig[]>(() =>
    currentDays.map((d) => ({ ...d, exerciseIds: [...d.exerciseIds] }))
  );
  const [editingDayIdx, setEditingDayIdx] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('Tất cả');

  if (!open) return null;

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
      id: `custom_day_${Date.now()}`,
      dayLabel: `Ngày ${nextNum}`,
      title: 'Nhóm cơ tự chọn',
      subtitle: 'Tùy chỉnh bài tập',
      exerciseIds: ['hammer_curl'],
    };
    setDraftDays((prev) => [...prev, newDay]);
    setEditingDayIdx(draftDays.length);
  };

  const handleRemoveDay = (idx: number) => {
    if (draftDays.length <= 2) return;
    const next = draftDays
      .filter((_, i) => i !== idx)
      .map((d, i) => ({ ...d, dayLabel: `Ngày ${i + 1}` }));
    setDraftDays(next);
    setEditingDayIdx(Math.max(0, Math.min(editingDayIdx, next.length - 1)));
  };

  const handleApplyPreset = (presetDays: GymSplitDayConfig[]) => {
    setDraftDays(presetDays.map((d) => ({ ...d, exerciseIds: [...d.exerciseIds] })));
    setEditingDayIdx(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Tùy chỉnh lịch tập 5 ngày"
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Tùy Chỉnh Lộ Trình &amp; Bài Tập Cá Nhân
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Giữ nguyên lịch 5 ngày mặc định của bạn hoặc đổi tên ngày, thêm/bớt các máy có sẵn ở phòng tập.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Quick Presets Row */}
          <div className="space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#F05A28]" />
              <span>Mẫu lịch tập gợi ý (1 chạm nạp nhanh)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GYM_SPLIT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.days)}
                  className="text-left p-3 rounded-2xl border border-slate-200 hover:border-[#F05A28] bg-slate-50/70 hover:bg-orange-50/40 transition-colors cursor-pointer"
                >
                  <div className="text-xs font-extrabold text-slate-900">{preset.name}</div>
                  <div className="text-xs text-slate-600 mt-0.5 leading-snug">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Day Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            {draftDays.map((day, idx) => (
              <button
                key={day.id}
                type="button"
                onClick={() => setEditingDayIdx(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  idx === editingDayIdx
                    ? 'bg-[#1E293B] text-white border-[#1E293B]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {day.dayLabel}: {day.title}
              </button>
            ))}

            {draftDays.length < 7 && (
              <button
                type="button"
                onClick={handleAddDay}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-dashed border-slate-300 text-slate-600 hover:border-[#F05A28] hover:text-[#F05A28] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Thêm ngày</span>
              </button>
            )}
          </div>

          {activeDay && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left: Day Info + Ordered Selected Exercises */}
              <div className="lg:col-span-6 space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase text-[#F05A28]">
                    Đang sửa {activeDay.dayLabel}
                  </span>
                  {draftDays.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDay(editingDayIdx)}
                      className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Xóa ngày này</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="dayTitleInput"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Tên nhóm cơ chính
                    </label>
                    <input
                      id="dayTitleInput"
                      type="text"
                      value={activeDay.title}
                      onChange={(e) => updateActiveDay({ title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#F05A28]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="daySubInput"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Ghi chú ngắn
                    </label>
                    <input
                      id="daySubInput"
                      type="text"
                      value={activeDay.subtitle}
                      onChange={(e) => updateActiveDay({ subtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#F05A28]"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <div className="text-xs font-bold text-slate-700 mb-2">
                    Thứ tự bài tập trong buổi ({activeDay.exerciseIds.length} bài)
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {activeDay.exerciseIds.map((exId, pos) => {
                      const ex = GYM_EXERCISE_MAP[exId];
                      if (!ex) return null;
                      return (
                        <div
                          key={exId}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {pos + 1}. {ex.name}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {ex.vietnameseName}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveExercise(pos, -1)}
                              disabled={pos === 0}
                              aria-label="Chuyển lên"
                              className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-600 cursor-pointer"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveExercise(pos, 1)}
                              disabled={pos === activeDay.exerciseIds.length - 1}
                              aria-label="Chuyển xuống"
                              className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-600 cursor-pointer"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleExerciseInDay(exId)}
                              aria-label="Gỡ bài tập"
                              className="p-1 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
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
              <div className="lg:col-span-6 space-y-3 rounded-2xl p-4 border border-slate-200 bg-white">
                <div className="text-xs font-extrabold uppercase text-slate-500">
                  Kho bài tập 3D (Bấm để thêm / gỡ khỏi {activeDay.dayLabel})
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        categoryFilter === cat
                          ? 'bg-[#F05A28] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                            ? 'bg-orange-50 border-[#F05A28]'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {item.name} – {item.vietnameseName}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {item.categoryLabel} • {item.machineName}
                          </div>
                        </div>
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            selected
                              ? 'bg-[#F05A28] text-white'
                              : 'border border-slate-300 text-slate-400'
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
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleApplyPreset(cloneDefaultSplitDays())}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Khôi phục 5 ngày gốc</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(draftDays);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-[#F05A28] hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Lưu Lộ Trình Tập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
