import { useState } from 'react';
import {
  Bot,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { GYM_EXERCISE_MAP, GYM_SPLIT_PRESETS } from '../data/defaultGymCatalog';
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
  GymSplitDayConfig,
} from '../types/gym';
import {
  GYM_PRIMARY_GOAL_META,
  type ResolvedCycleStatus,
} from '../utils/gymCycleAndProgressionUtils';

interface GymAiCoachDrawerProps {
  open: boolean;
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
  onClose: () => void;
  onAppendMessages: (messages: GymAiChatMessage[]) => void;
  onClearHistory: () => void;
  onApplyPresetDays: (days: GymSplitDayConfig[]) => void;
  onOpenProfileModal: () => void;
}

const QUICK_PROMPTS_VI = [
  'Dựa vào chiều cao, cân nặng, số đo Eo/Mông và pha chu kỳ hôm nay của mình, hãy đánh giá tổng quan và gợi ý mức tạ!',
  'Mình muốn độ mông đào căng tròn mà không bị to đùi trước, hôm nay nên tập trung lưu ý kỹ thuật gì?',
  'Hôm nay mình hơi mỏi lưng / trong kỳ Dâu, nên điều chỉnh bài tập và ăn uống thế nào?',
  'Sau buổi tập hôm nay mình nên ăn gì để giữ eo thon và tăng cơ vòng 3?',
];

function buildLocalFallbackCoachAnswer(
  question: string,
  userProfile: GymFemaleBodyProfile,
  cycleStatus: ResolvedCycleStatus,
  currentExercise: GymExerciseDefinition
): string {
  const heightM = (userProfile.heightCm || 160) / 100;
  const bmi = ((userProfile.weightKg || 50) / (heightM * heightM)).toFixed(1);
  const whr = ((userProfile.waistCm || 63) / (userProfile.hipCm || 92)).toFixed(2);
  const proteinTarget = Math.round((userProfile.weightKg || 50) * 1.8);

  return [
    `Chào **${userProfile.nickname || 'Challenger'}**! Mình đã đọc toàn bộ hồ sơ của bạn (**${userProfile.heightCm}cm • ${userProfile.weightKg}kg • BMI ${bmi}**, số đo Eo/Mông **${userProfile.waistCm}/${userProfile.hipCm}cm** - tỷ lệ WHR **${whr}**) cùng trạng thái **${cycleStatus.phaseTitleVi}**:`,
    ``,
    `• **Về câu hỏi "${question.slice(0, 70)}":**`,
    cycleStatus.isDeloadRecommended
      ? `• **Điều chỉnh theo Chu kỳ hôm nay:** Cơ thể bạn đang cần giảm tải. Hãy **giảm 15–20% mức tạ (Deload)**, ưu tiên bài cô lập mông như **Máy Hip Abductor** hoặc **Hip Thrust tạ vừa**, tránh gồng nén bụng quá gắt.`
      : `• **Chiến lược Tập luyện:** Bạn đang ở giai đoạn **${cycleStatus.phaseShortVi}** (${cycleStatus.energyPercent}% năng lượng). Với bài **${currentExercise.vietnameseName}**, hãy giữ nhịp hạ tạ chậm 2–3 giây và phát lực qua gót chân để ăn sâu vào cơ mông mà không làm to đùi trước.`,
    `• **Dinh dưỡng cá nhân hóa (${userProfile.weightKg}kg):** Mục tiêu hôm nay là nạp khoảng **${proteinTarget}g Protein** (ức gà, cá hồi, trứng, sữa chua Hy Lạp) + uống đủ **2 lít nước**. ${cycleStatus.nutritionTipVi}`,
  ].join('\n');
}

