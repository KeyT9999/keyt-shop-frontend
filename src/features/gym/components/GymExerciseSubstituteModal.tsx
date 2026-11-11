import { ArrowRightLeft, Ban, Check, RefreshCw, ShieldAlert, X } from 'lucide-react';
import { GYM_EXERCISE_CATALOG } from '../data/defaultGymCatalog';
import type {
  GymExerciseDefinition,
  GymExerciseRestriction,
  GymFemaleBodyProfile,
  GymGenderMode,
  GymRestrictionKind,
} from '../types/gym';
import { rankExerciseSubstitutes } from '../utils/gymExerciseSubstitutionUtils';

interface GymExerciseSubstituteModalProps {
  open: boolean;
  gender?: GymGenderMode;
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
  gender,
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

  const resolvedGender: GymGenderMode =
    gender || (userProfile.gender === 'male' ? 'male' : 'female');
  const isMale = resolvedGender === 'male';

  const currentRestriction = restrictions.find(
    (r) => r.exerciseId === currentExercise.id
  )?.kind;

  const rankedSubstitutes = rankExerciseSubstitutes(
    currentExercise,
    GYM_EXERCISE_CATALOG,
    {
      gender: resolvedGender,
      currentDayExerciseIds,
      restrictions,
      userProfile,
      isDeloadOrPeriod,
      limit: 5,
    }
  );

  const reasonOptions: Array<{ kind: GymRestrictionKind; label: string }> = isMale
    ? [
        { kind: 'busy', label: 'Máy đang có người tập (Kẹt máy)' },
        { kind: 'injury', label: 'Tập bài này thấy cấn vai / mỏi lưng' },
        { kind: 'dislike', label: 'Không hợp form / Muốn bài bơm cơ hơn' },
      ]
    : [
        { kind: 'busy', label: 'Máy đang có người tập (Kẹt máy)' },
        { kind: 'injury', label: 'Tập bài này thấy mỏi lưng / đau khớp' },
        { kind: 'dislike', label: 'Không thích / Sợ vào đùi trước' },
      ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Đổi bài tập tương đương"
    >
      <div className="bg-white border border-slate-200 rounded-3xl text-slate-900 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-50 border border-orange-200 text-[#F05A28] flex items-center justify-center shrink-0">
              <RefreshCw size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Đổi Bài Tương Đương ({isMale ? 'Gym Nam' : 'Gym Nữ'})
              </h2>
              <p className="text-xs text-slate-500">
                Đang thay cho:{' '}
                <strong className="text-slate-900">
                  {currentExercise.vietnameseName}
                </strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại đổi bài"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60">
          {/* Why replacing? Quick flag buttons */}
          <div className="rounded-2xl bg-white border border-slate-200 p-3.5 space-y-2.5">
            <div className="text-xs font-semibold text-slate-600">
              Vì sao bạn muốn đổi bài này? (Hệ thống ghi nhớ để hạn chế gợi ý lại):
            </div>
            <div className="flex flex-wrap gap-2">
              {reasonOptions.map((item) => {
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
                        ? 'bg-[#1E293B] border-[#1E293B] text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
              Bài tập thay thế phù hợp nhất tại phòng tập
            </div>

            {rankedSubstitutes.map((item, idx) => (
              <div
                key={item.exercise.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-3 transition-colors shadow-2xs"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 text-[#F05A28] border border-orange-200">
                      Gợi ý #{idx + 1}
                    </span>
                    {item.reasonBadgesVi.map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 truncate">
                    {item.exercise.vietnameseName}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {item.exercise.machineName}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectSubstitute(item.exercise.id);
                    onClose();
                  }}
                  className="shrink-0 px-3.5 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#d94d1f] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ArrowRightLeft size={13} />
                  <span>Đổi sang bài này</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <Check size={14} className="text-emerald-600" />
            <span>Tự động chọn cùng nhóm cơ &amp; thiết bị sẵn có</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
