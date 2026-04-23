import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, Globe } from 'lucide-react'; // Added Globe
import { useCartContext } from '../context/useCartContext';
import { useAuthContext } from '../context/useAuthContext';
import { useWishlistContext } from '../context/useWishlistContext';
import { useAddToCartAnimation } from '../context/AddToCartAnimationContext';
import { useTranslation } from 'react-i18next'; // Added hook
import logo from '../assets/logo.png';
import './Header.css';

interface HeaderProps {
    onSearch: (query: string) => void;
    searchValue: string;
}

export default function Header({ onSearch, searchValue }: HeaderProps) {
    const { totalItems } = useCartContext();
    const { wishlist } = useWishlistContext();
    const { user, logout } = useAuthContext();
    const { i18n } = useTranslation(); // Init hook
    const { setCartIconRef } = useAddToCartAnimation();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const cartIconRef = useRef<HTMLAnchorElement>(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.nav-item')) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'vi' ? 'en' : 'vi';
        i18n.changeLanguage(newLang);
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Set cart icon ref for animation
    useEffect(() => {
        if (cartIconRef.current) {
            setCartIconRef(cartIconRef.current);
        }
    }, [setCartIconRef]);


    const navItems = useMemo(() => [
        { label: 'HOME', href: '/', hasDropdown: false },
        {
            label: 'STUDY',
            href: '#',
            hasDropdown: true,
            simpleDropdown: [
                { label: 'SUMMARIZER', href: '/summarizer', external: false },
                { label: 'EVIDENCE', href: '/evidence', external: false }
            ]
        },
        { label: 'PHOTO FRAME', href: '/photo-frame', hasDropdown: false },
        {
            label: 'TIP FREE',
            href: '#',
            hasDropdown: true,
            simpleDropdown: [
                { label: 'Khóa Học Capcut Quạ HD', href: 'https://drive.google.com/drive/folders/1qBVyGif2u7qChuQIvQmt51MwxGsuLojp?usp=drive_link', external: true },
                { label: 'Khóa Học Canva', href: 'https://drive.google.com/drive/folders/1clQOT7Zf99HjXOuqKZMZtLp_WNkGL5zq?usp=drive_link', external: true },
                { label: 'Khóa Học TOEIC PREP', href: 'https://drive.google.com/drive/folders/1NTQPZU-TbubeIWsd0_zfeshvvwDC22p_?usp=sharing', external: true },
                { label: 'Chỉnh sửa ảnh camera raw từ A đến Z', href: 'https://drive.google.com/drive/folders/1r-TeSN2lld0ZlG0fkLseO2-4DgeRDTYT?usp=sharing', external: true },
                { label: 'Nhạc Dựng Phim', href: 'https://drive.google.com/drive/folders/1UzR27ps5oXPMrVrmnYqIAFf8NXw0yxFz?usp=sharing', external: true },
                { label: 'Khóa Học Photoshop', href: 'https://drive.google.com/drive/folders/170hnr50w7quc2uJenhmkk4WQLnmEubc9?usp=sharing', external: true },
                { label: 'Kho Tài liệu Tiếng Anh Bất Tận', href: 'https://drive.google.com/drive/folders/1gqgwnDQDuhVsdV60x8JAveVl7CGrwZ9J?usp=sharing', external: true },
                { label: 'Khóa Học Tiếng Trung', href: 'https://drive.google.com/drive/folders/1aZrnUlK4M3LGnqBmP6My-sPqG8z8Ch6O?usp=drive_link', external: true },
                { label: 'Cách Tạo AI GPT Hiểu Bạn Nhất Trên Đời', href: 'https://www.canva.com/design/DAGw3EKPBqg/Jdv5m9tA62BK5U93ijCfKw/view?utm_content=DAGw3EKPBqg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hec974d0021', external: true },
                { label: 'Cách Up Font Chữ Lên Canva', href: 'https://linhhhh.my.canva.site/cachupfontchu', external: true }
            ]
        },

        { label: 'GET OTP GPT', href: '/get-otp', hasDropdown: false },
        { label: 'GET 2FA', href: '/2falive', hasDropdown: false },
    ], []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="header-wrapper">
            {/* Main Header */}
            <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container header-content">
                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    {/* Logo */}
                    <Link to="/" className="brand-logo">
                        <img src={logo} alt="taphoaKeyT" className="logo-image" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav">
                        <ul className="nav-list">
                            {navItems.map((item) => (
                                <li
                                    key={item.label}
                                    className="nav-item"
                                >
                                    <Link
                                        to={item.href}
                                        className={`nav-link ${location.pathname === item.href ? 'active' : ''}`}
                                        onClick={(e) => {
                                            if (item.hasDropdown) {
                                                if (item.href === '#') {
                                                    e.preventDefault();
                                                    setActiveDropdown(activeDropdown === item.label ? null : item.label);
                                                } else {
                                                    if (activeDropdown !== item.label) {
                                                        e.preventDefault(); // Click to open dropdown
                                                        setActiveDropdown(item.label);
                                                    } else {
                                                        // Second click goes to link
                                                        setActiveDropdown(null);
                                                    }
                                                }
                                            } else {
                                                setActiveDropdown(null);
                                            }
                                        }}
                                    >
                                        {item.label}
                                        {item.hasDropdown && <ChevronDown size={14} className="dropdown-arrow" />}
                                    </Link>

                                    {/* Mega Menu / Dropdown */}
                                    {item.hasDropdown && activeDropdown === item.label && (
                                        <>

                                            {item.simpleDropdown && (
                                                <div className="simple-dropdown">
                                                    <ul>
                                                        {item.simpleDropdown.map((subItem, sIdx) => (
                                                            <li key={sIdx}>
                                                                {subItem.external === false ? (
                                                                    <Link
                                                                        to={subItem.href}
                                                                        onClick={() => setActiveDropdown(null)}
                                                                    >
                                                                        {subItem.label}
                                                                    </Link>
                                                                ) : (
                                                                    <a
                                                                        href={subItem.href}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        {subItem.label}
                                                                    </a>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Actions & Search */}
                    <div className="header-actions">
                        {/* Language Toggle */}
                        <button onClick={toggleLanguage} className="lang-toggle-btn" title="Switch Language">
                            <Globe size={18} />
                            <span>{i18n.language === 'vi' ? 'VI' : 'EN'}</span>
                        </button>

                        {/* Search Bar */}
                        <div className="search-bar-container">
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => onSearch(e.target.value)}
                                placeholder="Search products..."
                                className="search-input"
                            />
                            <button className="search-btn"><Search size={18} /></button>
                        </div>

                        <div className="icon-actions">
                            {user ? (
                                <>
                                    {/* User - Hover Dropdown */}
                                    <div className="action-item user-action">
                                        <Link to="/profile" className="icon-btn">
                                            <User size={22} strokeWidth={1.5} />
                                        </Link>
                                        <div className="user-dropdown-menu">
                                            <div className="user-welcome">Hi, {user.username || 'User'}</div>
                                            {user.admin && (
                                                <>
                                                    <Link to="/admin/dashboard" className="admin-link">Dashboard</Link>
                                                    <Link to="/admin/banners" className="admin-link">Banners</Link>
                                                </>
                                            )}
                                            <Link to="/profile">My Profile</Link>
                                            <Link to={user.admin ? "/admin/orders" : "/orders"}>Orders</Link>
                                            <button onClick={handleLogout}>Logout</button>
                                        </div>
                                    </div>

                                    <Link to="/wishlist" className="action-item icon-btn" title="Wishlist">
                                        <Heart size={22} strokeWidth={1.5} />
                                        <span className="badge">{wishlist.length}</span>
                                    </Link>

                                    <Link to="/cart" ref={cartIconRef} className="action-item icon-btn" title="Cart" data-cart-icon>
                                        <ShoppingBag size={22} strokeWidth={1.5} />
                                        <span className="badge">{totalItems}</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="auth-btn login-btn">
                                        Đăng nhập
                                    </Link>
                                    <Link to="/register" className="auth-btn register-btn">
                                        Đăng ký
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Overlay */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>

            <div className={`mobile-menu-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-header">
                    <h3>Menu</h3>
                    <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
                </div>

                <div className="mobile-search">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                    <Search size={18} className="mobile-search-icon" />
                </div>

                <nav className="mobile-nav">
                    {navItems.map(item => (
                        <div key={item.label}>
                            {!item.hasDropdown ? (
                                <Link
                                    to={item.href}
                                    className="mobile-nav-item"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ) : item.simpleDropdown ? (
                                <div>
                                    <button
                                        className="mobile-nav-item mobile-nav-dropdown-btn"
                                        onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                                    >
                                        <span>{item.label}</span>
                                        <ChevronDown
                                            size={16}
                                            style={{
                                                transform: activeDropdown === item.label ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.2s'
                                            }}
                                        />
                                    </button>
                                    {activeDropdown === item.label && (
                                        <div className="mobile-dropdown-submenu">
                                            {item.simpleDropdown.map((subItem, sIdx) => (
                                                subItem.external === false ? (
                                                    <Link
                                                        key={sIdx}
                                                        to={subItem.href}
                                                        className="mobile-dropdown-item"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        {subItem.label}
                                                    </Link>
                                                ) : (
                                                    <a
                                                        key={sIdx}
                                                        href={subItem.href}
                                                        className="mobile-dropdown-item"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        {subItem.label}
                                                    </a>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    to={item.href}
                                    className="mobile-nav-item"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            )}
                        </div>
                    ))}
                    <div className="mobile-nav-divider"></div>
                    {user ? (
                        <>
                            <Link to="/profile" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                            <button className="mobile-nav-item logout" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Logout</button>
                        </>
                    ) : (
                        <Link to="/login" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>Login / Register</Link>
                    )}
                </nav>
            </div>
        </div>
    );
}
