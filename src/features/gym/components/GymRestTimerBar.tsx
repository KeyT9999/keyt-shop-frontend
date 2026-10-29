import { useEffect, useState } from 'react';
import { BellRing, Pause, Play, RotateCcw, Timer } from 'lucide-react';

interface GymRestTimerBarProps {
  defaultSeconds: number;
}

function playGentleRestChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.46);
  } catch {
    // Audio autoplay blocked or unsupported; visual alert still shows
  }
}

function formatClock(totalSec: number): string {
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function GymRestTimerBar({ defaultSeconds }: GymRestTimerBarProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(defaultSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [finishedAlert, setFinishedAlert] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning) return;

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setIsRunning(false);
          setFinishedAlert(true);
          playGentleRestChime();
          return defaultSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [isRunning, defaultSeconds]);

  const handleToggle = () => {
    setFinishedAlert(false);
    setIsRunning((prev) => !prev);
  };

  const handleQuickPreset = (sec: number) => {
    setFinishedAlert(false);
    setSecondsLeft(sec);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setFinishedAlert(false);
    setSecondsLeft(defaultSeconds);
  };

  return (
    <div
      className={`rounded-2xl border px-4 py-3 flex flex-wrap items-center justify-between gap-3 transition-colors duration-200 ${
        finishedAlert
          ? 'bg-emerald-50 border-emerald-300'
          : isRunning
            ? 'bg-orange-50/70 border-[#F05A28]/50'
            : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            finishedAlert
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-900 text-white'
          }`}
        >
          {finishedAlert ? <BellRing size={18} /> : <Timer size={18} />}
        </div>
        <div>
          <div className="text-xs font-bold text-slate-500">
            {finishedAlert
              ? 'Hết giờ nghỉ – Vào hiệp tiếp theo!'
              : 'Đồng hồ nghỉ giữa hiệp'}
          </div>
          <div className="text-xl font-black font-mono text-slate-900 tracking-tight">
            {formatClock(secondsLeft)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {[60, 90, 120].map((presetSec) => (
          <button
            key={presetSec}
            type="button"
            onClick={() => handleQuickPreset(presetSec)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            {presetSec}s
          </button>
        ))}

        <button
          type="button"
          onClick={handleToggle}
          className="px-3.5 py-2 rounded-xl bg-[#F05A28] hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
          <span>{isRunning ? 'Tạm dừng' : 'Bấm nghỉ'}</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          aria-label="Đặt lại đồng hồ nghỉ"
          title="Đặt lại đồng hồ nghỉ"
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  );
}
