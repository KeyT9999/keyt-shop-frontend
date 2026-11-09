import {
  Activity,
  Bot,
  Flame,
  HeartPulse,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  Zap,
} from 'lucide-react';
import type {
  GymExerciseDefinition,
  GymFemaleBodyProfile,
  GymSplitDayConfig,
} from '../types/gym';
import {
  GYM_PRIMARY_GOAL_META,
  type ResolvedCycleStatus,
  type SessionEnergyStats,
  type SmartSetRecommendation,
} from '../utils/gymCycleAndProgressionUtils';

interface GymNeonHeroDashboardProps {
  userProfile: GymFemaleBodyProfile;
  cycleStatus: ResolvedCycleStatus;
  sessionStats: SessionEnergyStats;
  setRecommendation: SmartSetRecommendation;
  days: GymSplitDayConfig[];
  activeDay: GymSplitDayConfig;
  currentExercise: GymExerciseDefinition;
  workoutStreak: number;
  onSelectDay: (dayId: string) => void;
  onOpenCycleProfileModal: () => void;
  onOpenSubstituteModal: () => void;
  onOpenAiCoachDrawer: () => void;
  onOpenCustomizerModal: () => void;
}

const WEEKDAY_PILLS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/**
 * High-energy Dark Charcoal (#111114) & Neon Pink (#FF5C8A) Dashboard
 * inspired by the Progress / WORKOUT / Pillar reference design.
 */
