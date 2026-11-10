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
  gender: GymGenderMode;
  workoutStreak: number;
  userProfile: GymFemaleBodyProfile;
  exerciseLogs: Record<string, GymExerciseUserLog>;
  workoutHistory?: GymWorkoutHistoryEntry[];
  bodyMetricsHistory?: GymBodyMetricEntry[];
  celebrationSession?: GymWorkoutHistoryEntry | null;
  onRecordTodayBodyMetrics: () => void;
  onClose: () => void;
}

export default function GymProgressHistoryModal({
  open,
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
  const accentText = isMale ? 'text-[#5CE1E6]' : 'text-[#FF5C8A]';
  const accentBtn = isMale
    ? 'bg-[#5CE1E6] hover:bg-[#47d2d8] text-[#111114]'
    : 'bg-[#FF5C8A] hover:bg-[#ff4278] text-[#111114]';
  const accentBorder = isMale ? 'border-[#5CE1E6]/40' : 'border-[#FF5C8A]/40';

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

  if (!open) return null;

  const handleRecordMetrics = () => {
    onRecordTodayBodyMetrics();
    setRecordedJustNow(true);
    window.setTimeout(() => setRecordedJustNow(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Tiến độ tập luyện, kỷ lục PR và lịch sử số đo"
    >
      <div className="bg-[#16161C] border border-[#2C2C38] rounded-3xl text-[#F7F7F7] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#272732] flex items-center justify-between gap-3 bg-[#111114]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl border flex items-center justify-center ${
                isMale
                  ? 'bg-[#5CE1E6]/15 border-[#5CE1E6]/40 text-[#5CE1E6]'
                  : 'bg-[#FF5C8A]/15 border-[#FF5C8A]/40 text-[#FF5C8A]'
              }`}
            >
              <Trophy size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#F7F7F7]">
                Tiến Độ, Kỷ Lục PR &amp; Nhật Ký Tập ({isMale ? 'Gym Nam' : 'Gym Nữ'})
              </h2>
              <p className="text-xs text-zinc-400">
                Smart Streak giữ chuỗi thông minh cả khi nghỉ phục hồi cơ 1–3 ngày
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng tiến độ"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#24242F] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Celebration Banner after completing a workout session */}
          {celebrationSession && (
            <div
              className={`rounded-2xl bg-[#111114] border ${accentBorder} p-4 space-y-2.5`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-[#A3F77B]" />
                  <span className="text-sm sm:text-base font-black text-[#A3F77B]">
                    Hoàn Thành Xuất Sắc: {celebrationSession.dayTitle}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#A3F77B]/15 text-[#A3F77B] text-xs font-black">
                  +{celebrationSession.totalVolumeKg.toLocaleString('vi-VN')} kg Volume
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl bg-[#191922] p-2.5 border border-[#292938]">
                  <div className="text-zinc-400 font-semibold">Thời lượng</div>
                  <div className="text-sm font-black text-[#F7F7F7]">
                    {celebrationSession.durationMinutes} phút
                  </div>
                </div>
                <div className="rounded-xl bg-[#191922] p-2.5 border border-[#292938]">
                  <div className="text-zinc-400 font-semibold">Tiêu hao</div>
                  <div className="text-sm font-black text-[#FF85A9]">
                    ~{celebrationSession.caloriesBurned} kcal
                  </div>
                </div>
                <div className="rounded-xl bg-[#191922] p-2.5 border border-[#292938]">
                  <div className="text-zinc-400 font-semibold">Số bài xong</div>
                  <div className="text-sm font-black text-[#5CE1E6]">
                    {celebrationSession.completedExercisesCount} bài
                  </div>
                </div>
              </div>

              {celebrationSession.prHighlights.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-xs font-extrabold text-[#A3F77B] flex items-center gap-1">
                    <Sparkles size={13} /> Kỷ lục hôm nay:
                  </span>
                  {celebrationSession.prHighlights.map((pr, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-[#A3F77B]/15 border border-[#A3F77B]/35 text-[11px] font-bold text-[#A3F77B]"
                    >
                      {pr}
                    </span>
                  ))}
                </div>
              )}

              <div className="rounded-xl bg-[#181822] border border-[#2A2A38] px-3 py-2 text-xs text-zinc-300 flex items-start gap-2">
                <Utensils size={14} className="text-[#A3F77B] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#F7F7F7]">Bữa phục hồi sau tập 45–60 phút:</strong>{' '}
                  {isMale
                    ? 'Nạp 35–40g Protein + Carb sạch (VD: 180g ức gà/thăn bò + 1.5 chén cơm trắng hoặc phở bò tái nạc).'
                    : 'Nạp 25–30g Protein + Carb phức (VD: 130g cá hồi/ức gà + 1/2 củ khoai lang + rau xanh để phục hồi vòng 3 không tích mỡ eo).'}
                </span>
              </div>
            </div>
          )}

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-2xl bg-[#111114] border border-[#272732] p-3">
              <div className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                <Flame size={13} className={accentText} /> Chuỗi tập (Streak)
              </div>
              <div className="text-lg font-black text-[#F7F7F7] mt-0.5">
                {workoutStreak} buổi
              </div>
            </div>

            <div className="rounded-2xl bg-[#111114] border border-[#272732] p-3">
              <div className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                <CalendarCheck2 size={13} className="text-[#A3F77B]" /> Đã hoàn thành
              </div>
              <div className="text-lg font-black text-[#F7F7F7] mt-0.5">
                {workoutHistory.length} buổi
              </div>
            </div>

            <div className="rounded-2xl bg-[#111114] border border-[#272732] p-3">
              <div className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                <Dumbbell size={13} className="text-[#5CE1E6]" /> Tổng Volume
              </div>
              <div className="text-lg font-black text-[#F7F7F7] mt-0.5">
                {totalVolumeAllTime.toLocaleString('vi-VN')} kg
              </div>
            </div>

            <div className="rounded-2xl bg-[#111114] border border-[#272732] p-3">
              <div className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                <Trophy size={13} className="text-[#FF85A9]" /> Bài có PR
              </div>
              <div className="text-lg font-black text-[#F7F7F7] mt-0.5">
                {prItems.length} bài
              </div>
            </div>
          </div>

          {/* Personal Records & 1RM Section */}
          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-[#A3F77B] flex items-center gap-1.5">
              <TrendingUp size={14} />
              <span>Bảng Kỷ Lục Cá Nhân (PR &amp; Sức Tối Đa 1RM Ước Tính)</span>
            </div>

            {prItems.length === 0 ? (
              <div className="rounded-2xl bg-[#111114] border border-[#272732] p-3.5 text-xs text-zinc-400">
                Chưa có mức tạ nào được lưu. Khi tập, hãy bấm <strong className="text-zinc-200">+ / - kg</strong> hoặc tích vào từng <strong className="text-zinc-200">Hiệp 1, 2, 3</strong> để hệ thống tự động ghi kỷ lục PR!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {prItems.slice(0, 8).map((item) => (
                  <div
                    key={item.exerciseId}
                    className="rounded-2xl bg-[#111114] border border-[#272732] px-3.5 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-black text-[#F7F7F7] truncate">
                        {item.vietnameseName}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {item.seatPin
                          ? `Ghi nhớ máy: ${item.seatPin}`
                          : item.machineName}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xs font-black ${accentText}`}>
                        PR {item.prKg}kg
                      </div>
                      <div className="text-[10px] font-bold text-zinc-400">
                        1RM ~{item.est1RM}kg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Body Metrics Timeline */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-black uppercase tracking-wider text-[#F7F7F7] flex items-center gap-1.5">
                <Scale size={14} className={accentText} />
                <span>Nhật Ký Số Đo Cơ Thể Theo Tuần</span>
              </div>
              <button
                type="button"
                onClick={handleRecordMetrics}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer ${accentBtn}`}
              >
                {recordedJustNow ? <Check size={13} /> : <PlusCircle size={13} />}
                <span>
                  {recordedJustNow
                    ? 'Đã lưu mốc hôm nay!'
                    : 'Lưu mốc cân đo hôm nay'}
                </span>
              </button>
            </div>

            <div className="rounded-2xl bg-[#111114] border border-[#272732] p-3.5 space-y-2">
              <div className="text-xs text-zinc-300 flex flex-wrap items-center gap-2">
                <span className="font-bold text-zinc-400">Số đo hiện tại:</span>
                <span className="px-2 py-0.5 rounded-lg bg-[#1C1C26] font-bold">
                  Cân nặng: {userProfile.weightKg}kg
                </span>
                {isMale ? (
                  <>
                    <span className="px-2 py-0.5 rounded-lg bg-[#1C1C26] font-bold">
                      Ngực: {userProfile.chestCm ?? 96}cm
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#1C1C26] font-bold">
                      Bụng: {userProfile.waistCm}cm
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#1C1C26] font-bold">
                      Tay: {userProfile.armCm ?? 35}cm
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-0.5 rounded-lg bg-[#1C1C26] font-bold">
                      Eo V2: {userProfile.waistCm}cm
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#1C1C26] font-bold">
                      Mông V3: {userProfile.hipCm}cm
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#1C1C26] font-bold text-[#A3F77B]">
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
                <div className="pt-2 border-t border-[#23232E] space-y-1.5">
                  {genderMetricsHistory.slice(0, 5).map((entry) => (
                    <div
                      key={`${entry.dateKey}_${entry.gender}`}
                      className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300 bg-[#171720] px-3 py-1.5 rounded-xl"
                    >
                      <span className="font-bold text-zinc-400">
                        {entry.dateKey}
                      </span>
                      <span className="font-bold">
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
          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-[#F7F7F7] flex items-center gap-1.5">
              <Activity size={14} className="text-[#A3F77B]" />
              <span>Lịch Sử Buổi Tập Gần Đây</span>
            </div>

            {workoutHistory.length === 0 ? (
              <div className="rounded-2xl bg-[#111114] border border-[#272732] p-3.5 text-xs text-zinc-400">
                Bấm <strong className="text-zinc-200">Hoàn Thành Buổi Tập</strong> sau khi tập xong bài cuối để ghi lại lịch sử Volume &amp; Calo đốt cháy.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {workoutHistory.slice(0, 12).map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl bg-[#111114] border border-[#272732] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-black text-[#F7F7F7] truncate flex items-center gap-1.5">
                        <span>{session.dayTitle}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                            session.gender === 'male'
                              ? 'bg-[#5CE1E6]/15 text-[#5CE1E6]'
                              : 'bg-[#FF5C8A]/15 text-[#FF5C8A]'
                          }`}
                        >
                          {session.gender === 'male' ? 'Nam' : 'Nữ'}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {session.dateKey} • {session.durationMinutes} phút •{' '}
                        {session.completedExercisesCount} bài • ~{session.caloriesBurned} kcal
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-[#A3F77B]">
                        {session.totalVolumeKg.toLocaleString('vi-VN')} kg
                      </div>
                      {session.prCount > 0 && (
                        <div className="text-[10px] font-bold text-[#FF85A9]">
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

        {/* Footer */}
        <div className="px-5 py-3 bg-[#111114] border-t border-[#272732] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1B1B22] hover:bg-[#252530] border border-[#2E2E3A] text-xs font-extrabold text-zinc-200 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
