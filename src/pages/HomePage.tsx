import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Frame,
  Youtube,
  Wand2,
  Zap,
  KeyRound,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Copy,
  Check,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  Mic,
  BookOpen,
  BookMarked,
  Layers,
  Award,
  Headphones,
  Languages,
  FileSearch,
  RotateCw,
  Keyboard,
  Clock,
  Lock,
  Compass,
  Play
} from 'lucide-react';

// ─────────────────────────────────────────────
// 3D Tilt Card Container Component
// ─────────────────────────────────────────────
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

function TiltCard({ children, className = '', onClick, style = {} }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - y) * 8;
    const rotateY = (x - 0.5) * 8;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`);
    setGlare({ x: x * 100, y: y * 100, opacity: 0.14 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-200 ease-out will-change-transform ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-30"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.35) 0%, transparent 65%)`,
          opacity: glare.opacity,
        }}
      />
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Interactive Flashcard Demo Data (JP / CN / EN)
// ─────────────────────────────────────────────
const DEMO_FLASHCARDS = {
  jp: {
    code: 'JP',
    badge: 'Tiếng Nhật • JPD113 / JPD123',
    accent: 'from-rose-500 to-[#F05A28]',
    lightBg: 'bg-orange-50 text-[#F05A28] border-orange-200',
    word: '先生',
    reading: 'せんせい • Sensei',
    meaning: 'Thầy giáo, Cô giáo, Chuyên gia',
    extra: 'Âm Hán Việt: TIÊN SINH • Bài 1 JPD113',
    example: '佐藤先生は日本語の先生です。',
    exampleVi: 'Thầy Sato là giáo viên tiếng Nhật.',
    href: '/courses/jpd113/kanji'
  },
  cn: {
    code: 'CN',
    badge: 'Tiếng Trung • HSK 1 & HSK 2',
    accent: 'from-emerald-600 to-teal-500',
    lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    word: '老师',
    reading: 'lǎo shī • Lão sư',
    meaning: 'Giáo viên, Thầy cô giáo',
    extra: 'Chủ đề: Trường học & Con người • HSK 1',
    example: '她是我们的汉语老师。',
    exampleVi: 'Cô ấy là giáo viên tiếng Trung của chúng tôi.',
    href: '/courses/hsk1/vocabulary'
  },
  en: {
    code: 'EN',
    badge: 'Tiếng Anh • Hackers TOEIC',
    accent: 'from-blue-600 to-indigo-600',
    lightBg: 'bg-blue-50 text-blue-700 border-blue-200',
    word: 'Negotiate',
    reading: '/nɪˈɡoʊ.ʃi.eɪt/ • Verb',
    meaning: 'Đàm phán, thương lượng hợp đồng',
    extra: 'Hackers TOEIC Day 1 • 4.768 Từ vựng',
    example: 'We successfully negotiated a new contract.',
    exampleVi: 'Chúng tôi đã đàm phán thành công hợp đồng mới.',
    href: '/courses/toeichackers/vocabulary'
  }
} as const;

type HeroTabType = 'overview' | 'otp' | 'languages' | 'studio';
type LangFilterType = 'all' | 'jp' | 'cn' | 'en';
type FlashcardLangType = 'jp' | 'cn' | 'en';

