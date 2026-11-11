import { Rotate3d } from 'lucide-react';
import { useState } from 'react';
import type { GymExerciseDefinition } from '../types/gym';

interface ExerciseReferenceDualViewProps {
  exercise: GymExerciseDefinition;
  onSwitchTo3D?: () => void;
}

export default function ExerciseReferenceDualView({
  exercise,
  onSwitchTo3D,
}: ExerciseReferenceDualViewProps) {
  const [failedIdx, setFailedIdx] = useState<Record<string, boolean>>({});

  const startKey = `${exercise.id}_0`;
  const peakKey = `${exercise.id}_1`;

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden select-none">
      {onSwitchTo3D && (
        <div className="pointer-events-none absolute top-2.5 right-2.5 z-20">
          <button
            type="button"
            onClick={onSwitchTo3D}
            className="pointer-events-auto px-2.5 py-1 rounded-full bg-[#1E293B] hover:bg-slate-800 text-white text-[11px] sm:text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-colors duration-150 cursor-pointer"
          >
            <Rotate3d size={12} />
            <span>Xoay 3D</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 divide-x divide-slate-200 h-48 sm:h-64 bg-white">
        {/* Frame 1: Start Pose */}
        <figure className="relative h-full bg-slate-50 overflow-hidden flex items-center justify-center">
          {!failedIdx[startKey] ? (
            <img
              src={exercise.referenceImages[0]}
              alt={`${exercise.name} - Tư thế bắt đầu`}
              loading="lazy"
              onError={() => setFailedIdx((p) => ({ ...p, [startKey]: true }))}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-3 text-center text-xs text-slate-500 font-medium">
              Tư thế bắt đầu
            </div>
          )}
          <figcaption className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-white/92 backdrop-blur-xs border border-slate-200 text-slate-800 text-[11px] font-bold shadow-xs">
            1. Bắt đầu
          </figcaption>
        </figure>

        {/* Frame 2: Peak Contraction Pose */}
        <figure className="relative h-full bg-slate-50 overflow-hidden flex items-center justify-center">
          {!failedIdx[peakKey] ? (
            <img
              src={exercise.referenceImages[1]}
              alt={`${exercise.name} - Tư thế đỉnh co cơ`}
              loading="lazy"
              onError={() => setFailedIdx((p) => ({ ...p, [peakKey]: true }))}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-3 text-center text-xs text-slate-500 font-medium">
              Đỉnh co cơ
            </div>
          )}
          <figcaption className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-[#F05A28] text-white text-[11px] font-bold shadow-xs">
            2. Đỉnh co cơ
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
