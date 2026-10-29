import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bot,
  GripHorizontal,
  MessageCircle,
  Minimize2,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import Robot3DCanvas from './Robot3DCanvas';
import {
  clampRobotScreenPosition,
  emitOpenSupportChatEvent,
  getContextualRobotGreeting,
  PRIMARY_ROBOT_STATES,
  ROBOT_STATUS_EVENT_NAME,
  ROBOT_STATUS_META,
  type RobotStatus,
  type RobotStatusEventDetail,
  type ScreenPosition,
} from './robotMotionUtils';

const STORAGE_KEY_POS = 'keyt_robot_3d_pos_v1';
const WIDGET_WIDTH = 136;
const WIDGET_HEIGHT = 152;

function getDefaultScreenPosition(): ScreenPosition {
  if (typeof window === 'undefined') return { x: 24, y: 420 };
  const isMobile = window.innerWidth < 768;
  return clampRobotScreenPosition(
    {
      x: window.innerWidth - (isMobile ? 124 : 168),
      y: window.innerHeight - (isMobile ? 275 : 310),
    },
    { width: window.innerWidth, height: window.innerHeight },
    WIDGET_WIDTH,
    WIDGET_HEIGHT
  );
}

function generateSmartCompanionReply(query: string): {
  reply: string;
  suggestedHref?: string;
  suggestedLabel?: string;
} {
  const q = query.toLowerCase();

  if (q.includes('otp') || q.includes('2fa') || q.includes('chatgpt') || q.includes('gemini') || q.includes('mã')) {
    return {
      reply:
        'Để lấy mã OTP ChatGPT, Gemini hoặc mã 2FA Live 30s, ní bấm vào Cổng OTP 2FA bên dưới nhé! Hệ thống tự động quét mã mới nhất 24/7.',
      suggestedHref: '/get-otp',
      suggestedLabel: 'Mở Cổng OTP & 2FA Live',
    };
  }

  if (q.includes('nói') || q.includes('speaking') || q.includes('giám thị') || q.includes('phát âm') || q.includes('jpd')) {
    return {
      reply:
        'Phòng Thi Nói 1-1 có Giám thị AI chấm phát âm từng từ và mô phỏng đề thi vấn đáp FPT (Đọc đoạn văn + Hỏi đáp Q&A). Vào thử ngay nha!',
      suggestedHref: '/courses/jpd123/speaking',
      suggestedLabel: 'Vào Phòng Thi Nói AI 1-1',
    };
  }

  if (q.includes('nhật') || q.includes('kana') || q.includes('trung') || q.includes('hsk') || q.includes('anh') || q.includes('toeic')) {
    return {
      reply:
        'Học Viện KeyT có đủ Tiếng Nhật FPT (JPD113/123 & Kana), Tiếng Trung HSK 1-2 và Tiếng Anh Hackers TOEIC (6.900+ từ) kèm chế độ Nghe Thụ Động!',
      suggestedHref: '/courses',
      suggestedLabel: 'Khám Phá Học Viện Ngoại Ngữ',
    };
  }

  if (q.includes('ảnh') || q.includes('exif') || q.includes('nén') || q.includes('xóa nền') || q.includes('khung')) {
    return {
      reply:
        'Studio Ảnh KeyT hỗ trợ đóng khung EXIF Leica/Fujifilm/Sony chuẩn 4K, tách nền AI miễn phí và nén ảnh giảm 90% dung lượng!',
      suggestedHref: '/photo-frame',
      suggestedLabel: 'Mở Studio Khung Ảnh EXIF',
    };
  }

  if (q.includes('gym') || q.includes('tập') || q.includes('ngực') || q.includes('lưng') || q.includes('chân') || q.includes('vai')) {
    return {
      reply:
        'KeyT Gym 3D Coach tự động nhắc lịch 5 ngày (Ngực • Tay sau-Lưng • Tay trước-Vai • Chân), xoay 3D 360° chuẩn form và lưu mức tạ buổi trước!',
      suggestedHref: '/gym',
      suggestedLabel: 'Mở KeyT Gym 3D Coach',
    };
  }

  return {
    reply:
      'Mình đã ghi nhận câu hỏi của ní! Ní có thể mở khung Chat Trực Tiếp để Admin hỗ trợ ngay hoặc khám phá các tiện ích AI bên dưới nhé!',
    suggestedLabel: 'Mở Chat Hỗ Trợ Trực Tuyến',
  };
}

