import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const orderCode = searchParams.get('orderCode');
    const status = searchParams.get('status');
    const code = searchParams.get('code');

    if (!orderCode) {
      setError('Không tìm thấy mã đơn hàng');
      setLoading(false);
      return;
    }

    // Find order by PayOS orderCode
    findOrderByPayOSCode(orderCode, status, code);
  }, [searchParams]);

  const findOrderByPayOSCode = async (payosOrderCode: string, status: string | null, code: string | null) => {
    try {
      // Call API to find order by PayOS orderCode
      const response = await axios.get(`${API_BASE_URL}/payos/order-by-code/${payosOrderCode}`);
      
      if (response.data.success && response.data.order) {
        const orderId = response.data.order._id;
        // Redirect to order detail page with payment success param
        navigate(`/orders/${orderId}?payment=success`, { replace: true });
      } else {
        setError('Không tìm thấy đơn hàng');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error finding order:', err);
      setError(err.response?.data?.message || 'Không thể tìm thấy đơn hàng');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p>Đang xử lý thanh toán...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Lỗi</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{error}</p>
        <button
          onClick={() => navigate('/profile')}
          style={{
            padding: '0.75rem 2rem',
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Xem đơn hàng của tôi
        </button>
      </div>
    );
  }

  return null;
}

