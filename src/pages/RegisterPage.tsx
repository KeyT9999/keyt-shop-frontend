import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/useAuthContext';

export default function RegisterPage() {
  const { register, loading, error } = useAuthContext();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const navigate = useNavigate();

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
    try {
      await register(form);
      setSuccessEmail(form.email);
    } catch {
      // context đã set error
    }
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
              <h3>🎉 Đăng ký thành công!</h3>
              <p>
                Vui lòng kiểm tra hộp thư <strong>{successEmail}</strong> và nhấn vào link xác minh để kích
                hoạt tài khoản. Liên kết có hiệu lực trong 24 giờ.
              </p>
              <button type="button" className="auth-submit" onClick={() => navigate('/login')}>
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
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
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

