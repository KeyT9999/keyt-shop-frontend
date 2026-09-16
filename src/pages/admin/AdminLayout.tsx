import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import type { AdminStats } from '../../types/admin';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Bot,
  CreditCard,
  Key,
  LogOut,
  Menu,
  Star,
  Bell,
  RefreshCw,
  TrendingUp,
  ExternalLink,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import './AdminStyles.css';

export default function AdminLayout() {
  const { token, user, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768;
    }
    return true;
  });

  useEffect(() => {
    if (token && user?.admin) {
      adminService.getDashboardStats(token)
        .then((data) => setStats(data))
        .catch((err) => console.error('Error loading admin layout stats:', err));
    }
  }, [token, user]);

  if (!user?.admin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <h1 className="text-2xl font-bold text-rose-600 mb-2">403 - Truy cập bị từ chối</h1>
          <p className="text-slate-600 mb-6">Bạn không có quyền quản trị để xem trang này.</p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#F05A28] text-white font-semibold rounded-xl text-sm hover:bg-[#d84515] transition-colors"
          >
            Quay về trang chủ
          </a>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/dashboard')) return 'Bảng điều khiển';
    if (path.startsWith('/admin/banners')) return 'Banner quảng cáo';
    if (path.startsWith('/admin/affiliate')) return 'Affiliate & Rút tiền';
    if (path.startsWith('/admin/netflix-replacements')) return 'Đổi cookie Netflix';
    if (path.startsWith('/admin/users') || path.startsWith('/admin/user-login-history')) return 'Quản lý Users';
    if (path.startsWith('/admin/products')) return 'Quản lý Sản phẩm';
    if (path.startsWith('/admin/orders')) return 'Quản lý Đơn hàng';
    if (path.startsWith('/admin/subscriptions')) return 'Quản lý Subscriptions';
    if (path.startsWith('/admin/chatgpt-accounts')) return 'ChatGPT Accounts';
    if (path.startsWith('/admin/gemini')) return 'Gemini Accounts';
    if (path.startsWith('/admin/otp-requests')) return 'Yêu cầu OTP';
    if (path.startsWith('/admin/reviews')) return 'Quản lý Đánh giá';
    if (path.startsWith('/admin/announcement')) return 'Quản lý Thông báo';
    if (path.startsWith('/admin/chat')) return 'Tin nhắn Hỗ trợ';
    return 'Admin';
  };

  const isNavActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            zIndex: 40,
            display: 'block'
          }}
        />
      )}

      {/* Main Admin Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <LayoutDashboard size={20} />
            <span>Mindora Admin</span>
            <span className="admin-logo-badge">PRO</span>
          </div>
        </div>

        <nav className="admin-sidebar-content">
          {/* Group 1: TỔNG QUAN */}
          <div className="admin-nav-group-title">Tổng quan</div>
          <button
            className={`admin-nav-item ${isNavActive('/admin/dashboard') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin/dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Bảng điều khiển</span>
          </button>

          {/* Group 2: KINH DOANH & BÁN HÀNG */}
          <div className="admin-nav-group-title">Kinh doanh & Bán hàng</div>
          <button
            className={`admin-nav-item ${isNavActive('/admin/orders') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin/orders')}
          >
            <ShoppingBag size={18} />
            <span>Đơn hàng</span>
          </button>

          <button
            className={`admin-nav-item ${isNavActive('/admin/products') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin/products')}
          >
            <Package size={18} />
            <span>Sản phẩm</span>
          </button>

          <button
            className={`admin-nav-item ${isNavActive('/admin/subscriptions') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin/subscriptions')}
          >
            <CreditCard size={18} />
            <span>Subscriptions</span>
            {Boolean(stats?.subscriptions?.endingTomorrow) && (
              <span className="admin-nav-badge">{stats?.subscriptions?.endingTomorrow}</span>
            )}
          </button>

          <button
            className={`admin-nav-item ${isNavActive('/admin/affiliate') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin/affiliate')}
          >
            <TrendingUp size={18} />
            <span>Affiliate & Rút tiền</span>
          </button>

          <button
            className={`admin-nav-item ${isNavActive('/admin/netflix-replacements') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin/netflix-replacements')}
          >
            <RefreshCw size={18} />
            <span>Đổi cookie Netflix</span>
          </button>

          {/* Group 3: KHO TÀI KHOẢN & TIỆN ÍCH */}
          <div className="admin-nav-group-title">Kho tài khoản & Tiện ích</div>
          <button
            className={`admin-nav-item ${isNavActive('/admin/chatgpt-accounts') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin/chatgpt-accounts')}
          >
            <Bot size={18} />
            <span>ChatGPT Accounts</span>
          </button>

          <button
            className={`admin-nav-item ${isNavActive('/admin/gemini') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin/gemini')}
          >
            <svg width="18" height="18" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M96 0C96 53.0193 53.0193 96 0 96C53.0193 96 96 138.981 96 192C96 138.981 138.981 96 192 96C138.981 96 96 53.0193 96 0Z" fill="currentColor"/>
            </svg>
            <span>Gemini Accounts</span>
          </button>

          <button
            className={`admin-nav-item ${isNavActive('/admin/otp-requests') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin/otp-requests')}
          >
            <Key size={18} />
            <span>OTP Requests</span>
          </button>

          {/* Group 4: HỆ THỐNG & NỘI DUNG */}
          <div className="admin-nav-group-title">Hệ thống & Nội dung</div>
          <button
            className={`admin-nav-item ${isNavActive('/admin/users') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin/users')}
          >
            <Users size={18} />
            <span>Quản lý Users</span>
          </button>

          <button
            className={`admin-nav-item ${isNavActive('/admin/reviews') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin/reviews')}
          >
            <Star size={18} />
            <span>Đánh giá</span>
          </button>

          <button
            className={`admin-nav-item ${isNavActive('/admin/banners') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin/banners')}
          >
            <ImageIcon size={18} />
            <span>Banner quảng cáo</span>
          </button>

          <button
            className={`admin-nav-item ${isNavActive('/admin/announcement') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin/announcement')}
          >
            <Bell size={18} />
            <span>Thông báo</span>
          </button>

          <button
            className={`admin-nav-item ${isNavActive('/admin/chat') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin/chat')}
          >
            <MessageSquare size={18} />
            <span>Tin nhắn Hỗ trợ</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            className="admin-nav-item"
            onClick={logout}
            style={{ color: '#F87171' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#F87171'}
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                cursor: 'pointer',
                padding: '6px 8px',
                borderRadius: '8px',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title="Đóng / Mở Menu"
            >
              <Menu size={18} />
            </button>

            <div className="admin-breadcrumb">
              <span>Admin</span>
              <span>/</span>
              <span className="admin-breadcrumb-active">{getPageTitle()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-store-link"
              title="Mở trang bán hàng trong tab mới"
            >
              <ExternalLink size={14} />
              <span>Xem Website</span>
            </a>

            <div style={{ height: '20px', width: '1px', background: '#E2E8F0' }} />

            <div className="admin-user-profile">
              <div className="admin-avatar">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span className="admin-username">{user?.username || 'Admin'}</span>
                <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>Quản trị viên</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Area */}
        <div className="admin-content-scroll">
          <Outlet />
          <footer
            style={{
              marginTop: '40px',
              padding: '16px 0',
              textAlign: 'center',
              color: '#94A3B8',
              fontSize: '0.75rem',
              borderTop: '1px solid #E2E8F0'
            }}
          >
            &copy; {new Date().getFullYear()} Mindora AI Admin Portal. All rights reserved.
          </footer>
        </div>
      </main>
    </div>
  );
}
