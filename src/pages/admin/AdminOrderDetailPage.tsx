import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import type { Order } from '../../types/profile';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuthContext();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id && token && user?.admin) {
      loadOrder();
    }
  }, [id, token, user]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await adminService.getOrderById(id!, token!);
      setOrder(data);
      setAdminNotes(data.adminNotes || '');
    } catch (err: any) {
      console.error('Error loading order:', err);
      alert(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'confirm' | 'processing' | 'complete' | 'cancel', actionName: string) => {
    if (!confirm(`Bạn có chắc muốn ${actionName} đơn hàng này?`)) return;

    try {
      setActionLoading(action);
      let result;
      switch (action) {
        case 'confirm':
          result = await adminService.confirmOrder(id!, token!);
          break;
        case 'processing':
          result = await adminService.startProcessingOrder(id!, token!);
          break;
        case 'complete':
          result = await adminService.completeOrder(id!, token!);
          break;
        case 'cancel':
          result = await adminService.cancelOrder(id!, token!);
          break;
      }
      setOrder(result.order);
      alert(result.message);
    } catch (err: any) {
      alert(err.response?.data?.message || `Không thể ${actionName} đơn hàng`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setActionLoading('notes');
      const result = await adminService.updateOrder(id!, { adminNotes }, token!);
      setOrder(result.order);
      setEditingNotes(false);
      alert('Đã lưu ghi chú thành công');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể lưu ghi chú');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
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
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#1f2937' }}>Đang tải...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#1f2937' }}>
          <h2>Không tìm thấy đơn hàng</h2>
          <button onClick={() => navigate('/admin/orders')} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 2rem;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="main-content print-content">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="no-print"
              style={{
                padding: '0.5rem 1rem',
                background: '#ffffff',
                color: '#374151',
                border: '1px solid #e5e5e5',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}
            >
              ← Quay lại
            </button>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ color: '#1f2937', margin: 0, fontSize: '2rem' }}>HÓA ĐƠN BÁN HÀNG</h1>
              <p style={{ color: '#6b7280', fontSize: '1rem', marginTop: '0.5rem' }}>
                Mã đơn hàng: <strong>#{order._id.slice(-8).toUpperCase()}</strong>
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
          <button
            onClick={handlePrintInvoice}
            className="no-print"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            🖨️ In hóa đơn
          </button>
        </div>

        {/* Status Cards */}
        <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Trạng thái đơn hàng</div>
            <div
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                background: getOrderStatusColor(order.orderStatus),
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'inline-block'
              }}
            >
              {getOrderStatusText(order.orderStatus)}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Trạng thái thanh toán</div>
            <div
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                background: getPaymentStatusColor(order.paymentStatus),
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'inline-block'
              }}
            >
              {getPaymentStatusText(order.paymentStatus)}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Tổng tiền</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
              {formatPrice(order.totalAmount, order.items[0]?.currency || 'VND')}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {(order.confirmedAt || order.processingAt || order.completedAt) && (
          <div className="no-print" style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '1.125rem', fontWeight: 600 }}>Lịch sử đơn hàng</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#059669' }}></div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>Tạo đơn hàng</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>

              {order.confirmedAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#7c3aed' }}></div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1f2937' }}>Đã xác nhận</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {new Date(order.confirmedAt).toLocaleString('vi-VN')}
                      {typeof order.confirmedBy === 'object' && order.confirmedBy && (
                        <span> bởi {order.confirmedBy.username}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {order.processingAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb' }}></div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1f2937' }}>Bắt đầu xử lý</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {new Date(order.processingAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
              )}

              {order.completedAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#059669' }}></div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1f2937' }}>Hoàn thành</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {new Date(order.completedAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Left Column - Customer Info & Items */}
          <div>
            {/* Customer Info */}
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', marginBottom: '1.5rem' }}>
              <h2 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '1.125rem', fontWeight: 600 }}>Thông tin khách hàng</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Tên</div>
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>{order.customer.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Email</div>
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>{order.customer.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Số điện thoại</div>
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>{order.customer.phone}</div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
              <h2 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '1.125rem', fontWeight: 600 }}>Sản phẩm</h2>
              <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem 0',
                      borderBottom: index < order.items.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: item.requiredFieldsData && item.requiredFieldsData.length > 0 ? '0.75rem' : '0' }}>
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
                    {/* Hiển thị requiredFieldsData nếu có */}
                    {item.requiredFieldsData && item.requiredFieldsData.length > 0 && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '6px', borderLeft: '3px solid #2563eb' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.5rem' }}>
                          Thông tin bổ sung:
                        </div>
                        {item.requiredFieldsData.map((fieldData, fieldIndex) => (
                          <div key={fieldIndex} style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
                            <strong>{fieldData.label}:</strong> {fieldData.value}
                          </div>
                        ))}
                      </div>
                    )}
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

          {/* Right Column - Actions & Notes */}
          <div>
            {/* Actions */}
            <div className="no-print" style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', marginBottom: '1.5rem' }}>
              <h2 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '1.125rem', fontWeight: 600 }}>Thao tác</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {order.orderStatus === 'pending' && (
                  <button
                    onClick={() => handleAction('confirm', 'xác nhận')}
                    disabled={actionLoading !== null}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: actionLoading === 'confirm' ? '#9ca3af' : '#7c3aed',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: actionLoading === 'confirm' ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}
                  >
                    {actionLoading === 'confirm' ? 'Đang xử lý...' : '✓ Xác nhận đơn hàng'}
                  </button>
                )}

                {order.orderStatus === 'confirmed' && (
                  <button
                    onClick={() => handleAction('processing', 'bắt đầu xử lý')}
                    disabled={actionLoading !== null}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: actionLoading === 'processing' ? '#9ca3af' : '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: actionLoading === 'processing' ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}
                  >
                    {actionLoading === 'processing' ? 'Đang xử lý...' : '⚙️ Bắt đầu xử lý'}
                  </button>
                )}

                {order.orderStatus === 'processing' && (
                  <button
                    onClick={() => handleAction('complete', 'hoàn thành')}
                    disabled={actionLoading !== null}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: actionLoading === 'complete' ? '#9ca3af' : '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: actionLoading === 'complete' ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}
                  >
                    {actionLoading === 'complete' ? 'Đang xử lý...' : '✅ Hoàn thành đơn hàng'}
                  </button>
                )}

                {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
                  <button
                    onClick={() => handleAction('cancel', 'hủy')}
                    disabled={actionLoading !== null}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: actionLoading === 'cancel' ? '#9ca3af' : '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: actionLoading === 'cancel' ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}
                  >
                    {actionLoading === 'cancel' ? 'Đang xử lý...' : '❌ Hủy đơn hàng'}
                  </button>
                )}
              </div>
            </div>

            {/* Customer Note */}
            {order.note && (
              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5', marginBottom: '1.5rem', pageBreakInside: 'avoid' }}>
                <h2 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '1.125rem', fontWeight: 600 }}>Ghi chú khách hàng</h2>
                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '6px', color: '#374151', whiteSpace: 'pre-line' }}>
                  {order.note}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div className="no-print" style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.125rem', fontWeight: 600 }}>Ghi chú nội bộ</h2>
                {!editingNotes && (
                  <button
                    onClick={() => setEditingNotes(true)}
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
                    {order.adminNotes ? 'Sửa' : 'Thêm ghi chú'}
                  </button>
                )}
              </div>
              {editingNotes ? (
                <div>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Nhập ghi chú nội bộ..."
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button
                      onClick={handleSaveNotes}
                      disabled={actionLoading === 'notes'}
                      style={{
                        padding: '0.5rem 1rem',
                        background: actionLoading === 'notes' ? '#9ca3af' : '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: actionLoading === 'notes' ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {actionLoading === 'notes' ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingNotes(false);
                        setAdminNotes(order.adminNotes || '');
                      }}
                      disabled={actionLoading === 'notes'}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#ffffff',
                        color: '#374151',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        cursor: actionLoading === 'notes' ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '6px', color: '#374151', whiteSpace: 'pre-line', borderLeft: '3px solid #f59e0b', minHeight: '60px' }}>
                  {order.adminNotes || 'Chưa có ghi chú'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

