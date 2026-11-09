import { ArrowRightLeft, Ban, Check, RefreshCw, ShieldAlert, X } from 'lucide-react';
import { GYM_EXERCISE_CATALOG } from '../data/defaultGymCatalog';
import type {
  GymExerciseDefinition,
  GymExerciseRestriction,
  GymFemaleBodyProfile,
  GymRestrictionKind,
} from '../types/gym';
import { rankExerciseSubstitutes } from '../utils/gymExerciseSubstitutionUtils';

interface GymExerciseSubstituteModalProps {
  open: boolean;
  currentExercise: GymExerciseDefinition;
  currentDayExerciseIds: string[];
  restrictions: GymExerciseRestriction[];
  userProfile: GymFemaleBodyProfile;
  isDeloadOrPeriod: boolean;
  onClose: () => void;
  onSelectSubstitute: (newExerciseId: string) => void;
  onSetRestriction: (exerciseId: string, kind: GymRestrictionKind | null) => void;
}

export default function GymExerciseSubstituteModal({
  open,
  currentExercise,
  currentDayExerciseIds,
  restrictions,
  userProfile,
  isDeloadOrPeriod,
  onClose,
  onSelectSubstitute,
  onSetRestriction,
}: GymExerciseSubstituteModalProps) {
  if (!open) return null;

  const currentRestriction = restrictions.find(
    (r) => r.exerciseId === currentExercise.id
  )?.kind;

  const rankedSubstitutes = rankExerciseSubstitutes(
    currentExercise,
    GYM_EXERCISE_CATALOG,
    {
      currentDayExerciseIds,
      restrictions,
      userProfile,
      isDeloadOrPeriod,
      limit: 5,
    }
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Đổi bài tập tương đương"
    >
      <div className="bg-[#16161C] border border-[#2C2C38] rounded-3xl text-[#F7F7F7] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#272732] flex items-center justify-between gap-3 bg-[#111114]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#A3F77B]/15 border border-[#A3F77B]/40 text-[#A3F77B] flex items-center justify-center">
              <RefreshCw size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#F7F7F7]">
                Đổi Bài Thông Minh 0đ (Smart Substitution)
              </h2>
              <p className="text-xs text-zinc-400">
                Đang thay cho:{' '}
                <strong className="text-[#FF5C8A]">
                  {currentExercise.vietnameseName}
                </strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại đổi bài"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#24242F] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Why replacing? Quick flag buttons */}
          <div className="rounded-2xl bg-[#111114] border border-[#272732] p-3.5 space-y-2">
            <div className="text-xs font-bold text-zinc-400">
              Vì sao bạn muốn đổi bài này? (Hệ thống sẽ ghi nhớ để tránh gợi ý lại):
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { kind: 'busy', label: 'Máy đang có người tập (Kẹt máy)' },
                  { kind: 'injury', label: 'Tập bài này thấy mỏi lưng / đau khớp' },
                  { kind: 'dislike', label: 'Không thích / Sợ vào đùi trước' },
                ] as const
              ).map((item) => {
                const isSelected = currentRestriction === item.kind;
                return (
                  <button
                    key={item.kind}
                    type="button"
                    onClick={() =>
                      onSetRestriction(
                        currentExercise.id,
                        isSelected ? null : item.kind
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF5C8A] border-[#FF5C8A] text-[#111114]'
                        : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    {item.kind === 'injury' ? (
                      <ShieldAlert size={13} />
                    ) : (
                      <Ban size={13} />
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ranked Substitute List */}
          <div className="space-y-2.5">
            <div className="text-xs font-black uppercase tracking-wider text-[#A3F77B]">
              Top Bài Tập Thay Thế Phù Hợp Nhất Tại Phòng Tập
            </div>

            {rankedSubstitutes.map((item, idx) => (
              <div
                key={item.exercise.id}
                className="p-3.5 rounded-2xl bg-[#111114] border border-[#272732] hover:border-[#FF5C8A] flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#FF5C8A]/18 text-[#FF5C8A] text-[11px] font-black">
                      Gợi ý #{idx + 1}
                    </span>
                    {item.reasonBadgesVi.map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-0.5 rounded-md bg-[#1E1E28] border border-[#2E2E3C] text-[11px] font-bold text-[#A3F77B]"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm font-black text-[#F7F7F7] truncate">
                    {item.exercise.vietnameseName}
                  </div>
                  <div className="text-xs text-zinc-400 truncate">
                    {item.exercise.name} • {item.exercise.machineName}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectSubstitute(item.exercise.id);
                    onClose();
                  }}
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-[#FF5C8A] hover:bg-[#ff4278] text-[#111114] text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRightLeft size={13} />
                  <span>Đổi sang bài này</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#111114] border-t border-[#272732] flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Check size={14} className="text-[#A3F77B]" />
            Chấm điểm tự động theo nhóm cơ &amp; mục tiêu nữ (0đ phí AI)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1B1B22] border border-[#2E2E3A] text-zinc-300 font-bold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