export default function GymAiCoachDrawer({
  open,
  token,
  userProfile,
  cycleTracking,
  cycleStatus,
  activeDay,
  currentExercise,
  customDays,
  exerciseLogs,
  workoutStreak,
  chatHistory,
  onClose,
  onAppendMessages,
  onClearHistory,
  onApplyPresetDays,
  onOpenProfileModal,
}: GymAiCoachDrawerProps) {
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!open) return null;

  const goalMeta =
    GYM_PRIMARY_GOAL_META[userProfile.primaryGoal] ||
    GYM_PRIMARY_GOAL_META.glute_sculpt;

  const buildSnapshot = (): GymAiUserSnapshot => {
    const customDaysSummary = customDays.map((d) => {
      const exNames = d.exerciseIds
        .slice(0, 6)
        .map((id) => GYM_EXERCISE_MAP[id]?.vietnameseName || id)
        .join(', ');
      return `${d.dayLabel} (${d.title}): ${exNames}`;
    });

    const exerciseLogsSummary = Object.values(exerciseLogs)
      .slice(0, 12)
      .map((log) => {
        const name =
          GYM_EXERCISE_MAP[log.exerciseId]?.vietnameseName || log.exerciseId;
        return `${name}: ${log.weightKg}kg`;
      });

    return {
      userProfile,
      cycleTracking,
      resolvedCyclePhase: cycleStatus.phase,
      activeDayTitle: `${activeDay.dayLabel}: ${activeDay.title}`,
      currentExerciseName: `${currentExercise.vietnameseName} (${currentExercise.name})`,
      workoutStreak,
      customDaysSummary,
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
        userProfile,
        cycleStatus,
        currentExercise
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

  const glutePreset = GYM_SPLIT_PRESETS.find(
    (p) => p.id === 'female_glute_sculpt_5day'
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Huấn luyện viên AI cá nhân"
    >
      <div className="bg-[#111114] border-l border-[#2C2C38] text-[#F7F7F7] w-full max-w-xl h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-[#272732] flex items-center justify-between gap-2 bg-[#16161C]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5C8A] text-[#111114] flex items-center justify-center shadow-lg shadow-[#FF5C8A]/25">
              <Bot size={20} />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black flex items-center gap-2">
                <span>KeyT Neon AI Coach</span>
                <span className="px-2 py-0.5 rounded-full bg-[#A3F77B]/15 text-[#A3F77B] text-[10px] font-extrabold">
                  Biết Full Hồ Sơ Của Bạn
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Tư vấn bài tập, mức tạ, chu kỳ kinh nguyệt &amp; dinh dưỡng cho{' '}
                <strong className="text-[#FF5C8A]">{userProfile.nickname}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {chatHistory.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                title="Xóa lịch sử trò chuyện"
                aria-label="Xóa lịch sử trò chuyện"
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-[#22222C] transition-colors cursor-pointer"
              >
                <Trash2 size={17} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng khung chat AI"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#22222C] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Live Context Summary Bar (Shows what AI currently knows about the user) */}
        <div className="px-4 py-2.5 bg-[#18181F] border-b border-[#272732] flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5 text-zinc-300">
            <span className="px-2 py-0.5 rounded-full bg-[#252530] font-bold text-[#F7F7F7]">
              {userProfile.heightCm}cm • {userProfile.weightKg}kg
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#252530] font-bold text-[#FF85A9]">
              Eo/Mông: {userProfile.waistCm}/{userProfile.hipCm}cm
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#252530] font-bold text-[#A3F77B]">
              {cycleStatus.phaseShortVi}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#252530] font-bold text-[#7CE7FF]">
              {goalMeta.shortVi}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenProfileModal();
            }}
            className="text-[#FF5C8A] font-extrabold hover:underline cursor-pointer"
          >
            Sửa TT
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Welcome Card */}
          {chatHistory.length === 0 && (
            <div className="rounded-2xl bg-[#18181F] border border-[#2C2C38] p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FF5C8A]">
                <Sparkles size={14} />
                <span>Trợ Lý Cá Nhân Hóa Đã Nắm Rõ Hồ Sơ Của Bạn</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Chào <strong>{userProfile.nickname}</strong>! Mình đã đồng bộ chỉ số cơ
                thể (<strong>{userProfile.heightCm}cm, {userProfile.weightKg}kg</strong>,
                V2/V3 <strong>{userProfile.waistCm}/{userProfile.hipCm}cm</strong>), trạng
                thái <strong>{cycleStatus.phaseTitleVi}</strong> và bài tập đang mở (
                <strong>{currentExercise.vietnameseName}</strong>). Bạn có thể hỏi mình bất
                kỳ điều gì!
              </p>

              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-zinc-400">
                  Bấm chọn nhanh câu hỏi gợi ý:
                </div>
                {QUICK_PROMPTS_VI.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSendQuestion(q)}
                    className="w-full text-left p-2.5 rounded-xl bg-[#111114] hover:bg-[#22222C] border border-[#2A2A36] hover:border-[#FF5C8A] text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatHistory.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isUser
                      ? 'bg-[#282834] text-[#F7F7F7]'
                      : 'bg-[#FF5C8A] text-[#111114]'
                  }`}
                >
                  {isUser ? <User size={14} /> : <Bot size={15} />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-[#FF5C8A] text-[#111114] font-bold'
                      : 'bg-[#18181F] border border-[#2C2C38] text-[#F7F7F7]'
                  }`}
                >
                  {msg.content}
                  {!isUser && glutePreset && (
                    <div className="mt-2.5 pt-2 border-t border-[#2C2C38] flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] text-zinc-400">
                        {msg.provider || 'KeyT AI Coach'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onApplyPresetDays(glutePreset.days)}
                        className="px-2.5 py-1 rounded-lg bg-[#A3F77B] text-[#111114] text-[11px] font-black cursor-pointer"
                      >
                        Áp dụng Lịch Độ Mông S-Line
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#FF5C8A] font-bold px-2">
              <Loader2 size={15} className="animate-spin" />
              <span>AI Coach đang phân tích hồ sơ &amp; chu kỳ của bạn...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuestion(input);
          }}
          className="p-3.5 bg-[#16161C] border-t border-[#272732] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi AI mọi thứ về chỉ số của bạn, bài tập, chu kỳ, ăn uống..."
            aria-label="Nhập câu hỏi cho AI Coach"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#111114] border border-[#2E2E3A] text-xs sm:text-sm text-[#F7F7F7] placeholder:text-zinc-500 focus:outline-none focus:border-[#FF5C8A]"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Gửi câu hỏi"
            className="h-10 px-4 rounded-xl bg-[#FF5C8A] hover:bg-[#ff4278] disabled:opacity-40 text-[#111114] text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send size={14} />
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
}
