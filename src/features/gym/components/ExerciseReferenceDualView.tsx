import { useState } from 'react';
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
    <div className="rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 divide-x divide-slate-800 h-56 sm:h-76 bg-slate-900">
        {/* Frame 1: Start Pose */}
        <figure className="relative h-full bg-slate-800/80 overflow-hidden flex items-center justify-center">
          {!failedIdx[startKey] ? (
            <img
              src={exercise.referenceImages[0]}
              alt={`${exercise.name} - Tư thế bắt đầu`}
              loading="lazy"
              onError={() => setFailedIdx((p) => ({ ...p, [startKey]: true }))}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-3 text-center text-xs text-slate-300 font-medium">
              Xem tab 3D • chế độ &ldquo;Đầu&rdquo;
            </div>
          )}
          <figcaption className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-slate-950/85 backdrop-blur-xs text-white text-[11px] sm:text-xs font-extrabold">
            1. Bắt đầu
          </figcaption>
        </figure>

        {/* Frame 2: Peak Contraction Pose */}
        <figure className="relative h-full bg-slate-800/80 overflow-hidden flex items-center justify-center">
          {!failedIdx[peakKey] ? (
            <img
              src={exercise.referenceImages[1]}
              alt={`${exercise.name} - Tư thế đỉnh co cơ`}
              loading="lazy"
              onError={() => setFailedIdx((p) => ({ ...p, [peakKey]: true }))}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-3 text-center text-xs text-slate-300 font-medium">
              Xem tab 3D • chế độ &ldquo;Đỉnh&rdquo;
            </div>
          )}
          <figcaption className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-[#F05A28]/95 backdrop-blur-xs text-white text-[11px] sm:text-xs font-extrabold">
            2. Đỉnh co cơ
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
