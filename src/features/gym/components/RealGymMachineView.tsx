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
    <div className="relative h-56 sm:h-76 w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0B1220] shadow-sm select-none">
      {/* Subtle blurred ambient backdrop so portrait gym photos fill wide viewports cleanly */}
      <img
        src={exercise.realGymPhoto}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-35 pointer-events-none"
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
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80 shadow-xs">
          <MapPin size={12} className="text-[#F05A28] shrink-0" />
          <span className="text-[11px] sm:text-xs font-extrabold text-white truncate">
            Máy thực tế tại phòng Gym của bạn
          </span>
        </div>

        {onSwitchTo3D && (
          <button
            type="button"
            onClick={onSwitchTo3D}
            className="pointer-events-auto px-2.5 py-1 rounded-xl bg-[#F05A28] hover:bg-orange-600 text-white text-[11px] sm:text-xs font-extrabold inline-flex items-center gap-1 shadow-xs transition-colors duration-150 cursor-pointer shrink-0"
          >
            <Rotate3d size={12} />
            <span>Xem 3D</span>
          </button>
        )}
      </div>

      {/* Bottom machine placard caption */}
      <div className="pointer-events-none absolute bottom-2 left-2.5 right-2.5 z-20">
        <div className="px-2.5 py-1.5 rounded-xl bg-slate-900/88 backdrop-blur-md border border-slate-700/80 flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-100 font-bold">
          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
          <span className="truncate">{exercise.machineName}</span>
        </div>
      </div>
    </div>
  );
}
