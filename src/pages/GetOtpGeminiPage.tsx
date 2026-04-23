import { useState } from 'react';
import axios from 'axios';
import { useAuthContext } from '../context/useAuthContext';
import { Link } from 'react-router-dom';
import { Loader2, Mail, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../config/api';

export default function GetOtpGeminiPage() {
  const { user, token } = useAuthContext();
  const [geminiEmail, setGeminiEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!geminiEmail) {
      setError('Vui lòng nhập email Gemini');
      return;
    }

    setLoading(true);
    setError('');
    setOtp('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/gemini/get-otp`,
        { geminiEmail },
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
      setError(err.response?.data?.message || 'Không thể lấy mã OTP Gemini. Vui lòng thử lại.');
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
      <div className="gemini-otp-page-container">
        <div className="gemini-otp-card">
          <h2 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>
            Vui lòng đăng nhập
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>
            Bạn cần đăng nhập để sử dụng tính năng Get OTP Gemini
          </p>
          <Link to="/login" className="gemini-btn-primary">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="gemini-otp-page-container">
        <div className="gemini-otp-card">
          <div className="gemini-otp-header">
            <div className="gemini-brand-icon">
              {/* Gemini SVG Logo */}
              <svg width="36" height="36" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M96 0C96 53.0193 53.0193 96 0 96C53.0193 96 96 138.981 96 192C96 138.981 138.981 96 192 96C138.981 96 96 53.0193 96 0Z" fill="url(#gemini-gradient)"/>
                <defs>
                  <linearGradient id="gemini-gradient" x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4285F4"/>
                    <stop offset="50%" stopColor="#9B72CB"/>
                    <stop offset="100%" stopColor="#D96570"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="gemini-otp-title">Get OTP Gemini</h1>
            <p className="gemini-otp-subtitle">Nhập email Gemini để nhận mã OTP đăng nhập</p>
          </div>

          <form onSubmit={handleGetOtp} className="gemini-otp-form">
            <div className="gemini-form-group">
              <label className="gemini-form-label">Email Gemini</label>
              <div className="gemini-input-wrapper">
                <Mail className="gemini-input-icon" size={20} />
                <input
                  type="email"
                  value={geminiEmail}
                  onChange={(e) => setGeminiEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  disabled={loading}
                  className="gemini-form-input"
                />
              </div>
            </div>

            {error && (
              <div className="gemini-error-box">
                <AlertCircle size={20} className="gemini-error-icon" />
                <p className="gemini-error-text">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="gemini-btn-submit"
            >
              {loading ? (
                <div className="gemini-btn-content">
                  <Loader2 className="gemini-spinner" size={20} />
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                <div className="gemini-btn-content">
                  <span>✨ Lấy mã OTP</span>
                </div>
              )}
            </button>
          </form>

          {otp && (
            <div className="gemini-otp-result">
              <div className="gemini-result-header">
                <CheckCircle size={24} className="gemini-success-icon" />
                <p className="gemini-otp-result-label">Lấy mã thành công!</p>
              </div>

              <div className="gemini-otp-display">
                <span className="gemini-otp-code">{otp}</span>
                <button onClick={handleCopyOtp} className="gemini-copy-btn-icon" title="Sao chép">
                  <Copy size={20} />
                </button>
              </div>

              {countdown > 0 && (
                <div className="gemini-countdown-bar">
                  <div className="gemini-progress" style={{ width: `${(countdown / 30) * 100}%` }}></div>
                  <p className="gemini-countdown-text">Mã hết hạn sau {countdown}s</p>
                </div>
              )}
            </div>
          )}

          <div className="gemini-back-link-container">
            <Link to="/" className="gemini-back-link">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .gemini-otp-page-container {
          min-height: 80vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background-color: #f8fafc;
        }

        .gemini-otp-card {
          background: #ffffff;
          padding: 2.5rem;
          max-width: 480px;
          width: 100%;
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .gemini-otp-card::before {
          content: '';
          position: absolute;
          top: -50px;
          right: -50px;
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, rgba(66, 133, 244, 0.12), rgba(155, 114, 203, 0.12));
          border-radius: 50%;
          z-index: 0;
        }

        .gemini-otp-header {
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
        }

        .gemini-brand-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #eff6ff 0%, #f5f0ff 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          box-shadow: 0 4px 6px -1px rgba(66, 133, 244, 0.15);
        }

        .gemini-otp-title {
          color: #1e293b;
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0 0 0.5rem;
          letter-spacing: -0.025em;
        }

        .gemini-otp-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
        }

        .gemini-otp-form {
          position: relative;
          z-index: 1;
          text-align: left;
        }

        .gemini-form-group {
          margin-bottom: 1.5rem;
        }

        .gemini-form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #334155;
        }

        .gemini-input-wrapper {
          position: relative;
        }

        .gemini-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          transition: color 0.2s;
        }

        .gemini-form-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem !important;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          color: #1e293b;
          transition: all 0.2s ease;
          outline: none;
          background: #f8fafc;
        }

        .gemini-form-input:focus {
          border-color: #4285F4;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(66, 133, 244, 0.12);
        }

        .gemini-input-wrapper:focus-within .gemini-input-icon {
          color: #4285F4;
        }

        .gemini-error-box {
          padding: 0.75rem;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #dc2626;
        }

        .gemini-error-icon {
          flex-shrink: 0;
        }

        .gemini-error-text {
          font-size: 0.9rem;
          font-weight: 500;
          margin: 0;
        }

        .gemini-btn-submit {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #4285F4 0%, #9B72CB 60%, #D96570 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(66, 133, 244, 0.35), 0 2px 4px -1px rgba(66, 133, 244, 0.2);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gemini-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 15px -3px rgba(66, 133, 244, 0.45), 0 4px 6px -2px rgba(155, 114, 203, 0.3);
        }

        .gemini-btn-submit:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }

        .gemini-btn-submit:disabled {
          background: #cbd5e1;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .gemini-btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
        }

        .gemini-spinner {
          animation: gemini-spin 1s linear infinite;
        }

        @keyframes gemini-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .gemini-otp-result {
          margin-top: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #eff6ff 0%, #f5f0ff 100%);
          border: 1px solid #bfdbfe;
          border-radius: 16px;
          animation: gemini-slideUp 0.4s ease-out;
        }

        @keyframes gemini-slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gemini-result-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: #4285F4;
        }

        .gemini-success-icon {
          color: #4285F4;
        }

        .gemini-otp-result-label {
          font-weight: 600;
          margin: 0;
          color: #1d4ed8;
        }

        .gemini-otp-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          border: 2px dashed #93c5fd;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .gemini-otp-code {
          font-size: 1.75rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          background: linear-gradient(135deg, #4285F4, #9B72CB);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 4px;
        }

        .gemini-copy-btn-icon {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .gemini-copy-btn-icon:hover {
          background: #dbeafe;
          color: #4285F4;
        }

        .gemini-countdown-bar {
          text-align: center;
        }

        .gemini-progress {
          height: 4px;
          background: linear-gradient(90deg, #4285F4, #9B72CB);
          border-radius: 2px;
          margin-bottom: 0.5rem;
          transition: width 1s linear;
        }

        .gemini-countdown-text {
          color: #4285F4;
          font-size: 0.85rem;
          font-weight: 500;
          margin: 0;
        }

        .gemini-back-link-container {
          margin-top: 2rem;
        }

        .gemini-back-link {
          color: #64748b;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .gemini-back-link:hover {
          color: #0f172a;
          text-decoration: underline;
        }

        .gemini-btn-primary {
          display: inline-block;
          padding: 0.75rem 2rem;
          background: linear-gradient(135deg, #4285F4 0%, #9B72CB 100%);
          color: white;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
          box-shadow: 0 4px 6px -1px rgba(66, 133, 244, 0.3);
        }

        .gemini-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(66, 133, 244, 0.4);
        }

        @media (max-width: 640px) {
          .gemini-otp-card {
            padding: 1.5rem;
          }
          .gemini-otp-title {
            font-size: 1.5rem;
          }
          .gemini-otp-code {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </>
  );
}
