import { useNavigate } from 'react-router-dom';
import { Frame, PlayCircle, BadgeCheck, CheckCircle, Zap } from 'lucide-react';

// ─────────────────────────────────────────────
// Floating glass card (Hero right panel)
// ─────────────────────────────────────────────
interface FloatingCardProps {
    icon: React.ReactNode;
    label: string;
    animationDelay?: string;
}

function FloatingCard({ icon, label, animationDelay = '0s' }: FloatingCardProps) {
    return (
        <div
            className="w-44 h-28 flex flex-col justify-center items-center gap-2 rounded-2xl p-4"
            style={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.55)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                animation: `floatCard 4s ease-in-out infinite`,
                animationDelay,
            }}
        >
            {icon}
            <span className="text-xs font-semibold text-[#261812] text-center leading-tight">{label}</span>
        </div>
    );
}

// ─────────────────────────────────────────────
// Feature card (Features section)
// ─────────────────────────────────────────────
interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div
            className="bg-white rounded-2xl p-8 flex flex-col gap-4 cursor-default"
            style={{
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-8px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)';
            }}
        >
            <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(240,90,40,0.12)' }}
            >
                {icon}
            </div>
            <h3 className="text-xl font-bold text-[#261812]">{title}</h3>
            <p className="text-[#5a4136] text-[15px] leading-relaxed">{description}</p>
        </div>
    );
}

// ─────────────────────────────────────────────
// Step card (How It Works section)
// ─────────────────────────────────────────────
interface StepCardProps {
    number: number;
    title: string;
    description: string;
}

