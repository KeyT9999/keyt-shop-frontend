import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BellRing,
  Check,
  Disc,
  Dumbbell,
  Minus,
  NotebookPen,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Sun,
  Trophy,
} from 'lucide-react';
import type {
  GymExerciseDefinition,
  GymExerciseUserLog,
  GymGenderMode,
  GymSetDetailItem,
} from '../types/gym';
import {
  buildDefaultSetsForExercise,
  computeEstimated1RM,
  computePlateBreakdownPerSide,
  getGenderDefaultWeightKg,
  type SmartSetRecommendation,
} from '../utils/gymCycleAndProgressionUtils';

interface WakeLockSentinelLike {
  released?: boolean;
  release: () => Promise<void>;
}

interface GymInlineMetricsToolsProps {
  exercise: GymExerciseDefinition;
  gender?: GymGenderMode;
  savedLog?: GymExerciseUserLog;
  recommendation?: SmartSetRecommendation;
  onSaveLog: (
    weightKg: number,
    repsNote: string,
    personalTip: string,
    extra?: {
      seatPinNote?: string;
      setsDetail?: GymSetDetailItem[];
      setsCompletedToday?: number[];
      autoMarkCompleted?: boolean;
    }
  ) => void;
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
    // Visual + haptic alert remains active if audio autoplay is blocked
  }
}

function triggerRestVibration(): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate([180, 80, 220]);
    } catch {
      // Ignore unsupported environments
    }
  }
}

