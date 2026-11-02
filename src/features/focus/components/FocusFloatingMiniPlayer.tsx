import { useLocation, useNavigate } from 'react-router-dom';
import { Headphones, Maximize2, Pause, Play, X } from 'lucide-react';
import { IS_FOCUS_CAFE_ENABLED } from '../../../config/features';
import { useFocusCafeContext } from '../../../context/useFocusCafeContext';
import { formatSecondsToClock } from '../utils/focusStorage';

/**
 * Floating mini-pill displayed on study pages (e.g., /courses/*) when the user
 * keeps their Lofi music or Pomodoro timer active while reviewing flashcards.
 */
export default function FocusFloatingMiniPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    timerMode,
    remainingSeconds,
    stopwatchSeconds,
    isTimerRunning,
    isMusicPlaying,
    toggleMusic,
    enterFocusSession,
    stopAllFocusSession,
  } = useFocusCafeContext();

  if (!IS_FOCUS_CAFE_ENABLED) return null;
  if (location.pathname === '/focus' || location.pathname.startsWith('/admin')) {
    return null;
  }
  if (!isTimerRunning && !isMusicPlaying) {
    return null;
  }

  const clockLabel =
    timerMode === 'pomodoro'
      ? formatSecondsToClock(remainingSeconds)
      : formatSecondsToClock(stopwatchSeconds);

  const handleReturnFullscreen = () => {
    enterFocusSession({ autoFullscreen: true, autoStartMusic: false });
    navigate('/focus');
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-full bg-slate-900/92 backdrop-blur-xl border border-white/15 shadow-2xl text-white">
      <Headphones size={15} className="text-[#F05A28] shrink-0" />
      <span className="font-mono text-xs font-bold tabular-nums">
        {clockLabel}
      </span>

      <button
        type="button"
        onClick={toggleMusic}
        aria-label={isMusicPlaying ? 'Tạm dừng nhạc Lofi' : 'Phát nhạc Lofi'}
        title={isMusicPlaying ? 'Tạm dừng nhạc Lofi' : 'Phát nhạc Lofi'}
        className="w-7 h-7 rounded-full bg-[#F05A28] hover:bg-[#df4e1d] text-white flex items-center justify-center transition-colors duration-200 cursor-pointer"
      >
        {isMusicPlaying ? (
          <Pause size={12} />
        ) : (
          <Play size={12} className="ml-0.5" />
        )}
      </button>

      <button
        type="button"
        onClick={handleReturnFullscreen}
        aria-label="Mở lại không gian Focus Café toàn màn hình"
        title="Mở toàn màn hình Focus Café"
        className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors duration-200 cursor-pointer"
      >
        <Maximize2 size={12} />
      </button>

      <button
        type="button"
        onClick={stopAllFocusSession}
        aria-label="Tắt phiên Focus Café"
        title="Đóng và tắt nhạc"
        className="w-6 h-6 rounded-full hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors duration-200 cursor-pointer"
      >
        <X size={12} />
      </button>
    </div>
  );
}
