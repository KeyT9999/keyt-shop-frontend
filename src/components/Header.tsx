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
  Mic,
  Award,
  BookOpen,
  BookMarked,
  Layers,
  ArrowRight,
  Search,
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setUserMenuOpen(false);
  }, [location.pathname]);

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
  const isJapaneseActive = location.pathname.startsWith('/courses');

  return (
    <div className="header-wrapper">
      <header className={`modern-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="header-left">
            <button
              type="button"
              className="mobile-toggle-btn cursor-pointer"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={22} />
            </button>

            <Link to="/" className="brand-logo-link cursor-pointer">
              <img src={logo} alt="taphoaKeyT" className="header-logo-img" />
            </Link>
          </div>

          {/* Center: Desktop Navigation Bar with generous spacing */}
          <nav className="desktop-navigation">
            <ul className="header-nav-list">
              {/* 1. Trang chủ */}
              <li className="header-nav-item">
                <Link
                  to="/"
                  className={`header-nav-link ${location.pathname === '/' ? 'active' : ''}`}
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
                  className={`header-nav-link dropdown-btn ${isAiActive ? 'active' : ''}`}
                  onClick={() => setActiveDropdown(activeDropdown === 'ai' ? null : 'ai')}
                >
                  <Sparkles size={15} className="nav-icon-highlight" />
                  <span>Công cụ AI</span>
                  <ChevronDown
                    size={14}
                    className={`dropdown-chevron ${activeDropdown === 'ai' ? 'open' : ''}`}
                  />
                </button>

                {activeDropdown === 'ai' && (
                  <div className="modern-dropdown-menu">
                    <div className="dropdown-menu-header">
                      <span className="dropdown-menu-tag">Trí tuệ nhân tạo</span>
                      <span className="dropdown-menu-subtitle">Bộ công cụ thông minh cho học tập & làm việc</span>
                    </div>
                    <div className="dropdown-items-grid">
                      {aiTools.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={`dropdown-card-item ${location.pathname === item.href ? 'item-active' : ''}`}
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
                  className={`header-nav-link dropdown-btn ${isPhotoActive ? 'active' : ''}`}
                  onClick={() => setActiveDropdown(activeDropdown === 'photo' ? null : 'photo')}
                >
                  <span>Tiện ích Ảnh</span>
                  <ChevronDown
                    size={14}
                    className={`dropdown-chevron ${activeDropdown === 'photo' ? 'open' : ''}`}
                  />
                </button>

                {activeDropdown === 'photo' && (
                  <div className="modern-dropdown-menu">
                    <div className="dropdown-menu-header">
                      <span className="dropdown-menu-tag">Hình ảnh & Media</span>
                      <span className="dropdown-menu-subtitle">Xử lý, nén và tạo khung ảnh chuyên nghiệp</span>
                    </div>
                    <div className="dropdown-items-grid">
                      {photoTools.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={`dropdown-card-item ${location.pathname === item.href ? 'item-active' : ''}`}
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
                  <KeyRound size={15} />
                  <span>Get OTP & 2FA</span>
                  <span className="otp-live-badge">Live</span>
                </Link>
              </li>

              {/* 5. Tiếng Nhật FPT Dropdown */}
              <li
                className="header-nav-item dropdown-trigger"
                onMouseEnter={() => handleMouseEnter('japanese')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`header-nav-link dropdown-btn flex items-center gap-1.5 cursor-pointer ${
                    isJapaneseActive ? 'active' : ''
                  }`}
                  onClick={() => setActiveDropdown(activeDropdown === 'japanese' ? null : 'japanese')}
                >
                  <GraduationCap size={15} className="text-[#F05A28]" />
                  <span>Tiếng Nhật FPT</span>
                  <span className="text-[10px] font-bold bg-[#F05A28]/10 text-[#F05A28] px-1.5 py-0.5 rounded-full border border-orange-200">
                    2 Môn
                  </span>
                  <ChevronDown
                    size={14}
                    className={`dropdown-chevron ${activeDropdown === 'japanese' ? 'open' : ''}`}
                  />
                </button>

                {activeDropdown === 'japanese' && (
                  <div className="modern-dropdown-menu-wide">
                    <div className="dropdown-menu-header flex flex-row items-center justify-between pb-3">
                      <div>
                        <span className="dropdown-menu-tag">Cổng Khảo Thí Tiếng Nhật Đại Học FPT</span>
                        <span className="dropdown-menu-subtitle">Chọn chính xác học phần bạn đang học (2 môn học độc lập)</span>
                      </div>
                      <Link
                        to="/courses"
                        onClick={() => setActiveDropdown(null)}
                        className="text-xs font-bold text-[#F05A28] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>Cổng 2 môn học</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {/* Column 1: JPD113 */}
                      <div className="p-3 bg-blue-50/40 rounded-2xl border border-blue-100">
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
                                className={`dropdown-card-item ${location.pathname === item.href ? 'item-active' : ''}`}
                                onClick={() => setActiveDropdown(null)}
                              >
                                <div className="dropdown-item-icon" style={{ color: item.iconColor }}>
                                  <Icon size={16} />
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

                      {/* Column 2: JPD123 */}
                      <div className="p-3 bg-orange-50/40 rounded-2xl border border-orange-100">
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
                                className={`dropdown-card-item ${location.pathname === item.href ? 'item-active' : ''}`}
                                onClick={() => setActiveDropdown(null)}
                              >
                                <div className="dropdown-item-icon" style={{ color: item.iconColor }}>
                                  <Icon size={16} />
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
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-2">
                      <span>JPD113 và JPD123 là 2 môn học độc lập theo chương trình Đại học FPT.</span>
                      <Link
                        to="/courses"
                        onClick={() => setActiveDropdown(null)}
                        className="font-bold text-[#F05A28] hover:underline cursor-pointer"
                      >
                        Vào cổng 2 môn học →
                      </Link>
                    </div>
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
                  className="user-profile-trigger cursor-pointer"
                  title="Tài khoản"
                >
                  <div className="user-avatar-circle">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="user-name-label hidden md:inline">
                    {user.username || 'User'}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
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
                          className="user-popover-link admin-highlight"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard size={16} />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="user-popover-link"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} />
                        <span>Trang cá nhân</span>
                      </Link>

                      <Link
                        to={user.admin ? '/admin/orders' : '/orders'}
                        className="user-popover-link"
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
                  Đăng ký
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

      <aside className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img src={logo} alt="taphoaKeyT" className="h-9 object-contain" />
          </Link>
          <button
            type="button"
            className="mobile-close-btn cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        {/* Mobile Search */}
        <div className="mobile-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, dịch vụ..."
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="mobile-drawer-content">
          {/* Main Links */}
          <Link
            to="/"
            className={`mobile-menu-link ${location.pathname === '/' ? 'active' : ''}`}
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

          {/* Group: Cổng 2 môn học */}
          <div className="mobile-group-title flex items-center justify-between">
            <span>Tiếng Nhật Đại Học FPT</span>
            <Link
              to="/courses"
              className="text-[11px] font-bold text-[#F05A28] lowercase"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              xem cả 2 môn →
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
