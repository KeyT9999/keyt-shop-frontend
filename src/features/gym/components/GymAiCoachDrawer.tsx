import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Loader2,
  MessageCircle,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { GYM_EXERCISE_MAP } from '../data/defaultGymCatalog';
import {
  gymSyncService,
  type GymAiUserSnapshot,
} from '../services/gymSyncService';
import type {
  GymAiChatMessage,
  GymCycleTrackingState,
  GymExerciseDefinition,
  GymExerciseUserLog,
  GymFemaleBodyProfile,
  GymGenderMode,
  GymSplitDayConfig,
  GymWorkoutHistoryEntry,
} from '../types/gym';
import {
  computeEstimated1RM,
  type ResolvedCycleStatus,
} from '../utils/gymCycleAndProgressionUtils';
import { generateGenderWorkoutAndNutritionPlan } from '../utils/gymGenderAdvisorUtils';

interface GymAiCoachDrawerProps {
  open: boolean;
  activeGender?: GymGenderMode;
  token: string | null;
  userProfile: GymFemaleBodyProfile;
  cycleTracking: GymCycleTrackingState;
  cycleStatus: ResolvedCycleStatus;
  activeDay: GymSplitDayConfig;
  currentExercise: GymExerciseDefinition;
  customDays: GymSplitDayConfig[];
  exerciseLogs: Record<string, GymExerciseUserLog>;
  workoutHistory?: GymWorkoutHistoryEntry[];
  workoutStreak: number;
  chatHistory: GymAiChatMessage[];
  onOpen?: () => void;
  onClose: () => void;
  onAppendMessages: (messages: GymAiChatMessage[]) => void;
  onClearHistory: () => void;
  onApplyPresetDays?: (days: GymSplitDayConfig[]) => void;
  onOpenProfileModal?: () => void;
}

const MALE_SUGGESTIONS_VI = [
  'Dựa vào chiều cao, cân nặng và số đo Ngực/Bụng/Tay của mình, hôm nay nên tập mức tạ nào?',
  'Đi ăn ngoài (cơm tấm, phở bò, bún thịt nướng) thì gọi thế nào để đủ Đạm mà không tích mỡ bụng?',
  'Làm sao để đẩy ngực vào đúng ngực trên mà không bị mỏi khớp vai trước?',
];

const FEMALE_SUGGESTIONS_VI = [
  'Dựa vào chiều cao, cân nặng, số đo Eo/Mông và pha chu kỳ của mình, hôm nay nên tập thế nào?',
  'Đi ăn ngoài (phở gà, bún thịt nướng, cơm văn phòng) thì ăn sao để nuôi vòng 3 mà giữ eo thon?',
  'Mình muốn độ mông đào mà không bị to đùi trước, cần lưu ý kỹ thuật gì ở bài đang xem?',
];

function buildLocalFallbackCoachAnswer(
  question: string,
  gender: GymGenderMode,
  userProfile: GymFemaleBodyProfile,
  cycleStatus: ResolvedCycleStatus,
  currentExercise: GymExerciseDefinition,
  targetKcal: number,
  proteinGrams: number
): string {
  const heightM = (userProfile.heightCm || 160) / 100;
  const bmi = ((userProfile.weightKg || 50) / (heightM * heightM)).toFixed(1);

  if (gender === 'male') {
    const chest = userProfile.chestCm || 96;
    const waist = userProfile.waistCm || 78;
    const arm = userProfile.armCm || 35;
    return [
      `Dựa trên thông tin của bạn (**Nam • ${userProfile.heightCm}cm • ${userProfile.weightKg}kg • BMI ${bmi}**, Ngực **${chest}cm** • Bụng **${waist}cm** • Bắp tay **${arm}cm**):`,
      `• **Bài tập & Mức tạ (${currentExercise.vietnameseName}):** Thực hiện **${currentExercise.sets} hiệp × ${currentExercise.reps} lần**, hạ tạ chậm 2–3 giây để tối ưu kích thích cơ.`,
      `• **Ăn uống theo chỉ số của bạn:** Mục tiêu **${targetKcal} kcal/ngày** và **${proteinGrams}g Đạm/ngày** (chia đều 4 bữa: ức gà, thăn bò nạc, cá, trứng; ăn ngoài chọn phở bò tái nạc hoặc cơm tấm sườn nạc bỏ mỡ hành).`,
      `• **Trả lời "${question.slice(0, 60)}":** Giữ lưng dưới áp sát ghế đệm, hạ bả vai, thở ra khi phát lực đẩy/kéo và nghỉ ${currentExercise.restSeconds}s giữa các hiệp.`,
    ].join('\n');
  }

  const whr = ((userProfile.waistCm || 63) / (userProfile.hipCm || 92)).toFixed(2);
  return [
    `Dựa trên thông tin của bạn (**Nữ • ${userProfile.heightCm}cm • ${userProfile.weightKg}kg • BMI ${bmi}**, Eo **${userProfile.waistCm}cm** • Mông **${userProfile.hipCm}cm** • WHR **${whr}**, **${cycleStatus.phaseShortVi}**):`,
    cycleStatus.isDeloadRecommended
      ? `• **Điều chỉnh theo Chu kỳ:** Hôm nay nên **giảm 15–20% mức tạ (Deload)**, ưu tiên bài cô lập mông nhẹ nhàng và tránh nén ổ bụng.`
      : `• **Bài tập & Mức tạ (${currentExercise.vietnameseName}):** Tập **${currentExercise.sets} hiệp × ${currentExercise.reps} lần**, dồn lực qua gót chân và giữ đỉnh co cơ mông 1 giây để ăn vào vòng 3 mà không to đùi trước.`,
    `• **Ăn uống theo chỉ số của bạn:** Mục tiêu **${targetKcal} kcal/ngày** và **${proteinGrams}g Đạm/ngày** (ăn ngoài ưu tiên phở gà bỏ da, bún bò nạc ít nước béo, khoai lang/trứng). ${cycleStatus.nutritionTipVi}`,
  ].join('\n');
}

