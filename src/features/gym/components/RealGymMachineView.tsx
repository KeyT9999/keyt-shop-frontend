import { CheckCircle2, MapPin, Rotate3d } from 'lucide-react';
import type { GymExerciseDefinition } from '../types/gym';

interface RealGymMachineViewProps {
  exercise: GymExerciseDefinition;
  onSwitchTo3D?: () => void;
}

export default function RealGymMachineView({
  exercise,
  onSwitchTo3D,
}: RealGymMachineViewProps) {
  if (!exercise.realGymPhoto) return null;

  return (
    <div className="relative h-48 sm:h-64 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 select-none">
      {/* Subtle blurred ambient backdrop so portrait gym photos fill wide viewports cleanly */}
      <img
        src={exercise.realGymPhoto}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-30 pointer-events-none"
      />

      {/* Full uncropped machine photo */}
      <img
        src={exercise.realGymPhoto}
        alt={`Ảnh thực tế ${exercise.machineName}`}
        loading="lazy"
        className="relative z-10 w-full h-full object-contain"
      />

      {/* Top badge */}
      <div className="pointer-events-none absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/92 backdrop-blur-md border border-slate-200/90 shadow-xs">
          <MapPin size={12} className="text-[#F05A28] shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">
            Máy thật tại phòng Gym
          </span>
        </div>

        {onSwitchTo3D && (
          <button
            type="button"
            onClick={onSwitchTo3D}
            className="pointer-events-auto px-2.5 py-1 rounded-full bg-[#1E293B] hover:bg-slate-800 text-white text-[11px] sm:text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-colors duration-150 cursor-pointer shrink-0"
          >
            <Rotate3d size={12} />
            <span>Xoay 3D</span>
          </button>
        )}
      </div>

      {/* Bottom machine placard caption */}
      <div className="pointer-events-none absolute bottom-2 left-2.5 right-2.5 z-20">
        <div className="px-2.5 py-1.5 rounded-xl bg-white/92 backdrop-blur-md border border-slate-200/90 flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-800 font-semibold shadow-xs">
          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
          <span className="truncate">{exercise.machineName}</span>
        </div>
      </div>
    </div>
  );
}
