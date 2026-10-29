import { useEffect, useState } from 'react';
import {
  BellRing,
  Dumbbell,
  Minus,
  NotebookPen,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
} from 'lucide-react';
import type {
  GymExerciseDefinition,
  GymExerciseUserLog,
} from '../types/gym';

interface GymInlineMetricsToolsProps {
  exercise: GymExerciseDefinition;
  savedLog?: GymExerciseUserLog;
  onSaveLog: (weightKg: number, repsNote: string, personalTip: string) => void;
}

function playGentleRestChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
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
    // Visual alert remains active if audio autoplay is blocked
  }
}

function formatClock(totalSec: number): string {
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Decision: Unify Sets/Reps metrics, 1-tap Rest Timer, and +/-2.5kg Weight Stepper
 * into a single compact horizontal strip (~56px) right below the 3D stage so that
 * "Máy tập & Cách thực hiện" stay visible above the fold on mobile phones.
 */
export default function GymInlineMetricsTools({
  exercise,
  savedLog,
  onSaveLog,
}: GymInlineMetricsToolsProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(exercise.restSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [finishedAlert, setFinishedAlert] = useState<boolean>(false);

  const [weightKg, setWeightKg] = useState<number>(
    savedLog?.weightKg ?? exercise.defaultWeightKg
  );
  const [repsNote, setRepsNote] = useState<string>(savedLog?.repsNote ?? '');
  const [personalTip, setPersonalTip] = useState<string>(savedLog?.personalTip ?? '');
  const [notesOpen, setNotesOpen] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setIsRunning(false);
          setFinishedAlert(true);
          playGentleRestChime();
          return exercise.restSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning, exercise.restSeconds]);

  const persistWeight = (nextW: number, nextR = repsNote, nextT = personalTip) => {
    const clean = Math.max(0, Number(nextW.toFixed(1)));
    setWeightKg(clean);
    onSaveLog(clean, nextR, nextT);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1400);
  };

  return (
    <div className="border-t border-b border-slate-200 bg-slate-50/70 px-3 sm:px-5 py-2.5 space-y-2.5">
      {/* Main Compact Row: Sets x Reps | Inline Rest Timer | Quick +/- Weight */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Sets & Reps */}
        <div className="flex items-center gap-2.5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Hiệp × Lần
            </div>
            <div className="text-sm sm:text-base font-black text-slate-900 leading-tight">
              {exercise.sets} <span className="text-slate-400 font-semibold">×</span>{' '}
              {exercise.reps}
            </div>
          </div>

          <div className="h-7 w-px bg-slate-200" />

          {/* 1-Tap Rest Timer Pill */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setFinishedAlert(false);
                setIsRunning((r) => !r);
              }}
              className={`h-9 px-2.5 sm:px-3 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors duration-150 cursor-pointer ${
                finishedAlert
                  ? 'bg-emerald-500 text-white'
                  : isRunning
                    ? 'bg-[#1E293B] text-white'
                    : 'bg-[#F05A28] hover:bg-orange-600 text-white'
              }`}
            >
              {finishedAlert ? (
                <BellRing size={13} />
              ) : isRunning ? (
                <Pause size={13} />
              ) : (
                <Play size={13} />
              )}
              <span className="font-mono text-xs sm:text-sm">
                {isRunning ? formatClock(secondsLeft) : `Nghỉ ${exercise.restSeconds}s`}
              </span>
            </button>

            {(isRunning || secondsLeft !== exercise.restSeconds) && (
              <button
                type="button"
                onClick={() => {
                  setIsRunning(false);
                  setFinishedAlert(false);
                  setSecondsLeft(exercise.restSeconds);
                }}
                aria-label="Đặt lại đồng hồ nghỉ"
                className="w-8 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Inline Weight Stepper + Seat Note Toggle */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={() => persistWeight(Math.max(0, weightKg - 2.5))}
            aria-label="Giảm 2.5kg"
            className="w-8 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Minus size={14} />
          </button>

          <button
            type="button"
            onClick={() => setNotesOpen((o) => !o)}
            title="Bấm để sửa mức tạ chi tiết hoặc ghi nấc ghế"
            className="h-9 px-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#F05A28] text-xs font-black text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Dumbbell size={12} className="text-[#F05A28]" />
            <span>{justSaved ? 'Đã lưu!' : `${weightKg}kg`}</span>
          </button>

          <button
            type="button"
            onClick={() => persistWeight(weightKg + 2.5)}
            aria-label="Tăng 2.5kg"
            className="w-8 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Plus size={14} />
          </button>

          <button
            type="button"
            onClick={() => setNotesOpen((o) => !o)}
            aria-label="Ghi chú nấc ghế và mức tạ"
            title="Ghi chú nấc ghế / chỉnh giờ nghỉ"
            className={`w-8 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
              notesOpen || personalTip
                ? 'bg-orange-50 border-[#F05A28] text-[#F05A28]'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <NotebookPen size={14} />
          </button>
        </div>
      </div>

      {/* Saved Personal Seat Tip Quick Pill (if present & drawer closed) */}
      {!notesOpen && (personalTip || repsNote) && (
        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
          {personalTip && (
            <span className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
              Ghi nhớ máy: {personalTip}
            </span>
          )}
          {repsNote && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-200/70 text-slate-700 font-semibold">
              Buổi trước: {repsNote}
            </span>
          )}
        </div>
      )}

      {/* Expandable Drawer for Custom Weight / Seat Pin / Timer Presets */}
      {notesOpen && (
        <div className="pt-2 border-t border-slate-200/80 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-600">
              Đơn vị: {exercise.weightUnitLabel}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-semibold">Đếm nhanh:</span>
              {[60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    setFinishedAlert(false);
                    setSecondsLeft(sec);
                    setIsRunning(true);
                  }}
                  className="px-2 py-0.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="number"
              step="0.5"
              min="0"
              aria-label="Mức tạ tính bằng kg"
              value={weightKg}
              onChange={(e) => setWeightKg(Math.max(0, Number(e.target.value) || 0))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-900 focus:outline-none focus:border-[#F05A28]"
            />
            <input
              type="text"
              value={repsNote}
              onChange={(e) => setRepsNote(e.target.value)}
              placeholder="Ghi hiệp (VD: 3x12 tốt)"
              aria-label="Ghi chú số hiệp"
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#F05A28]"
            />
            <input
              type="text"
              value={personalTip}
              onChange={(e) => setPersonalTip(e.target.value)}
              placeholder="Nấc ghế / Ghim (VD: Ghế số 3)"
              aria-label="Ghi chú nấc ghế"
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#F05A28]"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              persistWeight(weightKg);
              setNotesOpen(false);
            }}
            className="w-full py-2 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save size={13} />
            <span>Lưu mức tạ &amp; nấc ghế</span>
          </button>
        </div>
      )}
    </div>
  );
}
