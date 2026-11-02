import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckSquare,
  CloudRain,
  Image as ImageIcon,
  Maximize,
  Minimize,
  Moon,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Sliders,
  Sun,
} from 'lucide-react';
import { useFocusCafeContext } from '../../../context/useFocusCafeContext';
import { exitPageFullscreen } from '../utils/focusFullscreen';
import FocusAmbientPopover from './FocusAmbientPopover';
import FocusScenePopover from './FocusScenePopover';
import FocusTaskPopover from './FocusTaskPopover';

type ActivePopover = 'ambient' | 'scenes' | 'tasks' | null;

interface FocusBottomDockProps {
  onPopoverChange?: (isOpen: boolean) => void;
}

export default function FocusBottomDock({ onPopoverChange }: FocusBottomDockProps) {
  const navigate = useNavigate();
  const dockRef = useRef<HTMLDivElement>(null);
  const [openPopover, setOpenPopover] = useState<ActivePopover>(null);

  const {
    selectedSceneId,
    loftVariant,
    currentTrack,
    isMusicPlaying,
    ambientVolumes,
    tasks,
    isFullscreen,
    setLoftVariant,
    toggleMusic,
    prevTrack,
    nextTrack,
    toggleFullscreen,
  } = useFocusCafeContext();

  const updatePopover = (next: ActivePopover) => {
    setOpenPopover(next);
    onPopoverChange?.(next !== null);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        updatePopover(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  });

  const activeAmbientCount = Object.values(ambientVolumes).filter(
    (v) => v > 0.01
  ).length;
  const pendingTaskCount = tasks.filter((t) => !t.completed).length;

  const isLoftNight = loftVariant.startsWith('night');
  const isLoftRainy = loftVariant.endsWith('rainy');

  const toggleLoftDayNight = () => {
    const nextNight = !isLoftNight;
    setLoftVariant(
      nextNight
        ? isLoftRainy
          ? 'night-rainy'
          : 'night-clear'
        : isLoftRainy
        ? 'day-rainy'
        : 'day-sunny'
    );
  };

  const toggleLoftRain = () => {
    const nextRain = !isLoftRainy;
    setLoftVariant(
      isLoftNight
        ? nextRain
          ? 'night-rainy'
          : 'night-clear'
        : nextRain
        ? 'day-rainy'
        : 'day-sunny'
    );
  };

  const handleStudyWithMiniPlayer = async () => {
    await exitPageFullscreen();
    navigate('/courses');
  };

  return (
    <div ref={dockRef} className="relative flex flex-col items-center">
      {/* Popover Layer */}
      {openPopover && (
        <div className="mb-3 z-30">
          {openPopover === 'ambient' && <FocusAmbientPopover />}
          {openPopover === 'scenes' && <FocusScenePopover />}
          {openPopover === 'tasks' && <FocusTaskPopover />}
        </div>
      )}

      {/* Main Floating Glass Dock */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 rounded-full bg-slate-950/70 backdrop-blur-xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white max-w-[96vw]">
        {/* Lofi Playback Controls */}
        <div className="flex items-center gap-1 pr-2 border-r border-white/15">
          <button
            type="button"
            onClick={prevTrack}
            aria-label="Bài trước"
            title="Bài trước"
            className="w-8 h-8 rounded-full hover:bg-white/15 text-slate-200 flex items-center justify-center transition-colors duration-200 cursor-pointer"
          >
            <SkipBack size={14} />
          </button>

          <button
            type="button"
            onClick={toggleMusic}
            aria-label={isMusicPlaying ? 'Tạm dừng nhạc Lofi' : 'Phát nhạc Lofi'}
            className="w-9 h-9 rounded-full bg-[#F05A28] hover:bg-[#df4e1d] text-white flex items-center justify-center shadow-md shadow-[#F05A28]/30 transition-colors duration-200 cursor-pointer"
          >
            {isMusicPlaying ? (
              <Pause size={15} />
            ) : (
              <Play size={15} className="ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={nextTrack}
            aria-label="Bài tiếp theo"
            title="Bài tiếp theo"
            className="w-8 h-8 rounded-full hover:bg-white/15 text-slate-200 flex items-center justify-center transition-colors duration-200 cursor-pointer"
          >
            <SkipForward size={14} />
          </button>

          <div className="hidden md:block pl-1.5 max-w-[148px]">
            <div className="text-xs font-semibold text-white truncate">
              {currentTrack.title}
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              {currentTrack.moodLabel}
            </div>
          </div>
        </div>

        {/* Loft Quick Day/Night & Rain Switchers */}
        {selectedSceneId === 'loft-room' && (
          <div className="flex items-center gap-1 pr-2 border-r border-white/15">
            <button
              type="button"
              onClick={toggleLoftDayNight}
              title={isLoftNight ? 'Đổi sang Ban ngày' : 'Đổi sang Ban đêm'}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-amber-200 transition-colors duration-200 cursor-pointer"
            >
              {isLoftNight ? <Moon size={13} /> : <Sun size={13} />}
              <span className="hidden sm:inline">
                {isLoftNight ? 'Đêm' : 'Ngày'}
              </span>
            </button>
            <button
              type="button"
              onClick={toggleLoftRain}
              title={isLoftRainy ? 'Tắt mưa ngoài ban công' : 'Bật mưa ngoài ban công'}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer ${
                isLoftRainy
                  ? 'bg-sky-500/30 text-sky-200 border border-sky-400/40'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              <CloudRain size={13} />
              <span className="hidden sm:inline">Mưa</span>
            </button>
          </div>
        )}

        {/* Tool Popover Triggers */}
        <button
          type="button"
          onClick={() =>
            updatePopover(openPopover === 'ambient' ? null : 'ambient')
          }
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer ${
            openPopover === 'ambient'
              ? 'bg-[#F05A28] text-white'
              : 'hover:bg-white/15 text-slate-200'
          }`}
        >
          <Sliders size={14} />
          <span>Âm thanh</span>
          {activeAmbientCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
              {activeAmbientCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            updatePopover(openPopover === 'scenes' ? null : 'scenes')
          }
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer ${
            openPopover === 'scenes'
              ? 'bg-[#F05A28] text-white'
              : 'hover:bg-white/15 text-slate-200'
          }`}
        >
          <ImageIcon size={14} />
          <span>Đổi cảnh</span>
        </button>

        <button
          type="button"
          onClick={() => updatePopover(openPopover === 'tasks' ? null : 'tasks')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer ${
            openPopover === 'tasks'
              ? 'bg-[#F05A28] text-white'
              : 'hover:bg-white/15 text-slate-200'
          }`}
        >
          <CheckSquare size={14} />
          <span className="hidden sm:inline">Mục tiêu</span>
          {pendingTaskCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#F05A28] text-white">
              {pendingTaskCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={handleStudyWithMiniPlayer}
          title="Thu nhỏ trình phát về góc để học từ vựng ngoại ngữ"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-white/15 text-slate-200 transition-colors duration-200 cursor-pointer"
        >
          <BookOpen size={14} />
          <span>Học từ vựng</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Bật toàn màn hình'}
          title={isFullscreen ? 'Thoát toàn màn hình (Esc)' : 'Bật toàn màn hình'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 cursor-pointer"
        >
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          <span className="hidden lg:inline">
            {isFullscreen ? 'Thu khung' : 'Toàn màn hình'}
          </span>
        </button>
      </div>
    </div>
  );
}
