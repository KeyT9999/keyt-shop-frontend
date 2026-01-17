import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../context/useAuthContext';
import { formatPrice } from '../utils/formatPrice';
import { profileService } from '../services/profileService';
import { payosService } from '../services/payosService';
import OrderFeedbackModal from '../components/order/OrderFeedbackModal';
import type { Order } from '../types/profile';
import API_BASE_URL from '../config/api';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user, token } = useAuthContext();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  // Check URL param for payment status and auto-refresh payment info
  useEffect(() => {
    const paymentParam = searchParams.get('payment');
    if (paymentParam === 'success' && order && token && user) {
      setProcessingPayment(true);
      // Auto check payment status when returning from PayOS
      loadPaymentInfo();
      // Remove payment param from URL after processing
      setTimeout(() => {
        navigate(`/orders/${id}`, { replace: true });
        setProcessingPayment(false);
      }, 2000);
    } else if (paymentParam === 'cancelled') {
      // Remove cancelled param from URL
      setTimeout(() => {
        navigate(`/orders/${id}`, { replace: true });
      }, 1000);
    }
  }, [searchParams, order, token, user, id, navigate]);

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
      const response = await axios.get(`${API_BASE_URL}/orders/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const orderData = response.data;
      setOrder(orderData);

      // Load payment info if order exists and user is logged in (to get latest status)
      // Only load if order payment is pending and we don't have checkoutUrl yet
      if (orderData && token && user && orderData.paymentStatus === 'pending' && !orderData.checkoutUrl) {
        loadPaymentInfo();
      }
    } catch (err: any) {
      console.error('❌ Lỗi khi tải chi tiết đơn hàng:', err);
      setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#059669';
      case 'processing':
        return '#2563eb';
      case 'confirmed':
        return '#7c3aed';
      case 'pending':
        return '#d97706';
      case 'cancelled':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#059669';
      case 'pending':
        return '#d97706';
      case 'failed':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'failed':
        return 'Thanh toán thất bại';
      default:
        return status;
    }
  };

  const loadPaymentInfo = async () => {
    if (!id || !token) return;

    try {
      const paymentInfo = await payosService.getPaymentInfo(id, token);
      if (paymentInfo.success) {
        // Update order status if payment was completed
        if (paymentInfo.paymentInfo?.status === 'PAID' && order && order.paymentStatus !== 'paid') {
          setOrder({ ...order, paymentStatus: 'paid' });
          // Reload order to get latest data
          loadOrder();
        } else if (order && paymentInfo.order) {
          // Reload order to get latest status from backend
          loadOrder();
        }
      }
    } catch (err) {
      console.error('Error loading payment info:', err);
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem', background: '#f5f5f5', minHeight: '100vh' }}>
      <style>{`
        @media (min-width: 768px) {
          .order-detail-container {
            padding: 2rem !important;
          }
          .order-detail-header h1 {
            font-size: 1.875rem !important;
          }
          .order-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .timeline-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
        @media (max-width: 767px) {
          .order-detail-container {
            padding: 1rem !important;
          }
          .order-detail-header h1 {
            font-size: 1.5rem !important;
          }
          .order-grid {
            grid-template-columns: 1fr !important;
          }
          .timeline-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
          }
          .timeline-step {
            font-size: 0.75rem !important;
          }
          .action-buttons {
            flex-direction: column !important;
          }
          .action-buttons button,
          .action-buttons a {
            width: 100% !important;
          }
          .bottom-links {
            flex-direction: column !important;
          }
          .bottom-links a {
            width: 100% !important;
            text-align: center !important;
          }
        }
      `}</style>
      {/* Header */}
      <div className="order-detail-header" style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#2563eb',
            textDecoration: 'none',
            marginBottom: '0.75rem',
            fontSize: '0.875rem'
          }}
        >
          ← Quay lại danh sách đơn hàng
        </Link>
        <h1 className="order-detail-header" style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Chi tiết đơn hàng
        </h1>
        <p style={{ color: '#1f2937', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>
          Mã đơn hàng: <span style={{ color: '#2563eb', fontSize: '1.125rem' }}>#{order.orderCode || order._id.slice(-8).toUpperCase()}</span>
        </p>
        <p style={{ color: '#9ca3af', fontSize: '0.7rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          ID: {order._id.slice(-8).toUpperCase()}
        </p>
      </div>

      {/* Order Status Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${getOrderStatusColor(order.orderStatus)}`
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Trạng thái đơn hàng
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
            Tạo lúc: {new Date(order.createdAt).toLocaleString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: getOrderStatusColor(order.orderStatus),
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            {getOrderStatusText(order.orderStatus)}
          </div>
          <div
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: getPaymentStatusColor(order.paymentStatus),
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            {getPaymentStatusText(order.paymentStatus)}
          </div>
        </div>

        {/* Enhanced Timeline */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e5e5' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
            Tiến độ đơn hàng
          </h3>
          {(() => {
            const steps = [
              {
                key: 'pending',
                label: 'Chờ xử lý',
                icon: '📦',
                date: order.createdAt,
                completed: true
              },
              {
                key: 'confirmed',
                label: 'Đã xác nhận',
                icon: '✓',
                date: order.confirmedAt,
                completed: !!order.confirmedAt,
                by: typeof order.confirmedBy === 'object' ? order.confirmedBy?.username : undefined
              },
              {
                key: 'processing',
                label: 'Đang xử lý',
                icon: '⚙️',
                date: order.processingAt,
                completed: !!order.processingAt
              },
              {
                key: 'completed',
                label: 'Hoàn thành',
                icon: '✅',
                date: order.completedAt,
                completed: !!order.completedAt
              }
            ];

            const currentStepIndex = steps.findIndex(s => s.key === order.orderStatus);
            const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

            return (
              <>
                {/* Progress Bar */}
                <div style={{ position: 'relative', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${progressPercentage}%`,
                      background: progressPercentage === 100 ? '#10b981' : '#3b82f6',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>

                {/* Timeline Steps */}
                <div className="timeline-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {steps.map((step, index) => {
                    const isActive = step.key === order.orderStatus;
                    const isCompleted = step.completed && index <= currentStepIndex;

                    return (
                      <div key={step.key} className="timeline-step" style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: isCompleted ? '#10b981' : isActive ? '#3b82f6' : '#e5e7eb',
                            margin: '0 auto 0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            color: isCompleted || isActive ? '#ffffff' : '#9ca3af',
                            fontWeight: 600,
                            border: isActive && !isCompleted ? '3px solid #93c5fd' : 'none',
                            boxSizing: 'border-box'
                          }}
                        >
                          {isCompleted ? '✓' : step.icon}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: isActive ? 600 : 400, color: isActive || isCompleted ? '#374151' : '#9ca3af', marginBottom: '0.25rem' }}>
                          {step.label}
                        </div>
                        {step.date && (
                          <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>
                            {new Date(step.date).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                        {step.by && (
                          <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            bởi {step.by}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      <div className="order-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
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
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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
            <div style={{ background: '#ffffff', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '1.125rem', fontWeight: 600 }}>
                Ghi chú khách hàng
              </h2>
              <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '6px', color: '#374151', whiteSpace: 'pre-line' }}>
                {order.note}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {order.adminNotes && (
            <div style={{ background: '#ffffff', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '1.125rem', fontWeight: 600 }}>
                Ghi chú nội bộ
              </h2>
              <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '6px', color: '#374151', whiteSpace: 'pre-line', borderLeft: '3px solid #f59e0b' }}>
                {order.adminNotes}
              </div>
            </div>
          )}

          {/* Payment Processing Message - Show when returning from PayOS */}
          {processingPayment && (
            <div style={{ background: '#dbeafe', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
              <p style={{ color: '#1e40af', textAlign: 'center', fontWeight: 500 }}>
                ⏳ Đang xử lý thanh toán, vui lòng đợi...
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: '#ffffff', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
            Thao tác
          </h3>
          <div className="action-buttons" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                window.open(`/orders/${order._id}/invoice`, '_blank');
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
            >
              🧾 Xem hóa đơn
            </button>
            <a
              href="https://zalo.me/84868899104"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#0068FF',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#0052CC'}
              onMouseOut={(e) => e.currentTarget.style.background = '#0068FF'}
            >
              💬 Liên hệ hỗ trợ Zalo
            </a>
            {order.orderStatus === 'completed' && (() => {
              // Kiểm tra xem đã đánh giá tất cả sản phẩm chưa
              const allItemsReviewed = order.items.every(item => item.feedback && item.feedback.rating > 0);
              const firstProductId = order.items[0]?.productId;

              if (allItemsReviewed && firstProductId) {
                // Nếu đã đánh giá hết, hiển thị nút "Xem đánh giá"
                return (
                  <Link
                    to={`/products/${firstProductId}#reviews`}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#f59e0b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-block',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#d97706'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#f59e0b'}
                  >
                    ⭐ Xem đánh giá
                  </Link>
                );
              } else {
                // Nếu chưa đánh giá hết, hiển thị nút "Đánh giá sản phẩm"
                return (
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
                  >
                    ⭐ Đánh giá sản phẩm
                  </button>
                );
              }
            })()}
          </div>
        </div>

        <div className="bottom-links" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
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

      {/* Feedback Modal */}
      {showFeedbackModal && order && (
        <OrderFeedbackModal
          order={order}
          onClose={() => setShowFeedbackModal(false)}
          onSuccess={() => {
            // Reload order to get updated feedback
            loadOrder();
          }}
        />
      )}
    </div>
  );
}