export default function HomePage() {
  const navigate = useNavigate();

  // Hero Command Preview Tab
  const [heroTab, setHeroTab] = useState<HeroTabType>('overview');

  // Language Section Filter
  const [langFilter, setLangFilter] = useState<LangFilterType>('all');

  // Interactive 3D Flashcard Demo State
  const [cardLang, setCardLang] = useState<FlashcardLangType>('jp');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // 1. Automated Before/After scanner for Photo Frame Box
  const [scannerPos, setScannerPos] = useState(58);
  useEffect(() => {
    let forward = true;
    const interval = setInterval(() => {
      setScannerPos((prev) => {
        if (prev >= 82) forward = false;
        if (prev <= 24) forward = true;
        return forward ? prev + 0.4 : prev - 0.4;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // 2. Automated Live Waveform Animation
  const [waveSeed, setWaveSeed] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setWaveSeed((s) => (s + 1) % 100);
    }, 200);
    return () => clearInterval(timer);
  }, []);

  // 3. Automated Live OTP countdown & random code
  const [otpCode, setOtpCode] = useState('682914');
  const [otpTimer, setOtpTimer] = useState(24);
  const [otpCopied, setOtpCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          const newCode = Math.floor(100000 + Math.random() * 900000).toString();
          setOtpCode(newCode);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyOtp = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(otpCode);
    setOtpCopied(true);
    setTimeout(() => setOtpCopied(false), 2000);
  };

  // Quick-launch dock items (6 core pillars)
  const quickLaunchItems = [
    {
      id: 'otp',
      title: 'Lấy Mã OTP & 2FA Live',
      subtitle: 'ChatGPT • Gemini • TOTP 30s',
      badge: 'LIVE 24/7',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'from-emerald-500 to-teal-600 shadow-emerald-500/25',
      icon: KeyRound,
      href: '/get-otp',
    },
    {
      id: 'photo-frame',
      title: 'Tạo Khung Ảnh EXIF',
      subtitle: 'Leica • Sony • Fujifilm • Apple',
      badge: '4K / 8K',
      badgeClass: 'bg-orange-50 text-[#F05A28] border-orange-200',
      iconBg: 'from-[#F05A28] to-amber-500 shadow-orange-500/25',
      icon: Frame,
      href: '/photo-frame',
    },
    {
      id: 'japanese',
      title: 'Tiếng Nhật FPT & Kana',
      subtitle: 'JPD113 • JPD123 • Giám thị AI',
      badge: 'AI 1-1',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'from-rose-500 to-[#F05A28] shadow-rose-500/25',
      icon: GraduationCap,
      href: '/courses',
    },
    {
      id: 'chinese',
      title: 'Tiếng Trung HSK 1–2',
      subtitle: '290 Từ • Pinyin • Nghe thụ động',
      badge: '22 BÀI',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'from-amber-500 to-orange-600 shadow-amber-500/25',
      icon: Languages,
      href: '/courses/hsk1/vocabulary',
    },
    {
      id: 'english',
      title: 'Tiếng Anh TOEIC & 1000 Từ',
      subtitle: 'Hackers 30 Day • 120 Idioms',
      badge: '5.900+ TỪ',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'from-blue-600 to-indigo-600 shadow-blue-500/25',
      icon: BookOpen,
      href: '/courses/toeichackers/vocabulary',
    },
    {
      id: 'ai-tools',
      title: 'Xóa Nền AI & Nén Ảnh',
      subtitle: 'Tách nền • Nén 90% • YouTube AI',
      badge: 'AI STUDIO',
      badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
      iconBg: 'from-violet-600 to-indigo-600 shadow-violet-500/25',
      icon: Wand2,
      href: '/ai-image',
    },
  ];

  const currentFlashcard = DEMO_FLASHCARDS[cardLang];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-[#F05A28]/15 selection:text-[#F05A28] overflow-x-hidden relative font-sans">
      {/* ── Ambient Argon Glass Background Mesh ─────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-44 left-1/2 -translate-x-1/2 w-[1150px] h-[580px] rounded-full blur-3xl opacity-55"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(240, 90, 40, 0.13) 0%, rgba(59, 130, 246, 0.09) 48%, transparent 75%)',
          }}
        />
        <div
          className="absolute top-[38%] -right-48 w-[640px] h-[640px] rounded-full blur-3xl opacity-45"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.06) 55%, transparent 75%)',
          }}
        />
        <div
          className="absolute bottom-10 -left-48 w-[620px] h-[620px] rounded-full blur-3xl opacity-45"
          style={{
            background: 'radial-gradient(circle, rgba(240, 90, 40, 0.09) 0%, transparent 70%)',
          }}
        />
        {/* Subtle Argon Dot Matrix */}
        <div
          className="absolute inset-0 opacity-[0.32]"
          style={{
            backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* ── Main Content Wrapper ────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-24">

        {/* ============================================================
            SECTION 1: ARGON COMMAND HUB HERO + QUICK-LAUNCH DOCK
           ============================================================ */}
        <section className="text-center max-w-6xl mx-auto pt-2 sm:pt-4 pb-10 sm:pb-14">
          {/* Top Argon Glass Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/90 shadow-xs mb-6 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F05A28] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F05A28]" />
            </span>
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-700">
              <span className="sm:hidden">KeyT Hub • Nhật Trung Anh • OTP 2FA &amp; Ảnh AI</span>
              <span className="hidden sm:inline">
                KeyT Super Hub • Ngoại Ngữ AI (Nhật • Trung • Anh) • Cổng OTP 2FA &amp; Studio Ảnh
              </span>
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.12] mb-5">
            Hệ Sinh Thái{' '}
            <span className="bg-gradient-to-r from-[#F05A28] via-[#EA580C] to-amber-500 bg-clip-text text-transparent">
              Ngoại Ngữ AI,
            </span>
            <br className="hidden sm:inline" />{' '}
            Cổng OTP 2FA &amp; Studio Nhiếp Ảnh Số
          </h1>

          {/* Subtitle covering all pillars */}
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8 font-normal">
            Truy cập tức thì toàn bộ tiện ích trên một nền tảng duy nhất: Lấy mã{' '}
            <strong className="font-bold text-slate-800">OTP ChatGPT / Gemini &amp; 2FA Live 30s</strong>, học{' '}
            <strong className="font-bold text-slate-800">Tiếng Nhật FPT (JPD113 • JPD123 • Kana)</strong>,{' '}
            <strong className="font-bold text-slate-800">Tiếng Trung HSK 1–2</strong>,{' '}
            <strong className="font-bold text-slate-800">Tiếng Anh Hackers TOEIC (5.900+ từ)</strong> cùng bộ công cụ{' '}
            <strong className="font-bold text-slate-800">Khung Ảnh EXIF, Xóa Nền AI &amp; Nén Ảnh HD</strong>.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-10 max-w-md sm:max-w-none mx-auto">
            <button
              onClick={() => navigate('/courses')}
              className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#F05A28] to-[#EA580C] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#F05A28]/25 hover:shadow-xl hover:shadow-[#F05A28]/35 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <GraduationCap size={19} />
              <span>Học Viện Nhật • Trung • Anh</span>
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/get-otp')}
              className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#0F172A] text-white font-bold text-sm sm:text-base shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <KeyRound size={17} className="text-emerald-400" />
              <span>Lấy Mã OTP &amp; 2FA Live</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                30s
              </span>
            </button>

            <button
              onClick={() => navigate('/photo-frame')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-slate-800 font-bold text-sm sm:text-base border border-slate-200/90 shadow-xs hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <Frame size={17} className="text-[#F05A28]" />
              <span>Tạo Khung Ảnh EXIF</span>
            </button>
          </div>

          {/* ── ARGON QUICK-LAUNCH DOCK (6 PILLARS) ─────────────────── */}
          <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-[0_18px_50px_-15px_rgba(15,23,42,0.08)] p-3.5 sm:p-5 mb-10 text-left">
            <div className="flex items-center justify-between px-2 pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <Compass size={14} className="text-[#F05A28] shrink-0" />
                <span>Lối Tắt Truy Cập Nhanh Toàn Bộ Chức Năng (1 Chạm)</span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Tất cả dịch vụ đang hoạt động ổn định
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickLaunchItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.href)}
                    className="group flex items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-[#F05A28]/40 hover:shadow-md transition-all duration-200 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.iconBg} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                      >
                        <IconComponent size={19} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-[13.5px] text-slate-900 group-hover:text-[#F05A28] transition-colors whitespace-nowrap">
                          {item.title}
                        </div>
                        <p className="text-[11.5px] text-slate-500 whitespace-nowrap mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border whitespace-nowrap ${item.badgeClass}`}
                      >
                        {item.badge}
                      </span>
                      <ChevronRight
                        size={15}
                        className="text-slate-400 group-hover:text-[#F05A28] group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── INTERACTIVE ARGON COMMAND PREVIEW WINDOW ────────────── */}
          <div className="relative mx-auto max-w-6xl">
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.1)] p-3 sm:p-5">
              {/* Top Window Bar + Interactive Tab Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-xs font-bold text-slate-500 tracking-wide">
                    keyt-hub://interactive-preview
                  </span>
                </div>

                {/* 4 Switchable Preview Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60">
                  {[
                    { id: 'overview', label: 'Toàn Cảnh Hệ Sinh Thái', icon: Layers },
                    { id: 'otp', label: 'Cổng OTP & 2FA 30s', icon: KeyRound },
                    { id: 'languages', label: 'Nhật • Trung • Anh', icon: GraduationCap },
                    { id: 'studio', label: 'Studio Ảnh EXIF & AI', icon: Frame },
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    const active = heroTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setHeroTab(tab.id as HeroTabType)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        <TabIcon size={13} className={active ? 'text-[#F05A28]' : 'text-slate-500'} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TAB 1: OVERVIEW (3 Pillars Side-by-Side Live Preview) */}
              {heroTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left animate-fadeIn">
                  {/* Card A: OTP & 2FA Live */}
                  <div
                    onClick={() => navigate('/get-otp')}
                    className="rounded-2xl bg-[#0F172A] text-white p-5 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                          <KeyRound size={12} /> Cổng OTP &amp; 2FA
                        </span>
                        <span className="text-xs font-mono font-bold text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800/40">
                          Làm mới: {otpTimer}s
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                        Lấy Mã OTP ChatGPT, Gemini &amp; 2FA
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Nhận mã xác thực tự động thời gian thực 24/7 chỉ với 1 cú click.
                      </p>
                    </div>

                    <div>
                      <div className="grid grid-cols-6 gap-1.5 mb-3">
                        {otpCode.split('').map((digit, idx) => (
                          <div
                            key={idx}
                            className="h-10 rounded-lg bg-slate-800/90 border border-emerald-500/30 flex items-center justify-center font-mono font-black text-base text-emerald-300"
                          >
                            {digit}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyOtp}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          otpCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                        }`}
                      >
                        {otpCopied ? <Check size={13} /> : <Copy size={13} />}
                        <span>{otpCopied ? 'Đã sao chép mã OTP!' : 'Sao chép mã thử nghiệm'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Card B: Multi-Language Academy (JP / CN / EN) */}
                  <div
                    onClick={() => navigate('/courses')}
                    className="rounded-2xl bg-slate-50 p-5 border border-slate-200/80 flex flex-col justify-between hover:border-[#F05A28]/50 transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-[#F05A28] text-[11px] font-bold">
                          <GraduationCap size={12} /> 3 Ngôn Ngữ
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">6.800+ Từ vựng</span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-[#F05A28] transition-colors">
                        Học Viện Nhật • Trung • Anh
                      </h3>

                      <div className="space-y-2 my-3">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-black text-[10px]">
                              JP
                            </span>
                            JPD113 • JPD123 • Kana
                          </span>
                          <span className="text-[#F05A28] font-bold">Thi nói AI 1-1</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-black text-[10px]">
                              CN
                            </span>
                            Tiếng Trung HSK 1 &amp; 2
                          </span>
                          <span className="text-emerald-700 font-bold">290 Từ • 22 Bài</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-black text-[10px]">
                              EN
                            </span>
                            Hackers TOEIC &amp; 1000 Từ
                          </span>
                          <span className="text-blue-700 font-bold">5.932 Mục từ</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs font-bold text-[#F05A28]">
                      <span>Vào cổng học tập miễn phí</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Card C: EXIF Photo Studio & AI Image */}
                  <div
                    onClick={() => navigate('/photo-frame')}
                    className="rounded-2xl bg-slate-50 p-5 border border-slate-200/80 flex flex-col justify-between hover:border-blue-500/40 transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold">
                          <Frame size={12} /> Studio Ảnh &amp; AI
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600">100% Free</span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        Khung EXIF, Xóa Nền &amp; Nén HD
                      </h3>

                      {/* Mini EXIF frame visual */}
                      <div className="rounded-xl bg-white p-2.5 border border-slate-200 shadow-xs mb-3">
                        <div className="h-20 rounded-lg bg-gradient-to-tr from-slate-800 via-indigo-900 to-[#F05A28] relative overflow-hidden flex items-center justify-center">
                          <span className="text-[11px] font-bold text-white/90 px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-xs">
                            Leica Q3 • 28mm f/1.7 • ISO 100
                          </span>
                        </div>
                        <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-600">
                          <span className="font-bold text-slate-900">LEICA CAMERA AG</span>
                          <span>1/1000s • 4K Lossless</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold text-center">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/photo-frame');
                        }}
                        className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-[#F05A28] hover:text-[#F05A28] transition-colors"
                      >
                        Khung EXIF
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/ai-image');
                        }}
                        className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-violet-600 hover:text-violet-600 transition-colors"
                      >
                        Xóa Nền AI
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/compress');
                        }}
                        className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-600 hover:text-emerald-600 transition-colors"
                      >
                        Nén Ảnh 90%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OTP & 2FA LIVE DETAIL PREVIEW */}
              {heroTab === 'otp' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left animate-fadeIn">
                  <div className="md:col-span-7 rounded-2xl bg-[#0F172A] text-white p-6 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
                        <ShieldCheck size={14} />
                        <span>Cổng Xác Thực Tự Động Thời Gian Thực</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black mb-2">
                        Lấy Mã OTP ChatGPT Plus, Gemini &amp; 2FA TOTP
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                        Hệ thống tự động trích xuất mã xác thực đăng nhập cho tài khoản ChatGPT, Gemini Advanced và giải mã khóa 2FA (TOTP 6 chữ số) tự làm mới mỗi 30 giây.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => navigate('/get-otp')}
                        className="px-4 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <KeyRound size={14} /> Lấy OTP ChatGPT
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/get-otp-gemini')}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Sparkles size={14} /> Lấy OTP Gemini
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/2falive')}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Lock size={14} /> Công Cụ 2FA Live
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-5 rounded-2xl bg-slate-900 text-white p-5 border border-slate-800 flex flex-col justify-center">
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        2FA TOTP LIVE GENERATOR
                      </span>
                      <span className="font-mono text-orange-400 font-bold">{otpTimer}s còn lại</span>
                    </div>
                    <div className="grid grid-cols-6 gap-2 my-3">
                      {otpCode.split('').map((c, i) => (
                        <div
                          key={i}
                          className="h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-lg font-black text-white"
                        >
                          {c}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyOtp}
                      className="mt-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      {otpCopied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{otpCopied ? 'Đã sao chép!' : 'Sao chép mã 6 số'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: LANGUAGES PREVIEW */}
              {heroTab === 'languages' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left animate-fadeIn">
                  <div
                    onClick={() => navigate('/courses/jpd123')}
                    className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 hover:shadow-md transition-all cursor-pointer"
                  >
                    <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase">
                      TIẾNG NHẬT FPT
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-3 mb-1">
                      JPD113 • JPD123 &amp; Bảng Kana
                    </h4>
                    <p className="text-xs text-slate-600 mb-3">
                      77 Hán tự 3D, 630 từ vựng, 44 ngữ pháp, Thi nói 1-1 Giám thị AI &amp; Kana Quiz kiểu Tofugu.
                    </p>
                    <span className="text-xs font-bold text-rose-600 inline-flex items-center gap-1">
                      Học Tiếng Nhật ngay <ArrowRight size={13} />
                    </span>
                  </div>

                  <div
                    onClick={() => navigate('/courses/hsk1/vocabulary')}
                    className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 hover:shadow-md transition-all cursor-pointer"
                  >
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                      TIẾNG TRUNG HSK
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-3 mb-1">
                      Từ Vựng HSK 1 &amp; HSK 2
                    </h4>
                    <p className="text-xs text-slate-600 mb-3">
                      290 từ vựng theo 22 chủ đề, chữ Hán giản thể, Pinyin, luyện gõ, ghép cặp &amp; Nghe thụ động.
                    </p>
                    <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                      Học Tiếng Trung ngay <ArrowRight size={13} />
                    </span>
                  </div>

                  <div
                    onClick={() => navigate('/courses/toeichackers/vocabulary')}
                    className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 hover:shadow-md transition-all cursor-pointer"
                  >
                    <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase">
                      TIẾNG ANH TOEIC
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-3 mb-1">
                      Hackers TOEIC, 120 Idioms &amp; 1000 Từ
                    </h4>
                    <p className="text-xs text-slate-600 mb-3">
                      4.768 từ Hackers TOEIC (Day 1–30), 120 Thành ngữ kèm 6 Quiz &amp; 1.044 từ thông dụng 50 chủ đề.
                    </p>
                    <span className="text-xs font-bold text-blue-700 inline-flex items-center gap-1">
                      Học Tiếng Anh ngay <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: STUDIO PREVIEW */}
              {heroTab === 'studio' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-left animate-fadeIn">
                  {[
                    {
                      title: 'Khung Ảnh EXIF',
                      desc: 'Tự động đọc metadata Leica, Sony, Fujifilm, Apple, xuất ảnh 4K.',
                      href: '/photo-frame',
                      badge: 'Nhiếp ảnh',
                      color: 'text-[#F05A28] bg-orange-50 border-orange-200',
                    },
                    {
                      title: 'AI Xử Lý & Xóa Nền',
                      desc: 'Tách nền 100% miễn phí, viết Caption & Hashtag bằng AI.',
                      href: '/ai-image',
                      badge: 'AI Studio',
                      color: 'text-violet-700 bg-violet-50 border-violet-200',
                    },
                    {
                      title: 'Nén Ảnh HD 90%',
                      desc: 'Giảm tới 90% dung lượng WebP, PNG, JPEG giữ nguyên độ nét.',
                      href: '/compress',
                      badge: 'Tối ưu Web',
                      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                    },
                    {
                      title: 'YouTube & Evidence AI',
                      desc: 'Tóm tắt video YouTube siêu tốc & Kiểm tra bằng chứng AI.',
                      href: '/summarizer',
                      badge: 'Trợ lý AI',
                      color: 'text-blue-700 bg-blue-50 border-blue-200',
                    },
                  ].map((tool, i) => (
                    <div
                      key={i}
                      onClick={() => navigate(tool.href)}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${tool.color}`}>
                          {tool.badge}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 mt-2.5 mb-1">{tool.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{tool.desc}</p>
                      </div>
                      <span className="mt-3 text-xs font-bold text-slate-900 inline-flex items-center gap-1">
                        Mở công cụ <ArrowRight size={12} />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 2: CỔNG XÁC THỰC OTP & 2FA LIVE (SPOTLIGHT COMMAND BAR)
           ============================================================ */}
        <section className="py-8 sm:py-10">
          <div className="rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#F05A28]/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left 7 Cols: OTP Services Info & Direct Buttons */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
                  <KeyRound size={14} />
                  <span>Cổng Xác Thực Số Tự Động 24/7</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-3">
                  Lấy Mã OTP ChatGPT, Gemini &amp; Tạo Mã 2FA Tức Thì
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
                  Không cần chờ đợi admin gửi mã thủ công. Hệ thống tự động đọc mã xác thực đăng nhập{' '}
                  <strong className="text-white">ChatGPT Plus</strong>,{' '}
                  <strong className="text-white">Gemini Advanced</strong> và tích hợp trình tạo mã{' '}
                  <strong className="text-white">2FA Live (TOTP 6 số)</strong> chuẩn bảo mật, tự làm mới mỗi 30 giây.
                </p>

                {/* 3 Direct Sub-Portal Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/get-otp')}
                    className="group p-4 rounded-2xl bg-white/8 hover:bg-white/14 border border-white/10 hover:border-[#F05A28]/60 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-[#F05A28] text-white text-[10px] font-extrabold">
                        PHỔ BIẾN NHẤT
                      </span>
                      <ArrowRight size={15} className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="font-bold text-sm text-white mb-0.5">OTP ChatGPT Plus</div>
                    <div className="text-xs text-slate-400">Nhận mã đăng nhập OpenAI</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/get-otp-gemini')}
                    className="group p-4 rounded-2xl bg-white/8 hover:bg-white/14 border border-white/10 hover:border-blue-400/60 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-extrabold">
                        GOOGLE AI
                      </span>
                      <ArrowRight size={15} className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="font-bold text-sm text-white mb-0.5">OTP Gemini Advanced</div>
                    <div className="text-xs text-slate-400">Nhận mã xác thực Google</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/2falive')}
                    className="group p-4 rounded-2xl bg-white/8 hover:bg-white/14 border border-white/10 hover:border-emerald-400/60 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-extrabold">
                        TOTP 30 GIÂY
                      </span>
                      <ArrowRight size={15} className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="font-bold text-sm text-white mb-0.5">Công Cụ 2FA Live</div>
                    <div className="text-xs text-slate-400">Giải mã Secret Key 2FA</div>
                  </button>
                </div>
              </div>

              {/* Right 5 Cols: Interactive Live OTP Terminal */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-5 sm:p-6 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                        Mô Phỏng Mã OTP / 2FA Thực Tế
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-orange-400 bg-orange-950/70 px-2.5 py-1 rounded-lg border border-orange-800/50">
                      <Clock size={12} /> {otpTimer}s
                    </span>
                  </div>

                  {/* 6-Digit Display */}
                  <div className="grid grid-cols-6 gap-2 my-4">
                    {otpCode.split('').map((char, idx) => (
                      <div
                        key={idx}
                        className="h-12 sm:h-14 rounded-xl bg-slate-900 border border-emerald-500/35 flex items-center justify-center font-mono font-black text-xl sm:text-2xl text-white shadow-inner"
                      >
                        {char}
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-[#F05A28] transition-all duration-1000"
                      style={{ width: `${(otpTimer / 30) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleCopyOtp}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        otpCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      {otpCopied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{otpCopied ? 'Đã sao chép!' : 'Copy mã thử nghiệm'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/get-otp')}
                      className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F05A28] to-[#EA580C] hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Mở Cổng Lấy Mã Ngay</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 3: HỌC VIỆN NGOẠI NGỮ ĐA QUỐC GIA (NHẬT • TRUNG • ANH)
           ============================================================ */}
        <section className="py-12 sm:py-16">
          {/* Section Header + Language Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#F05A28] text-xs font-extrabold uppercase tracking-wider mb-3">
                <GraduationCap size={15} />
                <span>Học Viện Ngoại Ngữ Đa Quốc Gia • Nhật • Trung • Anh</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Làm Chủ 3 Ngôn Ngữ Với Công Nghệ AI Tương Tác
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
                Từ luyện thi nói 1-1 Giám thị AI môn tiếng Nhật FPT (JPD113/123 &amp; Kana), từ vựng tiếng Trung HSK 1–2 có nghe thụ động, đến bộ 4.768 từ Hackers TOEIC &amp; 1.000 từ tiếng Anh thông dụng.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs self-start md:self-auto shrink-0">
              {[
                { id: 'all', label: 'Tất Cả (3 Ngôn Ngữ)' },
                { id: 'jp', label: 'Tiếng Nhật FPT' },
                { id: 'cn', label: 'Tiếng Trung HSK' },
                { id: 'en', label: 'Tiếng Anh TOEIC' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLangFilter(tab.id as LangFilterType)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    langFilter === tab.id
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── 3 LANGUAGE PILLAR CARDS ─────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* PILLAR 1: TIẾNG NHẬT (JPD113, JPD123, KANA QUIZ) */}
            {(langFilter === 'all' || langFilter === 'jp') && (
              <div
                className={`rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden ${
                  langFilter === 'jp' ? 'lg:col-span-3' : ''
                }`}
              >
                <div className="absolute -right-6 -top-6 text-8xl font-black text-rose-500/5 select-none pointer-events-none">
                  日本語
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold">
                      <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded text-[10px]">JP</span>
                      Tiếng Nhật Chuẩn FPT
                    </span>
                    <span className="text-xs font-bold text-[#F05A28] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                      Có Giám Thị AI 1-1
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                    JPD113 • JPD123 &amp; Bảng Chữ Cái Kana
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                    Bám sát giáo trình Minna no Nihongo (Bài 1–7) tại Đại học FPT: học 77 Hán tự 3D, 630 từ vựng, 44 mẫu ngữ pháp, luyện đề Final Exam 60 phút và phòng thi nói 1-1 với Giám thị AI.
                  </p>

                  {/* Sub-courses list */}
                  <div className="space-y-2.5 mb-6">
                    <div
                      onClick={() => navigate('/courses/jpd113')}
                      className="group p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-black shrink-0 whitespace-nowrap">
                            JPD113
                          </span>
                          <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700 truncate">
                            Tiếng Nhật Sơ Cấp 1 (Bài 1 – 3)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          35 Hán tự • 379 Từ vựng • 21 Ngữ pháp • Thi nói AI &amp; 2 Đề FE
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    <div
                      onClick={() => navigate('/courses/jpd123')}
                      className="group p-3.5 rounded-2xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200/80 hover:border-orange-300 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#F05A28] text-white text-[10px] font-black shrink-0 whitespace-nowrap">
                            JPD123
                          </span>
                          <span className="font-bold text-sm text-slate-900 group-hover:text-[#F05A28] truncate">
                            Tiếng Nhật Sơ Cấp 2 (Bài 4 – 7)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          42 Hán tự • 251 Từ vựng • 23 Ngữ pháp • 73 câu FE &amp; Thi nói tranh
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-[#F05A28] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    <div
                      onClick={() => navigate('/courses/kana')}
                      className="group p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-black shrink-0 whitespace-nowrap">
                            KANA
                          </span>
                          <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 truncate">
                            Phản Xạ Hiragana &amp; Katakana
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Gõ Romaji chuẩn Tofugu • Âm đục, âm ghép • Đa dạng font chữ
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate('/courses/jpd123/speaking')}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#F05A28] to-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap hover:brightness-110 transition-all cursor-pointer"
                  >
                    <Mic size={14} className="shrink-0" /> <span>Thi Nói AI 1-1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/courses/kana')}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer"
                  >
                    <Keyboard size={14} className="shrink-0" /> <span>Luyện Gõ Kana</span>
                  </button>
                </div>
              </div>
            )}

            {/* PILLAR 2: TIẾNG TRUNG (HSK 1 & HSK 2) */}
            {(langFilter === 'all' || langFilter === 'cn') && (
              <div
                className={`rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden ${
                  langFilter === 'cn' ? 'lg:col-span-3' : ''
                }`}
              >
                <div className="absolute -right-6 -top-6 text-8xl font-black text-emerald-500/5 select-none pointer-events-none">
                  中文
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
                      <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[10px]">CN</span>
                      Tiếng Trung Sơ Cấp
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      290 Từ • 22 Chủ Đề
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                    Từ Vựng HSK 1 &amp; HSK 2 Đa Chế Độ
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                    Chinh phục chữ Hán giản thể, phiên âm Pinyin và nghĩa tiếng Việt qua 5 chế độ: Flashcard 3D, Luyện gõ chữ Hán, Trắc nghiệm, Ghép cặp và đặc biệt là <strong className="text-slate-800">Nghe thụ động (Passive Listening)</strong>.
                  </p>

                  <div className="space-y-2.5 mb-6">
                    <div
                      onClick={() => navigate('/courses/hsk1/vocabulary')}
                      className="group p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black shrink-0 whitespace-nowrap">
                            HSK 1
                          </span>
                          <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 truncate">
                            Tiếng Trung Sơ Cấp 1 (150 Từ)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          11 chủ đề giao tiếp nền tảng • Chữ Hán giản thể + Pinyin chuẩn
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    <div
                      onClick={() => navigate('/courses/hsk2/vocabulary')}
                      className="group p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-300 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-teal-600 text-white text-[10px] font-black shrink-0 whitespace-nowrap">
                            HSK 2
                          </span>
                          <span className="font-bold text-sm text-slate-900 group-hover:text-teal-700 truncate">
                            Tiếng Trung Sơ Cấp 2 (140 Từ)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          11 chủ đề mở rộng • Ôn tập phản xạ trắc nghiệm &amp; viết chữ Hán
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    {/* Highlight Feature: Passive Listening */}
                    <div
                      onClick={() => navigate('/courses/hsk1/vocabulary')}
                      className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3 cursor-pointer hover:bg-emerald-100/60 transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Headphones size={17} />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-emerald-900">
                          Chế Độ Nghe Thụ Động (Passive Listening)
                        </div>
                        <p className="text-[11px] text-emerald-700">
                          Tự động phát tuần tự: Tiếng Trung → Nghĩa Tiếng Việt giúp nhớ từ ngay cả khi đang bận.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate('/courses/hsk1/vocabulary')}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer"
                  >
                    <BookOpen size={14} className="shrink-0" /> <span>Học HSK 1 Ngay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/courses/hsk2/vocabulary')}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer"
                  >
                    <Layers size={14} className="shrink-0" /> <span>Học HSK 2 Ngay</span>
                  </button>
                </div>
              </div>
            )}

            {/* PILLAR 3: TIẾNG ANH (HACKERS TOEIC, 120 IDIOMS, 1000 WORDS) */}
            {(langFilter === 'all' || langFilter === 'en') && (
              <div
                className={`rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden ${
                  langFilter === 'en' ? 'lg:col-span-3' : ''
                }`}
              >
                <div className="absolute -right-4 -top-6 text-8xl font-black text-blue-500/5 select-none pointer-events-none">
                  ENG
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold whitespace-nowrap">
                      <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded text-[10px]">EN</span>
                      Tiếng Anh Thực Chiến
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 whitespace-nowrap shrink-0">
                      6.949 Mục Từ
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                    Hackers TOEIC, Bá Khí &amp; 1.000 Từ
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                    Hệ thống 4 khóa từ vựng tiếng Anh đồ sộ có phiên âm IPA, ngữ cảnh bài đọc, Flashcard 3D và bài tập Quiz thực chiến cho sinh viên &amp; người đi làm.
                  </p>

                  <div className="space-y-2.5 mb-6">
                    <div
                      onClick={() => navigate('/courses/toeichackers/vocabulary')}
                      className="group p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-black shrink-0 whitespace-nowrap">
                            HACKERS
                          </span>
                          <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700 truncate">
                            Hackers TOEIC (Day 1 – 30)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          4.768 từ &amp; cụm từ chia theo 30 ngày luyện thi kinh điển
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    <div
                      onClick={() => navigate('/courses/engbk/vocabulary')}
                      className="group p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-300 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-black shrink-0 whitespace-nowrap">
                            BÁ KHÍ • 12 QUIZ
                          </span>
                          <span className="font-bold text-sm text-slate-900 group-hover:text-purple-700 truncate">
                            Từ Vựng Tiếng Anh Bá Khí
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          1.017 từ &amp; cụm từ học thuật • 12 phần Quiz theo ngữ cảnh bài đọc
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    <div
                      onClick={() => navigate('/courses/toeic120/vocabulary')}
                      className="group p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-black shrink-0 whitespace-nowrap">
                            120 IDIOMS
                          </span>
                          <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 truncate">
                            120 Thành Ngữ &amp; Cụm Từ
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Trích xuất trang 516–521 • Tích hợp 6 bài Quiz kiểm tra phản xạ
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    <div
                      onClick={() => navigate('/courses/eng1000/vocabulary')}
                      className="group p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50/60 border border-slate-200/80 hover:border-sky-300 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-sky-600 text-white text-[10px] font-black shrink-0 whitespace-nowrap">
                            1000 TỪ
                          </span>
                          <span className="font-bold text-sm text-slate-900 group-hover:text-sky-700 truncate">
                            1.000 Từ Thông Dụng Nhất
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          1.044 từ vựng chia theo 50 chủ đề đời sống, gia đình &amp; công sở
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate('/courses/toeichackers/vocabulary')}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer"
                  >
                    <Award size={14} className="shrink-0" /> <span>Hackers TOEIC</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/courses/eng1000/vocabulary')}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer"
                  >
                    <BookMarked size={14} className="shrink-0" /> <span>1.000 Từ Cốt Lõi</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── INTERACTIVE LANGUAGE PLAYGROUND: AI SPEAKING + 3D MULTILINGUAL FLASHCARD ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: AI 1-1 Speaking Room Showcase */}
            <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-6 sm:p-8 border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#F05A28]/20 blur-3xl pointer-events-none" />

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F05A28]/20 border border-[#F05A28]/40 text-orange-300 text-xs font-bold">
                    <Mic size={13} /> Phòng Thi Nói 1-1 Giám Thị AI
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Chấm điểm ngữ âm tức thì
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black mb-2">
                  Luyện Phản Xạ Nói &amp; Chấm Phát Âm Từng Từ Bằng AI
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                  Mô phỏng 100% quy trình khảo thí vấn đáp tại Đại học FPT (Đọc đoạn văn + Hỏi đáp Q&amp;A ngẫu nhiên hoặc câu hỏi tranh). AI lắng nghe qua Micro, phát hiện từ phát âm sai và hướng dẫn cách sửa ngay lập tức.
                </p>

                {/* Simulated Live Speech Waveform Box */}
                <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 mb-5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400 font-medium">
                      Câu hỏi AI: <strong className="text-white">「毎日、何時に起きますか？」</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
                      Độ chính xác: 96%
                    </span>
                  </div>

                  {/* Animated bars */}
                  <div className="flex items-center gap-1 h-9 my-2">
                    {Array.from({ length: 32 }).map((_, i) => {
                      const height = 22 + ((Math.sin((i + waveSeed) * 0.6) + 1) * 36);
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-full bg-gradient-to-t from-[#F05A28] to-emerald-400 transition-all duration-200"
                          style={{ height: `${Math.min(100, Math.max(18, height))}%` }}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Phản hồi: Phát âm trường âm và ngữ điệu câu hỏi rất tự nhiên!</span>
                    <span className="text-orange-400 font-bold">9.5 / 10 điểm</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/courses/jpd113/speaking')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Mic size={14} className="text-blue-400" /> Phòng Thi Nói JPD113
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/courses/jpd123/speaking')}
                  className="px-5 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#EA580C] text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#F05A28]/25"
                >
                  <Mic size={14} /> Phòng Thi Nói JPD123 <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Right 5 Cols: Interactive 3D Flashcard Demo (Switch JP / CN / EN) */}
            <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <RotateCw size={13} className="text-[#F05A28]" />
                    Thử Tương Tác Flashcard 3D
                  </span>

                  {/* Language Switcher for Flashcard */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {(['jp', 'cn', 'en'] as FlashcardLangType[]).map((langKey) => (
                      <button
                        key={langKey}
                        type="button"
                        onClick={() => {
                          setCardLang(langKey);
                          setIsCardFlipped(false);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase transition-all cursor-pointer ${
                          cardLang === langKey
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {langKey.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clickable Flip Card */}
                <div
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                  className="group rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 min-h-[210px] flex flex-col justify-between cursor-pointer hover:border-[#F05A28]/50 hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${currentFlashcard.lightBg}`}>
                      {currentFlashcard.badge}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#F05A28] flex items-center gap-1">
                      <RotateCw size={12} /> Bấm để lật thẻ
                    </span>
                  </div>

                  {!isCardFlipped ? (
                    <div className="my-4 text-center animate-fadeIn">
                      <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-2">
                        {currentFlashcard.word}
                      </div>
                      <div className="text-sm font-bold text-[#F05A28]">{currentFlashcard.reading}</div>
                      <div className="text-xs text-slate-500 mt-1">{currentFlashcard.extra}</div>
                    </div>
                  ) : (
                    <div className="my-4 text-left animate-fadeIn">
                      <div className="text-xs font-extrabold uppercase text-slate-400 mb-1">Nghĩa tiếng Việt:</div>
                      <div className="text-lg font-black text-slate-900 mb-3">{currentFlashcard.meaning}</div>
                      <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200/70">
                        <div className="text-xs font-bold text-slate-800">{currentFlashcard.example}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{currentFlashcard.exampleVi}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>Trạng thái: {isCardFlipped ? 'Mặt sau (Nghĩa & Ví dụ)' : 'Mặt trước (Từ vựng)'}</span>
                    <span className="font-bold text-slate-700">Hỗ trợ phát âm chuẩn</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(currentFlashcard.href)}
                className="mt-4 w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Mở Kho Flashcard {currentFlashcard.code} Đầy Đủ</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 4: STUDIO NHIẾP ẢNH EXIF & TIỆN ÍCH AI SÁNG TẠO (BENTO)
           ============================================================ */}
        <section className="py-12 sm:py-16 border-t border-slate-200/80">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-extrabold uppercase tracking-wider mb-3">
                <Frame size={14} />
                <span>Studio Nhiếp Ảnh &amp; Công Cụ AI Thông Minh</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Bộ Công Cụ Xử Lý Ảnh &amp; Trợ Lý AI Trên Trình Duyệt
              </h2>
            </div>
            <p className="text-slate-600 text-sm sm:text-base max-w-md">
              Xử lý ảnh độ phân giải gốc 4K/8K, tự động gắn thông số máy ảnh EXIF, tách nền bằng AI và nén dung lượng tới 90% hoàn toàn miễn phí.
            </p>
          </div>

          {/* Bento Grid: 12 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* BOX 1 (7 Cols): PHOTO FRAME EXIF STUDIO */}
            <TiltCard
              onClick={() => navigate('/photo-frame')}
              className="lg:col-span-7 group rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-[#F05A28]/40 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#F05A28] border border-orange-200 text-xs font-extrabold">
                    <Frame size={13} /> Tạo Khung Ảnh EXIF Nghệ Thuật
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    100% Miễn Phí • Xuất Ảnh 4K/8K
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#F05A28] transition-colors mb-2">
                  Tự Động Đọc Metadata EXIF &amp; Đóng Khung Chuyên Nghiệp
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Trích xuất tức thì thông số tiêu cự, khẩu độ, tốc độ màn trập, ISO và tự động nhận diện thương hiệu máy ảnh (<strong className="text-slate-800">Leica, Sony, Fujifilm, Canon, Nikon, Apple...</strong>) để tạo khung viền triển lãm tinh tế.
                </p>

                {/* Live Interactive Scanner Preview */}
                <div className="rounded-2xl bg-slate-900 p-4 sm:p-5 border border-slate-800 relative overflow-hidden mb-5">
                  <div className="relative h-44 sm:h-52 rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 flex items-center justify-center">
                    {/* Simulated Photo Landscape */}
                    <div
                      className="absolute inset-0 opacity-90"
                      style={{
                        background:
                          'linear-gradient(135deg, #0F172A 0%, #1E3A8A 40%, #F05A28 85%, #F59E0B 100%)',
                      }}
                    />

                    {/* After EXIF Frame Overlay (Clipped by scannerPos) */}
                    <div
                      className="absolute inset-0 bg-white p-3 sm:p-4 flex flex-col justify-between transition-none"
                      style={{ clipPath: `inset(0 ${100 - scannerPos}% 0 0)` }}
                    >
                      <div
                        className="flex-1 rounded-lg"
                        style={{
                          background:
                            'linear-gradient(135deg, #0F172A 0%, #1E3A8A 40%, #F05A28 85%, #F59E0B 100%)',
                        }}
                      />
                      <div className="pt-2.5 px-1 flex items-center justify-between text-[11px] text-slate-800 font-mono">
                        <div>
                          <div className="font-black text-slate-900 text-xs">FUJIFILM X100VI</div>
                          <div className="text-[10px] text-slate-500">Fujinon 23mm f/2.0 II</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">23mm • f/2.0 • 1/1000s • ISO 125</div>
                          <div className="text-[10px] text-[#F05A28] font-bold">Classic Negative • KeyT Frame</div>
                        </div>
                      </div>
                    </div>

                    {/* Scanner Divider Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[#F05A28] shadow-[0_0_12px_#F05A28] z-20"
                      style={{ left: `${scannerPos}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#F05A28] text-white flex items-center justify-center shadow-lg">
                        <Sliders size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">
                  Hỗ trợ xuất hàng loạt (Batch Export) &amp; Chữ ký cá nhân
                </span>
                <span className="font-extrabold text-[#F05A28] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Mở Studio Khung Ảnh <ArrowRight size={14} />
                </span>
              </div>
            </TiltCard>

            {/* BOX 2 (5 Cols): AI IMAGE STUDIO (REMOVE BG + CAPTION AI) */}
            <TiltCard
              onClick={() => navigate('/ai-image')}
              className="lg:col-span-5 group rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-violet-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-xs font-extrabold">
                    <Wand2 size={13} /> AI Xử Lý Ảnh Đa Năng
                  </span>
                  <span className="text-xs font-bold text-violet-700">Không Cần Key Khi Xóa Nền</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-violet-700 transition-colors mb-2">
                  Tách Nền Chủ Thể 1 Chạm &amp; Viết Caption AI
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  Tự động tách nền ảnh chân dung, sản phẩm sắc nét từng sợi tóc ngay trên trình duyệt. Kết hợp AI phân tích bức ảnh để gợi ý Caption &amp; bộ Hashtag bắt trend mạng xã hội.
                </p>

                <div className="space-y-2.5 mb-6">
                  {[
                    {
                      title: 'Xóa Nền Tự Động 100% Miễn Phí',
                      desc: 'Chạy trực tiếp bằng mô hình AI WebGPU/WASM, không cần nhập API Key.',
                    },
                    {
                      title: 'Tạo Caption & Hashtag Đa Phong Cách',
                      desc: 'Tự động sáng tạo nội dung đăng Facebook, Instagram, Threads từ ảnh.',
                    },
                    {
                      title: 'Gợi Ý Tone Khung & Kiểm Tra Metadata AI',
                      desc: 'Đề xuất bảng màu khung EXIF hài hòa với gam màu chủ đạo của ảnh.',
                    },
                  ].map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5"
                    >
                      <CheckCircle2 size={16} className="text-violet-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">{feat.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{feat.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500">Hỗ trợ PNG trong suốt chất lượng cao</span>
                <span className="font-extrabold text-violet-700 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Thử AI Xử Lý Ảnh <ArrowRight size={14} />
                </span>
              </div>
            </TiltCard>

            {/* BOX 3 (4 Cols): COMPRESS IMAGE 90% HD */}
            <TiltCard
              onClick={() => navigate('/compress')}
              className="lg:col-span-4 group rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:border-emerald-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold mb-3">
                  <Zap size={13} /> Nén Ảnh Online Chuẩn HD
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">
                  Giảm 90% Dung Lượng Không Vỡ Nét
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Nén cùng lúc tới 10 bức ảnh (WebP, AVIF, PNG, JPEG). Giảm từ 8.4 MB xuống chỉ còn ~820 KB mà mắt thường không thể phân biệt.
                </p>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-500 line-through">Ảnh gốc: 8.40 MB</span>
                    <span className="font-extrabold text-emerald-600">Sau nén: 780 KB (-91%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="w-[91%] h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>Nén ảnh ngay trên trình duyệt</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </TiltCard>

            {/* BOX 4 (4 Cols): YOUTUBE SUMMARIZER AI */}
            <TiltCard
              onClick={() => navigate('/summarizer')}
              className="lg:col-span-4 group rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:border-rose-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold mb-3">
                  <Youtube size={13} /> YouTube Summarizer AI
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-rose-600 transition-colors mb-2">
                  Tóm Tắt Video YouTube Trong 5 Giây
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Chỉ cần dán đường link video bài giảng, podcast hoặc tin tức dài hàng tiếng đồng hồ, AI sẽ trích xuất ngay danh sách ý chính &amp; mốc thời gian.
                </p>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Play size={12} className="text-rose-600" /> Tự động đọc phụ đề đa ngôn ngữ
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Hỗ trợ tóm tắt video tiếng Anh, Nhật, Trung sang tiếng Việt mạch lạc, dễ hiểu.
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
                <span>Tóm tắt video ngay</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </TiltCard>

            {/* BOX 5 (4 Cols): EVIDENCE CHECKER & DIGITAL STORE */}
            <TiltCard
              onClick={() => navigate('/evidence')}
              className="lg:col-span-4 group rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:border-blue-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold mb-3">
                  <FileSearch size={13} /> Evidence Checker &amp; Tiện Ích
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                  Kiểm Tra Bằng Chứng &amp; Kho Dịch Vụ Số
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Công cụ phân tích, đối chiếu dữ liệu minh chứng thông minh cùng danh mục dịch vụ &amp; tài khoản công nghệ hỗ trợ học tập 24/7.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/evidence');
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs font-bold text-slate-800 hover:text-blue-700 transition-colors text-left cursor-pointer"
                  >
                    Evidence Checker
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/products');
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 text-xs font-bold text-slate-800 hover:text-[#F05A28] transition-colors text-left cursor-pointer"
                  >
                    Kho Sản Phẩm Số
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Khám phá công cụ kiểm tra</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </TiltCard>
          </div>
        </section>

        {/* ============================================================
            SECTION 5: THỐNG KÊ HỆ SINH THÁI & 3 BƯỚC TRẢI NGHIỆM
           ============================================================ */}
        <section className="py-12 sm:py-16 border-t border-slate-200/80">
          {/* Ecosystem Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {[
              {
                value: '6.800+',
                label: 'Từ Vựng & Hán Tự Đa Ngôn Ngữ',
                sub: 'Nhật (JPD) • Trung (HSK) • Anh (TOEIC)',
                color: 'text-[#F05A28]',
              },
              {
                value: '30 Giây',
                label: 'Làm Mới Mã OTP & 2FA Live',
                sub: 'Hỗ trợ ChatGPT Plus, Gemini & TOTP',
                color: 'text-emerald-600',
              },
              {
                value: '4K / 8K',
                label: 'Độ Phân Giải Xuất Ảnh EXIF',
                sub: 'Giữ nguyên chất lượng gốc & nén HD 90%',
                color: 'text-blue-600',
              },
              {
                value: '24 / 7',
                label: 'Giám Thị AI 1-1 & Công Cụ Web',
                sub: 'Hoạt động mượt trên cả Desktop & Mobile',
                color: 'text-violet-600',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs text-center"
              >
                <div className={`text-2xl sm:text-4xl font-black tracking-tight ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900">{stat.label}</div>
                <div className="text-[11px] text-slate-500 mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* 3 Simple Steps */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#F05A28]">
              Trải Nghiệm Mượt Mà • Không Cần Cài Đặt
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Bắt Đầu Ngay Trong 3 Bước Đơn Giản
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Chọn Phân Khu Bạn Cần',
                desc: 'Truy cập nhanh từ thanh Argon Dock: Lấy mã OTP/2FA, Học ngoại ngữ Nhật - Trung - Anh, hoặc mở Studio Khung Ảnh EXIF & AI.',
              },
              {
                step: '02',
                title: 'Tương Tác Trực Tiếp Trên Web',
                desc: 'Luyện phát âm qua Micro với Giám thị AI, lật Flashcard 3D, bật Nghe thụ động hoặc kéo thả ảnh cần đóng khung / xóa nền.',
              },
              {
                step: '03',
                title: 'Nhận Kết Quả Tức Thì',
                desc: 'Sao chép mã OTP trong 1 chạm, nhận điểm chấm phát âm chi tiết từng từ hoặc tải về bức ảnh EXIF 4K sắc nét chỉ sau 2 giây.',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F05A28] to-amber-500 text-white font-black text-base flex items-center justify-center shadow-md shadow-orange-500/20 mb-4">
                  {step.step}
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================
            SECTION 6: FINAL HIGH-IMPACT ARGON CTA BANNER
           ============================================================ */}
        <section className="mt-6 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-8 sm:p-12 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F05A28]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-300 text-xs font-bold mb-4 backdrop-blur-md">
                <Sparkles size={14} />
                <span>Hệ Sinh Thái Học Tập &amp; Sáng Tạo Số Toàn Diện</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 leading-tight">
                Sẵn Sàng Khám Phá Toàn Bộ Tiện Ích Tại KeyT Hub?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Từ cổng lấy mã OTP/2FA tự động, học viện đa ngôn ngữ Nhật • Trung • Anh (JPD, Kana, HSK, TOEIC) đến bộ công cụ nhiếp ảnh EXIF &amp; AI hoàn toàn miễn phí.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="px-6 py-3.5 rounded-full bg-[#F05A28] hover:bg-[#EA580C] text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <GraduationCap size={18} />
                <span>Cổng Ngoại Ngữ Nhật • Trung • Anh</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/get-otp')}
                className="px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <KeyRound size={17} />
                <span>Cổng OTP &amp; 2FA Live</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/photo-frame')}
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Frame size={17} />
                <span>Studio Ảnh EXIF</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Scoped CSS Styles for Keyframes ───────────────────────── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
