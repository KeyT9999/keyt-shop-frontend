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
} from '../types/gym';
import { type ResolvedCycleStatus } from '../utils/gymCycleAndProgressionUtils';
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
  'Dựa vào chiều cao, cân nặng và số đo Ngực/Bụng/Tay mình vừa nhập, hôm nay nên tập mức tạ nào?',
  'Với chỉ số của mình, thực đơn 4 bữa hôm nay nên ăn cụ thể bao nhiêu gram ức gà, cơm, trứng?',
  'Làm sao để đẩy ngực vào đúng ngực trên mà không bị mỏi khớp vai trước?',
];

const FEMALE_SUGGESTIONS_VI = [
  'Dựa vào chiều cao, cân nặng, số đo Eo/Mông và pha chu kỳ mình vừa nhập, hôm nay nên tập thế nào?',
  'Với chỉ số của mình, hôm nay nên ăn uống 4 bữa ra sao để tăng vòng 3 mà không tích mỡ bụng?',
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
      `Dựa trên thông tin bạn vừa nhập (**Nam • ${userProfile.heightCm}cm • ${userProfile.weightKg}kg • BMI ${bmi}**, Ngực **${chest}cm** • Bụng **${waist}cm** • Bắp tay **${arm}cm**):`,
      `• **Bài tập & Mức tạ (${currentExercise.vietnameseName}):** Thực hiện **${currentExercise.sets} hiệp × ${currentExercise.reps} lần**, hạ tạ chậm 2–3 giây để tối ưu kích thích cơ.`,
      `• **Ăn uống theo chỉ số của bạn:** Mục tiêu **${targetKcal} kcal/ngày** và **${proteinGrams}g Đạm/ngày** (chia đều 4 bữa: ức gà, bò nạc, cá, trứng, khoai lang/cơm).`,
      `• **Trả lời "${question.slice(0, 60)}":** Giữ lưng dưới áp sát ghế đệm, thở ra khi phát lực đẩy/kéo và nghỉ ${currentExercise.restSeconds}s giữa các hiệp.`,
    ].join('\n');
  }

  const whr = ((userProfile.waistCm || 63) / (userProfile.hipCm || 92)).toFixed(2);
  return [
    `Dựa trên thông tin bạn vừa nhập (**Nữ • ${userProfile.heightCm}cm • ${userProfile.weightKg}kg • BMI ${bmi}**, Eo **${userProfile.waistCm}cm** • Mông **${userProfile.hipCm}cm** • WHR **${whr}**, **${cycleStatus.phaseShortVi}**):`,
    cycleStatus.isDeloadRecommended
      ? `• **Điều chỉnh theo Chu kỳ:** Hôm nay nên **giảm 15–20% mức tạ (Deload)**, ưu tiên bài cô lập mông nhẹ nhàng và tránh nén ổ bụng.`
      : `• **Bài tập & Mức tạ (${currentExercise.vietnameseName}):** Tập **${currentExercise.sets} hiệp × ${currentExercise.reps} lần**, dồn lực qua gót chân và giữ đỉnh co cơ mông 1 giây để ăn vào vòng 3 mà không to đùi trước.`,
    `• **Ăn uống theo chỉ số của bạn:** Mục tiêu **${targetKcal} kcal/ngày** và **${proteinGrams}g Đạm/ngày**. ${cycleStatus.nutritionTipVi}`,
  ].join('\n');
}

