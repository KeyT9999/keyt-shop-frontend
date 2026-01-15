import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import type { UserLoginHistoryResponse } from '../../types/admin';

export default function UserLoginHistoryPage() {
  const { userId } = useParams<{ userId: string }>();
  const { token, user } = useAuthContext();
  const [data, setData] = useState<UserLoginHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && user?.admin && userId) {
      loadHistory();
    }
  }, [token, user, userId]);

  const loadHistory = async () => {
    try {
      const response = await adminService.getUserLoginHistory(userId!, token!);
      setData(response);
    } catch (err) {
      console.error('Error loading history:', err);
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

  if (!data) {
    return <div className="main-content"><div style={{ padding: '2rem', color: '#1f2937' }}>Không tìm thấy dữ liệu</div></div>;
  }

  return (
    <div className="main-content">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#1f2937', marginBottom: '2rem' }}>
          Lịch sử đăng nhập: {data.user.username || data.user.email}
        </h1>

        <div style={{ marginBottom: '2rem', padding: '1rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
            <strong>Email:</strong> {data.user.email}
          </p>
          <p style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
            <strong>Số IP khác nhau:</strong> {data.distinctIpCount}
          </p>
          <p style={{ color: '#1f2937' }}>
            <strong>2 IP đầu tiên:</strong> {data.first2Ips.join(', ') || 'Chưa có'}
          </p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Thời gian</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>IP Address</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>User Agent</th>
              </tr>
            </thead>
            <tbody>
              {data.history.map((entry) => (
                <tr key={entry._id} style={{ borderTop: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', color: '#1f2937' }}>
                    {new Date(entry.loginTime).toLocaleString('vi-VN')}
                  </td>
                  <td style={{ padding: '1rem', color: '#1f2937', fontFamily: 'monospace' }}>
                    {entry.ipAddress}
                  </td>
                  <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.85rem' }}>
                    {entry.userAgent || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.history.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Chưa có lịch sử đăng nhập
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

