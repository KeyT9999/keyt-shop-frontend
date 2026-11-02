import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Headphones, Maximize } from 'lucide-react';
import { useFocusCafeContext } from '../context/useFocusCafeContext';
import FocusBottomDock from '../features/focus/components/FocusBottomDock';
import FocusMiniClockCard from '../features/focus/components/FocusMiniClockCard';
import { exitPageFullscreen } from '../features/focus/utils/focusFullscreen';

export default function FocusCafePage() {
  const navigate = useNavigate();
  const {
    activeScene,
    activeVideoUrl,
    activePosterUrl,
    streakCount,
    todayFocusedSeconds,
    isFullscreen,
    isMusicPlaying,
    toggleFullscreen,
    enterFocusSession,
  } = useFocusCafeContext();

  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [hasOpenPopover, setHasOpenPopover] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const idleTimerRef = useRef<number | null>(null);

  // Respect prefers-reduced-motion accessibility preference
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Auto-dim secondary chrome after 4.5s of mouse inactivity so the artwork shines
  useEffect(() => {
    const scheduleIdle = () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => {
        setIsIdle(true);
      }, 4500);
    };

    const handleUserActivity = () => {
      setIsIdle(false);
      scheduleIdle();
    };

    scheduleIdle();
    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, []);

  const handleLeaveFocusRoom = async () => {
    await exitPageFullscreen();
    navigate('/');
  };

  const handleOneTapImmersion = () => {
    enterFocusSession({ autoFullscreen: true, autoStartMusic: true });
  };

  const shouldDimChrome = isIdle && !hasOpenPopover;
  const todayMinutes = Math.floor(todayFocusedSeconds / 60);

  return (
    <section
      aria-label="Không gian tự học KeyT Focus Café"
      className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none"
    >
      {/* Background Scene Layer (Seamless Animated Character Video + Instant Poster) */}
      <img
        src={activePosterUrl}
        alt={activeScene.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {!prefersReducedMotion && (
        <video
          key={activeVideoUrl}
          src={activeVideoUrl}
          poster={activePosterUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Subtle cinematic vignette so clock & controls always remain readable */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/35 via-transparent to-slate-950/45" />

      {/* Top Bar: Left Back/Streak Pill + Right Cute Mini Study Clock */}
      <div className="relative z-20 flex items-start justify-between gap-3 p-4 sm:p-6">
        <div
          className={`flex flex-wrap items-center gap-2 transition-opacity duration-300 ${
            shouldDimChrome ? 'opacity-25 hover:opacity-100' : 'opacity-100'
          }`}
        >
          <button
            type="button"
            onClick={() => void handleLeaveFocusRoom()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-950/65 hover:bg-slate-950/85 backdrop-blur-xl border border-white/15 text-xs font-semibold text-white transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Trang chủ KeyT</span>
          </button>

          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-950/60 backdrop-blur-xl border border-white/15 text-xs text-slate-200">
            <Headphones size={13} className="text-[#F05A28]" />
            <span className="font-semibold text-white">{activeScene.title}</span>
            <span className="text-white/30">•</span>
            <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
              <Flame size={13} />
              Streak {streakCount} ngày
            </span>
            {todayMinutes > 0 && (
              <>
                <span className="text-white/30">•</span>
                <span>{todayMinutes} phút hôm nay</span>
              </>
            )}
          </div>
        </div>

        {/* Always-accessible Cute Mini Study Clock */}
        <div className="shrink-0">
          <FocusMiniClockCard />
        </div>
      </div>

      {/* Prompt pill ONLY when opened directly via URL paste (where browser requires 1 click for Fullscreen + Audio) */}
      {!isFullscreen && !isMusicPlaying && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex justify-center pointer-events-none px-4">
          <button
            type="button"
            onClick={handleOneTapImmersion}
            className="pointer-events-auto inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-slate-950/75 hover:bg-[#F05A28] backdrop-blur-xl border border-white/20 text-sm font-bold text-white shadow-2xl transition-colors duration-200 cursor-pointer"
          >
            <Maximize size={16} />
            <span>Chạm để bật Toàn màn hình &amp; Phát nhạc Lofi</span>
          </button>
        </div>
      )}

      {/* Bottom Floating Control Dock */}
      <div
        className={`absolute inset-x-0 bottom-4 sm:bottom-6 z-20 flex justify-center px-3 transition-opacity duration-300 ${
          shouldDimChrome ? 'opacity-25 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <FocusBottomDock
          onPopoverChange={(isOpen) => {
            setHasOpenPopover(isOpen);
            if (!isOpen && !isFullscreen) {
              // Keep toggleFullscreen easily reachable from dock
              void toggleFullscreen;
            }
          }}
        />
      </div>
    </section>
  );
}
