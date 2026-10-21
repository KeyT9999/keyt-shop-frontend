import { Link } from 'react-router-dom';
import {
  GraduationCap,
  KeyRound,
  Frame,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  BookOpen,
  Languages,
  Wand2,
  Zap,
  Youtube
} from 'lucide-react';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800/90 relative overflow-hidden font-sans">
      {/* Subtle Ambient Glows */}
      <div className="pointer-events-none absolute -top-28 left-1/4 w-96 h-96 rounded-full bg-[#F05A28]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* Column 1 (4 Cols): Brand Identity */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-white/10 p-1.5 border border-white/15 flex items-center justify-center group-hover:border-[#F05A28]/60 transition-colors">
                <img src={logo} alt="KeyT Hub" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">
                    Key<span className="text-[#F05A28]">T</span>
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-[#F05A28] text-white">
                    HUB
                  </span>
                </div>
                <span className="block text-[11px] font-medium text-slate-400">
                  AI &amp; Foreign Languages Ecosystem
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Hệ sinh thái học ngoại ngữ tương tác AI (<strong className="text-slate-200">Nhật • Trung • Anh</strong>), cổng lấy mã xác thực <strong className="text-slate-200">OTP &amp; 2FA Live 30s</strong> cùng bộ công cụ nhiếp ảnh <strong className="text-slate-200">Khung EXIF 4K &amp; Xử lý ảnh AI</strong> miễn phí.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Hệ thống trực tuyến 24/7
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-semibold">
                <Sparkles size={12} className="text-[#F05A28]" />
                6.800+ Mục từ vựng
              </span>
            </div>
          </div>

          {/* Column 2 (3 Cols): Multi-Language Academy */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <GraduationCap size={14} className="text-[#F05A28]" />
              <span>Học Viện Ngoại Ngữ</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  to="/courses/jpd113"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px] font-black">
                    JPD113
                  </span>
                  <span>Tiếng Nhật Sơ Cấp 1 (Bài 1–3)</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/courses/jpd123"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="px-1.5 py-0.2 rounded bg-[#F05A28]/20 text-orange-300 text-[10px] font-black">
                    JPD123
                  </span>
                  <span>Tiếng Nhật Sơ Cấp 2 (Bài 4–7)</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/courses/kana"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-black">
                    KANA
                  </span>
                  <span>Luyện Gõ Bảng Chữ Cái Tofugu</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/courses/hsk1/vocabulary"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Languages size={13} className="text-emerald-400 shrink-0" />
                  <span>Tiếng Trung HSK 1 &amp; HSK 2 (290 Từ)</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/courses/toeichackers/vocabulary"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen size={13} className="text-blue-400 shrink-0" />
                  <span>Hackers TOEIC &amp; 120 Idioms</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/courses/eng1000/vocabulary"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen size={13} className="text-sky-400 shrink-0" />
                  <span>1.000 Từ Tiếng Anh Thông Dụng</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 (3 Cols): OTP & Creative AI Tools */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <Frame size={14} className="text-[#F05A28]" />
              <span>Cổng OTP &amp; Studio Sáng Tạo</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  to="/get-otp"
                  className="text-slate-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <KeyRound size={13} className="text-emerald-400 shrink-0" />
                  <span>Lấy Mã OTP ChatGPT &amp; Gemini</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/2falive"
                  className="text-slate-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                  <span>Tạo Mã 2FA Live (TOTP 30s)</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/photo-frame"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Frame size={13} className="text-[#F05A28] shrink-0" />
                  <span>Tạo Khung Ảnh EXIF Nghệ Thuật</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-image"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Wand2 size={13} className="text-violet-400 shrink-0" />
                  <span>AI Xử Lý Ảnh &amp; Tách Nền 1 Chạm</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/compress"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Zap size={13} className="text-amber-400 shrink-0" />
                  <span>Nén Ảnh Online Chuẩn HD (-90%)</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/summarizer"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Youtube size={13} className="text-rose-400 shrink-0" />
                  <span>YouTube Summarizer &amp; Evidence AI</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 (2 Cols): Support & Policies */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#F05A28]" />
              <span>Hỗ Trợ &amp; Pháp Lý</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  to="/products"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Kho Dịch Vụ Số</span>
                  <ArrowUpRight size={12} />
                </Link>
              </li>
              <li>
                <Link
                  to="/purchase-guide"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Hướng dẫn sử dụng
                </Link>
              </li>
              <li>
                <Link
                  to="/warranty-refund"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Bảo hành &amp; Hoàn tiền
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Điều khoản dịch vụ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} <strong className="text-slate-300 font-bold">KeyT Hub (taphoakeyt.com)</strong>. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/courses" className="hover:text-slate-300 transition-colors cursor-pointer">
              Cổng Ngoại Ngữ
            </Link>
            <Link to="/get-otp" className="hover:text-slate-300 transition-colors cursor-pointer">
              Cổng OTP &amp; 2FA
            </Link>
            <Link to="/privacy-policy" className="hover:text-slate-300 transition-colors cursor-pointer">
              Bảo mật
            </Link>
            <Link to="/terms-of-service" className="hover:text-slate-300 transition-colors cursor-pointer">
              Điều khoản
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
