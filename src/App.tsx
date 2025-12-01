import { useState, useEffect, useRef, startTransition } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import YoutubeSummarizerPage from './pages/YoutubeSummarizerPage';
import GetOtpPage from './pages/GetOtpPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ChatGptAccountsPage from './pages/admin/ChatGptAccountsPage';
import SubscriptionsPage from './pages/admin/SubscriptionsPage';
import UserLoginHistoryPage from './pages/admin/UserLoginHistoryPage';
import OtpRequestsPage from './pages/admin/OtpRequestsPage';
import UsersPage from './pages/admin/UsersPage';
import ProductsPage from './pages/admin/ProductsPage';
import OrdersPage from './pages/admin/OrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import OrderDetailPage from './pages/OrderDetailPage';
import InvoiceView from './components/order/InvoiceView';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import { useCartContext } from './context/useCartContext';
import { useAuthContext } from './context/useAuthContext';

export default function App() {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const prevPathnameRef = useRef<string>('');
  const { totalItems } = useCartContext();
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Debug: Log user admin status
  useEffect(() => {
    if (user) {
      console.log('Current user:', user);
      console.log('Is admin:', user.admin);
    }
  }, [user]);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Summarizer', href: '/summarizer' },
    { label: 'Get OTP', href: '/get-otp' },
    ...(user && user.admin === true ? [{ label: 'Admin', href: '/admin/dashboard' }] : [])
  ];

  // Close menu when route changes
  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = location.pathname;
    
    if (prevPathname !== location.pathname) {
      startTransition(() => {
        setProfileMenuOpen(false);
      });
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  const HeaderContent = (
    <>
      <Link to="/" className="app-logo">
        🏪 Tiệm Tạp Hóa KeyT
      </Link>
      <nav className="simple-nav">
        {navItems.map(item => (
          <Link 
            key={item.href} 
            to={item.href} 
            className={location.pathname === item.href ? 'active' : ''}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        {!user?.admin && (
          <Link to="/cart" className="cart-link">
          🛒 Giỏ hàng
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </Link>
        )}
        {user ? (
          <div className="user-menu" ref={menuRef}>
            <button
              type="button"
              className="user-menu__trigger"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
            >
              {user.username}
            </button>
            {profileMenuOpen && (
              <div className="user-menu__dropdown">
                <Link to="/profile" onClick={() => setProfileMenuOpen(false)}>
                  Profile
                </Link>
                <button type="button" onClick={logout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="app">
      <header className="main-header">
        {HeaderContent}
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders/:id/invoice" element={<InvoiceView />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/summarizer" element={<YoutubeSummarizerPage />} />
          <Route path="/get-otp" element={<GetOtpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/chatgpt-accounts" element={<ChatGptAccountsPage />} />
          <Route path="/admin/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/products" element={<ProductsPage />} />
          <Route path="/admin/orders" element={<OrdersPage />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="/admin/user-login-history/:userId" element={<UserLoginHistoryPage />} />
          <Route path="/admin/otp-requests" element={<OtpRequestsPage />} />
        </Routes>
      </main>
    </div>
  );
}
