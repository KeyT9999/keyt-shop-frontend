import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { useAuthContext } from '../../context/useAuthContext';
import type { UserProfile, LoginHistory } from '../../types/profile';

interface SecurityTabProps {
  profile: UserProfile;
}

export default function SecurityTab({ profile }: SecurityTabProps) {
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    loadLoginHistory();
  }, []);

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      const history = await profileService.getLoginHistory();
      setLoginHistory(history.slice(0, 5));
    } catch (err: any) {
      console.error('Failed to load login history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Đổi mật khẩu thành công');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Bạn có chắc muốn đăng xuất tất cả thiết bị?')) {
      return;
    }

    try {
      setLoading(true);
      await profileService.logoutAll();
      logout();
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể đăng xuất');
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Bạn có chắc muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await profileService.deleteAccount(deletePassword);
      logout();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể xóa tài khoản');
      setLoading(false);
    }
  };

  if (profile.loginType === 'login-google') {
    return (
      <div className="profile-tab">
        <div className="profile-tab__header" style={{ marginBottom: '24px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Bảo mật & Đăng nhập</h2>
        </div>

        {/* Google Account Notice */}
        <div className="profile-message info" style={{ marginBottom: '32px' }}>
          Tài khoản Google không thể đổi mật khẩu tại đây. Vui lòng quản lý mật khẩu thông qua Google.
        </div>

        {/* Card 2: Login Sessions (Adapted for Google User) */}
        <div className="security-card">
          <div className="security-card__header">
            <h3>Phiên đăng nhập</h3>
            <button className="profile-button danger small" onClick={handleLogoutAll} disabled={loading}>
              Đăng xuất tất cả
            </button>
          </div>
          <div className="security-card__content">
            {loading && loginHistory.length === 0 ? (
              <p>Đang tải...</p>
            ) : loginHistory.length === 0 ? (
              <p>Chưa có lịch sử đăng nhập</p>
            ) : (
              <div className="login-history">
                {loginHistory.map((entry) => (
                  <div key={entry.id} className="login-history__item">
                    <div className="login-history__info">
                      <p><strong>Thiết bị:</strong> {entry.userAgent || 'Không xác định'}</p>
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>
                        {new Date(entry.loginTime).toLocaleString('vi-VN')} • IP: {entry.ipAddress}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Danger Zone */}
        <div className="security-card danger-zone" style={{ marginTop: '32px', border: '1px solid #fecaca', background: '#fef2f2' }}>
          <div className="security-card__header">
            <h3 style={{ color: '#991b1b' }}>Khu vực nguy hiểm</h3>
          </div>
          <div className="security-card__content">
            <p style={{ color: '#7f1d1d', marginBottom: '16px' }}>
              Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
            </p>
            <form onSubmit={handleDeleteAccount} className="profile-form">
              {/* Note: Google users might verify differently, keeping password logic for now as per original code, might fail if backend expects password for google user. Assuming backend handles this or google users have a set password/can't delete this way without password. 
                   If backend requires password for deletion, Google users might need a flow to set one or confirm via email. 
                   For now, sticking to UI refactor based on existing logic.
               */}
              <div className="profile-form__group">
                <label style={{ color: '#991b1b' }}>Nhập mật khẩu / Xác nhận</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu để xác nhận"
                  style={{ borderColor: '#fca5a5' }}
                />
              </div>
              <button type="submit" className="profile-button danger" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Xóa tài khoản vĩnh viễn'}
              </button>
            </form>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="profile-tab">
      <div className="profile-tab__header" style={{ marginBottom: '32px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Bảo mật & Đăng nhập</h2>
        <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Quản lý mật khẩu và bảo mật tài khoản.</p>
      </div>

      {success && <div className="profile-message success">{success}</div>}
      {error && <div className="profile-message error">{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Card 1: Change Password */}
        <div className="security-card">
          <div className="security-card__header">
            <h3>Đổi mật khẩu</h3>
          </div>
          <div className="security-card__content">
            <form onSubmit={handleChangePassword} className="profile-form" style={{ maxWidth: '600px' }}>
              <div className="profile-form__group">
                <label>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="profile-form__row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="profile-form__group">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="profile-form__group">
                  <label>Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <button type="submit" className="profile-button primary small" disabled={loading} style={{ width: 'fit-content', padding: '10px 24px' }}>
                  {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Card 2: Login Sessions */}
        <div className="security-card">
          <div className="security-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Phiên đăng nhập</h3>
            <button className="profile-button danger small" onClick={handleLogoutAll} disabled={loading} style={{ fontSize: '13px', padding: '8px 16px' }}>
              Đăng xuất tất cả
            </button>
          </div>
          <div className="security-card__content">
            {loading && loginHistory.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Đang tải lịch sử...</div>
            ) : loginHistory.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Chưa có lịch sử đăng nhập nào.</div>
            ) : (
              <div className="login-history" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loginHistory.map((entry) => (
                  <div key={entry.id} className="login-history__item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#1f2937' }}>{entry.userAgent || 'Thiết bị không xác định'}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                        {new Date(entry.loginTime).toLocaleString('vi-VN')} • {entry.ipAddress}
                      </p>
                    </div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} title="Active"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Danger Zone */}
        <div className="security-card danger-zone" style={{ border: '1px solid #fecaca', background: '#fff1f2', borderRadius: '16px', overflow: 'hidden' }}>
          <div className="security-card__header" style={{ padding: '24px', borderBottom: '1px solid #fecaca', background: '#fee2e2' }}>
            <h3 style={{ color: '#991b1b', margin: 0, fontSize: '18px' }}>Khu vực nguy hiểm</h3>
            <p style={{ margin: '4px 0 0 0', color: '#7f1d1d', fontSize: '14px' }}>Các hành động dưới đây không thể hoàn tác.</p>
          </div>
          <div className="security-card__content" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Xóa tài khoản vĩnh viễn</h4>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                  Tài khoản của bạn và tất cả dữ liệu liên quan sẽ bị xóa khỏi hệ thống. Vui lòng cân nhắc kỹ.
                </p>
              </div>
            </div>

            <form onSubmit={handleDeleteAccount} className="profile-form" style={{ marginTop: '24px', maxWidth: '400px' }}>
              <div className="profile-form__group">
                <label style={{ color: '#991b1b' }}>Nhập mật khẩu xác nhận</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  style={{ borderColor: '#fca5a5' }}
                />
              </div>
              <button type="submit" className="profile-button danger" disabled={loading} style={{ width: 'fit-content' }}>
                {loading ? 'Đang xóa...' : 'Tôi hiểu, xóa tài khoản này'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

