import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../context/useAuthContext';
import { formatPrice } from '../utils/formatPrice';
import { profileService } from '../services/profileService';
import type { Order } from '../types/profile';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuthContext();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Thử load từ profileService trước (nếu user đã đăng nhập)
      if (token && user) {
        try {
          const data = await profileService.getOrder(id!);
          setOrder(data);
          setLoading(false);
          return;
        } catch (err) {
          // Nếu không tìm thấy trong profileService, thử load trực tiếp
        }
      }

      // Load trực tiếp từ API
      const response = await axios.get(`http://localhost:5000/api/orders/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setOrder(response.data);
    } catch (err: any) {
      console.error('❌ Lỗi khi tải chi tiết đơn hàng:', err);
      setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#059669';
      case 'pending':
        return '#d97706';
      case 'cancelled':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⏳</div>
        <p>Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Không tìm thấy đơn hàng</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{error || 'Đơn hàng không tồn tại hoặc bạn không có quyền xem.'}</p>
        <Link
          to="/profile"
          style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            background: '#2563eb',
            color: '#ffffff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          Xem tất cả đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#2563eb',
            textDecoration: 'none',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}
        >
          ← Quay lại danh sách đơn hàng
        </Link>
        <h1 style={{ color: '#1f2937', fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Chi tiết đơn hàng
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Mã đơn hàng: <strong>#{order._id.slice(-8).toUpperCase()}</strong>
        </p>
      </div>

      {/* Order Status Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${getStatusColor(order.status)}`
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.25rem', fontWeight: 600 }}>
              Trạng thái đơn hàng
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
              {new Date(order.createdAt).toLocaleString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: getStatusColor(order.status),
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            {getStatusText(order.status)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left Column - Order Items */}
        <div>
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '1.125rem', fontWeight: 600 }}>
              Sản phẩm đã đặt
            </h2>
            <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
              {order.items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    padding: '1rem 0',
                    borderBottom: index < order.items.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Số lượng: {item.quantity} x {formatPrice(item.price, item.currency)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>
                    {formatPrice(item.price * item.quantity, item.currency)}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '2px solid #e5e5e5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>Tổng tiền</span>
              <strong style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>
                {formatPrice(order.totalAmount, order.items[0]?.currency || 'VND')}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Column - Customer Info & Note */}
        <div>
          {/* Customer Info */}
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '1.125rem', fontWeight: 600 }}>
              Thông tin khách hàng
            </h2>
            <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Tên</div>
                <div style={{ fontWeight: 600, color: '#1f2937' }}>{order.customer.name}</div>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Email</div>
                <div style={{ fontWeight: 600, color: '#1f2937' }}>{order.customer.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Số điện thoại</div>
                <div style={{ fontWeight: 600, color: '#1f2937' }}>{order.customer.phone}</div>
              </div>
            </div>
          </div>

          {/* Note */}
          {order.note && (
            <div style={{ background: '#ffffff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '1.125rem', fontWeight: 600 }}>
                Ghi chú
              </h2>
              <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '6px', color: '#374151', whiteSpace: 'pre-line' }}>
                {order.note}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link
          to="/profile"
          style={{
            padding: '0.75rem 2rem',
            background: '#ffffff',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          Xem tất cả đơn hàng
        </Link>
        <Link
          to="/products"
          style={{
            padding: '0.75rem 2rem',
            background: '#2563eb',
            color: '#ffffff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}