export default function DraggableRobotWidget() {
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState<RobotStatus>('idle');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDockOpen, setIsDockOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [customBubble, setCustomBubble] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState<string>('');
  const [aiReply, setAiReply] = useState<{
    reply: string;
    suggestedHref?: string;
    suggestedLabel?: string;
  } | null>(null);

  const [position, setPosition] = useState<ScreenPosition>(() => {
    if (typeof window === 'undefined') return { x: 24, y: 420 };
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POS);
      if (saved) {
        const parsed = JSON.parse(saved) as ScreenPosition;
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return clampRobotScreenPosition(
            parsed,
            { width: window.innerWidth, height: window.innerHeight },
            WIDGET_WIDTH,
            WIDGET_HEIGHT
          );
        }
      }
    } catch {
      // ignore storage errors
    }
    return getDefaultScreenPosition();
  });

  const dragStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const statusTimersRef = useRef<number[]>([]);

  const clearStatusTimers = useCallback(() => {
    statusTimersRef.current.forEach((id) => window.clearTimeout(id));
    statusTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearStatusTimers();
  }, [clearStatusTimers]);

  // Keep inside viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) =>
        clampRobotScreenPosition(
          prev,
          { width: window.innerWidth, height: window.innerHeight },
          WIDGET_WIDTH,
          WIDGET_HEIGHT
        )
      );
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen to global Robot status events from anywhere in the app
  useEffect(() => {
    const handleStatusEvent = (e: Event) => {
      const detail = (e as CustomEvent<RobotStatusEventDetail>).detail;
      if (!detail) return;

      clearStatusTimers();
      setStatus(detail.status);
      if (detail.bubbleText) {
        setCustomBubble(detail.bubbleText);
      }

      if (detail.status !== 'idle') {
        const duration = detail.durationMs ?? 2400;
        const timerId = window.setTimeout(() => {
          if (detail.status === 'speaking') {
            setStatus('happy');
            const happyTimer = window.setTimeout(() => {
              setStatus('idle');
              setCustomBubble(null);
            }, 1300);
            statusTimersRef.current.push(happyTimer);
          } else {
            setStatus('idle');
            setCustomBubble(null);
          }
        }, duration);
        statusTimersRef.current.push(timerId);
      }
    };

    window.addEventListener(ROBOT_STATUS_EVENT_NAME, handleStatusEvent);
    return () => window.removeEventListener(ROBOT_STATUS_EVENT_NAME, handleStatusEvent);
  }, [clearStatusTimers]);

  const contextPrompt = useMemo(
    () => getContextualRobotGreeting(location.pathname),
    [location.pathname]
  );

  // Pointer Drag Handlers (Mouse + Touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Do not start drag if clicking a button/input inside the dock
    if ((e.target as HTMLElement).closest('[data-no-drag="true"]')) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStartRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const dist = Math.hypot(dx, dy);

    if (dist >= 6 && !drag.moved) {
      drag.moved = true;
      setIsDragging(true);
    }

    if (drag.moved) {
      const nextPos = clampRobotScreenPosition(
        { x: drag.originX + dx, y: drag.originY + dy },
        { width: window.innerWidth, height: window.innerHeight },
        WIDGET_WIDTH,
        WIDGET_HEIGHT
      );
      setPosition(nextPos);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStartRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const wasDragged = drag.moved;
    dragStartRef.current = null;
    setIsDragging(false);

    if (wasDragged) {
      try {
        localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(position));
      } catch {
        // ignore
      }
      // Happy bounce after landing in a new spot
      clearStatusTimers();
      setStatus('happy');
      setCustomBubble('Đã hạ cánh tại vị trí mới! Bấm vào mình bất cứ lúc nào nhé!');
      const t = window.setTimeout(() => {
        setStatus('idle');
        setCustomBubble(null);
      }, 1800);
      statusTimersRef.current.push(t);
    } else {
      setIsDockOpen((prev) => !prev);
    }
  };

  const handleManualStatePick = (nextStatus: RobotStatus) => {
    clearStatusTimers();
    setStatus(nextStatus);
    const stateMessages: Record<RobotStatus, string> = {
      idle: 'Trạng thái Chờ: Bay lơ lửng & xoay nhẹ theo con trỏ chuột của ní.',
      thinking: 'Trạng thái Nghĩ: Đang quét dữ liệu với đèn LED Cam KeyT!',
      speaking: 'Trạng thái Nói: Xin chào! Mình đang nhép miệng trò chuyện cùng ní nè!',
      happy: 'Trạng thái Vui: Tuyệt vời quá! Nhún nhảy ăn mừng chiến thắng!',
      listening: 'Trạng thái Nghe: Đang dỏng tai lắng nghe giọng nói qua Micro...',
    };
    setCustomBubble(stateMessages[nextStatus]);
  };

  const handleAskRobot = (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || status === 'thinking') return;

    setChatInput('');
    clearStatusTimers();
    setStatus('thinking');
    setCustomBubble('Đang suy nghĩ câu trả lời cho ní...');

    const t1 = window.setTimeout(() => {
      const answer = generateSmartCompanionReply(text);
      setAiReply(answer);
      setStatus('speaking');
      setCustomBubble(answer.reply);

      const t2 = window.setTimeout(() => {
        setStatus('happy');
        const t3 = window.setTimeout(() => {
          setStatus('idle');
        }, 1200);
        statusTimersRef.current.push(t3);
      }, 1800);
      statusTimersRef.current.push(t2);
    }, 850);

    statusTimersRef.current.push(t1);
  };

  const handleResetPosition = () => {
    const defPos = getDefaultScreenPosition();
    setPosition(defPos);
    try {
      localStorage.removeItem(STORAGE_KEY_POS);
    } catch {
      // ignore
    }
  };

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-40 right-4 z-40 px-3 py-2 rounded-full bg-slate-900/95 text-white border border-sky-400/40 shadow-lg hover:scale-105 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
        title="Mở lại Robot 3D KeyT"
      >
        <Bot size={16} className="text-sky-400 animate-pulse" />
        <span className="hidden sm:inline">Robot 3D</span>
      </button>
    );
  }

  const meta = ROBOT_STATUS_META[status] || ROBOT_STATUS_META.idle;
  const openDockLeft =
    typeof window !== 'undefined' ? position.x > window.innerWidth * 0.52 : true;
  const openDockUp =
    typeof window !== 'undefined' ? position.y > window.innerHeight * 0.45 : true;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${WIDGET_WIDTH}px`,
        height: `${WIDGET_HEIGHT}px`,
        zIndex: 45,
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`group select-none ${
        isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'
      } transition-transform duration-150`}
      data-testid="draggable-robot-widget"
    >
      {/* Compact Speech Bubble above/beside Robot when Dock is closed */}
      {!isDockOpen && (
        <div
          className={`pointer-events-none absolute ${
            openDockLeft ? 'right-full mr-2' : 'left-full ml-2'
          } top-3 w-52 sm:w-60 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg px-3 py-2 text-left transition-all duration-200 ${
            isDragging || customBubble
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'
          }`}
        >
          <div className="flex items-center justify-between gap-1.5 mb-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#F05A28]">
              <Sparkles size={10} /> KeyT Companion
            </span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${meta.badgeClass}`}>
              {meta.shortLabel}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-slate-800 leading-snug line-clamp-3">
            {isDragging
              ? 'Đang bay theo tay ní! Thả mình ở bất cứ góc nào ní thích nhé!'
              : customBubble || contextPrompt.greeting}
          </p>
        </div>
      )}

      {/* Interactive Companion Popover Dock when clicked */}
      {isDockOpen && !isDragging && (
        <div
          data-no-drag="true"
          onClick={(e) => e.stopPropagation()}
          className={`absolute ${
            openDockLeft ? 'right-full mr-3' : 'left-full ml-3'
          } ${
            openDockUp ? 'bottom-0' : 'top-0'
          } w-72 sm:w-80 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/95 shadow-2xl p-4 text-left cursor-default z-50 animate-in fade-in zoom-in-95 duration-200`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: meta.accentHex }}
              />
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-none">
                  Robot 3D KeyT Companion
                </h4>
                <span className="text-[10px] font-semibold text-slate-500">
                  {meta.label} • Kéo thả tự do
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetPosition}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Đặt lại vị trí mặc định"
              >
                <RotateCcw size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDockOpen(false);
                  setIsMinimized(true);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Thu nhỏ Robot"
              >
                <Minimize2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => setIsDockOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Đóng bảng điều khiển"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Speech Message Box */}
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-3">
            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
              {aiReply ? aiReply.reply : customBubble || contextPrompt.greeting}
            </p>
            {!aiReply && !customBubble && (
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {contextPrompt.subtext}
              </p>
            )}
            {aiReply?.suggestedHref && (
              <button
                type="button"
                onClick={() => {
                  navigate(aiReply.suggestedHref!);
                  setIsDockOpen(false);
                }}
                className="mt-2 w-full py-1.5 px-3 rounded-xl bg-[#F05A28] hover:bg-orange-600 text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                {aiReply.suggestedLabel || 'Đi tới trang ngay'}
              </button>
            )}
          </div>

          {/* 4-State Interactive Selector (Chờ • Nghĩ • Nói • Vui) */}
          <div className="mb-3">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Chế độ cử động 3D (4 Trạng thái)</span>
              <span className="text-slate-500 font-semibold">{meta.shortLabel}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {PRIMARY_ROBOT_STATES.map((st) => {
                const stMeta = ROBOT_STATUS_META[st];
                const isActive = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleManualStatePick(st)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: stMeta.accentHex }}
                    />
                    <span>{stMeta.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Context Actions */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {contextPrompt.quickActions.map((act) => (
              <button
                key={act.label}
                type="button"
                onClick={() => {
                  if (act.action === 'open-chat') {
                    emitOpenSupportChatEvent();
                    setIsDockOpen(false);
                  } else if (act.href) {
                    navigate(act.href);
                    setIsDockOpen(false);
                  }
                }}
                className="px-2.5 py-1 rounded-full bg-orange-50/80 hover:bg-[#F05A28] text-[#F05A28] hover:text-white border border-orange-200/80 text-[11px] font-bold transition-colors cursor-pointer"
              >
                {act.label}
              </button>
            ))}
          </div>

          {/* Mini AI Companion Input */}
          <form onSubmit={handleAskRobot} className="flex items-center gap-1.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Hỏi Robot (VD: OTP, thi nói, nén ảnh...)"
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#F05A28] text-xs text-slate-800"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || status === 'thinking'}
              className="p-2 rounded-xl bg-[#F05A28] hover:bg-orange-600 disabled:opacity-40 text-white transition-colors cursor-pointer"
              aria-label="Hỏi Robot"
            >
              <Send size={13} />
            </button>
          </form>

          {/* Direct Support Chat CTA */}
          <button
            type="button"
            onClick={() => {
              emitOpenSupportChatEvent();
              setIsDockOpen(false);
            }}
            className="mt-2.5 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageCircle size={14} className="text-[#F05A28]" />
            <span>Chat Trực Tiếp Với Admin KeyT</span>
          </button>
        </div>
      )}

      {/* Glowing Hover Aura Under Robot */}
      <div
        className="pointer-events-none absolute inset-x-5 bottom-3 h-4 rounded-full blur-md transition-all duration-300"
        style={{
          backgroundColor: meta.accentHex,
          opacity: isDragging ? 0.55 : 0.28,
        }}
      />

      {/* 3D Robot Canvas */}
      <div className="w-full h-[128px] relative">
        <Robot3DCanvas
          status={status}
          isDragging={isDragging}
          trackMouse={true}
          showAttribution={true}
        />
      </div>

      {/* Bottom Drag Handle & Status Pill */}
      <div className="flex items-center justify-center -mt-1">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-white border border-white/15 shadow-md text-[10px] font-bold">
          <GripHorizontal size={11} className="text-slate-400" />
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: meta.accentHex }}
          />
          <span>{isDragging ? 'Thả để cố định' : meta.shortLabel}</span>
        </div>
      </div>
    </div>
  );
}