export default function GymNeonHeroDashboard({
  userProfile,
  cycleStatus,
  sessionStats,
  setRecommendation,
  days,
  activeDay,
  currentExercise,
  workoutStreak,
  onSelectDay,
  onOpenCycleProfileModal,
  onOpenSubstituteModal,
  onOpenAiCoachDrawer,
  onOpenCustomizerModal,
}: GymNeonHeroDashboardProps) {
  const goalMeta =
    GYM_PRIMARY_GOAL_META[userProfile.primaryGoal] ||
    GYM_PRIMARY_GOAL_META.glute_sculpt;

  const heightM = (userProfile.heightCm || 160) / 100;
  const bmi = ((userProfile.weightKg || 50) / (heightM * heightM)).toFixed(1);

  return (
    <section
      aria-label="Bảng điều khiển tiến độ và thể trạng nữ"
      className="rounded-3xl bg-[#111114] border border-[#262630] p-3.5 sm:p-5 text-[#F7F7F7] shadow-2xl relative overflow-hidden"
    >
      {/* Subtle ambient neon pink glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FF5C8A]/15 blur-3xl"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch relative z-10">
        {/* LEFT COLUMN (7 cols): Top Challenger Bar + Progress Filter Pills + 7-Day Capsules */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5">
          {/* Top Challenger Identity + Quick Action Icons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenCycleProfileModal}
                className="relative group flex items-center gap-2.5 pr-3 py-1 pl-1 rounded-full bg-[#1B1B22] border border-[#2E2E3A] hover:border-[#FF5C8A] transition-colors duration-200 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#FF5C8A] shrink-0 bg-[#262630]">
                  <img
                    src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=240&q=80"
                    alt={`Hồ sơ của ${userProfile.nickname}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="w-5 h-5 -ml-4 rounded-full bg-[#FF5C8A] text-[#111114] text-[11px] font-black flex items-center justify-center shadow-sm">
                  {Math.max(1, Math.min(99, workoutStreak || 2))}
                </span>
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-black tracking-tight text-[#F7F7F7] flex items-center gap-1.5">
                    <span>{userProfile.nickname || 'Challenger'}</span>
                    <span className="inline-flex items-center gap-0.5 text-[#FF5C8A] font-extrabold text-xs">
                      <Flame size={13} className="fill-[#FF5C8A]" />
                      {sessionStats.estimatedTotalKcal}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-medium">
                    {userProfile.heightCm}cm • {userProfile.weightKg}kg • BMI {bmi} • Eo/Mông{' '}
                    {userProfile.waistCm}/{userProfile.hipCm}
                  </div>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenCycleProfileModal}
                title="Cập nhật Hồ sơ Nữ & Chu kỳ kinh nguyệt"
                className="h-9 px-3 rounded-full bg-[#1B1B22] hover:bg-[#252530] border border-[#2E2E3A] hover:border-[#FF5C8A] text-xs font-bold text-[#F7F7F7] flex items-center gap-1.5 transition-colors duration-200 cursor-pointer"
              >
                <HeartPulse size={14} className="text-[#FF5C8A]" />
                <span>Chu kỳ &amp; Số đo</span>
              </button>

              <button
                type="button"
                onClick={onOpenAiCoachDrawer}
                title="Hỏi Huấn luyện viên AI cá nhân"
                className="h-9 px-3.5 rounded-full bg-[#FF5C8A] hover:bg-[#ff4278] text-[#111114] text-xs font-black flex items-center gap-1.5 shadow-lg shadow-[#FF5C8A]/25 transition-all duration-200 cursor-pointer"
              >
                <Bot size={15} />
                <span>AI Coach</span>
              </button>
            </div>
          </div>

          {/* Progress Title + Pill Filters (Exact style from screenshot) */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#F7F7F7]">
                Progress
              </h2>
              <span className="text-xs font-bold text-[#FF5C8A]">
                {goalMeta.labelVi}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onOpenCustomizerModal}
                className="px-3.5 py-1.5 rounded-full bg-[#FF5C8A] text-[#111114] text-xs font-black tracking-wide transition-transform duration-150 cursor-pointer"
              >
                Tracker
              </button>
              <button
                type="button"
                onClick={onOpenCycleProfileModal}
                className="px-3.5 py-1.5 rounded-full bg-[#18181F] hover:bg-[#22222C] border border-[#2E2E3A] text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
              >
                <HeartPulse size={13} className="text-[#FF5C8A]" />
                <span>{cycleStatus.phaseShortVi} (Ngày {cycleStatus.dayOfCycle})</span>
              </button>
              <button
                type="button"
                onClick={onOpenSubstituteModal}
                className="px-3.5 py-1.5 rounded-full bg-[#18181F] hover:bg-[#22222C] border border-[#2E2E3A] text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
              >
                <RefreshCw size={12} className="text-[#A3F77B]" />
                <span>Đổi bài 0đ</span>
              </button>
              <button
                type="button"
                onClick={onOpenAiCoachDrawer}
                className="px-3.5 py-1.5 rounded-full bg-[#18181F] hover:bg-[#22222C] border border-[#2E2E3A] text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
              >
                <Sparkles size={12} className="text-[#7CE7FF]" />
                <span>Tư vấn TT Cá Nhân</span>
              </button>
            </div>
          </div>

          {/* 7-Day Vertical Capsule Strip (Matches T F S S M T W capsules in screenshot) */}
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 sm:gap-2 pt-0.5">
            {days.map((day, idx) => {
              const isSelected = day.id === activeDay.id;
              const weekdayLabel = WEEKDAY_PILLS[idx % WEEKDAY_PILLS.length];
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => onSelectDay(day.id)}
                  className={`group rounded-2xl py-2 px-1.5 flex flex-col items-center justify-between border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-linear-to-b from-[#FF85A9] to-[#FF5C8A] border-[#FF5C8A] text-[#111114] shadow-lg shadow-[#FF5C8A]/25'
                      : 'bg-[#18181F] border-[#272732] hover:border-[#FF5C8A]/60 text-zinc-400'
                  }`}
                >
                  <span
                    className={`text-[10px] font-extrabold uppercase ${
                      isSelected ? 'text-[#111114]/80' : 'text-zinc-500'
                    }`}
                  >
                    {weekdayLabel}
                  </span>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black my-1 ${
                      isSelected
                        ? 'bg-[#F7F7F7] text-[#111114]'
                        : 'bg-[#22222B] text-[#F7F7F7]'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-bold truncate max-w-full px-1 ${
                      isSelected ? 'text-[#111114]' : 'text-zinc-400'
                    }`}
                  >
                    {day.title.split(' ')[0]}
                  </span>
                </button>
              );
            })}

            {/* Extra decorative weekend capsules on desktop to complete the 7-column rhythm */}
            {days.length < 7 &&
              Array.from({ length: Math.max(0, 7 - days.length) }).map((_, extraIdx) => {
                const dayNumber = days.length + extraIdx + 1;
                return (
                  <button
                    key={`extra_${dayNumber}`}
                    type="button"
                    onClick={onOpenCustomizerModal}
                    className="hidden sm:flex rounded-2xl py-2 px-1.5 flex-col items-center justify-between border border-dashed border-[#272732] bg-[#15151B] hover:border-[#FF5C8A]/50 text-zinc-500 transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] font-extrabold uppercase">
                      {WEEKDAY_PILLS[(dayNumber - 1) % 7]}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-[#1E1E26] flex items-center justify-center text-xs font-bold my-1 text-zinc-400">
                      +
                    </span>
                    <span className="text-[10px] font-semibold">Thêm</span>
                  </button>
                );
              })}
          </div>

          {/* Cycle Coaching Banner */}
          <div
            className={`rounded-2xl px-3.5 py-2.5 border flex items-start justify-between gap-3 ${
              cycleStatus.isDeloadRecommended
                ? 'bg-[#FF5C8A]/12 border-[#FF5C8A]/40 text-[#F7F7F7]'
                : 'bg-[#18181F] border-[#292935] text-zinc-200'
            }`}
          >
            <div className="text-xs leading-relaxed">
              <span className="font-black text-[#FF5C8A] uppercase tracking-wider mr-1.5">
                [{cycleStatus.phaseTitleVi}]
              </span>
              <span>{cycleStatus.coachingBannerVi}</span>
            </div>
            <button
              type="button"
              onClick={onOpenCycleProfileModal}
              className="shrink-0 px-2.5 py-1 rounded-xl bg-[#252530] hover:bg-[#FF5C8A] hover:text-[#111114] text-[11px] font-extrabold text-[#F7F7F7] transition-colors cursor-pointer"
            >
              Đổi trạng thái
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Athlete WORKOUT Hero + Vertical Gauge + 3 Neon Pillar Cards */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          {/* Athlete Hero Card with Bold Angled WORKOUT Typography & Vertical Gauge */}
          <div className="relative rounded-3xl bg-linear-to-br from-[#1C1820] via-[#141418] to-[#111114] border border-[#2C2533] p-4 min-h-[188px] flex flex-col justify-between overflow-hidden">
            {/* Giant Angled WORKOUT Typography in background */}
            <div
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-x-2 top-1/2 -translate-y-1/2 -rotate-12 text-center"
            >
              <span className="text-5xl sm:text-6xl font-black uppercase tracking-tighter text-[#FF85A9]/85 drop-shadow-[0_6px_24px_rgba(255,92,138,0.28)]">
                WORKOUT
              </span>
            </div>

            {/* Athlete Silhouette / Cutout Image overlay */}
            <img
              src="https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=600&q=80"
              alt="Vận động viên nữ tập gym"
              className="pointer-events-none absolute right-8 bottom-0 h-44 w-36 object-cover object-top rounded-t-full opacity-80 mix-blend-lighten"
            />

            {/* Top Row: Pink '+' FAB + Completion 100% Label */}
            <div className="relative z-10 flex items-center justify-between">
              <button
                type="button"
                onClick={onOpenSubstituteModal}
                title="Đổi bài tập tương đương hoặc thêm bài"
                aria-label="Đổi bài tập thông minh"
                className="w-10 h-10 rounded-full bg-[#FF85A9] hover:bg-[#FF5C8A] text-[#111114] flex items-center justify-center shadow-lg shadow-[#FF5C8A]/30 transition-transform duration-200 hover:scale-105 cursor-pointer"
              >
                <Plus size={20} strokeWidth={2.5} />
              </button>

              <div className="text-right">
                <span className="text-xs font-extrabold text-zinc-300">
                  {sessionStats.completionPercent}%
                </span>
              </div>
            </div>

            {/* Vertical Multi-Color Progress Bar on the right edge */}
            <div className="absolute right-4 top-11 bottom-10 w-2 rounded-full bg-[#262630] overflow-hidden flex flex-col justify-end">
              <div
                className="w-full rounded-full bg-linear-to-t from-[#7CE7FF] via-[#A3F77B] to-[#FF5C8A] transition-all duration-300"
                style={{
                  height: `${Math.max(18, sessionStats.completionPercent)}%`,
                }}
              />
            </div>

            {/* Bottom Row: 45 MIN TRAINED + Active Exercise Badge */}
            <div className="relative z-10 flex items-end justify-between gap-2 pt-8">
              <div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-[#F7F7F7] leading-none">
                  {sessionStats.trainedMinutesToday}
                </div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-300 mt-1">
                  MIN TRAINED • {sessionStats.estimatedTotalKcal} KCAL
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenCustomizerModal}
                className="px-2.5 py-1 rounded-xl bg-[#111114]/85 border border-[#323240] text-[11px] font-bold text-zinc-300 hover:border-[#FF5C8A] flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal size={12} className="text-[#FF5C8A]" />
                <span>Lịch 5 ngày</span>
              </button>
            </div>
          </div>

          {/* 3 Vibrant Neon Pillar Cards (Pink Technique, Lime Cycle/Tactics, Cyan Volume) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {/* Card 1: Neon Pink (#FF85A9) - Technique & Recommended Weight */}
            <button
              type="button"
              onClick={onOpenSubstituteModal}
              className="text-left rounded-2xl bg-[#FF85A9] hover:bg-[#ff709b] text-[#111114] p-2.5 sm:p-3 flex flex-col justify-between min-h-[88px] transition-transform duration-150 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] font-extrabold">
                <Activity size={13} strokeWidth={2.5} />
                <span className="truncate">Technique</span>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black leading-tight truncate">
                  {setRecommendation.recommendedWeightKg > 0
                    ? `${setRecommendation.recommendedWeightKg} KG`
                    : `${currentExercise.sets} Hiệp`}
                </div>
                <div className="text-[10px] font-bold opacity-85 truncate">
                  {setRecommendation.badgeTextVi}
                </div>
              </div>
            </button>

            {/* Card 2: Neon Lime (#A3F77B) - Cycle Phase & Energy */}
            <button
              type="button"
              onClick={onOpenCycleProfileModal}
              className="text-left rounded-2xl bg-[#A3F77B] hover:bg-[#90f263] text-[#111114] p-2.5 sm:p-3 flex flex-col justify-between min-h-[88px] transition-transform duration-150 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] font-extrabold">
                <Zap size={13} strokeWidth={2.5} />
                <span className="truncate">Cycle Sync</span>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black leading-tight truncate">
                  {cycleStatus.energyPercent}%
                </div>
                <div className="text-[10px] font-bold opacity-85 truncate">
                  {cycleStatus.phaseShortVi}
                </div>
              </div>
            </button>

            {/* Card 3: Neon Cyan (#7CE7FF) - AI Coach & Body Profile */}
            <button
              type="button"
              onClick={onOpenAiCoachDrawer}
              className="text-left rounded-2xl bg-[#7CE7FF] hover:bg-[#5ee0ff] text-[#111114] p-2.5 sm:p-3 flex flex-col justify-between min-h-[88px] transition-transform duration-150 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] font-extrabold">
                <UserCheck size={13} strokeWidth={2.5} />
                <span className="truncate">AI Coach</span>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black leading-tight truncate">
                  {userProfile.waistCm}/{userProfile.hipCm}
                </div>
                <div className="text-[10px] font-bold opacity-85 truncate">
                  Hỏi mọi TT của bạn
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
