import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import { visitService } from '../../services/visitService';
import type { AdminStats } from '../../types/admin';
import type { VisitStats } from '../../types/visit';
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
  TrendingDown,
  Clock,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Globe
} from 'lucide-react';
import DailyVisitsChart from '../../components/DailyVisitsChart';
import HourlyVisitsChart from '../../components/HourlyVisitsChart';
import './AdminStyles.css';

// Import sub-pages (components)
import UsersPage from './UsersPage';
import ProductsPage from './ProductsPage';
import OrdersPage from './OrdersPage';
import ChatGptAccountsPage from './ChatGptAccountsPage';
import SubscriptionsPage from './SubscriptionsPage';
import OtpRequestsPage from './OtpRequestsPage';
import ReviewsPage from './ReviewsPage';
import AnnouncementPage from './AnnouncementPage';

type AdminTab = 'dashboard' | 'users' | 'products' | 'orders' | 'chatgpt' | 'subscriptions' | 'otp' | 'reviews' | 'announcement';

export default function AdminDashboard() {
  const { token, user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  const [loadingVisitStats, setLoadingVisitStats] = useState(false);
  const [visitPeriod, setVisitPeriod] = useState<'1m' | '2m' | '3m' | '6m' | '1y'>('1m');
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
      loadVisitStats();
    }
  }, [token, user]);

  useEffect(() => {
    if (token && user?.admin) {
      loadVisitStats();
    }
  }, [visitPeriod, token, user]);

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

  const loadVisitStats = async () => {
    try {
      setLoadingVisitStats(true);
      const data = await visitService.getVisitStats(token!, visitPeriod);
      setVisitStats(data);
    } catch (err) {
      console.error('Error loading visit stats:', err);
    } finally {
      setLoadingVisitStats(false);
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
        case 'announcement':
          return <AnnouncementPage />;
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

        {/* Visit Statistics */}
        <div className="table-container" style={{ marginTop: '24px' }}>
          <div style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid #E2E8F0', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <h3 style={{ margin: 0, color: '#1E293B', fontSize: '0.95rem', fontWeight: 600 }}>
              <Eye size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Thống kê lượt truy cập
            </h3>
            <select
              value={visitPeriod}
              onChange={(e) => setVisitPeriod(e.target.value as '1m' | '2m' | '3m' | '6m' | '1y')}
              style={{
                padding: '6px 12px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '0.875rem',
                background: 'white',
                color: '#1E293B',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="1m">1 tháng</option>
              <option value="2m">2 tháng</option>
              <option value="3m">3 tháng</option>
              <option value="6m">6 tháng</option>
              <option value="1y">1 năm</option>
            </select>
          </div>

          {loadingVisitStats ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>
              Đang tải thống kê...
            </div>
          ) : visitStats ? (
            <div style={{ padding: '16px' }}>
              {/* Main Stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '12px', 
                marginBottom: '24px' 
              }}>
                <div style={{ 
                  padding: '16px', 
                  background: '#F8FAFC', 
                  borderRadius: '8px', 
                  border: '1px solid #E2E8F0' 
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '4px' }}>Tổng lượt truy cập</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>
                    {visitStats.totalVisits.toLocaleString('vi-VN')}
                  </div>
                </div>
                <div style={{ 
                  padding: '16px', 
                  background: '#F8FAFC', 
                  borderRadius: '8px', 
                  border: '1px solid #E2E8F0' 
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '4px' }}>Người truy cập</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>
                    {visitStats.uniqueVisitors.toLocaleString('vi-VN')}
                  </div>
                </div>
                <div style={{ 
                  padding: '16px', 
                  background: '#F8FAFC', 
                  borderRadius: '8px', 
                  border: '1px solid #E2E8F0' 
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '4px' }}>Sessions</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>
                    {visitStats.totalSessions.toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* Daily Chart */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', marginBottom: '12px' }}>
                  Biểu đồ lượt truy cập theo ngày
                </h4>
                <div style={{
                  padding: '16px',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}>
                  <DailyVisitsChart dailyData={visitStats.dailyData} />
                </div>
              </div>

              {/* Hourly Chart */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', marginBottom: '12px' }}>
                  Thống kê theo giờ trong ngày
                </h4>
                <div style={{
                  padding: '16px',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}>
                  <HourlyVisitsChart hourlyData={visitStats.hourlyData} />
                </div>
              </div>

              {/* Comparison Section */}
              {visitStats.previousPeriod && visitStats.comparison && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', marginBottom: '12px' }}>
                    So sánh với khoảng thời gian trước
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    {/* Total Visits Comparison */}
                    <div style={{
                      padding: '16px',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '8px' }}>
                        Tổng lượt truy cập
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>
                          {visitStats.totalVisits.toLocaleString('vi-VN')}
                        </div>
                        {visitStats.comparison.totalVisitsChange >= 0 ? (
                          <TrendingUp size={18} color="#10B981" />
                        ) : (
                          <TrendingDown size={18} color="#EF4444" />
                        )}
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: visitStats.comparison.totalVisitsChange >= 0 ? '#10B981' : '#EF4444'
                        }}>
                          {visitStats.comparison.totalVisitsChange >= 0 ? '+' : ''}
                          {visitStats.comparison.totalVisitsChange.toFixed(1)}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                        Trước: {visitStats.previousPeriod.totalVisits.toLocaleString('vi-VN')}
                      </div>
                    </div>

                    {/* Unique Visitors Comparison */}
                    <div style={{
                      padding: '16px',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '8px' }}>
                        Người truy cập
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>
                          {visitStats.uniqueVisitors.toLocaleString('vi-VN')}
                        </div>
                        {visitStats.comparison.uniqueVisitorsChange >= 0 ? (
                          <TrendingUp size={18} color="#10B981" />
                        ) : (
                          <TrendingDown size={18} color="#EF4444" />
                        )}
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: visitStats.comparison.uniqueVisitorsChange >= 0 ? '#10B981' : '#EF4444'
                        }}>
                          {visitStats.comparison.uniqueVisitorsChange >= 0 ? '+' : ''}
                          {visitStats.comparison.uniqueVisitorsChange.toFixed(1)}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                        Trước: {visitStats.previousPeriod.uniqueVisitors.toLocaleString('vi-VN')}
                      </div>
                    </div>

                    {/* Sessions Comparison */}
                    <div style={{
                      padding: '16px',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '8px' }}>
                        Sessions
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>
                          {visitStats.totalSessions.toLocaleString('vi-VN')}
                        </div>
                        {visitStats.comparison.sessionsChange >= 0 ? (
                          <TrendingUp size={18} color="#10B981" />
                        ) : (
                          <TrendingDown size={18} color="#EF4444" />
                        )}
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: visitStats.comparison.sessionsChange >= 0 ? '#10B981' : '#EF4444'
                        }}>
                          {visitStats.comparison.sessionsChange >= 0 ? '+' : ''}
                          {visitStats.comparison.sessionsChange.toFixed(1)}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                        Trước: {visitStats.previousPeriod.totalSessions.toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Device Stats */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', marginBottom: '12px' }}>
                  Thiết bị
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {Object.entries(visitStats.deviceStats).map(([device, count]) => (
                    <div key={device} style={{
                      padding: '8px 12px',
                      background: '#F1F5F9',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {device === 'mobile' && <Smartphone size={16} />}
                      {device === 'desktop' && <Monitor size={16} />}
                      {device === 'tablet' && <Tablet size={16} />}
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>
                        {device === 'mobile' ? 'Mobile' : device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablet' : device}
                      </span>
                      <span style={{ color: '#64748B' }}>{count.toLocaleString('vi-VN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Browser Stats */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', marginBottom: '12px' }}>
                  Trình duyệt
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {Object.entries(visitStats.browserStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([browser, count]) => (
                      <div key={browser} style={{
                        padding: '8px 12px',
                        background: '#F1F5F9',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Globe size={16} />
                        <span style={{ fontWeight: 600, color: '#1E293B' }}>{browser}</span>
                        <span style={{ color: '#64748B' }}>{count.toLocaleString('vi-VN')}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Top Paths */}
              {visitStats.topPaths.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', marginBottom: '12px' }}>
                    Trang được truy cập nhiều nhất
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {visitStats.topPaths.map((item, index) => (
                      <div key={index} style={{
                        padding: '10px 12px',
                        background: '#F8FAFC',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.875rem'
                      }}>
                        <span style={{ color: '#1E293B', fontFamily: 'monospace' }}>{item.path}</span>
                        <span style={{ fontWeight: 600, color: '#F05A28' }}>{item.count.toLocaleString('vi-VN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>
              Chưa có dữ liệu truy cập
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="table-container" style={{ marginTop: '24px' }}>
          <h3 style={{ padding: '12px 16px', margin: 0, borderBottom: '1px solid #E2E8F0', color: '#1E293B', fontSize: '0.95rem' }}>Quick Actions</h3>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn-admin btn-admin-primary" onClick={() => setActiveTab('users')} style={{ width: '100%' }}>
              <Users size={16} /> Manage Users
            </button>
            <button className="btn-admin btn-admin-outline" onClick={() => setActiveTab('products')} style={{ width: '100%' }}>
              <Package size={16} /> Manage Products
            </button>
            <button className="btn-admin btn-admin-outline" onClick={() => navigate('/admin/affiliate')} style={{ width: '100%' }}>
              <TrendingUp size={16} /> Affiliate & Rut tien
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
      case 'announcement': return 'Thông báo';
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
            className="admin-nav-item"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/admin/netflix-replacements');
            }}
          >
            <RefreshCw size={20} />
            <span>Đổi cookie Netflix</span>
          </button>

          <button
            className="admin-nav-item"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/admin/affiliate');
            }}
          >
            <TrendingUp size={20} />
            <span>Affiliate & Rut tien</span>
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

          <button
            className={`admin-nav-item ${activeTab === 'announcement' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('announcement');
            }}
          >
            <Bell size={20} />
            <span>Thông báo</span>
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
