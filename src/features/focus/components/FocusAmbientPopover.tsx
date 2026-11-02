import {
  CloudRain,
  Coffee,
  Flame,
  Keyboard,
  Music2,
  RotateCcw,
  Trees,
  Volume2,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { useFocusCafeContext } from '../../../context/useFocusCafeContext';
import { FOCUS_AMBIENT_SOUNDS, FOCUS_TRACKS } from '../data/focusCatalog';
import type { FocusAmbientId } from '../types/focusTypes';

const AMBIENT_ICON_MAP: Record<FocusAmbientId, LucideIcon> = {
  rain: CloudRain,
  cafe: Coffee,
  campfire: Flame,
  keyboard: Keyboard,
  forest: Trees,
  waves: Waves,
};

export default function FocusAmbientPopover() {
  const {
    currentTrack,
    musicVolume,
    ambientVolumes,
    selectTrack,
    setMusicVolume,
    setAmbientVolume,
    resetAmbients,
  } = useFocusCafeContext();

  return (
    <div className="w-[320px] sm:w-[360px] rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.65)] p-4 text-white">
      {/* Master Lofi Music Section */}
      <div className="pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Music2 size={14} className="text-[#F05A28]" />
            <span>Kênh Nhạc Lofi</span>
          </div>
          <span className="text-xs font-semibold text-slate-300 tabular-nums">
            {Math.round(musicVolume * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2.5 mb-3">
          <Volume2 size={15} className="text-slate-300 shrink-0" />
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(musicVolume * 100)}
            aria-label="Âm lượng nhạc Lofi"
            onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
            className="w-full accent-[#F05A28] h-1.5 bg-white/15 rounded-lg cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-0.5">
          {FOCUS_TRACKS.map((track) => {
            const active = track.id === currentTrack.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => selectTrack(track.id)}
                className={`text-left px-2.5 py-1.5 rounded-xl border text-xs transition-colors duration-200 cursor-pointer ${
                  active
                    ? 'bg-[#F05A28]/20 border-[#F05A28]/60 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="font-semibold truncate">{track.title}</div>
                <div className="text-[11px] text-slate-400">{track.moodLabel}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ambient Sound Mixer Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Trộn Âm Thanh Đời Thực
          </span>
          <button
            type="button"
            onClick={resetAmbients}
            className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Tắt hết</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {FOCUS_AMBIENT_SOUNDS.map((item) => {
            const Icon = AMBIENT_ICON_MAP[item.id];
            const val = Math.round((ambientVolumes[item.id] ?? 0) * 100);
            return (
              <div key={item.id} className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setAmbientVolume(item.id, val > 0 ? 0 : 0.45)
                  }
                  title={val > 0 ? `Tắt ${item.label}` : `Bật ${item.label}`}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 cursor-pointer ${
                    val > 0
                      ? 'bg-[#F05A28] text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  <Icon size={14} />
                </button>
                <span className="text-xs font-medium text-slate-200 w-20 shrink-0">
                  {item.label}
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={val}
                  aria-label={`Âm lượng ${item.label}`}
                  onChange={(e) =>
                    setAmbientVolume(item.id, Number(e.target.value) / 100)
                  }
                  className="flex-1 accent-[#F05A28] h-1.5 bg-white/15 rounded-lg cursor-pointer"
                />
                <span className="w-8 text-right text-xs text-slate-300 tabular-nums">
                  {val}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