/**
 * Clean Light Sport AI Coach Panel.
 * On mobile (<640px), the floating trigger button is hidden when closed so it never
 * covers the Bottom Tab Bar (users open AI Coach directly from the Top App Header).
 */
export default function GymAiCoachDrawer({
  open,
  activeGender,
  token,
  userProfile,
  cycleTracking,
  cycleStatus,
  currentExercise,
  exerciseLogs,
  workoutHistory = [],
  workoutStreak,
  chatHistory,
  onOpen,
  onClose,
  onAppendMessages,
  onClearHistory,
}: GymAiCoachDrawerProps) {
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const gender: GymGenderMode =
    activeGender || (userProfile.gender === 'male' ? 'male' : 'female');
  const isMale = gender === 'male';

  const livePlan = useMemo(
    () =>
      generateGenderWorkoutAndNutritionPlan({
        gender,
        userProfile: { ...userProfile, gender },
        cycleTracking,
      }),
    [gender, userProfile, cycleTracking]
  );

  useEffect(() => {
    if (open && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [open, chatHistory, isLoading]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus({ preventScroll: true });
    const viewport = window.visualViewport;
    const dock = dockRef.current;
    if (!viewport || !dock) return;
    const syncViewport = () => {
      const kbOffset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop
      );
      dock.style.setProperty('--gym-chat-kb', `${kbOffset}px`);
    };
    syncViewport();
    viewport.addEventListener('resize', syncViewport);
    viewport.addEventListener('scroll', syncViewport);
    return () => {
      viewport.removeEventListener('resize', syncViewport);
      viewport.removeEventListener('scroll', syncViewport);
      dock.style.removeProperty('--gym-chat-kb');
    };
  }, [open]);

  const buildSnapshot = (): GymAiUserSnapshot => {
    const recExercisesSummary = livePlan.recommendedExercises.map(
      (item, i) =>
        `Bài ${i + 1}: ${item.exercise.vietnameseName} (${item.suggestedSetsReps}, gợi ý ${item.suggestedWeightKg}kg)`
    );

    const nutritionSummary = `Mục tiêu dinh dưỡng theo chỉ số vừa nhập: ${livePlan.nutritionPlan.targetCaloriesKcal} kcal/ngày | Đạm: ${livePlan.nutritionPlan.proteinGrams}g | Tinh bột: ${livePlan.nutritionPlan.carbsGrams}g | Chất béo: ${livePlan.nutritionPlan.fatGrams}g | Nước: ${livePlan.nutritionPlan.waterLiters}L`;

    const exerciseLogsSummary = Object.values(exerciseLogs)
      .slice(0, 10)
      .map((log) => {
        const name =
          GYM_EXERCISE_MAP[log.exerciseId]?.vietnameseName || log.exerciseId;
        const pin = log.seatPinNote || log.personalTip;
        return `${name}: ${log.weightKg}kg${pin ? ` (${pin})` : ''}`;
      });

    const prSummary = Object.values(exerciseLogs)
      .filter((log) => (log.personalRecordKg || log.weightKg || 0) > 0)
      .slice(0, 8)
      .map((log) => {
        const name =
          GYM_EXERCISE_MAP[log.exerciseId]?.vietnameseName || log.exerciseId;
        const pr = Math.max(log.personalRecordKg || 0, log.weightKg || 0);
        const e1rm = log.estimated1RM || computeEstimated1RM(pr, 10);
        return `${name}: PR ${pr}kg (1RM ~${e1rm}kg)`;
      });

    const recentWorkoutSummary = workoutHistory
      .slice(0, 5)
      .map(
        (s) =>
          `${s.dateKey} - ${s.dayTitle}: ${s.totalVolumeKg}kg Volume (${s.durationMinutes}p)`
      )
      .join(' | ');

    return {
      userProfile: {
        ...userProfile,
        gender,
      },
      cycleTracking,
      resolvedCyclePhase: cycleStatus.phase,
      activeDayTitle: livePlan.goalLabelVi,
      currentExerciseName: `${currentExercise.vietnameseName} (${currentExercise.name})`,
      workoutStreak,
      customDaysSummary: [...recExercisesSummary, nutritionSummary],
      exerciseLogsSummary,
      prSummary,
      recentWorkoutSummary,
    };
  };

  const handleSendQuestion = async (rawQuestion: string) => {
    const trimmed = rawQuestion.trim();
    if (!trimmed || isLoading) return;

    const userMsg: GymAiChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAtMs: Date.now(),
    };

    setInput('');
    setIsLoading(true);

    try {
      const res = await gymSyncService.askAiCoach({
        question: trimmed,
        history: chatHistory,
        userSnapshot: buildSnapshot(),
        token,
      });

      const assistantMsg: GymAiChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        provider: res.provider,
        createdAtMs: Date.now(),
      };
      onAppendMessages([userMsg, assistantMsg]);
    } catch {
      const fallbackReply = buildLocalFallbackCoachAnswer(
        trimmed,
        gender,
        userProfile,
        cycleStatus,
        currentExercise,
        livePlan.nutritionPlan.targetCaloriesKcal,
        livePlan.nutritionPlan.proteinGrams
      );
      const assistantMsg: GymAiChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: fallbackReply,
        provider: 'KeyT Smart Coach',
        createdAtMs: Date.now(),
      };
      onAppendMessages([userMsg, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = isMale ? MALE_SUGGESTIONS_VI : FEMALE_SUGGESTIONS_VI;

  return (
    <div
      ref={dockRef}
      style={{
        bottom: 'calc(max(1rem, env(safe-area-inset-bottom)) + var(--gym-chat-kb, 0px))',
        right: 'max(0.75rem, env(safe-area-inset-right))',
      }}
      className="fixed z-50"
      onKeyDown={(e) => {
        if (open && e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      {open ? (
        <section
          role="dialog"
          aria-label="Hỏi AI Coach về thông tin thể trạng của bạn"
          className="w-[min(25rem,calc(100vw-1.5rem))] h-[min(33rem,calc(100dvh-2.5rem))] rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Clean Navy Sport Header */}
          <header className="px-4 py-3 flex items-center justify-between gap-2 bg-[#1E293B] text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#F05A28] text-white flex items-center justify-center shrink-0">
                <MessageCircle size={17} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs sm:text-sm font-extrabold text-white truncate">
                    KeyT AI Coach
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white shrink-0">
                    {isMale ? 'Nam' : 'Nữ'}
                  </span>
                </div>
                <div className="text-[10px] font-medium text-slate-300 truncate">
                  {isMale
                    ? `${userProfile.heightCm}cm • ${userProfile.weightKg}kg • Ngực/Bụng/Tay: ${userProfile.chestCm ?? 96}/${userProfile.waistCm}/${userProfile.armCm ?? 35}cm`
                    : `${userProfile.heightCm}cm • ${userProfile.weightKg}kg • Eo/Mông: ${userProfile.waistCm}/${userProfile.hipCm}cm • ${cycleStatus.phaseShortVi}`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {chatHistory.length > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  title="Xóa đoạn chat"
                  aria-label="Xóa đoạn chat"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-300 hover:bg-white/10 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Thu gọn chat"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* Messages Log */}
          <div
            ref={logRef}
            role="log"
            aria-label="Cuộc trò chuyện với AI Coach"
            className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs sm:text-[13px] bg-slate-50/70"
          >
            {chatHistory.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Huấn luyện viên AI đã đọc chỉ số của bạn ({userProfile.heightCm}cm, {userProfile.weightKg}kg, mục tiêu{' '}
                  <strong className="text-slate-900">{livePlan.goalLabelVi}</strong>). Chọn gợi ý bên dưới hoặc đặt câu hỏi:
                </p>
                {suggestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void handleSendQuestion(q)}
                    className="w-full text-left p-3 rounded-2xl bg-white hover:bg-orange-50/50 border border-slate-200 hover:border-orange-200 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'ml-6 bg-[#1E293B] text-white font-semibold'
                    : 'mr-3 bg-white border border-slate-200 text-slate-800 shadow-2xs'
                }`}
              >
                {msg.content}
              </div>
            ))}

            {isLoading && (
              <div
                role="status"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 shadow-2xs"
              >
                <Loader2 size={14} className="animate-spin text-[#F05A28]" />
                <span>AI đang phân tích từ chỉ số của bạn…</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendQuestion(input);
            }}
            className="p-2.5 border-t border-slate-200 bg-white flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về bài tập, mức tạ, ăn uống…"
              aria-label="Câu hỏi cho AI Coach"
              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#F05A28]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Gửi câu hỏi"
              className="w-10 h-10 rounded-xl bg-[#F05A28] hover:bg-[#d94d1f] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={false}
          onClick={() => onOpen?.()}
          className="hidden sm:inline-flex min-h-11 px-4 py-2.5 rounded-full bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm items-center gap-2 shadow-lg border border-slate-700 transition-colors cursor-pointer"
        >
          <MessageCircle size={17} className="text-[#F05A28]" aria-hidden="true" />
          <span>Hỏi AI Coach</span>
        </button>
      )}
    </div>
  );
}
