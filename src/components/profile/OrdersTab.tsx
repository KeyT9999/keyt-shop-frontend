import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import type { Order, OrderFilters } from '../../types/profile';
import { formatPrice } from '../../utils/formatPrice';
import { reviewService } from '../../services/reviewService';
import ReviewForm from '../ReviewForm';

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>({
    orderStatus: '',
    paymentStatus: '',
    startDate: '',
    endDate: '',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ productId: string; productName: string; productImage: string; orderId: string } | null>(null);

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getOrders(filters);
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof OrderFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filter changes
    }));
  };

  const handleDateRangeChange = (range: 'today' | 'this_month' | 'last_month' | 'custom') => {
    const now = new Date();
    let startDate = '';
    let endDate = '';

    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
    } else if (range === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (range === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    }

    setFilters(prev => ({
      ...prev,
      startDate,
      endDate,
      page: 1
    }));
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'confirmed':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return '';
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
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return '';
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

  const getOrderProgress = (order: Order): { step: number; totalSteps: number; percentage: number } => {
    const steps = ['pending', 'confirmed', 'processing', 'completed'];
    const currentStep = steps.indexOf(order.orderStatus);
    const totalSteps = steps.length;
    const percentage = ((currentStep + 1) / totalSteps) * 100;
    return { step: currentStep + 1, totalSteps, percentage };
  };

  const handleReviewClick = async (order: Order) => {
    try {
      const data = await reviewService.canReviewOrder(order._id);

      if (!data.canReview) {
        alert('Đơn hàng chưa hoàn thành hoặc không thể đánh giá');
        return;
      }

      // Find first product that hasn't been reviewed
      const unreviewedProduct = data.products.find(p => !p.hasReviewed);

      if (!unreviewedProduct) {
        alert('Bạn đã đánh giá tất cả sản phẩm trong đơn hàng này rồi!');
        return;
      }

      setSelectedProduct({
        productId: unreviewedProduct.productId,
        productName: unreviewedProduct.productName,
        productImage: unreviewedProduct.productImage,
        orderId: order._id
      });
      setShowReviewForm(true);
    } catch (err) {
      console.error('Error checking reviewable products:', err);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setSelectedProduct(null);
    loadOrders(); // Reload orders to update review status
  };

  const renderTimeline = (order: Order) => {
    const progress = getOrderProgress(order);
    const steps = [
      { key: 'pending', label: 'Chờ xử lý', date: order.createdAt },
      { key: 'confirmed', label: 'Đã xác nhận', date: order.confirmedAt },
      { key: 'processing', label: 'Đang xử lý', date: order.processingAt },
      { key: 'completed', label: 'Hoàn thành', date: order.completedAt }
    ];

    return (
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Tiến độ đơn hàng</span>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{Math.round(progress.percentage)}%</span>
        </div>
        <div style={{ position: 'relative', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progress.percentage}%`,
              background: progress.percentage === 100 ? '#10b981' : '#F05A28',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem' }}>
          {steps.map((step, index) => {
            const isActive = order.orderStatus === step.key ||
              (step.key === 'pending' && !order.confirmedAt) ||
              (step.key === 'confirmed' && order.confirmedAt && !order.processingAt) ||
              (step.key === 'processing' && order.processingAt && !order.completedAt);
            const isCompleted = steps.findIndex(s => s.key === order.orderStatus) > index;

            return (
              <div key={step.key} style={{ flex: 1, textAlign: 'center' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: isCompleted ? '#10b981' : isActive ? '#F05A28' : '#e5e7eb',
                    margin: '0 auto 0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompleted || isActive ? '#ffffff' : '#9ca3af',
                    fontSize: '0.625rem',
                    fontWeight: 600
                  }}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div style={{ color: isActive || isCompleted ? '#374151' : '#9ca3af', fontWeight: isActive ? 600 : 400 }}>
                  {step.label}
                </div>
                {step.date && (
                  <div style={{ fontSize: '0.625rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {new Date(step.date).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div className="profile-tab">
        <div className="profile-tab__header">
          <h2>Đơn hàng</h2>
        </div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="profile-tab">
        <div className="profile-tab__header">
          <h2>Đơn hàng</h2>
        </div>
        <div className="profile-message error">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-tab">
      <div className="profile-tab__header">
        <h2>Lịch sử đơn hàng</h2>
        {total > 0 && (
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Tổng cộng: {total} đơn hàng
          </p>
        )}
      </div>

      {/* Filters and Search */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
              Tìm kiếm (Mã đơn)
            </label>
            <input
              type="text"
              placeholder="Nhập mã đơn hàng..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Order Status Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
              Trạng thái đơn
            </label>
            <select
              value={filters.orderStatus || ''}
              onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
              Trạng thái thanh toán
            </label>
            <select
              value={filters.paymentStatus || ''}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="failed">Thanh toán thất bại</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
              Sắp xếp theo
            </label>
            <select
              value={filters.sortBy || 'date'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              <option value="date">Ngày tạo</option>
              <option value="amount">Tổng tiền</option>
              <option value="status">Trạng thái</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
              Thứ tự
            </label>
            <select
              value={filters.sortOrder || 'desc'}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>
          </div>
        </div>

        {/* Date Range Quick Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleDateRangeChange('today')}
            style={{
              padding: '0.5rem 1rem',
              background: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => handleDateRangeChange('this_month')}
            style={{
              padding: '0.5rem 1rem',
              background: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Tháng này
          </button>
          <button
            type="button"
            onClick={() => handleDateRangeChange('last_month')}
            style={{
              padding: '0.5rem 1rem',
              background: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Tháng trước
          </button>
          <button
            type="button"
            onClick={() => {
              setFilters(prev => ({ ...prev, startDate: '', endDate: '', page: 1 }));
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Xóa bộ lọc
          </button>
        </div>

        {/* Custom Date Range */}
        {(filters.startDate || filters.endDate) && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                Từ ngày
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                Đến ngày
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="profile-empty">
          <p>📦 Không tìm thấy đơn hàng nào</p>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card__header">
                  <div className="order-card__info">
                    <h3>
                      <Link
                        to={`/orders/${order._id}`}
                        style={{ color: '#E04815', textDecoration: 'none' }}
                      >
                        Đơn hàng #{order.orderCode || order._id.slice(-8).toUpperCase()}
                      </Link>
                    </h3>
                    <p className="order-card__date" style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      ID: {order._id.slice(-8).toUpperCase()} • {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div className={`order-card__status ${getOrderStatusColor(order.orderStatus)}`}>
                      {getOrderStatusText(order.orderStatus)}
                    </div>
                    <div className={`order-card__status ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {getPaymentStatusText(order.paymentStatus)}
                    </div>
                  </div>
                </div>

                {/* Timeline/Progress */}
                {renderTimeline(order)}

                <div className="order-card__items">
                  <p><strong>Sản phẩm:</strong></p>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.name} x{item.quantity} - {formatPrice(item.price, item.currency)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="order-card__footer">
                  <div className="order-card__total">
                    <strong>Tổng tiền: {formatPrice(order.totalAmount, order.items[0]?.currency || 'VND')}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {order.orderStatus === 'completed' && (
                      <button
                        type="button"
                        onClick={() => handleReviewClick(order)}
                        className="profile-button primary"
                        style={{
                          background: '#fbbf24',
                          color: '#1f2937',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}
                      >
                        ⭐ Đánh giá
                      </button>
                    )}
                    <Link
                      to={`/orders/${order._id}`}
                      className="profile-button secondary"
                      style={{ textDecoration: 'none', display: 'inline-block' }}
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                disabled={(filters.page || 1) === 1}
                style={{
                  padding: '0.5rem 1rem',
                  background: (filters.page || 1) === 1 ? '#e5e7eb' : '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: (filters.page || 1) === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Trước
              </button>
              <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#374151' }}>
                Trang {filters.page || 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handleFilterChange('page', Math.min(totalPages, (filters.page || 1) + 1))}
                disabled={(filters.page || 1) === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  background: (filters.page || 1) === totalPages ? '#e5e7eb' : '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: (filters.page || 1) === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Review Form Modal */}
      {showReviewForm && selectedProduct && (
        <ReviewForm
          productId={selectedProduct.productId}
          productName={selectedProduct.productName}
          productImage={selectedProduct.productImage}
          orderId={selectedProduct.orderId}
          onClose={() => {
            setShowReviewForm(false);
            setSelectedProduct(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
