import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import type { UserOtpInfo } from '../../types/admin';
import { Link } from 'react-router-dom';

export default function OtpRequestsPage() {
  const { token, user } = useAuthContext();
  const [otpInfos, setOtpInfos] = useState<UserOtpInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && user?.admin) {
      loadOtpRequests();
    }
  }, [token, user]);

  const loadOtpRequests = async () => {
    try {
      const data = await adminService.getOtpRequests(token!);
      setOtpInfos(data);
    } catch (err) {
      console.error('Error loading OTP requests:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.admin) {
    return <div className="main-content"><div style={{ padding: '2rem', color: '#1f2937' }}>403 - Không có quyền</div></div>;
  }

  if (loading) {
    return <div className="main-content"><div style={{ padding: '2rem', color: '#1f2937' }}>Đang tải...</div></div>;
  }

  return (
    <div className="main-content">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#1f2937', marginBottom: '2rem' }}>OTP Requests Statistics</h1>

        <div style={{ background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>User</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Số lần yêu cầu</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Lần cuối</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {otpInfos.map((info) => (
                <tr key={info.user._id} style={{ borderTop: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', color: '#1f2937' }}>{info.user.username}</td>
                  <td style={{ padding: '1rem', color: '#1f2937' }}>{info.user.email}</td>
                  <td style={{ padding: '1rem', color: '#1f2937' }}>{info.count}</td>
                  <td style={{ padding: '1rem', color: '#1f2937' }}>
                    {info.lastRequest ? new Date(info.lastRequest).toLocaleString('vi-VN') : '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Link
                      to={`/admin/user-login-history/${info.user._id}`}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#2563eb',
                        color: '#ffffff',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        transition: 'background 0.2s',
                        display: 'inline-block'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
                    >
                      Xem lịch sử
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {otpInfos.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Chưa có OTP request nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

