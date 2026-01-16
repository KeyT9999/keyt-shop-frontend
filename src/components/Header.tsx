import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, Globe } from 'lucide-react'; // Added Globe
import { useCartContext } from '../context/useCartContext';
import { useAuthContext } from '../context/useAuthContext';
import { useWishlistContext } from '../context/useWishlistContext';
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
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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

    const navItems = [
        { label: 'HOME', href: '/', hasDropdown: false },
        {
            label: 'SHOP',
            href: '/products',
            hasDropdown: true,
            megaMenu: [
                {
                    title: 'Giải trí',
                    items: ['Netflix Premium', 'Spotify Premium', 'YouTube Premium', 'Disney+']
                },
                {
                    title: 'Thiết kế',
                    items: ['Canva Pro', 'Adobe Creative Cloud', 'Figma Professional', 'Freepik Premium']
                },
                {
                    title: 'Năng suất',
                    items: ['Google Drive + Gemini', 'Microsoft 365', 'ChatGPT Plus', 'Notion Premium']
                },
                {
                    title: 'Học tập',
                    items: ['Coursera Plus', 'Udemy Business', 'Duolingo Super', 'Grammarly Premium']
                }
            ]
        },
        { label: 'SUMMARIZER', href: '/summarizer', hasDropdown: false },
        { label: 'EVIDENCE', href: '/evidence', hasDropdown: false },
        {
            label: 'TIP FREE',
            href: '#',
            hasDropdown: true,
            simpleDropdown: [
                { label: 'Khóa Học Capcut Quạ HD', href: 'https://drive.google.com/drive/folders/1qBVyGif2u7qChuQIvQmt51MwxGsuLojp?usp=drive_link', external: true },
                { label: 'Khóa Học Canva', href: 'https://drive.google.com/drive/folders/1clQOT7Zf99HjXOuqKZMZtLp_WNkGL5zq?usp=drive_link', external: true },
                { label: 'Cách Tạo AI GPT Hiểu Bạn Nhất Trên Đời', href: 'https://www.canva.com/design/DAGw3EKPBqg/Jdv5m9tA62BK5U93ijCfKw/view?utm_content=DAGw3EKPBqg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hec974d0021', external: true },
                { label: 'Cách Up Font Chữ Lên Canva', href: 'https://linhhhh.my.canva.site/cachupfontchu', external: true }
            ]
        },

        { label: 'GET OTP GPT', href: '/get-otp', hasDropdown: false },



    ];

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
                                    onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link
                                        to={item.href}
                                        className={`nav-link ${location.pathname === item.href ? 'active' : ''}`}
                                    >
                                        {item.label}
                                        {item.hasDropdown && <ChevronDown size={14} className="dropdown-arrow" />}
                                    </Link>

                                    {/* Mega Menu / Dropdown */}
                                    {item.hasDropdown && activeDropdown === item.label && (
                                        <>
                                            {item.megaMenu && (
                                                <div className="mega-menu">
                                                    {item.megaMenu.map((section, idx) => (
                                                        <div key={idx} className="mega-menu-column">
                                                            <h4>{section.title}</h4>
                                                            <ul>
                                                                {section.items.map((subItem, sIdx) => (
                                                                    <li key={sIdx}>
                                                                        <Link to="#">{subItem}</Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {item.simpleDropdown && (
                                                <div className="simple-dropdown">
                                                    <ul>
                                                        {item.simpleDropdown.map((subItem, sIdx) => (
                                                            <li key={sIdx}>
                                                                <a
                                                                    href={subItem.href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    {subItem.label}
                                                                </a>
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

                                    <Link to="/cart" className="action-item icon-btn" title="Cart">
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
