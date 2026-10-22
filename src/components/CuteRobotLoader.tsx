import { useEffect, useState } from 'react';
import { Sparkles, Radio } from 'lucide-react';

interface CuteRobotLoaderProps {
  variant?: 'otp' | 'compress';
  serviceName?: string;
}

const OTP_MESSAGES = [
  'Robot KeyT đang xoay ăng-ten dò mã OTP mới nhất cho ní...',
  'Đang bắt tín hiệu vệ tinh từ hộp thư bảo mật...',
  'Tìm thấy sóng rồi! Đang giải mã 6 số cực chuẩn...',
];

const COMPRESS_MESSAGES = [
  'Robot KeyT đang ép cân cho ảnh của ní nhẹ tênh...',
  'Đang gọt bớt từng kilobyte thừa mà vẫn giữ nét căng...',
  'Sắp xong rồi ní ơi, ảnh siêu nhẹ chuẩn bị ra lò!',
];

export default function CuteRobotLoader({
  variant = 'otp',
  serviceName = 'OTP',
}: CuteRobotLoaderProps) {
  const messages = variant === 'otp' ? OTP_MESSAGES : COMPRESS_MESSAGES;
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1500);
    return () => window.clearInterval(id);
  }, [messages.length]);

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
          {variant === 'otp' ? `Đang dò sóng ${serviceName}` : 'Robot AI Đang Nén Ảnh'}
        </span>
      </div>

      {/* Cute Floating Robot Illustration + Radar Waves */}
      <div className="relative w-32 h-32 flex items-center justify-center my-1 select-none" aria-hidden="true">
        {/* Expanding Radar Waves from Antenna */}
        <span className="keyt-robot-radar keyt-robot-radar--1" />
        <span className="keyt-robot-radar keyt-robot-radar--2" />

        <div className="keyt-cute-robot">
          {/* Antenna */}
          <div className="keyt-robot-antenna">
            <div className="keyt-robot-antenna-ball" />
          </div>

          {/* Head */}
          <div className="keyt-robot-head">
            <div className="keyt-robot-ear keyt-robot-ear--left" />
            <div className="keyt-robot-ear keyt-robot-ear--right" />
            {/* Visor Screen */}
            <div className="keyt-robot-visor">
              <div className="keyt-robot-eyes">
                <span className="keyt-robot-eye" />
                <span className="keyt-robot-eye" />
              </div>
              <div className="keyt-robot-cheeks">
                <span className="keyt-robot-cheek" />
                <span className="keyt-robot-smile" />
                <span className="keyt-robot-cheek" />
              </div>
              {/* Scanning Laser Line */}
              <div className="keyt-robot-scanline" />
            </div>
          </div>

          {/* Body */}
          <div className="keyt-robot-body">
            <div className="keyt-robot-arm keyt-robot-arm--left" />
            <div className="keyt-robot-arm keyt-robot-arm--right" />
            <div className="keyt-robot-chest">
              <Sparkles size={12} className="text-[#F05A28] animate-spin" style={{ animationDuration: '2.5s' }} />
            </div>
          </div>

          {/* Shadow */}
          <div className="keyt-robot-shadow" />
        </div>
      </div>

      {/* Funny Rotating Message */}
      <p className="text-xs sm:text-sm font-semibold text-slate-800 max-w-sm leading-relaxed min-h-[36px] flex items-center justify-center">
        {messages[msgIndex]}
      </p>

      {/* Progress Shimmer */}
      <div className="w-48 h-1.5 bg-orange-100 rounded-full overflow-hidden mt-2">
        <div className="h-full bg-gradient-to-r from-[#F05A28] via-amber-400 to-[#F05A28] keyt-robot-progress" />
      </div>

      <style>{`
        .keyt-cute-robot {
          position: relative;
          width: 88px;
          height: 104px;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: keytRobotFloat 1.8s ease-in-out infinite;
          z-index: 2;
        }

        .keyt-robot-radar {
          position: absolute;
          top: 8px;
          left: 50%;
          width: 24px;
          height: 24px;
          margin-left: -12px;
          border-radius: 50%;
          border: 2px solid #F05A28;
          opacity: 0;
          pointer-events: none;
          animation: keytRadarPulse 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        .keyt-robot-radar--2 {
          animation-delay: 0.9s;
        }

        .keyt-robot-antenna {
          width: 4px;
          height: 14px;
          background: #94A3B8;
          border-radius: 4px;
          position: relative;
          margin-bottom: -2px;
        }

        .keyt-robot-antenna-ball {
          position: absolute;
          top: -7px;
          left: 50%;
          transform: translateX(-50%);
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #F05A28;
          box-shadow: 0 0 12px 3px rgba(240, 90, 40, 0.75);
          animation: keytAntennaGlow 0.9s ease-in-out infinite alternate;
        }

        .keyt-robot-head {
          position: relative;
          width: 68px;
          height: 48px;
          background: linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 100%);
          border: 2.5px solid #1E293B;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 14px -4px rgba(15, 23, 42, 0.18), inset 0 2px 0 #FFFFFF;
        }

        .keyt-robot-ear {
          position: absolute;
          top: 14px;
          width: 7px;
          height: 18px;
          background: #F05A28;
          border: 2px solid #1E293B;
          border-radius: 6px;
        }

        .keyt-robot-ear--left {
          left: -8px;
        }

        .keyt-robot-ear--right {
          right: -8px;
        }

        .keyt-robot-visor {
          position: relative;
          width: 52px;
          height: 32px;
          background: #0F172A;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          box-shadow: inset 0 0 8px rgba(56, 189, 248, 0.25);
        }

        .keyt-robot-eyes {
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 2;
        }

        .keyt-robot-eye {
          width: 8px;
          height: 9px;
          border-radius: 999px;
          background: #38BDF8;
          box-shadow: 0 0 8px #38BDF8;
          animation: keytRobotBlink 2.8s infinite;
        }

        .keyt-robot-cheeks {
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 2;
        }

        .keyt-robot-cheek {
          width: 6px;
          height: 3.5px;
          border-radius: 999px;
          background: #FB7185;
          opacity: 0.9;
        }

        .keyt-robot-smile {
          width: 8px;
          height: 4px;
          border-bottom: 2px solid #38BDF8;
          border-radius: 0 0 8px 8px;
        }

        .keyt-robot-scanline {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(240, 90, 40, 0.85), transparent);
          animation: keytVisorScan 1.4s ease-in-out infinite;
        }

        .keyt-robot-body {
          position: relative;
          margin-top: 3px;
          width: 48px;
          height: 30px;
          background: linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 100%);
          border: 2.5px solid #1E293B;
          border-radius: 14px 14px 18px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .keyt-robot-chest {
          width: 22px;
          height: 16px;
          border-radius: 6px;
          background: #FFF7ED;
          border: 1.5px solid #FDBA74;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .keyt-robot-arm {
          position: absolute;
          top: 4px;
          width: 9px;
          height: 20px;
          background: #E2E8F0;
          border: 2px solid #1E293B;
          border-radius: 8px;
        }

        .keyt-robot-arm--left {
          left: -10px;
          transform-origin: top right;
          animation: keytArmLeft 1s ease-in-out infinite alternate;
        }

        .keyt-robot-arm--right {
          right: -10px;
          transform-origin: top left;
          animation: keytArmRight 1s ease-in-out infinite alternate;
        }

        .keyt-robot-shadow {
          margin-top: 7px;
          width: 44px;
          height: 7px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.14);
          animation: keytShadowScale 1.8s ease-in-out infinite;
        }

        .keyt-robot-progress {
          width: 100%;
          background-size: 200% 100%;
          animation: keytRobotShimmer 1.4s linear infinite;
        }

        @keyframes keytRobotFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }

        @keyframes keytShadowScale {
          0%, 100% { transform: scaleX(1); opacity: 0.22; }
          50% { transform: scaleX(0.75); opacity: 0.12; }
        }

        @keyframes keytRadarPulse {
          0% { transform: scale(0.5); opacity: 0.85; }
          100% { transform: scale(3.4); opacity: 0; }
        }

        @keyframes keytAntennaGlow {
          from { transform: translateX(-50%) scale(0.92); }
          to { transform: translateX(-50%) scale(1.15); }
        }

        @keyframes keytRobotBlink {
          0%, 44%, 48%, 100% { transform: scaleY(1); }
          46% { transform: scaleY(0.1); }
        }

        @keyframes keytVisorScan {
          0%, 100% { top: 2px; opacity: 0.3; }
          50% { top: 26px; opacity: 0.9; }
        }

        @keyframes keytArmLeft {
          from { transform: rotate(10deg); }
          to { transform: rotate(35deg); }
        }

        @keyframes keytArmRight {
          from { transform: rotate(-10deg); }
          to { transform: rotate(-35deg); }
        }

        @keyframes keytRobotShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
