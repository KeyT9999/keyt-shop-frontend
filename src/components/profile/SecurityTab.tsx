import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { useAuthContext } from '../../context/useAuthContext';
import type { UserProfile, LoginHistory } from '../../types/profile';

interface SecurityTabProps {
  profile: UserProfile;
}

export default function SecurityTab({ profile }: SecurityTabProps) {
  const [activeSection, setActiveSection] = useState<'password' | 'history' | 'logout' | 'delete'>('password');
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
    if (activeSection === 'history') {
      loadLoginHistory();
    }
  }, [activeSection]);

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      const history = await profileService.getLoginHistory();
      setLoginHistory(history);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử đăng nhập');
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
        <div className="profile-tab__header">
          <h2>Bảo mật</h2>
        </div>
        <div className="profile-message info">
          Tài khoản Google không thể đổi mật khẩu. Vui lòng quản lý mật khẩu qua Google.
        </div>
        <div className="security-sections">
          <button
            className="security-section-button"
            onClick={() => setActiveSection('history')}
          >
            📜 Lịch sử đăng nhập
          </button>
        </div>
        {activeSection === 'history' && (
          <div className="security-section">
            <h3>Lịch sử đăng nhập</h3>
            {loading ? (
              <p>Đang tải...</p>
            ) : loginHistory.length === 0 ? (
              <p>Chưa có lịch sử đăng nhập</p>
            ) : (
              <div className="login-history">
                {loginHistory.map((entry) => (
                  <div key={entry.id} className="login-history__item">
                    <div className="login-history__info">
                      <p><strong>IP:</strong> {entry.ipAddress}</p>
                      <p><strong>Thiết bị:</strong> {entry.userAgent || 'Không xác định'}</p>
                      <p><strong>Thời gian:</strong> {new Date(entry.loginTime).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="profile-tab">
      <div className="profile-tab__header">
        <h2>Bảo mật</h2>
      </div>

      {success && <div className="profile-message success">{success}</div>}
      {error && <div className="profile-message error">{error}</div>}

      <div className="security-sections">
        <button
          className={`security-section-button ${activeSection === 'password' ? 'active' : ''}`}
          onClick={() => setActiveSection('password')}
        >
          🔑 Đổi mật khẩu
        </button>
        <button
          className={`security-section-button ${activeSection === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSection('history')}
        >
          📜 Lịch sử đăng nhập
        </button>
        <button
          className={`security-section-button ${activeSection === 'logout' ? 'active' : ''}`}
          onClick={() => setActiveSection('logout')}
        >
          🚪 Đăng xuất tất cả
        </button>
        <button
          className={`security-section-button danger ${activeSection === 'delete' ? 'active' : ''}`}
          onClick={() => setActiveSection('delete')}
        >
          🗑️ Xóa tài khoản
        </button>
      </div>

      {activeSection === 'password' && (
        <div className="security-section">
          <h3>Đổi mật khẩu</h3>
          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="profile-form__group">
              <label>Mật khẩu hiện tại *</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="profile-form__group">
              <label>Mật khẩu mới *</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="profile-form__group">
              <label>Xác nhận mật khẩu mới *</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="profile-button primary" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      )}

      {activeSection === 'history' && (
        <div className="security-section">
          <h3>Lịch sử đăng nhập</h3>
          {loading ? (
            <p>Đang tải...</p>
          ) : loginHistory.length === 0 ? (
            <p>Chưa có lịch sử đăng nhập</p>
          ) : (
            <div className="login-history">
              {loginHistory.map((entry) => (
                <div key={entry.id} className="login-history__item">
                  <div className="login-history__info">
                    <p><strong>IP:</strong> {entry.ipAddress}</p>
                    <p><strong>Thiết bị:</strong> {entry.userAgent || 'Không xác định'}</p>
                    <p><strong>Thời gian:</strong> {new Date(entry.loginTime).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'logout' && (
        <div className="security-section">
          <h3>Đăng xuất tất cả thiết bị</h3>
          <p>Bạn sẽ bị đăng xuất khỏi tất cả thiết bị và cần đăng nhập lại.</p>
          <button
            className="profile-button danger"
            onClick={handleLogoutAll}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng xuất tất cả'}
          </button>
        </div>
      )}

      {activeSection === 'delete' && (
        <div className="security-section">
          <h3>Xóa tài khoản</h3>
          <p className="danger-text">
            ⚠️ Cảnh báo: Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
          </p>
          <form onSubmit={handleDeleteAccount} className="profile-form">
            <div className="profile-form__group">
              <label>Nhập mật khẩu để xác nhận *</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                placeholder="Nhập mật khẩu của bạn"
              />
            </div>
            <button type="submit" className="profile-button danger" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Xóa tài khoản vĩnh viễn'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

