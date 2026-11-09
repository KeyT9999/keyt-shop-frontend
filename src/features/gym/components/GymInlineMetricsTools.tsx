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
  Sparkles,
} from 'lucide-react';
import type {
  GymExerciseDefinition,
  GymExerciseUserLog,
} from '../types/gym';
import type { SmartSetRecommendation } from '../utils/gymCycleAndProgressionUtils';

interface GymInlineMetricsToolsProps {
  exercise: GymExerciseDefinition;
  savedLog?: GymExerciseUserLog;
  recommendation?: SmartSetRecommendation;
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

export default function GymInlineMetricsTools({
  exercise,
  savedLog,
  recommendation,
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
    <div className="border-t border-b border-[#272732] bg-[#14141A] px-3 sm:px-5 py-2.5 space-y-2.5 text-[#F7F7F7]">
      {/* Main Compact Row: Sets x Reps | Inline Rest Timer | Smart Suggestion | Quick +/- Weight */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Sets & Reps */}
        <div className="flex items-center gap-2.5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Hiệp × Lần
            </div>
            <div className="text-sm sm:text-base font-black text-[#F7F7F7] leading-tight">
              {exercise.sets} <span className="text-zinc-500 font-semibold">×</span>{' '}
              {exercise.reps}
            </div>
          </div>

          <div className="h-7 w-px bg-[#282834]" />

          {/* 1-Tap Rest Timer Pill */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setFinishedAlert(false);
                setIsRunning((r) => !r);
              }}
              className={`h-9 px-2.5 sm:px-3 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors duration-150 cursor-pointer ${
                finishedAlert
                  ? 'bg-[#A3F77B] text-[#111114]'
                  : isRunning
                    ? 'bg-[#7CE7FF] text-[#111114]'
                    : 'bg-[#FF5C8A] hover:bg-[#ff4278] text-[#111114]'
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
                className="w-8 h-9 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] hover:bg-[#252530] text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Smart Set Recommendation Pill + Inline Weight Stepper */}
        <div className="flex items-center gap-1.5 ml-auto">
          {recommendation &&
            recommendation.recommendedWeightKg > 0 &&
            recommendation.recommendedWeightKg !== weightKg && (
              <button
                type="button"
                onClick={() => persistWeight(recommendation.recommendedWeightKg)}
                title={recommendation.reasonVi}
                className="hidden sm:inline-flex items-center gap-1 h-9 px-2.5 rounded-xl bg-[#A3F77B]/15 border border-[#A3F77B]/40 text-[#A3F77B] text-[11px] font-extrabold cursor-pointer"
              >
                <Sparkles size={12} />
                <span>{recommendation.badgeTextVi}</span>
              </button>
            )}

          <button
            type="button"
            onClick={() => persistWeight(Math.max(0, weightKg - 2.5))}
            aria-label="Giảm 2.5kg"
            className="w-8 h-9 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] hover:bg-[#252530] text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Minus size={14} />
          </button>

          <button
            type="button"
            onClick={() => setNotesOpen((o) => !o)}
            title="Bấm để sửa mức tạ chi tiết hoặc ghi nấc ghế"
            className="h-9 px-2.5 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] hover:border-[#FF5C8A] text-xs font-black text-[#F7F7F7] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Dumbbell size={12} className="text-[#FF5C8A]" />
            <span>{justSaved ? 'Đã lưu!' : `${weightKg}kg`}</span>
          </button>

          <button
            type="button"
            onClick={() => persistWeight(weightKg + 2.5)}
            aria-label="Tăng 2.5kg"
            className="w-8 h-9 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] hover:bg-[#252530] text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
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
                ? 'bg-[#FF5C8A]/18 border-[#FF5C8A] text-[#FF5C8A]'
                : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-300 hover:bg-[#252530]'
            }`}
          >
            <NotebookPen size={14} />
          </button>
        </div>
      </div>

      {/* Saved Personal Seat Tip Quick Pill */}
      {!notesOpen && (personalTip || repsNote) && (
        <div className="text-xs text-zinc-300 flex flex-wrap items-center gap-2">
          {personalTip && (
            <span className="px-2 py-0.5 rounded-lg bg-[#FF5C8A]/15 border border-[#FF5C8A]/40 text-[#FF85A9] font-semibold">
              Ghi nhớ máy: {personalTip}
            </span>
          )}
          {repsNote && (
            <span className="px-2 py-0.5 rounded-lg bg-[#22222C] text-zinc-300 font-semibold">
              Buổi trước: {repsNote}
            </span>
          )}
        </div>
      )}

      {/* Expandable Drawer for Custom Weight / Seat Pin / Timer Presets */}
      {notesOpen && (
        <div className="pt-2 border-t border-[#272732] space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-zinc-400">
              Đơn vị: {exercise.weightUnitLabel}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 font-semibold">Đếm nhanh:</span>
              {[60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    setFinishedAlert(false);
                    setSecondsLeft(sec);
                    setIsRunning(true);
                  }}
                  className="px-2 py-0.5 rounded-lg border border-[#2E2E3A] bg-[#1B1B22] hover:bg-[#252530] font-bold text-zinc-200 cursor-pointer"
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
              className="px-3 py-1.5 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] text-xs font-extrabold text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
            />
            <input
              type="text"
              value={repsNote}
              onChange={(e) => setRepsNote(e.target.value)}
              placeholder="Ghi hiệp (VD: 3x12 tốt)"
              aria-label="Ghi chú số hiệp"
              className="px-3 py-1.5 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] text-xs font-medium text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
            />
            <input
              type="text"
              value={personalTip}
              onChange={(e) => setPersonalTip(e.target.value)}
              placeholder="Nấc ghế / Ghim (VD: Ghế số 3)"
              aria-label="Ghi chú nấc ghế"
              className="px-3 py-1.5 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] text-xs font-medium text-[#F7F7F7] focus:outline-none focus:border-[#FF5C8A]"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              persistWeight(weightKg);
              setNotesOpen(false);
            }}
            className="w-full py-2 px-3 rounded-xl bg-[#FF5C8A] hover:bg-[#ff4278] text-[#111114] text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save size={13} />
            <span>Lưu mức tạ &amp; nấc ghế</span>
          </button>
        </div>
      )}
    </div>
  );
}
