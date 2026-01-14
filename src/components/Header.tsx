import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, Globe } from 'lucide-react'; // Added Globe
import { useCartContext } from '../context/useCartContext';
import { useAuthContext } from '../context/useAuthContext';
import { useTranslation } from 'react-i18next'; // Added hook
import logo from '../assets/logo.png';
import './Header.css';

interface HeaderProps {
    onSearch: (query: string) => void;
    searchValue: string;
}

export default function Header({ onSearch, searchValue }: HeaderProps) {
    const { totalItems } = useCartContext();
    const { user, logout } = useAuthContext();
    const { i18n } = useTranslation(); // Init hook
    const location = useLocation();
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
                { title: 'Collections', items: ['New Arrivals', 'Best Sellers', 'Trending', 'Sale'] },
                { title: 'Categories', items: ['Electronics', 'Fashion', 'Home & Living', 'Accessories'] },
                { title: 'Featured', items: ['Summer Collection', 'Winter Essentials', 'Gift Guide'] }
            ]
        },
        { label: 'SUMMARIZER', href: '/summarizer', hasDropdown: false },
        { label: 'EVIDENCE', href: '/evidence', hasDropdown: false },
        { label: 'GET OTP', href: '/get-otp', hasDropdown: false },
    ];

    const handleLogout = () => {
        logout();
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
                                        <div className="mega-menu">
                                            {item.megaMenu?.map((section, idx) => (
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
                                            <div className="mega-menu-promo">
                                                <div className="promo-card">
                                                    <span>New Arrival</span>
                                                    <h3>Summer Sale</h3>
                                                    <Link to="/products">Shop Now</Link>
                                                </div>
                                            </div>
                                        </div>
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
                            {/* User - Hover Dropdown */}
                            <div className="action-item user-action">
                                <Link to={user ? "/profile" : "/login"} className="icon-btn">
                                    <User size={22} strokeWidth={1.5} />
                                </Link>
                                <div className="user-dropdown-menu">
                                    {user ? (
                                        <>
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
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/login" className="login-btn">Login</Link>
                                            <Link to="/register">Register</Link>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Link to="#" className="action-item icon-btn" title="Wishlist">
                                <Heart size={22} strokeWidth={1.5} />
                                <span className="badge">0</span>
                            </Link>

                            <Link to="/cart" className="action-item icon-btn" title="Cart">
                                <ShoppingBag size={22} strokeWidth={1.5} />
                                <span className="badge">{totalItems}</span>
                            </Link>
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
                        <div key={item.label} className="mobile-nav-item">
                            <Link to={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                                {item.label}
                            </Link>
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
