import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { chatgptService } from '../../services/chatgptService';

interface ChatGptAccountFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: { chatgptEmail: string; secretKey: string };
}

export default function ChatGptAccountForm({ onSuccess, onCancel, initialData }: ChatGptAccountFormProps) {
  const { token } = useAuthContext();
  const [formData, setFormData] = useState({
    chatgptEmail: initialData?.chatgptEmail || '',
    secretKey: initialData?.secretKey || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

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
      if (initialData) {
        // Update mode - would need account ID
        alert('Update mode not implemented in this form');
      } else {
        const result = await chatgptService.addAccount(formData.chatgptEmail, formData.secretKey, token!);
        setOtp(result.otp);
        setCountdown(30); // Bắt đầu đếm ngược 30 giây
        // Không tự động đóng form, để user có thể copy mã
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setOtp(null);
    setCountdown(null);
    setFormData({ chatgptEmail: '', secretKey: '' });
    onSuccess();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e5e5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <h3 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Thêm Email ChatGPT</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: 500 }}>
          Email ChatGPT:
        </label>
        <input
          type="email"
          value={formData.chatgptEmail}
          onChange={(e) => setFormData({ ...formData, chatgptEmail: e.target.value })}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            background: '#ffffff',
            color: '#1f2937',
            fontSize: '1rem'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: 500 }}>
          Secret Key:
        </label>
        <input
          type="text"
          value={formData.secretKey}
          onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            background: '#ffffff',
            color: '#1f2937',
            fontFamily: 'monospace',
            fontSize: '1rem'
          }}
        />
      </div>

      {error && (
        <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '6px', color: '#dc2626', marginBottom: '1rem', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {otp && (
        <div style={{ 
          padding: '1.5rem', 
          background: '#eff6ff', 
          borderRadius: '8px', 
          marginBottom: '1rem', 
          border: '2px solid #2563eb',
          textAlign: 'center'
        }}>
          <p style={{ color: '#1e40af', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mã 2FA hiện tại:
          </p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <p style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#2563eb', 
              fontFamily: 'monospace',
              letterSpacing: '0.25rem',
              margin: 0
            }}>
              {otp}
            </p>
            <button
              type="button"
              onClick={handleCopyOtp}
              style={{
                padding: '0.5rem 1rem',
                background: copied ? '#10b981' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!copied) e.currentTarget.style.background = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                if (!copied) e.currentTarget.style.background = '#2563eb';
              }}
            >
              {copied ? '✓ Đã copy' : '📋 Copy'}
            </button>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.5rem',
            color: countdown && countdown <= 10 ? '#dc2626' : '#6b7280',
            fontSize: '0.875rem',
            fontWeight: countdown && countdown <= 10 ? 600 : 400
          }}>
            <span>⏱️</span>
            <span>
              {countdown !== null 
                ? `Mã còn hiệu lực trong ${countdown} giây` 
                : 'Mã này có hiệu lực trong 30 giây'}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: loading ? '#9ca3af' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = '#1d4ed8';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = '#2563eb';
          }}
        >
          {loading ? 'Đang xử lý...' : 'Thêm'}
        </button>
        {otp && (
          <button
            type="button"
            onClick={handleSuccess}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
          >
            Hoàn tất
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
        >
          Hủy
        </button>
      </div>
    </form>
  );
}