function StepCard({ number, title, description }: StepCardProps) {
    return (
        <div className="flex flex-col items-center text-center bg-[#fff8f6] z-10 px-4 py-2 max-w-[220px]">
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-2xl font-bold text-white"
                style={{
                    background: '#F05A28',
                    boxShadow: '0 8px 20px rgba(240,90,40,0.3)',
                }}
            >
                {number}
            </div>
            <h4 className="text-lg font-bold text-[#261812] mb-2">{title}</h4>
            <p className="text-[#5a4136] text-sm leading-relaxed">{description}</p>
        </div>
    );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function HomePage() {
    const navigate = useNavigate();

    return (
        <>
            {/* Keyframe animation for floating cards */}
            <style>{`
                @keyframes floatCard {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-12px); }
                }
            `}</style>

            <div className="min-h-screen font-sans" style={{ background: '#fff8f6', color: '#261812' }}>

                {/* ── HERO ───────────────────────────────────────────── */}
                <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 flex flex-col lg:flex-row items-center gap-12 min-h-[780px]">

                    {/* Left: copy */}
                    <div className="w-full lg:w-1/2 flex flex-col items-start gap-6">
                        <span
                            className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
                            style={{ background: 'rgba(240,90,40,0.1)', color: '#F05A28' }}
                        >
                            AI-Powered Tools
                        </span>

                        <h1
                            className="font-bold leading-tight"
                            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#261812' }}
                        >
                            Bộ công cụ AI giúp bạn{' '}
                            <span style={{ color: '#F05A28' }}>sáng tạo</span>, tóm tắt và kiểm chứng thông tin
                        </h1>

                        <p className="text-lg leading-relaxed" style={{ color: '#5a4136', maxWidth: '520px' }}>
                            Tạo khung ảnh đẹp, tóm tắt video YouTube nhanh chóng và kiểm tra độ chính xác của thông tin chỉ trong vài giây với AI.
                        </p>

                        <div className="flex flex-wrap gap-4 mt-2">
                            <button
                                onClick={() => navigate('/photo-frame')}
                                className="text-white font-semibold text-sm py-4 px-8 rounded-full transition-all duration-200"
                                style={{
                                    background: '#F05A28',
                                    boxShadow: '0 4px 16px rgba(240,90,40,0.35)',
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(240,90,40,0.5)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(240,90,40,0.35)'; }}
                            >
                                Dùng thử miễn phí
                            </button>
                            <button
                                onClick={() => navigate('/summarizer')}
                                className="font-semibold text-sm py-4 px-8 rounded-full border-2 transition-all duration-200"
                                style={{ borderColor: '#F05A28', color: '#F05A28' }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLButtonElement).style.background = '#F05A28';
                                    (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                    (e.currentTarget as HTMLButtonElement).style.color = '#F05A28';
                                }}
                            >
                                Khám phá tính năng
                            </button>
                        </div>

                        {/* Trust badges */}
                        <div className="flex gap-6 mt-4 text-sm" style={{ color: '#8a6a5a' }}>
                            <span className="flex items-center gap-2">
                                <CheckCircle size={16} style={{ color: '#F05A28' }} />
                                Miễn phí hoàn toàn
                            </span>
                            <span className="flex items-center gap-2">
                                <Zap size={16} style={{ color: '#F05A28' }} />
                                Kết quả trong vài giây
                            </span>
                        </div>
                    </div>

                    {/* Right: floating cards */}
                    <div className="w-full lg:w-1/2 flex justify-center items-center">
                        <div
                            className="relative w-full h-[460px] max-w-[480px] rounded-3xl"
                            style={{
                                background: 'linear-gradient(135deg, #ffeae1 0%, #fff1eb 60%, #fff8f6 100%)',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
                            }}
                        >
                            {/* Decorative circle */}
                            <div
                                className="absolute inset-0 rounded-3xl"
                                style={{
                                    background: 'radial-gradient(circle at 60% 40%, rgba(240,90,40,0.08) 0%, transparent 65%)',
                                }}
                            />

                            {/* Manually positioned cards */}
                            <div className="absolute top-8 left-8">
                                <FloatingCard
                                    icon={<Frame size={28} style={{ color: '#F05A28' }} />}
                                    label="Photo Frame"
                                    animationDelay="0s"
                                />
                            </div>
                            <div className="absolute" style={{ top: '50%', right: '2rem', transform: 'translateY(-50%)' }}>
                                <FloatingCard
                                    icon={<PlayCircle size={28} style={{ color: '#F05A28' }} />}
                                    label="YouTube Summarizer"
                                    animationDelay="0.6s"
                                />
                            </div>
                            <div className="absolute bottom-8" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                                <FloatingCard
                                    icon={<BadgeCheck size={28} style={{ color: '#F05A28' }} />}
                                    label="Evidence Checker"
                                    animationDelay="1.2s"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FEATURES ────────────────────────────────────────── */}
                <section id="features" style={{ background: '#fff1eb' }} className="py-20">
                    <div className="max-w-7xl mx-auto px-6 md:px-10">
                        <div className="text-center mb-14">
                            <p
                                className="text-xs font-bold uppercase tracking-widest mb-3"
                                style={{ color: '#F05A28' }}
                            >
                                Tính năng
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#261812' }}>
                                Công cụ mạnh mẽ cho mọi nhu cầu
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FeatureCard
                                icon={<Frame size={26} style={{ color: '#F05A28' }} />}
                                title="Photo Frame"
                                description="Tạo khung ảnh đẹp, chuyên nghiệp và sáng tạo. Tự động nhận diện chủ thể và tối ưu hóa bố cục để tạo ra những bức ảnh ấn tượng chỉ với một cú click."
                            />
                            <FeatureCard
                                icon={<PlayCircle size={26} style={{ color: '#F05A28' }} />}
                                title="YouTube Summarizer"
                                description="Dán liên kết video YouTube và nhận bản tóm tắt nội dung chi tiết. Tiết kiệm thời gian xem video dài bằng cách nắm bắt các ý chính nhanh chóng."
                            />
                            <FeatureCard
                                icon={<BadgeCheck size={26} style={{ color: '#F05A28' }} />}
                                title="Evidence Checker"
                                description="Kiểm tra độ chính xác của thông tin bằng AI. Xác thực các tuyên bố, bài báo hoặc văn bản bằng cách đối chiếu với cơ sở dữ liệu đáng tin cậy."
                            />
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ────────────────────────────────────── */}
                <section id="how-it-works" className="py-20" style={{ background: '#fff8f6' }}>
                    <div className="max-w-7xl mx-auto px-6 md:px-10">
                        <div className="text-center mb-14">
                            <p
                                className="text-xs font-bold uppercase tracking-widest mb-3"
                                style={{ color: '#F05A28' }}
                            >
                                Quy trình
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#261812' }}>
                                Cách hoạt động
                            </h2>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-12 relative">
                            {/* Connector line - desktop only */}
                            <div
                                className="hidden md:block absolute h-0.5 -z-10"
                                style={{
                                    top: '2rem',
                                    left: '22%',
                                    right: '22%',
                                    background: '#e2bfb0',
                                }}
                            />

                            <StepCard
                                number={1}
                                title="Chọn công cụ"
                                description="Lựa chọn tính năng AI phù hợp với nhu cầu của bạn."
                            />
                            <StepCard
                                number={2}
                                title="Cung cấp dữ liệu"
                                description="Tải ảnh lên, dán link YouTube hoặc nhập văn bản cần kiểm tra."
                            />
                            <StepCard
                                number={3}
                                title="Nhận kết quả"
                                description="AI xử lý và trả về kết quả chính xác, đẹp mắt trong vài giây."
                            />
                        </div>
                    </div>
                </section>

                {/* ── CTA ─────────────────────────────────────────────── */}
                <section
                    className="py-20"
                    style={{ background: '#ffffff', borderTop: '1px solid #e2bfb0' }}
                >
                    <div className="max-w-7xl mx-auto px-6 md:px-10">
                        <div
                            className="max-w-3xl mx-auto flex flex-col items-center gap-8 text-center p-12 rounded-3xl"
                            style={{
                                background: 'linear-gradient(160deg, rgba(248,221,210,0.35) 0%, transparent 100%)',
                                border: '1px solid rgba(226,191,176,0.4)',
                            }}
                        >
                            <h2
                                className="font-bold leading-tight"
                                style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.8rem)', color: '#261812' }}
                            >
                                Bắt đầu sáng tạo và kiểm chứng thông tin{' '}
                                <span style={{ color: '#F05A28' }}>thông minh hơn</span> ngay hôm nay
                            </h2>
                            <p className="text-lg" style={{ color: '#5a4136', maxWidth: '480px' }}>
                                Miễn phí, không cần đăng ký. Bắt đầu ngay trong vài giây.
                            </p>
                            <button
                                onClick={() => navigate('/photo-frame')}
                                className="text-white font-semibold text-base py-4 px-10 rounded-full transition-all duration-200"
                                style={{
                                    background: '#F05A28',
                                    boxShadow: '0 4px 20px rgba(240,90,40,0.4)',
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(240,90,40,0.55)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(240,90,40,0.4)'; }}
                            >
                                Bắt đầu ngay →
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </>
    );
}
