import { useState } from 'react';
import axios from 'axios';
import { useAuthContext } from '../context/useAuthContext';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config/api';

export default function GetOtpPage() {
  const { user, token } = useAuthContext();
  const [chatgptEmail, setChatgptEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chatgptEmail) {
      setError('Vui lòng nhập email ChatGPT');
      return;
    }

    setLoading(true);
    setError('');
    setOtp('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/chatgpt/get-otp`,
        { chatgptEmail },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      setOtp(response.data.otp);
      setCountdown(30);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lấy mã OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(otp);
    alert('✅ Đã sao chép mã OTP!');
  };

  if (!user) {
    return (
      <div className="otp-page-container">
        <div className="otp-card">
          <h2 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>
            Vui lòng đăng nhập
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>
            Bạn cần đăng nhập để sử dụng tính năng Get OTP
          </p>
          <Link to="/login" className="btn-primary">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="otp-page-container">
        <div className="otp-card">
          <div className="otp-header">
            <h1 className="otp-title">Get OTP ChatGPT</h1>
            <p className="otp-subtitle">Lấy mã OTP để đăng nhập ChatGPT</p>
          </div>

          <form onSubmit={handleGetOtp}>
            <div className="form-group">
              <label className="form-label">Email ChatGPT</label>
              <input
                type="email"
                value={chatgptEmail}
                onChange={(e) => setChatgptEmail(e.target.value)}
                placeholder="gptkeyt....@outlook.com.vn"
                disabled={loading}
                className="form-input"
              />
            </div>

            {error && (
              <div className="error-box">
                <p className="error-text">⚠️ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !chatgptEmail}
              className={`btn-submit ${loading || !chatgptEmail ? 'disabled' : ''}`}
            >
              {loading ? '🔄 Đang lấy mã...' : '🚀 Lấy mã OTP'}
            </button>
          </form>

          {otp && (
            <div className="otp-result">
              <p className="otp-result-label">✅ Mã OTP của bạn:</p>
              <div className="otp-code">{otp}</div>
              {countdown > 0 && (
                <p className="otp-countdown">⏱️ Mã có hiệu lực trong {countdown}s</p>
              )}
              <button onClick={handleCopyOtp} className="btn-copy">
                📋 Sao chép mã OTP
              </button>
            </div>
          )}

          <div className="back-link-container">
            <Link to="/" className="back-link">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .otp-page-container {
          min-height: 80vh;
          background: #ffffff;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .otp-card {
          background: #ffffff;
          padding: 2rem 1.5rem;
          max-width: 500px;
          width: 100%;
          text-align: center;
        }

        .otp-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .otp-title {
          color: #1f2937;
          font-size: clamp(1.5rem, 5vw, 2rem);
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .otp-subtitle {
          color: #6b7280;
          font-size: clamp(0.75rem, 3vw, 0.875rem);
        }

        .form-group {
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: clamp(0.75rem, 3vw, 0.875rem);
          font-weight: 600;
          color: #374151;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: clamp(0.875rem, 3.5vw, 1rem);
          transition: all 0.2s;
          outline: none;
          box-sizing: border-box;
        }

        .form-input:focus {
          border-color: #000000;
        }

        .error-box {
          padding: 1rem;
          background: #fee2e2;
          border-left: 4px solid #dc2626;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }

        .error-text {
          color: #991b1b;
          font-size: clamp(0.75rem, 3vw, 0.875rem);
          margin: 0;
        }

        .btn-submit {
          width: 100%;
          padding: 0.875rem;
          background: #000000;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: clamp(0.875rem, 3.5vw, 1rem);
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .btn-submit:hover:not(.disabled) {
          transform: translateY(-2px);
        }

        .btn-submit.disabled {
          background: #9ca3af;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-primary {
          display: inline-block;
          padding: 0.75rem 2rem;
          background: #000000;
          color: #ffffff;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s;
          font-size: clamp(0.875rem, 3.5vw, 1rem);
        }

        .otp-result {
          margin-top: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border-radius: 12px;
          border: 2px solid #10b981;
          text-align: center;
          animation: fadeIn 0.5s ease-in-out;
        }

        .otp-result-label {
          color: #065f46;
          font-size: clamp(0.75rem, 3vw, 0.875rem);
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .otp-code {
          font-size: clamp(2rem, 8vw, 3rem);
          font-weight: 700;
          font-family: monospace;
          color: #059669;
          letter-spacing: 0.3rem;
          margin-bottom: 1rem;
          word-break: break-all;
        }

        .otp-countdown {
          color: #047857;
          font-size: clamp(0.75rem, 3vw, 0.875rem);
          margin-bottom: 1rem;
        }

        .btn-copy {
          padding: 0.75rem 1.5rem;
          background: #ffffff;
          color: #059669;
          border: 2px solid #059669;
          border-radius: 8px;
          font-size: clamp(0.75rem, 3vw, 0.875rem);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }

        .btn-copy:hover {
          background: #059669;
          color: #ffffff;
        }

        .back-link-container {
          margin-top: 2rem;
          text-align: center;
        }

        .back-link {
          color: #6b7280;
          text-decoration: none;
          font-size: clamp(0.75rem, 3vw, 0.875rem);
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #000000;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .otp-card {
            padding: 1.5rem 1rem;
          }

          .otp-code {
            letter-spacing: 0.2rem;
          }
        }

        @media (max-width: 480px) {
          .otp-page-container {
            padding: 0.5rem;
          }

          .otp-card {
            padding: 1rem 0.75rem;
          }
        }
      `}</style>
    </>
  );
}
