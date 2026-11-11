import { useMemo, useState } from 'react';
import {
  Activity,
  Award,
  CalendarCheck2,
  Check,
  Dumbbell,
  Flame,
  PlusCircle,
  Scale,
  Sparkles,
  TrendingUp,
  Trophy,
  Utensils,
  X,
} from 'lucide-react';
import { GYM_EXERCISE_MAP } from '../data/defaultGymCatalog';
import type {
  GymBodyMetricEntry,
  GymExerciseUserLog,
  GymFemaleBodyProfile,
  GymGenderMode,
  GymWorkoutHistoryEntry,
} from '../types/gym';
import { computeEstimated1RM } from '../utils/gymCycleAndProgressionUtils';

interface GymProgressHistoryModalProps {
  open: boolean;
  mode?: 'modal' | 'inline';
  gender: GymGenderMode;
  workoutStreak: number;
  userProfile: GymFemaleBodyProfile;
  exerciseLogs: Record<string, GymExerciseUserLog>;
  workoutHistory?: GymWorkoutHistoryEntry[];
  bodyMetricsHistory?: GymBodyMetricEntry[];
  celebrationSession?: GymWorkoutHistoryEntry | null;
  onRecordTodayBodyMetrics: () => void;
  onClose?: () => void;
}

export default function GymProgressHistoryModal({
  open,
  mode = 'modal',
  gender,
  workoutStreak,
  userProfile,
  exerciseLogs,
  workoutHistory = [],
  bodyMetricsHistory = [],
  celebrationSession = null,
  onRecordTodayBodyMetrics,
  onClose,
}: GymProgressHistoryModalProps) {
  const [recordedJustNow, setRecordedJustNow] = useState<boolean>(false);

  const isMale = gender === 'male';

  const prItems = useMemo(() => {
    return Object.values(exerciseLogs)
      .map((log) => {
        const prKg = Math.max(log.personalRecordKg || 0, log.weightKg || 0);
        const est1RM = log.estimated1RM || computeEstimated1RM(prKg, 10);
        const ex = GYM_EXERCISE_MAP[log.exerciseId];
        return {
          exerciseId: log.exerciseId,
          vietnameseName: ex?.vietnameseName || log.exerciseId,
          machineName: ex?.machineName || '',
          prKg,
          est1RM,
          seatPin: log.seatPinNote || log.personalTip || '',
        };
      })
      .filter((item) => item.prKg > 0)
      .sort((a, b) => b.prKg - a.prKg);
  }, [exerciseLogs]);

  const totalVolumeAllTime = useMemo(
    () =>
      workoutHistory.reduce((sum, item) => sum + (item.totalVolumeKg || 0), 0),
    [workoutHistory]
  );

  const genderMetricsHistory = useMemo(
    () =>
      bodyMetricsHistory
        .filter((m) => m.gender === gender)
        .slice()
        .sort((a, b) => b.dateKey.localeCompare(a.dateKey)),
    [bodyMetricsHistory, gender]
  );

  if (mode === 'modal' && !open) return null;

  const handleRecordMetrics = () => {
    onRecordTodayBodyMetrics();
    setRecordedJustNow(true);
    window.setTimeout(() => setRecordedJustNow(false), 1800);
  };

  const progressBodyContent = (
    <div className="space-y-4">
      {/* Celebration Banner after completing a workout session */}
      {celebrationSession && (
        <div className="rounded-3xl bg-emerald-50/90 border border-emerald-200 p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-emerald-600 shrink-0" />
              <span className="text-sm sm:text-base font-extrabold text-emerald-900">
                Hoàn Thành Xuất Sắc: {celebrationSession.dayTitle}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold tabular-nums">
              +{celebrationSession.totalVolumeKg.toLocaleString('vi-VN')} kg Volume
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="rounded-2xl bg-white p-3 border border-emerald-200/80">
              <div className="text-slate-500 font-semibold">Thời lượng</div>
              <div className="text-sm sm:text-base font-black text-slate-900 tabular-nums">
                {celebrationSession.durationMinutes} phút
              </div>
            </div>
            <div className="rounded-2xl bg-white p-3 border border-emerald-200/80">
              <div className="text-slate-500 font-semibold">Tiêu hao</div>
              <div className="text-sm sm:text-base font-black text-[#F05A28] tabular-nums">
                ~{celebrationSession.caloriesBurned} kcal
              </div>
            </div>
            <div className="rounded-2xl bg-white p-3 border border-emerald-200/80">
              <div className="text-slate-500 font-semibold">Số bài xong</div>
              <div className="text-sm sm:text-base font-black text-emerald-700 tabular-nums">
                {celebrationSession.completedExercisesCount} bài
              </div>
            </div>
          </div>

          {celebrationSession.prHighlights.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1">
                <Sparkles size={13} /> Kỷ lục hôm nay:
              </span>
              {celebrationSession.prHighlights.map((pr, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-white border border-emerald-300 text-xs font-bold text-emerald-800"
                >
                  {pr}
                </span>
              ))}
            </div>
          )}

          <div className="rounded-2xl bg-white border border-emerald-200/80 px-3.5 py-2.5 text-xs text-slate-700 flex items-start gap-2">
            <Utensils size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-900">Bữa phục hồi sau tập 45–60 phút:</strong>{' '}
              {isMale
                ? 'Nạp 35–40g Protein + Carb sạch (VD: 180g ức gà/thăn bò + 1.5 chén cơm trắng hoặc phở bò tái nạc).'
                : 'Nạp 25–30g Protein + Carb phức (VD: 130g cá hồi/ức gà + 1/2 củ khoai lang + rau xanh để phục hồi vòng 3 không tích mỡ eo).'}
            </span>
          </div>
        </div>
      )}

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Flame size={14} className="text-[#F05A28]" /> Chuỗi tập (Streak)
          </div>
          <div className="text-xl font-black text-slate-900 mt-1 tabular-nums">
            {workoutStreak} buổi
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <CalendarCheck2 size={14} className="text-emerald-600" /> Đã hoàn thành
          </div>
          <div className="text-xl font-black text-slate-900 mt-1 tabular-nums">
            {workoutHistory.length} buổi
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Dumbbell size={14} className="text-sky-600" /> Tổng Volume
          </div>
          <div className="text-xl font-black text-slate-900 mt-1 tabular-nums">
            {totalVolumeAllTime.toLocaleString('vi-VN')} kg
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-500" /> Bài có PR
          </div>
          <div className="text-xl font-black text-slate-900 mt-1 tabular-nums">
            {prItems.length} bài
          </div>
        </div>
      </div>

      {/* Personal Records & 1RM Section */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <TrendingUp size={16} className="text-[#F05A28]" />
          <span>Kỷ lục cá nhân (PR &amp; Sức tối đa 1RM ước tính)</span>
        </div>

        {prItems.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-xs text-slate-600 leading-relaxed">
            Chưa có mức tạ nào được lưu. Khi tập ở tab <strong className="text-slate-900">Tập Hôm Nay</strong>, hãy bấm <strong className="text-slate-900">+ / - kg</strong> hoặc tích vào từng <strong className="text-slate-900">Hiệp 1, 2, 3</strong> để hệ thống tự động ghi kỷ lục PR!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {prItems.slice(0, 8).map((item) => (
              <div
                key={item.exerciseId}
                className="rounded-2xl bg-slate-50/80 border border-slate-200/80 px-3.5 py-3 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {item.vietnameseName}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {item.seatPin
                      ? `Ghi nhớ máy: ${item.seatPin}`
                      : item.machineName}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-extrabold text-[#F05A28] tabular-nums">
                    PR {item.prKg}kg
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 tabular-nums">
                    1RM ~{item.est1RM}kg
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Body Metrics Timeline */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Scale size={16} className="text-[#F05A28]" />
            <span>Nhật ký số đo cơ thể theo tuần</span>
          </div>
          <button
            type="button"
            onClick={handleRecordMetrics}
            className="px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {recordedJustNow ? <Check size={14} /> : <PlusCircle size={14} />}
            <span>
              {recordedJustNow
                ? 'Đã lưu mốc hôm nay!'
                : 'Lưu mốc cân đo hôm nay'}
            </span>
          </button>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2.5">
          <div className="text-xs text-slate-700 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-500">Số đo hiện tại:</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-900">
              Cân nặng: {userProfile.weightKg}kg
            </span>
            {isMale ? (
              <>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-900">
                  Ngực: {userProfile.chestCm ?? 96}cm
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-900">
                  Bụng: {userProfile.waistCm}cm
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-900">
                  Tay: {userProfile.armCm ?? 35}cm
                </span>
              </>
            ) : (
              <>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-900">
                  Eo V2: {userProfile.waistCm}cm
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-900">
                  Mông V3: {userProfile.hipCm}cm
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 font-bold text-emerald-700">
                  WHR:{' '}
                  {(
                    (userProfile.waistCm || 63) /
                    Math.max(55, userProfile.hipCm || 92)
                  ).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {genderMetricsHistory.length > 0 && (
            <div className="pt-2.5 border-t border-slate-200/80 space-y-1.5">
              {genderMetricsHistory.slice(0, 5).map((entry) => (
                <div
                  key={`${entry.dateKey}_${entry.gender}`}
                  className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-white border border-slate-200/70 px-3 py-2 rounded-xl"
                >
                  <span className="font-semibold text-slate-500">
                    {entry.dateKey}
                  </span>
                  <span className="font-bold text-slate-900">
                    {isMale
                      ? `${entry.weightKg}kg • Ngực ${entry.chestCm}cm • Bụng ${entry.waistCm}cm • Tay ${entry.armCm}cm`
                      : `${entry.weightKg}kg • Eo ${entry.waistCm}cm • Mông ${entry.hipCm}cm`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Workout Session History */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Activity size={16} className="text-emerald-600" />
          <span>Lịch sử buổi tập gần đây</span>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-xs text-slate-600">
            Bấm <strong className="text-slate-900">Hoàn thành buổi tập</strong> sau khi tập xong bài cuối để ghi lại lịch sử Volume &amp; Calo đốt cháy.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {workoutHistory.slice(0, 12).map((session) => (
              <div
                key={session.id}
                className="rounded-2xl bg-slate-50/80 border border-slate-200/80 px-3.5 py-3 flex flex-wrap items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                    <span>{session.dayTitle}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        session.gender === 'male'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {session.gender === 'male' ? 'Nam' : 'Nữ'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {session.dateKey} • {session.durationMinutes} phút •{' '}
                    {session.completedExercisesCount} bài • ~{session.caloriesBurned} kcal
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-extrabold text-emerald-700 tabular-nums">
                    {session.totalVolumeKg.toLocaleString('vi-VN')} kg
                  </div>
                  {session.prCount > 0 && (
                    <div className="text-[11px] font-bold text-[#F05A28]">
                      {session.prCount} kỷ lục PR
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (mode === 'inline') {
    return progressBodyContent;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Tiến độ tập luyện, kỷ lục PR và lịch sử số đo"
    >
      <div className="bg-slate-50 border border-slate-200 rounded-3xl text-slate-900 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-50 border border-orange-200 text-[#F05A28] flex items-center justify-center shrink-0">
              <Trophy size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Tiến Độ &amp; Kỷ Lục PR ({isMale ? 'Gym Nam' : 'Gym Nữ'})
              </h2>
              <p className="text-xs text-slate-500">
                Smart Streak giữ chuỗi thông minh cả khi nghỉ phục hồi cơ 1–3 ngày
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng bảng tiến độ"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {progressBodyContent}
        </div>

        {/* Footer */}
        {onClose && (
          <div className="px-5 py-3 bg-white border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
