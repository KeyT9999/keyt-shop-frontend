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

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'pending': return 'Chờ thanh toán';
      case 'failed': return 'Thanh toán thất bại';
      default: return status;
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
        .status-badge {
            padding: 6px 16px;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            display: inline-block;
        }
        .action-btn {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .action-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .action-btn:active {
            transform: translateY(0);
        }
        .action-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none !important;
        }
        /* Button Variants */
        .btn-confirm { background: #F05A28; color: white; }
        .btn-process { background: #1E293B; color: white; }
        .btn-complete { background: #059669; color: white; }
        .btn-cancel { 
            background: white; 
            color: #EF4444; 
            border: 1px solid #EF4444; 
            box-shadow: none;
        }
        .btn-cancel:hover { background: #FEF2F2; }
      `}</style>
      <div className="main-content print-content" style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Top Bar */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => navigate('/admin/orders')}
              className="no-print"
              style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                padding: '8px 16px',
                borderRadius: '6px',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              ← Quay lại
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
            <div>
              <h1 style={{ color: '#1E293B', margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
                HÓA ĐƠN BÁN HÀNG
              </h1>
              <div style={{ fontSize: '1.25rem', color: '#1E293B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Mã đơn hàng: <span style={{ color: '#F05A28' }}>#{order.orderCode || order._id.slice(-8).toUpperCase()}</span>
              </div>
              <div style={{ color: '#94A3B8', fontSize: '0.875rem', marginTop: '4px', fontFamily: 'monospace' }}>
                ID: {order._id}
              </div>
              <div style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '8px' }}>
                Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>

            <button
              onClick={handlePrintInvoice}
              className="no-print"
              style={{
                padding: '10px 20px',
                background: '#1E293B',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px -1px rgba(30, 41, 59, 0.2)'
              }}
            >
              🖨️ In hóa đơn
            </button>
          </div>

          {/* Status Cards Grid */}
          <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
            {/* Order Status */}
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '12px', fontWeight: 500 }}>Trạng thái đơn hàng</div>
              <span className="status-badge" style={{
                background: order.orderStatus === 'pending' ? '#FFF7ED' : order.orderStatus === 'completed' ? '#ECFDF5' : '#EFF6FF',
                color: order.orderStatus === 'pending' ? '#C2410C' : order.orderStatus === 'completed' ? '#047857' : '#1D4ED8'
              }}>
                {getOrderStatusText(order.orderStatus)}
              </span>
            </div>

            {/* Payment Status */}
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '12px', fontWeight: 500 }}>Trạng thái thanh toán</div>
              <span className="status-badge" style={{
                background: order.paymentStatus === 'paid' ? '#ECFDF5' : '#FFF7ED',
                color: order.paymentStatus === 'paid' ? '#047857' : '#C2410C'
              }}>
                {getPaymentStatusText(order.paymentStatus)}
              </span>
            </div>

            {/* Total Amount */}
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '8px', fontWeight: 500 }}>Tổng tiền</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F05A28', letterSpacing: '-0.025em' }}>
                {formatPrice(order.totalAmount, order.items[0]?.currency || 'VND')}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '70% 30%', gap: '24px' }}>

            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Customer Info */}
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h2 style={{ margin: '0 0 20px 0', color: '#1E293B', fontSize: '1.1rem', fontWeight: 700 }}>Thông tin khách hàng</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#64748B' }}>Tên</div>
                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '1rem' }}>{order.customer.name}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#64748B' }}>Email</div>
                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '1rem' }}>{order.customer.email}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#64748B' }}>Số điện thoại</div>
                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '1rem' }}>{order.customer.phone}</div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h2 style={{ margin: '0 0 20px 0', color: '#1E293B', fontSize: '1.1rem', fontWeight: 700 }}>Sản phẩm</h2>
                <div style={{ borderTop: '1px solid #F1F5F9' }}>
                  {order.items.map((item, index) => (
                    <div key={index} style={{ padding: '20px 0', borderBottom: index < order.items.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem', marginBottom: '4px' }}>{item.name}</div>
                          <div style={{ fontSize: '0.9rem', color: '#64748B' }}>
                            Số lượng: {item.quantity} × {formatPrice(item.price, item.currency)}
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem' }}>
                          {formatPrice(item.price * item.quantity, item.currency)}
                        </div>
                      </div>

                      {/* Additional Fields */}
                      {item.requiredFieldsData && item.requiredFieldsData.length > 0 && (
                        <div style={{
                          background: '#F1F5F9',
                          borderRadius: '8px',
                          padding: '16px',
                          border: '1px solid #E2E8F0'
                        }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                            Thông tin bổ sung:
                          </div>
                          {item.requiredFieldsData.map((fieldData, fieldIndex) => (
                            <div key={fieldIndex} style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 600 }}>{fieldData.label}:</span> {fieldData.value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Actions Card */}
              <div className="no-print" style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h2 style={{ margin: '0 0 20px 0', color: '#1E293B', fontSize: '1.1rem', fontWeight: 700 }}>Thao tác</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {order.orderStatus === 'pending' && (
                    <button
                      onClick={() => handleAction('confirm', 'xác nhận')}
                      disabled={actionLoading !== null}
                      className="action-btn btn-confirm"
                    >
                      {actionLoading === 'confirm' ? 'Đang xử lý...' : '✓ Xác nhận đơn hàng'}
                    </button>
                  )}

                  {order.orderStatus === 'confirmed' && (
                    <button
                      onClick={() => handleAction('processing', 'bắt đầu xử lý')}
                      disabled={actionLoading !== null}
                      className="action-btn btn-process"
                    >
                      {actionLoading === 'processing' ? 'Đang xử lý...' : '⚙️ Bắt đầu xử lý'}
                    </button>
                  )}

                  {order.orderStatus === 'processing' && (
                    <button
                      onClick={() => handleAction('complete', 'hoàn thành')}
                      disabled={actionLoading !== null}
                      className="action-btn btn-complete"
                    >
                      {actionLoading === 'complete' ? 'Đang xử lý...' : '✅ Hoàn thành đơn hàng'}
                    </button>
                  )}

                  {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
                    <button
                      onClick={() => handleAction('cancel', 'hủy')}
                      disabled={actionLoading !== null}
                      className="action-btn btn-cancel"
                    >
                      {actionLoading === 'cancel' ? 'Đang xử lý...' : '✕ Hủy đơn hàng'}
                    </button>
                  )}
                </div>
              </div>

              {/* Internal Note Card */}
              <div className="no-print" style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ margin: 0, color: '#1E293B', fontSize: '1.1rem', fontWeight: 700 }}>Ghi chú nội bộ</h2>
                  {!editingNotes && (
                    <button
                      onClick={() => setEditingNotes(true)}
                      style={{
                        padding: '6px 12px',
                        background: '#1E293B',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      {order.adminNotes ? 'Sửa' : 'Thêm ghi chú'}
                    </button>
                  )}
                </div>

                {editingNotes ? (
                  <div style={{ background: '#FEF9C3', padding: '16px', borderRadius: '12px' }}>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Nhập ghi chú..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #CA8A04',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        background: 'white',
                        marginBottom: '12px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleSaveNotes}
                        disabled={actionLoading === 'notes'}
                        style={{
                          padding: '8px 16px',
                          background: '#CA8A04',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        Lưu lại
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotes(false);
                          setAdminNotes(order.adminNotes || '');
                        }}
                        style={{
                          padding: '8px 16px',
                          background: 'white',
                          color: '#64748B',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '16px',
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderLeft: '4px solid #FACC15',
                    borderRadius: '8px',
                    color: '#334155',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {order.adminNotes ? order.adminNotes : <span style={{ fontStyle: 'italic', opacity: 0.7, fontSize: '0.9rem' }}>Chưa có ghi chú</span>}
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
