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
  Star
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
  };

  const renderDashboardHome = () => {
    if (loadingStats) {
      return <div className="p-8 text-center text-gray-500">Loading stats...</div>;
    }

    return (
      <div className="admin-dashboard-home">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', color: '#111827' }}>
          Tổng quan hệ thống
        </h2>

        <div className="admin-dashboard-grid">
          {/* Card 1: ChatGPT Accounts */}
          <div className="stats-card">
            <h3>ChatGPT Accounts</h3>
            <p className="value text-primary">{stats?.chatGptAccounts.total || 0}</p>
          </div>

          {/* Card 2: Subscriptions */}
          <div className="stats-card">
            <h3>Subscriptions</h3>
            <p className="value text-primary">{stats?.subscriptions.total || 0}</p>
            <div className="sub-text">
              <span className="text-success">Active: {stats?.subscriptions.active || 0}</span>
              <span>•</span>
              <span className="text-gray-500">Expired: {stats?.subscriptions.expired || 0}</span>
            </div>
          </div>

          {/* Card 3: Ending Tomorrow */}
          <div className="stats-card">
            <h3>Ending Tomorrow</h3>
            <p className="value text-danger">{stats?.subscriptions.endingTomorrow || 0}</p>
            <div className="sub-text">
              Subscriptions expiring in 24h
            </div>
          </div>

          {/* Card 4: OTP Requests */}
          <div className="stats-card">
            <h3>OTP Requests</h3>
            <p className="value text-primary">{stats?.otpRequests.totalRequests || 0}</p>
            <div className="sub-text">
              From {stats?.otpRequests.totalUsers || 0} users
            </div>
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
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`} style={{ width: isSidebarOpen ? '260px' : '0', overflow: 'hidden' }}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <LayoutDashboard size={24} className="text-primary" />
            <span>KeyT Admin</span>
          </div>
        </div>

        <nav className="admin-sidebar-content">
          <button
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Tổng quan</span>
          </button>

          <div style={{ height: '1px', background: '#e5e7eb', margin: '8px 0' }}></div>

          <button
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            <span>Quản lý Users</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={20} />
            <span>Sản phẩm</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={20} />
            <span>Đơn hàng</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <Star size={20} />
            <span>Đánh giá</span>
          </button>

          <div style={{ height: '1px', background: '#e5e7eb', margin: '8px 0' }}></div>

          <button
            className={`admin-nav-item ${activeTab === 'chatgpt' ? 'active' : ''}`}
            onClick={() => setActiveTab('chatgpt')}
          >
            <Bot size={20} />
            <span>ChatGPT Accounts</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            <CreditCard size={20} />
            <span>Subscriptions</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'otp' ? 'active' : ''}`}
            onClick={() => setActiveTab('otp')}
          >
            <Key size={20} />
            <span>OTP Requests</span>
          </button>
        </nav>

        {/* Sidebar Footer (optional) */}
        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
          <button className="admin-nav-item" onClick={logout} style={{ color: '#ef4444' }}>
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
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}>
              <Menu size={24} color="#374151" />
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
        </div>
      </main>
    </div>
  );
}
