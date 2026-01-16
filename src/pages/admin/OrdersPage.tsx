import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import type { OrderStats, OrdersListResponse, OrderFilters } from '../../types/admin';
import { formatPrice } from '../../utils/formatPrice';
import { Eye, ArrowLeft, ArrowRight } from 'lucide-react';

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
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <h1 style={{ color: '#1E293B', marginBottom: '24px', fontSize: '1.25rem' }}>Order Management</h1>

        {/* Filters */}
        <div className="table-container" style={{ marginBottom: '24px', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
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
          </div>
        </div>

        {/* Stats Row (Optional, maybe smaller than main dashboard) */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="stats-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Today Orders</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{stats.todayOrders}</div>
            </div>
            <div className="stats-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Pending</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F59E0B' }}>{stats.pendingConfirmation}</div>
            </div>
            <div className="stats-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Revenue (Today)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>{formatPrice(stats.todayRevenue, 'VND')}</div>
            </div>
            <div className="stats-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Revenue (Month)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>{formatPrice(stats.monthRevenue, 'VND')}</div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading orders...</div>
        ) : ordersData ? (
          <div className="table-container">
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.875rem' }}>
              Showing {((ordersData.page - 1) * ordersData.limit) + 1} - {Math.min(ordersData.page * ordersData.limit, ordersData.total)} of {ordersData.total} orders
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Payment</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {ordersData.orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>
                      No orders found
                    </td>
                  </tr>
                ) : (
                  ordersData.orders.map((order) => (
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
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                          className="btn-admin btn-admin-ghost"
                        >
                          <Eye size={16} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination inside container */}
            {ordersData.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '24px', gap: '8px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  onClick={() => handlePageChange(ordersData.page - 1)}
                  disabled={ordersData.page === 1}
                  className="btn-admin btn-admin-ghost"
                  style={{ opacity: ordersData.page === 1 ? 0.5 : 1 }}
                >
                  <ArrowLeft size={16} /> Previous
                </button>
                {/* Simplified pagination for now */}
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px', fontWeight: 600, color: '#64748B' }}>
                  Page {ordersData.page} of {ordersData.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(ordersData.page + 1)}
                  disabled={ordersData.page === ordersData.totalPages}
                  className="btn-admin btn-admin-ghost"
                  style={{ opacity: ordersData.page === ordersData.totalPages ? 0.5 : 1 }}
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
