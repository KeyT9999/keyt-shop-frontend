import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BellRing,
  Check,
  Disc,
  Minus,
  NotebookPen,
  Play,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Sun,
  Timer,
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
      barNoteVi: 'Lắp cho mỗi bên máy',
    };
  }
  return {
    perSideKg: Math.max(0, totalOrSideWeightKg / 2),
    barNoteVi: 'Chia đều 2 bên giá tạ',
  };
}

/**
 * Clean Light Sport (Hevy / Nike Training Club style) Set-by-Set Tracker
 * Large touch targets (44px+), high-contrast numbers, 1-tap set completion,
 * timestamp-based rest timer (never drifts when screen locks), and Plate Calculator.
 */
export default function GymInlineMetricsTools({
  exercise,
  gender = 'female',
  savedLog,
  recommendation,
  onSaveLog,
}: GymInlineMetricsToolsProps) {
  const defaultWeight = getGenderDefaultWeightKg(exercise, gender);
  const initialWeight =
    savedLog?.weightKg ?? recommendation?.recommendedWeightKg ?? defaultWeight;

  const [secondsLeft, setSecondsLeft] = useState<number>(exercise.restSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [finishedAlert, setFinishedAlert] = useState<boolean>(false);
  const restEndAtRef = useRef<number | null>(null);

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
    return buildDefaultSetsForExercise(exercise, initialWeight, initialWeight >= 25);
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

  const addRestSeconds = (deltaSec: number) => {
    if (restEndAtRef.current) {
      restEndAtRef.current += deltaSec * 1000;
      const next = Math.max(0, Math.ceil((restEndAtRef.current - Date.now()) / 1000));
      setSecondsLeft(next);
    } else {
      startCountdown(secondsLeft + deltaSec);
    }
  };

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

  return (
    <div className="space-y-3">
      {/* 1. Primary Weight Control + Quick Utility Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 border border-slate-200/80 p-2.5 sm:p-3">
        <div className="flex items-center gap-2">
          {weightKg > 0 || exercise.defaultWeightKg > 0 ? (
            <div className="inline-flex items-center gap-1.5 bg-white rounded-xl border border-slate-200 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => persistMetrics(Math.max(0, weightKg - stepKg))}
                aria-label={`Giảm ${stepKg}kg`}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Minus size={16} />
              </button>

              <button
                type="button"
                onClick={() => setNotesOpen((o) => !o)}
                title="Bấm để nhập số kg tùy ý"
                className="min-w-20 px-2.5 h-9 text-center cursor-pointer"
              >
                <div className="text-base font-extrabold text-slate-900 tabular-nums leading-none">
                  {justSaved ? 'Đã lưu' : `${weightKg} kg`}
                </div>
                <div className="text-[10px] font-medium text-slate-500 mt-0.5 truncate max-w-24">
                  {exercise.weightUnitLabel}
                </div>
              </button>

              <button
                type="button"
                onClick={() => persistMetrics(weightKg + stepKg)}
                aria-label={`Tăng ${stepKg}kg`}
                className="w-9 h-9 rounded-lg bg-[#1E293B] hover:bg-slate-800 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <span className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700">
              Trọng lượng cơ thể ({exercise.reps})
            </span>
          )}

          {recommendation &&
            recommendation.recommendedWeightKg > 0 &&
            recommendation.recommendedWeightKg !== weightKg && (
              <button
                type="button"
                onClick={() => persistMetrics(recommendation.recommendedWeightKg)}
                title={recommendation.reasonVi}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#F05A28] text-xs font-bold transition-colors cursor-pointer"
              >
                <Sparkles size={13} />
                <span>{recommendation.badgeTextVi}</span>
              </button>
            )}
        </div>

        {/* Utility Buttons: Rest Timer Start / Plate Calc / Seat Pin / Wake Lock */}
        <div className="flex items-center gap-1.5 ml-auto">
          {!isRunning && (
            <button
              type="button"
              onClick={() => startCountdown(exercise.restSeconds)}
              className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                finishedAlert
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
              }`}
            >
              {finishedAlert ? <BellRing size={14} /> : <Play size={13} className="text-[#F05A28]" />}
              <span>Nghỉ {exercise.restSeconds}s</span>
            </button>
          )}

          {plateInfo && (
            <button
              type="button"
              onClick={() => setShowPlateCalc((v) => !v)}
              aria-label="Tính bánh tạ mỗi bên"
              className={`h-9 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                showPlateCalc
                  ? 'bg-[#1E293B] border-[#1E293B] text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Disc size={14} />
              <span>Bánh tạ</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setNotesOpen((o) => !o)}
            aria-label="Ghi chú nấc ghế và mức tạ"
            className={`h-9 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              notesOpen || personalTip
                ? 'bg-orange-50 border-orange-200 text-[#F05A28]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <NotebookPen size={14} />
            <span className="hidden sm:inline">Nấc ghế</span>
          </button>

          {canUseWakeLock && (
            <button
              type="button"
              onClick={() => void handleToggleWakeLock()}
              aria-label="Giữ sáng màn hình"
              title="Giữ màn hình luôn sáng trong lúc tập"
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                wakeLockActive
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sun size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Optional Plate Calculator Banner */}
      {plateInfo && showPlateCalc && (
        <div className="rounded-2xl bg-slate-900 text-white px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Disc size={15} className="text-[#F05A28] shrink-0" />
            <span>
              Mỗi bên lắp ({plateInfo.targetPerSideKg}kg/bên):{' '}
              <strong className="font-extrabold text-amber-300">
                {plateInfo.summaryVi}
              </strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-300">{plateInfo.barNoteVi}</span>
        </div>
      )}

      {/* Saved Seat Pin & PR Badges */}
      {(personalTip || prKg > 0) && !notesOpen && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {personalTip && (
            <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
              Ghi nhớ máy: {personalTip}
            </span>
          )}
          {prKg > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold inline-flex items-center gap-1">
              <Trophy size={12} className="text-emerald-600" />
              <span>
                Kỷ lục PR: {prKg}kg{est1Rm > 0 ? ` (1RM ~${est1Rm}kg)` : ''}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Expandable Seat Pin & Exact Weight Input */}
      {notesOpen && (
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Mức tạ chính xác (kg)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                aria-label="Mức tạ tính bằng kg"
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:border-[#F05A28]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Ghi nhớ nấc ghế / chốt máy cho lần sau
              </label>
              <input
                type="text"
                value={personalTip}
                onChange={(e) => setPersonalTip(e.target.value)}
                placeholder="VD: Ghế số 3, đệm ngực nấc 2..."
                aria-label="Ghi chú nấc ghế"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#F05A28]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              persistMetrics(weightKg, repsNote, personalTip);
              setNotesOpen(false);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save size={14} />
            <span>Lưu mức tạ &amp; nấc ghế</span>
          </button>
        </div>
      )}

      {/* 2. Hevy / Strong Style Vertical Set-by-Set Table (Thumb-Friendly 48px Rows!) */}
      <div
        role="group"
        aria-label="Tích từng hiệp tập"
        className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100"
      >
        <div className="grid grid-cols-12 items-center px-3.5 py-2 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <div className="col-span-3">Hiệp</div>
          <div className="col-span-3 text-center">Mức tạ</div>
          <div className="col-span-3 text-center">Mục tiêu</div>
          <div className="col-span-3 text-right">Hoàn thành</div>
        </div>

        {setsDetail.map((setItem, idx) => {
          const isDone = setItem.completed;
          const displayWeight = setItem.isWarmup ? setItem.weightKg : weightKg;
          const setLabel = setItem.isWarmup
            ? 'Khởi động'
            : `Hiệp ${setItem.setNumber}`;

          return (
            <div
              key={`${setItem.isWarmup ? 'w' : 's'}_${setItem.setNumber}_${idx}`}
              className={`grid grid-cols-12 items-center px-3.5 py-2.5 transition-colors duration-150 ${
                isDone ? 'bg-emerald-50/70' : 'bg-white'
              }`}
            >
              <div className="col-span-3 flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : setItem.isWarmup
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {setItem.isWarmup ? 'KĐ' : setItem.setNumber}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                  {setItem.isWarmup ? 'Làm nóng' : `Hiệp ${setItem.setNumber}`}
                </span>
              </div>

              <div className="col-span-3 text-center text-sm font-extrabold text-slate-900 tabular-nums">
                {displayWeight > 0 ? `${displayWeight} kg` : 'Cơ thể'}
              </div>

              <div className="col-span-3 text-center text-xs sm:text-sm font-semibold text-slate-600 tabular-nums">
                {setItem.isWarmup ? '12 lần' : `${exercise.reps} lần`}
              </div>

              <div className="col-span-3 flex justify-end">
                <button
                  type="button"
                  aria-label={setLabel}
                  aria-pressed={isDone}
                  onClick={() => handleToggleSetCheckoff(idx)}
                  className={`min-w-11 h-10 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all duration-150 cursor-pointer ${
                    isDone
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Check size={16} />
                  <span className="hidden sm:inline">{isDone ? 'Đã xong' : 'Xong'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Active Rest Countdown Bar (High-contrast Navy Pill when running) */}
      {isRunning && (
        <div className="rounded-2xl bg-[#1E293B] text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <Timer size={18} className="text-[#F05A28] shrink-0" />
            <div>
              <div className="text-[11px] font-semibold text-slate-300">
                Đang nghỉ giữa hiệp
              </div>
              <div className="text-xl font-black font-mono tabular-nums leading-tight">
                {formatClock(secondsLeft)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => addRestSeconds(15)}
              className="h-9 px-3 rounded-xl bg-white/12 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              +15s
            </button>
            <button
              type="button"
              onClick={() => {
                restEndAtRef.current = null;
                setIsRunning(false);
                setSecondsLeft(exercise.restSeconds);
              }}
              aria-label="Đặt lại đồng hồ nghỉ"
              className="h-9 px-3 rounded-xl bg-[#F05A28] hover:bg-orange-600 text-xs font-bold text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Bỏ qua</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
