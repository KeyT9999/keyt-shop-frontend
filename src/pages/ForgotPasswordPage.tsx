import { useState } from 'react';
import { Link } from 'react-router-dom';
import { profileService } from '../services/profileService';
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await profileService.forgotPassword(email);
      setSuccess(response.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi link đặt lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-card__header">
          <h2>🔐 Quên mật khẩu</h2>
          <p>Nhập email và chúng mình sẽ gửi link đặt lại mật khẩu.</p>
        </div>

        {error && <div className="forgot-password-message error">{error}</div>}
        {success && <div className="forgot-password-message success">{success}</div>}

        <div className="forgot-password-card__content">
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="forgot-password-form__group">
              <label>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Nhập email của bạn"
              />
            </div>
            <button type="submit" className="forgot-password-button primary" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
            </button>
          </form>
        </div>

        <div className="forgot-password-card__footer">
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

