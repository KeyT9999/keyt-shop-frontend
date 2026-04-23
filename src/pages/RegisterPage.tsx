import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuthContext } from '../context/useAuthContext';
import { executeRecaptcha } from '../utils/recaptcha';

export default function RegisterPage() {
  const { loginWithGoogle } = useAuthContext();
  const [formError, setFormError] = useState<string | null>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const id = requestAnimationFrame(() => setCardVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
    setFormError('Không thể đăng nhập bằng Google.');
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
          <div className="auth-form" style={{ gap: '1rem' }}>
            {/* Nút Google */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                shape="rectangular"
                text="signin_with"
                width="100%"
                locale="vi"
              />
            </div>

            {/* Dòng lưu ý */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                color: '#c2410c',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: '2px', color: '#F05A28' }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>
                <span style={{ fontWeight: 600 }}>Lưu ý:</span> Hãy đăng nhập bằng Google cá nhân của ní
              </p>
            </div>

            {/* Error message */}
            {formError && <p className="auth-error">{formError}</p>}
          </div>
        </div>

        <p className="auth-helper">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
