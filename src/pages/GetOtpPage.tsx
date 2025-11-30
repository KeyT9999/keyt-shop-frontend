import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/useAuthContext';
import { chatgptService } from '../services/chatgptService';

export default function GetOtpPage() {
  const { token } = useAuthContext();
  const [chatgptEmail, setChatgptEmail] = useState('');
  const [otp, setOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setOtp(null);
      setCountdown(null);
    }
  }, [countdown]);

  const handleCopyOtp = async () => {
    if (otp) {
      try {
        await navigator.clipboard.writeText(otp);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        alert('Không thể copy mã OTP');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOtp(null);
    setCountdown(null);
    setLoading(true);

    try {
      if (!token) {
        setError('Vui lòng đăng nhập để sử dụng tính năng này.');
        setLoading(false);
        return;
      }

      const response = await chatgptService.getOtp(chatgptEmail, token);
      setOtp(response.otp);
      setCountdown(30); // Bắt đầu đếm ngược 30 giây
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lấy mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ marginBottom: '2rem', color: '#1f2937', fontSize: '2rem', fontWeight: 700 }}>
          Lấy mã OTP ChatGPT
        </h1>
        
        <div style={{ 
          background: '#ffffff', 
          borderRadius: '12px', 
          padding: '2rem', 
          border: '1px solid #e5e5e5',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                color: '#1f2937',
                fontWeight: 600,
                fontSize: '1rem'
              }}>
                Email ChatGPT:
              </label>
              <input
                type="email"
                value={chatgptEmail}
                onChange={(e) => setChatgptEmail(e.target.value)}
                required
                placeholder="Nhập email ChatGPT của bạn"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#1f2937',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              />
              <p style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.875rem', 
                color: '#6b7280' 
              }}>
                Nhập email account GPT mà Shop cấp vào đây
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading || !token}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border: 'none',
                background: loading || !token ? '#9ca3af' : '#2563eb',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading || !token ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading && token) {
                  e.currentTarget.style.background = '#1d4ed8';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && token) {
                  e.currentTarget.style.background = '#2563eb';
                }
              }}
            >
              {loading ? 'Đang tải...' : !token ? 'Vui lòng đăng nhập' : 'Lấy mã OTP'}
            </button>
          </form>

          {error && (
            <div
              style={{
                padding: '1rem',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                marginBottom: '1rem'
              }}
            >
              <strong>⚠️ Lỗi:</strong> {error}
            </div>
          )}

          {!token && (
            <div
              style={{
                padding: '1rem',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                color: '#92400e',
                marginBottom: '1rem'
              }}
            >
              <strong>ℹ️ Thông báo:</strong> Bạn cần đăng nhập để sử dụng tính năng này.
            </div>
          )}
        </div>

        {otp && (
          <div
            style={{
              marginTop: '2rem',
              padding: '2.5rem',
              background: '#ffffff',
              border: '2px solid #2563eb',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
            }}
          >
            <div style={{ 
              marginBottom: '1rem',
              fontSize: '0.875rem',
              color: '#6b7280',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Mã OTP của bạn
            </div>
            <div
              style={{
                fontSize: '3.5rem',
                fontWeight: 'bold',
                textAlign: 'center',
                letterSpacing: '0.5rem',
                color: '#2563eb',
                marginBottom: '1.5rem',
                fontFamily: 'monospace',
                padding: '1rem',
                background: '#eff6ff',
                borderRadius: '8px',
                border: '1px solid #dbeafe'
              }}
            >
              {otp}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '0.5rem',
              color: countdown && countdown <= 10 ? '#dc2626' : '#6b7280',
              fontSize: '0.875rem',
              fontWeight: countdown && countdown <= 10 ? 600 : 400,
              marginBottom: '1.5rem'
            }}>
              <span>⏱️</span>
              <span>
                {countdown !== null 
                  ? `Mã còn hiệu lực trong ${countdown} giây` 
                  : 'Mã này có hiệu lực trong 30 giây'}
              </span>
            </div>
            <button
              onClick={handleCopyOtp}
              style={{
                padding: '0.75rem 1.5rem',
                background: copied ? '#10b981' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 auto'
              }}
              onMouseEnter={(e) => {
                if (!copied) e.currentTarget.style.background = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                if (!copied) e.currentTarget.style.background = '#2563eb';
              }}
            >
              {copied ? '✓ Đã copy' : '📋 Copy mã OTP'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

