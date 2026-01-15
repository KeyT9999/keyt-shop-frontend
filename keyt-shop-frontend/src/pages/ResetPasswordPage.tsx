import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { profileService } from '../services/profileService';
import './ForgotPasswordPage.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!token) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-card">
          <div className="forgot-password-card__header">
            <h2>❌ Link không hợp lệ</h2>
          </div>
          <div className="forgot-password-card__content">
            <p>Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</p>
            <Link to="/forgot-password" className="forgot-password-button primary">
              Gửi lại link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await profileService.resetPassword(token, newPassword);
      setSuccess(response.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-card__header">
          <h2>🔒 Đặt lại mật khẩu</h2>
          <p>Nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        {error && <div className="forgot-password-message error">{error}</div>}
        {success && <div className="forgot-password-message success">{success}</div>}

        <div className="forgot-password-card__content">
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="forgot-password-form__group">
              <label>Mật khẩu mới *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div className="forgot-password-form__group">
              <label>Xác nhận mật khẩu *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Nhập lại mật khẩu"
              />
            </div>
            <button type="submit" className="forgot-password-button primary" disabled={loading}>
              {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

