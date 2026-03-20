import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, RefreshCw, XCircle } from 'lucide-react';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import type { AdminNetflixReplacementTicket, AdminNetflixReplacementTicketsResponse } from '../../types/admin';
import { formatPrice } from '../../utils/formatPrice';

type TicketStatusFilter = 'pending' | 'approved' | 'rejected';

function formatDate(value?: string | null): string {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('vi-VN');
}

function maskLogId(logId?: string): string {
  if (!logId) return '--';
  if (logId.length <= 14) return logId;
  return `${logId.slice(0, 8)}...${logId.slice(-6)}`;
}

function getStatusBadge(status: AdminNetflixReplacementTicket['status']) {
  switch (status) {
    case 'approved':
      return { label: 'Đã duyệt', background: '#DCFCE7', color: '#166534' };
    case 'rejected':
      return { label: 'Đã từ chối', background: '#FEE2E2', color: '#991B1B' };
    case 'pending':
    default:
      return { label: 'Chờ duyệt', background: '#FEF3C7', color: '#92400E' };
  }
}

export default function NetflixReplacementTicketsPage() {
  const { token, user } = useAuthContext();
  const navigate = useNavigate();
  const [status, setStatus] = useState<TicketStatusFilter>('pending');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminNetflixReplacementTicketsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionTicketId, setActionTicketId] = useState<string | null>(null);
  const [draftReasons, setDraftReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token && user?.admin) {
      void loadTickets();
    }
  }, [token, user, status, page]);

  const loadTickets = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await adminService.getNetflixReplacementTickets(
        { status, page, limit: 10 },
        token!
      );
      setData(response);
    } catch (err: any) {
      console.error('Error loading Netflix replacement tickets:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ticket: AdminNetflixReplacementTicket) => {
    if (!token) return;
    const reason = draftReasons[ticket._id]?.trim() || '';
    try {
      setActionTicketId(ticket._id);
      const response = await adminService.approveNetflixReplacementTicket(ticket._id, reason, token);
      alert(response.message);
      setDraftReasons((prev) => ({ ...prev, [ticket._id]: '' }));
      await loadTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể duyệt ticket.');
    } finally {
      setActionTicketId(null);
    }
  };

  const handleReject = async (ticket: AdminNetflixReplacementTicket) => {
    if (!token) return;
    const reason = draftReasons[ticket._id]?.trim() || '';
    if (!reason) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }
    try {
      setActionTicketId(ticket._id);
      const response = await adminService.rejectNetflixReplacementTicket(ticket._id, reason, token);
      alert(response.message);
      setDraftReasons((prev) => ({ ...prev, [ticket._id]: '' }));
      await loadTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể từ chối ticket.');
    } finally {
      setActionTicketId(null);
    }
  };

  const counts = useMemo(
    () =>
      data?.counts || {
        pending: 0,
        approved: 0,
        rejected: 0
      },
    [data]
  );

  if (!user?.admin) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#1f2937' }}>
          <h1>403 - Không có quyền truy cập</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ background: '#F8FAFC', minHeight: '100vh', padding: '20px 16px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fff',
                border: '1px solid #E2E8F0',
                color: '#475569',
                borderRadius: '8px',
                padding: '8px 14px',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              <ArrowLeft size={16} />
              Quay lại admin
            </button>
            <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#0F172A' }}>Duyệt ticket đổi cookie Netflix</h1>
            <p style={{ margin: '8px 0 0', color: '#64748B' }}>
              Theo dõi lỗi khách báo, xem bằng chứng và duyệt hoặc từ chối ngay trên từng ticket.
            </p>
          </div>

          <button
            onClick={() => void loadTickets()}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#1D4ED8',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              cursor: loading ? 'wait' : 'pointer',
              fontWeight: 600
            }}
          >
            <RefreshCw size={16} />
            Tải lại
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {([
            ['pending', 'Chờ duyệt', counts.pending, '#F59E0B'],
            ['approved', 'Đã duyệt', counts.approved, '#16A34A'],
            ['rejected', 'Đã từ chối', counts.rejected, '#DC2626']
          ] as const).map(([key, label, value, color]) => (
            <button
              key={key}
              onClick={() => {
                setStatus(key);
                setPage(1);
              }}
              style={{
                textAlign: 'left',
                padding: '16px',
                borderRadius: '12px',
                border: status === key ? `2px solid ${color}` : '1px solid #E2E8F0',
                background: '#fff',
                cursor: 'pointer',
                boxShadow: status === key ? '0 10px 30px rgba(15, 23, 42, 0.08)' : 'none'
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>
                {label}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color }}>{value}</div>
            </button>
          ))}
        </div>

        {error ? (
          <div style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            {error}
          </div>
        ) : null}

        {loading && !data ? (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '48px', textAlign: 'center', color: '#64748B' }}>
            Đang tải danh sách ticket...
          </div>
        ) : null}

        {!loading && data && data.tickets.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '48px', textAlign: 'center', color: '#64748B' }}>
            Không có ticket nào trong trạng thái này.
          </div>
        ) : null}

        {data?.tickets.map((ticket) => {
          const badge = getStatusBadge(ticket.status);
          const draftReason = draftReasons[ticket._id] ?? ticket.decisionReason ?? '';
          const itemName = ticket.item?.name || `Item #${ticket.itemIndex + 1}`;
          const customer = ticket.order.customer;
          const isActing = actionTicketId === ticket._id;

          return (
            <div
              key={ticket._id}
              style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
                padding: '18px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: '1.05rem', color: '#0F172A' }}>
                      Đơn #{ticket.order.orderCode || ticket.order._id?.slice(-6)} • {itemName} • Slot {ticket.slotIndex + 1}
                    </h2>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: badge.background,
                        color: badge.color,
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div style={{ marginTop: '8px', color: '#64748B', fontSize: '0.9rem' }}>
                    Tạo lúc {formatDate(ticket.createdAt)} • Người gửi: {ticket.requester?.username || customer?.name || '--'} ({ticket.requester?.email || customer?.email || '--'})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Link
                    to={`/admin/orders/${ticket.order._id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 14px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      fontWeight: 600
                    }}
                  >
                    <ExternalLink size={16} />
                    Xem đơn hàng
                  </Link>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Khách hàng</div>
                  <div style={{ color: '#0F172A', fontWeight: 700 }}>{customer?.name || '--'}</div>
                  <div style={{ color: '#475569', fontSize: '0.92rem', marginTop: '4px' }}>{customer?.email || '--'}</div>
                  <div style={{ color: '#475569', fontSize: '0.92rem', marginTop: '4px' }}>{customer?.phone || '--'}</div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Thông tin đơn</div>
                  <div style={{ color: '#0F172A', fontWeight: 700 }}>{formatPrice(ticket.order.totalAmount || 0, 'VND')}</div>
                  <div style={{ color: '#475569', fontSize: '0.92rem', marginTop: '4px' }}>
                    Trạng thái đơn: {ticket.order.orderStatus || '--'} • Thanh toán: {ticket.order.paymentStatus || '--'}
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.92rem', marginTop: '4px' }}>
                    Số lượng: {ticket.item?.quantity || '--'} • Giá: {formatPrice(ticket.item?.price || 0, ticket.item?.currency || 'VND')}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Slot Netflix</div>
                  <div style={{ color: '#0F172A', fontWeight: 700 }}>LOG ID: {maskLogId(ticket.slot?.logId)}</div>
                  <div style={{ color: '#475569', fontSize: '0.92rem', marginTop: '4px' }}>
                    Tình trạng: {ticket.slot?.provisionStatus || '--'} • Cookie #{ticket.slot?.cookieNumber ?? '--'}
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.92rem', marginTop: '4px' }}>
                    Fallback đã dùng: {ticket.slot?.regenFallbackCount ?? 0}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                  Bằng chứng khách gửi
                </div>
                <div style={{ background: '#0F172A', color: '#E2E8F0', borderRadius: '12px', padding: '14px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {ticket.evidence || 'Khách chưa ghi thêm mô tả.'}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                  Lý do xử lý của admin
                </div>
                <textarea
                  value={draftReason}
                  onChange={(event) =>
                    setDraftReasons((prev) => ({
                      ...prev,
                      [ticket._id]: event.target.value
                    }))
                  }
                  rows={3}
                  disabled={ticket.status !== 'pending'}
                  placeholder={ticket.status === 'pending' ? 'Nhập ghi chú khi duyệt hoặc lý do từ chối...' : 'Ticket đã xử lý'}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    padding: '12px',
                    fontSize: '0.95rem',
                    resize: 'vertical',
                    background: ticket.status === 'pending' ? '#fff' : '#F8FAFC',
                    color: '#0F172A'
                  }}
                />
              </div>

              {ticket.decisionReason && ticket.status !== 'pending' ? (
                <div style={{ marginBottom: '12px', padding: '12px 14px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569' }}>
                  Lý do đã lưu: <strong style={{ color: '#0F172A' }}>{ticket.decisionReason}</strong>
                  {ticket.handledBy ? ` • Xử lý bởi ${ticket.handledBy.username}` : ''}
                  {ticket.approvedAt || ticket.rejectedAt ? ` • ${formatDate(ticket.approvedAt || ticket.rejectedAt)}` : ''}
                </div>
              ) : null}

              {ticket.status === 'pending' ? (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => void handleApprove(ticket)}
                    disabled={isActing}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#16A34A',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: isActing ? 'wait' : 'pointer'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    {isActing ? 'Đang xử lý...' : 'Duyệt ticket'}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleReject(ticket)}
                    disabled={isActing}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#DC2626',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: isActing ? 'wait' : 'pointer'
                    }}
                  >
                    <XCircle size={16} />
                    {isActing ? 'Đang xử lý...' : 'Từ chối ticket'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.92rem' }}>
                  <AlertTriangle size={16} />
                  Ticket này đã được xử lý, user sẽ thấy trạng thái tương ứng ở trang đơn hàng.
                </div>
              )}
            </div>
          );
        })}

        {data && data.totalPages > 1 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '24px' }}>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                background: '#fff',
                cursor: page <= 1 || loading ? 'not-allowed' : 'pointer'
              }}
            >
              <ArrowLeft size={16} />
              Trước
            </button>
            <div style={{ color: '#475569', fontWeight: 600 }}>
              Trang {data.page} / {data.totalPages}
            </div>
            <button
              type="button"
              disabled={page >= data.totalPages || loading}
              onClick={() => setPage((prev) => Math.min(data.totalPages, prev + 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                background: '#fff',
                cursor: page >= data.totalPages || loading ? 'not-allowed' : 'pointer'
              }}
            >
              Sau
              <ArrowRight size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
