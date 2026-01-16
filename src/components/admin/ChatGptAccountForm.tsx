import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { chatgptService } from '../../services/chatgptService';

interface ChatGptAccountFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: { _id?: string; chatgptEmail: string; secretKey: string };
  accountId?: string;
}

export default function ChatGptAccountForm({ onSuccess, onCancel, initialData, accountId }: ChatGptAccountFormProps) {
  const { token } = useAuthContext();
  const isEditMode = !!accountId || !!initialData?._id;
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
      if (isEditMode) {
        const id = accountId || initialData?._id;
        if (!id) {
          setError('Không tìm thấy ID tài khoản');
          setLoading(false);
          return;
        }
        const result = await chatgptService.updateAccount(
          id,
          {
            chatgptEmail: formData.chatgptEmail,
            secretKey: formData.secretKey
          },
          token!
        );
        setOtp(result.otp);
        setCountdown(30); // Bắt đầu đếm ngược 30 giây
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
        background: '#ffffff',
        /* No wrapping styles needed here as parent handles container */
      }}
    >
      <h3 style={{ color: '#1E293B', marginBottom: '24px', fontSize: '1.1rem', fontWeight: 700 }}>
        {isEditMode ? 'Chỉnh sửa tài khoản' : 'Thêm Email ChatGPT'}
      </h3>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#64748B', fontWeight: 500, fontSize: '0.9rem' }}>
          Email ChatGPT
        </label>
        <input
          type="email"
          value={formData.chatgptEmail}
          onChange={(e) => setFormData({ ...formData, chatgptEmail: e.target.value })}
          required
          placeholder="example@email.com"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            background: '#ffffff',
            color: '#1E293B',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#F05A28';
            e.target.style.boxShadow = '0 0 0 1px #F05A28';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#E2E8F0';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#64748B', fontWeight: 500, fontSize: '0.9rem' }}>
          Secret Key (2FA)
        </label>
        <input
          type="text"
          value={formData.secretKey}
          onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
          required
          placeholder="Nhập mã bí mật..."
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            background: '#ffffff',
            color: '#1E293B',
            fontFamily: 'monospace',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#F05A28';
            e.target.style.boxShadow = '0 0 0 1px #F05A28';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#E2E8F0';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#FEF2F2', borderRadius: '8px', color: '#B91C1C', marginBottom: '20px', border: '1px solid #FECACA', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {otp && (
        <div style={{
          padding: '24px',
          background: '#FFF7ED',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid #FFEDD5',
          textAlign: 'center'
        }}>
          <p style={{ color: '#9A3412', marginBottom: '12px', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mã xác thực 2FA
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#F05A28',
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
                padding: '8px 16px',
                background: copied ? '#10B981' : '#F05A28',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {copied ? '✓ Đã copy' : '📋 Copy'}
            </button>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: countdown && countdown <= 10 ? '#EF4444' : '#64748B',
            fontSize: '0.9rem',
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

      <div style={{ display: 'flex', gap: '12px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            background: loading ? '#94A3B8' : '#F05A28',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px -1px rgba(240, 90, 40, 0.2)'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.transform = 'none';
          }}
        >
          {loading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật tài khoản' : 'Thêm tài khoản'}
        </button>

        {otp && (
          <button
            type="button"
            onClick={handleSuccess}
            style={{
              padding: '12px 24px',
              background: '#10B981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
          >
            Hoàn tất
          </button>
        )}

        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '12px 24px',
            background: '#ffffff',
            color: '#64748B',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
        >
          Hủy bỏ
        </button>
      </div>
    </form>
  );
}
