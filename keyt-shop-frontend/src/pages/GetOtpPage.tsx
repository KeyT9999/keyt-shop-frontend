import { useState } from 'react';
import axios from 'axios';
import { useAuthContext } from '../context/useAuthContext';
import { Link } from 'react-router-dom';
import { Loader2, Mail, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import chatgptIcon from '../assets/icon-chatgpt.png';
import API_BASE_URL from '../config/api';

export default function GetOtpPage() {
  const { user, token } = useAuthContext();
  const { t } = useTranslation();
  const [chatgptEmail, setChatgptEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chatgptEmail) {
      setError(t('otp.email_placeholder'));
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
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(otp);
    alert(`✅ ${t('otp.copied')}`);
  };

  if (!user) {
    return (
      <div className="otp-page-container">
        <div className="otp-card">
          <h2 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>
            {t('auth.login_title')}
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>
            {t('otp.login_required')}
          </p>
          <Link to="/login" className="btn-primary">
            {t('otp.login_now')}
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
            <div className="brand-icon">
              <img src={chatgptIcon} alt="ChatGPT" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            </div>
            <h1 className="otp-title">{t('otp.title')}</h1>
            <p className="otp-subtitle">{t('otp.subtitle')}</p>
          </div>

          <form onSubmit={handleGetOtp} className="otp-form">
            <div className="form-group">
              <label className="form-label">{t('otp.email_placeholder')}</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  value={chatgptEmail}
                  onChange={(e) => setChatgptEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={loading}
                  className="form-input"
                />
              </div>
            </div>

            {error && (
              <div className="error-box">
                <AlertCircle size={20} className="error-icon" />
                <p className="error-text">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? (
                <div className="btn-content">
                  <Loader2 className="spinner" size={20} />
                  <span>{t('common.loading')}</span>
                </div>
              ) : (
                <div className="btn-content">
                  <span>🚀 {t('otp.get_otp')}</span>
                </div>
              )}
            </button>
          </form>

          {otp && (
            <div className="otp-result">
              <div className="result-header">
                <CheckCircle size={24} className="success-icon" />
                <p className="otp-result-label">{t('common.success')}!</p>
              </div>

              <div className="otp-display">
                <span className="otp-code">{otp}</span>
                <button onClick={handleCopyOtp} className="copy-btn-icon" title={t('otp.copy')}>
                  <Copy size={20} />
                </button>
              </div>

              {countdown > 0 && (
                <div className="countdown-bar">
                  <div className="progress" style={{ width: `${(countdown / 30) * 100}%` }}></div>
                  <p className="countdown-text">Expiring in {countdown}s</p>
                </div>
              )}
            </div>
          )}

          <div className="back-link-container">
            <Link to="/" className="back-link">
              ← {t('otp.back_home')}
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .otp-page-container {
          min-height: 80vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background-color: #f8fafc;
        }

        .otp-card {
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
        
        /* Decorative Background Blob */
        .otp-card::before {
             content: '';
             position: absolute;
             top: -50px;
             right: -50px;
             width: 150px;
             height: 150px;
             background: linear-gradient(135deg, rgba(255, 138, 0, 0.1), rgba(255, 92, 57, 0.1));
             border-radius: 50%;
             z-index: 0;
        }

        .otp-header {
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
        }

        .brand-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
          color: #f97316;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.1);
        }

        .otp-title {
          color: #1e293b;
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0 0 0.5rem;
          letter-spacing: -0.025em;
        }

        .otp-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
        }

        .otp-form {
          position: relative;
          z-index: 1;
          text-align: left;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #334155;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          transition: color 0.2s;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem !important; /* Force space for icon */
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          color: #1e293b;
          transition: all 0.2s ease;
          outline: none;
          background: #f8fafc;
        }

        .form-input:focus {
          border-color: #f97316; /* Orange focus */
          background: #fff;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1); /* Ring effect */
        }
        
        .input-wrapper:focus-within .input-icon {
            color: #f97316;
        }

        .error-box {
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
        
        .error-icon {
            flex-shrink: 0;
        }

        .error-text {
          font-size: 0.9rem;
          font-weight: 500;
          margin: 0;
        }

        .btn-submit {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.3), 0 2px 4px -1px rgba(249, 115, 22, 0.15);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-submit:hover:not(.disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4), 0 4px 6px -2px rgba(249, 115, 22, 0.2);
        }
        
        .btn-submit:active:not(.disabled) {
            transform: translateY(0) scale(0.98);
        }

        .btn-submit.disabled {
          background: #cbd5e1;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }
        
        .btn-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
        }
        
        .spinner {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Result Section */
        .otp-result {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 16px;
          animation: slideUp 0.4s ease-out;
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .result-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            color: #16a34a;
        }

        .otp-result-label {
          font-weight: 600;
          margin: 0;
        }

        .otp-display {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #ffffff;
            border: 2px dashed #86efac;
            padding: 0.75rem 1rem;
            border-radius: 12px;
            margin-bottom: 1rem;
        }

        .otp-code {
          font-size: 1.75rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          color: #15803d;
          letter-spacing: 4px;
        }
        
        .copy-btn-icon {
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.2s;
        }
        
        .copy-btn-icon:hover {
            background: #dcfce7;
            color: #15803d;
        }
        
        .countdown-bar {
            text-align: center;
        }
        
        .progress {
            height: 4px;
            background: #22c55e;
            border-radius: 2px;
            margin-bottom: 0.5rem;
            transition: width 1s linear;
        }

        .countdown-text {
          color: #15803d;
          font-size: 0.85rem;
          font-weight: 500;
          margin: 0;
        }

        .back-link-container {
          margin-top: 2rem;
        }

        .back-link {
          color: #64748b;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #0f172a;
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .otp-card {
            padding: 1.5rem;
          }
          .otp-title {
            font-size: 1.5rem;
          }
          .otp-code {
             font-size: 1.4rem; 
          }
        }
      `}</style>
    </>
  );
}
