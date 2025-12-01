import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import type { AdminStats } from '../../types/admin';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { token, user } = useAuthContext();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && user?.admin) {
      loadStats();
    }
  }, [token, user]);

  const loadStats = async () => {
    try {
      const data = await adminService.getDashboardStats(token!);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.admin) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#1f2937' }}>
          <h1>403 - Không có quyền truy cập</h1>
          <p>Bạn cần quyền Admin để truy cập trang này.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#1f2937' }}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#1f2937', marginBottom: '2rem' }}>Admin Dashboard</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>ChatGPT Accounts</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>
              {stats?.chatGptAccounts.total || 0}
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>Subscriptions</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>
              {stats?.subscriptions.total || 0}
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Active: {stats?.subscriptions.active || 0} | Expired: {stats?.subscriptions.expired || 0}
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>Ending Tomorrow</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>
              {stats?.subscriptions.endingTomorrow || 0}
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>OTP Requests</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>
              {stats?.otpRequests.totalRequests || 0}
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              From {stats?.otpRequests.totalUsers || 0} users
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link
            to="/admin/users"
            style={{
              padding: '1rem',
              background: '#2563eb',
              borderRadius: '8px',
              color: '#ffffff',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            Quản lý Users
          </Link>
          <Link
            to="/admin/products"
            style={{
              padding: '1rem',
              background: '#2563eb',
              borderRadius: '8px',
              color: '#ffffff',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            Quản lý Sản phẩm
          </Link>
          <Link
            to="/admin/orders"
            style={{
              padding: '1rem',
              background: '#2563eb',
              borderRadius: '8px',
              color: '#ffffff',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            Quản lý Đơn hàng
          </Link>
          <Link
            to="/admin/chatgpt-accounts"
            style={{
              padding: '1rem',
              background: '#2563eb',
              borderRadius: '8px',
              color: '#ffffff',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            Quản lý ChatGPT Accounts
          </Link>
          <Link
            to="/admin/subscriptions"
            style={{
              padding: '1rem',
              background: '#2563eb',
              borderRadius: '8px',
              color: '#ffffff',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            Quản lý Subscriptions
          </Link>
          <Link
            to="/admin/otp-requests"
            style={{
              padding: '1rem',
              background: '#2563eb',
              borderRadius: '8px',
              color: '#ffffff',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            Xem OTP Requests
          </Link>
        </div>
      </div>
    </div>
  );
}