/**
 * Floating bottom-right corner AI Chat Dock (modeled after ZiweiChat in /tu-vi)
 * that reads the user's live entered metrics (Nam / Nữ) to think and reply.
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
        return `${name}: ${log.weightKg}kg`;
      });

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
        right: 'max(1rem, env(safe-area-inset-right))',
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
          className="w-[min(25rem,calc(100vw-1.5rem))] h-[min(33rem,calc(100dvh-2rem))] rounded-2xl border border-[#2E2E3D] bg-[#15151C] text-[#F7F7F7] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Corner Chat Header (Like ZiweiChat) */}
          <header
            className={`px-3.5 py-2.5 flex items-center justify-between gap-2 border-b border-[#272734] ${
              isMale ? 'bg-[#102329]' : 'bg-[#28131B]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <MessageCircle
                size={18}
                className={isMale ? 'text-[#5CE1E6] shrink-0' : 'text-[#FF5C8A] shrink-0'}
              />
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-black text-[#F7F7F7] truncate">
                  Hỏi AI Coach ({isMale ? 'Nam' : 'Nữ'})
                </h2>
                <div className="text-[10px] font-bold text-zinc-300 truncate">
                  {isMale
                    ? `${userProfile.heightCm}cm • ${userProfile.weightKg}kg • Ngực/Bụng/Tay ${userProfile.chestCm ?? 96}/${userProfile.waistCm}/${userProfile.armCm ?? 35}`
                    : `${userProfile.heightCm}cm • ${userProfile.weightKg}kg • Eo/Mông ${userProfile.waistCm}/${userProfile.hipCm} • ${cycleStatus.phaseShortVi}`}
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
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-white/10 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Thu gọn chat"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 cursor-pointer"
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
            className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs sm:text-[13px]"
          >
            {chatHistory.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">
                  AI đã nạp chỉ số bạn vừa nhập ({userProfile.heightCm}cm, {userProfile.weightKg}kg, mục tiêu{' '}
                  <strong className="text-[#F7F7F7]">{livePlan.goalLabelVi}</strong>). Chọn câu hỏi hoặc nhập bên dưới:
                </p>
                {suggestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void handleSendQuestion(q)}
                    className="w-full text-left p-2.5 rounded-xl bg-[#1E1E28] hover:bg-[#272735] border border-[#2E2E3C] text-xs font-semibold text-zinc-200 transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`p-2.5 rounded-xl leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? isMale
                      ? 'ml-6 bg-[#5CE1E6] text-[#111114] font-bold'
                      : 'ml-6 bg-[#FF5C8A] text-[#111114] font-bold'
                    : 'mr-3 bg-[#1E1E28] border border-[#2D2D3B] text-zinc-100'
                }`}
              >
                {msg.content}
              </div>
            ))}

            {isLoading && (
              <div
                role="status"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1E1E28] border border-[#2D2D3B] text-xs text-zinc-300"
              >
                <Loader2
                  size={14}
                  className={`animate-spin ${isMale ? 'text-[#5CE1E6]' : 'text-[#FF5C8A]'}`}
                />
                <span>AI đang suy nghĩ từ chỉ số của bạn…</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendQuestion(input);
            }}
            className="p-2.5 border-t border-[#272734] bg-[#111114] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về bài tập, mức tạ, ăn uống…"
              aria-label="Câu hỏi cho AI Coach"
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#1B1B24] border border-[#2E2E3C] text-xs sm:text-sm text-[#F7F7F7] placeholder:text-zinc-500 focus:outline-none focus:border-[#FF5C8A]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Gửi câu hỏi"
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition cursor-pointer disabled:opacity-50 ${
                isMale
                  ? 'bg-[#5CE1E6] text-[#111114]'
                  : 'bg-[#FF5C8A] text-[#111114]'
              }`}
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
          className={`min-h-12 px-4 py-2.5 rounded-full font-black text-xs sm:text-sm flex items-center gap-2 shadow-2xl border transition-transform hover:scale-105 cursor-pointer ${
            isMale
              ? 'bg-[#5CE1E6] text-[#111114] border-[#5CE1E6]/50 shadow-[#5CE1E6]/30'
              : 'bg-[#FF5C8A] text-[#111114] border-[#FF5C8A]/50 shadow-[#FF5C8A]/30'
          }`}
        >
          <MessageCircle size={19} aria-hidden="true" />
          <span>Hỏi AI ({userProfile.heightCm}cm • {userProfile.weightKg}kg)</span>
        </button>
      )}
    </div>
  );
}
