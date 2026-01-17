import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import type { OrderStats, OrdersListResponse, OrderFilters } from '../../types/admin';
import { formatPrice } from '../../utils/formatPrice';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Download, Filter, TrendingUp } from 'lucide-react';

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

  const handleCancelOrder = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    try {
      await adminService.cancelOrder(orderId, token!);
      alert('Đã hủy đơn hàng thành công');
      loadOrders(); // Reload danh sách
      loadStats(); // Reload stats
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  };

  const handleConfirmOrder = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/orders/${orderId}`);
  };

  const handleExportCSV = () => {
    if (!ordersData || ordersData.orders.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    // Tạo CSV content
    const headers = ['Order ID', 'Order Code', 'Customer Name', 'Customer Email', 'Customer Phone', 'Items Count', 'Total Amount', 'Currency', 'Order Status', 'Payment Status', 'Created At'];
    const rows = ordersData.orders.map(order => [
      order._id,
      order.orderCode || '',
      order.customer.name || '',
      order.customer.email || '',
      order.customer.phone || '',
      order.items.length,
      order.totalAmount,
      order.items[0]?.currency || 'VND',
      order.orderStatus,
      order.paymentStatus,
      new Date(order.createdAt).toLocaleString('vi-VN')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Tạo và download file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getOrderStatusBadge = (status: string) => {
    let className = 'status-badge ';
    let label = status;

    switch (status) {
      case 'completed':
        className += 'status-badge-success';
        label = 'Completed';
        break;
      case 'processing':
        className += 'status-badge-warning'; // or Info
        label = 'Processing';
        break;
      case 'confirmed':
        className += 'status-badge-warning';
        label = 'Confirmed';
        break;
      case 'pending':
        className += 'status-badge-warning';
        label = 'Pending';
        break;
      case 'cancelled':
        className += 'status-badge-danger';
        label = 'Cancelled';
        break;
      default:
        className += 'status-badge-neutral';
    }
    return <span className={className}>{label}</span>;
  };

  const getPaymentStatusBadge = (status: string) => {
    let className = 'status-badge ';
    let label = status;

    switch (status) {
      case 'paid':
        className += 'status-badge-success';
        label = 'Paid';
        break;
      case 'pending':
        className += 'status-badge-warning';
        label = 'Unpaid';
        break;
      case 'failed':
        className += 'status-badge-danger';
        label = 'Failed';
        break;
      default:
        className += 'status-badge-neutral';
    }
    return <span className={className}>{label}</span>;
  };

  if (!user?.admin) {
    return (
      <div className="p-8 text-center text-red-500">403 - Access Denied</div>
    );
  }

  return (
    <div className="admin-page-content">
      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 16px' }}>
        {/* Filters */}
        <div className="table-container" style={{ marginBottom: '24px', padding: '16px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
            gap: '12px', 
            marginBottom: '16px' 
          }}>
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>Search</label>
              <input
                type="text"
                placeholder="Order ID, Name, Email..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>Order Status</label>
              <select
                value={filters.orderStatus || ''}
                onChange={(e) => handleFilterChange('orderStatus', e.target.value || undefined)}
                className="admin-input"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>Payment Status</label>
              <select
                value={filters.paymentStatus || ''}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value || undefined)}
                className="admin-input"
              >
                <option value="">All Payments</option>
                <option value="pending">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>Sort By</label>
              <select
                value={filters.sortBy || 'date'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="admin-input"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>Từ ngày</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                className="admin-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>Đến ngày</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                className="admin-input"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {(filters.startDate || filters.endDate || filters.orderStatus || filters.paymentStatus || filters.search) && (
              <button
                onClick={() => setFilters({ page: 1, limit: 20, sortBy: 'date', sortOrder: 'desc' })}
                className="btn-admin btn-admin-ghost"
                style={{ fontSize: '0.875rem', padding: '8px 16px' }}
              >
                <Filter size={14} style={{ marginRight: '4px' }} /> Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Revenue Stats Section */}
        {stats && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <TrendingUp size={20} /> Doanh thu thành công
              </h2>
              <button
                onClick={handleExportCSV}
                className="btn-admin btn-admin-ghost"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  alignSelf: 'flex-start',
                  fontSize: '0.875rem',
                  padding: '8px 16px'
                }}
              >
                <Download size={16} /> Xuất CSV
              </button>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
              gap: '12px' 
            }}>
              <div className="stats-card" style={{ padding: '16px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.9, textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Hôm nay</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, wordBreak: 'break-word' }}>{formatPrice(stats.todayRevenue, 'VND')}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>{stats.todayOrders} đơn hàng</div>
              </div>
              <div className="stats-card" style={{ padding: '16px', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: 'white' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.9, textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Tuần này</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, wordBreak: 'break-word' }}>{formatPrice(stats.weekRevenue || 0, 'VND')}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>7 ngày qua</div>
              </div>
              <div className="stats-card" style={{ padding: '16px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: 'white' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.9, textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Tháng này</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, wordBreak: 'break-word' }}>{formatPrice(stats.monthRevenue, 'VND')}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>Tháng {new Date().getMonth() + 1}</div>
              </div>
              <div className="stats-card" style={{ padding: '16px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: 'white' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.9, textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Năm này</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, wordBreak: 'break-word' }}>{formatPrice(stats.yearRevenue || 0, 'VND')}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>Năm {new Date().getFullYear()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Row */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <div className="stats-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Today Orders</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{stats.todayOrders}</div>
            </div>
            <div className="stats-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Pending</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F59E0B' }}>{stats.pendingConfirmation}</div>
            </div>
            <div className="stats-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Processing</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3B82F6' }}>{stats.processing}</div>
            </div>
          </div>
        )}

        {/* Orders Table/List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading orders...</div>
        ) : ordersData ? (
          <>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.8rem', marginBottom: '16px' }}>
              Showing {((ordersData.page - 1) * ordersData.limit) + 1} - {Math.min(ordersData.page * ordersData.limit, ordersData.total)} of {ordersData.total} orders
            </div>

            {ordersData.orders.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>No orders found</div>
            ) : (
              <>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="table-container" style={{ overflowX: 'auto', display: 'none' }} id="desktop-table">
                  <table className="admin-table" style={{ minWidth: '800px', width: '100%' }}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Payment</th>
                  <th>Date</th>
                        <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                      {ordersData.orders.map((order) => (
                    <tr key={order._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/orders/${order._id}`)}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1E293B' }}>#{order.orderCode || order._id.slice(-8).toUpperCase()}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.customer.name}</div>
                        <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{order.customer.email}</div>
                      </td>
                      <td>
                        {order.items.length} items
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatPrice(order.totalAmount, order.items[0]?.currency || 'VND')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {getOrderStatusBadge(order.orderStatus)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </td>
                      <td style={{ color: '#64748B' }}>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                          <td style={{ textAlign: 'center', minWidth: '140px' }} onClick={(e) => e.stopPropagation()}>
                            {order.orderStatus !== 'cancelled' && order.orderStatus !== 'completed' ? (
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button
                                  onClick={(e) => handleConfirmOrder(order._id, e)}
                                  className="btn-admin btn-admin-primary"
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '4px',
                                    backgroundColor: '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <CheckCircle2 size={14} /> Xác nhận
                                </button>
                        <button
                                  onClick={(e) => handleCancelOrder(order._id, e)}
                                  className="btn-admin btn-admin-danger"
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '4px',
                                    backgroundColor: '#EF4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                        >
                                  <XCircle size={14} /> Hủy
                        </button>
                              </div>
                            ) : (
                              <span style={{ color: '#94A3B8', fontSize: '0.875rem' }}>-</span>
                            )}
                      </td>
                    </tr>
                      ))}
              </tbody>
            </table>
                </div>

                {/* Mobile Card View - Hidden on desktop */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} id="mobile-cards">
                  {ordersData.orders.map((order) => (
                    <div
                      key={order._id}
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Header Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem', marginBottom: '4px' }}>
                            #{order.orderCode || order._id.slice(-8).toUpperCase()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                          {getOrderStatusBadge(order.orderStatus)}
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
                        <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.95rem', marginBottom: '4px' }}>
                          {order.customer.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                          {order.customer.email}
                        </div>
                        {order.customer.phone && (
                          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                            {order.customer.phone}
                          </div>
                        )}
                      </div>

                      {/* Order Details */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748B' }}>
                          {order.items.length} sản phẩm
                        </div>
                        <div style={{ fontWeight: 700, color: '#F05A28', fontSize: '1.1rem' }}>
                          {formatPrice(order.totalAmount, order.items[0]?.currency || 'VND')}
                        </div>
                      </div>

                      {/* Actions */}
                      {order.orderStatus !== 'cancelled' && order.orderStatus !== 'completed' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleConfirmOrder(order._id, e)}
                            style={{ 
                              flex: 1,
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              gap: '6px',
                              backgroundColor: '#10B981',
                              color: 'white',
                              border: 'none',
                              padding: '10px 16px',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            <CheckCircle2 size={16} /> Xác nhận
                          </button>
                          <button
                            onClick={(e) => handleCancelOrder(order._id, e)}
                            style={{ 
                              flex: 1,
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              gap: '6px',
                              backgroundColor: '#EF4444',
                              color: 'white',
                              border: 'none',
                              padding: '10px 16px',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            <XCircle size={16} /> Hủy
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {ordersData && ordersData.totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                padding: '16px', 
                gap: '8px', 
                borderTop: '1px solid #E2E8F0',
                flexWrap: 'wrap',
                marginTop: '16px'
              }}>
                <button
                  onClick={() => handlePageChange(ordersData.page - 1)}
                  disabled={ordersData.page === 1}
                  className="btn-admin btn-admin-ghost"
                  style={{ 
                    opacity: ordersData.page === 1 ? 0.5 : 1,
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ArrowLeft size={14} /> Previous
                </button>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '0 12px', 
                  fontWeight: 600, 
                  color: '#64748B',
                  fontSize: '0.875rem'
                }}>
                  Page {ordersData.page} of {ordersData.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(ordersData.page + 1)}
                  disabled={ordersData.page === ordersData.totalPages}
                  className="btn-admin btn-admin-ghost"
                  style={{ 
                    opacity: ordersData.page === ordersData.totalPages ? 0.5 : 1,
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Next <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* CSS for responsive */}
            <style>{`
              @media (min-width: 768px) {
                #desktop-table {
                  display: block !important;
                }
                #mobile-cards {
                  display: none !important;
                }
              }
              @media (max-width: 767px) {
                #desktop-table {
                  display: none !important;
                }
                #mobile-cards {
                  display: flex !important;
                }
              }
            `}</style>
          </>
        ) : null}
      </div>
    </div>
  );
}
