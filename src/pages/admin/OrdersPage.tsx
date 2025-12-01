import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import type { OrderStats, OrdersListResponse, OrderFilters } from '../../types/admin';
import type { Order } from '../../types/profile';
import { formatPrice } from '../../utils/formatPrice';

export default function OrdersPage() {
  const { token, user } = useAuthContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [ordersData, setOrdersData] = useState<OrdersListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    if (token && user?.admin) {
      loadStats();
      loadOrders();
    }
  }, [token, user]);

  useEffect(() => {
    if (token && user?.admin) {
      loadOrders();
    }
  }, [filters]);

  const loadStats = async () => {
    try {
      const data = await adminService.getOrderStats(token!);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getOrders(filters, token!);
      setOrdersData(data);
    } catch (err) {
      console.error('Error loading orders:', err);
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

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (!user?.admin) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#1f2937' }}>
          <h1>403 - Không có quyền truy cập</h1>
          <p>Bạn cần quyền Admin để truy cập trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#1f2937', marginBottom: '2rem' }}>Quản lý Đơn hàng</h1>

        {/* Stats Cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Đơn hôm nay</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>
                {stats.todayOrders}
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Chờ xác nhận</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d97706', margin: 0 }}>
                {stats.pendingConfirmation}
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Đang xử lý</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>
                {stats.processing}
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Doanh thu hôm nay</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', margin: 0 }}>
                {formatPrice(stats.todayRevenue, 'VND')}
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Doanh thu tháng</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', margin: 0 }}>
                {formatPrice(stats.monthRevenue, 'VND')}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>Tìm kiếm</label>
              <input
                type="text"
                placeholder="Order ID, tên, email, SĐT..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>Trạng thái đơn</label>
              <select
                value={filters.orderStatus || ''}
                onChange={(e) => handleFilterChange('orderStatus', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
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

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>Trạng thái thanh toán</label>
              <select
                value={filters.paymentStatus || ''}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
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

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>Sắp xếp theo</label>
              <select
                value={filters.sortBy || 'date'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
              >
                <option value="date">Ngày tạo</option>
                <option value="amount">Tổng tiền</option>
                <option value="status">Trạng thái</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>Thứ tự</label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
              >
                <option value="desc">Giảm dần</option>
                <option value="asc">Tăng dần</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>Từ ngày</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>Đến ngày</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#1f2937' }}>Đang tải...</div>
        ) : ordersData ? (
          <>
            <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                  Hiển thị {((ordersData.page - 1) * ordersData.limit) + 1} - {Math.min(ordersData.page * ordersData.limit, ordersData.total)} trong tổng số {ordersData.total} đơn hàng
                </p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e5e5' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: '600', fontSize: '0.875rem' }}>Order ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: '600', fontSize: '0.875rem' }}>Khách hàng</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: '600', fontSize: '0.875rem' }}>Sản phẩm</th>
                      <th style={{ padding: '1rem', textAlign: 'right', color: '#1f2937', fontWeight: '600', fontSize: '0.875rem' }}>Tổng tiền</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#1f2937', fontWeight: '600', fontSize: '0.875rem' }}>Trạng thái</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#1f2937', fontWeight: '600', fontSize: '0.875rem' }}>Thanh toán</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: '600', fontSize: '0.875rem' }}>Ngày tạo</th>
                      <th style={{ padding: '1rem', textAlign: 'right', color: '#1f2937', fontWeight: '600', fontSize: '0.875rem' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersData.orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                          Không tìm thấy đơn hàng nào
                        </td>
                      </tr>
                    ) : (
                      ordersData.orders.map((order) => (
                        <tr key={order._id} style={{ borderBottom: '1px solid #e5e5e5', cursor: 'pointer' }} onClick={() => navigate(`/admin/orders/${order._id}`)}>
                          <td style={{ padding: '1rem', color: '#1f2937', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                            #{order._id.slice(-8).toUpperCase()}
                          </td>
                          <td style={{ padding: '1rem', color: '#1f2937', fontSize: '0.875rem' }}>
                            <div style={{ fontWeight: 600 }}>{order.customer.name}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{order.customer.email}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{order.customer.phone}</div>
                          </td>
                          <td style={{ padding: '1rem', color: '#1f2937', fontSize: '0.875rem' }}>
                            {order.items.length} sản phẩm
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right', color: '#1f2937', fontSize: '0.875rem', fontWeight: 600 }}>
                            {formatPrice(order.totalAmount, order.items[0]?.currency || 'VND')}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span
                              style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: getOrderStatusColor(order.orderStatus),
                                color: '#ffffff',
                                display: 'inline-block'
                              }}
                            >
                              {getOrderStatusText(order.orderStatus)}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span
                              style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: getPaymentStatusColor(order.paymentStatus),
                                color: '#ffffff',
                                display: 'inline-block'
                              }}
                            >
                              {getPaymentStatusText(order.paymentStatus)}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/admin/orders/${order._id}`)}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}
                            >
                              Xem
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {ordersData.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={() => handlePageChange(ordersData.page - 1)}
                  disabled={ordersData.page === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    background: ordersData.page === 1 ? '#e5e5e5' : '#2563eb',
                    color: ordersData.page === 1 ? '#9ca3af' : '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: ordersData.page === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Trước
                </button>

                {Array.from({ length: ordersData.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current
                    return page === 1 || 
                           page === ordersData.totalPages || 
                           (page >= ordersData.page - 1 && page <= ordersData.page + 1);
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const showEllipsisBefore = index > 0 && array[index - 1] < page - 1;
                    return (
                      <span key={page}>
                        {showEllipsisBefore && <span style={{ padding: '0 0.5rem' }}>...</span>}
                        <button
                          onClick={() => handlePageChange(page)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: page === ordersData.page ? '#2563eb' : '#ffffff',
                            color: page === ordersData.page ? '#ffffff' : '#1f2937',
                            border: '1px solid #e5e5e5',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: page === ordersData.page ? 600 : 400
                          }}
                        >
                          {page}
                        </button>
                      </span>
                    );
                  })}

                <button
                  onClick={() => handlePageChange(ordersData.page + 1)}
                  disabled={ordersData.page === ordersData.totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    background: ordersData.page === ordersData.totalPages ? '#e5e5e5' : '#2563eb',
                    color: ordersData.page === ordersData.totalPages ? '#9ca3af' : '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: ordersData.page === ordersData.totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

