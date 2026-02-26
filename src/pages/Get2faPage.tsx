import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuthContext } from '../context/useAuthContext';
import { Link } from 'react-router-dom';
import { Loader2, Shield, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../config/api';

export default function Get2faPage() {
    const { user, token } = useAuthContext();
    const [secretKey, setSecretKey] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const secretRef = useRef('');

    // Keep ref in sync for auto-refresh
    useEffect(() => { secretRef.current = secretKey; }, [secretKey]);

    // Cleanup timer on unmount
    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    const generate = useCallback(async (secret?: string) => {
        const key = secret ?? secretRef.current;
        if (!key.trim()) {
            setError('Vui lòng nhập mã bí mật 2FA');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post(
                `${API_BASE_URL}/chatgpt/generate-2fa`,
                { secretKey: key },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );

            setCode(data.code);
            setCopied(false);

            // Start countdown
            if (timerRef.current) clearInterval(timerRef.current);
            setCountdown(data.expiresIn);
            timerRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        // Auto-refresh when expired
                        if (timerRef.current) clearInterval(timerRef.current);
                        generate();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err: any) {
            setCode('');
            setError(err.response?.data?.message || 'Không thể tạo mã 2FA. Vui lòng kiểm tra lại mã bí mật.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        generate(secretKey);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!user) {
        return (
            <div className="otp-page-container">
                <div className="otp-card">
                    <h2 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>
                        Vui lòng đăng nhập
                    </h2>
                    <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>
                        Bạn cần đăng nhập để sử dụng tính năng Get 2FA
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
                        <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)' }}>
                            <Shield size={32} color="#7c3aed" />
                        </div>
                        <h1 className="otp-title">Get 2FA Code</h1>
                        <p className="otp-subtitle">Dán mã bí mật để lấy mã xác thực 2 lớp</p>
                    </div>

                    <form onSubmit={handleSubmit} className="otp-form">
                        <div className="form-group">
                            <label className="form-label">Mã bí mật (Secret Key)</label>
                            <textarea
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                placeholder="Ví dụ: 5dpj 3fan yddp br4l gd6t b37g 7jcc 57nb"
                                disabled={loading}
                                className="form-input"
                                rows={3}
                                style={{
                                    resize: 'none',
                                    fontFamily: "'Courier New', monospace",
                                    fontSize: '0.95rem',
                                    letterSpacing: '1px',
                                    padding: '0.75rem 1rem',
                                }}
                            />
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
                            style={{ background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
                        >
                            {loading ? (
                                <div className="btn-content">
                                    <Loader2 className="spinner" size={20} />
                                    <span>Đang xử lý...</span>
                                </div>
                            ) : (
                                <div className="btn-content">
                                    <span>🔐 Lấy mã 2FA</span>
                                </div>
                            )}
                        </button>
                    </form>

                    {code && (
                        <div className="otp-result" style={{ background: '#f5f3ff', border: '1px solid #c4b5fd' }}>
                            <div className="result-header" style={{ color: '#7c3aed' }}>
                                <CheckCircle size={24} />
                                <p className="otp-result-label">Lấy mã thành công!</p>
                            </div>

                            <div className="otp-display" style={{ borderColor: '#c4b5fd' }}>
                                <span className="otp-code" style={{ color: '#5b21b6' }}>{code}</span>
                                <button onClick={handleCopy} className="copy-btn-icon" title="Sao chép">
                                    {copied ? <CheckCircle size={20} color="#7c3aed" /> : <Copy size={20} />}
                                </button>
                            </div>

                            {countdown > 0 && (
                                <div className="countdown-bar">
                                    <div className="progress" style={{ width: `${(countdown / 30) * 100}%`, background: '#7c3aed' }} />
                                    <p className="countdown-text" style={{ color: '#6d28d9' }}>
                                        Mã mới sau {countdown}s
                                    </p>
                                </div>
                            )}
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
        .otp-card::before {
          content: '';
          position: absolute;
          top: -50px;
          right: -50px;
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(109, 40, 217, 0.1));
          border-radius: 50%;
          z-index: 0;
        }
        .otp-header { margin-bottom: 2rem; position: relative; z-index: 1; }
        .brand-icon {
          width: 64px; height: 64px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.25rem;
          box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.1);
        }
        .otp-title { color: #1e293b; font-size: 1.75rem; font-weight: 800; margin: 0 0 0.5rem; letter-spacing: -0.025em; }
        .otp-subtitle { color: #64748b; font-size: 0.95rem; margin: 0; }
        .otp-form { position: relative; z-index: 1; text-align: left; }
        .form-group { margin-bottom: 1.5rem; }
        .form-label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 600; color: #334155; }
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          color: #1e293b;
          transition: all 0.2s ease;
          outline: none;
          background: #f8fafc;
          box-sizing: border-box;
        }
        .form-input:focus {
          border-color: #7c3aed;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
        }
        .error-box {
          padding: 0.75rem; background: #fef2f2; border: 1px solid #fee2e2;
          border-radius: 8px; margin-bottom: 1.5rem;
          display: flex; align-items: center; gap: 0.75rem; color: #dc2626;
        }
        .error-icon { flex-shrink: 0; }
        .error-text { font-size: 0.9rem; font-weight: 500; margin: 0; }
        .btn-submit {
          width: 100%; padding: 0.875rem;
          color: white; border: none; border-radius: 12px;
          font-size: 1rem; font-weight: 700; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.3);
          display: flex; align-items: center; justify-content: center;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px) scale(1.02); }
        .btn-submit:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .btn-content { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .otp-result {
          margin-top: 2rem; padding: 1.5rem; border-radius: 16px;
          animation: slideUp 0.4s ease-out;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .result-header { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; }
        .otp-result-label { font-weight: 600; margin: 0; }
        .otp-display {
          display: flex; align-items: center; justify-content: space-between;
          background: #ffffff; border: 2px dashed; padding: 0.75rem 1rem; border-radius: 12px; margin-bottom: 1rem;
        }
        .otp-code { font-size: 1.75rem; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 4px; }
        .copy-btn-icon {
          background: none; border: none; color: #94a3b8; cursor: pointer;
          padding: 8px; border-radius: 8px; transition: all 0.2s;
        }
        .copy-btn-icon:hover { background: #ede9fe; color: #7c3aed; }
        .countdown-bar { text-align: center; }
        .progress { height: 4px; border-radius: 2px; margin-bottom: 0.5rem; transition: width 1s linear; }
        .countdown-text { font-size: 0.85rem; font-weight: 500; margin: 0; }
        .back-link-container { margin-top: 2rem; }
        .back-link { color: #64748b; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
        .back-link:hover { color: #0f172a; text-decoration: underline; }
        @media (max-width: 640px) {
          .otp-card { padding: 1.5rem; }
          .otp-title { font-size: 1.5rem; }
          .otp-code { font-size: 1.4rem; }
        }
      `}</style>
        </>
    );
}
