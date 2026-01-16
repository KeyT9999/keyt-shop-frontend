import { useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { subscriptionService } from '../../services/subscriptionService';

interface SubscriptionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export default function SubscriptionForm({ onSuccess, onCancel, initialData }: SubscriptionFormProps) {
  const { token } = useAuthContext();
  const [formData, setFormData] = useState({
    customerEmail: initialData?.customerEmail || '',
    contactZalo: initialData?.contactZalo || '',
    contactInstagram: initialData?.contactInstagram || '',
    serviceName: initialData?.serviceName || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');

  // Parse và điền form từ paste text
  const handlePasteParse = (text: string) => {
    if (!text.trim()) return;

    const lines = text.trim().split('\n');
    const firstLine = lines[0].trim();
    if (!firstLine) return;

    // Try tab first, then 2+ spaces, then single spaces
    let parts = firstLine.split('\t');
    if (parts.length < 4) {
      parts = firstLine.split(/\s{2,}/);
    }
    if (parts.length < 4) {
      parts = firstLine.split(/\s+/);
    }

    if (parts.length < 4) {
      setError('Định dạng không đúng. Cần: email | tên dịch vụ | ngày bắt đầu (dd/MM/yyyy) | ngày kết thúc (dd/MM/yyyy)');
      return;
    }

    const email = parts[0].trim();
    const serviceName = parts[1].trim();
    const startStr = parts[2].trim();
    const endStr = parts[3].trim();

    // Convert date from dd/MM/yyyy to yyyy-MM-dd for date input
    const parseDate = (dateStr: string): string => {
      // Try dd/MM/yyyy format
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        if (day.length === 1 || day.length === 2) {
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      // If already in yyyy-MM-dd format, return as is
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
      }
      // Try other formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      return '';
    };

    setFormData({
      customerEmail: email,
      serviceName: serviceName,
      startDate: parseDate(startStr),
      endDate: parseDate(endStr),
      contactZalo: parts[4] ? parts[4].trim() : '',
      contactInstagram: parts[5] ? parts[5].trim() : ''
    });

    setPasteText('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (initialData) {
        await subscriptionService.update(initialData._id, formData, token!);
      } else {
        // Validate required fields for creation
        if (!formData.startDate || !formData.endDate) {
          setError('Vui lòng điền đầy đủ ngày bắt đầu và ngày kết thúc');
          setLoading(false);
          return;
        }
        const payload = {
          ...formData,
          startDate: formData.startDate,
          endDate: formData.endDate
        };
        await subscriptionService.create(payload, token!);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#ffffff',
        /* Container styling handled by parent */
      }}
    >
      <h3 style={{ color: '#1E293B', marginBottom: '24px', fontSize: '1.25rem', fontWeight: 700 }}>
        {initialData ? 'Chỉnh sửa Subscription' : 'Thêm Subscription mới'}
      </h3>

      {/* Paste Text Area - Auto Fill */}
      {!initialData && (
        <div style={{ marginBottom: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.9rem' }}>
            📋 Dán văn bản để tự động điền (định dạng: email | tên dịch vụ | ngày bắt đầu | ngày kết thúc)
          </label>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            onPaste={(e) => {
              setTimeout(() => {
                const text = e.currentTarget.value || e.clipboardData.getData('text');
                if (text) {
                  handlePasteParse(text);
                }
              }, 0);
            }}
            placeholder="phamvy1589@gmail.com	Canva Pro 1 Năm 	1/3/2025	1/3/2026"
            rows={3}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#ffffff',
              color: '#1E293B',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              outline: 'none',
              resize: 'vertical',
              transition: 'all 0.2s'
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
          <button
            type="button"
            onClick={() => handlePasteParse(pasteText)}
            disabled={!pasteText.trim()}
            style={{
              marginTop: '8px',
              padding: '8px 16px',
              background: pasteText.trim() ? '#F05A28' : '#CBD5E1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: pasteText.trim() ? 'pointer' : 'not-allowed',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Tự động điền
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
            Email khách hàng <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="email"
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            required
            placeholder="example@gmail.com"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#ffffff',
              color: '#1E293B',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s'
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

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
            Tên dịch vụ <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.serviceName}
            onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
            required
            placeholder="VD: Netflix Premium"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#ffffff',
              color: '#1E293B',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s'
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

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
            Ngày bắt đầu <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#ffffff',
              color: '#1E293B',
              fontSize: '0.95rem',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
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

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
            Ngày kết thúc <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#ffffff',
              color: '#1E293B',
              fontSize: '0.95rem',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
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

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
            Zalo
          </label>
          <input
            type="text"
            value={formData.contactZalo}
            onChange={(e) => setFormData({ ...formData, contactZalo: e.target.value })}
            placeholder="Số điện thoại hoặc link"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#ffffff',
              color: '#1E293B',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s'
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

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
            Instagram
          </label>
          <input
            type="text"
            value={formData.contactInstagram}
            onChange={(e) => setFormData({ ...formData, contactInstagram: e.target.value })}
            placeholder="Link hoặc username"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#ffffff',
              color: '#1E293B',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s'
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
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#FEF2F2', borderRadius: '8px', color: '#B91C1C', marginBottom: '24px', border: '1px solid #FECACA', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '12px 24px',
            background: '#ffffff',
            color: '#64748B',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 32px',
            background: loading ? '#94A3B8' : '#F05A28',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px -1px rgba(240, 90, 40, 0.2)'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(240, 90, 40, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(240, 90, 40, 0.2)';
            }
          }}
        >
          {loading ? 'Đang xử lý...' : initialData ? 'Cập nhật' : 'Thêm Subscription'}
        </button>
      </div>
    </form>
  );
}
