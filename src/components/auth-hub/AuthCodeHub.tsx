import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  KeyRound,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCw,
  ClipboardPaste,
  X,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuthContext } from '../../context/useAuthContext';
import chatgptIcon from '../../assets/icon-chatgpt.png';
import API_BASE_URL from '../../config/api';

export type AuthHubTab = 'chatgpt' | 'gemini' | '2fa';

interface AuthCodeHubProps {
  defaultTab?: AuthHubTab;
}

const STORAGE_KEY_EMAILS = 'keyt_recent_otp_emails';
const STORAGE_KEY_2FA = 'keyt_recent_2fa_keys';

const getTabFromPath = (pathname: string, fallback: AuthHubTab = 'chatgpt'): AuthHubTab => {
  const lower = pathname.toLowerCase();
  if (lower.includes('gemini')) return 'gemini';
  if (lower.includes('2fa')) return '2fa';
  if (lower.includes('chatgpt') || lower === '/get-otp' || lower.startsWith('/get-otp')) return 'chatgpt';
  return fallback;
};

export default function AuthCodeHub({ defaultTab = 'chatgpt' }: AuthCodeHubProps) {
  const { user, token } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<AuthHubTab>(() => {
    return getTabFromPath(location.pathname, defaultTab);
  });

  // Form states
  const [email, setEmail] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Countdown & Timer
  const [countdown, setCountdown] = useState(0);
  const [maxCountdown, setMaxCountdown] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Recent History
  const [recentEmails, setRecentEmails] = useState<string[]>([]);
  const [recentKeys, setRecentKeys] = useState<string[]>([]);

  // Refs for current inputs (used in interval auto-refresh)
  const emailRef = useRef('');
  const secretKeyRef = useRef('');
  useEffect(() => { emailRef.current = email; }, [email]);
  useEffect(() => { secretKeyRef.current = secretKey; }, [secretKey]);

  // Load recent history from localStorage
  useEffect(() => {
    try {
      const storedEmails = localStorage.getItem(STORAGE_KEY_EMAILS);
      if (storedEmails) setRecentEmails(JSON.parse(storedEmails));

      const storedKeys = localStorage.getItem(STORAGE_KEY_2FA);
      if (storedKeys) setRecentKeys(JSON.parse(storedKeys));
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const saveRecentEmail = (newEmail: string) => {
    if (!newEmail || !newEmail.includes('@')) return;
    try {
      const updated = [newEmail, ...recentEmails.filter((e) => e.toLowerCase() !== newEmail.toLowerCase())].slice(0, 3);
      setRecentEmails(updated);
      localStorage.setItem(STORAGE_KEY_EMAILS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const saveRecentKey = (newKey: string) => {
    if (!newKey || newKey.length < 8) return;
    try {
      const updated = [newKey, ...recentKeys.filter((k) => k !== newKey)].slice(0, 2);
      setRecentKeys(updated);
      localStorage.setItem(STORAGE_KEY_2FA, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Sync tab with URL if URL changes externally
  useEffect(() => {
    const expectedTab = getTabFromPath(location.pathname, defaultTab);
    if (expectedTab !== activeTab) {
      setActiveTab(expectedTab);
      setError('');
      setCode('');
      setCountdown(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [location.pathname, defaultTab, activeTab]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle Tab Switch
  const switchTab = (tab: AuthHubTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setError('');
    setCode('');
    setCountdown(0);
    if (timerRef.current) clearInterval(timerRef.current);

    if (tab === 'chatgpt') navigate('/get-otp', { replace: true });
    else if (tab === 'gemini') navigate('/get-otp-gemini', { replace: true });
    else if (tab === '2fa') navigate('/2falive', { replace: true });
  };

  // Main fetch code function
  const handleFetchCode = useCallback(async (isAutoRefresh = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (activeTab === 'chatgpt') {
      const targetEmail = emailRef.current.trim();
      if (!targetEmail) {
        setError('Vui lòng nhập email ChatGPT');
        return;
      }
      if (!isAutoRefresh) setLoading(true);
      setError('');

      try {
        const response = await axios.post(
          `${API_BASE_URL}/chatgpt/get-otp`,
          { chatgptEmail: targetEmail },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        setCode(response.data.otp);
        saveRecentEmail(targetEmail);

        const exp = response.data.expiresIn || 30;
        setMaxCountdown(exp);
        setCountdown(exp);

        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              handleFetchCode(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err: any) {
        setCode('');
        setError(err.response?.data?.message || 'Không thể lấy mã OTP ChatGPT. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    } else if (activeTab === 'gemini') {
      const targetEmail = emailRef.current.trim();
      if (!targetEmail) {
        setError('Vui lòng nhập email Gemini');
        return;
      }
      if (!isAutoRefresh) setLoading(true);
      setError('');

      try {
        const response = await axios.post(
          `${API_BASE_URL}/gemini/get-otp`,
          { geminiEmail: targetEmail },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        setCode(response.data.otp);
        saveRecentEmail(targetEmail);

        const exp = 30;
        setMaxCountdown(exp);
        setCountdown(exp);

        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              handleFetchCode(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err: any) {
        setCode('');
        setError(err.response?.data?.message || 'Không thể lấy mã OTP Gemini. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    } else if (activeTab === '2fa') {
      const targetKey = secretKeyRef.current.trim();
      if (!targetKey) {
        setError('Vui lòng nhập mã bí mật (Secret Key)');
        return;
      }
      if (!isAutoRefresh) setLoading(true);
      setError('');

      try {
        const response = await axios.post(
          `${API_BASE_URL}/chatgpt/generate-2fa`,
          { secretKey: targetKey },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        setCode(response.data.code);
        saveRecentKey(targetKey);

        const exp = response.data.expiresIn || 30;
        setMaxCountdown(exp);
        setCountdown(exp);

        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              handleFetchCode(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err: any) {
        setCode('');
        setError(err.response?.data?.message || 'Không thể tạo mã 2FA. Vui lòng kiểm tra lại Secret Key.');
      } finally {
        setLoading(false);
      }
    }
  }, [activeTab, token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchCode(false);
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (activeTab === '2fa') {
          setSecretKey(text.trim());
        } else {
          setEmail(text.trim());
        }
      }
    } catch {
      // Clipboard permissions denied
    }
  };

  // Circular countdown calculations
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = maxCountdown > 0 ? circumference - (countdown / maxCountdown) * circumference : 0;

  // Split code into digits for segmented box display
  const digits = code.trim().replace(/\s+/g, '').split('');

  if (!user) {
    return (
      <div className="auth-hub-page">
        <div className="auth-hub-card max-w-md mx-auto text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-16 h-16 bg-orange-50 text-[#F05A28] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <KeyRound size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Vui lòng đăng nhập</h2>
          <p className="text-slate-600 mb-6 text-sm">
            Bạn cần đăng nhập tài khoản để sử dụng công cụ lấy mã OTP & 2FA bảo mật.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full px-5 py-3 bg-[#F05A28] hover:bg-[#d84515] text-white font-semibold rounded-xl transition-colors shadow-md shadow-orange-500/20 cursor-pointer"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-hub-page">
      <div className="auth-hub-container">
        <div className="auth-hub-card">
          {/* Header Title */}
          <div className="auth-hub-header">
            <div className="auth-hub-icon-wrapper" key={`icon-${activeTab}`}>
              {activeTab === 'chatgpt' && (
                <img src={chatgptIcon} alt="ChatGPT" className="w-8 h-8 object-contain animate-fadeIn" />
              )}
              {activeTab === 'gemini' && (
                <svg width="32" height="32" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-fadeIn">
                  <path
                    d="M96 0C96 53.0193 53.0193 96 0 96C53.0193 96 96 138.981 96 192C96 138.981 138.981 96 192 96C138.981 96 96 53.0193 96 0Z"
                    fill="url(#gemini-hub-gradient)"
                  />
                  <defs>
                    <linearGradient id="gemini-hub-gradient" x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#4285F4" />
                      <stop offset="50%" stopColor="#9B72CB" />
                      <stop offset="100%" stopColor="#D96570" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
              {activeTab === '2fa' && <ShieldCheck size={32} className="text-violet-600 animate-fadeIn" />}
            </div>

            <h1 className="auth-hub-title animate-fadeIn" key={`title-${activeTab}`}>
              {activeTab === 'chatgpt' && 'Get OTP ChatGPT'}
              {activeTab === 'gemini' && 'Get OTP Gemini'}
              {activeTab === '2fa' && 'Get 2FA Live Code'}
            </h1>
            <p className="auth-hub-subtitle animate-fadeIn" key={`sub-${activeTab}`}>
              {activeTab === 'chatgpt' && 'Nhận mã OTP đăng nhập tài khoản ChatGPT nhanh chóng'}
              {activeTab === 'gemini' && 'Nhận mã xác thực OTP đăng nhập dịch vụ Google Gemini'}
              {activeTab === '2fa' && 'Tạo mã bảo mật 2 lớp (TOTP) tự động từ Secret Key'}
            </p>
          </div>

          {/* Segmented Tab Switcher with Animated Sliding Glider */}
          <div className="auth-hub-tabs" role="tablist">
            {/* Sliding Pill Indicator */}
            <div
              className={`auth-tab-glider tab-${activeTab}`}
              aria-hidden="true"
            />

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'chatgpt'}
              className={`auth-tab-btn cursor-pointer ${activeTab === 'chatgpt' ? 'active' : ''}`}
              onClick={() => switchTab('chatgpt')}
              aria-label="ChatGPT OTP"
            >
              <Sparkles size={16} className="auth-tab-icon" />
              <span>ChatGPT OTP</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'gemini'}
              className={`auth-tab-btn cursor-pointer ${activeTab === 'gemini' ? 'active' : ''}`}
              onClick={() => switchTab('gemini')}
              aria-label="Gemini OTP"
            >
              <svg width="15" height="15" viewBox="0 0 192 192" fill="none" className="auth-tab-icon">
                <path
                  d="M96 0C96 53.0193 53.0193 96 0 96C53.0193 96 96 138.981 96 192C96 138.981 138.981 96 192 96C138.981 96 96 53.0193 96 0Z"
                  fill="currentColor"
                />
              </svg>
              <span>Gemini OTP</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === '2fa'}
              className={`auth-tab-btn cursor-pointer ${activeTab === '2fa' ? 'active' : ''}`}
              onClick={() => switchTab('2fa')}
              aria-label="2FA Live"
            >
              <ShieldCheck size={16} className="auth-tab-icon" />
              <span>2FA Live</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-hub-form">
            {activeTab !== '2fa' ? (
              <div className="form-field-group animate-fadeIn" key={`email-group-${activeTab}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email tài khoản {activeTab === 'chatgpt' ? 'ChatGPT' : 'Gemini'}
                  </label>
                  {email && (
                    <button
                      type="button"
                      onClick={() => setEmail('')}
                      className="text-xs text-slate-600 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X size={13} /> Xóa
                    </button>
                  )}
                </div>

                <div className="auth-input-wrapper">
                  <Mail className="auth-input-leading-icon" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === 'chatgpt' ? 'ví dụ: user@example.com' : 'ví dụ: user@gmail.com'}
                    disabled={loading}
                    className="auth-input"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="auth-paste-btn"
                    title="Dán từ Clipboard"
                  >
                    <ClipboardPaste size={15} />
                    <span>Dán</span>
                  </button>
                </div>

                {/* Recent Emails Chips */}
                {recentEmails.length > 0 && (
                  <div className="recent-chips-container">
                    <span className="recent-chips-label">Gần đây:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {recentEmails.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setEmail(item)}
                          className={`recent-chip ${email === item ? 'selected' : ''}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="form-field-group animate-fadeIn" key="secret-group-2fa">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Mã bí mật (Secret Key)
                  </label>
                  {secretKey && (
                    <button
                      type="button"
                      onClick={() => setSecretKey('')}
                      className="text-xs text-slate-600 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X size={13} /> Xóa
                    </button>
                  )}
                </div>

                <div className="auth-input-wrapper">
                  <KeyRound className="auth-input-leading-icon" size={18} />
                  <input
                    type="text"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Dán mã bí mật (ví dụ: JBSWY3DPEHPK3PXP)"
                    disabled={loading}
                    className="auth-input font-mono"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="auth-paste-btn"
                    title="Dán từ Clipboard"
                  >
                    <ClipboardPaste size={15} />
                    <span>Dán</span>
                  </button>
                </div>

                {/* Recent Keys Chips */}
                {recentKeys.length > 0 && (
                  <div className="recent-chips-container">
                    <span className="recent-chips-label">Gần đây:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {recentKeys.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setSecretKey(item)}
                          className={`recent-chip font-mono ${secretKey === item ? 'selected' : ''}`}
                        >
                          {item.slice(0, 8)}...{item.slice(-4)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="auth-error-banner">
                <AlertCircle size={18} className="flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  <span>Đang kết nối lấy mã...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 animate-fadeIn" key={`btn-content-${activeTab}`}>
                  <KeyRound size={18} />
                  <span>
                    {activeTab === '2fa' ? 'Tạo mã 2FA Live' : 'Lấy mã OTP ngay'}
                  </span>
                </div>
              )}
            </button>
          </form>

          {/* Active Code Display Card (Light Modern Design System) */}
          {code && (
            <div className="auth-code-hero-card">
              {/* Status Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Mã đang hoạt động
                  </span>
                </div>

                {/* Radial Countdown Indicator */}
                {countdown > 0 && (
                  <div className="auth-radial-timer" title={`Hết hạn sau ${countdown} giây`}>
                    <svg className="w-10 h-10 transform -rotate-90">
                      <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        className="stroke-slate-200 fill-none"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        className="stroke-[#F05A28] fill-none transition-all duration-1000 ease-linear"
                        strokeWidth="3.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="auth-radial-text">{countdown}s</span>
                  </div>
                )}
              </div>

              {/* Segmented Digits or Code display */}
              <div className="auth-digits-container">
                {digits.length >= 4 && digits.length <= 8 ? (
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                    {digits.map((digit, idx) => (
                      <div key={idx} className="auth-digit-box">
                        {digit}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="auth-full-code-box">{code}</div>
                )}
              </div>

              {/* Copy Action Button */}
              <button
                type="button"
                onClick={handleCopy}
                className={`auth-copy-btn ${copied ? 'copied' : ''} cursor-pointer`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={18} className="text-white" />
                    <span>Đã sao chép vào bộ nhớ tạm!</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    <span>Sao chép mã xác thực</span>
                  </>
                )}
              </button>

              {/* Auto-refresh note */}
              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-500 font-medium">
                <RotateCw size={13} className={countdown <= 3 ? 'animate-spin text-[#F05A28]' : 'text-slate-400'} />
                <span>Mã sẽ tự động làm mới khi hết thời gian</span>
              </div>
            </div>
          )}

          {/* Quick Guide / Security Tip */}
          <div className="auth-tips-box">
            <Info size={16} className="text-[#F05A28] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Mẹo bảo mật:</strong> Hãy dán mã ngay vào trang đăng nhập của bạn. Nếu mã hết hạn hoặc báo sai, hệ thống sẽ tự động cập nhật mã mới theo thời gian thực.
            </p>
          </div>

          {/* Back link */}
          <div className="text-center mt-6">
            <Link to="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .auth-hub-page {
          min-height: 82vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1rem;
          background: radial-gradient(circle at 15% 15%, rgba(240, 90, 40, 0.05) 0%, transparent 45%),
                      radial-gradient(circle at 85% 85%, rgba(15, 23, 42, 0.06) 0%, transparent 50%),
                      #F8FAFC;
        }

        .auth-hub-container {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }

        .auth-hub-card {
          background: #FFFFFF;
          border-radius: 28px;
          padding: 2.25rem 2rem;
          box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08),
                      0 0 0 1px rgba(226, 232, 240, 0.8);
          position: relative;
        }

        .auth-hub-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .auth-hub-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 18px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          box-shadow: 0 8px 16px -4px rgba(15, 23, 42, 0.06);
          transition: transform 0.2s ease;
        }

        .auth-hub-icon-wrapper:hover {
          transform: scale(1.05);
        }

        .auth-hub-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.025em;
          margin: 0 0 0.35rem;
        }

        .auth-hub-subtitle {
          font-size: 0.875rem;
          color: #64748B;
          margin: 0;
          line-height: 1.4;
        }

        /* Segmented Tabs Container */
        .auth-hub-tabs {
          position: relative;
          display: flex;
          background: #F1F5F9;
          padding: 4px;
          border-radius: 16px;
          margin-bottom: 1.75rem;
          box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
          user-select: none;
          gap: 0;
        }

        /* Animated Sliding Pill / Glider */
        .auth-tab-glider {
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: 4px;
          width: calc((100% - 8px) / 3);
          border-radius: 12px;
          background: linear-gradient(180deg, #1E293B 0%, #0F172A 100%);
          box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.28),
                      0 1px 3px 0 rgba(15, 23, 42, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.12);
          pointer-events: none;
          z-index: 1;
          transition: transform 320ms cubic-bezier(0.34, 1.25, 0.64, 1);
          will-change: transform;
        }

        .auth-tab-glider.tab-chatgpt {
          transform: translateX(0%);
        }

        .auth-tab-glider.tab-gemini {
          transform: translateX(100%);
        }

        .auth-tab-glider.tab-2fa {
          transform: translateX(200%);
        }

        .auth-tab-btn {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 10px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #64748B;
          border: none;
          background: transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: color 240ms ease, transform 150ms ease;
        }

        .auth-tab-btn:active {
          transform: scale(0.96);
        }

        .auth-tab-btn:hover:not(.active) {
          color: #0F172A;
        }

        .auth-tab-btn.active {
          color: #FFFFFF;
          font-weight: 700;
        }

        .auth-tab-icon {
          transition: transform 320ms cubic-bezier(0.34, 1.4, 0.64, 1);
        }

        .auth-tab-btn.active .auth-tab-icon {
          transform: scale(1.12);
        }

        @keyframes authFadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: authFadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-tab-glider,
          .auth-tab-icon,
          .animate-fadeIn {
            transition: none !important;
            animation: none !important;
          }
        }

        /* Form */
        .form-field-group {
          margin-bottom: 1.25rem;
        }

        .auth-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-input-leading-icon {
          position: absolute;
          left: 14px;
          color: #94A3B8;
          pointer-events: none;
          transition: color 0.2s;
        }

        .auth-input {
          width: 100%;
          padding: 0.8125rem 4.5rem 0.8125rem 2.625rem;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          font-size: 0.9375rem;
          color: #0F172A;
          outline: none;
          transition: all 0.2s ease;
        }

        .auth-input:focus {
          background: #FFFFFF;
          border-color: #F05A28;
          box-shadow: 0 0 0 3px rgba(240, 90, 40, 0.12);
        }

        .auth-input-wrapper:focus-within .auth-input-leading-icon {
          color: #F05A28;
        }

        .auth-paste-btn {
          position: absolute;
          right: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #F05A28;
          background: #FFF7ED;
          border: 1px solid #FFEDD5;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .auth-paste-btn:hover {
          background: #FFEDD5;
          color: #C2410C;
        }

        /* Recent Chips */
        .recent-chips-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 0.625rem;
          font-size: 0.75rem;
        }

        .recent-chips-label {
          color: #94A3B8;
          font-weight: 500;
          flex-shrink: 0;
        }

        .recent-chip {
          padding: 2px 8px;
          border-radius: 6px;
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .recent-chip:hover {
          background: #E2E8F0;
          color: #0F172A;
        }

        .recent-chip.selected {
          background: #FFF7ED;
          border-color: #FDBA74;
          color: #EA580C;
          font-weight: 600;
        }

        /* Error Banner */
        .auth-error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0.75rem 1rem;
          background: #FEF2F2;
          border: 1px solid #FEE2E2;
          border-radius: 12px;
          color: #DC2626;
          font-size: 0.8125rem;
          font-weight: 500;
          margin-bottom: 1.25rem;
        }

        /* Submit Button */
        .auth-submit-btn {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #F05A28 0%, #EA580C 100%);
          color: #FFFFFF;
          font-size: 0.9375rem;
          font-weight: 700;
          border: none;
          border-radius: 14px;
          box-shadow: 0 10px 20px -5px rgba(240, 90, 40, 0.35);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 24px -5px rgba(240, 90, 40, 0.45);
        }

        .auth-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .auth-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Hero Code Display Card (Light Modern Design System) */
        .auth-code-hero-card {
          margin-top: 1.75rem;
          padding: 1.5rem 1.25rem;
          background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
          border-radius: 20px;
          border: 1.5px solid #E2E8F0;
          box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.08),
                      0 4px 12px -2px rgba(240, 90, 40, 0.05),
                      inset 0 1px 0 rgba(255, 255, 255, 1);
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(6px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .auth-radial-timer {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
        }

        .auth-radial-text {
          position: absolute;
          font-size: 0.75rem;
          font-weight: 800;
          color: #0F172A;
          font-family: monospace;
        }

        .auth-digits-container {
          margin: 1.25rem 0 1.25rem;
        }

        .auth-digit-box {
          flex: 1;
          max-width: 52px;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
          border: 2px solid #FED7AA;
          border-radius: 14px;
          font-size: 1.85rem;
          font-weight: 800;
          font-family: 'SF Mono', Consolas, Monaco, monospace;
          color: #0F172A;
          box-shadow: 0 4px 10px -2px rgba(240, 90, 40, 0.08),
                      0 2px 4px -1px rgba(15, 23, 42, 0.03);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .auth-digit-box:hover {
          border-color: #F05A28;
          transform: translateY(-2px);
          background: #FFFDFB;
          box-shadow: 0 8px 18px -3px rgba(240, 90, 40, 0.22);
        }

        .auth-full-code-box {
          padding: 1rem;
          background: #FFFFFF;
          border: 2px solid #FED7AA;
          border-radius: 14px;
          text-align: center;
          font-size: 1.75rem;
          font-weight: 800;
          font-family: monospace;
          color: #0F172A;
          letter-spacing: 4px;
          box-shadow: 0 4px 10px -2px rgba(240, 90, 40, 0.08);
        }

        .auth-copy-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0.85rem;
          background: linear-gradient(135deg, #F05A28 0%, #EA580C 100%);
          border: none;
          border-radius: 14px;
          color: #FFFFFF;
          font-size: 0.9375rem;
          font-weight: 700;
          box-shadow: 0 8px 18px -4px rgba(240, 90, 40, 0.35);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .auth-copy-btn:hover {
          background: linear-gradient(135deg, #FF6838 0%, #F05A28 100%);
          transform: translateY(-1.5px);
          box-shadow: 0 12px 22px -4px rgba(240, 90, 40, 0.45);
        }

        .auth-copy-btn:active {
          transform: translateY(0);
        }

        .auth-copy-btn.copied {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          box-shadow: 0 8px 18px -4px rgba(16, 185, 129, 0.4);
          color: #FFFFFF;
        }

        /* Tips Box */
        .auth-tips-box {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 0.875rem 1rem;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          margin-top: 1.5rem;
        }

        @media (max-width: 480px) {
          .auth-hub-card {
            padding: 1.75rem 1.25rem;
          }
          .auth-digit-box {
            max-width: 42px;
            height: 52px;
            font-size: 1.5rem;
          }
          .auth-tab-btn {
            font-size: 0.75rem;
            padding: 7px 6px;
          }
        }
      `}</style>
    </div>
  );
}
