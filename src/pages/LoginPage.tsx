import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuthContext } from '../context/useAuthContext';
import { profileService } from '../services/profileService';

export default function LoginPage() {
  const { login, loginWithGoogle, loading, error, errorCode } = useAuthContext();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const id = requestAnimationFrame(() => setCardVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!credentials.username || !credentials.password) {
      setFormError('Điền đủ username và password');
      return;
    }
    setFormError(null);
    try {
      await login(credentials);
      navigate('/');
    } catch {
      // error message already saved in context
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response?.credential) {
      setFormError('Không nhận được token Google.');
      return;
    }

    setFormError(null);
    try {
      await loginWithGoogle(response.credential);
      navigate('/');
    } catch {
      // Axios error already handled inside AuthContext
    }
  };

  const handleGoogleError = () => {
    setFormError('Không thể đăng nhập bằng Google.');
  };

  const handleResendVerification = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resendEmail) {
      setResendMessage('Nhập email để nhận lại link xác minh.');
      return;
    }
    setResendLoading(true);
    setResendMessage(null);
    try {
      const response = await profileService.resendVerification(resendEmail);
      setResendMessage(response.message);
    } catch (err: any) {
      setResendMessage(err.response?.data?.message || 'Không thể gửi lại link xác minh.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-card ${cardVisible ? 'auth-card--visible' : ''}`}>
        <div className="auth-card__glow" />
        <div className="auth-card__header">
          <p className="auth-eyebrow">Chào mừng trở lại</p>
          <h2>Đăng nhập Tiệm Tạp Hóa KeyT</h2>
        </div>

        <div className="auth-form-wrapper auth-form-wrapper--open">
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Username
              <input
                value={credentials.username}
                onChange={(event) => setCredentials((prev) => ({ ...prev, username: event.target.value }))}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={credentials.password}
                onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </label>
            {formError && <p className="auth-error">{formError}</p>}
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
            <div className="divider">
              <span>hoặc</span>
            </div>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          </form>
        </div>

        {errorCode === 'EMAIL_NOT_VERIFIED' && (
          <div className="auth-form-wrapper auth-form-wrapper--open">
            <form onSubmit={handleResendVerification} className="auth-form">
              <p className="auth-error" style={{ marginTop: '0.5rem' }}>
                Tài khoản chưa xác minh email. Nhập email để nhận lại link xác minh.
              </p>
              <label>
                Email
                <input
                  type="email"
                  placeholder="Email của bạn"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
              </label>
              {resendMessage && <p className="auth-helper" style={{ color: '#a5b4fc' }}>{resendMessage}</p>}
              <button type="submit" className="auth-submit" disabled={resendLoading}>
                {resendLoading ? 'Đang gửi...' : 'Gửi lại link xác minh'}
              </button>
            </form>
          </div>
        )}

        <p className="auth-helper">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

