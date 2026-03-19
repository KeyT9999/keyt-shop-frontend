import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import RecaptchaNotice from '../components/RecaptchaNotice';
import { useAuthContext } from '../context/useAuthContext';
import { executeRecaptcha } from '../utils/recaptcha';

const useRipple = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  };

  return { buttonRef, createRipple };
};

export default function RegisterPage() {
  const { register, loginWithGoogle, loading, error } = useAuthContext();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const submitRipple = useRipple();
  const backRipple = useRipple();
  const isBusy = loading || submitting;

  useEffect(() => {
    const id = requestAnimationFrame(() => setCardVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.username || !form.email || !form.password) {
      setFormError('Điền đầy đủ thông tin');
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      const recaptchaToken = await executeRecaptcha('register');
      await register({ ...form, recaptchaToken });
      setSuccessEmail(form.email);
    } catch (err: any) {
      if (!err?.response) {
        setFormError(err?.message || 'Không thể xác minh reCAPTCHA. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response?.credential) {
      setFormError('Không nhận được token Google.');
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      const recaptchaToken = await executeRecaptcha('google_login');
      await loginWithGoogle(response.credential, recaptchaToken);
      navigate('/');
    } catch (err: any) {
      if (!err?.response) {
        setFormError(err?.message || 'Không thể xác minh reCAPTCHA. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setFormError('Không thể đăng ký bằng Google.');
  };

  return (
    <div className="auth-page">
      <div className={`auth-card ${cardVisible ? 'auth-card--visible' : ''}`}>
        <div className="auth-card__glow" />
        <div className="auth-card__header">
          <p className="auth-eyebrow">Thành viên mới</p>
          <h2>Tạo tài khoản Tiệm Tạp Hóa KeyT</h2>
        </div>

        <div className="auth-form-wrapper auth-form-wrapper--open">
          {successEmail ? (
            <div className="auth-success-box">
              <h3>Đăng ký thành công!</h3>
              <p>
                Vui lòng kiểm tra hộp thư <strong>{successEmail}</strong> và nhấn vào link xác minh để kích hoạt tài
                khoản. Liên kết có hiệu lực trong 24 giờ.
              </p>
              <button
                type="button"
                className="auth-submit"
                onClick={(event) => {
                  backRipple.createRipple(event);
                  setTimeout(() => navigate('/login'), 200);
                }}
                ref={backRipple.buttonRef}
              >
                Quay lại đăng nhập
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <label>
                Username
                <input
                  value={form.username}
                  onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  required
                />
              </label>
              {formError && <p className="auth-error">{formError}</p>}
              {error && <p className="auth-error">{error}</p>}
              <RecaptchaNotice className="rounded-xl bg-slate-50 border border-slate-200 p-3" />
              <button
                type="submit"
                className="auth-submit"
                disabled={isBusy}
                ref={submitRipple.buttonRef}
                onClick={submitRipple.createRipple}
              >
                {isBusy ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
              <div className="divider">
                <span>hoặc</span>
              </div>
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
            </form>
          )}
        </div>

        <p className="auth-helper">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
