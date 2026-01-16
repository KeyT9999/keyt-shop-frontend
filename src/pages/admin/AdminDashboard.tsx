import { useEffect, useState } from 'react';
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
  TrendingUp,
  Clock
} from 'lucide-react';
import './AdminStyles.css';

// Import sub-pages (components)
import UsersPage from './UsersPage';
import ProductsPage from './ProductsPage';
import OrdersPage from './OrdersPage';
import ChatGptAccountsPage from './ChatGptAccountsPage';
import SubscriptionsPage from './SubscriptionsPage';
import OtpRequestsPage from './OtpRequestsPage';
import ReviewsPage from './ReviewsPage';

type AdminTab = 'dashboard' | 'users' | 'products' | 'orders' | 'chatgpt' | 'subscriptions' | 'otp' | 'reviews';

export default function AdminDashboard() {
  const { token, user, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Default to open on desktop (> 768px), closed on mobile
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768;
    }
    return true;
  });

  useEffect(() => {
    if (token && user?.admin) {
      loadStats();
    }
  }, [token, user]);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await adminService.getDashboardStats(token!);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  if (!user?.admin) {
    return (
      <div className="admin-page-error">
        <h1>403 - Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const renderContent = () => {
    try {
      switch (activeTab) {
        case 'dashboard':
          return renderDashboardHome();
        case 'users':
          return <UsersPage />;
        case 'products':
          return <ProductsPage />;
        case 'orders':
          return <OrdersPage />;
        case 'reviews':
          return <ReviewsPage />;
        case 'chatgpt':
          return <ChatGptAccountsPage />;
        case 'subscriptions':
          return <SubscriptionsPage />;
        case 'otp':
          return <OtpRequestsPage />;
        default:
          return renderDashboardHome();
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div style={{ padding: '2rem', color: '#EF4444' }}>
          <h2>Đã có lỗi xảy ra</h2>
          <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      );
    }
  };

  const renderDashboardHome = () => {
    if (loadingStats) {
      return <div className="p-8 text-center text-gray-500">Loading stats...</div>;
    }

    return (
      <div className="admin-dashboard-home">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#1E293B' }}>
          Tổng quan hệ thống
        </h2>

        <div className="admin-dashboard-grid">
          {/* Card 1: ChatGPT Accounts */}
          <div className="stats-card">
            <div className="stats-card-header">
              <h3>ChatGPT Accounts</h3>
              <div className="icon-wrapper">
                <Bot size={24} />
              </div>
            </div>
            <p className="value">{stats?.chatGptAccounts.total || 0}</p>
            <div className="sub-text">
              <TrendingUp size={14} className="text-success" />
              <span className="text-success">+2% this week</span>
            </div>
          </div>

          {/* Card 2: Subscriptions */}
          <div className="stats-card">
            <div className="stats-card-header">
              <h3>Subscriptions</h3>
              <div className="icon-wrapper">
                <CreditCard size={24} />
              </div>
            </div>
            <p className="value">{stats?.subscriptions.total || 0}</p>
            <div className="sub-text">
              <span className="text-success">Active: {stats?.subscriptions.active || 0}</span>
              <span>•</span>
              <span className="text-secondary">Expired: {stats?.subscriptions.expired || 0}</span>
            </div>
          </div>

          {/* Card 3: Ending Tomorrow */}
          <div className="stats-card">
            <div className="stats-card-header">
              <h3>Expiring Soon</h3>
              <div className="icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                <Clock size={24} />
              </div>
            </div>
            <p className="value text-danger">{stats?.subscriptions.endingTomorrow || 0}</p>
            <div className="sub-text">
              Subscriptions ending in 24h
            </div>
          </div>

          {/* Card 4: OTP Requests */}
          <div className="stats-card">
            <div className="stats-card-header">
              <h3>OTP Requests</h3>
              <div className="icon-wrapper">
                <Key size={24} />
              </div>
            </div>
            <p className="value">{stats?.otpRequests.totalRequests || 0}</p>
            <div className="sub-text">
              <Users size={14} style={{ flexShrink: 0 }} />
              <span>{stats?.otpRequests.totalUsers || 0} users</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="table-container">
          <h3 style={{ padding: '12px 16px', margin: 0, borderBottom: '1px solid #E2E8F0', color: '#1E293B', fontSize: '0.95rem' }}>Quick Actions</h3>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn-admin btn-admin-primary" onClick={() => setActiveTab('users')} style={{ width: '100%' }}>
              <Users size={16} /> Manage Users
            </button>
            <button className="btn-admin btn-admin-outline" onClick={() => setActiveTab('products')} style={{ width: '100%' }}>
              <Package size={16} /> Manage Products
            </button>
          </div>
        </div>

      </div>
    );
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'users': return 'Quản lý Users';
      case 'products': return 'Quản lý Sản phẩm';
      case 'orders': return 'Quản lý Đơn hàng';
      case 'reviews': return 'Quản lý Đánh giá';
      case 'chatgpt': return 'ChatGPT Accounts';
      case 'subscriptions': return 'Subscriptions';
      case 'otp': return 'OTP Requests';
      default: return 'Admin';
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Overlay - only visible on mobile */}
      <div 
        className="admin-sidebar-overlay"
        onClick={() => setIsSidebarOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          display: isSidebarOpen ? 'block' : 'none'
        }}
      />
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <LayoutDashboard size={24} />
            <span>KeyT Admin</span>
          </div>
        </div>

        <nav className="admin-sidebar-content">
          <button
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Switching to dashboard tab');
              setActiveTab('dashboard');
            }}
          >
            <LayoutDashboard size={20} />
            <span>Tổng quan</span>
          </button>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }}></div>

          <button
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('users');
            }}
          >
            <Users size={20} />
            <span>Quản lý Users</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('products');
            }}
          >
            <Package size={20} />
            <span>Sản phẩm</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('orders');
            }}
          >
            <ShoppingBag size={20} />
            <span>Đơn hàng</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('reviews');
            }}
          >
            <Star size={20} />
            <span>Đánh giá</span>
          </button>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }}></div>

          <button
            className={`admin-nav-item ${activeTab === 'chatgpt' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('chatgpt');
            }}
          >
            <Bot size={20} />
            <span>ChatGPT Accounts</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('subscriptions');
            }}
          >
            <CreditCard size={20} />
            <span>Subscriptions</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'otp' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('otp');
            }}
          >
            <Key size={20} />
            <span>OTP Requests</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button className="admin-nav-item" onClick={logout} style={{ color: '#EF4444' }}>
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Toggle Sidebar Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSidebarOpen(!isSidebarOpen);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                color: '#334155',
                zIndex: 1001,
                position: 'relative'
              }}
            >
              <Menu size={24} />
            </button>
            <h1 className="admin-page-title">{getPageTitle()}</h1>
          </div>

          <div className="admin-user-profile">
            <div className="admin-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="admin-username">{user?.username || 'Admin'}</span>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="admin-content-scroll">
          {renderContent()}
          <footer style={{
            marginTop: 'auto',
            padding: '16px',
            textAlign: 'center',
            color: '#94A3B8',
            fontSize: '0.75rem',
            borderTop: '1px solid #E2E8F0'
          }}>
            &copy; {new Date().getFullYear()} KeyT Shop Admin. All rights reserved.
          </footer>
        </div>
      </main>
    </div>
  );
}
