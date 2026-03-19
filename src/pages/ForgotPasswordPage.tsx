import { useState } from 'react';
import { Link } from 'react-router-dom';
import RecaptchaNotice from '../components/RecaptchaNotice';
import { profileService } from '../services/profileService';
import { executeRecaptcha } from '../utils/recaptcha';
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const recaptchaToken = await executeRecaptcha('forgot_password');
      const response = await profileService.forgotPassword(email, recaptchaToken);
      setSuccess(response.message);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể gửi link đặt lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-card__header">
          <h2>Quên mật khẩu</h2>
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
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="Nhập email của bạn"
              />
            </div>
            <RecaptchaNotice className="rounded-xl bg-slate-50 border border-slate-200 p-3" />
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
