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
  Star,
  GraduationCap,
  Mic,
  BookOpen,
  BookMarked,
  Layers,
  Award,
  UserCheck,
  Headphones
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

    // Subtle 3D tilt angles (max 7 degrees for elegance)
    const rotateX = (0.5 - y) * 10;
    const rotateY = (x - 0.5) * 10;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`);
    setGlare({ x: x * 100, y: y * 100, opacity: 0.15 });
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
      {/* Specular Glare Overlay */}
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
// Main HomePage Component
// ─────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();

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

  // 4. Automated Compression live counter
  const [compressPercent, setCompressPercent] = useState(90.3);
  useEffect(() => {
    const timer = setInterval(() => {
      setCompressPercent((prev) => (prev === 90.3 ? 91.2 : 90.3));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // 5. Automated JPD Speaking Simulation State
  const [jpdCourse, setJpdCourse] = useState<'jpd123' | 'jpd113'>('jpd123');
  const [examCycleStep, setExamCycleStep] = useState<number>(0); // 0: Sensei Question, 1: Student speak & Waveform, 2: Realtime Phonetic Tokens, 3: FPT Scorecard
  const [kanjiIndex, setKanjiIndex] = useState<number>(0);

  // Cycle speaking exam steps every 3.8s
  useEffect(() => {
    const cycleTimer = setInterval(() => {
      setExamCycleStep((prev) => (prev + 1) % 4);
    }, 3800);
    return () => clearInterval(cycleTimer);
  }, []);

  // Switch Kanji word every 4s
  useEffect(() => {
    const wordTimer = setInterval(() => {
      setKanjiIndex((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(wordTimer);
  }, []);

  // JPD Course Showcase Data
  const jpdShowcaseData = {
    jpd123: {
      code: 'JPD123',
      title: 'Tiếng Nhật JPD123',
      level: 'N5 Nâng Cao • Bài 4 đến Bài 7',
      term: 'Kỳ 2 FPT',
      vocabCount: 251,
      kanjiCount: 42,
      grammarCount: 23,
      mockTitle: 'Phòng Khảo Thí FPT - Luyện Thi Nói 1-1 AI',
      sensei: 'Thầy Tanaka (Giám thị AI FPT)',
      questionJp: '「休みの日は、いつも何をしますか？」',
      questionVi: 'Ngày nghỉ em thường làm những gì?',
      studentJp: '「友達と サッカーを して、日本語を 勉強します。」',
      studentVi: 'Em đá bóng với bạn rồi sau đó học tiếng Nhật ạ.',
      tokens: [
        { word: '友達と', conf: '100%' },
        { word: 'サッカーを', conf: '96%' },
        { word: 'して、', conf: '99%' },
        { word: '日本語を', conf: '98%' },
        { word: '勉強します', conf: '95%' }
      ],
      scores: { content: '45/45', pron: '42/45', manner: '10/10', total: 97, result: 'PASSED' },
      kanjiCards: [
        { kanji: '学', onyomi: 'ガク (gaku)', kunyomi: 'まな.ぶ', hanviet: 'HỌC', example: '大学 (daigaku) • Đại học' },
        { kanji: '先', onyomi: 'セン (sen)', kunyomi: 'さき', hanviet: 'TIÊN', example: '先生 (sensei) • Thầy cô' },
        { kanji: '生', onyomi: 'セイ (sei)', kunyomi: 'い.きる', hanviet: 'SINH', example: '学生 (gakusei) • Học sinh' },
        { kanji: '本', onyomi: 'ホン (hon)', kunyomi: 'もと', hanviet: 'BẢN', example: '日本 (nihon) • Nhật Bản' },
        { kanji: '語', onyomi: 'ゴ (go)', kunyomi: 'かた.る', hanviet: 'NGỮ', example: '日本語 (nihongo) • Tiếng Nhật' }
      ]
    },
    jpd113: {
      code: 'JPD113',
      title: 'Tiếng Nhật JPD113',
      level: 'N5 Khởi Động • Bài 1 đến Bài 3',
      term: 'Kỳ 1 FPT',
      vocabCount: 379,
      kanjiCount: 35,
      grammarCount: 21,
      mockTitle: 'Phòng Khảo Thí FPT - Luyện Thi Nói 1-1 AI',
      sensei: 'Cô Sato (Giám thị AI FPT)',
      questionJp: '「お名前は？ お国はどちらですか？」',
      questionVi: 'Em tên là gì? Em đến từ đất nước nào?',
      studentJp: '「私は ナムです。ベトナムから 来ました。」',
      studentVi: 'Em tên là Nam. Em đến từ Việt Nam ạ.',
      tokens: [
        { word: '私は', conf: '100%' },
        { word: 'ナムです。', conf: '98%' },
        { word: 'ベトナムから', conf: '100%' },
        { word: '来ました。', conf: '97%' }
      ],
      scores: { content: '45/45', pron: '44/45', manner: '10/10', total: 99, result: 'PASSED' },
      kanjiCards: [
        { kanji: '日', onyomi: 'ニチ, ジツ', kunyomi: 'ひ, か', hanviet: 'NHẬT', example: '日曜日 (nichiyoubi) • Chủ nhật' },
        { kanji: '月', onyomi: 'ゲツ, ガツ', kunyomi: 'つき', hanviet: 'NGUYỆT', example: '月曜日 (getsuyoubi) • Thứ hai' },
        { kanji: '人', onyomi: 'ジン, ニン', kunyomi: 'ひと', hanviet: 'NHÂN', example: '日本人 (nihonjin) • Người Nhật' },
        { kanji: '山', onyomi: 'サン', kunyomi: 'やま', hanviet: 'SƠN', example: '富士山 (fujisan) • Núi Phú Sĩ' },
        { kanji: '川', onyomi: 'セン', kunyomi: 'かわ', hanviet: 'XUYÊN', example: '川 (kawa) • Con sông' }
      ]
    }
  };

  const activeCourseData = jpdShowcaseData[jpdCourse];
  const activeKanji = activeCourseData.kanjiCards[kanjiIndex % activeCourseData.kanjiCards.length];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-[#F05A28]/20 selection:text-[#F05A28]">
      {/* ── Background Subtle Ambient Orbs ───────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[500px] bg-gradient-to-b from-[#F05A28]/10 via-amber-500/5 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-32 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute top-[60%] -right-32 w-96 h-96 bg-[#F05A28]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
        {/* ── 1. HERO STATEMENT SECTION ───────────────────────────── */}
        <section className="text-center max-w-4xl mx-auto pt-6 pb-12 sm:pb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs mb-6 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F05A28] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F05A28]"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Khảo Thí Tiếng Nhật FPT JPD113 & JPD123 • Tiện Ích AI 2.0
            </span>
            <span className="text-[11px] font-semibold text-[#F05A28] bg-orange-50 px-2 py-0.5 rounded-md">
              HOT
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
            Luyện Thi Tiếng Nhật{' '}
            <span className="bg-gradient-to-r from-[#F05A28] via-[#EA580C] to-amber-500 bg-clip-text text-transparent">
              Giám Thị AI 1-1
            </span>{' '}
            & Công Cụ Sáng Tạo Số
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Phòng thi nói tiếng Nhật FPT JPD113 & JPD123 mô phỏng 100 điểm với AI chấm phát âm siêu tốc, kết hợp studio lồng khung ảnh EXIF nghệ thuật và tiện ích AI miễn phí.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10">
            <button
              onClick={() => navigate('/courses/jpd123/speaking?tab=mock')}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#F05A28] to-[#EA580C] text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              <Mic size={18} />
              <span>Thi thử nói JPD123 1-1 ngay</span>
              <ArrowRight size={16} />
            </button>

            <a
              href="#jpd-showcase"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-slate-700 font-semibold text-sm sm:text-base border border-slate-200/90 shadow-xs hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-200 cursor-pointer"
            >
              <GraduationCap size={18} className="text-[#F05A28]" />
              <span>Cổng 2 Môn JPD113 & JPD123</span>
            </a>

            <a
              href="#bento-tools"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/70 text-slate-600 font-semibold text-sm sm:text-base border border-slate-200/80 hover:bg-white hover:text-slate-900 transition-all duration-200 cursor-pointer"
            >
              <Sliders size={16} />
              <span>Công cụ sáng tạo AI</span>
            </a>
          </div>

          {/* Trust Metrics Pill Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
              <span>Chuẩn format Khảo thí FPT University</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={16} className="text-[#F05A28] flex-shrink-0" />
              <span>AI chấm phát âm 4 tiêu chí dưới 1 giây</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-blue-500 flex-shrink-0" />
              <span>Flashcard 3D & 630 từ vựng N5 miễn phí</span>
            </div>
          </div>
        </section>


        {/* ── 2. JPD113 & JPD123 JAPANESE LEARNING AI SHOWCASE (AUTOMATED) ── */}
        <section id="jpd-showcase" className="pt-4 pb-20 scroll-mt-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#F05A28] text-xs font-bold uppercase tracking-wider mb-2 border border-orange-200/60">
              <GraduationCap size={15} />
              <span>Cổng Khảo Thí Tiếng Nhật Đại Học FPT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
              Luyện Thi Nói 1-1 AI & Chinh Phục Điểm FE JPD113 - JPD123
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
              Quan sát trực quan mô phỏng bài thi nói 1-1 thực tế: Giám thị AI đặt câu hỏi, phân tích âm vị học tiếng Nhật theo thời gian thực và xuất phiếu điểm chuẩn FPT.
            </p>

            {/* Course Selector Tabs */}
            <div className="inline-flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl mt-6 shadow-inner">
              <button
                type="button"
                onClick={() => setJpdCourse('jpd123')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  jpdCourse === 'jpd123'
                    ? 'bg-[#F05A28] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap size={16} />
                <span>Môn JPD123 (Kỳ 2 • Minna 4-7)</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${jpdCourse === 'jpd123' ? 'bg-white/20 text-white' : 'bg-orange-100 text-[#F05A28]'}`}>
                  NÂNG CAO
                </span>
              </button>

              <button
                type="button"
                onClick={() => setJpdCourse('jpd113')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  jpdCourse === 'jpd113'
                    ? 'bg-[#1E293B] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen size={16} />
                <span>Môn JPD113 (Kỳ 1 • Minna 1-3)</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${jpdCourse === 'jpd113' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
                  NỀN TẢNG
                </span>
              </button>
            </div>
          </div>

          {/* Bento JPD Presentation Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT: FLAGSHIP 1-1 AI SPEAKING EXAM SIMULATOR (7 COLS) ── */}
            <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all flex flex-col justify-between">
              <div>
                {/* Header bar of Simulator */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F05A28] flex items-center justify-center font-bold">
                      <Mic size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {activeCourseData.mockTitle}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Live Demo AI
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {activeCourseData.level} • Khảo Thí 100 Điểm
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/courses/${jpdCourse}/speaking?tab=mock`)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <span>Vào phòng thi thật</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* Step Flow Selector Bar */}
                <div className="grid grid-cols-4 gap-1.5 mb-5 bg-slate-100/90 p-1 rounded-xl text-center">
                  {[
                    { title: '1. Chào hỏi', score: '10đ' },
                    { title: '2. Đọc Đề A', score: '45đ' },
                    { title: '3. Vấn đáp B', score: '45đ' },
                    { title: '4. Phiếu điểm', score: '100đ' }
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setExamCycleStep(idx)}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        examCycleStep === idx
                          ? 'bg-white text-[#F05A28] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>{s.title}</span>
                      <span className="hidden sm:inline text-[10px] text-slate-400 ml-1">({s.score})</span>
                    </button>
                  ))}
                </div>

                {/* Simulated Conversation Box */}
                <div className="rounded-2xl bg-slate-950 text-white p-5 sm:p-6 shadow-inner border border-slate-800 relative overflow-hidden min-h-[260px] flex flex-col justify-between">
                  {/* Subtle Background Mesh Glow */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#F05A28]/15 rounded-full blur-2xl pointer-events-none" />

                  {/* ── STEP 0: Sensei Question (Giám thị hỏi) ── */}
                  {examCycleStep === 0 && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-1.5 font-bold text-orange-400">
                          <UserCheck size={14} />
                          {activeCourseData.sensei}
                        </span>
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">
                          Phần 3: Vấn đáp phản xạ (45đ)
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="text-lg sm:text-xl font-bold text-white font-japanese tracking-wide leading-relaxed">
                          {activeCourseData.questionJp}
                        </div>
                        <p className="text-xs text-slate-400 mt-2 italic">
                          Dịch nghĩa: {activeCourseData.questionVi}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <div className="flex items-center gap-1 text-emerald-400 font-mono">
                          <Headphones size={13} />
                          <span>TTS Audio 100% bản xứ</span>
                        </div>
                        <span>•</span>
                        <span>Đang chuyển sang thí sinh trả lời...</span>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 1: Student Speaking & Audio Waveform ── */}
                  {examCycleStep === 1 && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-1.5 font-bold text-red-400">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          Thí sinh đang trả lời qua Micro (Live REC)
                        </span>
                        <span className="font-mono text-red-400 font-bold">00:04s / 15s</span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900 border border-red-900/40">
                        <div className="text-base sm:text-lg font-bold text-white font-japanese">
                          {activeCourseData.studentJp}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 italic">
                          Dịch nghĩa: {activeCourseData.studentVi}
                        </p>
                      </div>

                      {/* Live Audio Visualizer Bars */}
                      <div className="flex items-center justify-between h-9 px-2 py-1.5 bg-slate-900/80 rounded-xl gap-1">
                        {[40, 70, 95, 60, 30, 85, 100, 75, 45, 90, 80, 50, 70, 90, 40, 85].map((val, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-[#F05A28] to-red-400 rounded-full transition-all duration-150"
                            style={{ height: `${Math.min(100, Math.max(20, (val + (waveSeed * 9 + i * 11) % 40)))}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── STEP 2: Realtime Phonetic Tokens Matching ── */}
                  {examCycleStep === 2 && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-1.5 font-bold text-orange-400">
                          <Sparkles size={14} />
                          Whisper AI • Phân tích ngữ âm tiếng Nhật
                        </span>
                        <span className="text-emerald-400 font-bold font-mono">Độ chính xác: 98%</span>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          So khớp từng từ vựng & âm tiết (Moras):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {activeCourseData.tokens.map((token, i) => (
                            <div
                              key={i}
                              className="px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 font-japanese text-sm font-bold flex items-center gap-1.5 shadow-xs"
                            >
                              <span>{token.word}</span>
                              <span className="text-[10px] font-mono font-normal text-emerald-400 bg-emerald-900/80 px-1 py-0.2 rounded">
                                {token.conf}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900/90 rounded-xl text-xs text-slate-300 flex items-center justify-between border border-slate-800">
                        <span>Tốc độ đọc: <strong className="text-white">3.6 mora/s</strong> (Chuẩn tự nhiên)</span>
                        <span className="text-emerald-400 font-bold">✓ Không ngập ngừng</span>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 3: FPT Scorecard Summary ── */}
                  {examCycleStep === 3 && (
                    <div className="space-y-3.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-1.5 font-bold text-amber-400">
                          <Award size={15} />
                          Phiếu Điểm Khảo Thí FPT University
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-slate-950">
                          {activeCourseData.scores.result}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div>
                          <span className="text-xs text-slate-400">Tổng điểm bài thi nói:</span>
                          <div className="text-2xl sm:text-3xl font-black text-[#F05A28]">
                            {activeCourseData.scores.total} <span className="text-sm font-normal text-slate-400">/ 100 điểm</span>
                          </div>
                        </div>

                        <div className="text-right space-y-0.5 text-xs">
                          <div className="text-slate-300">Nội dung: <strong className="text-white">{activeCourseData.scores.content}</strong></div>
                          <div className="text-slate-300">Phát âm: <strong className="text-white">{activeCourseData.scores.pron}</strong></div>
                          <div className="text-slate-300">Tác phong: <strong className="text-white">{activeCourseData.scores.manner}</strong></div>
                        </div>
                      </div>

                      <p className="text-xs text-emerald-400 font-medium italic">
                        ✓ Nhận xét AI: Phát âm chuẩn xác, phản xạ nhanh dưới 2 giây và chào hỏi đúng tác phong chuẩn FPT.
                      </p>
                    </div>
                  )}

                  {/* Simulator Automation Progress Bar */}
                  <div className="pt-2">
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#F05A28] to-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${((examCycleStep + 1) / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Links & Stats */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span><strong>{activeCourseData.vocabCount}</strong> Từ vựng</span>
                  <span><strong>{activeCourseData.kanjiCount}</strong> Hán tự</span>
                  <span><strong>{activeCourseData.grammarCount}</strong> Ngữ pháp</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/courses/${jpdCourse}/speaking?tab=mock`)}
                  className="font-bold text-[#F05A28] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Bắt đầu thi thử 1-1</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>


            {/* ── RIGHT: 3 COMPLEMENTARY JPD CARDS (5 COLS) ── */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* ── CARD 1: Automated 3D Kanji Flashcard ── */}
              <TiltCard
                onClick={() => navigate(`/courses/${jpdCourse}/kanji`)}
                className="group rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-rose-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold">
                      <BookOpen size={13} />
                      <span>Hán Tự Flashcard 3D</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Tự động lật 3s
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors flex items-center gap-1">
                    {activeCourseData.kanjiCount} Chữ Hán Cốt Lõi {activeCourseData.code}
                    <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-rose-600 transition-all" />
                  </h3>
                </div>

                {/* 3D Kanji Visual Showcase */}
                <div className="my-3 p-4 rounded-2xl bg-gradient-to-br from-rose-50/60 to-orange-50/40 border border-rose-100 flex items-center justify-between gap-4">
                  {/* The Big Kanji character */}
                  <div className="w-20 h-20 rounded-2xl bg-white border border-rose-200 flex items-center justify-center font-japanese font-black text-4xl text-rose-600 shadow-md transform transition-transform duration-500 group-hover:scale-105">
                    {activeKanji.kanji}
                  </div>

                  {/* Animated details */}
                  <div className="flex-1 space-y-1 text-left">
                    <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[11px]">
                        Hán Việt: {activeKanji.hanviet}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      On: <span className="font-japanese font-bold text-slate-800">{activeKanji.onyomi}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Kun: <span className="font-japanese font-bold text-slate-800">{activeKanji.kunyomi}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-1">
                      Ví dụ: <strong>{activeKanji.example}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Có phát âm giọng đọc bản xứ</span>
                  <span className="font-bold text-rose-600 group-hover:underline flex items-center gap-1">
                    Luyện Hán tự <ArrowRight size={13} />
                  </span>
                </div>
              </TiltCard>

              {/* ── CARD 2: Vocabulary & Quiz Bank ── */}
              <TiltCard
                onClick={() => navigate(`/courses/${jpdCourse}/vocabulary`)}
                className="group rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#F05A28] text-xs font-bold">
                      <BookMarked size={13} />
                      <span>Từ Vựng Chuẩn Minna</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {activeCourseData.vocabCount} Từ
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#F05A28] transition-colors flex items-center gap-1">
                    Smart Quiz &amp; Furigana Tra Cứu
                    <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-[#F05A28] transition-all" />
                  </h3>
                </div>

                {/* Vocabulary Chips Preview */}
                <div className="my-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Chế độ học: Flashcard • Quiz 4 lựa chọn</span>
                    <span className="text-[10px] text-orange-600 font-bold bg-orange-100/60 px-1.5 py-0.5 rounded">Furigana ON</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['家族 (Gia đình)', '勉強 (Học tập)', '写真 (Bức ảnh)', '友達 (Bạn bè)'].map((word, i) => (
                      <span key={i} className="text-xs font-japanese px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs font-semibold">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Học theo từng bài nhỏ Minna</span>
                  <span className="font-bold text-[#F05A28] group-hover:underline flex items-center gap-1">
                    Học từ vựng ngay <ArrowRight size={13} />
                  </span>
                </div>
              </TiltCard>

              {/* ── CARD 3: Final Exam (FE) 60-Min Mock Test ── */}
              <TiltCard
                onClick={() => navigate(`/courses/${jpdCourse}/exam`)}
                className="group rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                      <Award size={13} />
                      <span>Đề Thi Final Exam (FE)</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      60 Phút
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                    Bộ Đề Khảo Thí FPT Có Lời Giải
                    <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-700 transition-all" />
                  </h3>
                </div>

                <div className="my-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-emerald-950">
                    <span>Trắc nghiệm Từ vựng, Ngữ pháp &amp; Đọc hiểu</span>
                    <span className="text-emerald-700">73+ Câu</span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Mô phỏng đồng hồ đếm ngược 60 phút như thi EOS/Khảo thí thật, kèm giải thích chi tiết từng đáp án sai.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Chấm điểm tức thì</span>
                  <span className="font-bold text-emerald-700 group-hover:underline flex items-center gap-1">
                    Làm đề thi thử <ArrowRight size={13} />
                  </span>
                </div>
              </TiltCard>

            </div>
          </div>

          {/* Bottom 4 Navigation Modules Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              {
                title: 'Hán Tự & Flashcard',
                desc: 'Học chữ Hán, bộ thủ, âm Hán Việt',
                icon: BookOpen,
                href: `/courses/${jpdCourse}/kanji`,
                color: 'text-rose-600 bg-rose-50'
              },
              {
                title: 'Từ Vựng Chuẩn FPT',
                desc: 'Tra cứu & luyện trắc nghiệm nhớ lâu',
                icon: BookMarked,
                href: `/courses/${jpdCourse}/vocabulary`,
                color: 'text-[#F05A28] bg-orange-50'
              },
              {
                title: 'Ngữ Pháp Minna',
                desc: 'Công thức mẫu câu & ví dụ thực tế',
                icon: Layers,
                href: `/courses/${jpdCourse}/grammar`,
                color: 'text-indigo-600 bg-indigo-50'
              },
              {
                title: 'Cẩm Nang Cứu Cánh',
                desc: 'Mẹo phòng thi & câu hỏi khó trả lời',
                icon: ShieldCheck,
                href: `/courses/${jpdCourse}/speaking?tab=survival`,
                color: 'text-blue-600 bg-blue-50'
              }
            ].map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(mod.href)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${mod.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#F05A28] transition-colors truncate">
                      {mod.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {mod.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* ── 3. CREATIVE 3D BENTO GRID SECTION ──────────────────── */}
        <section id="bento-tools" className="pt-4 pb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#F05A28] mb-2">
              <Sparkles size={14} />
              <span>Visual Bento Showcase</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Công Cụ Sáng Tạo Trực Quan Đa Năng
            </h2>
            <p className="text-slate-500 text-sm mt-1.5">
              Di chuột để cảm nhận chiều sâu 3D và quan sát tính năng hoạt động tự động
            </p>
          </div>

          {/* Bento Matrix Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── BOX 1: Photo Frame Studio (Hero Bento - Spans 2 Cols) ── */}
            <TiltCard
              onClick={() => navigate('/photo-frame')}
              className="lg:col-span-2 group rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-[#F05A28]/40 overflow-hidden flex flex-col justify-between min-h-[420px]"
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-4 mb-6 z-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-2.5">
                    <Frame size={14} />
                    <span>Photo Frame Studio</span>
                    <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">HOT</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#F05A28] transition-colors flex items-center gap-2">
                    Lồng Khung EXIF Nghệ Thuật
                    <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 group-hover:text-[#F05A28] transition-all" />
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-md">
                    Tự động đọc thông số máy ảnh (Leica, Sony, Canon...), tạo khung viền nghệ thuật phong cách nhiếp ảnh gia chuyên nghiệp.
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-600">
                  <span>Auto Scanner</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              {/* Interactive Visual Canvas: Before / After Automated Comparison */}
              <div className="relative w-full h-[230px] sm:h-[260px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner group/preview">
                {/* Background Image: Raw Shot (Left) */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')`,
                    filter: 'contrast(0.95) brightness(0.9)',
                  }}
                >
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-white tracking-wide">
                    Ảnh gốc chưa lồng khung
                  </div>
                </div>

                {/* Foreground Image: Framed with Leica EXIF Badge (Clipped by scannerPos) */}
                <div
                  className="absolute inset-0 overflow-hidden transition-all duration-75"
                  style={{ clipPath: `polygon(${scannerPos}% 0%, 100% 0%, 100% 100%, ${scannerPos}% 100%)` }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')`,
                      filter: 'contrast(1.08) saturate(1.15)',
                    }}
                  />
                  {/* Leica EXIF Bottom Frame Bar */}
                  <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-t border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#E51837] flex items-center justify-center text-[10px] font-black text-white shadow-xs">
                        L
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-900 tracking-wider font-mono">LEICA M11</div>
                        <div className="text-[9px] font-semibold text-slate-500">APO-SUMMICRON-M 35mm f/2</div>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[10px] text-slate-700 font-bold">
                      <div>35mm • f/2.0 • 1/1000s</div>
                      <div className="text-slate-400 font-normal">ISO 64 • 2026.09.16</div>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-[#F05A28] px-2.5 py-1 rounded-lg text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                    <Sparkles size={11} />
                    <span>Khung EXIF Pro</span>
                  </div>
                </div>

                {/* Laser Scanner Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#F05A28] to-transparent shadow-[0_0_12px_#F05A28] pointer-events-none z-20"
                  style={{ left: `${scannerPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#F05A28] text-white flex items-center justify-center shadow-lg text-[10px]">
                    ↔
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action Tag */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                  Hỗ trợ 100+ mẫu khung ảnh Leica, Sony, Fujifilm, Polaroid
                </span>
                <span className="font-bold text-[#F05A28] group-hover:underline flex items-center gap-1">
                  Mở công cụ <ArrowRight size={13} />
                </span>
              </div>
            </TiltCard>

            {/* ── BOX 2: YouTube Summarizer (1 Col) ── */}
            <TiltCard
              onClick={() => navigate('/summarizer')}
              className="group rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-red-400/40 overflow-hidden flex flex-col justify-between min-h-[420px]"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold mb-2.5">
                  <Youtube size={14} />
                  <span>YouTube Summarizer</span>
                  <span className="bg-red-600 text-white text-[10px] px-1.5 rounded-full font-bold">AI</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors flex items-center gap-1.5">
                  Tóm Tắt Video Siêu Tốc
                  <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 group-hover:text-red-600 transition-all" />
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Dán link video YouTube, AI phân tích và cô đọng nội dung chính xác chỉ sau vài giây.
                </p>
              </div>

              {/* Visual Demo: Simulated Input & Audio Waveform + Bullets */}
              <div className="my-4 p-4 rounded-2xl bg-slate-900 text-white shadow-inner border border-slate-800 flex flex-col gap-3">
                {/* Fake URL Bar */}
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl text-xs font-mono text-slate-300 border border-slate-700/60">
                  <span className="text-red-400 font-bold">YT:</span>
                  <span className="truncate text-slate-300">youtube.com/watch?v=ai-mastery...</span>
                </div>

                {/* Animated Audio Waveform */}
                <div className="flex items-center justify-between h-8 px-1 py-1 gap-1">
                  {[45, 80, 30, 95, 60, 40, 85, 70, 50, 90, 65, 35, 75, 55, 90, 40].map((h, idx) => {
                    const dynamicHeight = Math.min(100, Math.max(20, (h + (waveSeed * 7 + idx * 13) % 40)));
                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-red-600 to-orange-400 rounded-full transition-all duration-200"
                        style={{ height: `${dynamicHeight}%` }}
                      />
                    );
                  })}
                </div>

                {/* Generated Summary Bullets */}
                <div className="space-y-1.5 text-[11px] text-slate-300 pt-1">
                  <div className="flex items-start gap-1.5 bg-slate-800/50 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-amber-400 font-bold">⚡ 01:20</span>
                    <span className="text-slate-200">Bản chất của các mô hình LLM tiên tiến</span>
                  </div>
                  <div className="flex items-start gap-1.5 bg-slate-800/50 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-bold">💡 05:45</span>
                    <span className="text-slate-200">5 ứng dụng thực tiễn nâng 300% hiệu suất</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Tiết kiệm 90% thời gian
                </span>
                <span className="font-bold text-red-600 group-hover:underline flex items-center gap-1">
                  Dùng thử <ArrowRight size={13} />
                </span>
              </div>
            </TiltCard>

            {/* ── BOX 3: AI Xử Lý Ảnh & Tách Nền (1 Col) ── */}
            <TiltCard
              onClick={() => navigate('/ai-image')}
              className="group rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-orange-400/40 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#F05A28] text-xs font-bold mb-2.5">
                  <Wand2 size={14} />
                  <span>AI Xử Lý Ảnh</span>
                  <span className="bg-[#F05A28] text-white text-[10px] px-1.5 rounded-full font-bold">PRO</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#F05A28] transition-colors flex items-center gap-1.5">
                  Tách Nền &amp; Caption AI
                  <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 group-hover:text-[#F05A28] transition-all" />
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tự động xóa phông nền siêu mượt và tạo caption, hashtag bắt trend chỉ với 1 click.
                </p>
              </div>

              {/* Visual: Transparent Cutout Simulation */}
              <div className="my-4 relative h-36 rounded-2xl overflow-hidden border border-slate-200 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:12px_12px] flex items-center justify-center">
                {/* Floating Cutout Object Badge */}
                <div className="relative z-10 p-3 rounded-xl bg-white/90 backdrop-blur-md shadow-md border border-white flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-[#F05A28] to-amber-400 flex items-center justify-center text-white shadow-sm">
                    <Wand2 size={22} className="animate-spin-slow" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Tách nền sạch 100%
                    </span>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">Auto Background Removal</div>
                  </div>
                </div>

                {/* AI Laser beam line animation */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#F05A28] to-transparent shadow-[0_0_8px_#F05A28] animate-bounce" style={{ top: '35%' }} />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Không cần đăng nhập</span>
                <span className="font-bold text-[#F05A28] group-hover:underline flex items-center gap-1">
                  Trải nghiệm <ArrowRight size={13} />
                </span>
              </div>
            </TiltCard>

            {/* ── BOX 4: Nén Ảnh Siêu Tốc (1 Col) ── */}
            <TiltCard
              onClick={() => navigate('/compress')}
              className="group rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-amber-400/40 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold mb-2.5">
                  <Zap size={14} />
                  <span>Nén Ảnh Online</span>
                  <span className="bg-amber-600 text-white text-[10px] px-1.5 rounded-full font-bold">-90%</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors flex items-center gap-1.5">
                  Nén Ảnh Chuẩn HD
                  <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all" />
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Giảm dung lượng ảnh tối đa tới 90% nhưng vẫn giữ trọn vẹn 100% độ sắc nét nguyên bản.
                </p>
              </div>

              {/* Visual: Compression Meter */}
              <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/30 border border-amber-200/60 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">Dung lượng tối ưu:</span>
                  <span className="text-xs font-mono font-extrabold text-amber-600 bg-amber-100/70 px-2 py-0.5 rounded-md">
                    -{compressPercent}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-[#F05A28] rounded-full transition-all duration-700"
                    style={{ width: `${compressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2">
                  <span>Gốc: 12.4 MB</span>
                  <span className="font-bold text-emerald-600">Còn: 1.18 MB</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Hỗ trợ JPG, PNG, WebP</span>
                <span className="font-bold text-amber-600 group-hover:underline flex items-center gap-1">
                  Nén ngay <ArrowRight size={13} />
                </span>
              </div>
            </TiltCard>

            {/* ── BOX 5: Cổng OTP & 2FA Live (1 Col) ── */}
            <TiltCard
              onClick={() => navigate('/get-otp')}
              className="group rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-emerald-400/40 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2.5">
                  <KeyRound size={14} />
                  <span>Cổng OTP &amp; 2FA Live</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  Lấy Mã 2FA Tức Thì
                  <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Hỗ trợ lấy mã xác thực 2FA ChatGPT, Gemini và tài khoản số thời gian thực không độ trễ.
                </p>
              </div>

              {/* Visual: Interactive Live OTP simulation */}
              <div className="my-4 p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Mã hoạt động
                  </span>
                  <span className="text-[11px] font-mono text-orange-400 font-bold bg-orange-950/60 px-2 py-0.5 rounded border border-orange-900/50">
                    {otpTimer}s
                  </span>
                </div>

                {/* 6 Digit display */}
                <div className="flex items-center justify-between gap-1 my-2">
                  {otpCode.split('').map((char, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-9 rounded-lg bg-slate-800/90 border border-orange-500/30 flex items-center justify-center font-mono font-extrabold text-base text-white shadow-xs"
                    >
                      {char}
                    </div>
                  ))}
                </div>

                {/* Copy demo button */}
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className={`w-full mt-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    otpCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-[#F05A28] to-[#EA580C] text-white hover:brightness-110'
                  }`}
                >
                  {otpCopied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{otpCopied ? 'Đã sao chép!' : 'Sao chép mã thử'}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Tự làm mới mỗi 30s</span>
                <span className="font-bold text-emerald-600 group-hover:underline flex items-center gap-1">
                  Vào cổng live <ArrowRight size={13} />
                </span>
              </div>
            </TiltCard>

          </div>
        </section>


        {/* ── 4. HOW IT WORKS: 3 SIMPLE STEPS ─────────────────────── */}
        <section className="py-16 border-t border-slate-200/80">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28]">
              Trải Nghiệm Mượt Mà
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Bắt Đầu Trong 3 Bước Đơn Giản
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Chọn Tiện Ích Hoặc Môn Học',
                desc: 'Lựa chọn tính năng bạn cần: Thi nói tiếng Nhật 1-1 AI, Hán tự 3D, lồng khung ảnh EXIF hay tóm tắt video.'
              },
              {
                step: '02',
                title: 'Tương Tác Trực Tiếp',
                desc: 'Nói trực tiếp qua Micro để AI chấm ngữ âm hoặc tải bức ảnh yêu thích cần xử lý lên hệ thống.'
              },
              {
                step: '03',
                title: 'Nhận Kết Quả Ngay',
                desc: 'Hệ thống tự động chấm điểm và trả về thành phẩm sắc nét, đẹp mắt chỉ sau 1 đến 3 giây.'
              }
            ].map((step, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F05A28] to-amber-500 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-orange-500/20 mb-4">
                  {step.step}
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. FINAL HIGH-IMPACT CTA BANNER ─────────────────────── */}
        <section className="mt-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#1E293B] text-white p-8 sm:p-12 relative overflow-hidden shadow-xl">
          {/* Subtle Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F05A28]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-300 text-xs font-bold mb-4 backdrop-blur-md">
              <Sparkles size={14} />
              <span>Học tập &amp; Sáng tạo không giới hạn cùng KeyT</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
              Sẵn Sàng Bứt Phá Điểm Số &amp; Tác Phẩm Của Bạn?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
              Trải nghiệm phòng thi nói 1-1 Giám thị AI JPD123 chuẩn khảo thí FPT và toàn bộ bộ công cụ tiện ích sáng tạo hoàn toàn miễn phí.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/courses/jpd123/speaking?tab=mock')}
                className="px-8 py-3.5 rounded-full bg-[#F05A28] text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/30 hover:bg-[#EA580C] hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
              >
                <Mic size={18} />
                <span>Thi thử JPD123 ngay</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <GraduationCap size={18} />
                <span>Cổng 2 Môn Tiếng Nhật</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Scoped CSS Styles for Keyframes ───────────────────────── */}
      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 12s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
