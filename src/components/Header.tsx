import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  ShoppingBag,
  LayoutDashboard,
  Sparkles,
  Youtube,
  ShieldCheck,
  Wand2,
  Frame,
  Zap,
  KeyRound,
  GraduationCap,
  Languages,
  Mic,
  Award,
  BookOpen,
  BookMarked,
  Layers,
  ArrowRight,
  Search,
  Flame,
  Video,
  type LucideIcon
} from 'lucide-react';
import { useAuthContext } from '../context/useAuthContext';
import logo from '../assets/logo.png';
import './Header.css';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchValue: string;
}

interface SubMenuItem {
  title: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  badge?: string;
}

export default function Header({ onSearch, searchValue }: HeaderProps) {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.header-nav-item') && !target.closest('.header-user-menu-wrapper')) {
        setActiveDropdown(null);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close menus on browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setIsMobileMenuOpen(false);
      setActiveDropdown(null);
      setUserMenuOpen(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleMouseEnter = (menuKey: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(menuKey);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dropdown data definitions
  const aiTools: SubMenuItem[] = [
    {
      title: 'AI Dịch & Lồng Tiếng Video',
      desc: 'Tự động tải, dịch ngữ cảnh, lồng tiếng & đóng sub 24/7',
      href: '/video-translate',
      icon: Video,
      iconBg: 'bg-purple-50 text-purple-600',
      iconColor: '#7C3AED',
      badge: 'NEW'
    },
    {
      title: 'YouTube Summarizer',
      desc: 'Tóm tắt nội dung video YouTube bằng AI siêu tốc',
      href: '/summarizer',
      icon: Youtube,
      iconBg: 'bg-red-50 text-red-600',
      iconColor: '#DC2626'
    },
    {
      title: 'Evidence Checker',
      desc: 'Phân tích & kiểm tra bằng chứng giao dịch thông minh',
      href: '/evidence',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
      iconColor: '#059669'
    },
    {
      title: 'AI Xử Lý Ảnh',
      desc: 'Viết caption AI, gợi ý khung ảnh & tách nền tự động',
      href: '/ai-image',
      icon: Wand2,
      iconBg: 'bg-orange-50 text-[#F05A28]',
      iconColor: '#F05A28',
      badge: 'HOT'
    }
  ];

  const photoTools: SubMenuItem[] = [
    {
      title: 'Tạo Khung Ảnh',
      desc: 'Ghép khung ảnh EXIF nghệ thuật chuyên nghiệp miễn phí',
      href: '/photo-frame',
      icon: Frame,
      iconBg: 'bg-blue-50 text-blue-600',
      iconColor: '#2563EB'
    },
    {
      title: 'Nén Ảnh Online',
      desc: 'Giảm dung lượng ảnh tới 90% không giảm chất lượng',
      href: '/compress',
      icon: Zap,
      iconBg: 'bg-amber-50 text-amber-600',
      iconColor: '#D97706'
    }
  ];

  const jpd113Tools: SubMenuItem[] = [
    {
      title: 'Môn JPD113 (Tổng Quan)',
      desc: 'N5 Khởi Động: Minna Bài 1 đến Bài 3',
      href: '/courses/jpd113',
      icon: GraduationCap,
      iconBg: 'bg-blue-50 text-blue-600',
      iconColor: '#2563EB',
      badge: 'MÔN 1'
    },
    {
      title: 'Hán Tự JPD113',
      desc: '35 chữ Hán cơ bản đầu tiên & Flashcard 3D',
      href: '/courses/jpd113/kanji',
      icon: BookOpen,
      iconBg: 'bg-rose-50 text-rose-600',
      iconColor: '#E11D48'
    },
    {
      title: 'Từ Vựng JPD113',
      desc: '379 từ vựng nền tảng (9 bài học nhỏ)',
      href: '/courses/jpd113/vocabulary',
      icon: BookMarked,
      iconBg: 'bg-orange-50 text-[#F05A28]',
      iconColor: '#F05A28'
    },
    {
      title: 'Ngữ Pháp JPD113',
      desc: '21 mẫu câu sơ cấp cốt lõi & bài tập củng cố',
      href: '/courses/jpd113/grammar',
      icon: Layers,
      iconBg: 'bg-indigo-50 text-indigo-600',
      iconColor: '#4F46E5'
    },
    {
      title: 'Thi Nói 1-1 JPD113',
      desc: 'Giả lập phòng thi Giám thị AI FPT (Đề A & B)',
      href: '/courses/jpd113/speaking',
      icon: Mic,
      iconBg: 'bg-purple-50 text-purple-600',
      iconColor: '#7C3AED',
      badge: 'HOT'
    },
    {
      title: 'Đề Thi FE JPD113',
      desc: 'Đề thi trắc nghiệm Final Exam 60 phút có giải thích',
      href: '/courses/jpd113/exam',
      icon: Award,
      iconBg: 'bg-emerald-50 text-emerald-600',
      iconColor: '#059669',
      badge: 'FE'
    }
  ];

  const kanaTools: SubMenuItem[] = [
    {
      title: 'Kana Quiz (Tofugu)',
      desc: 'Tùy chọn hàng chữ & gõ Romaji phản xạ',
      href: '/courses/jpd113/kana',
      icon: Sparkles,
      iconBg: 'bg-emerald-50 text-emerald-600',
      iconColor: '#059669',
      badge: 'TOFUGU'
    },
    {
      title: 'Luyện Chữ Hiragana',
      desc: '46 chữ mềm cơ bản, biến âm & âm ghép',
      href: '/courses/jpd113/kana/hiragana',
      icon: BookOpen,
      iconBg: 'bg-teal-50 text-teal-600',
      iconColor: '#0D9488',
      badge: '46 CHỮ'
    },
    {
      title: 'Luyện Chữ Katakana',
      desc: '46 chữ cứng & âm ngoại lai mở rộng',
      href: '/courses/jpd113/kana/katakana',
      icon: Zap,
      iconBg: 'bg-cyan-50 text-cyan-600',
      iconColor: '#0891B2',
      badge: 'CỰC HAY'
    },
    {
      title: 'Thử Thách Cả Hai',
      desc: 'Trộn ngẫu nhiên Hiragana + Katakana',
      href: '/courses/jpd113/kana/both',
      icon: Award,
      iconBg: 'bg-amber-50 text-amber-600',
      iconColor: '#D97706',
      badge: 'HOT'
    },
    {
      title: 'Biến Âm & Âm Đục',
      desc: 'Luyện biến âm Dakuon & Handakuon',
      href: '/courses/jpd113/kana/hiragana',
      icon: Layers,
      iconBg: 'bg-emerald-50 text-emerald-600',
      iconColor: '#059669'
    },
    {
      title: 'Âm Ngoại Lai (Extended)',
      desc: 'Từ mượn tiếng nước ngoài trong Katakana',
      href: '/courses/jpd113/kana/katakana',
      icon: BookMarked,
      iconBg: 'bg-teal-50 text-teal-600',
      iconColor: '#0D9488'
    }
  ];

  const jpd123Tools: SubMenuItem[] = [
    {
      title: 'Môn JPD123 (Tổng Quan)',
      desc: 'N5 Nâng Cao: Minna Bài 4 đến Bài 7',
      href: '/courses/jpd123',
      icon: GraduationCap,
      iconBg: 'bg-orange-50 text-[#F05A28]',
      iconColor: '#F05A28',
      badge: 'MÔN 2'
    },
    {
      title: 'Hán Tự JPD123',
      desc: '42 chữ Hán nâng cao N5 & Flashcard 3D',
      href: '/courses/jpd123/kanji',
      icon: BookOpen,
      iconBg: 'bg-rose-50 text-rose-600',
      iconColor: '#E11D48'
    },
    {
      title: 'Từ Vựng JPD123',
      desc: '251 từ vựng chuyên sâu (12 bài học)',
      href: '/courses/jpd123/vocabulary',
      icon: BookMarked,
      iconBg: 'bg-orange-50 text-[#F05A28]',
      iconColor: '#F05A28'
    },
    {
      title: 'Ngữ Pháp JPD123',
      desc: '23 mẫu câu thì quá khứ, tính từ, so sánh',
      href: '/courses/jpd123/grammar',
      icon: Layers,
      iconBg: 'bg-indigo-50 text-indigo-600',
      iconColor: '#4F46E5'
    },
    {
      title: 'Thi Nói 1-1 JPD123',
      desc: 'Giả lập phòng thi Giám thị AI FPT chuyên sâu',
      href: '/courses/jpd123/speaking',
      icon: Mic,
      iconBg: 'bg-purple-50 text-purple-600',
      iconColor: '#7C3AED',
      badge: 'HOT'
    },
    {
      title: 'Đề Thi FE JPD123',
      desc: '73 câu trắc nghiệm thi thật 60 phút',
      href: '/courses/jpd123/exam',
      icon: Award,
      iconBg: 'bg-emerald-50 text-emerald-600',
      iconColor: '#059669',
      badge: 'FE'
    }
  ];


  const isAiActive = aiTools.some((t) => location.pathname === t.href);
  const isPhotoActive = photoTools.some((t) => location.pathname === t.href);
  const isOtpActive =
    location.pathname === '/get-otp' ||
    location.pathname === '/get-otp-gemini' ||
    location.pathname === '/2falive';
  const isJapaneseActive =
    location.pathname.startsWith('/courses/jpd') ||
    location.pathname.startsWith('/courses/kana') ||
    kanaTools.some((item) => location.pathname === item.href);
  const isChineseActive = /^\/courses\/hsk[12](?:\/|$)/i.test(location.pathname);
  const isEnglishActive = /^\/courses\/(eng1000|engbk|engbk2|toeic120|toeichackers)(?:\/|$)/i.test(location.pathname);

  return (
    <div className="header-wrapper">
      <header className={`modern-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          {/* Left: Mobile Menu Toggle & Brand Logo Lockup */}
          <div className="header-left">
            <button
              type="button"
              className="mobile-toggle-btn cursor-pointer"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Mở menu điều hướng"
            >
              <Menu size={20} />
            </button>

            <Link to="/" className="brand-logo-link cursor-pointer" aria-label="Tiệm Tạp Hóa KeyT - Trang chủ">
              <div className="brand-logo-avatar">
                <img src={logo} alt="taphoaKeyT" className="header-logo-img" />
              </div>
              <div className="brand-logo-wordmark">
                <div className="brand-logo-title-row">
                  <span className="brand-logo-name">Key<span className="brand-logo-highlight">T</span></span>
                  <span className="brand-logo-pro-tag">HUB</span>
                </div>
                <span className="brand-logo-tagline">AI &amp; Foreign Languages</span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Bar (Argon Glass Capsule) */}
          <nav className="desktop-navigation" aria-label="Điều hướng chính">
            <ul className="header-nav-list">
              {/* 1. Trang chủ */}
              <li className="header-nav-item">
                <Link
                  to="/"
                  className={`header-nav-link cursor-pointer ${location.pathname === '/' ? 'active' : ''}`}
                >
                  <span>Trang chủ</span>
                </Link>
              </li>

              {/* 2. Công cụ AI Dropdown */}
              <li
                className="header-nav-item dropdown-trigger"
                onMouseEnter={() => handleMouseEnter('ai')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`header-nav-link dropdown-btn cursor-pointer ${isAiActive ? 'active' : ''} ${activeDropdown === 'ai' ? 'is-open' : ''}`}
                  aria-expanded={activeDropdown === 'ai'}
                  onClick={() => setActiveDropdown(activeDropdown === 'ai' ? null : 'ai')}
                >
                  <Sparkles size={14} className="nav-icon-highlight nav-icon-animate" />
                  <span>Công cụ AI</span>
                  <ChevronDown
                    size={13}
                    className={`dropdown-chevron ${activeDropdown === 'ai' ? 'open' : ''}`}
                  />
                </button>

                {activeDropdown === 'ai' && (
                  <div className="modern-dropdown-menu">
                    <div className="dropdown-menu-header">
                      <span className="dropdown-menu-tag">Trí tuệ nhân tạo</span>
                      <span className="dropdown-menu-subtitle">Bộ công cụ thông minh cho học tập &amp; làm việc</span>
                    </div>
                    <div className="dropdown-items-grid">
                      {aiTools.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={`dropdown-card-item cursor-pointer ${location.pathname === item.href ? 'item-active' : ''}`}
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="dropdown-item-icon" style={{ color: item.iconColor }}>
                              <Icon size={18} />
                            </div>
                            <div className="dropdown-item-content">
                              <div className="flex items-center gap-1.5">
                                <span className="dropdown-item-title">{item.title}</span>
                                {item.badge && <span className="dropdown-item-badge">{item.badge}</span>}
                              </div>
                              <span className="dropdown-item-desc">{item.desc}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>

              {/* 3. Tiện ích Ảnh Dropdown */}
              <li
                className="header-nav-item dropdown-trigger"
                onMouseEnter={() => handleMouseEnter('photo')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`header-nav-link dropdown-btn cursor-pointer ${isPhotoActive ? 'active' : ''} ${activeDropdown === 'photo' ? 'is-open' : ''}`}
                  aria-expanded={activeDropdown === 'photo'}
                  onClick={() => setActiveDropdown(activeDropdown === 'photo' ? null : 'photo')}
                >
                  <span>Tiện ích Ảnh</span>
                  <ChevronDown
                    size={13}
                    className={`dropdown-chevron ${activeDropdown === 'photo' ? 'open' : ''}`}
                  />
                </button>

                {activeDropdown === 'photo' && (
                  <div className="modern-dropdown-menu">
                    <div className="dropdown-menu-header">
                      <span className="dropdown-menu-tag">Hình ảnh &amp; Media</span>
                      <span className="dropdown-menu-subtitle">Xử lý, nén và tạo khung ảnh chuyên nghiệp</span>
                    </div>
                    <div className="dropdown-items-grid">
                      {photoTools.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={`dropdown-card-item cursor-pointer ${location.pathname === item.href ? 'item-active' : ''}`}
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="dropdown-item-icon" style={{ color: item.iconColor }}>
                              <Icon size={18} />
                            </div>
                            <div className="dropdown-item-content">
                              <div className="flex items-center gap-1.5">
                                <span className="dropdown-item-title">{item.title}</span>
                              </div>
                              <span className="dropdown-item-desc">{item.desc}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>

              {/* 4. Unified Get OTP & 2FA Button */}
              <li className="header-nav-item">
                <Link
                  to="/get-otp"
                  className={`otp-nav-pill cursor-pointer ${isOtpActive ? 'active' : ''}`}
                >
                  <KeyRound size={14} className="otp-key-icon" />
                  <span>Get OTP &amp; 2FA</span>
                  <span className="otp-live-badge">
                    <span className="otp-live-dot" />
                    LIVE
                  </span>
                </Link>
              </li>

              {/* 5. Tiếng Nhật Dropdown (Mega Menu Centered) */}
              <li
                className="header-nav-item dropdown-trigger mega-dropdown-item"
                onMouseEnter={() => handleMouseEnter('japanese')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`header-nav-link dropdown-btn cursor-pointer ${
                    isJapaneseActive ? 'active' : ''
                  } ${activeDropdown === 'japanese' ? 'is-open' : ''}`}
                  aria-expanded={activeDropdown === 'japanese'}
                  aria-controls="japanese-course-menu"
                  onClick={() => setActiveDropdown(activeDropdown === 'japanese' ? null : 'japanese')}
                >
                  <GraduationCap size={14} className="nav-icon-highlight nav-icon-animate" />
                  <span>Tiếng Nhật</span>
                  <span className="nav-count-badge">2 Môn</span>
                  <ChevronDown
                    size={13}
                    className={`dropdown-chevron ${activeDropdown === 'japanese' ? 'open' : ''}`}
                  />
                </button>

                {activeDropdown === 'japanese' && (
                  <div className="modern-dropdown-menu-wide" id="japanese-course-menu">
                    <div className="grid grid-cols-3 gap-3.5">
                      {/* Column 1: JPD113 */}
                      <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-100/80">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-600" />
                              <span className="text-xs font-black text-blue-900 uppercase">Môn JPD113 (Bài 1 - 3)</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Kỳ 1</span>
                          </div>
                          <div className="space-y-1">
                            {jpd113Tools.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.href}
                                  to={item.href}
                                  className={`dropdown-card-item cursor-pointer ${location.pathname === item.href ? 'item-active' : ''}`}
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <div className="dropdown-item-icon" style={{ color: item.iconColor }}>
                                    <Icon size={16} />
                                  </div>
                                  <div className="dropdown-item-content">
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span className="dropdown-item-title">{item.title}</span>
                                      {item.badge && <span className="dropdown-item-badge">{item.badge}</span>}
                                    </div>
                                    <span className="dropdown-item-desc">{item.desc}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Bảng Chữ Cái Kana (Ở Giữa) */}
                      <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-100/80">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-xs font-black text-emerald-950 uppercase">Bảng Chữ Cái Kana</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Nhập Môn</span>
                          </div>
                          <div className="space-y-1">
                            {kanaTools.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.title + item.href}
                                  to={item.href}
                                  className={`dropdown-card-item cursor-pointer ${location.pathname === item.href ? 'item-active' : ''}`}
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <div className="dropdown-item-icon" style={{ color: item.iconColor }}>
                                    <Icon size={16} />
                                  </div>
                                  <div className="dropdown-item-content">
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span className="dropdown-item-title">{item.title}</span>
                                      {item.badge && <span className="dropdown-item-badge">{item.badge}</span>}
                                    </div>
                                    <span className="dropdown-item-desc">{item.desc}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Column 3: JPD123 */}
                      <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-orange-100/80">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#F05A28]" />
                              <span className="text-xs font-black text-orange-950 uppercase">Môn JPD123 (Bài 4 - 7)</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#F05A28]">Kỳ 2</span>
                          </div>
                          <div className="space-y-1">
                            {jpd123Tools.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.href}
                                  to={item.href}
                                  className={`dropdown-card-item cursor-pointer ${location.pathname === item.href ? 'item-active' : ''}`}
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <div className="dropdown-item-icon" style={{ color: item.iconColor }}>
                                    <Icon size={16} />
                                  </div>
                                  <div className="dropdown-item-content">
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span className="dropdown-item-title">{item.title}</span>
                                      {item.badge && <span className="dropdown-item-badge">{item.badge}</span>}
                                    </div>
                                    <span className="dropdown-item-desc">{item.desc}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-2">
                      <span>JPD113 &amp; JPD123 • Lộ trình tiếng Nhật từ cơ bản đến N5</span>
                      <div className="flex items-center gap-4">
                        <Link
                          to="/courses"
                          onClick={() => setActiveDropdown(null)}
                          className="font-bold text-slate-600 hover:text-[#F05A28] hover:underline cursor-pointer"
                        >
                          Tất cả khóa học
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </li>

              {/* 6. Tiếng Trung Dropdown */}
              <li
                className="header-nav-item dropdown-trigger"
                onMouseEnter={() => handleMouseEnter('chinese')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`header-nav-link dropdown-btn cursor-pointer ${
                    isChineseActive ? 'active' : ''
                  } ${activeDropdown === 'chinese' ? 'is-open' : ''}`}
                  aria-expanded={activeDropdown === 'chinese'}
                  aria-controls="chinese-course-menu"
                  onClick={() => setActiveDropdown(activeDropdown === 'chinese' ? null : 'chinese')}
                >
                  <Languages size={14} className="nav-icon-highlight nav-icon-animate" />
                  <span>Tiếng Trung</span>
                  <span className="nav-count-badge">2 Khóa</span>
                  <ChevronDown
                    size={13}
                    className={`dropdown-chevron ${activeDropdown === 'chinese' ? 'open' : ''}`}
                  />
                </button>

                {activeDropdown === 'chinese' && (
                  <div className="modern-dropdown-menu chinese-dropdown" id="chinese-course-menu">
                    <div className="chinese-dropdown-heading">
                      <div className="chinese-dropdown-icon">
                        <Languages size={20} />
                      </div>
                      <div>
                        <span className="chinese-dropdown-eyebrow">TIẾNG TRUNG SƠ CẤP</span>
                        <h3>HSK1 • HSK2</h3>
                        <p>Học từ vựng tiếng Trung theo từng cấp độ</p>
                      </div>
                    </div>

                    <div className="chinese-dropdown-stats" aria-label="Nội dung khóa học HSK1 và HSK2">
                      <div>
                        <strong>22</strong>
                        <span>chủ đề</span>
                      </div>
                      <div>
                        <strong>290</strong>
                        <span>mục từ</span>
                      </div>
                      <div>
                        <strong>HSK1–2</strong>
                        <span>cấp độ</span>
                      </div>
                    </div>

                    <nav className="chinese-dropdown-courses" aria-label="Chọn cấp độ tiếng Trung">
                      <Link
                        to="/courses/hsk1/vocabulary"
                        className="chinese-dropdown-cta cursor-pointer"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className="chinese-dropdown-cta-main">
                          <span className="chinese-dropdown-cta-icon"><BookMarked size={17} /></span>
                          <span className="chinese-dropdown-cta-label">
                            <strong>Học từ vựng HSK1</strong>
                            <span>150 từ vựng</span>
                          </span>
                        </span>
                        <ArrowRight size={17} className="chinese-dropdown-cta-arrow" />
                      </Link>
                      <Link
                        to="/courses/hsk2/vocabulary"
                        className="chinese-dropdown-cta cursor-pointer"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className="chinese-dropdown-cta-main">
                          <span className="chinese-dropdown-cta-icon"><BookMarked size={17} /></span>
                          <span className="chinese-dropdown-cta-label">
                            <strong>Học từ vựng HSK2</strong>
                            <span>140 từ vựng</span>
                          </span>
                        </span>
                        <ArrowRight size={17} className="chinese-dropdown-cta-arrow" />
                      </Link>
                    </nav>
                    <p className="chinese-dropdown-note">Flashcard, luyện gõ, trắc nghiệm và nghe thụ động</p>
                  </div>
                )}
              </li>

              {/* 7. Tiếng Anh Dropdown */}
              <li
                className="header-nav-item dropdown-trigger"
                onMouseEnter={() => handleMouseEnter('english')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`header-nav-link dropdown-btn cursor-pointer ${isEnglishActive ? 'active' : ''} ${activeDropdown === 'english' ? 'is-open' : ''}`}
                  aria-expanded={activeDropdown === 'english'}
                  aria-controls="english-course-menu"
                  onClick={() => setActiveDropdown(activeDropdown === 'english' ? null : 'english')}
                >
                  <BookOpen size={14} className="nav-icon-highlight nav-icon-animate" />
                  <span>Tiếng Anh</span>
                  <span className="nav-count-badge">5 Khóa</span>
                  <ChevronDown
                    size={13}
                    className={`dropdown-chevron ${activeDropdown === 'english' ? 'open' : ''}`}
                  />
                </button>

                {activeDropdown === 'english' && (
                  <div className="modern-dropdown-menu chinese-dropdown" id="english-course-menu">
                    <div className="chinese-dropdown-heading">
                      <div className="chinese-dropdown-icon"><BookOpen size={20} /></div>
                      <div>
                        <span className="chinese-dropdown-eyebrow">TIẾNG ANH GIAO TIẾP, TOEIC &amp; HỌC THUẬT</span>
                        <h3>Hackers TOEIC • Bá Khí 1 &amp; 2 • 1.000 từ</h3>
                        <p>30 Day Hackers TOEIC, Từ Vựng Bá Khí 1 &amp; 2 (24 Quiz), 1.000 từ &amp; 120 cụm từ</p>
                      </div>
                    </div>

                    <div className="chinese-dropdown-stats" aria-label="Nội dung khóa học từ vựng tiếng Anh">
                      <div><strong>110</strong><span>chủ đề / Quiz</span></div>
                      <div><strong>8.406</strong><span>từ &amp; cụm từ</span></div>
                      <div><strong>5 Khóa</strong><span>TOEIC &amp; Quiz</span></div>
                    </div>

                    <nav className="chinese-dropdown-courses" aria-label="Chọn khóa học tiếng Anh">
                      <Link
                        to="/courses/toeichackers/vocabulary"
                        className="chinese-dropdown-cta cursor-pointer"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className="chinese-dropdown-cta-main">
                          <span className="chinese-dropdown-cta-icon text-[#F05A28]"><Flame size={17} /></span>
                          <span className="chinese-dropdown-cta-label">
                            <span className="flex items-center gap-1.5">
                              <strong>Hackers TOEIC (Day 1 – 30)</strong>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-orange-100 text-[#F05A28] uppercase">HOT</span>
                            </span>
                            <span>4.768 từ vựng • 30 Day chuẩn ngữ cảnh</span>
                          </span>
                        </span>
                        <ArrowRight size={17} className="chinese-dropdown-cta-arrow" />
                      </Link>
                      <Link
                        to="/courses/engbk/vocabulary"
                        className="chinese-dropdown-cta cursor-pointer"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className="chinese-dropdown-cta-main">
                          <span className="chinese-dropdown-cta-icon text-indigo-600"><Award size={17} /></span>
                          <span className="chinese-dropdown-cta-label">
                            <span className="flex items-center gap-1.5">
                              <strong>Từ Vựng Tiếng Anh Bá Khí 1</strong>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 uppercase">12 Quiz</span>
                            </span>
                            <span>1.017 từ &amp; cụm từ • 12 Quiz theo bài đọc</span>
                          </span>
                        </span>
                        <ArrowRight size={17} className="chinese-dropdown-cta-arrow" />
                      </Link>
                      <Link
                        to="/courses/engbk2/vocabulary"
                        className="chinese-dropdown-cta cursor-pointer"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className="chinese-dropdown-cta-main">
                          <span className="chinese-dropdown-cta-icon text-purple-600"><Award size={17} /></span>
                          <span className="chinese-dropdown-cta-label">
                            <span className="flex items-center gap-1.5">
                              <strong>Từ Vựng Bá Khí 2 (Có IPA)</strong>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 uppercase">MỚI • 12 Quiz</span>
                            </span>
                            <span>1.457 từ mới • 12 Quiz bài đọc có phiên âm</span>
                          </span>
                        </span>
                        <ArrowRight size={17} className="chinese-dropdown-cta-arrow" />
                      </Link>
                      <Link
                        to="/courses/toeic120/vocabulary"
                        className="chinese-dropdown-cta cursor-pointer"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className="chinese-dropdown-cta-main">
                          <span className="chinese-dropdown-cta-icon"><Sparkles size={17} /></span>
                          <span className="chinese-dropdown-cta-label">
                            <span className="flex items-center gap-1.5">
                              <strong>120 thành ngữ &amp; cụm từ TOEIC</strong>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-600 uppercase">Quiz</span>
                            </span>
                            <span>120 cụm từ • 6 bài Quiz (Trang 516–521)</span>
                          </span>
                        </span>
                        <ArrowRight size={17} className="chinese-dropdown-cta-arrow" />
                      </Link>
                      <Link
                        to="/courses/eng1000/vocabulary"
                        className="chinese-dropdown-cta cursor-pointer"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className="chinese-dropdown-cta-main">
                          <span className="chinese-dropdown-cta-icon"><BookMarked size={17} /></span>
                          <span className="chinese-dropdown-cta-label">
                            <strong>Học 1.000 từ tiếng Anh</strong>
                            <span>1.044 mục từ • 50 chủ đề</span>
                          </span>
                        </span>
                        <ArrowRight size={17} className="chinese-dropdown-cta-arrow" />
                      </Link>
                    </nav>
                    <p className="chinese-dropdown-note">Flashcard 3D, luyện gõ, trắc nghiệm phản xạ và nghe phát âm bản xứ</p>
                  </div>
                )}
              </li>
            </ul>
          </nav>

          {/* Right: User Profile & Actions */}
          <div className="header-right">
            {user ? (
              <div className="header-user-menu-wrapper">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`user-profile-trigger cursor-pointer ${userMenuOpen ? 'is-open' : ''}`}
                  aria-expanded={userMenuOpen}
                  title="Tài khoản"
                >
                  <div className="user-avatar-circle">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="user-name-label hidden sm:inline">
                    {user.username || 'User'}
                  </span>
                  <ChevronDown size={14} className={`dropdown-chevron ${userMenuOpen ? 'open' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="user-popover-menu">
                    <div className="user-popover-header">
                      <span className="user-popover-greeting">Tài khoản</span>
                      <span className="user-popover-name">{user.username || user.email}</span>
                    </div>

                    <div className="user-popover-links">
                      {user.admin && (
                        <Link
                          to="/admin/dashboard"
                          className="user-popover-link admin-highlight cursor-pointer"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard size={16} />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="user-popover-link cursor-pointer"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} />
                        <span>Trang cá nhân</span>
                      </Link>

                      <Link
                        to={user.admin ? '/admin/orders' : '/orders'}
                        className="user-popover-link cursor-pointer"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ShoppingBag size={16} />
                        <span>Đơn hàng của tôi</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="user-popover-link logout-btn cursor-pointer"
                      >
                        <LogOut size={16} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons-group">
                <Link to="/login" className="header-login-btn cursor-pointer">
                  Đăng nhập
                </Link>
                <Link to="/register" className="header-register-btn cursor-pointer">
                  <span>Đăng ký</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`mobile-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`} aria-label="Menu di động">
        <div className="mobile-drawer-header">
          <Link
            to="/"
            className="brand-logo-link cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="brand-logo-avatar">
              <img src={logo} alt="taphoaKeyT" className="header-logo-img" />
            </div>
            <div className="brand-logo-wordmark">
              <div className="brand-logo-title-row">
                <span className="brand-logo-name">Key<span className="brand-logo-highlight">T</span></span>
                <span className="brand-logo-pro-tag">HUB</span>
              </div>
              <span className="brand-logo-tagline">AI &amp; Foreign Languages</span>
            </div>
          </Link>
          <button
            type="button"
            className="mobile-close-btn cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Search */}
        <div className="mobile-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            aria-label="Tìm kiếm sản phẩm, dịch vụ"
            placeholder="Tìm kiếm sản phẩm, dịch vụ..."
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="mobile-drawer-content">
          {/* Main Links */}
          <Link
            to="/"
            className={`mobile-menu-link cursor-pointer ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Trang chủ
          </Link>

          {/* Group: Công cụ AI */}
          <div className="mobile-group-title">Công cụ AI</div>
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                to={tool.href}
                className={`mobile-sub-link ${location.pathname === tool.href ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={16} style={{ color: tool.iconColor }} />
                <span>{tool.title}</span>
                {tool.badge && <span className="mobile-badge">{tool.badge}</span>}
              </Link>
            );
          })}

          {/* Group: Tiện ích Ảnh */}
          <div className="mobile-group-title">Tiện ích Hình ảnh</div>
          {photoTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                to={tool.href}
                className={`mobile-sub-link ${location.pathname === tool.href ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={16} style={{ color: tool.iconColor }} />
                <span>{tool.title}</span>
              </Link>
            );
          })}

          {/* Group: Xác thực OTP */}
          <div className="mobile-group-title">Xác thực & Mã bảo mật</div>
          <Link
            to="/get-otp"
            className={`mobile-otp-btn ${isOtpActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <KeyRound size={16} />
            <span>Get OTP & 2FA Code</span>
          </Link>

          {/* Group: Tiếng Nhật */}
          <div className="mobile-group-title flex items-center justify-between">
            <span>Tiếng Nhật</span>
            <Link
              to="/courses"
              className="text-[11px] font-bold text-[#F05A28] lowercase cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              xem tất cả →
            </Link>
          </div>

          {/* Sub-group JPD113 */}
          <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50/80 rounded-lg mb-1 flex items-center justify-between">
            <span>Môn JPD113 (Bài 1 - 3)</span>
            <span className="text-[10px] font-normal lowercase">kỳ 1</span>
          </div>
          {jpd113Tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                to={tool.href}
                className={`mobile-sub-link ${location.pathname === tool.href ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={16} style={{ color: tool.iconColor }} />
                <span>{tool.title}</span>
                {tool.badge && <span className="mobile-badge">{tool.badge}</span>}
              </Link>
            );
          })}

          {/* Sub-group Bảng Chữ Cái Kana */}
          <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50/80 rounded-lg mt-3 mb-1 flex items-center justify-between">
            <span>Bảng Chữ Cái Kana (Nhập Môn)</span>
            <span className="text-[10px] font-normal lowercase">tofugu</span>
          </div>
          {kanaTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title + tool.href}
                to={tool.href}
                className={`mobile-sub-link ${location.pathname === tool.href ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={16} style={{ color: tool.iconColor }} />
                <span>{tool.title}</span>
                {tool.badge && <span className="mobile-badge">{tool.badge}</span>}
              </Link>
            );
          })}

          {/* Sub-group JPD123 */}
          <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#F05A28] bg-orange-50/80 rounded-lg mt-3 mb-1 flex items-center justify-between">
            <span>Môn JPD123 (Bài 4 - 7)</span>
            <span className="text-[10px] font-normal lowercase">kỳ 2</span>
          </div>
          {jpd123Tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                to={tool.href}
                className={`mobile-sub-link ${location.pathname === tool.href ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={16} style={{ color: tool.iconColor }} />
                <span>{tool.title}</span>
                {tool.badge && <span className="mobile-badge">{tool.badge}</span>}
              </Link>
            );
          })}

          <div className="mobile-group-title flex items-center justify-between">
            <span>Tiếng Trung</span>
            <Link
              to="/courses/hsk1/vocabulary"
              className="text-[11px] font-bold text-[#F05A28] lowercase cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              vào HSK1 →
            </Link>
          </div>
          <Link
            to="/courses/hsk1/vocabulary"
            className={`mobile-sub-link ${location.pathname.startsWith('/courses/hsk1') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <BookMarked size={16} className="text-[#F05A28]" />
            <span>Từ vựng HSK1</span>
            <span className="mobile-badge">150 từ</span>
          </Link>
          <Link
            to="/courses/hsk2/vocabulary"
            className={`mobile-sub-link ${location.pathname.startsWith('/courses/hsk2') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <BookMarked size={16} className="text-[#F05A28]" />
            <span>Từ vựng HSK2</span>
            <span className="mobile-badge">140 từ</span>
          </Link>

          <div className="mobile-group-title flex items-center justify-between">
            <span>Tiếng Anh</span>
            <Link
              to="/courses"
              className="text-[11px] font-bold text-[#F05A28] lowercase cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              tất cả khóa →
            </Link>
          </div>
          <Link
            to="/courses/toeichackers/vocabulary"
            className={`mobile-sub-link ${location.pathname.startsWith('/courses/toeichackers') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Flame size={16} className="text-[#F05A28]" />
            <span>Hackers TOEIC (Day 1–30)</span>
            <span className="mobile-badge bg-orange-100 text-[#F05A28] font-bold">4.768 từ</span>
          </Link>
          <Link
            to="/courses/engbk/vocabulary"
            className={`mobile-sub-link ${location.pathname.startsWith('/courses/engbk/') || location.pathname === '/courses/engbk' ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Award size={16} className="text-indigo-600" />
            <span>Từ Vựng Tiếng Anh Bá Khí 1</span>
            <span className="mobile-badge bg-indigo-100 text-indigo-700 font-bold">12 Quiz</span>
          </Link>
          <Link
            to="/courses/engbk2/vocabulary"
            className={`mobile-sub-link ${location.pathname.startsWith('/courses/engbk2') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Award size={16} className="text-purple-600" />
            <span>Từ Vựng Bá Khí 2 (IPA)</span>
            <span className="mobile-badge bg-purple-100 text-purple-700 font-bold">1.457 từ</span>
          </Link>
          <Link
            to="/courses/toeic120/vocabulary"
            className={`mobile-sub-link ${location.pathname.startsWith('/courses/toeic120') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Sparkles size={16} className="text-[#F05A28]" />
            <span>120 thành ngữ TOEIC</span>
            <span className="mobile-badge">6 Quiz</span>
          </Link>
          <Link
            to="/courses/eng1000/vocabulary"
            className={`mobile-sub-link ${location.pathname.startsWith('/courses/eng1000') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <BookOpen size={16} className="text-[#F05A28]" />
            <span>1.000 từ tiếng Anh</span>
            <span className="mobile-badge">1.044 từ</span>
          </Link>

          {/* Divider */}
          <div className="my-4 border-t border-slate-200" />

          {/* User Section in Drawer */}
          {user ? (
            <div className="mobile-user-section">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Tài khoản: {user.username}
              </div>
              {user.admin && (
                <Link
                  to="/admin/dashboard"
                  className="mobile-sub-link text-[#F05A28] font-bold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={16} />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <Link
                to="/profile"
                className="mobile-sub-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={16} />
                <span>Trang cá nhân</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="mobile-sub-link text-rose-600 w-full text-left cursor-pointer"
              >
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 mt-2">
              <Link
                to="/login"
                className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-slate-100 text-slate-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-[#F05A28] text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Đăng ký tài khoản
              </Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
