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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (initialData) {
        await subscriptionService.update(initialData._id, formData, token!);
      } else {
        await subscriptionService.create(formData, token!);
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
        marginBottom: '2rem',
        padding: '1.5rem',
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e5e5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <h3 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
        {initialData ? 'Sửa Subscription' : 'Thêm Subscription'}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: 500 }}>Email khách hàng *</label>
          <input
            type="email"
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
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
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: 500 }}>Tên dịch vụ *</label>
          <input
            type="text"
            value={formData.serviceName}
            onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
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
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: 500 }}>Ngày bắt đầu *</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: 500 }}>Ngày kết thúc *</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: 500 }}>Zalo</label>
          <input
            type="text"
            value={formData.contactZalo}
            onChange={(e) => setFormData({ ...formData, contactZalo: e.target.value })}
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
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: 500 }}>Instagram</label>
          <input
            type="text"
            value={formData.contactInstagram}
            onChange={(e) => setFormData({ ...formData, contactInstagram: e.target.value })}
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
      </div>

      {error && (
        <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '6px', color: '#dc2626', marginBottom: '1rem', border: '1px solid #fecaca' }}>
          {error}
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
          {loading ? 'Đang xử lý...' : initialData ? 'Cập nhật' : 'Thêm'}
        </button>
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

