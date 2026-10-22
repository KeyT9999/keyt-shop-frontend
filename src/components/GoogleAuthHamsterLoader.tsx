import { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

const FUNNY_STEPS = [
  'Đợi xíu nha ní, Hamster đang đạp máy chủ hết tốc lực...',
  'Đang bắt tay xác thực với Google của ní...',
  'Đang kiểm tra vé vào cổng Tiệm Tạp Hóa KeyT...',
  'Sắp xong rồi ní ơi, chuẩn bị vào tiệm nha!',
];

interface GoogleAuthHamsterLoaderProps {
  subtitle?: string;
}

export default function GoogleAuthHamsterLoader({ subtitle }: GoogleAuthHamsterLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % FUNNY_STEPS.length);
    }, 1600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full rounded-2xl bg-gradient-to-b from-orange-50/90 via-white to-orange-50/40 border border-orange-200/80 p-6 shadow-inner flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F05A28]/10 text-[#F05A28] text-xs font-bold tracking-wide uppercase mb-3">
        <Sparkles size={13} className="animate-spin" style={{ animationDuration: '3s' }} />
        <span>Đang đăng nhập Google</span>
      </div>

      {/* Uiverse.io Iconic Wheel & Hamster Animation */}
      <div className="my-2 select-none" aria-hidden="true">
        <div className="keyt-wheel-and-hamster">
          <div className="keyt-hamster-wheel" />
          <div className="keyt-hamster">
            <div className="keyt-hamster__body">
              <div className="keyt-hamster__head">
                <div className="keyt-hamster__ear" />
                <div className="keyt-hamster__eye" />
                <div className="keyt-hamster__nose" />
              </div>
              <div className="keyt-hamster__limb keyt-hamster__limb--fr" />
              <div className="keyt-hamster__limb keyt-hamster__limb--fl" />
              <div className="keyt-hamster__limb keyt-hamster__limb--br" />
              <div className="keyt-hamster__limb keyt-hamster__limb--bl" />
              <div className="keyt-hamster__tail" />
            </div>
          </div>
          <div className="keyt-hamster-spoke" />
        </div>
      </div>

      {/* Rotating Funny Message */}
      <p className="mt-3 text-sm font-semibold text-[#1E293B] min-h-[40px] flex items-center justify-center px-2 transition-all duration-300">
        {subtitle || FUNNY_STEPS[stepIndex]}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-[240px] h-2 bg-orange-100 rounded-full overflow-hidden mt-2 p-0.5">
        <div className="h-full bg-gradient-to-r from-[#F05A28] via-amber-400 to-[#F05A28] rounded-full keyt-hamster-progress" />
      </div>

      {/* Step Dots + Security Note */}
      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
        <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
        <span>Kết nối bảo mật SSL • Tự động chuyển trang ngay khi xong</span>
      </div>

      <style>{`
        .keyt-wheel-and-hamster {
          --dur: 1s;
          position: relative;
          width: 11em;
          height: 11em;
          font-size: 13px;
        }

        .keyt-hamster-wheel,
        .keyt-hamster,
        .keyt-hamster div,
        .keyt-hamster-spoke {
          position: absolute;
        }

        .keyt-hamster-wheel,
        .keyt-hamster-spoke {
          border-radius: 50%;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .keyt-hamster-wheel {
          background: radial-gradient(100% 100% at center, hsla(15, 88%, 55%, 0) 47.8%, #F05A28 48%);
          z-index: 2;
          box-shadow: 0 8px 24px -6px rgba(240, 90, 40, 0.35);
        }

        .keyt-hamster {
          animation: keytHamster var(--dur) ease-in-out infinite;
          top: 50%;
          left: calc(50% - 3.5em);
          width: 7em;
          height: 3.75em;
          transform: rotate(4deg) translate(-0.8em, 1.85em);
          transform-origin: 50% 0;
          z-index: 1;
        }

        .keyt-hamster__head {
          animation: keytHamsterHead var(--dur) ease-in-out infinite;
          background: hsl(30, 90%, 55%);
          border-radius: 70% 30% 0 100% / 40% 25% 25% 60%;
          box-shadow: 0 -0.25em 0 hsl(30, 90%, 80%) inset,
            0.75em -1.55em 0 hsl(30, 90%, 90%) inset;
          top: 0;
          left: -2em;
          width: 2.75em;
          height: 2.5em;
          transform-origin: 100% 50%;
        }

        .keyt-hamster__ear {
          animation: keytHamsterEar var(--dur) ease-in-out infinite;
          background: hsl(0, 90%, 85%);
          border-radius: 50%;
          box-shadow: -0.25em 0 hsl(30, 90%, 55%) inset;
          top: -0.25em;
          right: -0.25em;
          width: 0.75em;
          height: 0.75em;
          transform-origin: 50% 75%;
        }

        .keyt-hamster__eye {
          animation: keytHamsterEye var(--dur) linear infinite;
          background-color: hsl(0, 0%, 0%);
          border-radius: 50%;
          top: 0.375em;
          left: 1.25em;
          width: 0.5em;
          height: 0.5em;
        }

        .keyt-hamster__nose {
          background: hsl(0, 90%, 75%);
          border-radius: 35% 65% 85% 15% / 70% 50% 50% 30%;
          top: 0.75em;
          left: 0;
          width: 0.2em;
          height: 0.25em;
        }

        .keyt-hamster__body {
          animation: keytHamsterBody var(--dur) ease-in-out infinite;
          background: hsl(30, 90%, 90%);
          border-radius: 50% 30% 50% 30% / 15% 60% 40% 40%;
          box-shadow: 0.1em 0.75em 0 hsl(30, 90%, 55%) inset,
            0.15em -0.5em 0 hsl(30, 90%, 80%) inset;
          top: 0.25em;
          left: 2em;
          width: 4.5em;
          height: 3em;
          transform-origin: 17% 50%;
          transform-style: preserve-3d;
        }

        .keyt-hamster__limb--fr,
        .keyt-hamster__limb--fl {
          clip-path: polygon(0 0, 100% 0, 70% 80%, 60% 100%, 0% 100%, 40% 80%);
          top: 2em;
          left: 0.5em;
          width: 1em;
          height: 1.5em;
          transform-origin: 50% 0;
        }

        .keyt-hamster__limb--fr {
          animation: keytHamsterFRLimb var(--dur) linear infinite;
          background: linear-gradient(hsl(30, 90%, 80%) 80%, hsl(0, 90%, 75%) 80%);
          transform: rotate(15deg) translateZ(-1px);
        }

        .keyt-hamster__limb--fl {
          animation: keytHamsterFLLimb var(--dur) linear infinite;
          background: linear-gradient(hsl(30, 90%, 90%) 80%, hsl(0, 90%, 85%) 80%);
          transform: rotate(15deg);
        }

        .keyt-hamster__limb--br,
        .keyt-hamster__limb--bl {
          border-radius: 0.75em 0.75em 0 0;
          clip-path: polygon(0 0, 100% 0, 100% 30%, 70% 90%, 70% 100%, 30% 100%, 40% 90%, 0% 30%);
          top: 1em;
          left: 2.8em;
          width: 1.5em;
          height: 2.5em;
          transform-origin: 50% 30%;
        }

        .keyt-hamster__limb--br {
          animation: keytHamsterBRLimb var(--dur) linear infinite;
          background: linear-gradient(hsl(30, 90%, 80%) 90%, hsl(0, 90%, 75%) 90%);
          transform: rotate(-25deg) translateZ(-1px);
        }

        .keyt-hamster__limb--bl {
          animation: keytHamsterBLLimb var(--dur) linear infinite;
          background: linear-gradient(hsl(30, 90%, 90%) 90%, hsl(0, 90%, 85%) 90%);
          transform: rotate(-25deg);
        }

        .keyt-hamster__tail {
          animation: keytHamsterTail var(--dur) linear infinite;
          background: hsl(0, 90%, 85%);
          border-radius: 0.25em 50% 50% 0.25em;
          box-shadow: 0 -0.2em 0 hsl(0, 90%, 75%) inset;
          top: 1.5em;
          right: -0.5em;
          width: 1em;
          height: 0.5em;
          transform: rotate(30deg) translateZ(-1px);
          transform-origin: 0.25em 0.25em;
        }

        .keyt-hamster-spoke {
          animation: keytSpoke var(--dur) linear infinite;
          background: radial-gradient(100% 100% at center, #F05A28 4.8%, hsla(15, 88%, 55%, 0) 5%),
            linear-gradient(hsla(15, 88%, 55%, 0) 46.9%, rgba(240, 90, 40, 0.35) 47% 52.9%, hsla(15, 88%, 55%, 0) 53%) 50% 50% / 99% 99% no-repeat;
        }

        .keyt-hamster-progress {
          width: 100%;
          background-size: 200% 100%;
          animation: keytProgressShimmer 1.5s linear infinite;
        }

        @keyframes keytProgressShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes keytHamster {
          from, to { transform: rotate(4deg) translate(-0.8em, 1.85em); }
          50% { transform: rotate(0) translate(-0.8em, 1.85em); }
        }

        @keyframes keytHamsterHead {
          from, 25%, 50%, 75%, to { transform: rotate(0); }
          12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(8deg); }
        }

        @keyframes keytHamsterEye {
          from, 90%, to { transform: scaleY(1); }
          95% { transform: scaleY(0); }
        }

        @keyframes keytHamsterEar {
          from, 25%, 50%, 75%, to { transform: rotate(0); }
          12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(12deg); }
        }

        @keyframes keytHamsterBody {
          from, 25%, 50%, 75%, to { transform: rotate(0); }
          12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(-2deg); }
        }

        @keyframes keytHamsterFRLimb {
          from, 25%, 50%, 75%, to { transform: rotate(50deg) translateZ(-1px); }
          12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(-30deg) translateZ(-1px); }
        }

        @keyframes keytHamsterFLLimb {
          from, 25%, 50%, 75%, to { transform: rotate(-30deg); }
          12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(50deg); }
        }

        @keyframes keytHamsterBRLimb {
          from, 25%, 50%, 75%, to { transform: rotate(-60deg) translateZ(-1px); }
          12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(20deg) translateZ(-1px); }
        }

        @keyframes keytHamsterBLLimb {
          from, 25%, 50%, 75%, to { transform: rotate(20deg); }
          12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(-60deg); }
        }

        @keyframes keytHamsterTail {
          from, 25%, 50%, 75%, to { transform: rotate(30deg) translateZ(-1px); }
          12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(10deg) translateZ(-1px); }
        }

        @keyframes keytSpoke {
          from { transform: rotate(0); }
          to { transform: rotate(-1turn); }
        }
      `}</style>
    </div>
  );
}
