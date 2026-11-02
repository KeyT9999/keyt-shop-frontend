import { Check, CloudRain, Moon, Sparkles, Sun } from 'lucide-react';
import { useFocusCafeContext } from '../../../context/useFocusCafeContext';
import { FOCUS_SCENES, LOFT_VARIANT_MEDIA } from '../data/focusCatalog';
import type { LoftWeatherVariant } from '../types/focusTypes';

const LOFT_VARIANTS_ORDER: LoftWeatherVariant[] = [
  'night-rainy',
  'night-clear',
  'day-sunny',
  'day-rainy',
];

export default function FocusScenePopover() {
  const { selectedSceneId, loftVariant, selectScene, setLoftVariant } =
    useFocusCafeContext();

  return (
    <div className="w-[332px] sm:w-[420px] rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.65)] p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-200">
          <Sparkles size={14} className="text-[#F05A28]" />
          <span>Chọn Không Gian Học Tập (6 Cảnh)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-0.5">
        {FOCUS_SCENES.map((scene) => {
          const isSelected = scene.id === selectedSceneId;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => selectScene(scene.id)}
              className={`group relative rounded-2xl overflow-hidden border text-left transition-colors duration-200 cursor-pointer ${
                isSelected
                  ? 'border-[#F05A28] ring-2 ring-[#F05A28]/40'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="relative aspect-video w-full bg-slate-900">
                <img
                  src={scene.posterUrl}
                  alt={scene.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/75 text-amber-200 border border-white/15">
                  {scene.badge}
                </span>
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#F05A28] text-white flex items-center justify-center">
                    <Check size={12} />
                  </span>
                )}
                <div className="absolute bottom-2 left-2.5 right-2.5">
                  <div className="text-xs font-bold text-white leading-tight truncate">
                    {scene.title}
                  </div>
                  <div className="text-[11px] text-slate-300 truncate">
                    {scene.subtitle}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Weather / Day-Night Switcher when Loft Room is selected */}
      {selectedSceneId === 'loft-room' && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-xs font-semibold text-slate-300 mb-2">
            Chế độ thời tiết Căn Gác Xép:
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {LOFT_VARIANTS_ORDER.map((variant) => {
              const meta = LOFT_VARIANT_MEDIA[variant];
              const active = loftVariant === variant;
              return (
                <button
                  key={variant}
                  type="button"
                  onClick={() => setLoftVariant(variant)}
                  className={`flex flex-col items-center gap-1 py-2 px-1.5 rounded-xl border text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                    active
                      ? 'bg-[#F05A28] border-[#F05A28] text-white'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {meta.isNight ? <Moon size={12} /> : <Sun size={12} />}
                    {meta.isRainy && <CloudRain size={12} />}
                  </div>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
