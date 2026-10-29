import { useState } from 'react';
import { Camera, CheckCircle2, Wrench } from 'lucide-react';
import type { GymExerciseDefinition } from '../types/gym';

interface ExerciseReferenceDualViewProps {
  exercise: GymExerciseDefinition;
}

export default function ExerciseReferenceDualView({
  exercise,
}: ExerciseReferenceDualViewProps) {
  const [failedIdx, setFailedIdx] = useState<Record<string, boolean>>({});

  const startKey = `${exercise.id}_0`;
  const peakKey = `${exercise.id}_1`;

  return (
    <div className="space-y-3">
      {/* Side-by-side Start Pose & Peak Contraction Pose (matching user's Hammer Curl layout) */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Camera size={14} className="text-[#F05A28]" />
            <span>Đối chiếu thực tế: Tư thế Bắt đầu &amp; Đỉnh co cơ</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">2 góc biên độ chuẩn</span>
        </div>

        <div className="grid grid-cols-2 divide-x divide-slate-200 bg-slate-100">
          {/* Frame 1: Start Pose */}
          <figure className="relative aspect-4/3 bg-slate-100 overflow-hidden flex items-center justify-center">
            {!failedIdx[startKey] ? (
              <img
                src={exercise.referenceImages[0]}
                alt={`${exercise.name} - Tư thế bắt đầu`}
                loading="lazy"
                onError={() => setFailedIdx((p) => ({ ...p, [startKey]: true }))}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 font-medium">
                Xem mô hình 3D ở chế độ &ldquo;Tư thế Đầu&rdquo;
              </div>
            )}
            <figcaption className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold">
              1. Bắt đầu (Start)
            </figcaption>
          </figure>

          {/* Frame 2: Peak Contraction Pose */}
          <figure className="relative aspect-4/3 bg-slate-100 overflow-hidden flex items-center justify-center">
            {!failedIdx[peakKey] ? (
              <img
                src={exercise.referenceImages[1]}
                alt={`${exercise.name} - Tư thế đỉnh co cơ`}
                loading="lazy"
                onError={() => setFailedIdx((p) => ({ ...p, [peakKey]: true }))}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 font-medium">
                Xem mô hình 3D ở chế độ &ldquo;Đỉnh Co Cơ&rdquo;
              </div>
            )}
            <figcaption className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-[#F05A28]/95 backdrop-blur-xs text-white text-xs font-bold">
              2. Đỉnh co cơ (Peak)
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Machine / Equipment Quick Identification Box */}
      <div className="rounded-2xl border border-orange-200/80 bg-orange-50/50 p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#F05A28]/15 text-[#F05A28] flex items-center justify-center shrink-0 mt-0.5">
          <Wrench size={18} />
        </div>
        <div className="space-y-1 min-w-0">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#F05A28]">
            Dụng cụ / Máy tập cần tìm tại phòng Gym
          </div>
          <p className="text-sm font-bold text-slate-900 leading-snug">
            {exercise.machineName}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5 pt-0.5">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-800">Mẹo chỉnh máy:</strong> {exercise.machineSetupTip}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
