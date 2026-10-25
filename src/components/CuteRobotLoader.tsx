import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import { IS_ROBOT_3D_ENABLED } from '../config/features';
import Robot3DCanvas from './robot/Robot3DCanvas';
import {
  emitRobotStatusEvent,
  PRIMARY_ROBOT_STATES,
  ROBOT_STATUS_META,
  type RobotStatus,
} from './robot/robotMotionUtils';

interface CuteRobotLoaderProps {
  variant?: 'otp' | 'compress';
  serviceName?: string;
  status?: RobotStatus;
}

const OTP_MESSAGES = [
  'Robot 3D KeyT đang xoay ăng-ten dò mã OTP mới nhất cho ní...',
  'Đang bắt tín hiệu vệ tinh từ hộp thư bảo mật...',
  'Tìm thấy sóng rồi! Đang giải mã 6 số cực chuẩn...',
];

const COMPRESS_MESSAGES = [
  'Robot 3D KeyT đang ép cân cho ảnh của ní nhẹ tênh...',
  'Đang gọt bớt từng kilobyte thừa mà vẫn giữ nét căng...',
  'Sắp xong rồi ní ơi, ảnh siêu nhẹ chuẩn bị ra lò!',
];

export default function CuteRobotLoader({
  variant = 'otp',
  serviceName = 'OTP',
  status = 'thinking',
}: CuteRobotLoaderProps) {
  const messages = variant === 'otp' ? OTP_MESSAGES : COMPRESS_MESSAGES;
  const [msgIndex, setMsgIndex] = useState(0);
  const [activeStatus, setActiveStatus] = useState<RobotStatus>(status);

  useEffect(() => {
    setActiveStatus(status);
  }, [status]);

  useEffect(() => {
    emitRobotStatusEvent(
      'thinking',
      variant === 'otp'
        ? `Đang quét sóng lấy mã ${serviceName} cho ní...`
        : 'Đang nén ảnh tốc độ cao cho ní...',
      3000
    );
  }, [variant, serviceName]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1500);
    return () => window.clearInterval(id);
  }, [messages.length]);

  const meta = ROBOT_STATUS_META[activeStatus] || ROBOT_STATUS_META.thinking;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full rounded-2xl bg-gradient-to-b from-orange-50/90 via-white to-slate-50/90 border border-orange-200/80 p-5 my-4 shadow-sm flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Top Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F05A28]/10 text-[#F05A28] text-xs font-bold tracking-wide uppercase mb-2">
        <Radio size={13} className="animate-pulse" />
        <span>
          {variant === 'otp' ? `Robot 3D Đang Dò Sóng ${serviceName}` : 'Robot 3D AI Đang Nén Ảnh'}
        </span>
      </div>

      {/* 3D Flying Robot + Radar Waves */}
      <div className="relative w-36 h-36 flex items-center justify-center my-1 select-none">
        <span className="keyt-robot-radar keyt-robot-radar--1" />
        <span className="keyt-robot-radar keyt-robot-radar--2" />

        {IS_ROBOT_3D_ENABLED ? (
          <div className="relative z-10 w-36 h-36">
            <Robot3DCanvas status={activeStatus} trackMouse={true} />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-[#F05A28] flex items-center justify-center text-[#F05A28] font-black text-xs">
            KEYT AI
          </div>
        )}
      </div>

      {/* State Switcher Pills */}
      <div className="flex items-center justify-center gap-1.5 mb-2">
        {PRIMARY_ROBOT_STATES.map((st) => {
          const stMeta = ROBOT_STATUS_META[st];
          const isCurrent = activeStatus === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setActiveStatus(st)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {stMeta.shortLabel}
            </button>
          );
        })}
      </div>

      {/* Rotating Status Message */}
      <p className="text-xs sm:text-sm font-semibold text-slate-800 max-w-sm leading-relaxed min-h-[36px] flex items-center justify-center">
        {messages[msgIndex]} ({meta.label})
      </p>

      {/* Progress Shimmer */}
      <div className="w-48 h-1.5 bg-orange-100 rounded-full overflow-hidden mt-2">
        <div className="h-full bg-gradient-to-r from-[#F05A28] via-amber-400 to-[#F05A28] keyt-robot-progress" />
      </div>

      <style>{`
        .keyt-robot-radar {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 44px;
          height: 44px;
          margin-left: -22px;
          margin-top: -22px;
          border-radius: 50%;
          border: 2px solid #F05A28;
          opacity: 0;
          pointer-events: none;
          animation: keytRadarPulse 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .keyt-robot-radar--2 {
          animation-delay: 0.9s;
        }
        .keyt-robot-progress {
          width: 100%;
          background-size: 200% 100%;
          animation: keytRobotShimmer 1.4s linear infinite;
        }
        @keyframes keytRadarPulse {
          0% { transform: scale(0.5); opacity: 0.85; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes keytRobotShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
