import { useState } from 'react';
import {
  Flame,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Timer,
  Watch,
} from 'lucide-react';
import { useFocusCafeContext } from '../../../context/useFocusCafeContext';
import { POMODORO_PRESET_MINUTES } from '../data/focusCatalog';
import { formatSecondsToClock } from '../utils/focusStorage';

export default function FocusMiniClockCard() {
  const {
    timerMode,
    pomodoroMinutes,
    remainingSeconds,
    stopwatchSeconds,
    isTimerRunning,
    streakCount,
    todayFocusedSeconds,
    setTimerMode,
    setPomodoroMinutes,
    toggleTimer,
    resetTimer,
  } = useFocusCafeContext();

  const [isUltraMini, setIsUltraMini] = useState<boolean>(false);

  const displayClock =
    timerMode === 'pomodoro'
      ? formatSecondsToClock(remainingSeconds)
      : formatSecondsToClock(stopwatchSeconds);

  const totalPomodoroSeconds = Math.max(1, pomodoroMinutes * 60);
  const progressPercent =
    timerMode === 'pomodoro'
      ? Math.min(
          100,
          Math.max(
            0,
            ((totalPomodoroSeconds - remainingSeconds) / totalPomodoroSeconds) *
              100
          )
        )
      : 100;

  const todayMinutes = Math.floor(todayFocusedSeconds / 60);

  if (isUltraMini) {
    return (
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-950/65 backdrop-blur-xl border border-white/15 shadow-2xl text-white transition-all duration-200 hover:bg-slate-950/80">
        <span
          className={`w-2 h-2 rounded-full ${
            isTimerRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`}
        />
        <span className="font-mono text-lg font-bold tracking-tight tabular-nums">
          {displayClock}
        </span>
        <button
          type="button"
          onClick={toggleTimer}
          aria-label={isTimerRunning ? 'Tạm dừng đếm giờ' : 'Bắt đầu đếm giờ'}
          className="w-7 h-7 rounded-full bg-[#F05A28] hover:bg-[#d94d1f] text-white flex items-center justify-center transition-colors duration-200 cursor-pointer"
        >
          {isTimerRunning ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
        </button>
        <button
          type="button"
          onClick={() => setIsUltraMini(false)}
          aria-label="Mở rộng đồng hồ"
          title="Mở rộng đồng hồ"
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors duration-200 cursor-pointer"
        >
          <Maximize2 size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[264px] sm:w-[276px] rounded-3xl bg-slate-950/65 backdrop-blur-xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.45)] p-3.5 text-white transition-all duration-200">
      {/* Header row: Mode switch + Shrink toggle */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="inline-flex items-center rounded-full bg-white/10 p-0.5 border border-white/10">
          <button
            type="button"
            onClick={() => setTimerMode('pomodoro')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors duration-200 cursor-pointer ${
              timerMode === 'pomodoro'
                ? 'bg-[#F05A28] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Timer size={11} />
            <span>Pomodoro</span>
          </button>
          <button
            type="button"
            onClick={() => setTimerMode('stopwatch')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors duration-200 cursor-pointer ${
              timerMode === 'stopwatch'
                ? 'bg-[#F05A28] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Watch size={11} />
            <span>Đếm xuôi</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsUltraMini(true)}
          aria-label="Thu gọn đồng hồ"
          title="Thu gọn thành viên thuốc nhỏ"
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors duration-200 cursor-pointer"
        >
          <Minimize2 size={12} />
        </button>
      </div>

      {/* Main Clock Display + Action Buttons */}
      <div className="flex items-center justify-between gap-2 my-1">
        <div className="flex items-baseline gap-2">
          <span
            className={`w-2 h-2 rounded-full self-center ${
              isTimerRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
            }`}
          />
          <span className="font-mono text-3xl sm:text-[34px] font-extrabold tracking-tight tabular-nums leading-none text-white">
            {displayClock}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTimer}
            aria-label={isTimerRunning ? 'Tạm dừng' : 'Bắt đầu học'}
            className="w-9 h-9 rounded-xl bg-[#F05A28] hover:bg-[#df4e1d] text-white flex items-center justify-center shadow-lg shadow-[#F05A28]/30 transition-colors duration-200 cursor-pointer"
          >
            {isTimerRunning ? (
              <Pause size={16} />
            ) : (
              <Play size={16} className="ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={resetTimer}
            aria-label="Đặt lại đồng hồ"
            title="Đặt lại"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-200 flex items-center justify-center transition-colors duration-200 cursor-pointer"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 rounded-full bg-white/15 overflow-hidden mt-2.5 mb-2.5">
        <div
          className="h-full rounded-full bg-[#F05A28] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Presets or Daily Stats Footer */}
      {timerMode === 'pomodoro' ? (
        <div className="flex items-center justify-between gap-1">
          {POMODORO_PRESET_MINUTES.map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => setPomodoroMinutes(mins)}
              className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                pomodoroMinutes === mins
                  ? 'bg-white/20 text-white border border-white/25'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {mins}p
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs text-slate-300 pt-0.5">
          <span>Hôm nay đã học: <strong className="text-white">{todayMinutes} phút</strong></span>
          <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
            <Flame size={12} />
            {streakCount} ngày
          </span>
        </div>
      )}
    </div>
  );
}