function formatClock(totalSec: number): string {
  const safe = Math.max(0, Math.round(totalSec));
  const m = String(Math.floor(safe / 60)).padStart(2, '0');
  const s = String(safe % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function resolveEquipmentStep(
  exercise: GymExerciseDefinition,
  currentWeightKg: number
): number {
  if (/quả/i.test(exercise.weightUnitLabel)) {
    return currentWeightKg < 10 ? 1 : 2;
  }
  return exercise.equipmentStepKg && exercise.equipmentStepKg > 0
    ? Math.min(5, exercise.equipmentStepKg)
    : 2.5;
}

function resolvePerSidePlateTargetKg(
  exercise: GymExerciseDefinition,
  totalOrSideWeightKg: number
): { perSideKg: number; barNoteVi: string } {
  if (/gồm đòn 20kg/i.test(exercise.weightUnitLabel)) {
    return {
      perSideKg: Math.max(0, (totalOrSideWeightKg - 20) / 2),
      barNoteVi: 'Đã trừ thanh đòn Olympic 20kg',
    };
  }
  if (/mỗi bên/i.test(exercise.weightUnitLabel)) {
    return {
      perSideKg: Math.max(0, totalOrSideWeightKg),
      barNoteVi: 'Lắp cho mỗi bên máy (Plate-loaded)',
    };
  }
  return {
    perSideKg: Math.max(0, totalOrSideWeightKg / 2),
    barNoteVi: 'Chia đều 2 bên giá tạ',
  };
}

export default function GymInlineMetricsTools({
  exercise,
  gender = 'female',
  savedLog,
  recommendation,
  onSaveLog,
}: GymInlineMetricsToolsProps) {
  const isMale = gender === 'male';
  const defaultWeight = getGenderDefaultWeightKg(exercise, gender);
  const initialWeight = savedLog?.weightKg ?? recommendation?.recommendedWeightKg ?? defaultWeight;

  // Timestamp-based Rest Timer so phone screen lock never drifts countdown
  const [secondsLeft, setSecondsLeft] = useState<number>(exercise.restSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [finishedAlert, setFinishedAlert] = useState<boolean>(false);
  const restEndAtRef = useRef<number | null>(null);

  // Optional Screen Wake Lock for gym floor usage
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);

  const [weightKg, setWeightKg] = useState<number>(initialWeight);
  const [repsNote, setRepsNote] = useState<string>(savedLog?.repsNote ?? '');
  const [personalTip, setPersonalTip] = useState<string>(
    savedLog?.seatPinNote || savedLog?.personalTip || ''
  );
  const [setsDetail, setSetsDetail] = useState<GymSetDetailItem[]>(() => {
    if (savedLog?.setsDetail && savedLog.setsDetail.length > 0) {
      return savedLog.setsDetail;
    }
    return buildDefaultSetsForExercise(exercise, initialWeight, initialWeight >= 20);
  });

  const [notesOpen, setNotesOpen] = useState<boolean>(false);
  const [showPlateCalc, setShowPlateCalc] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  const startCountdown = useCallback((durationSeconds: number) => {
    const cleanSec = Math.max(5, Math.round(durationSeconds));
    restEndAtRef.current = Date.now() + cleanSec * 1000;
    setSecondsLeft(cleanSec);
    setFinishedAlert(false);
    setIsRunning(true);
  }, []);

  const pauseCountdown = useCallback(() => {
    if (restEndAtRef.current) {
      const remaining = Math.max(
        1,
        Math.ceil((restEndAtRef.current - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);
    }
    restEndAtRef.current = null;
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const syncRemaining = () => {
      if (!restEndAtRef.current) return;
      const remaining = Math.ceil((restEndAtRef.current - Date.now()) / 1000);
      if (remaining <= 0) {
        restEndAtRef.current = null;
        setIsRunning(false);
        setFinishedAlert(true);
        setSecondsLeft(exercise.restSeconds);
        playGentleRestChime();
        triggerRestVibration();
      } else {
        setSecondsLeft(remaining);
      }
    };

    syncRemaining();
    const id = window.setInterval(syncRemaining, 250);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncRemaining();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isRunning, exercise.restSeconds]);

  useEffect(() => {
    return () => {
      wakeLockRef.current?.release().catch(() => undefined);
    };
  }, []);

  const handleToggleWakeLock = async () => {
    if (wakeLockActive) {
      await wakeLockRef.current?.release().catch(() => undefined);
      wakeLockRef.current = null;
      setWakeLockActive(false);
      return;
    }
    try {
      const navWithWake = navigator as Navigator & {
        wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
      };
      if (navWithWake.wakeLock?.request) {
        wakeLockRef.current = await navWithWake.wakeLock.request('screen');
        setWakeLockActive(true);
      }
    } catch {
      setWakeLockActive(false);
    }
  };

  const stepKg = resolveEquipmentStep(exercise, weightKg);
  const canUseWakeLock =
    typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  const persistMetrics = (
    nextW: number,
    nextR = repsNote,
    nextTip = personalTip,
    nextSets = setsDetail,
    autoMarkCompleted = false
  ) => {
    const clean = Math.max(0, Number(nextW.toFixed(2)));
    const syncedSets = nextSets.map((s) =>
      s.completed || s.isWarmup ? s : { ...s, weightKg: clean }
    );
    setWeightKg(clean);
    setSetsDetail(syncedSets);
    const completedSetNumbers = syncedSets
      .filter((s) => s.completed && !s.isWarmup)
      .map((s) => s.setNumber);

    onSaveLog(clean, nextR, nextTip, {
      seatPinNote: nextTip,
      setsDetail: syncedSets,
      setsCompletedToday: completedSetNumbers,
      autoMarkCompleted,
    });
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1400);
  };

  const handleToggleSetCheckoff = (targetIndex: number) => {
    const nextSets = setsDetail.map((item, idx) => {
      if (idx !== targetIndex) return item;
      const nextDone = !item.completed;
      return {
        ...item,
        weightKg: item.isWarmup ? item.weightKg : weightKg,
        completed: nextDone,
      };
    });

    const toggledItem = nextSets[targetIndex];
    if (toggledItem?.completed && exercise.restSeconds > 0) {
      startCountdown(
        toggledItem.isWarmup
          ? Math.min(45, exercise.restSeconds)
          : exercise.restSeconds
      );
    }

    const workingSets = nextSets.filter((s) => !s.isWarmup);
    const completedWorkingCount = workingSets.filter((s) => s.completed).length;
    const allWorkingDone =
      workingSets.length > 0 && completedWorkingCount === workingSets.length;

    const autoRepsSummary =
      completedWorkingCount > 0
        ? `${completedWorkingCount}/${workingSets.length} hiệp × ${weightKg}kg`
        : repsNote;

    setRepsNote(autoRepsSummary);
    persistMetrics(
      weightKg,
      autoRepsSummary,
      personalTip,
      nextSets,
      allWorkingDone
    );
  };

  const plateInfo = useMemo(() => {
    if (!exercise.isPlateLoadedPerSide || weightKg <= 0) return null;
    const { perSideKg, barNoteVi } = resolvePerSidePlateTargetKg(exercise, weightKg);
    return {
      ...computePlateBreakdownPerSide(perSideKg),
      barNoteVi,
    };
  }, [exercise, weightKg]);

  const prKg = Math.max(savedLog?.personalRecordKg || 0, savedLog?.weightKg || 0);
  const est1Rm =
    savedLog?.estimated1RM || (prKg > 0 ? computeEstimated1RM(prKg, 10) : 0);

  const accentBg = isMale
    ? 'bg-[#5CE1E6] hover:bg-[#47d2d8] text-[#111114]'
    : 'bg-[#FF5C8A] hover:bg-[#ff4278] text-[#111114]';
  const accentText = isMale ? 'text-[#5CE1E6]' : 'text-[#FF5C8A]';
  const accentSoftPill = isMale
    ? 'bg-[#5CE1E6]/15 border-[#5CE1E6]/40 text-[#5CE1E6]'
    : 'bg-[#FF5C8A]/15 border-[#FF5C8A]/40 text-[#FF85A9]';

  return (
    <div className="border-t border-b border-[#272732] bg-[#14141A] px-3 sm:px-5 py-3 space-y-2.5 text-[#F7F7F7]">
      {/* Row 1: Sets x Reps | Timestamp Rest Timer + WakeLock | Smart Suggestion + Weight Stepper */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
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

          {/* Timestamp-Synced Rest Timer Pill */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (isRunning) {
                  pauseCountdown();
                } else {
                  startCountdown(
                    secondsLeft > 0 && secondsLeft < exercise.restSeconds
                      ? secondsLeft
                      : exercise.restSeconds
                  );
                }
              }}
              className={`h-9 px-2.5 sm:px-3 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors duration-150 cursor-pointer ${
                finishedAlert
                  ? 'bg-[#A3F77B] text-[#111114]'
                  : isRunning
                    ? 'bg-[#7CE7FF] text-[#111114]'
                    : accentBg
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
                  restEndAtRef.current = null;
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

            {canUseWakeLock && (
              <button
                type="button"
                onClick={() => void handleToggleWakeLock()}
                title="Giữ màn hình luôn sáng trong lúc tập"
                aria-label="Giữ sáng màn hình"
                className={`h-9 px-2 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  wakeLockActive
                    ? 'bg-[#A3F77B]/15 border-[#A3F77B] text-[#A3F77B]'
                    : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sun size={13} />
                <span className="hidden md:inline">Giữ sáng</span>
              </button>
            )}
          </div>
        </div>

        {/* Smart Set Recommendation Pill + Equipment-Aware Weight Stepper */}
        <div className="flex items-center gap-1.5 ml-auto">
          {recommendation &&
            recommendation.recommendedWeightKg > 0 &&
            recommendation.recommendedWeightKg !== weightKg && (
              <button
                type="button"
                onClick={() => persistMetrics(recommendation.recommendedWeightKg)}
                title={recommendation.reasonVi}
                className="hidden sm:inline-flex items-center gap-1 h-9 px-2.5 rounded-xl bg-[#A3F77B]/15 border border-[#A3F77B]/40 text-[#A3F77B] text-[11px] font-extrabold cursor-pointer"
              >
                <Sparkles size={12} />
                <span>{recommendation.badgeTextVi}</span>
              </button>
            )}

          {weightKg > 0 || exercise.defaultWeightKg > 0 ? (
            <>
              <button
                type="button"
                onClick={() => persistMetrics(Math.max(0, weightKg - stepKg))}
                aria-label={`Giảm ${stepKg}kg`}
                className="w-9 h-9 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] hover:bg-[#252530] text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Minus size={14} />
              </button>

              <button
                type="button"
                onClick={() => setNotesOpen((o) => !o)}
                title="Bấm để sửa mức tạ chi tiết hoặc ghi nấc ghế"
                className="h-9 px-2.5 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] hover:border-zinc-400 text-xs font-black text-[#F7F7F7] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Dumbbell size={12} className={accentText} />
                <span>{justSaved ? 'Đã lưu!' : `${weightKg}kg`}</span>
              </button>

              <button
                type="button"
                onClick={() => persistMetrics(weightKg + stepKg)}
                aria-label={`Tăng ${stepKg}kg`}
                className="w-9 h-9 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] hover:bg-[#252530] text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </>
          ) : (
            <span className="h-9 px-2.5 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] text-xs font-bold text-zinc-300 flex items-center">
              Trọng lượng cơ thể
            </span>
          )}

          {plateInfo && (
            <button
              type="button"
              onClick={() => setShowPlateCalc((v) => !v)}
              aria-label="Tính bánh tạ mỗi bên"
              title="Bấm xem sơ đồ lắp bánh tạ mỗi bên"
              className={`h-9 px-2.5 rounded-xl border text-[11px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
                showPlateCalc
                  ? accentSoftPill
                  : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-300 hover:bg-[#252530]'
              }`}
            >
              <Disc size={13} className={accentText} />
              <span className="hidden sm:inline">Bánh tạ</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setNotesOpen((o) => !o)}
            aria-label="Ghi chú nấc ghế và mức tạ"
            title="Ghi chú nấc ghế / chỉnh giờ nghỉ"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
              notesOpen || personalTip
                ? accentSoftPill
                : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-300 hover:bg-[#252530]'
            }`}
          >
            <NotebookPen size={14} />
          </button>
        </div>
      </div>

      {/* Row 2: 1-Handed Set-by-Set Checkoff Cockpit (Auto-starts Rest Timer on tap!) */}
      <div
        role="group"
        aria-label="Tích từng hiệp tập"
        className="flex flex-wrap items-center gap-1.5 pt-0.5"
      >
        <span className="text-[11px] font-bold text-zinc-400 mr-0.5">
          Tích hiệp:
        </span>
        {setsDetail.map((setItem, idx) => {
          const isDone = setItem.completed;
          const label = setItem.isWarmup
            ? `Khởi động (${setItem.weightKg}kg)`
            : `Hiệp ${setItem.setNumber}`;
          return (
            <button
              key={`${setItem.isWarmup ? 'w' : 's'}_${setItem.setNumber}_${idx}`}
              type="button"
              aria-pressed={isDone}
              onClick={() => handleToggleSetCheckoff(idx)}
              className={`min-h-8 px-2.5 py-1 rounded-xl border text-xs font-extrabold flex items-center gap-1 transition-colors duration-150 cursor-pointer ${
                isDone
                  ? 'bg-[#A3F77B] border-[#A3F77B] text-[#111114]'
                  : setItem.isWarmup
                    ? 'bg-[#1B1B22] border-dashed border-[#383848] text-zinc-300 hover:border-zinc-400'
                    : 'bg-[#1B1B22] border-[#2E2E3A] text-zinc-200 hover:border-zinc-400'
              }`}
            >
              {isDone && <Check size={12} />}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Row 3: Plate Calculator Breakdown (for Barbell / BRTW Plate-loaded machines) */}
      {plateInfo && showPlateCalc && (
        <div className="rounded-xl bg-[#111114] border border-[#2B2B38] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <Disc size={14} className={accentText} />
            <span className="font-bold text-zinc-300">
              Mỗi bên lắp ({plateInfo.targetPerSideKg}kg/bên):
            </span>
            <strong className="font-black text-[#A3F77B]">
              {plateInfo.summaryVi}
            </strong>
          </div>
          <span className="text-[11px] text-zinc-400">{plateInfo.barNoteVi}</span>
        </div>
      )}

      {/* Row 4: Quick Badges for Seat Pin, Previous Note & Lifetime PR / 1RM */}
      {!notesOpen && (personalTip || repsNote || prKg > 0) && (
        <div className="text-xs text-zinc-300 flex flex-wrap items-center gap-2">
          {prKg > 0 && (
            <span className="px-2 py-0.5 rounded-lg bg-[#A3F77B]/12 border border-[#A3F77B]/35 text-[#A3F77B] font-bold inline-flex items-center gap-1">
              <Trophy size={11} />
              <span>
                PR: {prKg}kg{est1Rm > 0 ? ` • 1RM ~${est1Rm}kg` : ''}
              </span>
            </span>
          )}
          {personalTip && (
            <span className={`px-2 py-0.5 rounded-lg border font-semibold ${accentSoftPill}`}>
              Ghi nhớ máy: {personalTip}
            </span>
          )}
          {repsNote && (
            <span className="px-2 py-0.5 rounded-lg bg-[#22222C] text-zinc-300 font-semibold">
              Ghi nhận: {repsNote}
            </span>
          )}
        </div>
      )}

      {/* Expandable Drawer for Custom Weight / Seat Pin / Timer Presets */}
      {notesOpen && (
        <div className="pt-2 border-t border-[#272732] space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-zinc-400">
              Đơn vị: {exercise.weightUnitLabel} (Bước nhảy ±{stepKg}kg)
            </span>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 font-semibold">Đếm nhanh:</span>
              {[45, 60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => startCountdown(sec)}
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
              className="px-3 py-1.5 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] text-xs font-extrabold text-[#F7F7F7] focus:outline-none focus:border-zinc-400"
            />
            <input
              type="text"
              value={repsNote}
              onChange={(e) => setRepsNote(e.target.value)}
              placeholder="Ghi hiệp (VD: 4x12 êm khớp)"
              aria-label="Ghi chú số hiệp"
              className="px-3 py-1.5 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] text-xs font-medium text-[#F7F7F7] focus:outline-none focus:border-zinc-400"
            />
            <input
              type="text"
              value={personalTip}
              onChange={(e) => setPersonalTip(e.target.value)}
              placeholder="Nấc ghế / Ghim (VD: Ghế số 3, đệm ngực nấc 2)"
              aria-label="Ghi chú nấc ghế"
              className="px-3 py-1.5 rounded-xl border border-[#2E2E3A] bg-[#1B1B22] text-xs font-medium text-[#F7F7F7] focus:outline-none focus:border-zinc-400"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              persistMetrics(weightKg, repsNote, personalTip);
              setNotesOpen(false);
            }}
            className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${accentBg}`}
          >
            <Save size={13} />
            <span>Lưu mức tạ &amp; nấc ghế</span>
          </button>
        </div>
      )}
    </div>
  );
}
